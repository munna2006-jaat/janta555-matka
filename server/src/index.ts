import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { CONFIG } from './config';
import { initDatabase } from './db/database';
import authRouter from './routes/auth';
import marketsRouter from './routes/markets';
import betsRouter from './routes/bets';
import walletRouter from './routes/wallet';
import resultsRouter from './routes/results';
import adminRouter from './routes/admin';
import { startAutomationWorker } from './services/automation';
import { startSattaKingLiveSyncWorker } from './services/sattaKingSync';
import { startMatkaPulseSyncWorker } from './services/matkaPulseSync';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'JANTA555 Production Server',
    database: CONFIG.DATABASE_URL ? 'PostgreSQL (Cloud)' : 'SQLite (Local WAL)',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/markets', marketsRouter);
app.use('/api/v1/bets', betsRouter);
app.use('/api/v1/wallet', walletRouter);
app.use('/api/v1/results', resultsRouter);
app.use('/api/v1/admin', adminRouter);

// Robust dist directory resolver for local, tsx, and bundled container environments (Voroa / Docker)
function findDistDir(appName: string): string {
  const candidates = [
    path.resolve(process.cwd(), 'apps', appName, 'dist'),
    path.resolve(__dirname, '..', 'apps', appName, 'dist'),
    path.resolve(__dirname, '..', '..', 'apps', appName, 'dist')
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return candidates[0];
}

const userWebDist = findDistDir('user-web');
const adminWebDist = findDistDir('admin-web');

console.log('[Static Server] User Web Path:', userWebDist, 'Exists:', fs.existsSync(userWebDist));
console.log('[Static Server] Admin Web Path:', adminWebDist, 'Exists:', fs.existsSync(adminWebDist));

// Static uploads directory (for receipts, payment screenshots, and qr codes)
const uploadsDir = path.resolve(process.cwd(), 'uploads');
const receiptsDir = path.join(uploadsDir, 'receipts');
if (!fs.existsSync(receiptsDir)) fs.mkdirSync(receiptsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Static assets for subpaths
app.use('/admin', express.static(adminWebDist));
app.use(express.static(userWebDist));

// Subpath SPA fallbacks using Express 5 compatible route handlers
app.use('/admin', (req, res, next) => {
  if (req.method !== 'GET') return next();
  const file = path.join(adminWebDist, 'index.html');
  if (fs.existsSync(file)) return res.sendFile(file);
  return next();
});

// Host header routing or root SPA fallback
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  if (req.method !== 'GET') return next();

  const host = (req.headers.host || '').toLowerCase();
  if (host.startsWith('admin.') || host.includes('-admin')) {
    const file = path.join(adminWebDist, 'index.html');
    if (fs.existsSync(file)) return res.sendFile(file);
  }

  const userIndex = path.join(userWebDist, 'index.html');
  if (fs.existsSync(userIndex)) {
    return res.sendFile(userIndex);
  }

  return res.status(200).send(`
    <html>
      <body style="font-family:sans-serif;text-align:center;padding:50px;">
        <h2>🚀 JANTA555 Production Server Running</h2>
        <p>API is active at <code>/api/v1/health</code></p>
      </body>
    </html>
  `);
});

// Start listening immediately on 0.0.0.0 so Voroa cloud health checks pass instantly
app.listen(CONFIG.PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 JANTA555 Production Server running on port ${CONFIG.PORT} (0.0.0.0)`);
  console.log(`📡 API Endpoints available under /api/v1`);
  console.log(`🗄️  Database Target: ${CONFIG.DATABASE_URL ? 'PostgreSQL (Cloud)' : 'SQLite (Local WAL)'}`);
  console.log(`🛡️  Admin System Active: JANTA555 Master Admin`);
  console.log(`=======================================================`);
});

// Bootstrap database in background with retry logic
async function bootstrapDatabase(retries = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[Database] Initializing connection (Attempt ${attempt}/${retries})...`);
      await initDatabase();
      startAutomationWorker();
      startSattaKingLiveSyncWorker();
      startMatkaPulseSyncWorker();
      console.log('[Database] System fully initialized and operational!');
      return;
    } catch (error) {
      console.error(`[Database Error] Initialization failed on attempt ${attempt}:`, error);
      if (attempt < retries) {
        console.log(`[Database] Retrying in ${delayMs / 1000}s...`);
        await new Promise(r => setTimeout(r, delayMs));
      } else {
        console.warn('[Database Warning] Failed to initialize after maximum retries. Server running in degraded mode.');
      }
    }
  }
}

bootstrapDatabase();

export default app;
