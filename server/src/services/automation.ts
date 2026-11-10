import db from '../db/database';
import { settleMarketResults } from './settlement';
import { calculateOptimalPanna, generateRandomPanna } from './exposure';
import { calculateAnkFromPanna } from './matkaUtils';

export function startAutomationWorker() {
  console.log('[Automation Worker] Started Matka scheduled and automatic results monitor...');

  // Ensure necessary columns exist in markets table safely
  const cols = [
    "ALTER TABLE markets ADD COLUMN result_mode TEXT DEFAULT 'MANUAL'",
    "ALTER TABLE markets ADD COLUMN auto_algorithm TEXT DEFAULT 'MIN_LIABILITY'",
    "ALTER TABLE markets ADD COLUMN scheduled_open_panna TEXT",
    "ALTER TABLE markets ADD COLUMN scheduled_close_panna TEXT"
  ];
  for (const c of cols) {
    db.exec(c).catch(() => {});
  }

  // Check every 30 seconds
  setInterval(() => {
    checkAndExecuteAutomation().catch(err => console.error('[Automation Worker Error]:', err));
  }, 30000);

  // Also run immediately on start
  checkAndExecuteAutomation().catch(err => console.error('[Automation Worker Error]:', err));
}

export async function checkAndExecuteAutomation() {
  const now = new Date();
  const currentHours = now.getHours().toString().padStart(2, '0');
  const currentMinutes = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHours}:${currentMinutes}`;
  const today = now.toISOString().split('T')[0];

  const activeMarkets = await db.queryAll(`
    SELECT m.*, r.open_panna as current_open_panna, r.close_panna as current_close_panna, 
           r.status as result_status, r.is_manual_override
    FROM markets m
    LEFT JOIN market_results r ON m.id = r.market_id AND r.date = ?
    WHERE m.is_active = 1
  `, [today]);

  for (const market of activeMarkets) {
    const mode = market.result_mode || 'MANUAL';
    if (mode === 'MANUAL') continue;
    if (Number(market.is_manual_override) === 1) {
      // Admin has manually modified this market result! Skip automatic draw.
      continue;
    }

    // 1. Check Open Time Trigger
    if (currentTime >= market.open_time_24 && !market.current_open_panna) {
      let openPannaToDeclare = '';

      if (mode === 'SCHEDULED_MANUAL' && market.scheduled_open_panna) {
        openPannaToDeclare = market.scheduled_open_panna;
        console.log(`[Automation] Triggering PRE-SCHEDULED Open Result for ${market.name}: ${openPannaToDeclare}`);
      } else if (mode === 'AUTOMATIC') {
        openPannaToDeclare = market.auto_algorithm === 'RANDOM_DRAW'
          ? generateRandomPanna()
          : await calculateOptimalPanna(market.id, today, 'OPEN');
        console.log(`[Automation] Auto-generated Open Result for ${market.name} (${market.auto_algorithm}): ${openPannaToDeclare}`);
      }

      if (openPannaToDeclare) {
        const openDigit = calculateAnkFromPanna(openPannaToDeclare);
        await settleMarketResults({
          marketId: market.id,
          date: today,
          openPanna: openPannaToDeclare,
          openDigit,
          closeDigit: null,
          closePanna: null,
          isManualOverride: false
        });
      }
    }

    // 2. Check Close Time Trigger
    if (currentTime >= market.close_time_24 && !market.current_close_panna) {
      let closePannaToDeclare = '';

      if (mode === 'SCHEDULED_MANUAL' && market.scheduled_close_panna) {
        closePannaToDeclare = market.scheduled_close_panna;
        console.log(`[Automation] Triggering PRE-SCHEDULED Close Result for ${market.name}: ${closePannaToDeclare}`);
      } else if (mode === 'AUTOMATIC') {
        closePannaToDeclare = market.auto_algorithm === 'RANDOM_DRAW'
          ? generateRandomPanna()
          : await calculateOptimalPanna(market.id, today, 'CLOSE');
        console.log(`[Automation] Auto-generated Close Result for ${market.name} (${market.auto_algorithm}): ${closePannaToDeclare}`);
      }

      if (closePannaToDeclare) {
        const closeDigit = calculateAnkFromPanna(closePannaToDeclare);
        const currentResult = await db.queryOne('SELECT open_panna, open_digit FROM market_results WHERE market_id = ? AND date = ?', [market.id, today]);

        await settleMarketResults({
          marketId: market.id,
          date: today,
          openPanna: currentResult ? currentResult.open_panna : null,
          openDigit: currentResult ? currentResult.open_digit : null,
          closeDigit,
          closePanna: closePannaToDeclare,
          isManualOverride: false
        });
      }
    }
  }
}
