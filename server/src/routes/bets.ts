import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import { validateBetNumber } from '../services/matkaUtils';

const router = Router();

interface BetItem {
  number: string;
  amount: number;
}

// Place Bets (Single or Multiple items)
router.post('/place', authenticateUser, async (req: AuthRequest, res: Response) => {
  const { marketId, gameType, session, bets } = req.body;
  const userId = req.user!.id;

  if (!marketId || !gameType || !session || !bets || !Array.isArray(bets) || bets.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid bet request. Please check all fields.' });
  }

  // 1. Check Market and session validity
  const market = await db.queryOne('SELECT * FROM markets WHERE id = ? AND is_active = 1', [marketId]);
  if (!market) {
    return res.status(404).json({ success: false, message: 'Selected market is not available.' });
  }

  const today = new Date().toISOString().split('T')[0];
  const marketResult = await db.queryOne('SELECT status FROM market_results WHERE market_id = ? AND date = ?', [marketId, today]);
  if (marketResult && marketResult.status === 'CLOSED') {
    return res.status(400).json({ success: false, message: 'Market is closed for today. Bidding is not allowed.' });
  }

  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const DISAWAR_NAMES = ['DESAWAR', 'DELHI BAZAR', 'SHREE GANESH', 'FARIDABAD', 'GAZIABAD', 'GALI'];
  const isDisawar = DISAWAR_NAMES.some(n => market.name.toUpperCase().includes(n));

  if (isDisawar) {
    if (currentTime >= market.close_time_24) {
      return res.status(400).json({ success: false, message: 'Bidding time has ended for this Disawar market.' });
    }
  } else {
    if (session === 'OPEN' && currentTime >= market.open_time_24) {
      return res.status(400).json({ success: false, message: 'Open session bidding time has ended for this market.' });
    }
    if (session === 'CLOSE' && currentTime >= market.close_time_24) {
      return res.status(400).json({ success: false, message: 'Close session bidding time has ended for this market.' });
    }
  }

  // 2. Check Game Type & Rate
  const game = await db.queryOne('SELECT * FROM game_types WHERE id = ?', [gameType]);
  if (!game) {
    return res.status(400).json({ success: false, message: 'Invalid game type.' });
  }

  // 3. Validate bet items and calculate total amount
  let totalAmount = 0;
  const validatedBets: BetItem[] = [];

  for (const item of bets) {
    const num = item.number ? item.number.toString().trim() : '';
    const amt = parseFloat(item.amount);

    if (isNaN(amt) || amt < Number(game.min_bet)) {
      return res.status(400).json({
        success: false,
        message: `Minimum bet amount for ${game.name} is ₹${game.min_bet}.`
      });
    }

    if (amt > Number(game.max_bet)) {
      return res.status(400).json({
        success: false,
        message: `Maximum bet amount for ${game.name} is ₹${game.max_bet}.`
      });
    }

    const validation = validateBetNumber(gameType, num);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    totalAmount += amt;
    validatedBets.push({ number: num, amount: amt });
  }

  try {
    const user = await db.queryOne('SELECT wallet_balance FROM users WHERE id = ?', [userId]);
    const currentBalance = user ? Number(user.wallet_balance) : 0;
    if (currentBalance < totalAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. You need ₹${totalAmount}, but have ₹${currentBalance}. Please add funds.`
      });
    }

    const prevBalance = currentBalance;
    const newBalance = Math.round((prevBalance - totalAmount) * 100) / 100;

    // Deduct user balance
    await db.execute('UPDATE users SET wallet_balance = ? WHERE id = ?', [newBalance, userId]);

    // Insert each bet
    const placedTickets: string[] = [];
    const dateCode = today.replace(/-/g, '');

    for (const b of validatedBets) {
      const ticketId = `BET-${dateCode}-${Math.floor(100000 + Math.random() * 900000)}`;
      const potentialWin = Math.round(b.amount * Number(game.payout_rate) * 100) / 100;

      await db.execute(`
        INSERT INTO bets (
          ticket_id, user_id, market_id, game_type, session, bet_number,
          amount, payout_rate, potential_win, status, bet_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
      `, [ticketId, userId, marketId, gameType, session, b.number, b.amount, Number(game.payout_rate), potentialWin, today]);

      placedTickets.push(ticketId);
    }

    // Insert financial ledger transaction
    await db.execute(`
      INSERT INTO transactions (user_id, type, amount, previous_balance, new_balance, reference_id, description)
      VALUES (?, 'BET_PLACED', ?, ?, ?, ?, ?)
    `, [
      userId,
      -totalAmount,
      prevBalance,
      newBalance,
      placedTickets.join(','),
      `Placed ${validatedBets.length} bet(s) on ${market.name} [${game.name}]`
    ]);

    return res.json({
      success: true,
      message: `Bet placed successfully! ₹${totalAmount} deducted.`,
      totalAmount,
      newBalance,
      ticketCount: placedTickets.length,
      firstTicket: placedTickets[0]
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message || 'Failed to place bet.' });
  }
});

// My Bids / Bet History
router.get('/history', authenticateUser, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const status = req.query.status as string;
  const date = req.query.date as string;

  let query = `
    SELECT b.*, m.name as market_name, gt.name as game_type_name
    FROM bets b
    JOIN markets m ON b.market_id = m.id
    JOIN game_types gt ON b.game_type = gt.id
    WHERE b.user_id = ?
  `;
  const params: any[] = [userId];

  if (status && ['PENDING', 'WON', 'LOST'].includes(status.toUpperCase())) {
    query += ` AND b.status = ?`;
    params.push(status.toUpperCase());
  }

  if (date) {
    query += ` AND b.bet_date = ?`;
    params.push(date);
  }

  query += ` ORDER BY b.created_at DESC LIMIT 100`;

  const bets = await db.queryAll(query, params);
  return res.json({ success: true, bets });
});

// Winning History only
router.get('/winnings', authenticateUser, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const winnings = await db.queryAll(`
    SELECT b.*, m.name as market_name, gt.name as game_type_name
    FROM bets b
    JOIN markets m ON b.market_id = m.id
    JOIN game_types gt ON b.game_type = gt.id
    WHERE b.user_id = ? AND b.status = 'WON'
    ORDER BY b.created_at DESC LIMIT 50
  `, [userId]);

  return res.json({ success: true, winnings });
});

export default router;
