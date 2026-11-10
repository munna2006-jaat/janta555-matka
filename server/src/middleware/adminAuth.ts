import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { CONFIG } from '../config';
import db from '../db/database';

export interface AdminRequest extends Request {
  admin?: {
    id: number;
    username: string;
    role: string;
    tokenHash?: string;
    sessionId?: number;
  };
}

export async function authenticateAdmin(req: AdminRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Admin authentication required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, CONFIG.ADMIN_JWT_SECRET) as { id: number; username: string; role: string };
    const admin = await db.queryOne('SELECT id, username, role FROM admins WHERE id = ?', [decoded.id]) as any;

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin not found.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Check if session exists and is active (not revoked)
    try {
      const session = await db.queryOne(
        'SELECT id, is_revoked FROM admin_sessions WHERE token_hash = ?',
        [tokenHash]
      ) as any;

      if (!session || session.is_revoked) {
        return res.status(401).json({
          success: false,
          message: 'Your admin session has expired or was terminated. Please log in again.'
        });
      }

      // Update last_active timestamp
      db.execute('UPDATE admin_sessions SET last_active = CURRENT_TIMESTAMP WHERE id = ?', [session.id]).catch(() => {});

      req.admin = {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        tokenHash,
        sessionId: session?.id
      };
    } catch (e) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin session or session error.'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin session token.' });
  }
}
