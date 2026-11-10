import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from '../db/database';
import { CONFIG } from '../config';
import { authenticateAdmin, AdminRequest } from '../middleware/adminAuth';
import { settleMarketResults, rollbackMarketResults } from '../services/settlement';
import { getSattaKingSyncStatus, syncSattaKingLiveBoard, syncSattaKingMonthlyChart } from '../services/sattaKingSync';
import { getAppaBossSyncStatus, syncAppaBossResults } from '../services/appabossSync';
import { calculateAnkFromPanna, formatMatkaResult } from '../services/matkaUtils';
import { getSmsSettings, sendRenflairOtp } from '../services/smsService';

const router = Router();

function parseUserAgentDevice(ua: string): { name: string; type: 'mobile' | 'desktop' | 'tablet' } {
  if (!ua) return { name: 'Unknown Device', type: 'desktop' };
  let type: 'mobile' | 'desktop' | 'tablet' = 'desktop';
  let deviceName = 'Desktop PC';

  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    type = 'tablet';
    deviceName = 'Tablet';
  } else if (/mobile|iphone|android|phone/i.test(ua)) {
    type = 'mobile';
    if (/iphone/i.test(ua)) {
      deviceName = 'Apple iPhone (iOS)';
    } else if (/samsung/i.test(ua)) {
      deviceName = 'Samsung Galaxy Phone';
    } else if (/vivo/i.test(ua)) {
      deviceName = 'Vivo Mobile';
    } else if (/oppo|realme/i.test(ua)) {
      deviceName = 'Oppo / Realme Phone';
    } else if (/xiaomi|redmi|poco/i.test(ua)) {
      deviceName = 'Redmi / Xiaomi Phone';
    } else if (/oneplus/i.test(ua)) {
      deviceName = 'OnePlus Phone';
    } else {
      deviceName = 'Android Mobile Phone';
    }
  } else {
    if (/macintosh|mac os x/i.test(ua)) {
      deviceName = 'Apple Mac Desktop';
    } else if (/windows/i.test(ua)) {
      deviceName = 'Windows PC';
    } else if (/linux/i.test(ua)) {
      deviceName = 'Linux Computer';
    }
  }

  if (/chrome/i.test(ua) && !/edge|opr/i.test(ua)) deviceName += ' • Chrome';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) deviceName += ' • Safari';
  else if (/firefox/i.test(ua)) deviceName += ' • Firefox';
  else if (/edg/i.test(ua)) deviceName += ' • Edge';

  return { name: deviceName, type };
}

// Admin Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  const admin = await db.queryOne('SELECT * FROM admins WHERE LOWER(username) = LOWER(?)', [username.trim()]) as any;
  if (!admin) {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
  }

  const isMatch = bcrypt.compareSync(password, admin.password_hash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username, role: admin.role },
    CONFIG.ADMIN_JWT_SECRET,
    { expiresIn: '7d' }
  );

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const userAgent = req.headers['user-agent'] || '';
  const deviceInfo = parseUserAgentDevice(userAgent);
  const ipAddress = ((req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1').split(',')[0].trim();

  try {
    await db.execute(
      `INSERT INTO admin_sessions (admin_id, token_hash, device_name, device_type, ip_address, login_time, last_active, is_revoked)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0)`,
      [admin.id, tokenHash, deviceInfo.name, deviceInfo.type, ipAddress]
    );
  } catch (e) {
    console.error('Failed to log admin session:', e);
  }

  return res.json({
    success: true,
    message: 'Admin login successful.',
    token,
    admin: {
      id: admin.id,
      username: admin.username,
      role: admin.role
    }
  });
});

// Admin Self Profile
router.get('/me', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  return res.json({
    success: true,
    admin: req.admin
  });
});

// Admin: Change Password (Master Admin only)
router.post('/change-password', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  if (req.admin?.role !== 'MASTER') {
    return res.status(403).json({ success: false, message: 'Only Super Admin (Master) can change passwords.' });
  }
  const { current_password, new_password, logout_all } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
  }

  const admin = await db.queryOne('SELECT * FROM admins WHERE id = ?', [req.admin.id]) as any;
  if (!admin) {
    return res.status(404).json({ success: false, message: 'Admin not found.' });
  }

  const isMatch = bcrypt.compareSync(current_password, admin.password_hash);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password does not match.' });
  }

  const newHash = bcrypt.hashSync(new_password, 10);
  await db.execute('UPDATE admins SET password_hash = ? WHERE id = ?', [newHash, admin.id]);

  // Log out all other active sessions so every other phone/device is logged out!
  if (logout_all !== false) {
    await db.execute('UPDATE admin_sessions SET is_revoked = 1 WHERE admin_id = ? AND token_hash != ?', [admin.id, req.admin.tokenHash || '']);
  }

  return res.json({
    success: true,
    message: 'Admin password changed successfully! All other logged-in phones and devices have been logged out immediately.'
  });
});

// Admin: Active Devices & Sessions (Kitne phone mein login hai)
router.get('/sessions', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  if (req.admin?.role !== 'MASTER') {
    return res.status(403).json({ success: false, message: 'Access denied. Master Admin only.' });
  }

  try {
    const sessions = await db.queryAll(
      `SELECT s.id, s.device_name, s.device_type, s.ip_address, s.login_time, s.last_active, s.token_hash, a.username, a.role
       FROM admin_sessions s
       JOIN admins a ON s.admin_id = a.id
       WHERE s.is_revoked = 0
       ORDER BY s.last_active DESC`
    ) as any[];

    const formatted = sessions.map(s => ({
      id: s.id,
      username: s.username,
      role: s.role,
      device_name: s.device_name,
      device_type: s.device_type,
      ip_address: s.ip_address,
      login_time: s.login_time,
      last_active: s.last_active,
      is_current: s.token_hash === req.admin?.tokenHash
    }));

    return res.json({
      success: true,
      count: formatted.length,
      sessions: formatted
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Logout Individual Device Session
router.post('/sessions/:id/revoke', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  if (req.admin?.role !== 'MASTER') {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }
  const sessionId = req.params.id;
  await db.execute('UPDATE admin_sessions SET is_revoked = 1 WHERE id = ?', [sessionId]);
  return res.json({ success: true, message: 'Device session successfully logged out.' });
});

// Admin: Logout All Other Devices & Phones
router.post('/sessions/logout-all-others', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  if (req.admin?.role !== 'MASTER') {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }
  await db.execute(
    'UPDATE admin_sessions SET is_revoked = 1 WHERE token_hash != ?',
    [req.admin?.tokenHash || '']
  );
  return res.json({ success: true, message: 'All other logged-in devices and phones have been logged out!' });
});

// Admin: Create Subordinate / Sub-Admin
router.post('/create-sub-admin', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  if (req.admin?.role !== 'MASTER') {
    return res.status(403).json({ success: false, message: 'Only Master Super Admin can create new admin accounts.' });
  }
  const { username, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  const existing = await db.queryOne('SELECT id FROM admins WHERE username = ?', [username.trim()]);
  if (existing) {
    return res.status(400).json({ success: false, message: 'An admin with this username already exists.' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const targetRole = role === 'ADMIN' ? 'ADMIN' : 'SUBORDINATE';
  await db.execute(
    'INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)',
    [username.trim(), hash, targetRole]
  );

  return res.json({
    success: true,
    message: `New ${targetRole} "${username}" created successfully!`
  });
});

// Admin: Get Sub-Admins List
router.get('/sub-admins', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  if (req.admin?.role !== 'MASTER') {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }
  const admins = await db.queryAll('SELECT id, username, role, created_at FROM admins ORDER BY id ASC') as any[];
  return res.json({ success: true, admins });
});

// Admin: Delete Sub-Admin
router.delete('/sub-admins/:id', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  if (req.admin?.role !== 'MASTER') {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }
  const id = parseInt(req.params.id);
  if (id === req.admin?.id) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own Master account.' });
  }
  await db.execute('UPDATE admin_sessions SET is_revoked = 1 WHERE admin_id = ?', [id]);
  await db.execute('DELETE FROM admins WHERE id = ?', [id]);
  return res.json({ success: true, message: 'Admin account deleted and sessions terminated.' });
});

// Admin Dashboard KPIs & Statistics
router.get('/dashboard-stats', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const filter = (req.query.filter as string || 'today').toLowerCase();
  const today = new Date().toISOString().split('T')[0];

  let cutoffDate = today;
  if (filter === '7days') {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    cutoffDate = d.toISOString().split('T')[0];
  } else if (filter === '15days') {
    const d = new Date();
    d.setDate(d.getDate() - 15);
    cutoffDate = d.toISOString().split('T')[0];
  } else if (filter === '30days') {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    cutoffDate = d.toISOString().split('T')[0];
  } else if (filter === 'all') {
    cutoffDate = '2000-01-01';
  }

  const depositStat = await db.queryOne(`
    SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
    FROM deposit_requests
    WHERE status = 'APPROVED' AND created_at >= ?
  `, [cutoffDate]) as any;

  const withdrawalStat = await db.queryOne(`
    SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count
    FROM withdrawal_requests
    WHERE status = 'APPROVED' AND created_at >= ?
  `, [cutoffDate]) as any;

  const betsStat = await db.queryOne(`
    SELECT COALESCE(SUM(amount), 0) as total_volume,
           COALESCE(SUM(won_amount), 0) as total_winnings,
           COUNT(*) as total_bets
    FROM bets
    WHERE bet_date >= ?
  `, [cutoffDate]) as any;

  const usersCountRow = await db.queryOne('SELECT COUNT(*) as count FROM users') as any;
  const usersCount = usersCountRow ? Number(usersCountRow.count) : 0;

  const pendingDepRow = await db.queryOne("SELECT COUNT(*) as count FROM deposit_requests WHERE status = 'PENDING'") as any;
  const pendingDepositsCount = pendingDepRow ? Number(pendingDepRow.count) : 0;

  const pendingWithRow = await db.queryOne("SELECT COUNT(*) as count FROM withdrawal_requests WHERE status = 'PENDING'") as any;
  const pendingWithdrawalsCount = pendingWithRow ? Number(pendingWithRow.count) : 0;

  const settingsRows = await db.queryAll('SELECT key, value FROM system_settings');
  const settings: Record<string, string> = {};
  settingsRows.forEach((r: any) => { settings[r.key] = r.value; });

  const totalDeposits = depositStat ? Number(depositStat.total) : 0;
  const totalWithdrawals = withdrawalStat ? Number(withdrawalStat.total) : 0;
  const totalBetVolume = betsStat ? Number(betsStat.total_volume) : 0;
  const totalWinnings = betsStat ? Number(betsStat.total_winnings) : 0;
  const totalBetsCount = betsStat ? Number(betsStat.total_bets) : 0;
  const netProfit = totalBetVolume - totalWinnings;

  // Recent transactions for dashboard table
  let recentTransactions: any[] = [];
  try {
    const recDep = await db.queryAll(`
      SELECT d.id, d.user_id, 'Deposit' as type, d.amount, d.status, d.created_at, u.phone, u.name
      FROM deposit_requests d
      LEFT JOIN users u ON d.user_id = u.id
      ORDER BY d.created_at DESC LIMIT 4
    `) as any[];

    const recWd = await db.queryAll(`
      SELECT w.id, w.user_id, 'Withdraw' as type, w.amount, w.status, w.created_at, u.phone, u.name
      FROM withdrawal_requests w
      LEFT JOIN users u ON w.user_id = u.id
      ORDER BY w.created_at DESC LIMIT 4
    `) as any[];

    recentTransactions = [...recDep, ...recWd].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6);
  } catch (e) {}

  return res.json({
    success: true,
    stats: {
      filter,
      totalDeposits,
      totalWithdrawals,
      totalBetVolume,
      totalWinnings,
      totalBetsCount,
      netProfit,
      totalUsers: usersCount,
      pendingDepositsCount,
      pendingWithdrawalsCount,
      apkDownloadCount: settings.apk_download_count || '926',
      liveSessions: Math.max(1, Math.floor(usersCount * 0.08)),
      loginCount: usersCount * 3 + 124,
      role: req.admin!.role,
      recentTransactions
    }
  });
});

// DECLARE RESULT & AUTO-SETTLE BIDS
router.post('/declare-result', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const { marketId, date, openPanna, openDigit, closeDigit, closePanna } = req.body;

  if (!marketId) {
    return res.status(400).json({ success: false, message: 'Market ID is required.' });
  }

  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    const result = await settleMarketResults({
      marketId: parseInt(marketId, 10),
      date: targetDate,
      openPanna: openPanna || null,
      openDigit: openDigit || null,
      closeDigit: closeDigit || null,
      closePanna: closePanna || null,
      adminId: req.admin!.id
    });

    return res.json({
      success: true,
      message: `Result declared successfully for ${result.marketName}! Settled ${result.totalSettled} bets, ${result.totalWinners} winners, Total Payout: ₹${result.totalPayout}.`,
      ...result
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to settle results.' });
  }
});

// ROLLBACK / BID REVISE
router.post('/rollback-result', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const { marketId, date } = req.body;
  if (!marketId) {
    return res.status(400).json({ success: false, message: 'Market ID is required.' });
  }

  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    const result = await rollbackMarketResults(parseInt(marketId, 10), targetDate, req.admin!.id);
    return res.json({
      success: true,
      message: `Result successfully rolled back. ${result.reversedBetsCount} bets reset to pending, ₹${result.reversedAmount} reverted.`,
      ...result
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to rollback results.' });
  }
});

// PENDING / ALL DEPOSIT REQUESTS
router.get('/deposits', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const rawStatus = (req.query.status as string || 'PENDING').toUpperCase();

  let query = `
    SELECT d.*, u.name as user_name, u.phone as user_phone, u.wallet_balance as user_wallet
    FROM deposit_requests d
    LEFT JOIN users u ON d.user_id = u.id
  `;
  const params: any[] = [];
  if (rawStatus !== 'ALL') {
    query += ' WHERE UPPER(d.status) = ?';
    params.push(rawStatus);
  }
  query += ' ORDER BY d.created_at DESC LIMIT 300';

  const deposits = await db.queryAll(query, params);
  return res.json({ success: true, deposits });
});

// APPROVE DEPOSIT
router.post('/deposits/:id/approve', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const depositId = req.params.id;
  const adminId = req.admin!.id;

  try {
    const deposit = await db.queryOne('SELECT * FROM deposit_requests WHERE id = ?', [depositId]) as any;
    if (!deposit) return res.status(404).json({ success: false, message: 'Deposit request not found.' });
    if (deposit.status !== 'PENDING') return res.status(400).json({ success: false, message: `Deposit is already ${deposit.status}.` });

    const user = await db.queryOne('SELECT wallet_balance FROM users WHERE id = ?', [deposit.user_id]) as any;
    const prevBal = user ? Number(user.wallet_balance) : 0;
    const amt = Number(deposit.amount);
    const newBal = Math.round((prevBal + amt) * 100) / 100;

    await db.execute(`
      UPDATE deposit_requests
      SET status = 'APPROVED', processed_by = ?, processed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [adminId, depositId]);

    await db.execute('UPDATE users SET wallet_balance = ? WHERE id = ?', [newBal, deposit.user_id]);

    await db.execute(`
      INSERT INTO transactions (user_id, type, amount, previous_balance, new_balance, reference_id, description)
      VALUES (?, 'DEPOSIT', ?, ?, ?, ?, ?)
    `, [
      deposit.user_id,
      amt,
      prevBal,
      newBal,
      `UTR:${deposit.utr_number}`,
      `UPI Deposit approved by admin (UTR: ${deposit.utr_number})`
    ]);

    await db.execute(`
      INSERT INTO admin_audit_logs (admin_id, action, details)
      VALUES (?, 'APPROVE_DEPOSIT', ?)
    `, [adminId, `Approved deposit of ₹${amt} for user ID ${deposit.user_id} (UTR: ${deposit.utr_number})`]);

    return res.json({
      success: true,
      message: `Deposit of ₹${amt} approved! User wallet credited.`,
      newBalance: newBal
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// REJECT DEPOSIT
router.post('/deposits/:id/reject', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const depositId = req.params.id;
  const { reason } = req.body;
  const adminId = req.admin!.id;

  const deposit = await db.queryOne('SELECT * FROM deposit_requests WHERE id = ?', [depositId]) as any;
  if (!deposit) return res.status(404).json({ success: false, message: 'Deposit request not found.' });
  if (deposit.status !== 'PENDING') return res.status(400).json({ success: false, message: `Deposit is already ${deposit.status}.` });

  await db.execute(`
    UPDATE deposit_requests
    SET status = 'REJECTED', admin_notes = ?, processed_by = ?, processed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [reason || 'Invalid UTR or payment not received', adminId, depositId]);

  await db.execute(`
    INSERT INTO admin_audit_logs (admin_id, action, details)
    VALUES (?, 'REJECT_DEPOSIT', ?)
  `, [adminId, `Rejected deposit ID ${depositId} (UTR: ${deposit.utr_number}). Reason: ${reason || 'Invalid'}`]);

  return res.json({ success: true, message: 'Deposit request rejected.' });
});

// PENDING / ALL WITHDRAWAL REQUESTS
router.get('/withdrawals', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const rawStatus = (req.query.status as string || 'PENDING').toUpperCase();

  let query = `
    SELECT w.*, u.name as user_name, u.phone as user_phone, u.wallet_balance as user_wallet
    FROM withdrawal_requests w
    LEFT JOIN users u ON w.user_id = u.id
  `;
  const params: any[] = [];
  if (rawStatus !== 'ALL') {
    query += ' WHERE UPPER(w.status) = ?';
    params.push(rawStatus);
  }
  query += ' ORDER BY w.created_at DESC LIMIT 300';

  const withdrawals = await db.queryAll(query, params);
  return res.json({ success: true, withdrawals });
});

// APPROVE WITHDRAWAL (Mark paid)
router.post('/withdrawals/:id/approve', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const withdrawalId = req.params.id;
  const { reference } = req.body;
  const adminId = req.admin!.id;

  const withdrawal = await db.queryOne('SELECT * FROM withdrawal_requests WHERE id = ?', [withdrawalId]) as any;
  if (!withdrawal) return res.status(404).json({ success: false, message: 'Withdrawal not found.' });
  if (withdrawal.status !== 'PENDING') return res.status(400).json({ success: false, message: `Withdrawal is already ${withdrawal.status}.` });

  await db.execute(`
    UPDATE withdrawal_requests
    SET status = 'APPROVED', transaction_reference = ?, processed_by = ?, processed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [reference || 'PAID', adminId, withdrawalId]);

  await db.execute(`
    INSERT INTO admin_audit_logs (admin_id, action, details)
    VALUES (?, 'APPROVE_WITHDRAWAL', ?)
  `, [adminId, `Marked withdrawal ID ${withdrawalId} of ₹${withdrawal.amount} as PAID (Ref: ${reference || 'N/A'})`]);

  return res.json({ success: true, message: 'Withdrawal marked as paid and completed.' });
});

// REJECT WITHDRAWAL (Atomically refunds amount back to user's wallet)
router.post('/withdrawals/:id/reject', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const withdrawalId = req.params.id;
  const { reason } = req.body;
  const adminId = req.admin!.id;

  try {
    const withdrawal = await db.queryOne('SELECT * FROM withdrawal_requests WHERE id = ?', [withdrawalId]) as any;
    if (!withdrawal) return res.status(404).json({ success: false, message: 'Withdrawal not found.' });
    if (withdrawal.status !== 'PENDING') return res.status(400).json({ success: false, message: `Withdrawal is already ${withdrawal.status}.` });

    const user = await db.queryOne('SELECT wallet_balance FROM users WHERE id = ?', [withdrawal.user_id]) as any;
    const prevBal = user ? Number(user.wallet_balance) : 0;
    const amt = Number(withdrawal.amount);
    const newBal = Math.round((prevBal + amt) * 100) / 100;

    await db.execute(`
      UPDATE withdrawal_requests
      SET status = 'REJECTED', admin_notes = ?, processed_by = ?, processed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [reason || 'Rejected by admin', adminId, withdrawalId]);

    await db.execute('UPDATE users SET wallet_balance = ? WHERE id = ?', [newBal, withdrawal.user_id]);

    await db.execute(`
      INSERT INTO transactions (user_id, type, amount, previous_balance, new_balance, reference_id, description)
      VALUES (?, 'WITHDRAWAL_REFUND', ?, ?, ?, ?, ?)
    `, [
      withdrawal.user_id,
      amt,
      prevBal,
      newBal,
      `REF-WREQ-${withdrawalId}`,
      `Refund for rejected withdrawal: ${reason || 'Rejected'}`
    ]);

    await db.execute(`
      INSERT INTO admin_audit_logs (admin_id, action, details)
      VALUES (?, 'REJECT_WITHDRAWAL', ?)
    `, [adminId, `Rejected withdrawal ID ${withdrawalId} and refunded ₹${amt} to user ID ${withdrawal.user_id}`]);

    return res.json({
      success: true,
      message: `Withdrawal rejected. ₹${amt} refunded to user's wallet.`,
      newBalance: newBal
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

// ALL BID DATA
router.get('/bids', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const { marketId, date, status, gameType, search } = req.query;

  let query = `
    SELECT b.*, m.name as market_name, gt.name as game_type_name, u.name as user_name, u.phone as user_phone
    FROM bets b
    JOIN markets m ON b.market_id = m.id
    JOIN game_types gt ON b.game_type = gt.id
    JOIN users u ON b.user_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (marketId) {
    query += ` AND b.market_id = ?`;
    params.push(marketId);
  }
  if (date) {
    query += ` AND b.bet_date = ?`;
    params.push(date);
  }
  if (status) {
    query += ` AND b.status = ?`;
    params.push((status as string).toUpperCase());
  }
  if (gameType) {
    query += ` AND b.game_type = ?`;
    params.push(gameType);
  }
  if (search) {
    query += ` AND (u.phone LIKE ? OR u.name LIKE ? OR b.ticket_id LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ` ORDER BY b.created_at DESC LIMIT 200`;

  const bets = await db.queryAll(query, params);
  return res.json({ success: true, bets });
});

// EXPOSURE / RISK ANALYSIS
router.get('/exposure/:marketId', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const { marketId } = req.params;
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

  const singleAnkExposure = await db.queryAll(`
    SELECT bet_number, session, SUM(amount) as total_amount, SUM(potential_win) as potential_payout, COUNT(*) as bet_count
    FROM bets
    WHERE market_id = ? AND bet_date = ? AND game_type = 'single_digit' AND status = 'PENDING'
    GROUP BY bet_number, session
    ORDER BY total_amount DESC
  `, [marketId, date]);

  const jodiExposure = await db.queryAll(`
    SELECT bet_number, SUM(amount) as total_amount, SUM(potential_win) as potential_payout, COUNT(*) as bet_count
    FROM bets
    WHERE market_id = ? AND bet_date = ? AND game_type = 'jodi_digit' AND status = 'PENDING'
    GROUP BY bet_number
    ORDER BY total_amount DESC
    LIMIT 20
  `, [marketId, date]);

  const totalMarketPending = await db.queryOne(`
    SELECT COALESCE(SUM(amount), 0) as total_bids, COALESCE(SUM(potential_win), 0) as max_risk, COUNT(*) as count
    FROM bets
    WHERE market_id = ? AND bet_date = ? AND status = 'PENDING'
  `, [marketId, date]);

  return res.json({
    success: true,
    marketId,
    date,
    totalMarketPending,
    singleAnkExposure,
    jodiExposure
  });
});

// USER MANAGEMENT
router.get('/users', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const search = req.query.search as string;
  let query = `
    SELECT u.id, u.phone, u.name, u.wallet_balance, u.status, u.created_at,
           (SELECT COUNT(*) FROM bets WHERE user_id = u.id) as total_bets,
           (SELECT COALESCE(SUM(amount), 0) FROM bets WHERE user_id = u.id) as total_spent,
           (SELECT COALESCE(SUM(won_amount), 0) FROM bets WHERE user_id = u.id AND status = 'WON') as total_won
    FROM users u
  `;
  const params: any[] = [];

  if (search) {
    query += ` WHERE u.phone LIKE ? OR u.name LIKE ?`;
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ` ORDER BY u.created_at DESC LIMIT 100`;

  const users = await db.queryAll(query, params);
  return res.json({ success: true, users });
});

// TOGGLE USER BLOCK/UNBLOCK
router.post('/users/:id/toggle-status', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const userId = req.params.id;
  const user = await db.queryOne('SELECT status FROM users WHERE id = ?', [userId]) as any;
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  const newStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
  await db.execute('UPDATE users SET status = ? WHERE id = ?', [newStatus, userId]);

  await db.execute(`
    INSERT INTO admin_audit_logs (admin_id, action, details)
    VALUES (?, 'TOGGLE_USER_STATUS', ?)
  `, [req.admin!.id, `Changed user ID ${userId} status to ${newStatus}`]);

  return res.json({ success: true, message: `User status changed to ${newStatus}.`, newStatus });
});

// MANUAL USER WALLET ADJUSTMENT
router.post('/users/:id/adjust-wallet', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const userId = req.params.id;
  const { amount, type, reason } = req.body;
  const adminId = req.admin!.id;

  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) {
    return res.status(400).json({ success: false, message: 'Valid amount is required.' });
  }

  const user = await db.queryOne('SELECT wallet_balance FROM users WHERE id = ?', [userId]) as any;
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  const prevBal = Number(user.wallet_balance);
  let newBal = prevBal;

  if (type === 'CREDIT') {
    newBal = Math.round((prevBal + amt) * 100) / 100;
  } else if (type === 'DEBIT') {
    newBal = Math.max(0, Math.round((prevBal - amt) * 100) / 100);
  } else {
    return res.status(400).json({ success: false, message: 'Type must be CREDIT or DEBIT.' });
  }

  await db.execute('UPDATE users SET wallet_balance = ? WHERE id = ?', [newBal, userId]);

  await db.execute(`
    INSERT INTO transactions (user_id, type, amount, previous_balance, new_balance, reference_id, description)
    VALUES (?, 'ADMIN_ADJUST', ?, ?, ?, ?, ?)
  `, [
    userId,
    type === 'CREDIT' ? amt : -amt,
    prevBal,
    newBal,
    `ADJ-${Date.now()}`,
    `Admin ${type}: ${reason || 'Manual Adjustment'}`
  ]);

  await db.execute(`
    INSERT INTO admin_audit_logs (admin_id, action, details)
    VALUES (?, 'MANUAL_WALLET_ADJUST', ?)
  `, [adminId, `Manual ${type} of ₹${amt} on user ID ${userId}. Reason: ${reason || 'N/A'}`]);

  return res.json({ success: true, message: `Wallet successfully ${type === 'CREDIT' ? 'credited' : 'debited'}.`, newBalance: newBal });
});

// MARKETS CRUD & LIVE RESULTS
router.get('/markets', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const targetDate = (req.query.date as string) || new Date().toISOString().split('T')[0];

  const markets = await db.queryAll(`
    SELECT m.*, 
           r.open_panna, r.open_digit, r.close_digit, r.close_panna, r.jodi, 
           r.status as result_status, r.is_manual_override, r.declared_at
    FROM markets m
    LEFT JOIN market_results r ON m.id = r.market_id AND r.date = ?
    ORDER BY m.sort_order ASC
  `, [targetDate]);

  const formatted = markets.map((m: any) => {
    const resultString = formatMatkaResult(m.open_panna, m.open_digit, m.close_digit, m.close_panna);
    return {
      ...m,
      resultString,
      is_manual_override: Number(m.is_manual_override) === 1
    };
  });

  return res.json({ success: true, markets: formatted, date: targetDate });
});

// ADMIN MODIFY RESULT (Overwrites or declares result, locks it in Manual Override)
router.post('/markets/:id/modify-result', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const marketId = parseInt(req.params.id, 10);
  const { date, openPanna, openDigit, closeDigit, closePanna, jodi } = req.body;
  const targetDate = date || new Date().toISOString().split('T')[0];

  const market = await db.queryOne('SELECT * FROM markets WHERE id = ?', [marketId]);
  if (!market) {
    return res.status(404).json({ success: false, message: 'Market not found.' });
  }

  let finalOpenDigit = openDigit;
  let finalCloseDigit = closeDigit;
  let finalJodi = jodi;

  if (openPanna && (!finalOpenDigit || finalOpenDigit === '')) {
    finalOpenDigit = calculateAnkFromPanna(openPanna);
  }
  if (closePanna && (!finalCloseDigit || finalCloseDigit === '')) {
    finalCloseDigit = calculateAnkFromPanna(closePanna);
  }
  if (finalOpenDigit && finalCloseDigit) {
    finalJodi = `${finalOpenDigit}${finalCloseDigit}`;
  } else if (finalJodi && finalJodi.length === 2) {
    finalOpenDigit = finalJodi[0];
    finalCloseDigit = finalJodi[1];
  }

  try {
    const settlement = await settleMarketResults({
      marketId,
      date: targetDate,
      openPanna: openPanna || null,
      openDigit: finalOpenDigit || null,
      closeDigit: finalCloseDigit || null,
      closePanna: closePanna || null,
      jodi: finalJodi || null,
      adminId: req.admin!.id,
      isManualOverride: true
    });

    await db.execute(`
      INSERT INTO admin_audit_logs (admin_id, action, details)
      VALUES (?, 'MODIFY_MARKET_RESULT', ?)
    `, [
      req.admin!.id,
      `Admin manually modified result for ${market.name} (${targetDate}): Open=${openPanna || '-'}-${finalOpenDigit || '-'}, Close=${finalCloseDigit || '-'}-${closePanna || '-'}, Jodi=${finalJodi || '-'}`
    ]);

    return res.json({
      success: true,
      message: `Result for ${market.name} modified successfully! Settled ${settlement.totalSettled} bets (${settlement.totalWinners} winners, ₹${settlement.totalPayout} payout). Result is now LOCKED in Manual mode.`,
      settlement
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to modify result.' });
  }
});

// ADMIN RESET RESULT TO AUTOMATIC (Unlocks manual override so automated system runs)
router.post('/markets/:id/reset-result-auto', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const marketId = parseInt(req.params.id, 10);
  const targetDate = (req.body.date as string) || new Date().toISOString().split('T')[0];

  const market = await db.queryOne('SELECT * FROM markets WHERE id = ?', [marketId]);
  if (!market) {
    return res.status(404).json({ success: false, message: 'Market not found.' });
  }

  // Set is_manual_override = 0
  await db.execute(`
    UPDATE market_results
    SET is_manual_override = 0
    WHERE market_id = ? AND date = ?
  `, [marketId, targetDate]);

  // Set market result_mode to AUTOMATIC
  await db.execute(`
    UPDATE markets
    SET result_mode = 'AUTOMATIC'
    WHERE id = ?
  `, [marketId]);

  await db.execute(`
    INSERT INTO admin_audit_logs (admin_id, action, details)
    VALUES (?, 'RESET_MARKET_AUTO', ?)
  `, [
    req.admin!.id,
    `Admin reset market ${market.name} (${targetDate}) back to Automatic mode.`
  ]);

  return res.json({
    success: true,
    message: `Market ${market.name} has been reset to Automatic mode! Results will now be synced/drawn automatically.`
  });
});

router.post('/markets', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const {
    name,
    hindi_name,
    open_time,
    close_time,
    open_time_24,
    close_time_24,
    sort_order,
    is_active,
    result_mode
  } = req.body;

  if (!name || !open_time || !close_time) {
    return res.status(400).json({ success: false, message: 'Market Name, Open Time and Close Time are required.' });
  }

  const cleanName = name.trim().toUpperCase();

  // Check if market already exists
  const existing = await db.queryOne('SELECT id FROM markets WHERE name = ?', [cleanName]);
  if (existing) {
    return res.status(400).json({ success: false, message: `Market "${cleanName}" already exists.` });
  }

  // Convert 12h time to 24h if missing
  const convertTo24 = (t: string) => {
    if (!t) return '12:00';
    const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return t.slice(0, 5);
    let hrs = parseInt(m[1], 10);
    const mins = m[2];
    const mod = m[3].toUpperCase();
    if (mod === 'PM' && hrs < 12) hrs += 12;
    if (mod === 'AM' && hrs === 12) hrs = 0;
    return `${hrs.toString().padStart(2, '0')}:${mins}`;
  };

  const finalOpen24 = open_time_24 || convertTo24(open_time);
  const finalClose24 = close_time_24 || convertTo24(close_time);
  const finalSort = typeof sort_order === 'number' ? sort_order : (parseInt(sort_order, 10) || 50);
  const finalActive = is_active !== undefined ? (Number(is_active) ? 1 : 0) : 1;
  const finalMode = result_mode || 'MANUAL';

  await db.execute(`
    INSERT INTO markets (name, hindi_name, open_time, close_time, open_time_24, close_time_24, sort_order, is_active, result_mode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    cleanName,
    hindi_name?.trim() || cleanName,
    open_time.trim(),
    close_time.trim(),
    finalOpen24,
    finalClose24,
    finalSort,
    finalActive,
    finalMode
  ]);

  const newMarket = await db.queryOne('SELECT * FROM markets WHERE name = ?', [cleanName]);

  // Immediately initialize today result row for this new market
  if (newMarket) {
    const today = new Date().toISOString().split('T')[0];
    const existingResult = await db.queryOne('SELECT id FROM market_results WHERE market_id = ? AND date = ?', [newMarket.id, today]);
    if (!existingResult) {
      await db.execute(
        'INSERT INTO market_results (market_id, date, status) VALUES (?, ?, ?)',
        [newMarket.id, today, 'OPEN']
      );
    }
  }

  await db.execute(`
    INSERT INTO admin_audit_logs (admin_id, action, details)
    VALUES (?, 'CREATE_MARKET', ?)
  `, [
    req.admin!.id,
    `Created new market: ${cleanName} (Open: ${open_time}, Close: ${close_time})`
  ]);

  return res.json({
    success: true,
    message: `Market "${cleanName}" created successfully!`,
    market: newMarket
  });
});

router.put('/markets/:id', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const { name, hindi_name, open_time, close_time, open_time_24, close_time_24, is_active } = req.body;
  await db.execute(`
    UPDATE markets
    SET name = COALESCE(?, name),
        hindi_name = COALESCE(?, hindi_name),
        open_time = COALESCE(?, open_time),
        close_time = COALESCE(?, close_time),
        open_time_24 = COALESCE(?, open_time_24),
        close_time_24 = COALESCE(?, close_time_24),
        is_active = COALESCE(?, is_active)
    WHERE id = ?
  `, [name, hindi_name, open_time, close_time, open_time_24, close_time_24, is_active, req.params.id]);

  return res.json({ success: true, message: 'Market updated successfully.' });
});

// SYSTEM SETTINGS
router.get('/settings', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const rows = await db.queryAll('SELECT key, value, description FROM system_settings');
  const settings: Record<string, string> = {};
  rows.forEach((r: any) => { settings[r.key] = r.value; });
  return res.json({ success: true, settings });
});

router.post('/settings', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const updates = req.body;

  for (const [key, val] of Object.entries(updates)) {
    if (val !== undefined && val !== null) {
      const existing = await db.queryOne('SELECT key FROM system_settings WHERE key = ?', [key]);
      if (existing) {
        await db.execute('UPDATE system_settings SET value = ? WHERE key = ?', [val.toString(), key]);
      } else {
        await db.execute('INSERT INTO system_settings (key, value) VALUES (?, ?)', [key, val.toString()]);
      }
    }
  }

  return res.json({ success: true, message: 'Settings updated successfully.' });
});

// Test SMS Endpoint
router.post('/sms/test', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Mobile number required for testing SMS.' });
  }
  const cleanPhone = phone.toString().trim().replace(/[^0-9]/g, '');
  const { apiKey } = await getSmsSettings();
  const testOtp = Math.floor(1000 + Math.random() * 9000).toString();
  const result = await sendRenflairOtp(cleanPhone, testOtp, apiKey);
  return res.json({ success: result.success, message: result.message, testOtp });
});

// GAME RATES
router.get('/game-rates', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const rates = await db.queryAll('SELECT * FROM game_types ORDER BY payout_rate ASC');
  return res.json({ success: true, rates });
});

router.post('/game-rates', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const { id, payout_rate, min_bet, max_bet } = req.body;
  await db.execute(`
    UPDATE game_types
    SET payout_rate = COALESCE(?, payout_rate),
        min_bet = COALESCE(?, min_bet),
        max_bet = COALESCE(?, max_bet)
    WHERE id = ?
  `, [payout_rate, min_bet, max_bet, id]);

  return res.json({ success: true, message: 'Game rate updated successfully.' });
});

// MARKETS AUTOMATION & PRE-SCHEDULED RESULTS
router.get('/markets-automation', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const markets = await db.queryAll(`
    SELECT id, name, open_time, close_time, open_time_24, close_time_24,
           result_mode, auto_algorithm, scheduled_open_panna, scheduled_close_panna, is_active
    FROM markets
    ORDER BY sort_order ASC
  `);
  return res.json({ success: true, markets });
});

router.post('/markets/:id/automation', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const { result_mode, auto_algorithm, scheduled_open_panna, scheduled_close_panna } = req.body;
  const adminId = req.admin!.id;

  await db.execute(`
    UPDATE markets
    SET result_mode = COALESCE(?, result_mode),
        auto_algorithm = COALESCE(?, auto_algorithm),
        scheduled_open_panna = ?,
        scheduled_close_panna = ?
    WHERE id = ?
  `, [
    result_mode || 'MANUAL',
    auto_algorithm || 'MIN_LIABILITY',
    scheduled_open_panna || null,
    scheduled_close_panna || null,
    req.params.id
  ]);

  await db.execute(`
    INSERT INTO admin_audit_logs (admin_id, action, details)
    VALUES (?, 'UPDATE_MARKET_AUTOMATION', ?)
  `, [
    adminId,
    `Updated automation for market ID ${req.params.id}: Mode=${result_mode}, OpenPana=${scheduled_open_panna || 'None'}, ClosePana=${scheduled_close_panna || 'None'}`
  ]);

  return res.json({ success: true, message: 'Market automation and pre-scheduled results saved successfully.' });
});

// SATTA KING LIVE RESULTS AUTO-SYNC APIS
router.get('/satta-king/status', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const status = getSattaKingSyncStatus();
  return res.json({ success: true, status });
});

router.post('/satta-king/sync-now', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const adminId = req.admin!.id;
  const status = await syncSattaKingLiveBoard();

  await db.execute(`
    INSERT INTO admin_audit_logs (admin_id, action, details)
    VALUES (?, 'SATTA_KING_SYNC_NOW', ?)
  `, [
    adminId,
    `Triggered manual Satta King sync. Status: ${status.lastMessage}`
  ]);

  return res.json({
    success: status.lastSyncSuccess,
    message: status.lastMessage,
    status
  });
});

router.post('/satta-king/sync-month', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const { yearMonth } = req.body;
  const adminId = req.admin!.id;
  const ym = yearMonth || new Date().toISOString().slice(0, 7);

  const result = await syncSattaKingMonthlyChart(ym);

  await db.execute(`
    INSERT INTO admin_audit_logs (admin_id, action, details)
    VALUES (?, 'SATTA_KING_SYNC_MONTH', ?)
  `, [
    adminId,
    `Triggered Satta King monthly chart sync for ${ym}: ${result.message}`
  ]);

  return res.json(result);
});

// MATKAPULSE & APPABOSS LIVE RESULTS AUTO-SYNC APIS (For All Matka & Satta Markets from https://matkapulse.com/)
router.get('/matkapulse/status', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const status = getAppaBossSyncStatus();
  return res.json({ success: true, status });
});

router.post('/matkapulse/sync-now', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const adminId = req.admin!.id;
  const status = await syncAppaBossResults();

  await db.execute(`
    INSERT INTO admin_audit_logs (admin_id, action, details)
    VALUES (?, 'MATKAPULSE_SYNC_NOW', ?)
  `, [
    adminId,
    `Triggered manual MatkaPulse sync. Status: ${status.lastMessage}`
  ]);

  return res.json({
    success: status.lastSyncSuccess,
    message: status.lastMessage,
    status
  });
});

router.get('/appaboss/status', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const status = getAppaBossSyncStatus();
  return res.json({ success: true, status });
});

router.post('/appaboss/sync-now', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  const adminId = req.admin!.id;
  const status = await syncAppaBossResults();

  await db.execute(`
    INSERT INTO admin_audit_logs (admin_id, action, details)
    VALUES (?, 'APPABOSS_SYNC_NOW', ?)
  `, [
    adminId,
    `Triggered manual MatkaPulse sync. Status: ${status.lastMessage}`
  ]);

  return res.json({
    success: status.lastSyncSuccess,
    message: status.lastMessage,
    status
  });
});

export default router;
