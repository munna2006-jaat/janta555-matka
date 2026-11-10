import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 5055,
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'janta555_super_secure_jwt_secret_key_2026',
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET || 'janta555_master_jwt_secret_key_2026',
  DB_PATH: process.env.DB_PATH || path.resolve(process.cwd(), 'janta555_production.db'),
  DEFAULT_ADMIN: {
    username: process.env.ADMIN_USER || 'AdminJanta555',
    password: process.env.ADMIN_PASSWORD || 'Janta555@2026',
    role: 'MASTER'
  },
  RENFLAIR_API_KEY: process.env.RENFLAIR_API_KEY || '',
  DEFAULT_PAYMENT_CONFIG: {
    upi_id: 'janta555official@upi',
    upi_name: 'JANTA555 ENTERPRISE',
    min_deposit: 100,
    max_deposit: 100000,
    min_withdrawal: 500,
    max_withdrawal: 50000,
    withdrawal_start_time: '10:00 AM',
    withdrawal_end_time: '08:00 PM',
    whatsapp_number: '+919876543210',
    support_phone: '+919876543210',
    notice_text: 'WELCOME TO JANTA555 • FAST DEPOSIT & INSTANT WITHDRAWAL 24x7 • 100% TRUSTED MATKA PLATFORM • PLAY RESPONSIBLY',
    meta_pixel_id: process.env.META_PIXEL_ID || '2066705063996932'
  }
};
