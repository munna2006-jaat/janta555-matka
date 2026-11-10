import https from 'https';
import db from '../db/database';
import { calculateAnkFromPanna } from '../services/matkaUtils';

// Mapping from local DB market name to appaboss cname parameter
const APPABOSS_CNAME_MAP: Record<string, { type: 'PANEL' | 'JODI'; cname: string }> = {
  'KALYAN': { type: 'PANEL', cname: 'KALYAN' },
  'MILAN DAY': { type: 'PANEL', cname: 'MILAN DAY' },
  'MILAN NIGHT': { type: 'PANEL', cname: 'MILAN NIGHT' },
  'RAJDHANI DAY': { type: 'PANEL', cname: 'RAJDHANI DAY' },
  'RAJDHANI NIGHT': { type: 'PANEL', cname: 'RAJDHANI NIGHT' },
  'MADHUR MORNING': { type: 'PANEL', cname: 'MADHUR MORNING' },
  'MADHUR DAY': { type: 'PANEL', cname: 'MADHUR DAY' },
  'MADHUR NIGHT': { type: 'PANEL', cname: 'MADHUR NIGHT' },
  'SRIDEVI': { type: 'PANEL', cname: 'SRIDEVI' },
  'SRIDEVI NIGHT': { type: 'PANEL', cname: 'SRIDEVI NIGHT' },
  'TIME BAZAR': { type: 'PANEL', cname: 'TIME BAZAR' },
  'MAIN BAZAR': { type: 'PANEL', cname: 'MAIN BAZAR' },
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
  'JHANSI BAZAR': { type: 'PANEL', cname: 'JHANSI BAZAR' },
  // Delhi / Satta King
  'DELHI BAZAR': { type: 'JODI', cname: 'DELHI BAZAR' },
  'SHREE GANESH': { type: 'JODI', cname: 'SHRI GANESH' },
  'FARIDABAD': { type: 'JODI', cname: 'FARIDABAD' },
  'GAZIABAD': { type: 'JODI', cname: 'GHAZIABAD' },
  'GALI': { type: 'JODI', cname: 'GALI' },
  'DESAWAR': { type: 'JODI', cname: 'DISHAWAR' },
  'GOA': { type: 'JODI', cname: 'GOA' }
};

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
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

interface ParsedDayRecord {
  date: string;
  openPanna: string | null;
  openDigit: string | null;
  closeDigit: string | null;
  closePanna: string | null;
  jodi: string | null;
}

/**
 * Scrape past 6 months of historical data from appaboss.co
 */
async function scrapeHistoricalMarket(marketId: number, marketName: string, config: { type: 'PANEL' | 'JODI'; cname: string }): Promise<ParsedDayRecord[]> {
  const endpoint = config.type === 'PANEL'
    ? `https://appaboss.co/panel?cname=${encodeURIComponent(config.cname)}`
    : `https://appaboss.co/jodi?cname=${encodeURIComponent(config.cname)}`;

  const records: ParsedDayRecord[] = [];
  try {
    const html = await fetchUrl(endpoint);
    const trRegex = /<tr>([\s\S]*?)<\/tr>/gi;
    let trMatch;

    while ((trMatch = trRegex.exec(html)) !== null) {
      const rowHtml = trMatch[1];
      const dateMatch = rowHtml.match(/<th[^>]*>(\d{2}\/\d{2}\/\d{4})[\s\S]*?to[\s\S]*?(\d{2}\/\d{2}\/\d{4})<\/th>/i);
      if (!dateMatch) continue;

      const startDate = parseDateRange(dateMatch[1]);
      const tdBlocks = [...rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)];

      tdBlocks.forEach((td, idx) => {
        const dayDate = addDays(startDate, idx);
        // Past 6 months filter (from 2026-05-01 to 2026-11-04)
        if (dayDate >= '2026-05-01' && dayDate <= '2026-11-04') {
          if (config.type === 'PANEL') {
            const panelMatch = td[1].match(/class="[^"]*panelResult[^"]*"><small>([\d\s\n*]+)<\/small><b>([\d*]{2})<\/b><small>([\d\s\n*]+)<\/small>/i);
            if (panelMatch) {
              const openPanna = panelMatch[1].replace(/[\s\n]/g, '');
              const jodi = panelMatch[2].replace(/[\s\n]/g, '');
              const closePanna = panelMatch[3].replace(/[\s\n]/g, '');
              if (!openPanna.includes('*') && !jodi.includes('*') && !closePanna.includes('*')) {
                const openDigit = jodi[0];
                const closeDigit = jodi[1];
                records.push({ date: dayDate, openPanna, openDigit, closeDigit, closePanna, jodi });
              }
            }
          } else {
            // Satta King Jodi
            const text = td[1].replace(/<[^>]*>/g, '').trim();
            if (/^\d{2}$/.test(text) && !text.includes('*')) {
              records.push({
                date: dayDate,
                openPanna: null,
                openDigit: text[0],
                closeDigit: text[1],
                closePanna: null,
                jodi: text
              });
            }
          }
        }
      });
    }
  } catch (err: any) {
    console.error(`Error scraping historical data for ${marketName}:`, err.message);
  }

  return records;
}

export async function runHistoricalImport() {
  console.log('========================================================');
  console.log('🚀 Starting 6-Month Real Historical Results Import from AppaBoss...');
  console.log('========================================================');

  const allMarkets = await db.queryAll('SELECT id, name FROM markets');
  let totalImported = 0;

  for (const m of allMarkets) {
    const config = APPABOSS_CNAME_MAP[m.name];
    if (!config) {
      continue;
    }

    console.log(`[Import] Fetching 6-month historical chart for: ${m.name} (${config.type})...`);
    const records = await scrapeHistoricalMarket(m.id, m.name, config);
    console.log(`[Import] Parsed ${records.length} days of real results for ${m.name}`);

    if (records.length > 0) {
      // Clear out any old fake/seeded rows for this market in the 6-month window
      await db.execute(`
        DELETE FROM market_results 
        WHERE market_id = ? AND date >= '2026-05-01' AND date <= '2026-11-04' AND (is_manual_override IS NULL OR is_manual_override = 0)
      `, [m.id]);
    }

    for (const rec of records) {
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
        WHERE market_results.is_manual_override = 0;
      `, [m.id, rec.date, rec.openPanna, rec.openDigit, rec.closeDigit, rec.closePanna, rec.jodi]);
      totalImported++;
    }

    // Gentle 150ms delay between markets
    await new Promise(r => setTimeout(r, 150));
  }

  console.log('========================================================');
  console.log(`✅ Completed! Successfully imported ${totalImported} real historical results across all markets!`);
  console.log('========================================================');
  return totalImported;
}

// Run immediately if called directly
runHistoricalImport()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error during historical import:', err);
    process.exit(1);
  });

