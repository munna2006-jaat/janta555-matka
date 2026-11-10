import { Router } from 'express';
import db from '../db/database';
import { formatMatkaResult } from '../services/matkaUtils';

const router = Router();

// Helper to check market open/closed status based on current time
function evaluateMarketTimes(market: any, todayResult: any) {
  if (todayResult && todayResult.status === 'CLOSED') {
    return {
      status: 'CLOSED',
      canPlayOpen: false,
      canPlayClose: false
    };
  }

  const now = new Date();
  const currentHours = now.getHours().toString().padStart(2, '0');
  const currentMinutes = now.getMinutes().toString().padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  const openTime = market.open_time_24;
  const closeTime = market.close_time_24;

  let canPlayOpen = true;
  let canPlayClose = true;

  if (currentTimeStr >= openTime) {
    canPlayOpen = false;
  }

  if (currentTimeStr >= closeTime) {
    canPlayClose = false;
  }

  const isOpen = canPlayOpen || canPlayClose;

  return {
    status: isOpen ? 'OPEN' : 'CLOSED',
    canPlayOpen,
    canPlayClose
  };
}

// Get all markets with today's results and live status
router.get('/', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const markets = await db.queryAll(`
    SELECT m.*, 
           r.open_panna, r.open_digit, r.close_digit, r.close_panna, r.jodi, r.status as result_status
    FROM markets m
    LEFT JOIN market_results r ON m.id = r.market_id AND r.date = ?
    WHERE m.is_active = 1
    ORDER BY m.sort_order ASC
  `, [today]);

  const formatted = markets.map(m => {
    const timing = evaluateMarketTimes(m, { status: m.result_status });
    const resultString = formatMatkaResult(m.open_panna, m.open_digit, m.close_digit, m.close_panna);

    return {
      id: m.id,
      name: m.name,
      hindi_name: m.hindi_name,
      open_time: m.open_time,
      close_time: m.close_time,
      open_time_24: m.open_time_24,
      close_time_24: m.close_time_24,
      status: timing.status,
      canPlayOpen: timing.canPlayOpen,
      canPlayClose: timing.canPlayClose,
      open_panna: m.open_panna,
      open_digit: m.open_digit,
      close_digit: m.close_digit,
      close_panna: m.close_panna,
      jodi: m.jodi,
      resultString
    };
  });

  return res.json({ success: true, markets: formatted });
});

// Get Disawar markets with OLD result (yesterday) and NEW result (today) matching reference recording
router.get('/disawar', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const today = new Date().toISOString().split('T')[0];
  const yestDate = new Date();
  yestDate.setDate(yestDate.getDate() - 1);
  const yesterday = yestDate.toISOString().split('T')[0];

  const markets = await db.queryAll(`
    SELECT m.*,
           r_today.jodi as today_jodi, r_today.status as today_status,
           r_yest.jodi as yest_jodi
    FROM markets m
    LEFT JOIN market_results r_today ON m.id = r_today.market_id AND r_today.date = ?
    LEFT JOIN market_results r_yest ON m.id = r_yest.market_id AND r_yest.date = ?
    WHERE m.name IN ('DELHI BAZAR', 'SHREE GANESH', 'FARIDABAD', 'GAZIABAD', 'GALI', 'DESAWAR')
    ORDER BY m.sort_order ASC
  `, [today, yesterday]);

  const now = new Date();
  const currentHours = now.getHours().toString().padStart(2, '0');
  const currentMinutes = now.getMinutes().toString().padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  const formatted = markets.map(m => {
    let canPlay = false;
    if (m.name === 'DESAWAR') {
      // Desawar betting closes at 04:30 AM next morning and result declares at 05:15 AM.
      // It is open all day & night, closing only in the declaration window (04:30 AM to 05:15 AM).
      canPlay = !(currentTimeStr >= '04:30' && currentTimeStr < '05:15');
    } else {
      const isClosed = m.today_status === 'CLOSED';
      canPlay = !isClosed && currentTimeStr < m.close_time_24;
    }

    return {
      id: m.id,
      name: m.name,
      hindi_name: m.hindi_name,
      open_time: m.open_time,
      close_time: m.close_time,
      open_time_24: m.open_time_24,
      close_time_24: m.close_time_24,
      oldResult: m.name === 'DESAWAR' ? '**' : (m.yest_jodi || '**'),
      oldTime: m.name === 'DESAWAR' ? '05:15 AM' : (m.open_time || m.close_time),
      newResult: m.today_jodi || '**',
      newTime: m.name === 'DESAWAR' ? '04:30 AM' : (m.close_time || '03:00 PM'),
      status: canPlay ? 'OPEN' : 'CLOSED',
      canPlay
    };
  });

  return res.json({ success: true, markets: formatted });
});

// Get specific market by ID
router.get('/:id', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const market = await db.queryOne(`
    SELECT m.*, 
           r.open_panna, r.open_digit, r.close_digit, r.close_panna, r.jodi, r.status as result_status
    FROM markets m
    LEFT JOIN market_results r ON m.id = r.market_id AND r.date = ?
    WHERE m.id = ?
  `, [today, req.params.id]);

  if (!market) {
    return res.status(404).json({ success: false, message: 'Market not found.' });
  }

  const timing = evaluateMarketTimes(market, { status: market.result_status });
  const resultString = formatMatkaResult(market.open_panna, market.open_digit, market.close_digit, market.close_panna);

  return res.json({
    success: true,
    market: {
      ...market,
      status: timing.status,
      canPlayOpen: timing.canPlayOpen,
      canPlayClose: timing.canPlayClose,
      resultString
    }
  });
});

// Get game types & payout rates
router.get('/meta/game-types', async (req, res) => {
  const gameTypes = await db.queryAll('SELECT * FROM game_types ORDER BY payout_rate ASC');
  return res.json({ success: true, gameTypes });
});

export default router;
