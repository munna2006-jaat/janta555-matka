import { Router, Response } from 'express';
import fs from 'fs';
import path from 'path';
import db from '../db/database';
import { authenticateUser, AuthRequest } from '../middleware/auth';

const router = Router();

// Get Payment Config & UPI Details
router.get('/config', async (req, res) => {
  const settingsRows = await db.queryAll('SELECT key, value FROM system_settings');
  const settings: Record<string, string> = {};
  settingsRows.forEach((r: any) => { settings[r.key] = r.value; });

  return res.json({
    success: true,
    config: {
      upi_id: settings.upi_id || 'janta555official@upi',
      upi_name: settings.upi_name || 'JANTA555 ENTERPRISE',
      qr_code_image: settings.qr_code_image || '',
      min_deposit: parseInt(settings.min_deposit || '100', 10),
      max_deposit: parseInt(settings.max_deposit || '100000', 10),
      min_withdrawal: parseInt(settings.min_withdrawal || '500', 10),
      max_withdrawal: parseInt(settings.max_withdrawal || '50000', 10),
      withdrawal_start_time: settings.withdrawal_start_time || '10:00 AM',
      withdrawal_end_time: settings.withdrawal_end_time || '08:00 PM',
      whatsapp_number: settings.whatsapp_number || '+919876543210',
      meta_pixel_id: settings.meta_pixel_id || '2066705063996932'
    }
  });
});

// Submit Deposit Request (UPI QR + UTR transaction)
router.post('/deposit', authenticateUser, async (req: AuthRequest, res: Response) => {
  const { amount, utr_number, receipt_url } = req.body;
  const userId = req.user!.id;

  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) {
    return res.status(400).json({ success: false, message: 'Please enter a valid deposit amount.' });
  }

  // Get system limits
  const minDepositSetting = await db.queryOne("SELECT value FROM system_settings WHERE key = 'min_deposit'");
  const maxDepositSetting = await db.queryOne("SELECT value FROM system_settings WHERE key = 'max_deposit'");
  const minDeposit = parseInt(minDepositSetting?.value || '100', 10);
  const maxDeposit = parseInt(maxDepositSetting?.value || '100000', 10);

  if (amt < minDeposit) {
    return res.status(400).json({ success: false, message: `Minimum deposit amount is ₹${minDeposit}.` });
  }
  if (amt > maxDeposit) {
    return res.status(400).json({ success: false, message: `Maximum deposit amount is ₹${maxDeposit}.` });
  }

  if (!utr_number || utr_number.toString().trim().length < 8) {
    return res.status(400).json({ success: false, message: 'Please enter a valid 12-digit UPI UTR / Transaction ID.' });
  }

  const cleanUTR = utr_number.toString().trim();

  // Check if UTR already submitted
  const existingUTR = await db.queryOne('SELECT id FROM deposit_requests WHERE utr_number = ?', [cleanUTR]);
  if (existingUTR) {
    return res.status(400).json({ success: false, message: 'This UTR / Transaction ID has already been submitted.' });
  }

  let finalReceiptUrl: string | null = receipt_url || null;
  if (receipt_url && typeof receipt_url === 'string' && receipt_url.startsWith('data:image/')) {
    try {
      const matches = receipt_url.match(/^data:image\/([a-zA-Z0-9.+]+);base64,(.+)$/);
      if (matches) {
        const rawExt = matches[1].toLowerCase();
        const ext = rawExt === 'jpeg' ? 'jpg' : rawExt.replace(/[^a-z0-9]/g, '');
        const buffer = Buffer.from(matches[2], 'base64');
        const uploadsDir = path.resolve(process.cwd(), 'uploads', 'receipts');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        const filename = `receipt_${Date.now()}_u${userId}.${ext || 'jpg'}`;
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, buffer);
        finalReceiptUrl = `/uploads/receipts/${filename}`;
      }
    } catch (saveErr) {
      console.error('[Receipt File Save Error]', saveErr);
      // Keep original receipt_url base64 so image is never lost
    }
  }

  await db.execute(`
    INSERT INTO deposit_requests (user_id, amount, payment_method, utr_number, receipt_url, status)
    VALUES (?, ?, 'UPI', ?, ?, 'PENDING')
  `, [userId, amt, cleanUTR, finalReceiptUrl]);

  return res.json({
    success: true,
    message: 'Deposit request submitted successfully! Funds will be added to your wallet as soon as approved by admin.'
  });
});

// Submit Withdrawal Request
router.post('/withdraw', authenticateUser, async (req: AuthRequest, res: Response) => {
  const { amount, payout_mode } = req.body;
  const userId = req.user!.id;

  const amt = parseFloat(amount);
  if (isNaN(amt) || amt <= 0) {
    return res.status(400).json({ success: false, message: 'Please enter a valid withdrawal amount.' });
  }

  const minWithdrawalSetting = await db.queryOne("SELECT value FROM system_settings WHERE key = 'min_withdrawal'");
  const maxWithdrawalSetting = await db.queryOne("SELECT value FROM system_settings WHERE key = 'max_withdrawal'");
  const minWithdrawal = parseInt(minWithdrawalSetting?.value || '500', 10);
  const maxWithdrawal = parseInt(maxWithdrawalSetting?.value || '50000', 10);

  if (amt < minWithdrawal) {
    return res.status(400).json({ success: false, message: `Minimum withdrawal amount is ₹${minWithdrawal}.` });
  }
  if (amt > maxWithdrawal) {
    return res.status(400).json({ success: false, message: `Maximum withdrawal amount is ₹${maxWithdrawal}.` });
  }

  // Get user's saved bank / UPI details
  const bankDetails = await db.queryOne('SELECT * FROM user_bank_details WHERE user_id = ?', [userId]) as any;
  if (!bankDetails) {
    return res.status(400).json({
      success: false,
      message: 'Please add your Bank Account or UPI ID details in the Bank section before withdrawing.'
    });
  }

  const mode = payout_mode ? payout_mode.toUpperCase() : (bankDetails.upi_id ? 'UPI' : 'BANK');

  if (mode === 'UPI' && !bankDetails.upi_id) {
    return res.status(400).json({ success: false, message: 'Please enter and save your UPI ID first.' });
  }
  if (mode === 'BANK' && (!bankDetails.account_number || !bankDetails.ifsc_code)) {
    return res.status(400).json({ success: false, message: 'Please enter and save your Bank Account Number and IFSC Code first.' });
  }

  try {
    const user = await db.queryOne('SELECT wallet_balance FROM users WHERE id = ?', [userId]) as any;
    const currentBalance = user ? Number(user.wallet_balance) : 0;
    if (currentBalance < amt) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. You have ₹${currentBalance}.`
      });
    }

    const prevBalance = currentBalance;
    const newBalance = Math.round((prevBalance - amt) * 100) / 100;

    // Deduct user balance immediately
    await db.execute('UPDATE users SET wallet_balance = ? WHERE id = ?', [newBalance, userId]);

    const result = await db.execute(`
      INSERT INTO withdrawal_requests (
        user_id, amount, payout_mode, account_holder, account_number, ifsc_code, bank_name, upi_id, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
    `, [
      userId,
      amt,
      mode,
      bankDetails.account_holder,
      bankDetails.account_number,
      bankDetails.ifsc_code,
      bankDetails.bank_name,
      bankDetails.upi_id
    ]);

    const reqId = result.lastInsertRowid;

    // Record in transaction ledger
    await db.execute(`
      INSERT INTO transactions (user_id, type, amount, previous_balance, new_balance, reference_id, description)
      VALUES (?, 'WITHDRAWAL_REQUEST', ?, ?, ?, ?, ?)
    `, [
      userId,
      -amt,
      prevBalance,
      newBalance,
      `WREQ-${reqId}`,
      `Withdrawal request of ₹${amt} via ${mode}`
    ]);

    return res.json({
      success: true,
      message: `Withdrawal request of ₹${amt} submitted successfully! Your updated balance is ₹${newBalance}.`,
      newBalance
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message || 'Failed to submit withdrawal.' });
  }
});

// User Transaction Passbook / Statement
router.get('/transactions', authenticateUser, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const transactions = await db.queryAll(`
    SELECT * FROM transactions
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 100
  `, [userId]);

  return res.json({ success: true, transactions });
});

// User Deposit Requests History
router.get('/deposit-history', authenticateUser, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const deposits = await db.queryAll(`
    SELECT * FROM deposit_requests
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `, [userId]);

  return res.json({ success: true, deposits });
});

// User Withdrawal Requests History
router.get('/withdrawal-history', authenticateUser, async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const withdrawals = await db.queryAll(`
    SELECT * FROM withdrawal_requests
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `, [userId]);

  return res.json({ success: true, withdrawals });
});

export default router;
