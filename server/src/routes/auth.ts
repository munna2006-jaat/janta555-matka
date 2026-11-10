import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/database';
import { CONFIG } from '../config';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import { createAndSendRegistrationOtp, verifyRegistrationOtp, getSmsSettings } from '../services/smsService';

const router = Router();

// Send OTP for Registration
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: 'Mobile number is required.' });
  }

  const result = await createAndSendRegistrationOtp(phone);
  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.json(result);
});

// Register new user with OTP verification
router.post('/register', async (req, res) => {
  const { phone, name, password, otp } = req.body;

  if (!phone || !name || !password) {
    return res.status(400).json({ success: false, message: 'Phone, full name, and password are required.' });
  }

  const cleanPhone = phone.toString().trim().replace(/[^0-9]/g, '');
  if (cleanPhone.length !== 10) {
    return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number.' });
  }

  if (password.length < 4) {
    return res.status(400).json({ success: false, message: 'Password must be at least 4 characters long.' });
  }

  // 1. Check if user already exists (ek number se baar baar register na kar paaye)
  const existing = await db.queryOne('SELECT id FROM users WHERE phone = ?', [cleanPhone]);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Yeh mobile number pehle se registered hai! Kripya Login karein.' });
  }

  // 2. Verify OTP if SMS OTP is enabled
  const { enabled } = await getSmsSettings();
  if (enabled) {
    if (!otp) {
      return res.status(400).json({ success: false, message: 'Kripya mobile number par bheja gaya 4-digit OTP dalein.' });
    }
    const otpVerification = await verifyRegistrationOtp(cleanPhone, otp);
    if (!otpVerification.valid) {
      return res.status(400).json({ success: false, message: otpVerification.message || 'OTP verification failed.' });
    }
  }

  // 3. Create user in database
  const password_hash = bcrypt.hashSync(password, 10);
  const result = await db.execute(`
    INSERT INTO users (phone, name, password_hash, wallet_balance, status)
    VALUES (?, ?, ?, 0.00, 'ACTIVE')
  `, [cleanPhone, name.trim(), password_hash]);

  const userId = result.lastInsertRowid;
  const token = jwt.sign({ id: userId, phone: cleanPhone }, CONFIG.JWT_SECRET, { expiresIn: '30d' });

  return res.json({
    success: true,
    message: 'Registration successful! Welcome to JANTA555.',
    token,
    user: {
      id: userId,
      phone: cleanPhone,
      name: name.trim(),
      wallet_balance: 0.00
    }
  });
});

// Login
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ success: false, message: 'Mobile number and password are required.' });
  }

  const cleanPhone = phone.toString().trim().replace(/[^0-9]/g, '');
  const user = await db.queryOne('SELECT id, phone, name, password_hash, wallet_balance, status FROM users WHERE phone = ?', [cleanPhone]) as any;

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid mobile number or password.' });
  }

  if (user.status === 'BLOCKED') {
    return res.status(403).json({ success: false, message: 'Your account is suspended. Please contact customer support.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Invalid mobile number or password.' });
  }

  const token = jwt.sign({ id: user.id, phone: user.phone }, CONFIG.JWT_SECRET, { expiresIn: '30d' });

  return res.json({
    success: true,
    message: 'Login successful.',
    token,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      wallet_balance: Number(user.wallet_balance)
    }
  });
});

// Get Current User Profile & Balance
router.get('/me', authenticateUser, async (req: AuthRequest, res: Response) => {
  const user = await db.queryOne(`
    SELECT u.id, u.phone, u.name, u.wallet_balance, u.status, u.created_at,
           b.account_holder, b.account_number, b.ifsc_code, b.bank_name, b.upi_id
    FROM users u
    LEFT JOIN user_bank_details b ON u.id = b.user_id
    WHERE u.id = ?
  `, [req.user!.id]) as any;

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      wallet_balance: Number(user.wallet_balance),
      created_at: user.created_at,
      bankDetails: {
        account_holder: user.account_holder || '',
        account_number: user.account_number || '',
        ifsc_code: user.ifsc_code || '',
        bank_name: user.bank_name || '',
        upi_id: user.upi_id || ''
      }
    }
  });
});

// Save Profile (Update 4-digit Password and/or Name)
router.post('/save-profile', authenticateUser, async (req: AuthRequest, res: Response) => {
  const { name, password } = req.body;
  const updates: string[] = [];
  const params: any[] = [];

  if (name && name.trim()) {
    updates.push('name = ?');
    params.push(name.trim());
  }
  if (password && password.trim()) {
    if (password.trim().length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 digits.' });
    }
    const newHash = bcrypt.hashSync(password.trim(), 10);
    updates.push('password_hash = ?');
    params.push(newHash);
  }

  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'No fields provided to update.' });
  }

  params.push(req.user!.id);
  await db.execute(`UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, params);

  return res.json({ success: true, message: 'Profile updated successfully!' });
});

// Update Bank Details
router.post('/bank-details', authenticateUser, async (req: AuthRequest, res: Response) => {
  const { account_holder, account_number, ifsc_code, bank_name, upi_id } = req.body;
  const userId = req.user!.id;

  const existing = await db.queryOne('SELECT id FROM user_bank_details WHERE user_id = ?', [userId]);

  if (existing) {
    await db.execute(`
      UPDATE user_bank_details
      SET account_holder = ?, account_number = ?, ifsc_code = ?, bank_name = ?, upi_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [account_holder || '', account_number || '', ifsc_code || '', bank_name || '', upi_id || '', userId]);
  } else {
    await db.execute(`
      INSERT INTO user_bank_details (user_id, account_holder, account_number, ifsc_code, bank_name, upi_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, account_holder || '', account_number || '', ifsc_code || '', bank_name || '', upi_id || '']);
  }

  return res.json({ success: true, message: 'Bank and UPI details updated successfully.' });
});

// Update Profile Name
router.post('/update-profile', authenticateUser, async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
  }

  await db.execute('UPDATE users SET name = ? WHERE id = ?', [name.trim(), req.user!.id]);
  return res.json({ success: true, message: 'Profile name updated successfully.', name: name.trim() });
});

// Change Password
router.post('/change-password', authenticateUser, async (req: AuthRequest, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Old and new passwords are required.' });
  }
  if (newPassword.length < 4) {
    return res.status(400).json({ success: false, message: 'New password must be at least 4 characters long.' });
  }

  const user = await db.queryOne('SELECT id, password_hash FROM users WHERE id = ?', [req.user!.id]) as any;
  if (!user || !bcrypt.compareSync(oldPassword, user.password_hash)) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  }

  const newHash = bcrypt.hashSync(newPassword, 10);
  await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user!.id]);
  return res.json({ success: true, message: 'Password changed successfully.' });
});

export default router;
