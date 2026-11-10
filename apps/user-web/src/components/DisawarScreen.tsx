import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Trophy, RotateCcw, ChevronLeft, ChevronRight, ChevronUp, Play, Pause } from 'lucide-react';
import { MarketClosedToast } from './MarketClosedToast';
import { playClosedMarketSound } from '../utils/soundEffects';

interface DisawarMarket {
  id: number;
  name: string;
  hindi_name?: string;
  open_time: string;
  close_time: string;
  open_time_24: string;
  close_time_24: string;
  oldResult: string;
  oldTime: string;
  newResult: string;
  newTime: string;
  status: string;
  canPlay: boolean;
}

interface MonthlyDayRecord {
  day: number;
  date: string;
  dayOfWeek: string;
  results: { [marketName: string]: string | null };
}

interface MonthlyChartData {
  yearMonth: string;
  monthTitle: string;
  markets: string[];
  days: MonthlyDayRecord[];
}

interface DisawarScreenProps {
  user: any;
  onBack: () => void;
  onOpenBetting: (market: DisawarMarket) => void;
  onOpenBidHistory: () => void;
  onOpenWinHistory: () => void;
}

export const DisawarScreen: React.FC<DisawarScreenProps> = ({
  user,
  onBack,
  onOpenBetting,
  onOpenBidHistory,
  onOpenWinHistory,
}) => {
  const [markets, setMarkets] = useState<DisawarMarket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [closedToastMsg, setClosedToastMsg] = useState<string | null>(null);
  const [currentYearMonth, setCurrentYearMonth] = useState<string>(() => {
    return new Date().toISOString().slice(0, 7); // e.g. "2026-11"
  });
  const [chartData, setChartData] = useState<MonthlyChartData | null>(null);
  const [loadingChart, setLoadingChart] = useState<boolean>(false);

  // Play button click sound
  const playClickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {
      // AudioContext not allowed before user gesture
    }
  };

  // Fetch Disawar markets list
  useEffect(() => {
    const fetchDisawarMarkets = async () => {
      try {
        const res = await fetch(`/api/v1/markets/disawar?t=${Date.now()}`, {
          cache: 'no-store'
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.markets)) {
          setMarkets(data.markets);
        }
      } catch (err) {
        console.error('Failed to load disawar markets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDisawarMarkets();
    const interval = setInterval(fetchDisawarMarkets, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  // Fetch Disawar monthly chart
  useEffect(() => {
    const fetchMonthlyChart = async () => {
      setLoadingChart(true);
      try {
        const res = await fetch(`/api/v1/results/disawar-monthly?yearMonth=${currentYearMonth}&t=${Date.now()}`, {
          cache: 'no-store'
        });
        const data = await res.json();
        if (data.success) {
          setChartData(data);
        }
      } catch (err) {
        console.error('Failed to load monthly chart:', err);
      } finally {
        setLoadingChart(false);
      }
    };

    fetchMonthlyChart();
  }, [currentYearMonth]);

  // Navigate months
  const handlePrevMonth = () => {
    playClickSound();
    const [y, m] = currentYearMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const ym = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    setCurrentYearMonth(ym);
  };

  const handleNextMonth = () => {
    playClickSound();
    const [y, m] = currentYearMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const ym = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    setCurrentYearMonth(ym);
  };

  const scrollToChart = () => {
    playClickSound();
    const elem = document.getElementById('disawar-chart-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    playClickSound();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="disawar-container">
      {/* 1. Header (Matching Reference Frame 2) */}
      <div className="disawar-header">
        <button
          className="disawar-back-btn"
          onClick={() => {
            playClickSound();
            onBack();
          }}
          aria-label="Back to home"
        >
          <ArrowLeft size={20} color="#0f172a" />
        </button>

        <div className="disawar-logo-text">
          <span style={{
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FDE047 35%, #F59E0B 75%, #B45309 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.04em'
          }}>GOLDEN MATKA</span>
        </div>

        <div className="disawar-header-right">
          <div className="disawar-wallet-pill">
            <span>₹{user ? Number(user.wallet_balance || 0).toFixed(2) : '0.00'}</span>
          </div>
          <button className="disawar-bell-btn" aria-label="Notifications">
            <Bell size={20} color="white" />
            <span className="disawar-bell-dot"></span>
          </button>
        </div>
      </div>

      {/* 2. Game Rates Live Ticker (Matching Reference Frame 7) */}
      <div className="disawar-ticker-bar">
        <div className="disawar-rates-badge">
          <span className="rates-flame">🔥</span>
          <span className="rates-title">GAME RATES</span>
        </div>
        <div className="disawar-ticker-marquee">
          <div className="disawar-ticker-content">
            ANDAR HARUF&nbsp;&nbsp;<strong>10 X 95</strong>&nbsp;&nbsp;|&nbsp;&nbsp;
            BAHAR HARUF&nbsp;&nbsp;<strong>10 X 95</strong>&nbsp;&nbsp;|&nbsp;&nbsp;
            JODI&nbsp;&nbsp;<strong>10 X 950</strong>&nbsp;&nbsp;|&nbsp;&nbsp;
            CROSSING&nbsp;&nbsp;<strong>10 X 950</strong>&nbsp;&nbsp;|&nbsp;&nbsp;
            ANDAR HARUF&nbsp;&nbsp;<strong>10 X 95</strong>&nbsp;&nbsp;|&nbsp;&nbsp;
            BAHAR HARUF&nbsp;&nbsp;<strong>10 X 95</strong>&nbsp;&nbsp;|&nbsp;&nbsp;
            JODI&nbsp;&nbsp;<strong>10 X 950</strong>
          </div>
        </div>
      </div>

      {/* 3. Bid & Win History Action Buttons (Matching Reference Frame 2) */}
      <div className="disawar-action-row">
        <button
          className="disawar-btn-bid-history"
          onClick={() => {
            playClickSound();
            onOpenBidHistory();
          }}
        >
          <RotateCcw size={16} strokeWidth={2.5} />
          <span>BID HISTORY</span>
        </button>

        <button
          className="disawar-btn-win-history"
          onClick={() => {
            playClickSound();
            onOpenWinHistory();
          }}
        >
          <Trophy size={16} strokeWidth={2.5} />
          <span>WIN HISTORY</span>
        </button>
      </div>

      {/* 4. Market Cards List (Matching Reference Frame 2 & 28) */}
      <div className="disawar-cards-list">
        {loading ? (
          <div className="disawar-loading-box">Loading Disawar Markets...</div>
        ) : markets.length === 0 ? (
          <div className="disawar-loading-box">No Disawar markets available.</div>
        ) : (
          markets.map((m) => (
            <div key={m.id} className="disawar-card">
              {/* Left Column: 3D Bar Chart Icon + "CHART" */}
              <button
                className={`disawar-card-chart-btn ${!m.canPlay ? 'chart-closed' : ''}`}
                onClick={scrollToChart}
                title="View Chart"
              >
                <div className="disawar-chart-icon-wrap">
                  <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                    {/* Blue bar */}
                    <rect x="5" y="16" width="6" height="14" rx="2" fill="#38BDF8" />
                    {/* Green bar */}
                    <rect x="14" y="10" width="6" height="20" rx="2" fill="#34D399" />
                    {/* Yellow bar */}
                    <rect x="23" y="14" width="6" height="16" rx="2" fill="#FBBF24" />
                    {/* Red curved ascending arrow */}
                    <path
                      d="M6 14C11 7 18 6 27 5M27 5L22 4M27 5L26 10"
                      stroke="#EF4444"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="disawar-chart-label">CHART</span>
              </button>

              {/* Center Column: Market Name & OLD/NEW Result Comparison */}
              <div className="disawar-card-center">
                <div className="disawar-market-title">{m.name}</div>
                <div className="disawar-results-row">
                  {/* OLD Result */}
                  <div className="disawar-result-box-wrap">
                    <div className={`disawar-res-box ${!m.canPlay ? 'grey-box' : 'red-box'}`}>
                      {m.oldResult || '**'}
                    </div>
                    <span className="res-tag red-tag">OLD</span>
                    <span className="res-time">{m.oldTime}</span>
                  </div>

                  {/* Arrow */}
                  <div className="disawar-res-arrow">
                    <ChevronRight size={18} color="#94A3B8" strokeWidth={3} />
                  </div>

                  {/* NEW Result */}
                  <div className="disawar-result-box-wrap">
                    <div className={`disawar-res-box ${!m.canPlay ? 'grey-box' : 'green-box'}`}>
                      {m.newResult || '**'}
                    </div>
                    <span className="res-tag green-tag">NEW</span>
                    <span className="res-time">{m.newTime}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: 3D Circular Play or Pause Button */}
              <button
                className={`disawar-play-btn ${!m.canPlay ? 'btn-closed' : ''}`}
                onClick={() => {
                  if (!m.canPlay) {
                    playClosedMarketSound();
                    setClosedToastMsg(`${m.name} IS CURRENTLY CLOSED`);
                    return;
                  }
                  playClickSound();
                  onOpenBetting(m);
                }}
                aria-label={m.canPlay ? `Play ${m.name}` : `${m.name} Closed`}
              >
                <div className={`play-btn-inner ${!m.canPlay ? 'inner-closed' : ''}`}>
                  {m.canPlay ? (
                    <Play size={22} fill="white" strokeWidth={0} />
                  ) : (
                    <Pause size={20} fill="white" strokeWidth={0} />
                  )}
                </div>
              </button>
            </div>
          ))
        )}
      </div>

      {/* 5. Disawar Monthly Result Chart Table (Matching Reference Frame 5 & 28) */}
      <div id="disawar-chart-section" className="disawar-chart-section">
        {/* Month Selector Banner */}
        <div className="disawar-month-banner">
          <button className="month-nav-arrow" onClick={handlePrevMonth} aria-label="Previous month">
            <ChevronLeft size={22} color="white" />
          </button>
          <div className="month-banner-title">
            <span className="calendar-icon">📅</span>
            <span>{chartData?.monthTitle || 'NOVEMBER 2026'}</span>
          </div>
          <button className="month-nav-arrow" onClick={handleNextMonth} aria-label="Next month">
            <ChevronRight size={22} color="white" />
          </button>
        </div>

        {/* Table */}
        <div className="disawar-table-wrapper">
          {loadingChart ? (
            <div className="disawar-chart-loading">Loading Monthly Results...</div>
          ) : chartData && chartData.days.length > 0 ? (
            <table className="disawar-monthly-table">
              <thead>
                <tr>
                  <th className="th-date-col">DATE</th>
                  {(chartData.markets || []).map((mName) => (
                    <th key={mName} className="th-market-col">
                      {mName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chartData.days.map((row) => {
                  const isToday = row.date === todayStr;
                  return (
                    <tr key={row.date} className={`tr-date-row ${isToday ? 'row-today' : ''}`}>
                      {/* Date Column */}
                      <td className="td-date-cell">
                        <div className="date-number">{row.day}</div>
                        <div className="date-day-name">{row.dayOfWeek}</div>
                      </td>

                      {/* Markets Columns */}
                      {(chartData.markets || []).map((mName) => {
                        const val = row.results[mName];
                        return (
                          <td key={mName} className="td-market-cell">
                            {val ? (
                              <div className="disawar-jodi-pill">{val}</div>
                            ) : (
                              <span className="disawar-empty-dash">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="disawar-chart-loading">No records found for this month.</div>
          )}
        </div>

        {/* Month days counter footer */}
        {chartData && (
          <div className="disawar-chart-footer">
            {chartData.monthTitle} — {chartData.days.length} Days
          </div>
        )}
      </div>

      {/* 6. Floating Action Button: Scroll To Top (Matching Reference Frame 5 & 28) */}
      <button
        className="disawar-fab-top"
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ChevronUp size={24} color="white" strokeWidth={3} />
      </button>

      {/* Market Closed Toast Notification */}
      <MarketClosedToast
        isVisible={!!closedToastMsg}
        message={closedToastMsg || ''}
        onClose={() => setClosedToastMsg(null)}
      />
    </div>
  );
};
