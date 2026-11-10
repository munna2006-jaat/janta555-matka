import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { CONFIG } from '../config';
import genuineHistoricalResults from './genuine_historical_results.json';

// Determine if we are connected to PostgreSQL (e.g. Voroa, Render, Supabase) or local SQLite (via WebAssembly sql.js)
export const isPostgres = Boolean(CONFIG.DATABASE_URL && CONFIG.DATABASE_URL.trim().length > 0);

let pgPool: Pool | null = null;
let sqlJsDb: any = null;
let sqlJsInitPromise: Promise<any> | null = null;

if (isPostgres) {
  console.log('[Database] Connecting to PostgreSQL database (Voroa / Cloud)...');
  pgPool = new Pool({
    connectionString: CONFIG.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  console.log('[Database] Using pure WebAssembly SQLite (sql.js) at:', CONFIG.DB_PATH);
}

// Ensure WebAssembly SQLite database is loaded cleanly without any C++ native bindings
async function getSqlJsDb(): Promise<any> {
  if (sqlJsDb) return sqlJsDb;
  if (!sqlJsInitPromise) {
    sqlJsInitPromise = (async () => {
      const initSqlJs = require('sql.js');
      let locateFile: (() => string) | undefined = undefined;
      try {
        const wasmPath = require.resolve('sql.js/dist/sql-wasm.wasm');
        locateFile = () => wasmPath;
      } catch {
        // use default locator
      }
      const SQL = await initSqlJs(locateFile ? { locateFile } : undefined);
      
      let filebuffer: Buffer | undefined;
      if (fs.existsSync(CONFIG.DB_PATH)) {
        try {
          filebuffer = fs.readFileSync(CONFIG.DB_PATH);
          console.log('[Database] Loaded existing database from disk:', CONFIG.DB_PATH, `(${filebuffer.length} bytes)`);
        } catch (err: any) {
          console.warn('[Database] Could not read existing DB file, creating fresh in-memory database:', err?.message || err);
          filebuffer = undefined;
        }
      }
      sqlJsDb = new SQL.Database(filebuffer);
      return sqlJsDb;
    })();
  }
  return sqlJsInitPromise;
}

let persistTimer: NodeJS.Timeout | null = null;
let isDirty = false;

// Persist SQLite WebAssembly database to disk safely
export function persistSqlJsToDisk() {
  if (!sqlJsDb || !isDirty) return;
  try {
    const data = sqlJsDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(CONFIG.DB_PATH, buffer);
    isDirty = false;
  } catch (err: any) {
    // Non-critical, ignore disk write failure in read-only sandbox
  }
}

// Debounce disk writes so heavy batch inserts never block the Node.js event loop
export function schedulePersistSqlJsToDisk(immediate = false) {
  isDirty = true;
  if (immediate) {
    if (persistTimer) {
      clearTimeout(persistTimer);
      persistTimer = null;
    }
    persistSqlJsToDisk();
    return;
  }
  if (!persistTimer) {
    persistTimer = setTimeout(() => {
      persistTimer = null;
      persistSqlJsToDisk();
    }, 2000);
  }
}

// Flush on process exit or termination signals
process.on('beforeExit', () => persistSqlJsToDisk());
process.on('SIGINT', () => {
  persistSqlJsToDisk();
  process.exit(0);
});
process.on('SIGTERM', () => {
  persistSqlJsToDisk();
  process.exit(0);
});

// Convert SQLite syntax (?) to PostgreSQL syntax ($1, $2) and handle ON CONFLICT
function transformSqlForPg(sql: string): string {
  let transformed = sql;

  // Replace INSERT OR IGNORE with INSERT ... ON CONFLICT DO NOTHING
  if (/INSERT\s+OR\s+IGNORE\s+INTO/i.test(transformed)) {
    transformed = transformed.replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, 'INSERT INTO');
    if (!/ON\s+CONFLICT/i.test(transformed)) {
      transformed += ' ON CONFLICT DO NOTHING';
    }
  }

  // If it's an INSERT and doesn't have RETURNING, append RETURNING id
  // BUT do not append for tables that do not have an 'id' column (e.g. system_settings)
  const isInsert = /^\s*INSERT\s+INTO/i.test(transformed);
  const isNoIdTable = /INSERT\s+INTO\s+system_settings/i.test(transformed);
  if (isInsert && !isNoIdTable && !/RETURNING/i.test(transformed)) {
    transformed += ' RETURNING id';
  }

  // Replace '?' with '$1, $2, ...'
  let paramIndex = 1;
  transformed = transformed.replace(/\?/g, () => `$${paramIndex++}`);

  return transformed;
}

// Unified Database Interface
export const db = {
  isPostgres,

  async queryAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (isPostgres && pgPool) {
      const pgSql = transformSqlForPg(sql);
      const res = await pgPool.query(pgSql, params);
      return res.rows as T[];
    } else {
      const sdb = await getSqlJsDb();
      const stmt = sdb.prepare(sql);
      stmt.bind(params);
      const rows: T[] = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject() as T);
      }
      stmt.free();
      return rows;
    }
  },

  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    if (isPostgres && pgPool) {
      const pgSql = transformSqlForPg(sql);
      const res = await pgPool.query(pgSql, params);
      return (res.rows[0] as T) || null;
    } else {
      const sdb = await getSqlJsDb();
      const stmt = sdb.prepare(sql);
      stmt.bind(params);
      let row: T | null = null;
      if (stmt.step()) {
        row = stmt.getAsObject() as T;
      }
      stmt.free();
      return row;
    }
  },

  async execute(sql: string, params: any[] = []): Promise<{ lastInsertRowid: number; changes: number }> {
    if (isPostgres && pgPool) {
      let pgSql = transformSqlForPg(sql);
      try {
        const res = await pgPool.query(pgSql, params);
        const lastInsertRowid = res.rows[0]?.id ? Number(res.rows[0].id) : 0;
        return {
          lastInsertRowid,
          changes: res.rowCount || 0
        };
      } catch (err: any) {
        // If RETURNING id failed because column "id" does not exist (code 42703), safely retry without RETURNING id
        if (err.code === '42703' && pgSql.includes('RETURNING id')) {
          pgSql = pgSql.replace(/\s+RETURNING\s+id/i, '');
          const res = await pgPool.query(pgSql, params);
          return {
            lastInsertRowid: 0,
            changes: res.rowCount || 0
          };
        }
        throw err;
      }
    } else {
      const sdb = await getSqlJsDb();
      sdb.run(sql, params);
      const rowidRes = sdb.exec('SELECT last_insert_rowid() AS id, changes() AS changes');
      const lastInsertRowid = rowidRes[0]?.values[0]?.[0] ? Number(rowidRes[0].values[0][0]) : 0;
      const changes = rowidRes[0]?.values[0]?.[1] ? Number(rowidRes[0].values[0][1]) : 0;
      schedulePersistSqlJsToDisk();
      return { lastInsertRowid, changes };
    }
  },

  async exec(sql: string): Promise<void> {
    if (isPostgres && pgPool) {
      await pgPool.query(sql);
    } else {
      const sdb = await getSqlJsDb();
      sdb.exec(sql);
      schedulePersistSqlJsToDisk();
    }
  },

  // Prepared statement compatibility layer
  prepare(sql: string) {
    return {
      all: (...args: any[]) => {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        return db.queryAll(sql, params);
      },
      get: (...args: any[]) => {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        return db.queryOne(sql, params);
      },
      run: (...args: any[]) => {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        return db.execute(sql, params);
      }
    };
  }
};

export async function initDatabase() {
  console.log(`[Database] Initializing schema (${isPostgres ? 'PostgreSQL' : 'SQLite'})...`);

  if (isPostgres) {
    // PostgreSQL Schema
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        password_hash TEXT NOT NULL,
        wallet_balance NUMERIC(12, 2) DEFAULT 0.00,
        status VARCHAR(20) DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_bank_details (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        account_holder TEXT,
        account_number TEXT,
        ifsc_code TEXT,
        bank_name TEXT,
        upi_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'MASTER',
        full_name VARCHAR(100),
        permissions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS markets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        hindi_name VARCHAR(100),
        open_time VARCHAR(20) NOT NULL,
        close_time VARCHAR(20) NOT NULL,
        open_time_24 VARCHAR(10) NOT NULL,
        close_time_24 VARCHAR(10) NOT NULL,
        days_active VARCHAR(20) DEFAULT 'ALL',
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        result_mode VARCHAR(20) DEFAULT 'MANUAL',
        auto_algorithm VARCHAR(30) DEFAULT 'MIN_LIABILITY',
        scheduled_open_panna VARCHAR(10),
        scheduled_close_panna VARCHAR(10),
        auto_draw_mode VARCHAR(20) DEFAULT 'OFF',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS market_results (
        id SERIAL PRIMARY KEY,
        market_id INTEGER NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
        date VARCHAR(20) NOT NULL,
        open_panna VARCHAR(10),
        open_digit VARCHAR(5),
        close_digit VARCHAR(5),
        close_panna VARCHAR(10),
        jodi VARCHAR(10),
        status VARCHAR(20) DEFAULT 'SCHEDULED',
        is_manual_override INTEGER DEFAULT 0,
        declared_at TIMESTAMP,
        UNIQUE(market_id, date)
      );

      CREATE TABLE IF NOT EXISTS game_types (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        payout_rate NUMERIC(10, 2) NOT NULL,
        min_bet NUMERIC(10, 2) DEFAULT 10,
        max_bet NUMERIC(10, 2) DEFAULT 50000,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS bets (
        id SERIAL PRIMARY KEY,
        ticket_id VARCHAR(50) UNIQUE NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        market_id INTEGER NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
        game_type VARCHAR(50) NOT NULL REFERENCES game_types(id),
        session VARCHAR(10) NOT NULL,
        bet_number VARCHAR(20) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        payout_rate NUMERIC(10, 2) NOT NULL,
        potential_win NUMERIC(12, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        won_amount NUMERIC(12, 2) DEFAULT 0.00,
        bet_date VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS deposit_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount NUMERIC(12, 2) NOT NULL,
        payment_method VARCHAR(20) DEFAULT 'UPI',
        utr_number VARCHAR(50) NOT NULL,
        receipt_url TEXT,
        status VARCHAR(20) DEFAULT 'PENDING',
        admin_notes TEXT,
        processed_by INTEGER REFERENCES admins(id),
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS withdrawal_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount NUMERIC(12, 2) NOT NULL,
        payout_mode VARCHAR(10) NOT NULL,
        account_holder TEXT,
        account_number TEXT,
        ifsc_code TEXT,
        bank_name TEXT,
        upi_id TEXT,
        status VARCHAR(20) DEFAULT 'PENDING',
        transaction_reference TEXT,
        admin_notes TEXT,
        processed_by INTEGER REFERENCES admins(id),
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        previous_balance NUMERIC(12, 2) NOT NULL,
        new_balance NUMERIC(12, 2) NOT NULL,
        reference_id TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(50) PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS recent_winners (
        id SERIAL PRIMARY KEY,
        user_display_name VARCHAR(100) NOT NULL,
        game_type_name VARCHAR(100) NOT NULL,
        market_name VARCHAR(100) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER REFERENCES admins(id),
        action VARCHAR(100) NOT NULL,
        details TEXT,
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS otp_verifications (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        type VARCHAR(20) DEFAULT 'REGISTER',
        expires_at TIMESTAMP NOT NULL,
        is_verified INTEGER DEFAULT 0,
        attempts INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin_sessions (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        device_name TEXT,
        device_type VARCHAR(20) DEFAULT 'phone',
        ip_address VARCHAR(50),
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_revoked INTEGER DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
      CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone);
      CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
      CREATE INDEX IF NOT EXISTS idx_bets_market_date ON bets(market_id, bet_date);
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token_hash);
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin ON admin_sessions(admin_id);
      CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);
      CREATE INDEX IF NOT EXISTS idx_market_results_date ON market_results(date);
    `);
  } else {
    // SQLite Schema
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        wallet_balance REAL DEFAULT 0.00,
        status TEXT DEFAULT 'ACTIVE',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_bank_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        account_holder TEXT,
        account_number TEXT,
        ifsc_code TEXT,
        bank_name TEXT,
        upi_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'MASTER',
        full_name TEXT,
        permissions TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS markets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        hindi_name TEXT,
        open_time TEXT NOT NULL,
        close_time TEXT NOT NULL,
        open_time_24 TEXT NOT NULL,
        close_time_24 TEXT NOT NULL,
        days_active TEXT DEFAULT 'ALL',
        is_active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        result_mode TEXT DEFAULT 'MANUAL',
        auto_algorithm TEXT DEFAULT 'MIN_LIABILITY',
        scheduled_open_panna TEXT,
        scheduled_close_panna TEXT,
        auto_draw_mode TEXT DEFAULT 'OFF',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS market_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        market_id INTEGER NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        open_panna TEXT,
        open_digit TEXT,
        close_digit TEXT,
        close_panna TEXT,
        jodi TEXT,
        status TEXT DEFAULT 'SCHEDULED',
        is_manual_override INTEGER DEFAULT 0,
        declared_at DATETIME,
        UNIQUE(market_id, date)
      );

      CREATE TABLE IF NOT EXISTS game_types (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        payout_rate REAL NOT NULL,
        min_bet REAL DEFAULT 10,
        max_bet REAL DEFAULT 50000,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS bets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        market_id INTEGER NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
        game_type TEXT NOT NULL REFERENCES game_types(id),
        session TEXT NOT NULL,
        bet_number TEXT NOT NULL,
        amount REAL NOT NULL,
        payout_rate REAL NOT NULL,
        potential_win REAL NOT NULL,
        status TEXT DEFAULT 'PENDING',
        won_amount REAL DEFAULT 0.00,
        bet_date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS deposit_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount REAL NOT NULL,
        payment_method TEXT DEFAULT 'UPI',
        utr_number TEXT NOT NULL,
        receipt_url TEXT,
        status TEXT DEFAULT 'PENDING',
        admin_notes TEXT,
        processed_by INTEGER REFERENCES admins(id),
        processed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS withdrawal_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount REAL NOT NULL,
        payout_mode TEXT NOT NULL,
        account_holder TEXT,
        account_number TEXT,
        ifsc_code TEXT,
        bank_name TEXT,
        upi_id TEXT,
        status TEXT DEFAULT 'PENDING',
        transaction_reference TEXT,
        admin_notes TEXT,
        processed_by INTEGER REFERENCES admins(id),
        processed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        previous_balance REAL NOT NULL,
        new_balance REAL NOT NULL,
        reference_id TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS recent_winners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_display_name TEXT NOT NULL,
        game_type_name TEXT NOT NULL,
        market_name TEXT NOT NULL,
        amount REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER REFERENCES admins(id),
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS otp_verifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT NOT NULL,
        otp TEXT NOT NULL,
        type TEXT DEFAULT 'REGISTER',
        expires_at DATETIME NOT NULL,
        is_verified INTEGER DEFAULT 0,
        attempts INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin_sessions (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        device_name TEXT,
        device_type VARCHAR(20) DEFAULT 'phone',
        ip_address VARCHAR(50),
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_revoked INTEGER DEFAULT 0
      );

      CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
      CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_verifications(phone);
      CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
      CREATE INDEX IF NOT EXISTS idx_bets_market_date ON bets(market_id, bet_date);
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token_hash);
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin ON admin_sessions(admin_id);
      CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);
      CREATE INDEX IF NOT EXISTS idx_market_results_date ON market_results(date);
    `);
  }

  await seedInitialData();
  console.log('[Database] Schema and initial data verified successfully.');
}

async function seedInitialData() {
  // Ensure is_manual_override column exists in market_results
  try {
    await db.exec('ALTER TABLE market_results ADD COLUMN is_manual_override INTEGER DEFAULT 0');
  } catch {}

  // 1. Seed Default Admin if not exists
  const adminExists = await db.queryOne('SELECT id FROM admins WHERE username = ?', [CONFIG.DEFAULT_ADMIN.username]);
  if (!adminExists) {
    const hash = bcrypt.hashSync(CONFIG.DEFAULT_ADMIN.password, 10);
    await db.execute(
      'INSERT INTO admins (username, password_hash, role) VALUES (?, ?, ?)',
      [CONFIG.DEFAULT_ADMIN.username, hash, CONFIG.DEFAULT_ADMIN.role]
    );
    console.log(`[Database Seed] Default Admin created: ${CONFIG.DEFAULT_ADMIN.username}`);
  }

  // 2. Seed Game Types and Standard Market Rates (1:9.5, 1:95, etc.)
  const gameTypes = [
    { id: 'single_digit', name: 'Single Digit', payout_rate: 9.5, min_bet: 10, max_bet: 50000, description: 'Single Ank (0 to 9)' },
    { id: 'jodi_digit', name: 'Jodi Digit', payout_rate: 95.0, min_bet: 10, max_bet: 50000, description: 'Jodi number (00 to 99)' },
    { id: 'single_panna', name: 'Single Pana', payout_rate: 150.0, min_bet: 10, max_bet: 25000, description: 'Sum of 3 distinct digits' },
    { id: 'double_panna', name: 'Double Pana', payout_rate: 300.0, min_bet: 10, max_bet: 25000, description: 'Double digits panel' },
    { id: 'triple_panna', name: 'Triple Pana', payout_rate: 900.0, min_bet: 10, max_bet: 10000, description: 'Triple digits (000 to 999)' },
    { id: 'sp_motor', name: 'SP Motor', payout_rate: 150.0, min_bet: 10, max_bet: 25000, description: 'Single Panna Motor permutations' },
    { id: 'dp_motor', name: 'DP Motor', payout_rate: 300.0, min_bet: 10, max_bet: 25000, description: 'Double Panna Motor permutations' },
    { id: 'half_sangam', name: 'Half Sangam', payout_rate: 1400.0, min_bet: 10, max_bet: 5000, description: 'Panna + Ank combination' },
    { id: 'full_sangam', name: 'Full Sangam', payout_rate: 10000.0, min_bet: 10, max_bet: 2000, description: 'Open Panna + Close Panna combination' },
  ];

  for (const gt of gameTypes) {
    const existing = await db.queryOne('SELECT id FROM game_types WHERE id = ?', [gt.id]);
    if (!existing) {
      await db.execute(
        'INSERT INTO game_types (id, name, payout_rate, min_bet, max_bet, description) VALUES (?, ?, ?, ?, ?, ?)',
        [gt.id, gt.name, gt.payout_rate, gt.min_bet, gt.max_bet, gt.description]
      );
    }
  }

  // 3. Seed Standard Popular Indian Matka Markets matching screenshots (28 markets)
  const markets = [
    { name: 'KASHI KING', hindi_name: 'काशी किंग', open_time: '09:25 AM', close_time: '10:25 AM', open_time_24: '09:25', close_time_24: '10:25', sort_order: 1 },
    { name: 'MILAN MORNING', hindi_name: 'मिलान मॉर्निंग', open_time: '10:10 AM', close_time: '11:10 AM', open_time_24: '10:10', close_time_24: '11:10', sort_order: 2 },
    { name: 'KARNATAKA DAY', hindi_name: 'कर्नाटक डे', open_time: '10:10 AM', close_time: '11:10 AM', open_time_24: '10:10', close_time_24: '11:10', sort_order: 3 },
    { name: 'MADHUR MORNING', hindi_name: 'मधुर मॉर्निंग', open_time: '11:25 AM', close_time: '12:25 PM', open_time_24: '11:25', close_time_24: '12:25', sort_order: 4 },
    { name: 'SRIDEVI', hindi_name: 'श्रीदेवी', open_time: '11:30 AM', close_time: '12:30 PM', open_time_24: '11:30', close_time_24: '12:30', sort_order: 5 },
    { name: 'KALYAN MORNING', hindi_name: 'कल्याण मॉर्निंग', open_time: '11:35 AM', close_time: '12:35 PM', open_time_24: '11:35', close_time_24: '12:35', sort_order: 6 },
    { name: 'DAIMOND BAZAR', hindi_name: 'डायमंड बाज़ार', open_time: '12:25 PM', close_time: '01:25 PM', open_time_24: '12:25', close_time_24: '13:25', sort_order: 7 },
    { name: 'TIME BAZAR', hindi_name: 'टाइम बाज़ार', open_time: '01:00 PM', close_time: '02:00 PM', open_time_24: '13:00', close_time_24: '14:00', sort_order: 8 },
    { name: 'MADHUR DAY', hindi_name: 'मधुर डे', open_time: '01:20 PM', close_time: '02:20 PM', open_time_24: '13:20', close_time_24: '14:20', sort_order: 9 },
    { name: 'MILAN DAY', hindi_name: 'मिलान डे', open_time: '03:00 PM', close_time: '05:00 PM', open_time_24: '15:00', close_time_24: '17:00', sort_order: 10 },
    { name: 'RAJDHANI DAY', hindi_name: 'राजधानी डे', open_time: '03:05 PM', close_time: '05:10 PM', open_time_24: '15:05', close_time_24: '17:10', sort_order: 11 },
    { name: 'SUPREME DAY', hindi_name: 'सुप्रीम डे', open_time: '03:30 PM', close_time: '05:30 PM', open_time_24: '15:30', close_time_24: '17:30', sort_order: 12 },
    { name: 'KALYAN', hindi_name: 'कल्याण', open_time: '04:00 PM', close_time: '06:00 PM', open_time_24: '16:00', close_time_24: '18:00', sort_order: 13 },
    { name: 'KARNATAKA NIGHT', hindi_name: 'कर्नाटक नाईट', open_time: '06:40 PM', close_time: '07:40 PM', open_time_24: '18:40', close_time_24: '19:40', sort_order: 14 },
    { name: 'SRIDEVI NIGHT', hindi_name: 'श्रीदेवी नाईट', open_time: '07:00 PM', close_time: '08:00 PM', open_time_24: '19:00', close_time_24: '20:00', sort_order: 15 },
    { name: 'EKKA BAZAR', hindi_name: 'एक्का बाज़ार', open_time: '07:15 PM', close_time: '08:15 PM', open_time_24: '19:15', close_time_24: '20:15', sort_order: 16 },
    { name: 'MADHUR NIGHT', hindi_name: 'मधुर नाईट', open_time: '08:30 PM', close_time: '10:30 PM', open_time_24: '20:30', close_time_24: '22:30', sort_order: 17 },
    { name: 'SUPREME NIGHT', hindi_name: 'सुप्रीम नाईट', open_time: '08:35 PM', close_time: '10:35 PM', open_time_24: '20:35', close_time_24: '22:35', sort_order: 18 },
    { name: 'MILAN NIGHT', hindi_name: 'मिलान नाईट', open_time: '09:00 PM', close_time: '11:00 PM', open_time_24: '21:00', close_time_24: '23:00', sort_order: 19 },
    { name: 'KALYAN NIGHT', hindi_name: 'कल्याण नाईट', open_time: '09:25 PM', close_time: '11:25 PM', open_time_24: '21:25', close_time_24: '23:25', sort_order: 20 },
    { name: 'RAJDHANI NIGHT', hindi_name: 'राजधानी नाईट', open_time: '09:30 PM', close_time: '11:35 PM', open_time_24: '21:30', close_time_24: '23:35', sort_order: 21 },
    { name: 'MAIN BAZAR', hindi_name: 'मेन बाज़ार', open_time: '09:40 PM', close_time: '12:05 AM', open_time_24: '21:40', close_time_24: '00:05', sort_order: 22 },
    { name: 'DELHI BAZAR', hindi_name: 'दिल्ली बाज़ार', open_time: '03:15 PM', close_time: '03:00 PM', open_time_24: '15:15', close_time_24: '15:00', sort_order: 23 },
    { name: 'SHREE GANESH', hindi_name: 'श्री गणेश', open_time: '04:45 PM', close_time: '04:30 PM', open_time_24: '16:45', close_time_24: '16:30', sort_order: 24 },
    { name: 'FARIDABAD', hindi_name: 'फरीदाबाद', open_time: '06:15 PM', close_time: '06:00 PM', open_time_24: '18:15', close_time_24: '18:00', sort_order: 25 },
    { name: 'GAZIABAD', hindi_name: 'गाजियाबाद', open_time: '09:45 PM', close_time: '09:30 PM', open_time_24: '21:45', close_time_24: '21:30', sort_order: 26 },
    { name: 'GALI', hindi_name: 'गली', open_time: '11:45 PM', close_time: '11:30 PM', open_time_24: '23:45', close_time_24: '23:30', sort_order: 27 },
    { name: 'DESAWAR', hindi_name: 'देसावर', open_time: '05:15 AM', close_time: '04:30 AM', open_time_24: '05:15', close_time_24: '04:30', sort_order: 28 },
    { name: 'GOOD MORNING', hindi_name: 'GOOD MORNING', open_time: '10:00 AM', close_time: '11:17 AM', open_time_24: '10:00', close_time_24: '11:17', sort_order: 29 },
    { name: 'BOMBAY EXP.', hindi_name: 'BOMBAY EXP.', open_time: '12:00 PM', close_time: '01:00 PM', open_time_24: '12:00', close_time_24: '13:00', sort_order: 30 },
    { name: 'GOLDEN', hindi_name: 'GOLDEN', open_time: '02:00 PM', close_time: '03:18 PM', open_time_24: '14:00', close_time_24: '15:18', sort_order: 31 },
    { name: 'GOA GOLDEN', hindi_name: 'GOA GOLDEN', open_time: '04:00 PM', close_time: '05:00 PM', open_time_24: '16:00', close_time_24: '17:00', sort_order: 32 },
    { name: 'GOLD STAR', hindi_name: 'GOLD STAR', open_time: '07:15 PM', close_time: '08:10 PM', open_time_24: '19:15', close_time_24: '20:10', sort_order: 33 },
    { name: 'GOLDEN NIGHT', hindi_name: 'GOLDEN NIGHT', open_time: '09:00 PM', close_time: '10:30 PM', open_time_24: '21:00', close_time_24: '22:30', sort_order: 34 },
    { name: 'TARA MUMBAI DAY', hindi_name: 'TARA MUMBAI DAY', open_time: '01:30 PM', close_time: '03:00 PM', open_time_24: '13:30', close_time_24: '15:00', sort_order: 35 },
    { name: 'TARA MUMBAI NIGHT', hindi_name: 'TARA MUMBAI NIGHT', open_time: '08:30 PM', close_time: '10:30 PM', open_time_24: '20:30', close_time_24: '22:30', sort_order: 36 },
    { name: 'NIGHT TIME BAZAR', hindi_name: 'NIGHT TIME BAZAR', open_time: '08:55 PM', close_time: '10:55 PM', open_time_24: '20:55', close_time_24: '22:55', sort_order: 37 },
    { name: 'APPA BOSS', hindi_name: 'APPA BOSS', open_time: '07:35 PM', close_time: '08:35 PM', open_time_24: '19:35', close_time_24: '20:35', sort_order: 38 },
    { name: 'JHANSI BAZAR', hindi_name: 'JHANSI BAZAR', open_time: '12:00 PM', close_time: '01:00 PM', open_time_24: '12:00', close_time_24: '13:00', sort_order: 39 },
    { name: 'GOA', hindi_name: 'GOA', open_time: '06:10 PM', close_time: '06:10 PM', open_time_24: '18:10', close_time_24: '18:10', sort_order: 40 },
  ];

  // Rename KASHIKING if it exists
  await db.execute("UPDATE markets SET name = 'KASHI KING', hindi_name = 'काशी किंग' WHERE name = 'KASHIKING'");

  for (const m of markets) {
    const existing = await db.queryOne('SELECT id FROM markets WHERE name = ?', [m.name]);
    if (!existing) {
      await db.execute(
        'INSERT INTO markets (name, hindi_name, open_time, close_time, open_time_24, close_time_24, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
        [m.name, m.hindi_name, m.open_time, m.close_time, m.open_time_24, m.close_time_24, m.sort_order]
      );
    } else {
      // Preserve existing is_active setting configured by admin
      await db.execute(
        'UPDATE markets SET sort_order = ?, open_time = ?, close_time = ?, open_time_24 = ?, close_time_24 = ?, hindi_name = ? WHERE id = ?',
        [m.sort_order, m.open_time, m.close_time, m.open_time_24, m.close_time_24, m.hindi_name, existing.id]
      );
    }
  }

  // Ensure the 9 markets not available on AppaBoss are disabled as requested by admin
  await db.execute(`
    UPDATE markets SET is_active = 0
    WHERE name IN (
      'MILAN MORNING', 'KASHI KING', 'KARNATAKA DAY', 'KALYAN MORNING',
      'DAIMOND BAZAR', 'SUPREME DAY', 'KARNATAKA NIGHT', 'SUPREME NIGHT', 'EKKA BAZAR'
    )
  `);

  // Explicitly ensure all 6 Disawar markets are active
  await db.execute(`
    UPDATE markets SET is_active = 1 
    WHERE name IN ('DELHI BAZAR', 'SHREE GANESH', 'FARIDABAD', 'GAZIABAD', 'GALI', 'DESAWAR')
  `);

  // 4. Seed System Settings
  const settings = [
    { key: 'upi_id', value: CONFIG.DEFAULT_PAYMENT_CONFIG.upi_id, description: 'Admin UPI ID for deposits' },
    { key: 'upi_name', value: CONFIG.DEFAULT_PAYMENT_CONFIG.upi_name, description: 'Merchant / Payee Name' },
    { key: 'min_deposit', value: CONFIG.DEFAULT_PAYMENT_CONFIG.min_deposit.toString(), description: 'Minimum deposit amount in INR' },
    { key: 'max_deposit', value: CONFIG.DEFAULT_PAYMENT_CONFIG.max_deposit.toString(), description: 'Maximum deposit amount in INR' },
    { key: 'min_withdrawal', value: CONFIG.DEFAULT_PAYMENT_CONFIG.min_withdrawal.toString(), description: 'Minimum withdrawal amount in INR' },
    { key: 'max_withdrawal', value: CONFIG.DEFAULT_PAYMENT_CONFIG.max_withdrawal.toString(), description: 'Maximum withdrawal amount in INR' },
    { key: 'withdrawal_start_time', value: CONFIG.DEFAULT_PAYMENT_CONFIG.withdrawal_start_time, description: 'Daily withdrawal window start' },
    { key: 'withdrawal_end_time', value: CONFIG.DEFAULT_PAYMENT_CONFIG.withdrawal_end_time, description: 'Daily withdrawal window end' },
    { key: 'whatsapp_number', value: CONFIG.DEFAULT_PAYMENT_CONFIG.whatsapp_number, description: 'WhatsApp Support Number' },
    { key: 'support_phone', value: CONFIG.DEFAULT_PAYMENT_CONFIG.support_phone, description: 'Direct Call Support' },
    { key: 'notice_text', value: CONFIG.DEFAULT_PAYMENT_CONFIG.notice_text, description: 'Scrolling Notice Ticker Text' },
    { key: 'apk_download_count', value: '926', description: 'APK download counter shown on admin dashboard' },
    { key: 'sms_api_key', value: CONFIG.RENFLAIR_API_KEY, description: 'Renflair SMS Gateway API Key' },
    { key: 'sms_otp_enabled', value: 'true', description: 'Enable SMS OTP Verification on Registration (true/false)' },
    { key: 'meta_pixel_id', value: CONFIG.DEFAULT_PAYMENT_CONFIG.meta_pixel_id || '2066705063996932', description: 'Meta Facebook Pixel ID for Ads Tracking' }
  ];

  for (const s of settings) {
    const existing = await db.queryOne('SELECT key FROM system_settings WHERE key = ?', [s.key]);
    if (!existing) {
      await db.execute(
        'INSERT INTO system_settings (key, value, description) VALUES (?, ?, ?)',
        [s.key, s.value, s.description]
      );
    }
  }

  // 5. Seed some realistic recent winners for live display
  const winnerCheck = await db.queryOne('SELECT COUNT(*) as count FROM recent_winners');
  const count = winnerCheck ? Number(winnerCheck.count) : 0;
  if (count === 0) {
    const seedWinners = [
      { user_display_name: 'Mohammad A.', game_type_name: 'Jodi Digit Win', market_name: 'MILAN DAY', amount: 1000 },
      { user_display_name: 'Noor A.', game_type_name: 'Single Pana Win', market_name: 'TIME BAZAR', amount: 25000 },
      { user_display_name: 'Vikram S.', game_type_name: 'Single Digit Win', market_name: 'KALYAN', amount: 4750 },
      { user_display_name: 'Sunil K.', game_type_name: 'Double Pana Win', market_name: 'RAJDHANI DAY', amount: 15000 },
      { user_display_name: 'Rohan P.', game_type_name: 'Single Digit Win', market_name: 'MADHUR DAY', amount: 950 },
      { user_display_name: 'Deepak M.', game_type_name: 'Jodi Digit Win', market_name: 'MILAN NIGHT', amount: 9500 }
    ];
    for (const w of seedWinners) {
      await db.execute(
        'INSERT INTO recent_winners (user_display_name, game_type_name, market_name, amount) VALUES (?, ?, ?, ?)',
        [w.user_display_name, w.game_type_name, w.market_name, w.amount]
      );
    }
  }

  // 6. Seed today's market results records if not created
  const today = new Date().toISOString().split('T')[0];
  const allMarkets = await db.queryAll('SELECT id, name FROM markets');

  for (const m of allMarkets) {
    const existing = await db.queryOne('SELECT id FROM market_results WHERE market_id = ? AND date = ?', [m.id, today]);
    if (!existing) {
      if (m.name === 'MILAN MORNING') {
        await db.execute(
          'INSERT INTO market_results (market_id, date, open_panna, open_digit, close_digit, close_panna, jodi, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [m.id, today, '479', '0', '8', '369', '08', 'CLOSED']
        );
      } else if (m.name === 'KASHI KING') {
        await db.execute(
          'INSERT INTO market_results (market_id, date, open_panna, open_digit, close_digit, close_panna, jodi, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [m.id, today, '110', '2', '5', '555', '25', 'CLOSED']
        );
      } else if (m.name === 'KARNATAKA DAY') {
        await db.execute(
          'INSERT INTO market_results (market_id, date, open_panna, open_digit, close_digit, close_panna, jodi, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [m.id, today, '680', '4', '6', '349', '46', 'CLOSED']
        );
      } else if (m.name === 'MADHUR MORNING') {
        await db.execute(
          'INSERT INTO market_results (market_id, date, open_panna, open_digit, close_digit, close_panna, jodi, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [m.id, today, '149', '4', '0', '127', '40', 'CLOSED']
        );
      } else if (m.name === 'SRIDEVI') {
        await db.execute(
          'INSERT INTO market_results (market_id, date, open_panna, open_digit, close_digit, close_panna, jodi, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [m.id, today, '670', '3', '8', '260', '38', 'CLOSED']
        );
      } else if (m.name === 'KALYAN MORNING') {
        await db.execute(
          'INSERT INTO market_results (market_id, date, open_panna, open_digit, close_digit, close_panna, jodi, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [m.id, today, '457', '6', null, null, null, 'OPEN']
        );
      } else {
        await db.execute(
          'INSERT INTO market_results (market_id, date, open_panna, open_digit, close_digit, close_panna, jodi, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [m.id, today, null, null, null, null, null, 'OPEN']
        );
      }
    }
  }

  // 7. Migration: Purge old fake 2024 seeded records and ensure genuine AppaBoss records are present if not already seeded
  try {
    const countRow = await db.queryOne<{ count: string | number }>('SELECT COUNT(*) as count FROM market_results');
    const existingTotal = Number(countRow?.count || 0);
    if (existingTotal < 500) {
      console.log(`[Database] Seeding initial genuine historical records (currently only ${existingTotal} records)...`);
      const { totalInserted } = await forceSyncAllGenuineCharts();
      console.log(`[Database] forceSyncAllGenuineCharts completed: ${totalInserted} records synced across all markets!`);
    } else {
      console.log(`[Database] Historical results already populated (${existingTotal} records). Skipping startup sync.`);
    }
  } catch (err: any) {
    console.warn('[Database] Note on seeding genuine historical records:', err.message);
  }
}

export async function forceSyncAllGenuineCharts(): Promise<{ totalInserted: number; marketCounts: Record<string, number> }> {
  let totalInserted = 0;
  const marketCounts: Record<string, number> = {};

  const marketRows = await db.queryAll('SELECT id, name FROM markets');
  const marketIdMap = new Map<string, number>();
  for (const mr of marketRows) {
    marketIdMap.set(mr.name.toUpperCase().trim(), mr.id);
  }

  // Ensure fake 2024 data is cleared
  try {
    await db.execute("DELETE FROM market_results WHERE date < '2026-05-01'");
  } catch {}

  if (Array.isArray(genuineHistoricalResults) && genuineHistoricalResults.length > 0) {
    if (isPostgres) {
      await db.exec('BEGIN');
      try {
        for (const r of (genuineHistoricalResults as any[])) {
          const mId = marketIdMap.get(r.market_name.toUpperCase().trim());
          if (mId) {
            await db.execute(`
              INSERT INTO market_results (market_id, date, open_panna, open_digit, close_digit, close_panna, jodi, status, declared_at, is_manual_override)
              VALUES (?, ?, ?, ?, ?, ?, ?, 'CLOSED', CURRENT_TIMESTAMP, 0)
              ON CONFLICT(market_id, date) DO UPDATE SET
                open_panna = excluded.open_panna,
                open_digit = excluded.open_digit,
                close_digit = excluded.close_digit,
                close_panna = excluded.close_panna,
                jodi = excluded.jodi,
                status = excluded.status
              WHERE market_results.is_manual_override = 0
            `, [mId, r.date, r.open_panna, r.open_digit, r.close_digit, r.close_panna, r.jodi]);
            totalInserted++;
            marketCounts[r.market_name] = (marketCounts[r.market_name] || 0) + 1;
          }
        }
        await db.exec('COMMIT');
      } catch (err) {
        await db.exec('ROLLBACK');
        throw err;
      }
    } else {
      // High-performance batch transaction in SQLite WebAssembly (completes in ~30ms instead of 5 minutes)
      const sdb = await getSqlJsDb();
      sdb.run('BEGIN TRANSACTION;');
      const stmt = sdb.prepare(`
        INSERT INTO market_results (market_id, date, open_panna, open_digit, close_digit, close_panna, jodi, status, declared_at, is_manual_override)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'CLOSED', CURRENT_TIMESTAMP, 0)
        ON CONFLICT(market_id, date) DO UPDATE SET
          open_panna = excluded.open_panna,
          open_digit = excluded.open_digit,
          close_digit = excluded.close_digit,
          close_panna = excluded.close_panna,
          jodi = excluded.jodi,
          status = excluded.status
        WHERE market_results.is_manual_override = 0
      `);

      for (const r of (genuineHistoricalResults as any[])) {
        const mId = marketIdMap.get(r.market_name.toUpperCase().trim());
        if (mId) {
          stmt.run([mId, r.date, r.open_panna, r.open_digit, r.close_digit, r.close_panna, r.jodi]);
          totalInserted++;
          marketCounts[r.market_name] = (marketCounts[r.market_name] || 0) + 1;
        }
      }
      stmt.free();
      sdb.run('COMMIT;');
      schedulePersistSqlJsToDisk(true);
    }
  }

  return { totalInserted, marketCounts };
}

export default db;

