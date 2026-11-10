import React from 'react';
import { Play, Pause, BarChart2, TrendingUp, Clock } from 'lucide-react';
import { playClickSound, playTabSound, playClosedMarketSound } from '../utils/soundEffects';
import { useLanguage } from '../utils/translations';

export const WhatsAppIcon: React.FC<{ size?: number; color?: string }> = ({ size = 18, color = "#25D366" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17.472 14.382c-.3-.15-1.774-.875-2.05-.975-.275-.1-.475-.15-.675.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.414-1.49-.893-.796-1.496-1.78-1.672-2.08-.175-.3-.018-.462.132-.612.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.583-.492-.504-.675-.513-.175-.009-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.115 3.23 5.124 4.53 3.01 1.3 3.01.867 3.56.812.55-.054 1.774-.725 2.024-1.425.25-.7.25-1.3.175-1.425-.075-.125-.275-.2-.575-.35z"
      fill={color}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12c0 1.892.525 3.663 1.438 5.178L2.05 21.95l4.908-1.288A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2a8.17 8.17 0 01-4.17-1.14l-.3-.18-3.09.81.825-3.015-.195-.315A8.17 8.17 0 013.8 12c0-4.52 3.68-8.2 8.2-8.2s8.2 3.68 8.2 8.2-3.68 8.2-8.2 8.2z"
      fill={color}
    />
  </svg>
);

export interface MarketItem {
  id: number;
  name: string;
  hindi_name?: string;
  open_time: string;
  close_time: string;
  status: 'OPEN' | 'CLOSED';
  canPlayOpen: boolean;
  canPlayClose: boolean;
  resultString: string;
  open_panna?: string | null;
  open_digit?: string | null;
  close_digit?: string | null;
  close_panna?: string | null;
  jodi?: string | null;
}

interface MarketCardProps {
  market: MarketItem;
  onPlay: (market: MarketItem) => void;
  onOpenChart: (market: MarketItem) => void;
  onOpenJodiChart?: (market: MarketItem) => void;
  onOpenPanelChart?: (market: MarketItem) => void;
  onMarketClosedClick?: (market: MarketItem) => void;
  whatsappNumber?: string;
}

export const MarketCard: React.FC<MarketCardProps> = ({
  market,
  onPlay,
  onOpenChart,
  onOpenJodiChart,
  onOpenPanelChart,
  onMarketClosedClick
}) => {
  const { t } = useLanguage();
  const isOpen = market.status === 'OPEN';

  // Format result display
  const formatCardResult = () => {
    if (market.open_panna && market.open_digit && market.close_digit && market.close_panna) {
      return `${market.open_panna}-${market.open_digit}${market.close_digit}-${market.close_panna}`;
    }
    if (market.open_panna && market.open_digit) {
      return `${market.open_panna}-${market.open_digit}* ***`;
    }
    if (market.resultString && market.resultString !== '***-**-***') {
      return market.resultString;
    }
    return '***-**-***';
  };

  const displayResult = formatCardResult();

  const handleClosedClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClosedMarketSound();
    if (onMarketClosedClick) {
      onMarketClosedClick(market);
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      playClickSound();
      onPlay(market);
    } else {
      handleClosedClick(e);
    }
  };

  return (
    <div className="janta-market-glass-card" style={{
      background: 'rgba(255, 255, 255, 0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRadius: 18,
      padding: '16px 16px 14px 16px',
      border: '1px solid rgba(255, 255, 255, 0.75)',
      boxShadow: '0 8px 24px rgba(2, 132, 199, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
      marginBottom: 14,
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
    }}>
      {/* Top Header: Market Name & Live Status Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div 
            onClick={handlePlayClick}
            style={{ 
              fontSize: 16.5, 
              fontWeight: 900, 
              color: '#0F172A', 
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              cursor: 'pointer'
            }}
          >
            {market.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#64748B', fontWeight: 600, marginTop: 2 }}>
            <Clock size={12} color="#0284C7" />
            <span>Open: {market.open_time} • Close: {market.close_time}</span>
          </div>
        </div>

        {/* Live Status Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: isOpen ? '#DCFCE7' : '#F1F5F9',
          color: isOpen ? '#15803D' : '#64748B',
          borderRadius: 9999,
          padding: '4px 10px',
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.5px'
        }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: isOpen ? '#22C55E' : '#94A3B8',
            boxShadow: isOpen ? '0 0 6px #22C55E' : 'none'
          }} />
          <span>{isOpen ? 'MARKET OPEN' : 'CLOSED'}</span>
        </div>
      </div>

      {/* Middle Row: Result Display & Action Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: 12,
        padding: '10px 14px',
        marginTop: 6
      }}>
        {/* Left: Chart shortcut buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playTabSound();
              if (onOpenJodiChart) onOpenJodiChart(market);
              else onOpenChart(market);
            }}
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 11.5,
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
            title="Jodi Chart"
          >
            <BarChart2 size={13} color="#0284C7" />
            <span>Jodi</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playTabSound();
              if (onOpenPanelChart) onOpenPanelChart(market);
              else onOpenChart(market);
            }}
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 11.5,
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
            title="Panel Chart"
          >
            <TrendingUp size={13} color="#2563EB" />
            <span>Panel</span>
          </button>
        </div>

        {/* Center: Real Result Number */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 900,
          fontSize: 17,
          color: isOpen ? '#0369A1' : '#334155',
          letterSpacing: '1px',
          textAlign: 'center'
        }}>
          {displayResult}
        </div>

        {/* Right: Play / Closed button */}
        <button
          type="button"
          onClick={handlePlayClick}
          style={{
            background: isOpen 
              ? 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)' 
              : '#E2E8F0',
            color: isOpen ? '#FFFFFF' : '#94A3B8',
            border: 'none',
            borderRadius: 10,
            padding: '8px 16px',
            fontSize: 12.5,
            fontWeight: 800,
            cursor: isOpen ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: isOpen ? '0 3px 10px rgba(2, 132, 199, 0.35)' : 'none'
          }}
        >
          {isOpen ? (
            <>
              <Play size={13} fill="white" strokeWidth={0} />
              <span>PLAY</span>
            </>
          ) : (
            <>
              <Pause size={13} strokeWidth={2.5} />
              <span>CLOSED</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
