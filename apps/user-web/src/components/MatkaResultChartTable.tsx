import React, { useMemo, useState } from 'react';

export interface ChartRecord {
  date: string;
  open_panna?: string;
  open_digit?: string;
  close_digit?: string;
  close_panna?: string;
  jodi?: string;
}

interface MatkaResultChartTableProps {
  marketName: string;
  records: ChartRecord[];
  mode?: 'panel' | 'jodi';
  openTime?: string;
  closeTime?: string;
}

// Format date into DD/MM/YYYY (e.g. "24/06/2013" matching reference screen recording)
function formatDateFull(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00Z');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = String(d.getUTCFullYear());
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return dateStr;
  }
}

// Get the Monday of the week for a given date
function getMondayOfWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setUTCDate(diff));
  return monday.toISOString().split('T')[0];
}

// Authentic Indian Matka Red Jodi rule:
// 1. Double digits (Full Red / Family): 00, 11, 22, 33, 44, 55, 66, 77, 88, 99
// 2. Cut pairs (Half Red / Cut family): 05, 50, 16, 61, 27, 72, 38, 83, 49, 94
export function isRedJodi(jodi?: string): boolean {
  if (!jodi || jodi.length !== 2) return false;
  const d1 = parseInt(jodi[0], 10);
  const d2 = parseInt(jodi[1], 10);
  if (isNaN(d1) || isNaN(d2)) return false;
  return d1 === d2 || Math.abs(d1 - d2) === 5;
}

// Deterministic Dhamaka generator for the top card (Frame 004 & Frame 012)
function getMarketDhamaka(marketName: string, dateStr?: string) {
  const seedStr = `${marketName.toUpperCase()}-${dateStr || new Date().toISOString().slice(0, 10)}`;
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) - hash + seedStr.charCodeAt(i)) | 0;
  }
  const nextRand = () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };

  // AAj Ka Single: 4 digits
  const singles: number[] = [];
  while (singles.length < 4) {
    const d = Math.floor(nextRand() * 10);
    if (!singles.includes(d)) singles.push(d);
  }

  // Jodi Dhamaka: 8 pairs (2 rows of 4)
  const jodis: string[] = [];
  while (jodis.length < 8) {
    const d1 = singles[Math.floor(nextRand() * singles.length)];
    const d2 = Math.floor(nextRand() * 10);
    const j = `${d1}${d2}`;
    if (!jodis.includes(j)) jodis.push(j);
  }

  // Tripple Dhamaka: 8 common panna triplets (2 rows of 4)
  const commonPannas = [
    '444', '135', '137', '600', '222', '459', '478', '333',
    '150', '469', '270', '468', '246', '123', '249', '280'
  ];
  const pannas: string[] = [];
  while (pannas.length < 8) {
    const p = commonPannas[Math.floor(nextRand() * commonPannas.length)];
    if (!pannas.includes(p)) pannas.push(p);
  }

  return {
    singles,
    jodiRow1: jodis.slice(0, 4),
    jodiRow2: jodis.slice(4, 8),
    pannaRow1: pannas.slice(0, 4),
    pannaRow2: pannas.slice(4, 8)
  };
}

interface WeekBlock {
  monday: string;
  sunday: string;
  days: {
    date: string;
    dayIndex: number; // 0 = Mon, ..., 5 = Sat, 6 = Sun
    record?: ChartRecord;
  }[];
}

const DISAWAR_MARKET_NAMES = [
  'DESAWAR',
  'DELHI BAZAR',
  'SHREE GANESH',
  'FARIDABAD',
  'GAZIABAD',
  'GALI'
];

export const MatkaResultChartTable: React.FC<MatkaResultChartTableProps> = ({
  marketName,
  records,
  mode = 'jodi',
  openTime = '14:00',
  closeTime = '15:00'
}) => {
  const isDisawarStyle = DISAWAR_MARKET_NAMES.some(name =>
    marketName.toUpperCase().includes(name)
  );

  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Deterministic daily prediction dhamaka for top card
  const dhamaka = useMemo(() => getMarketDhamaka(marketName), [marketName]);

  // Check if any record in the dataset falls on Sunday
  const hasSundayData = useMemo(() => {
    return records.some(r => {
      if (!r.date || (!r.jodi && !r.open_digit)) return false;
      const d = new Date(r.date + 'T12:00:00Z');
      return d.getUTCDay() === 0;
    });
  }, [records]);

  const numDaysPerWeek = hasSundayData ? 7 : 6;

  // Render 3 digits of a panna vertically stacked
  const renderPanaDigits = (pana?: string) => {
    if (!pana || pana === '***' || pana.length !== 3) {
      return (
        <div className="ref-pana-stack">
          <span>*</span>
          <span>*</span>
          <span>*</span>
        </div>
      );
    }
    return (
      <div className="ref-pana-stack">
        <span>{pana[0]}</span>
        <span>{pana[1]}</span>
        <span>{pana[2]}</span>
      </div>
    );
  };

  // ========================================================
  // TOP DHAMAKA & RATES HEADER CARD (Matching Frames 004 & 012)
  // ========================================================
  const renderDhamakaHeader = () => (
    <div className="ref-chart-rates-card">
      {/* 1. Rate Strip */}
      <div className="ref-rates-top-strip">
        Rate. Single::10/95 Jodi::10/950 Sp::10/1500 Dp::10/3000 TP::10/9500
      </div>

      {/* 2. Timing & Market Name Row */}
      <div className="ref-rates-timing-row">
        <div className="ref-timing-left">
          Open Time : {openTime}
        </div>
        <div className="ref-timing-market-title">
          {marketName.toUpperCase()}
        </div>
        <div className="ref-timing-right">
          Close Time : {closeTime}
        </div>
      </div>

      {/* 3. Dhamaka Grid (Aaj Ka Single | Jodi Dhamaka | Tripple Dhamaka) */}
      <div className="ref-dhamaka-grid-row">
        {/* Col 1: AAj Ka Single */}
        <div className="ref-dhamaka-col ref-dhamaka-single">
          <div className="ref-dhamaka-heading">AAj Ka Single</div>
          <div className="ref-single-digits">
            {dhamaka.singles.join(' , ')}
          </div>
        </div>

        {/* Col 2: Jodi Dhamaka */}
        <div className="ref-dhamaka-col ref-dhamaka-jodi">
          <div className="ref-dhamaka-heading">Jodi Dhamaka</div>
          <div className="ref-dhamaka-numbers-box">
            <div className="ref-number-row">
              {dhamaka.jodiRow1.map((j, idx) => (
                <span key={idx}>{j}</span>
              ))}
            </div>
            <div className="ref-number-row">
              {dhamaka.jodiRow2.map((j, idx) => (
                <span key={idx}>{j}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Col 3: Tripple Dhamaka */}
        <div className="ref-dhamaka-col ref-dhamaka-tripple">
          <div className="ref-dhamaka-heading">Tripple Dhamaka</div>
          <div className="ref-dhamaka-numbers-box">
            <div className="ref-number-row">
              {dhamaka.pannaRow1.map((p, idx) => (
                <span key={idx}>{p}</span>
              ))}
            </div>
            <div className="ref-number-row">
              {dhamaka.pannaRow2.map((p, idx) => (
                <span key={idx}>{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ========================================================
  // CASE 1: Starline / Delhi / Disawar Monthly Table
  // ========================================================
  if (isDisawarStyle) {
    const monthMap = new Map<string, string>();
    const recordByDate = new Map<string, ChartRecord>();

    records.forEach(r => {
      if (!r.date) return;
      recordByDate.set(r.date, r);
      const ym = r.date.slice(0, 7);
      if (!monthMap.has(ym)) {
        try {
          const d = new Date(r.date + 'T12:00:00Z');
          const monthShort = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).toUpperCase();
          const year = d.getUTCFullYear();
          monthMap.set(ym, `${monthShort} ${year}`);
        } catch {
          monthMap.set(ym, ym);
        }
      }
    });

    let sortedYm = Array.from(monthMap.keys()).sort();
    if (sortedYm.length > 5) {
      sortedYm = sortedYm.slice(-5);
    }

    const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

    return (
      <div className="ref-chart-container">
        {renderDhamakaHeader()}

        {/* Amber Title Banner */}
        <div className="ref-chart-title-banner">
          {marketName.toUpperCase()} Monthly Result Chart
        </div>

        {/* Table */}
        <div className="ref-table-scroll-wrapper">
          <table className="ref-matka-table">
            <thead>
              <tr className="ref-thead-crimson">
                <th className="ref-th-date">DATE</th>
                {sortedYm.map(ym => (
                  <th key={ym} className="ref-th-day">
                    {monthMap.get(ym)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map(dayStr => (
                <tr key={dayStr} className="ref-tbody-row">
                  <td className="ref-td-date-cell ref-td-date-day">{dayStr}</td>
                  {sortedYm.map(ym => {
                    const fullDate = `${ym}-${dayStr}`;
                    const rec = recordByDate.get(fullDate);
                    const jodi = rec?.jodi || (rec?.open_digit && rec?.close_digit ? `${rec.open_digit}${rec.close_digit}` : '');

                    const [y, m] = ym.split('-').map(Number);
                    const dNum = Number(dayStr);
                    const daysInMonth = new Date(y, m, 0).getDate();
                    if (dNum > daysInMonth) {
                      return <td key={ym} className="ref-td-empty">—</td>;
                    }

                    const isRed = isRedJodi(jodi);

                    return (
                      <td key={ym} className="ref-td-data-cell">
                        <span className={`ref-jodi-number ${isRed ? 'ref-num-red' : 'ref-num-black'}`}>
                          {jodi || '**'}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ========================================================
  // CASE 2: Regular Weekly Table (Frames 004, 008, 012, 015)
  // Columns: Date | Mon | Tue | Wed | Thu | Fri | Sat (or Sun)
  // ========================================================
  const weekMap = new Map<string, Map<string, ChartRecord>>();

  records.forEach(r => {
    if (!r.date) return;
    const mon = getMondayOfWeek(r.date);
    if (!weekMap.has(mon)) {
      weekMap.set(mon, new Map());
    }
    weekMap.get(mon)!.set(r.date, r);
  });

  const weekBlocks: WeekBlock[] = [];

  weekMap.forEach((dateToRec, monStr) => {
    const monDate = new Date(monStr + 'T12:00:00Z');
    const endDate = new Date(monDate);
    endDate.setUTCDate(monDate.getUTCDate() + (numDaysPerWeek - 1));
    const endStr = endDate.toISOString().split('T')[0];

    const days: WeekBlock['days'] = [];

    for (let i = 0; i < numDaysPerWeek; i++) {
      const cur = new Date(monDate);
      cur.setUTCDate(monDate.getUTCDate() + i);
      const curStr = cur.toISOString().split('T')[0];
      days.push({
        date: curStr,
        dayIndex: i,
        record: dateToRec.get(curStr)
      });
    }

    weekBlocks.push({ monday: monStr, sunday: endStr, days });
  });

  // Sort order: default newest week first (descending) so user instantly sees current week on mobile
  if (sortOrder === 'desc') {
    weekBlocks.sort((a, b) => b.monday.localeCompare(a.monday));
  } else {
    weekBlocks.sort((a, b) => a.monday.localeCompare(b.monday));
  }

  const chartTitle = mode === 'panel'
    ? `${marketName.toUpperCase()} Panel / Panna Chart • ${numDaysPerWeek} days`
    : `${marketName.toUpperCase()} Jodi Chart • ${numDaysPerWeek} days`;

  return (
    <div className="ref-chart-container">
      {/* 1. Top Black & Gold Rates Card */}
      {renderDhamakaHeader()}

      {/* 2. Amber Title Banner with Sort Toggle */}
      <div className="ref-chart-title-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px' }}>
        <span>{chartTitle}</span>
        <button
          type="button"
          onClick={() => setSortOrder(s => s === 'desc' ? 'asc' : 'desc')}
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: 6,
            color: 'white',
            padding: '3px 8px',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          {sortOrder === 'desc' ? '⬇ Newest First' : '⬆ Oldest First'}
        </button>
      </div>

      {/* 3. The Chart Table */}
      <div className="ref-table-scroll-wrapper">
        <table className={`ref-matka-table ${mode === 'panel' ? 'ref-table-panel-mode' : 'ref-table-jodi-mode'}`}>
          <thead>
            <tr className="ref-thead-crimson">
              <th className="ref-th-date">Date</th>
              <th className="ref-th-day">Mon</th>
              <th className="ref-th-day">Tue</th>
              <th className="ref-th-day">Wed</th>
              <th className="ref-th-day">Thu</th>
              <th className="ref-th-day">Fri</th>
              <th className="ref-th-day">Sat</th>
              {hasSundayData && <th className="ref-th-day">Sun</th>}
            </tr>
          </thead>
          <tbody>
            {weekBlocks.length === 0 ? (
              <tr>
                <td colSpan={numDaysPerWeek + 1} style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                  No historical records found for this market.
                </td>
              </tr>
            ) : (
              weekBlocks.map(wb => (
                <tr key={wb.monday} className="ref-tbody-row">
                  {/* Date Column: 3 lines (DD/MM/YYYY to DD/MM/YYYY) */}
                  <td className="ref-td-date-cell">
                    <div className="ref-date-range-block">
                      <span>{formatDateFull(wb.monday)}</span>
                      <span className="ref-date-to-word">to</span>
                      <span>{formatDateFull(wb.sunday)}</span>
                    </div>
                  </td>

                  {/* Day Columns (Mon to Sat / Sun) */}
                  {wb.days.map(d => {
                    const rec = d.record;
                    const jodi = rec?.jodi || (rec?.open_digit && rec?.close_digit ? `${rec.open_digit}${rec.close_digit}` : '');
                    const isRed = isRedJodi(jodi);

                    if (mode === 'panel') {
                      return (
                        <td key={d.date} className="ref-td-panel-cell">
                          <div className={`ref-cell-tri-grid ${isRed ? 'ref-cell-red' : 'ref-cell-black'}`}>
                            {/* Left: Open Panna (3 digits stacked vertically) */}
                            <div className="ref-tri-pana-open">
                              {renderPanaDigits(rec?.open_panna)}
                            </div>

                            {/* Middle: Jodi Number (2 digits bold) */}
                            <div className="ref-tri-jodi">
                              <span className="ref-jodi-number">
                                {jodi || '**'}
                              </span>
                            </div>

                            {/* Right: Close Panna (3 digits stacked vertically) */}
                            <div className="ref-tri-pana-close">
                              {renderPanaDigits(rec?.close_panna)}
                            </div>
                          </div>
                        </td>
                      );
                    }

                    // Jodi Mode (Big bold 2-digit number in center)
                    return (
                      <td key={d.date} className="ref-td-jodi-cell">
                        <span className={`ref-jodi-number ${isRed ? 'ref-num-red' : 'ref-num-black'}`}>
                          {jodi || '**'}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
