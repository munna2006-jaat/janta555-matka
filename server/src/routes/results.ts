import { Router } from 'express';
import db, { forceSyncAllGenuineCharts } from '../db/database';
import { formatMatkaResult } from '../services/matkaUtils';
import { getSattaKingSyncStatus } from '../services/sattaKingSync';

const router = Router();

// Endpoint to force-sync genuine historical results for all markets on demand
router.get('/sync-all-genuine-charts', async (req, res) => {
  try {
    const result = await forceSyncAllGenuineCharts();
    return res.json({ success: true, message: 'Genuine historical charts synced successfully!', ...result });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Live Results feed for Public Result Portal & Live Ticker
router.get('/live', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const results = await db.queryAll(`
    SELECT m.id as market_id, m.name, m.hindi_name, m.open_time, m.close_time,
           r.date, r.open_panna, r.open_digit, r.close_digit, r.close_panna, r.jodi, r.status, r.declared_at
    FROM markets m
    LEFT JOIN market_results r ON m.id = r.market_id AND r.date = ?
    WHERE m.is_active = 1
    ORDER BY m.sort_order ASC
  `, [today]);

  const liveData = results.map(r => ({
    market_id: r.market_id,
    name: r.name,
    hindi_name: r.hindi_name,
    open_time: r.open_time,
    close_time: r.close_time,
    status: r.status || 'OPEN',
    open_panna: r.open_panna,
    open_digit: r.open_digit,
    close_digit: r.close_digit,
    close_panna: r.close_panna,
    jodi: r.jodi,
    resultString: formatMatkaResult(r.open_panna, r.open_digit, r.close_digit, r.close_panna),
    is_live: Boolean(r.status === 'CLOSED' || (r.open_digit && !r.close_digit)),
    declared_at: r.declared_at
  }));

  return res.json({ success: true, date: today, results: liveData });
});

// Panel Chart for a specific market (supports past 2+ years)
router.get('/panel-chart/:marketId', async (req, res) => {
  const { marketId } = req.params;
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
  const limit = parseInt(req.query.limit as string || '1000', 10);

  const market = await db.queryOne('SELECT id, name, hindi_name FROM markets WHERE id = ?', [marketId]);
  if (!market) {
    return res.status(404).json({ success: false, message: 'Market not found.' });
  }

  let query = `
    SELECT date, open_panna, open_digit, close_digit, close_panna, jodi, status
    FROM market_results
    WHERE market_id = ? AND (open_panna IS NOT NULL OR jodi IS NOT NULL)
  `;
  const params: any[] = [marketId];

  if (startDate) {
    query += ` AND date >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    query += ` AND date <= ?`;
    params.push(endDate);
  }

  query += ` ORDER BY date DESC LIMIT ?`;
  params.push(limit);

  const records = await db.queryAll(query, params);

  return res.json({
    success: true,
    market,
    records: records.map(r => ({
      date: r.date,
      open_panna: r.open_panna || '***',
      open_digit: r.open_digit || '*',
      close_digit: r.close_digit || '*',
      close_panna: r.close_panna || '***',
      jodi: r.jodi || (r.open_digit && r.close_digit && r.open_digit !== '*' && r.close_digit !== '*' ? `${r.open_digit}${r.close_digit}` : '**'),
      formatted: formatMatkaResult(r.open_panna, r.open_digit, r.close_digit, r.close_panna)
    }))
  });
});

// Jodi Chart (Historical Jodi matrix with date filter)
router.get('/jodi-chart/:marketId', async (req, res) => {
  const { marketId } = req.params;
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
  const limit = parseInt(req.query.limit as string || '1000', 10);

  const market = await db.queryOne('SELECT id, name, hindi_name FROM markets WHERE id = ?', [marketId]);
  if (!market) {
    return res.status(404).json({ success: false, message: 'Market not found.' });
  }

  let query = `
    SELECT date, jodi
    FROM market_results
    WHERE market_id = ? AND jodi IS NOT NULL
  `;
  const params: any[] = [marketId];

  if (startDate) {
    query += ` AND date >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    query += ` AND date <= ?`;
    params.push(endDate);
  }

  query += ` ORDER BY date ASC LIMIT ?`;
  params.push(limit);

  const records = await db.queryAll(query, params);

  return res.json({
    success: true,
    market,
    records
  });
});

// Disawar Consolidated Monthly Chart Table for all 6 markets
router.get('/disawar-monthly', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  let { yearMonth } = req.query as { yearMonth?: string };
  if (!yearMonth || !/^\d{4}-\d{2}$/.test(yearMonth)) {
    yearMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-11"
  }

  const [yearStr, monthStr] = yearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  const startDate = `${yearMonth}-01`;
  const endDate = `${yearMonth}-${String(daysInMonth).padStart(2, '0')}`;

  const DISAWAR_NAMES = ['DELHI BAZAR', 'SHREE GANESH', 'FARIDABAD', 'GAZIABAD', 'GALI', 'DESAWAR'];

  const rows = await db.queryAll(`
    SELECT r.date, r.jodi, m.name as market_name, m.sort_order
    FROM market_results r
    JOIN markets m ON r.market_id = m.id
    WHERE m.name IN ('DELHI BAZAR', 'SHREE GANESH', 'FARIDABAD', 'GAZIABAD', 'GALI', 'DESAWAR')
      AND r.date >= ? AND r.date <= ?
    ORDER BY r.date ASC, m.sort_order ASC
  `, [startDate, endDate]);

  // Group by date
  const dateMap: { [date: string]: { [marketName: string]: string } } = {};
  for (const row of rows) {
    if (!dateMap[row.date]) dateMap[row.date] = {};
    if (row.jodi) {
      dateMap[row.date][row.market_name] = row.jodi;
    }
  }

  const daysData = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0');
    const fullDate = `${yearMonth}-${dayStr}`;
    const dateObj = new Date(year, month - 1, d);
    const dayOfWeek = dayNames[dateObj.getDay()];

    const marketResults: { [marketName: string]: string | null } = {};
    for (const name of DISAWAR_NAMES) {
      marketResults[name] = dateMap[fullDate]?.[name] || null;
    }

    daysData.push({
      day: d,
      date: fullDate,
      dayOfWeek,
      results: marketResults
    });
  }

  const dObj = new Date(year, month - 1, 1);
  const monthTitle = dObj.toLocaleString('en-US', { month: 'long' }).toUpperCase() + ` ${year}`;

  return res.json({
    success: true,
    yearMonth,
    monthTitle,
    markets: DISAWAR_NAMES,
    days: daysData
  });
});

// Recent Winners Live Ticker
router.get('/recent-winners', async (req, res) => {
  const winners = await db.queryAll(`
    SELECT id, user_display_name, game_type_name, market_name, amount, created_at
    FROM recent_winners
    ORDER BY created_at DESC
    LIMIT 20
  `);

  return res.json({ success: true, winners });
});

// Satta King Real-time Live Sync Status
router.get('/satta-king-live', (req, res) => {
  return res.json({ success: true, status: getSattaKingSyncStatus() });
});

export default router;
