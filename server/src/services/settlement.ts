import db from '../db/database';
import { calculateAnkFromPanna, formatMatkaResult } from './matkaUtils';

interface SettleResultParams {
  marketId: number;
  date: string;
  openPanna?: string | null;
  openDigit?: string | null;
  closeDigit?: string | null;
  closePanna?: string | null;
  jodi?: string | null;
  adminId?: number;
  isManualOverride?: boolean;
  isOpenOnly?: boolean;
}

export async function settleMarketResults(params: SettleResultParams) {
  const { marketId, date, adminId, isManualOverride, isOpenOnly } = params;
  let { openPanna, openDigit, closeDigit, closePanna, jodi } = params;

  // Derive Single Digits from Pannas if provided and not explicitly set
  if (openPanna && (!openDigit || openDigit === '')) {
    openDigit = calculateAnkFromPanna(openPanna);
  }
  if (closePanna && (!closeDigit || closeDigit === '')) {
    closeDigit = calculateAnkFromPanna(closePanna);
  }

  // If Jodi is directly provided (e.g. Satta King / Disawar games like "45")
  if (jodi && jodi.length === 2) {
    if (!openDigit) openDigit = jodi[0];
    if (!closeDigit) closeDigit = jodi[1];
  } else if (openDigit && closeDigit) {
    jodi = `${openDigit}${closeDigit}`;
  }

  const isFullResult = !isOpenOnly && Boolean((openPanna && openDigit && closeDigit && closePanna) || (openDigit && closeDigit && jodi));
  const status = isFullResult ? 'CLOSED' : 'OPEN';
  const manualFlag = (isManualOverride === true || adminId !== undefined) ? 1 : 0;

  try {
    // 1. Upsert Market Result
    const existingResult = await db.queryOne('SELECT id, is_manual_override FROM market_results WHERE market_id = ? AND date = ?', [marketId, date]);

    if (existingResult) {
      const finalManual = isManualOverride !== undefined ? (isManualOverride ? 1 : 0) : (existingResult.is_manual_override || manualFlag);
      if (isOpenOnly) {
        await db.execute(`
          UPDATE market_results
          SET open_panna = ?,
              open_digit = ?,
              close_digit = NULL,
              close_panna = NULL,
              jodi = NULL,
              status = 'OPEN',
              is_manual_override = ?,
              declared_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [openPanna || null, openDigit || null, finalManual, existingResult.id]);
      } else {
        await db.execute(`
          UPDATE market_results
          SET open_panna = ?,
              open_digit = ?,
              close_digit = ?,
              close_panna = ?,
              jodi = ?,
              status = ?,
              is_manual_override = ?,
              declared_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [openPanna || null, openDigit || null, closeDigit || null, closePanna || null, jodi || null, status, finalManual, existingResult.id]);
      }
    } else {
      await db.execute(`
        INSERT INTO market_results (market_id, date, open_panna, open_digit, close_digit, close_panna, jodi, status, is_manual_override, declared_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [marketId, date, openPanna || null, openDigit || null, isOpenOnly ? null : (closeDigit || null), isOpenOnly ? null : (closePanna || null), isOpenOnly ? null : (jodi || null), status, manualFlag]);
    }

    // Get market name
    const market = await db.queryOne('SELECT name FROM markets WHERE id = ?', [marketId]);
    const marketName = market ? market.name : 'MARKET';

    // 2. Fetch all PENDING bets for this market and date
    const pendingBets = await db.queryAll(`
      SELECT b.*, u.name as user_name, u.wallet_balance
      FROM bets b
      JOIN users u ON b.user_id = u.id
      WHERE b.market_id = ? AND b.bet_date = ? AND b.status = 'PENDING'
    `, [marketId, date]);

    let totalSettled = 0;
    let totalWinners = 0;
    let totalPayout = 0;

    for (const bet of pendingBets) {
      let isWinner = false;
      let canSettleNow = false;

      // Evaluation Logic based on game type and session
      switch (bet.game_type) {
        case 'single_digit':
          if (bet.session === 'OPEN' && openDigit) {
            canSettleNow = true;
            isWinner = (bet.bet_number === openDigit);
          } else if (bet.session === 'CLOSE' && closeDigit) {
            canSettleNow = true;
            isWinner = (bet.bet_number === closeDigit);
          }
          break;

        case 'jodi_digit':
          if (openDigit && closeDigit) {
            canSettleNow = true;
            isWinner = (bet.bet_number === `${openDigit}${closeDigit}`);
          }
          break;

        case 'single_panna':
        case 'double_panna':
        case 'triple_panna':
        case 'sp_motor':
        case 'dp_motor':
          if (bet.session === 'OPEN' && openPanna) {
            canSettleNow = true;
            isWinner = (bet.bet_number === openPanna);
          } else if (bet.session === 'CLOSE' && closePanna) {
            canSettleNow = true;
            isWinner = (bet.bet_number === closePanna);
          }
          break;

        case 'half_sangam':
          if (openPanna && closeDigit && closePanna && openDigit) {
            canSettleNow = true;
            const targetA = `${openPanna}/${closeDigit}`;
            const targetB = `${openDigit}/${closePanna}`;
            isWinner = (bet.bet_number === targetA || bet.bet_number === targetB);
          }
          break;

        case 'full_sangam':
          if (openPanna && closePanna) {
            canSettleNow = true;
            const target = `${openPanna}/${closePanna}`;
            isWinner = (bet.bet_number === target);
          }
          break;
      }

      if (canSettleNow) {
        totalSettled++;
        if (isWinner) {
          totalWinners++;
          const winAmount = Math.round(Number(bet.amount) * Number(bet.payout_rate) * 100) / 100;
          totalPayout += winAmount;

          await db.execute(`
            UPDATE bets
            SET status = 'WON', won_amount = ?
            WHERE id = ?
          `, [winAmount, bet.id]);

          // Get fresh user balance
          const user = await db.queryOne('SELECT wallet_balance FROM users WHERE id = ?', [bet.user_id]);
          const prevBalance = user ? Number(user.wallet_balance) : 0;
          const newBalance = Math.round((prevBalance + winAmount) * 100) / 100;

          await db.execute(`
            UPDATE users
            SET wallet_balance = wallet_balance + ?
            WHERE id = ?
          `, [winAmount, bet.user_id]);

          await db.execute(`
            INSERT INTO transactions (user_id, type, amount, previous_balance, new_balance, reference_id, description)
            VALUES (?, 'WIN_PAYOUT', ?, ?, ?, ?, ?)
          `, [
            bet.user_id,
            winAmount,
            prevBalance,
            newBalance,
            bet.ticket_id,
            `Win payout for ${marketName} [${bet.game_type.toUpperCase()} #${bet.bet_number}]`
          ]);

          // Anonymize user display name for live ticker (e.g. "Rahul S.")
          const nameParts = (bet.user_name || 'Player').split(' ');
          const displayName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1][0]}.` : nameParts[0];

          await db.execute(`
            INSERT INTO recent_winners (user_display_name, game_type_name, market_name, amount)
            VALUES (?, ?, ?, ?)
          `, [displayName, `${bet.game_type.replace('_', ' ')} Win`, marketName, winAmount]);
        } else {
          await db.execute(`
            UPDATE bets
            SET status = 'LOST', won_amount = 0
            WHERE id = ?
          `, [bet.id]);
        }
      }
    }

    // 3. Log admin audit record
    if (adminId) {
      await db.execute(`
        INSERT INTO admin_audit_logs (admin_id, action, details)
        VALUES (?, 'DECLARE_RESULT', ?)
      `, [
        adminId,
        `Declared result for ${marketName} on ${date}: Open=${openPanna || '-'}, Close=${closePanna || '-'}. Settled ${totalSettled} bets, ${totalWinners} winners, Total Payout: ₹${totalPayout}`
      ]);
    }

    return {
      success: true,
      totalSettled,
      totalWinners,
      totalPayout,
      marketName,
      status
    };
  } catch (err: any) {
    console.error('Error in settleMarketResults:', err);
    throw err;
  }
}

// Rollback / Revise results in case admin made a mistake
export async function rollbackMarketResults(marketId: number, date: string, adminId?: number) {
  try {
    const wonBets = await db.queryAll(`
      SELECT b.*, u.wallet_balance
      FROM bets b
      JOIN users u ON b.user_id = u.id
      WHERE b.market_id = ? AND b.bet_date = ? AND b.status = 'WON'
    `, [marketId, date]);

    let reversedAmount = 0;

    for (const bet of wonBets) {
      await db.execute(`UPDATE bets SET status = 'PENDING', won_amount = 0 WHERE id = ?`, [bet.id]);
      const prevBal = Number(bet.wallet_balance);
      const wonAmt = Number(bet.won_amount);
      const newBal = Math.max(0, Math.round((prevBal - wonAmt) * 100) / 100);
      await db.execute(`UPDATE users SET wallet_balance = ? WHERE id = ?`, [newBal, bet.user_id]);
      await db.execute(`
        INSERT INTO transactions (user_id, type, amount, previous_balance, new_balance, reference_id, description)
        VALUES (?, 'ADMIN_ADJUST', ?, ?, ?, ?, ?)
      `, [
        bet.user_id,
        -wonAmt,
        prevBal,
        newBal,
        `REV-${bet.ticket_id}`,
        `Reversal of incorrect win payout for ticket ${bet.ticket_id}`
      ]);
      reversedAmount += wonAmt;
    }

    // Reset lost bets back to pending as well
    await db.execute(`
      UPDATE bets SET status = 'PENDING'
      WHERE market_id = ? AND bet_date = ? AND status = 'LOST'
    `, [marketId, date]);

    // Reset market result
    await db.execute(`
      UPDATE market_results
      SET open_panna = NULL, open_digit = NULL, close_digit = NULL, close_panna = NULL, jodi = NULL, status = 'OPEN'
      WHERE market_id = ? AND date = ?
    `, [marketId, date]);

    if (adminId) {
      await db.execute(`
        INSERT INTO admin_audit_logs (admin_id, action, details)
        VALUES (?, 'ROLLBACK_RESULT', ?)
      `, [adminId, `Rolled back result for market ID ${marketId} on ${date}. Reversed payouts of ₹${reversedAmount}`]);
    }

    return { success: true, reversedBetsCount: wonBets.length, reversedAmount };
  } catch (err: any) {
    console.error('Error in rollbackMarketResults:', err);
    throw err;
  }
}
