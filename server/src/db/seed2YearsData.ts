import db from './database';
import { SINGLE_PANNAS, DOUBLE_PANNAS, TRIPLE_PANNAS, calculateAnkFromPanna } from '../services/matkaUtils';

// Group all valid 220 pannas by their Ank (digit 0-9)
const PANNAS_BY_ANK: { [ank: string]: string[] } = {
  '0': [], '1': [], '2': [], '3': [], '4': [],
  '5': [], '6': [], '7': [], '8': [], '9': []
};

const ALL_PANNAS = [...SINGLE_PANNAS, ...DOUBLE_PANNAS, ...TRIPLE_PANNAS];
for (const p of ALL_PANNAS) {
  const ank = calculateAnkFromPanna(p);
  if (PANNAS_BY_ANK[ank]) {
    PANNAS_BY_ANK[ank].push(p);
  }
}

// Pseudo-random deterministic number generator seeded by string
function pseudoRandom(seedStr: string): number {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    const char = seedStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export async function seedTwoYearsHistoricalResults() {
  console.log('[Seed 2 Years] Starting full 2-year historical data generation (2024-11-01 to 2026-11-01)...');

  const allMarkets = await db.queryAll('SELECT id, name, sort_order FROM markets ORDER BY sort_order ASC');
  if (!allMarkets || allMarkets.length === 0) {
    console.log('[Seed 2 Years] No markets found in database.');
    return;
  }

  // Date range: 731 days (from 2024-11-01 to 2026-11-01)
  const startDate = new Date('2024-11-01T12:00:00Z');
  const endDate = new Date('2026-11-01T12:00:00Z');

  const dates: string[] = [];
  const cur = new Date(startDate);
  while (cur <= endDate) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  console.log(`[Seed 2 Years] Generated date range: ${dates.length} days for ${allMarkets.length} markets.`);

  // Frame 8: Exact Kashi King weeks
  const kashiKnownJodis: { [dateStr: string]: string } = {
    // 26/10/26 to 01/11/26
    '2026-10-26': '36', '2026-10-27': '46', '2026-10-28': '08', '2026-10-29': '94', '2026-10-30': '25', '2026-10-31': '78', '2026-11-01': '16',
    // 19/10/26 to 25/10/26
    '2026-10-19': '31', '2026-10-20': '45', '2026-10-21': '95', '2026-10-22': '07', '2026-10-23': '25', '2026-10-24': '75', '2026-10-25': '56',
    // 12/10/26 to 18/10/26
    '2026-10-12': '49', '2026-10-13': '31', '2026-10-14': '97', '2026-10-15': '96', '2026-10-16': '97', '2026-10-17': '13', '2026-10-18': '21',
    // 05/10/26 to 11/10/26
    '2026-10-05': '33', '2026-10-06': '46', '2026-10-07': '33', '2026-10-08': '65', '2026-10-09': '13', '2026-10-10': '92', '2026-10-11': '42',
    // 28/09/26 to 04/10/26
    '2026-09-28': '17', '2026-09-29': '71', '2026-09-30': '63', '2026-10-01': '74', '2026-10-02': '23', '2026-10-03': '14', '2026-10-04': '88',
    // 21/09/26 to 27/09/26
    '2026-09-21': '54', '2026-09-22': '45', '2026-09-23': '02', '2026-09-24': '12', '2026-09-25': '52', '2026-09-26': '68', '2026-09-27': '34',
    // 14/09/26 to 20/09/26
    '2026-09-14': '80', '2026-09-15': '94', '2026-09-16': '28', '2026-09-17': '52', '2026-09-18': '63', '2026-09-19': '18', '2026-09-20': '62',
    // 07/09/26 to 13/09/26
    '2026-09-07': '43', '2026-09-08': '63', '2026-09-09': '33', '2026-09-10': '59', '2026-09-11': '17', '2026-09-12': '48', '2026-09-13': '92',
    // 31/08/26 to 06/09/26
    '2026-08-31': '24', '2026-09-01': '23', '2026-09-02': '34', '2026-09-03': '21', '2026-09-04': '85', '2026-09-05': '67', '2026-09-06': '63',
    // 24/08/26 to 30/08/26
    '2026-08-24': '75', '2026-08-25': '41', '2026-08-26': '39', '2026-08-27': '94', '2026-08-28': '22', '2026-08-29': '34', '2026-08-30': '54',
    // 17/08/26 to 23/08/26
    '2026-08-17': '97', '2026-08-18': '73', '2026-08-19': '63', '2026-08-20': '79', '2026-08-21': '49', '2026-08-22': '69', '2026-08-23': '36',
    // 10/08/26 to 16/08/26
    '2026-08-10': '38', '2026-08-11': '13', '2026-08-12': '24', '2026-08-13': '96', '2026-08-14': '64', '2026-08-15': '42', '2026-08-16': '46',
    // 03/08/26 to 09/08/26
    '2026-08-03': '67', '2026-08-04': '68', '2026-08-05': '88', '2026-08-06': '22', '2026-08-07': '12', '2026-08-08': '26', '2026-08-09': '66',
    // 27/07/26 to 02/08/26
    '2026-07-27': '37', '2026-07-28': '63', '2026-07-29': '56', '2026-07-30': '94', '2026-07-31': '66', '2026-08-01': '27', '2026-08-02': '97',
  };

  // Frame 14: Exact Delhi Bazar records
  const delhiBazarKnown: { [dateStr: string]: string } = {
    '2026-11-01': '30',
    '2026-10-01': '76', '2026-10-02': '25', '2026-10-03': '25', '2026-10-04': '91', '2026-10-05': '86', '2026-10-06': '29', '2026-10-07': '06',
    '2026-10-08': '07', '2026-10-09': '87', '2026-10-10': '71', '2026-10-11': '50', '2026-10-12': '22', '2026-10-13': '96', '2026-10-14': '12',
    '2026-10-15': '07', '2026-10-16': '66', '2026-10-17': '16', '2026-10-18': '74', '2026-10-19': '44', '2026-10-20': '29', '2026-10-21': '86',
    '2026-10-22': '73', '2026-10-23': '66', '2026-10-24': '53',
    '2026-09-01': '58', '2026-09-02': '52', '2026-09-03': '88', '2026-09-04': '18', '2026-09-05': '44', '2026-09-06': '71', '2026-09-07': '61',
    '2026-09-08': '84', '2026-09-09': '18', '2026-09-10': '52', '2026-09-11': '59', '2026-09-12': '81', '2026-09-13': '55', '2026-09-14': '86',
    '2026-09-15': '46', '2026-09-16': '68', '2026-09-17': '99', '2026-09-18': '84', '2026-09-19': '24', '2026-09-20': '47', '2026-09-21': '62',
    '2026-09-22': '03', '2026-09-23': '92', '2026-09-24': '27',
    '2026-08-01': '71', '2026-08-02': '09', '2026-08-03': '53', '2026-08-04': '12', '2026-08-05': '47', '2026-08-06': '61', '2026-08-07': '52',
    '2026-08-08': '91', '2026-08-09': '89', '2026-08-10': '85', '2026-08-11': '78', '2026-08-12': '94', '2026-08-13': '40', '2026-08-14': '69',
    '2026-08-15': '10', '2026-08-16': '34', '2026-08-17': '01', '2026-08-18': '01', '2026-08-19': '05', '2026-08-20': '36', '2026-08-21': '35',
    '2026-08-22': '14', '2026-08-23': '54', '2026-08-24': '61',
    '2026-07-01': '13', '2026-07-02': '12', '2026-07-03': '69', '2026-07-04': '57', '2026-07-05': '32', '2026-07-06': '57', '2026-07-07': '26',
    '2026-07-08': '83', '2026-07-09': '12', '2026-07-10': '12', '2026-07-11': '14', '2026-07-12': '18', '2026-07-13': '38', '2026-07-14': '92',
    '2026-07-15': '00', '2026-07-16': '37', '2026-07-21': '95', '2026-07-22': '83', '2026-07-23': '86', '2026-07-24': '56',
  };

  // Frame 12: Exact Desawar records
  const desawarKnown: { [dateStr: string]: string } = {
    '2026-10-02': '52', '2026-10-03': '18', '2026-10-04': '15', '2026-10-05': '70', '2026-10-06': '59', '2026-10-07': '23',
    '2026-10-08': '90', '2026-10-09': '26', '2026-10-10': '22', '2026-10-11': '27', '2026-10-12': '98', '2026-10-13': '97',
    '2026-10-14': '97', '2026-10-15': '42', '2026-10-16': '98', '2026-10-17': '97', '2026-10-18': '44', '2026-10-19': '23',
    '2026-10-20': '64', '2026-10-21': '72',
    '2026-09-02': '69', '2026-09-03': '57', '2026-09-04': '95', '2026-09-05': '59', '2026-09-06': '78', '2026-09-07': '67',
    '2026-09-08': '92', '2026-09-09': '54', '2026-09-10': '93', '2026-09-11': '40', '2026-09-12': '46', '2026-09-13': '02',
    '2026-09-14': '35', '2026-09-15': '89', '2026-09-16': '31', '2026-09-17': '90', '2026-09-18': '49', '2026-09-19': '35',
    '2026-09-20': '32', '2026-09-21': '01',
    '2026-08-02': '31', '2026-08-03': '74', '2026-08-04': '31', '2026-08-05': '93', '2026-08-06': '51', '2026-08-07': '83',
    '2026-08-08': '96', '2026-08-09': '16', '2026-08-10': '64', '2026-08-11': '88', '2026-08-12': '19', '2026-08-13': '79',
    '2026-08-14': '12', '2026-08-15': '49', '2026-08-16': '57', '2026-08-17': '40', '2026-08-18': '29', '2026-08-19': '40',
    '2026-08-20': '08', '2026-08-21': '18',
    '2026-07-02': '24', '2026-07-03': '39', '2026-07-04': '91', '2026-07-05': '23', '2026-07-06': '06', '2026-07-07': '19',
    '2026-07-08': '53', '2026-07-09': '02', '2026-07-10': '26', '2026-07-11': '53', '2026-07-12': '26', '2026-07-13': '66',
    '2026-07-14': '73', '2026-07-15': '16', '2026-07-16': '28', '2026-07-17': '32', '2026-07-21': '73',
  };

  const DISAWAR_NAMES = ['DESAWAR', 'DELHI BAZAR', 'SHREE GANESH', 'FARIDABAD', 'GAZIABAD', 'GALI'];

  let totalInserted = 0;

  for (const market of allMarkets) {
    const isDisawar = DISAWAR_NAMES.some(n => market.name.toUpperCase().includes(n));
    console.log(`[Seed 2 Years] Seeding ${market.name} (id: ${market.id})...`);

    for (const dateStr of dates) {
      let jodi: string | null = null;
      let openDigit: string | null = null;
      let closeDigit: string | null = null;
      let openPanna: string | null = null;
      let closePanna: string | null = null;

      // 1. Check if known authentic value exists
      if (market.name.includes('KASHI') && kashiKnownJodis[dateStr]) {
        jodi = kashiKnownJodis[dateStr];
      } else if (market.name === 'DELHI BAZAR' && delhiBazarKnown[dateStr]) {
        jodi = delhiBazarKnown[dateStr];
      } else if (market.name === 'DESAWAR' && desawarKnown[dateStr]) {
        jodi = desawarKnown[dateStr];
      }

      // 2. Deterministically generate if not known
      if (!jodi) {
        const hashVal = pseudoRandom(`${market.id}_${market.name}_${dateStr}`);
        const jodiNum = hashVal % 100;
        jodi = String(jodiNum).padStart(2, '0');
      }

      openDigit = jodi[0];
      closeDigit = jodi[1];

      // Pick authentic valid pannas
      const openPannaList = PANNAS_BY_ANK[openDigit] || ['128'];
      const closePannaList = PANNAS_BY_ANK[closeDigit] || ['137'];

      const hashPanna1 = pseudoRandom(`open_${market.id}_${dateStr}`);
      const hashPanna2 = pseudoRandom(`close_${market.id}_${dateStr}`);

      openPanna = openPannaList[hashPanna1 % openPannaList.length];
      closePanna = closePannaList[hashPanna2 % closePannaList.length];

      // If Disawar single-session market, panna can still be recorded or formatted
      await db.execute(
        `INSERT INTO market_results (market_id, date, open_panna, open_digit, close_digit, close_panna, jodi, status, declared_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'CLOSED', CURRENT_TIMESTAMP)
         ON CONFLICT(market_id, date) DO UPDATE SET
           open_panna = excluded.open_panna,
           open_digit = excluded.open_digit,
           close_digit = excluded.close_digit,
           close_panna = excluded.close_panna,
           jodi = excluded.jodi,
           status = 'CLOSED'`,
        [market.id, dateStr, openPanna, openDigit, closeDigit, closePanna, jodi]
      );
      totalInserted++;
    }
  }

  console.log(`[Seed 2 Years] Finished! Total historical results updated/inserted: ${totalInserted}`);
}

// If executed directly via CLI
if (require.main === module) {
  seedTwoYearsHistoricalResults()
    .then(() => {
      console.log('[Seed 2 Years] Seeding completed successfully.');
      process.exit(0);
    })
    .catch(err => {
      console.error('[Seed 2 Years] Error seeding data:', err);
      process.exit(1);
    });
}
