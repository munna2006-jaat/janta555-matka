import db from '../db/database';
import { settleMarketResults } from './settlement';
import { calculateAnkFromPanna } from './matkaUtils';

export interface MatkaPulseMarketResult {
  name: string;
  resultString: string;
  date?: string;
  openTime?: string | null;
  closeTime?: string | null;
}

export interface MatkaPulseSyncStatus {
  source: string;
  lastSyncAt: string | null;
  lastSyncSuccess: boolean;
  lastMessage: string;
  totalParsed: number;
  updatedMarkets: string[];
}

let syncStatus: MatkaPulseSyncStatus = {
  source: 'https://matkapulse.com/',
  lastSyncAt: null,
  lastSyncSuccess: false,
  lastMessage: 'Not synced yet',
  totalParsed: 0,
  updatedMarkets: []
};

export function getMatkaPulseSyncStatus(): MatkaPulseSyncStatus {
  return syncStatus;
}

/**
 * Returns current date in Indian Standard Time (UTC+05:30) as YYYY-MM-DD
 */
export function getTodayIST(): string {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().slice(0, 10);
}

// Canonical name mappings from MatkaPulse naming to our internal DB market names
const MARKET_NAME_MAP: Record<string, string> = {
  'KALYAN': 'KALYAN',
  'MILAN DAY': 'MILAN DAY',
  'MILAN NIGHT': 'MILAN NIGHT',
  'MILAN MORNING': 'MILAN MORNING',
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
  'KALYAN MORNING': 'KALYAN MORNING',
  'KARNATAKA DAY': 'KARNATAKA DAY',
  'KARNATAKA NIGHT': 'KARNATAKA NIGHT',
  'KASHI KING': 'KASHI KING',
  'DAIMOND BAZAR': 'DAIMOND BAZAR',
  'DIAMOND BAZAR': 'DAIMOND BAZAR',
  'SUPREME DAY': 'SUPREME DAY',
  'SUPREME NIGHT': 'SUPREME NIGHT',
  'EKKA BAZAR': 'EKKA BAZAR',
  'DELHI BAZAR': 'DELHI BAZAR',
  'DELHI BAZAR DAY': 'DELHI BAZAR',
  'SHRI GANESH': 'SHREE GANESH',
  'SHREE GANESH': 'SHREE GANESH',
  'FARIDABAD': 'FARIDABAD',
  'GHAZIABAD': 'GAZIABAD',
  'GAZIABAD': 'GAZIABAD',
  'GALI': 'GALI',
  'DISHAWAR': 'DESAWAR',
  'DESAWAR': 'DESAWAR',
  'DISAWAR': 'DESAWAR',
  'GOOD MORNING': 'GOOD MORNING',
  'BOMBAY EXP.': 'BOMBAY EXP.',
  'BOMBAY EXP': 'BOMBAY EXP.',
  'GOLDEN': 'GOLDEN',
  'GOA GOLDEN': 'GOA GOLDEN',
  'GOLD STAR': 'GOLD STAR',
  'GOLDEN NIGHT': 'GOLDEN NIGHT',
  'TARA MUMBAI DAY': 'TARA MUMBAI DAY',
  'TARA MUMBAI NIGHT': 'TARA MUMBAI NIGHT',
  'NIGHT TIME BAZAR': 'NIGHT TIME BAZAR',
  'APPA BOSS': 'APPA BOSS',
  'JHANSI BAZAR': 'JHANSI BAZAR',
  'GOA': 'GOA'
};

/**
 * Fetch HTML from https://matkapulse.com/ with high performance and timeout
 */
export async function fetchMatkaPulseHtml(url: string = 'https://matkapulse.com/'): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Cache-Control': 'no-cache'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    return await res.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Parse live market results from MatkaPulse HTML
 * Extracts all 311+ markets from DOM .rrow elements and top .poptile cards
 */
export function parseMatkaPulseMarkets(html: string): MatkaPulseMarketResult[] {
  const map = new Map<string, MatkaPulseMarketResult>();

  // 1. Primary: Parse all <div class="rrow ..."> elements covering all 311+ markets
  try {
    const rrowRegex = /<div class="rrow\s+(s-done|s-open|s-wait)[^"]*">[\s\S]*?<span class="rrow-name">([^<]+)<\/span>[\s\S]*?<div class="digits"[^>]*>([\s\S]*?)<\/div>/g;
    let m: RegExpExecArray | null;
    while ((m = rrowRegex.exec(html)) !== null) {
      const status = m[1];
      const rawName = m[2].trim().toUpperCase();
      const digitsHtml = m[3];

      if (status === 's-wait' || digitsHtml.includes('Result awaited')) {
        continue;
      }

      // Extract pannas
      const pannas: string[] = [];
      const pannaRegex = /<span class="panna(?:\s+empty)?"[^>]*>([^<]*)<\/span>/g;
      let pMatch: RegExpExecArray | null;
      while ((pMatch = pannaRegex.exec(digitsHtml)) !== null) {
        pannas.push(pMatch[1].trim());
      }

      // Extract jodi
      const jodiRegex = /<span class="jodi">([\s\S]*?)<\/span>/g;
      const jMatch = jodiRegex.exec(digitsHtml);
      const cleanJodi = jMatch ? jMatch[1].replace(/<[^>]+>/g, '').trim() : '';

      const openPanna = pannas.length > 0 ? pannas[0] : '';
      const closePanna = pannas.length > 1 ? pannas[1] : '';

      let resultString = '';
      if (/^\d{3}$/.test(openPanna) && /^\d{2}$/.test(cleanJodi) && /^\d{3}$/.test(closePanna)) {
        // Full Matka: e.g. 278-74-789
        resultString = `${openPanna}-${cleanJodi}-${closePanna}`;
      } else if (/^\d{3}$/.test(openPanna) && cleanJodi.length >= 1 && /^\d/.test(cleanJodi)) {
        // Open Only: e.g. 360-9*-*** or 360-9
        resultString = `${openPanna}-${cleanJodi[0]}`;
      } else if (/^\d{2}$/.test(cleanJodi)) {
        // 2-digit Satta King: e.g. 41
        resultString = cleanJodi;
      }

      if (resultString) {
        map.set(rawName, { name: rawName, resultString });
      }
    }
  } catch (err: any) {
    console.warn('[MatkaPulse] Error parsing rrows:', err.message);
  }

  // 2. Secondary / Augmentation: Parse DOM .poptile cards at top
  try {
    const poptileRegex = /<span class="poptile-name">([^<]+)<\/span>\s*<span class="poptile-res">([^<]+)<\/span>/g;
    let pMatch: RegExpExecArray | null;
    while ((pMatch = poptileRegex.exec(html)) !== null) {
      const name = pMatch[1].trim().toUpperCase();
      const raw = pMatch[2].trim();
      if (raw && raw !== '--' && raw !== 'XX' && !raw.startsWith('***')) {
        if (!map.has(name)) {
          map.set(name, { name, resultString: raw });
        }
      }
    }
  } catch {}

  return Array.from(map.values());
}

export interface ParsedMatkaPulseResult {
  type: 'FULL_MATKA' | 'OPEN_ONLY' | 'SATTA_KING';
  openPanna: string | null;
  openDigit: string | null;
  closeDigit: string | null;
  closePanna: string | null;
  jodi: string | null;
}

/**
 * Parse raw result string into panna and digits
 * Supports Full Matka, Open Only (with or without asterisks), and Satta King 2-digit
 */
export function parseMatkaPulseResult(raw: string): ParsedMatkaPulseResult | null {
  if (!raw) return null;
  const cleaned = raw.replace(/\s+/g, '').toUpperCase();
  if (cleaned === '--' || cleaned === 'XX' || cleaned === '***' || cleaned === '**') return null;

  // Format 1: Full 3-digit Panna + Jodi + 3-digit Panna (e.g. 278-74-789 or 27874789)
  const fullMatkaMatch = cleaned.match(/^(\d{3})-?(\d{2})-?(\d{3})$/);
  if (fullMatkaMatch) {
    const openPanna = fullMatkaMatch[1];
    const jodi = fullMatkaMatch[2];
    const closePanna = fullMatkaMatch[3];
    const openDigit = jodi[0];
    const closeDigit = jodi[1];
    return { type: 'FULL_MATKA', openPanna, openDigit, closeDigit, closePanna, jodi };
  }

  // Format 2: Open only with panna (e.g. 360-9*-*** or 360-9**** or 360-9)
  const openMatch = cleaned.match(/^(\d{3})-?(\d)[*X]?-?[*X]*$/);
  if (openMatch) {
    const openPanna = openMatch[1];
    const openDigit = openMatch[2];
    return { type: 'OPEN_ONLY', openPanna, openDigit, closeDigit: null, closePanna: null, jodi: null };
  }

  // Format 3: 2-digit Satta King / Delhi (e.g. 74, 99, 15, 41)
  const sattaKingMatch = cleaned.match(/^(\d{2})$/);
  if (sattaKingMatch) {
    const jodi = sattaKingMatch[1];
    return { type: 'SATTA_KING', openPanna: null, openDigit: jodi[0], closeDigit: jodi[1], closePanna: null, jodi };
  }

  return null;
}

/**
 * Sync live results from https://matkapulse.com/ into local markets & market_results
 */
export async function syncMatkaPulseResults(): Promise<MatkaPulseSyncStatus> {
  const todayIST = getTodayIST();
  const updatedMarkets: string[] = [];

  try {
    const html = await fetchMatkaPulseHtml('https://matkapulse.com/');
    const parsedMarkets = parseMatkaPulseMarkets(html);

    if (parsedMarkets.length === 0) {
      throw new Error('No markets parsed from matkapulse.com HTML');
    }

    // Load all local markets
    const allDbMarkets = await db.queryAll('SELECT * FROM markets');
    const dbMarketByName = new Map<string, any>();
    for (const m of allDbMarkets) {
      dbMarketByName.set(m.name.trim().toUpperCase(), m);
    }

    for (const item of parsedMarkets) {
      const canonicalName = MARKET_NAME_MAP[item.name] || item.name;
      let targetMarket = dbMarketByName.get(canonicalName);

      if (!targetMarket) {
        continue;
      }

      const parsedResult = parseMatkaPulseResult(item.resultString);
      if (!parsedResult) continue;

      // Always update TODAY'S row in Indian Standard Time
      const targetDate = todayIST;
      const currentResult = await db.queryOne(
        'SELECT * FROM market_results WHERE market_id = ? AND date = ?',
        [targetMarket.id, targetDate]
      );

      // Never overwrite manual admin overrides
      if (currentResult && Number(currentResult.is_manual_override) === 1) {
        continue;
      }

      let needsUpdate = false;

      if (!currentResult) {
        needsUpdate = true;
      } else {
        if (parsedResult.type === 'FULL_MATKA') {
          if (
            currentResult.open_panna !== parsedResult.openPanna ||
            currentResult.close_panna !== parsedResult.closePanna ||
            currentResult.jodi !== parsedResult.jodi ||
            currentResult.status !== 'CLOSED'
          ) {
            needsUpdate = true;
          }
        } else if (parsedResult.type === 'OPEN_ONLY') {
          if (
            currentResult.open_panna !== parsedResult.openPanna ||
            currentResult.open_digit !== parsedResult.openDigit
          ) {
            needsUpdate = true;
          }
        } else if (parsedResult.type === 'SATTA_KING') {
          if (currentResult.jodi !== parsedResult.jodi) {
            needsUpdate = true;
          }
        }
      }

      if (needsUpdate) {
        console.log(`⚡ [MatkaPulse Live Sync] Updating ${canonicalName} on ${targetDate}: ${item.resultString} (${parsedResult.type})`);
        
        if (parsedResult.type === 'OPEN_ONLY') {
          await settleMarketResults({
            marketId: targetMarket.id,
            date: targetDate,
            openPanna: parsedResult.openPanna,
            openDigit: parsedResult.openDigit,
            closeDigit: null,
            closePanna: null,
            jodi: null,
            isOpenOnly: true,
            isManualOverride: false
          });
        } else if (parsedResult.type === 'FULL_MATKA') {
          await settleMarketResults({
            marketId: targetMarket.id,
            date: targetDate,
            openPanna: parsedResult.openPanna,
            openDigit: parsedResult.openDigit,
            closeDigit: parsedResult.closeDigit,
            closePanna: parsedResult.closePanna,
            jodi: parsedResult.jodi,
            isOpenOnly: false,
            isManualOverride: false
          });
        } else if (parsedResult.type === 'SATTA_KING') {
          await settleMarketResults({
            marketId: targetMarket.id,
            date: targetDate,
            openPanna: null,
            openDigit: parsedResult.openDigit,
            closeDigit: parsedResult.closeDigit,
            closePanna: null,
            jodi: parsedResult.jodi,
            isOpenOnly: false,
            isManualOverride: false
          });
        }

        updatedMarkets.push(`${canonicalName}: ${item.resultString}`);
      }
    }

    syncStatus = {
      source: 'https://matkapulse.com/',
      lastSyncAt: new Date().toISOString(),
      lastSyncSuccess: true,
      lastMessage: `Synced ${parsedMarkets.length} markets from MatkaPulse. Updated ${updatedMarkets.length} market(s).`,
      totalParsed: parsedMarkets.length,
      updatedMarkets
    };

    return syncStatus;
  } catch (err: any) {
    syncStatus = {
      source: 'https://matkapulse.com/',
      lastSyncAt: new Date().toISOString(),
      lastSyncSuccess: false,
      lastMessage: `MatkaPulse Sync failed: ${err.message}`,
      totalParsed: 0,
      updatedMarkets: []
    };
    console.error('[MatkaPulse Sync Error]:', err.message);
    return syncStatus;
  }
}

/**
 * Start the MatkaPulse real-time background sync worker (Runs every 30 seconds)
 */
export function startMatkaPulseSyncWorker() {
  console.log('⚡ [MatkaPulse Worker] Started MatkaPulse real-time live results sync worker (Every 30s from https://matkapulse.com/)...');

  // Run on startup after 3 seconds
  setTimeout(() => {
    syncMatkaPulseResults().catch(err => console.error('[MatkaPulse Initial Run Error]:', err.message));
  }, 3000);

  // Poll every 30 seconds
  setInterval(() => {
    syncMatkaPulseResults().catch(err => console.error('[MatkaPulse Interval Error]:', err.message));
  }, 30000);
}
