import https from 'https';
import db from '../db/database';
import { CONFIG } from '../config';

export interface SmsSendResult {
  success: boolean;
  message: string;
  alreadyRegistered?: boolean;
  rateLimited?: boolean;
}

/**
 * Get active SMS settings from DB or Config
 */
export async function getSmsSettings(): Promise<{ apiKey: string; enabled: boolean }> {
  try {
    const keyRow = await db.queryOne('SELECT value FROM system_settings WHERE key = ?', ['sms_api_key']);
    const enabledRow = await db.queryOne('SELECT value FROM system_settings WHERE key = ?', ['sms_otp_enabled']);

    const apiKey = (keyRow?.value && keyRow.value.trim().length > 0)
      ? keyRow.value.trim()
      : CONFIG.RENFLAIR_API_KEY;

    const enabled = enabledRow ? enabledRow.value.toLowerCase() === 'true' : true;

    return { apiKey, enabled };
  } catch {
    return { apiKey: CONFIG.RENFLAIR_API_KEY, enabled: true };
  }
}

/**
 * Send SMS using Renflair SMS Gateway
 * API Doc: https://sms.renflair.in/V1.php?API={API}&PHONE={PHONE}&OTP={OTP}
 */
export function sendRenflairOtp(phone: string, otp: string, apiKey: string): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    const url = `https://sms.renflair.in/V1.php?API=${encodeURIComponent(apiKey)}&PHONE=${encodeURIComponent(phone)}&OTP=${encodeURIComponent(otp)}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed && (parsed.status === 'SUCCESS' || parsed.status === 'success')) {
            console.log(`[SMS Service] OTP successfully delivered to ${phone} via Renflair.`);
            resolve({ success: true, message: parsed.message || 'OTP sent successfully.' });
          } else {
            console.error(`[SMS Service] Renflair returned error for ${phone}:`, parsed);
            resolve({ success: false, message: parsed.message || 'SMS Gateway returned an error.' });
          }
        } catch {
          // If response is not JSON
          if (data.toLowerCase().includes('success')) {
            resolve({ success: true, message: 'OTP sent successfully.' });
          } else {
            console.error(`[SMS Service] Non-JSON response from Renflair for ${phone}:`, data);
            resolve({ success: false, message: data || 'Failed to send SMS.' });
          }
        }
      });
    }).on('error', (err) => {
      console.error(`[SMS Service] HTTPS error sending OTP to ${phone}:`, err.message);
      resolve({ success: false, message: 'Could not connect to SMS Gateway.' });
    });
  });
}

/**
 * Generate 4-digit OTP and send to user for registration
 * Enforces:
 * 1. Phone number is not already registered ("ek number se baar baar register na kar paaye")
 * 2. 45-second cooldown between OTP sends
 * 3. Max 6 OTP requests per hour per phone
 */
export async function createAndSendRegistrationOtp(rawPhone: string): Promise<SmsSendResult> {
  const cleanPhone = (rawPhone || '').toString().trim().replace(/[^0-9]/g, '');

  if (cleanPhone.length !== 10) {
    return { success: false, message: 'Kripya 10-digit ka valid mobile number dalein.' };
  }

  // 1. Strict duplicate check: If phone already exists, reject immediately
  const existingUser = await db.queryOne('SELECT id FROM users WHERE phone = ?', [cleanPhone]);
  if (existingUser) {
    return {
      success: false,
      alreadyRegistered: true,
      message: 'Yeh mobile number pehle se registered hai! Kripya Sign In karein.'
    };
  }

  // 2. Cooldown check: Min 45 seconds between OTP requests
  const recentOtp = await db.queryOne(`
    SELECT id, created_at 
    FROM otp_verifications 
    WHERE phone = ? AND type = 'REGISTER' 
    ORDER BY id DESC LIMIT 1
  `, [cleanPhone]);

  if (recentOtp && recentOtp.created_at) {
    const lastTime = new Date(recentOtp.created_at).getTime();
    const diffMs = Date.now() - lastTime;
    if (diffMs < 45000) {
      const waitSec = Math.ceil((45000 - diffMs) / 1000);
      return {
        success: false,
        rateLimited: true,
        message: `Kripya ${waitSec} second intezar karein naya OTP mangwane se pehle.`
      };
    }
  }

  // 3. Hourly rate limit check (max 6 per hour)
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const hourlyCountRow = await db.queryOne(`
    SELECT COUNT(*) as cnt 
    FROM otp_verifications 
    WHERE phone = ? AND created_at > ?
  `, [cleanPhone, oneHourAgo]);

  if (hourlyCountRow && Number(hourlyCountRow.cnt) >= 6) {
    return {
      success: false,
      message: 'Is mobile number par OTP limit exceed ho chuki hai. Kripya 1 ghante baad try karein.'
    };
  }

  // 4. Generate random 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes validity

  // 5. Store OTP record in database
  await db.execute(`
    INSERT INTO otp_verifications (phone, otp, type, expires_at, is_verified, attempts)
    VALUES (?, ?, 'REGISTER', ?, 0, 0)
  `, [cleanPhone, otp, expiresAt]);

  console.log(`[SMS Service] Generated OTP for ${cleanPhone}: ${otp} (Expires at: ${expiresAt})`);

  // 6. Send SMS via Renflair
  const { apiKey, enabled } = await getSmsSettings();

  if (!enabled) {
    console.log('[SMS Service] SMS OTP is currently disabled in system settings. Auto-approving for dev/test.');
    return {
      success: true,
      message: 'OTP sent (Dev mode: OTP ' + otp + ')'
    };
  }

  const sendResult = await sendRenflairOtp(cleanPhone, otp, apiKey);

  if (!sendResult.success) {
    return {
      success: false,
      message: sendResult.message || 'SMS bhejne me dikkat aayi. Kripya thodi der baad prayas karein.'
    };
  }

  return {
    success: true,
    message: 'OTP aapke mobile number par bhej diya gaya hai!'
  };
}

/**
 * Verify submitted OTP for registration
 */
export async function verifyRegistrationOtp(rawPhone: string, enteredOtp: string): Promise<{ valid: boolean; message?: string }> {
  const cleanPhone = (rawPhone || '').toString().trim().replace(/[^0-9]/g, '');
  const cleanOtp = (enteredOtp || '').toString().trim();

  if (cleanPhone.length !== 10) {
    return { valid: false, message: 'Invalid phone number.' };
  }

  if (cleanOtp.length !== 4) {
    return { valid: false, message: 'Kripya 4-digit ka OTP code dalein.' };
  }

  // Double-check user doesn't already exist
  const existingUser = await db.queryOne('SELECT id FROM users WHERE phone = ?', [cleanPhone]);
  if (existingUser) {
    return { valid: false, message: 'Yeh mobile number pehle se registered hai! Kripya Sign In karein.' };
  }

  // Fetch the latest unverified OTP
  const record = await db.queryOne(`
    SELECT id, otp, expires_at, attempts, is_verified
    FROM otp_verifications
    WHERE phone = ? AND type = 'REGISTER' AND is_verified = 0
    ORDER BY id DESC LIMIT 1
  `, [cleanPhone]);

  if (!record) {
    return { valid: false, message: 'Koi active OTP nahi mila. Kripya pehle "GET OTP" par click karein.' };
  }

  // Check attempts
  if (record.attempts >= 5) {
    return { valid: false, message: 'Bahut zyada galat attempts ho chuke hain. Kripya naya OTP mangwayein.' };
  }

  // Check expiry
  const now = new Date().getTime();
  const expTime = new Date(record.expires_at).getTime();
  if (now > expTime) {
    return { valid: false, message: 'OTP expire ho chuka hai. Kripya naya OTP mangwayein.' };
  }

  // Verify code
  if (record.otp !== cleanOtp) {
    await db.execute('UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = ?', [record.id]);
    const remaining = 5 - (record.attempts + 1);
    return {
      valid: false,
      message: `Galat OTP code hai. Kripya sahi OTP dalein (${remaining} attempts bache hain).`
    };
  }

  // Mark verified
  await db.execute('UPDATE otp_verifications SET is_verified = 1 WHERE id = ?', [record.id]);
  return { valid: true };
}
