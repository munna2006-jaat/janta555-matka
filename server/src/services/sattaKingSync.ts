import db from '../db/database';
import { settleMarketResults } from './settlement';
import { calculateAnkFromPanna } from './matkaUtils';
import { fetchMatkaPulseHtml, parseMatkaPulseMarkets } from './matkaPulseSync';

export interface SattaKingGameResult {
  name: string;
  time: string;
  yesterday: string;
  today: string;
  rawString?: string;
}

export interface SattaKingSyncStatus {
  lastSyncAt: string | null;
  lastSyncSuccess: boolean;
  lastMessage: string;
  matchedMarkets: {
    marketName: string;
    todayResult: string | null;
    yesterdayResult: string | null;
    status: 'UPDATED' | 'ALREADY_SET' | 'AWAITING_DRAW';
  }[];
}

let syncStatus: SattaKingSyncStatus = {
  lastSyncAt: null,
  lastSyncSuccess: false,
  lastMessage: 'Not synced yet',
  matchedMarkets: []
};

// Aliases mapping from appaboss.co names to local DB market names
const MARKET_NAME_MAP: Record<string, string> = {
  'DESAWAR': 'DESAWAR',
  'DISAWAR': 'DESAWAR',
  'DISHAWAR': 'DESAWAR',
  'GALI': 'GALI',
  'FARIDABAD': 'FARIDABAD',
  'GHAZIABAD': 'GAZIABAD',
  'GAZIABAD': 'GAZIABAD',
  'DELHI BAZAR': 'DELHI BAZAR',
  'DELHI BAZAR DAY': 'DELHI BAZAR',
  'SHRI GANESH': 'SHREE GANESH',
  'SHREE GANESH': 'SHREE GANESH',
  'GOA': 'GOA',
  'KALYAN': 'KALYAN',
  'MILAN DAY': 'MILAN DAY',
  'MILAN NIGHT': 'MILAN NIGHT',
  'RAJDHANI DAY': 'RAJDHANI DAY',
  'RAJDHANI NIGHT': 'RAJDHANI NIGHT',
  'MADHUR MORNING': 'MADHUR MORNING',
  'MADHUR DAY': 'MADHUR DAY',
  'MADHUR NIGHT': 'MADHUR NIGHT',
  'SRIDEVI': 'SRIDEVI',
  'SRIDEVI NIGHT': 'SRIDEVI NIGHT',
  'TIME BAZAR': 'TIME BAZAR',
  'MAIN BAZAR': 'MAIN BAZAR',
  'KALYAN NIGHT': 'KALYAN NIGHT',
  'GOOD MORNING': 'GOOD MORNING',
  'BOMBAY EXP.': 'BOMBAY EXP.',
  'GOLDEN': 'GOLDEN',
  'GOA GOLDEN': 'GOA GOLDEN',
  'GOLD STAR': 'GOLD STAR',
  'GOLDEN NIGHT': 'GOLDEN NIGHT',
  'TARA MUMBAI DAY': 'TARA MUMBAI DAY',
  'TARA MUMBAI NIGHT': 'TARA MUMBAI NIGHT',
  'NIGHT TIME BAZAR': 'NIGHT TIME BAZAR',
  'APPA BOSS': 'APPA BOSS',
  'JHANSI BAZAR': 'JHANSI BAZAR'
};

const APPABOSS_CHART_MAP: Record<string, { type: 'PANEL' | 'JODI'; cname: string }> = {
  // Disawar / Satta King
  'FARIDABAD': { type: 'JODI', cname: 'FARIDABAD' },
  'GAZIABAD': { type: 'JODI', cname: 'GHAZIABAD' },
  'GALI': { type: 'JODI', cname: 'GALI' },
  'DESAWAR': { type: 'JODI', cname: 'DISHAWAR' },
  'DELHI BAZAR': { type: 'JODI', cname: 'DELHI BAZAR' },
  'SHREE GANESH': { type: 'JODI', cname: 'SHRI GANESH' },
  'GOA': { type: 'JODI', cname: 'GOA' },
  // Matka Panel Charts
  'KALYAN': { type: 'PANEL', cname: 'KALYAN' },
  'MILAN DAY': { type: 'PANEL', cname: 'MILAN DAY' },
  'MILAN NIGHT': { type: 'PANEL', cname: 'MILAN NIGHT' },
  'RAJDHANI DAY': { type: 'PANEL', cname: 'RAJDHANI DAY' },
  'RAJDHANI NIGHT': { type: 'PANEL', cname: 'RAJDHANI NIGHT' },
  'SRIDEVI': { type: 'PANEL', cname: 'SRIDEVI' },
  'SRIDEVI NIGHT': { type: 'PANEL', cname: 'SRIDEVI NIGHT' },
  'TIME BAZAR': { type: 'PANEL', cname: 'TIME BAZAR' },
  'MAIN BAZAR': { type: 'PANEL', cname: 'MAIN BAZAR' },
  'MADHUR MORNING': { type: 'PANEL', cname: 'MADHUR MORNING' },
  'MADHUR DAY': { type: 'PANEL', cname: 'MADHUR DAY' },
  'MADHUR NIGHT': { type: 'PANEL', cname: 'MADHUR NIGHT' },
  'KALYAN NIGHT': { type: 'PANEL', cname: 'KALYAN NIGHT' },
  'GOOD MORNING': { type: 'PANEL', cname: 'GOOD MORNING' },
  'BOMBAY EXP.': { type: 'PANEL', cname: 'BOMBAY EXP.' },
  'GOLDEN': { type: 'PANEL', cname: 'GOLDEN' },
  'GOA GOLDEN': { type: 'PANEL', cname: 'GOA GOLDEN' },
  'GOLD STAR': { type: 'PANEL', cname: 'GOLD STAR' },
  'GOLDEN NIGHT': { type: 'PANEL', cname: 'GOLDEN NIGHT' },
  'TARA MUMBAI DAY': { type: 'PANEL', cname: 'TARA MUMBAI DAY' },
  'TARA MUMBAI NIGHT': { type: 'PANEL', cname: 'TARA MUMBAI NIGHT' },
  'NIGHT TIME BAZAR': { type: 'PANEL', cname: 'NIGHT TIME BAZAR' },
  'APPA BOSS': { type: 'PANEL', cname: 'APPA BOSS' },
  'JHANSI BAZAR': { type: 'PANEL', cname: 'JHANSI BAZAR' }
};

/**
 * Fetch HTML from https://appaboss.co/ with reliable headers and timeout
 */
function fetchAppaBossHtml(url: string = 'https://appaboss.co/'): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Cache-Control': 'no-cache'
      },
      timeout: 12000
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout connecting to appaboss.co'));
    });
  });
}

/**
 * Parse articles from appaboss.co homepage HTML
 */
export function parseLiveResults(html: string): Map<string, { name: string; rawString: string; timing: string }> {
  const gameMap = new Map<string, { name: string; rawString: string; timing: string }>();
  const articleRegex = /<article\b[^>]*>([\s\S]*?)<\/article>/gi;
  let match: RegExpExecArray | null;

  while ((match = articleRegex.exec(html)) !== null) {
    const block = match[1];
    const h3Match = block.match(/<h3>\s*([^<]+?)\s*<\/h3>/i);
    const strongMatch = block.match(/<strong>\s*([^<]+?)\s*<\/strong>/i);
    const timingMatches = [...block.matchAll(/<span>\s*([^<]+?)\s*<\/span>/gi)].map(m => m[1].trim());

    if (h3Match && strongMatch) {
      const rawName = h3Match[1].trim().toUpperCase();
      const rawString = strongMatch[1].trim();
      const timing = timingMatches.join(' - ');

      gameMap.set(rawName, {
        name: rawName,
        rawString,
        timing
      });
    }
  }

  return gameMap;
}

/**
 * Clean 2-digit number (e.g. "47", "05", "00")
 */
function cleanTwoDigitNumber(val: string | null | undefined): string | null {
  if (!val) return null;
  const cleaned = val.replace(/<[^>]*>/g, '').trim();
  if (/^\d{2}$/.test(cleaned)) {
    return cleaned;
  }
  if (/^\d{1}$/.test(cleaned)) {
    return `0${cleaned}`;
  }
  return null;
}

/**
 * Sync live results from appaboss.co into local markets & market_results
 */
export async function syncSattaKingLiveBoard(): Promise<SattaKingSyncStatus> {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yestDate = new Date();
  yestDate.setDate(yestDate.getDate() - 1);
  const yesterday = yestDate.toISOString().split('T')[0];

  try {
    const html = await fetchMatkaPulseHtml('https://matkapulse.com/');
    const parsedList = parseMatkaPulseMarkets(html);
    const parsedGames = new Map<string, { name: string; rawString: string; timing: string }>();
    for (const pm of parsedList) {
      parsedGames.set(pm.name.toUpperCase(), { name: pm.name.toUpperCase(), rawString: pm.resultString, timing: '' });
    }

    // Target markets for the Disawar live status dashboard
    const targetMarkets = await db.queryAll(`
      SELECT id, name, open_time, close_time 
      FROM markets 
      WHERE name IN ('FARIDABAD', 'GAZIABAD', 'GALI', 'DESAWAR', 'DELHI BAZAR', 'SHREE GANESH', 'GOA')
      ORDER BY id ASC
    `);

    const marketReports: SattaKingSyncStatus['matchedMarkets'] = [];
    let updatedCount = 0;

    for (const m of targetMarkets) {
      const canonicalName = m.name.toUpperCase();
      
      // Find matching game from appaboss.co parsed cards
      let gameData: { name: string; rawString: string; timing: string } | undefined;
      for (const [scrapedName, g] of parsedGames.entries()) {
        const mapped = MARKET_NAME_MAP[scrapedName];
        if (mapped === canonicalName || scrapedName === canonicalName) {
          gameData = g;
          break;
        }
      }

      // Check yesterday result from DB
      const dbYest = await db.queryOne(`
        SELECT jodi, open_panna, close_panna FROM market_results WHERE market_id = ? AND date = ?
      `, [m.id, yesterday]);
      const cleanYest = dbYest?.jodi ? String(dbYest.jodi) : null;

      if (!gameData) {
        marketReports.push({
          marketName: canonicalName,
          todayResult: null,
          yesterdayResult: cleanYest,
          status: 'AWAITING_DRAW'
        });
        continue;
      }

      // Parse today's live number
      const rawVal = gameData.rawString.trim();
      const cleanToday = cleanTwoDigitNumber(rawVal);

      // Check current today result in database
      const existingToday = await db.queryOne(`
        SELECT id, jodi, status, is_manual_override 
        FROM market_results 
        WHERE market_id = ? AND date = ?
      `, [m.id, today]);

      let marketStatus: 'UPDATED' | 'ALREADY_SET' | 'AWAITING_DRAW' = 'AWAITING_DRAW';

      if (cleanToday) {
        if (existingToday && Number(existingToday.is_manual_override) === 1) {
          marketStatus = 'ALREADY_SET';
        } else if (!existingToday || !existingToday.jodi || existingToday.jodi !== cleanToday) {
          const openDigit = cleanToday[0];
          const closeDigit = cleanToday[1];

          await settleMarketResults({
            marketId: m.id,
            date: today,
            openDigit,
            closeDigit,
            openPanna: null,
            closePanna: null,
            isManualOverride: false
          });

          await db.execute(`
            INSERT INTO market_results (market_id, date, open_digit, close_digit, jodi, status, is_manual_override, declared_at)
            VALUES (?, ?, ?, ?, ?, 'CLOSED', 0, CURRENT_TIMESTAMP)
            ON CONFLICT(market_id, date) DO UPDATE SET
              jodi = excluded.jodi,
              open_digit = excluded.open_digit,
              close_digit = excluded.close_digit,
              status = 'CLOSED',
              is_manual_override = 0,
              declared_at = CURRENT_TIMESTAMP
            WHERE market_results.is_manual_override = 0;
          `, [m.id, today, openDigit, closeDigit, cleanToday]);

          console.log(`[AppaBoss Sync] ✓ DECLARED: ${canonicalName} -> ${cleanToday} for ${today}`);
          marketStatus = 'UPDATED';
          updatedCount++;
        } else {
          marketStatus = 'ALREADY_SET';
        }
      } else {
        marketStatus = 'AWAITING_DRAW';
      }

      marketReports.push({
        marketName: canonicalName,
        todayResult: cleanToday,
        yesterdayResult: cleanYest,
        status: marketStatus
      });
    }

    // Also sync all regular Matka panel markets from appaboss.co
    const matkaMarkets = await db.queryAll(`
      SELECT id, name FROM markets 
      WHERE name NOT IN ('FARIDABAD', 'GAZIABAD', 'GALI', 'DESAWAR', 'DELHI BAZAR', 'SHREE GANESH', 'GOA')
    `);
    const matkaByName = new Map<string, any>();
    for (const mk of matkaMarkets) {
      matkaByName.set(mk.name.toUpperCase(), mk);
    }

    for (const [scrapedName, g] of parsedGames.entries()) {
      const canonical = MARKET_NAME_MAP[scrapedName];
      const targetMatka = canonical ? matkaByName.get(canonical) : null;
      if (!targetMatka) continue;

      const raw = g.rawString.replace(/\s+/g, '').toUpperCase();
      if (raw.includes('X') || raw.includes('*') || raw === '--') continue;

      // Full matka format (e.g. 289-97-557)
      const fullMatch = raw.match(/^(\d{3})-(\d{1,2})-(\d{3})$/);
      if (fullMatch) {
        const openP = fullMatch[1];
        const jodi = fullMatch[2];
        const closeP = fullMatch[3];
        const openD = jodi.length === 2 ? jodi[0] : String(calculateAnkFromPanna(openP));
        const closeD = jodi.length === 2 ? jodi[1] : String(calculateAnkFromPanna(closeP));

        const cur = await db.queryOne('SELECT id, jodi, is_manual_override FROM market_results WHERE market_id = ? AND date = ?', [targetMatka.id, today]);
        if (!cur || (cur.is_manual_override !== 1 && cur.jodi !== jodi)) {
          await settleMarketResults({
            marketId: targetMatka.id,
            date: today,
            openPanna: openP,
            openDigit: openD,
            closeDigit: closeD,
            closePanna: closeP,
            jodi,
            isManualOverride: false
          });
          console.log(`[AppaBoss Sync] ✓ Matka Full Declared: ${targetMatka.name} -> ${raw}`);
          updatedCount++;
        }
      }
    }

    syncStatus = {
      lastSyncAt: new Date().toISOString(),
      lastSyncSuccess: true,
      lastMessage: `Successfully synced live board from AppaBoss. ${updatedCount} market(s) updated.`,
      matchedMarkets: marketReports
    };

    return syncStatus;
  } catch (err: any) {
    console.error('[AppaBoss Sync Error]:', err.message || err);
    syncStatus = {
      ...syncStatus,
      lastSyncAt: new Date().toISOString(),
      lastSyncSuccess: false,
      lastMessage: `Sync failed: ${err.message || 'Unknown error'}`
    };
    return syncStatus;
  }
}

function parseDateRange(startStr: string): Date {
  const [d, m, y] = startStr.split('/').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function addDays(startDate: Date, days: number): string {
  const d = new Date(startDate);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Sync monthly chart for all markets from appaboss.co for a given year & month (e.g. "2026-11", "2026-10")
 */
export async function syncSattaKingMonthlyChart(yearMonth: string): Promise<{ success: boolean; message: string; rowsSynced: number }> {
  if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
    return { success: false, message: 'Invalid yearMonth format. Expected YYYY-MM', rowsSynced: 0 };
  }

  const allMarkets = await db.queryAll('SELECT id, name FROM markets');
  const marketByName = new Map<string, number>();
  for (const m of allMarkets) {
    marketByName.set(m.name.toUpperCase(), m.id);
  }

  let rowsSynced = 0;

  for (const [marketName, config] of Object.entries(APPABOSS_CHART_MAP)) {
    const marketId = marketByName.get(marketName);
    if (!marketId) continue;

    const endpoint = config.type === 'PANEL'
      ? `https://appaboss.co/panel?cname=${encodeURIComponent(config.cname)}`
      : `https://appaboss.co/jodi?cname=${encodeURIComponent(config.cname)}`;

    try {
      const html = await fetchAppaBossHtml(endpoint);
      const trRegex = /<tr>([\s\S]*?)<\/tr>/gi;
      let trMatch: RegExpExecArray | null;

      while ((trMatch = trRegex.exec(html)) !== null) {
        const row = trMatch[1];
        const thMatch = row.match(/<th[^>]*>(\d{2}\/\d{2}\/\d{4})[\s\S]*?to[\s\S]*?(\d{2}\/\d{2}\/\d{4})<\/th>/i);
        if (!thMatch) continue;

        const startDate = parseDateRange(thMatch[1]);
        const tds = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)];

        for (let idx = 0; idx < tds.length; idx++) {
          const dateStr = addDays(startDate, idx);
          if (!dateStr.startsWith(yearMonth)) continue;

          if (config.type === 'PANEL') {
            const panelMatch = tds[idx][1].match(/class="[^"]*panelResult[^"]*"><small>([\d\s\n*]+)<\/small><b>([\d*]{2})<\/b><small>([\d\s\n*]+)<\/small>/i);
            if (panelMatch) {
              const openP = panelMatch[1].replace(/[\s\n]/g, '');
              const jodi = panelMatch[2].replace(/[\s\n]/g, '');
              const closeP = panelMatch[3].replace(/[\s\n]/g, '');
              if (!openP.includes('*') && !jodi.includes('*') && !closeP.includes('*')) {
                const openD = jodi[0];
                const closeD = jodi[1];

                await db.execute(`
                  INSERT INTO market_results (market_id, date, open_panna, open_digit, close_digit, close_panna, jodi, status, declared_at, is_manual_override)
                  VALUES (?, ?, ?, ?, ?, ?, ?, 'CLOSED', CURRENT_TIMESTAMP, 0)
                  ON CONFLICT(market_id, date) DO UPDATE SET
                    open_panna = excluded.open_panna,
                    open_digit = excluded.open_digit,
                    close_digit = excluded.close_digit,
                    close_panna = excluded.close_panna,
                    jodi = excluded.jodi,
                    status = 'CLOSED'
                  WHERE market_results.is_manual_override = 0;
                `, [marketId, dateStr, openP, openD, closeD, closeP, jodi]);
                rowsSynced++;
              }
            }
          } else {
            // Satta King Jodi
            const text = tds[idx][1].replace(/<[^>]*>/g, '').trim();
            if (/^\d{2}$/.test(text) && !text.includes('*')) {
              const openD = text[0];
              const closeD = text[1];

              await db.execute(`
                INSERT INTO market_results (market_id, date, open_digit, close_digit, jodi, status, declared_at, is_manual_override)
                VALUES (?, ?, ?, ?, ?, 'CLOSED', CURRENT_TIMESTAMP, 0)
                ON CONFLICT(market_id, date) DO UPDATE SET
                  jodi = excluded.jodi,
                  open_digit = excluded.open_digit,
                  close_digit = excluded.close_digit,
                  status = 'CLOSED'
                WHERE market_results.is_manual_override = 0;
              `, [marketId, dateStr, openD, closeD, text]);
              rowsSynced++;
            }
          }
        }
      }
    } catch (e: any) {
      console.error(`Error syncing monthly chart for ${marketName}:`, e.message);
    }
  }

  return {
    success: true,
    message: `Successfully synced ${rowsSynced} real results from AppaBoss for ${yearMonth}.`,
    rowsSynced
  };
}

/**
 * Returns latest sync status
 */
export function getSattaKingSyncStatus(): SattaKingSyncStatus {
  return syncStatus;
}

/**
 * Start periodic background live sync worker (runs every 30s)
 */
export function startSattaKingLiveSyncWorker() {
  console.log('[AppaBoss Live Worker] Started AppaBoss real-time live results sync worker (Every 30s)...');

  // Initial sync immediately
  syncSattaKingLiveBoard().catch(err => console.error('[AppaBoss Live Sync Initial Error]:', err));

  // Run periodic sync every 30 seconds
  setInterval(() => {
    syncSattaKingLiveBoard().catch(err => console.error('[AppaBoss Live Sync Interval Error]:', err));
  }, 30000);
}
