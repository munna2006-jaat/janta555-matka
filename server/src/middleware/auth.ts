import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../config';
import db from '../db/database';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    phone: string;
    name: string;
    wallet_balance: number;
  };
}

export async function authenticateUser(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as { id: number; phone: string };
    const user = await db.queryOne('SELECT id, phone, name, wallet_balance, status FROM users WHERE id = ?', [decoded.id]) as any;

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    if (user.status === 'BLOCKED') {
      return res.status(403).json({ success: false, message: 'Your account is suspended. Please contact support.' });
    }

    req.user = {
      id: user.id,
      phone: user.phone,
      name: user.name,
      wallet_balance: user.wallet_balance
    };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
}
