import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ChevronDown, RefreshCw, Hash, Layers, Play, Pause } from 'lucide-react';
import { MatkaResultChartTable } from './MatkaResultChartTable';
import { OrnateGoldFrame } from './OrnateGoldFrame';
import { playClickSound, playTabSound, playClosedMarketSound } from '../utils/soundEffects';
import { useLanguage } from '../utils/translations';

interface PanelChartScreenProps {
  initialMarketId?: number | null;
  initialMode?: 'jodi' | 'panel';
  onBack: () => void;
  onPlayMarket?: (market: any) => void;
  onMarketClosedClick?: (market: any) => void;
}

// Format card result string into "150-69-469", "270-9", or "XXX-XX-XX"
function formatCardResult(resultString?: string, openPanna?: string, openDigit?: string, closeDigit?: string, closePanna?: string): string {
  if (openPanna && openDigit && closeDigit && closePanna) {
    return `${openPanna}-${openDigit}${closeDigit}-${closePanna}`;
  }
  if (openPanna && openDigit && !closeDigit) {
    return `${openPanna}-${openDigit}`;
  }
  if (resultString) {
    if (resultString.includes('***-**-***') || resultString.trim() === '') {
      return 'XXX-XX-XX';
    }
    return resultString.replace(/\*/g, 'X');
  }
  return 'XXX-XX-XX';
}

export const PanelChartScreen: React.FC<PanelChartScreenProps> = ({
  initialMarketId,
  initialMode = 'jodi',
  onBack,
  onPlayMarket,
  onMarketClosedClick
}) => {
  const { t } = useLanguage();
  const [markets, setMarkets] = useState<any[]>([]);
  // If initialMarketId was provided, view that market directly, otherwise show the market selection list (Frame 000)
  const [selectedMarketId, setSelectedMarketId] = useState<number | null>(initialMarketId || null);
  const [records, setRecords] = useState<any[]>([]);
  const [loadingMarkets, setLoadingMarkets] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [chartMode, setChartMode] = useState<'jodi' | 'panel'>(initialMode);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all markets
  const fetchMarkets = useCallback(() => {
    setRefreshing(true);
    fetch('/api/v1/markets')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.markets)) {
          setMarkets(data.markets);
        }
      })
      .catch(console.error)
      .finally(() => {
        setLoadingMarkets(false);
        setTimeout(() => setRefreshing(false), 500);
      });
  }, []);

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  // Fetch chart records whenever selectedMarketId changes
  useEffect(() => {
    if (!selectedMarketId) return;
    setLoadingRecords(true);

    const params = new URLSearchParams();
    params.append('limit', '1000'); // Fetch full 2-year history

    fetch(`/api/v1/results/panel-chart/${selectedMarketId}?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.records)) {
          setRecords(data.records);
        } else {
          setRecords([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingRecords(false));
  }, [selectedMarketId]);

  const selectedMarket = markets.find(m => m.id === selectedMarketId);
  const marketName = selectedMarket?.name || 'GOLDEN';

  // ========================================================
  // VIEW 1: "Select Market Chart" List (Reference Video Frames 000 - 003)
  // Luxury dark textured damask background, ornate gold cards,
  // Jodi & Panel gold buttons, glowing gold results, neon green times.
  // ========================================================
  if (!selectedMarketId) {
    return (
      <div className="ref-result-portal-root">
        <div className="ref-portal-container">
          {/* Top Bar */}
          <div className="ref-portal-top-bar">
            <button
              type="button"
              className="ref-portal-back-btn"
              onClick={() => {
                playClickSound();
                onBack();
              }}
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="ref-portal-title">{t('live_results_chart')}</h1>
            <button
              type="button"
              className="ref-portal-icon-btn"
              onClick={() => {
                playClickSound();
                fetchMarkets();
              }}
              aria-label="Refresh Markets"
            >
              <RefreshCw size={18} className={refreshing ? 'ref-spin' : ''} />
            </button>
          </div>

          {/* Markets List with Ornate Gold Frames (Frames 000 - 003) */}
          <div className="ref-portal-card-list">
            {loadingMarkets ? (
              <div className="ref-portal-loading">
                <RefreshCw size={24} className="ref-spin" />
                <span>{t('loading_results')}</span>
              </div>
            ) : (
              markets.map(m => {
                const displayResult = formatCardResult(
                  m.resultString,
                  m.open_panna,
                  m.open_digit,
                  m.close_digit,
                  m.close_panna
                );

                return (
                  <div key={m.id} className="ref-ornate-market-card">
                    {/* SVG Gold Filigree Ornate Frame Overlay */}
                    <OrnateGoldFrame />

                    {/* Card Content */}
                    <div className="ref-ornate-content-wrap">
                      {/* Top: Market Name (Serif Italic Bold White) */}
                      <div className="ref-ornate-market-name">
                        {m.name}
                      </div>

                      {/* Middle: [ Left: Jodi & Panel Buttons ] — [ Center: Result & Status ] — [ Right: Play/Pause Button ] */}
                      <div className="ref-ornate-center-row">
                        {/* Left Side: Both Jodi and Panel buttons stacked together */}
                        <div className="ref-ornate-chart-buttons-side">
                          <button
                            type="button"
                            className="ref-gold-stacked-btn"
                            onClick={() => {
                              playTabSound();
                              setChartMode('jodi');
                              setSelectedMarketId(m.id);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            title={`View ${m.name} Jodi Chart`}
                          >
                            {t('jodi')}
                          </button>

                          <button
                            type="button"
                            className="ref-gold-stacked-btn"
                            onClick={() => {
                              playTabSound();
                              setChartMode('panel');
                              setSelectedMarketId(m.id);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            title={`View ${m.name} Panel Chart`}
                          >
                            {t('panel')}
                          </button>
                        </div>

                        {/* Center: Result Digits & Status Badge */}
                        <div className="ref-ornate-center-col">
                          <div className="ref-ornate-result-digits">
                            {displayResult}
                          </div>
                          <div className={`ref-ornate-status-badge ${m.status === 'OPEN' ? 'badge-open' : 'badge-closed'}`}>
                            {m.status === 'OPEN' ? `● ${t('market_open')}` : `● ${t('market_closed')}`}
                          </div>
                        </div>

                        {/* Right Side: Play Button (matching Image 1) */}
                        <div className="ref-ornate-action-side">
                          {m.status === 'OPEN' ? (
                            <button
                              type="button"
                              className="ref-play-round-btn ref-play-open"
                              onClick={() => {
                                playClickSound();
                                if (onPlayMarket) {
                                  onPlayMarket(m);
                                }
                              }}
                              title={`Play ${m.name}`}
                              aria-label="Play Market"
                            >
                              <Play size={22} fill="white" stroke="white" style={{ marginLeft: 2 }} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="ref-play-round-btn ref-play-closed"
                              onClick={() => {
                                playClosedMarketSound();
                                if (onMarketClosedClick) {
                                  onMarketClosedClick(m);
                                }
                              }}
                              title="Market Closed"
                              aria-label="Market Closed"
                            >
                              <Pause size={18} fill="white" stroke="white" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Bottom: Open Time & Close Time (Vibrant Neon Green) */}
                      <div className="ref-ornate-timing-row">
                        <span>{m.open_time || '10:00 AM'}</span>
                        <span>{m.close_time || '11:00 AM'}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Floating REFRESH Button at Bottom-Left (Positioned cleanly above bottom-nav) */}
          <button
            type="button"
            className="ref-floating-refresh-pill"
            onClick={() => {
              playClickSound();
              fetchMarkets();
            }}
            aria-label={t('refresh')}
          >
            <RefreshCw size={15} className={refreshing ? 'ref-spin' : ''} />
            <span>{t('refresh')}</span>
          </button>
        </div>
      </div>
    );
  }

  // ========================================================
  // VIEW 2: Chart Display (Frames 004, 008, 012, 015)
  // Top rate header, dhamaka numbers, amber banner, crimson table.
  // ========================================================
  return (
    <div className="ref-result-portal-root">
      <div className="ref-portal-container">
        {/* Navigation & Controls Bar */}
        <div className="ref-chart-nav-bar">
          <button
            type="button"
            className="ref-portal-back-btn"
            onClick={() => {
              playClickSound();
              setSelectedMarketId(null);
            }}
            aria-label="Back to Market Selection"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Market Dropdown Switcher */}
          <div className="ref-market-dropdown-box">
            <select
              value={selectedMarketId || ''}
              onChange={e => {
                playClickSound();
                setSelectedMarketId(Number(e.target.value));
              }}
              className="ref-market-select-el"
            >
              {markets.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className="ref-select-chevron" />
          </div>

          {/* Mode Switcher Tabs (Jodi vs Panel) */}
          <div className="ref-chart-mode-pill">
            <button
              type="button"
              className={`ref-toggle-btn ${chartMode === 'jodi' ? 'ref-active-gold' : ''}`}
              onClick={() => {
                playTabSound();
                setChartMode('jodi');
              }}
            >
              <Hash size={13} />
              <span>Jodi</span>
            </button>
            <button
              type="button"
              className={`ref-toggle-btn ${chartMode === 'panel' ? 'ref-active-gold' : ''}`}
              onClick={() => {
                playTabSound();
                setChartMode('panel');
              }}
            >
              <Layers size={13} />
              <span>Panel</span>
            </button>
          </div>
        </div>

        {/* Chart Content Component */}
        {loadingRecords ? (
          <div className="ref-portal-loading" style={{ minHeight: 300 }}>
            <RefreshCw size={28} className="ref-spin" />
            <span>Loading {marketName} Chart Data...</span>
          </div>
        ) : (
          <MatkaResultChartTable
            marketName={marketName}
            records={records}
            mode={chartMode}
            openTime={selectedMarket?.open_time || '14:00'}
            closeTime={selectedMarket?.close_time || '15:00'}
          />
        )}
      </div>
    </div>
  );
};
