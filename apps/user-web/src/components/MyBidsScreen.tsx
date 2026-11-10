import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Clock, Trophy, TrendingUp, ChevronRight, History, Receipt 
} from 'lucide-react';
import { RecentWinnersFeed } from './RecentWinnersFeed';
import { playClickSound, playTabSound } from '../utils/soundEffects';

interface MyBidsScreenProps {
  token: string | null;
  onBack: () => void;
  onRequireLogin: () => void;
  onNavigateWinningHistory?: () => void;
  onNavigatePanelChart?: () => void;
  onNavigatePassbook?: () => void;
}

export const MyBidsScreen: React.FC<MyBidsScreenProps> = ({
  token,
  onBack,
  onRequireLogin,
  onNavigateWinningHistory,
  onNavigatePanelChart,
  onNavigatePassbook
}) => {
  const [activeSubView, setActiveSubView] = useState<'hub' | 'bid_history'>('hub');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'WON' | 'LOST'>('ALL');
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeSubView === 'bid_history') {
      if (!token) {
        onRequireLogin();
        return;
      }
      fetchBets();
    }
  }, [token, filter, activeSubView]);

  const fetchBets = () => {
    setLoading(true);
    const query = filter === 'ALL' ? '' : `?status=${filter}`;
    fetch(`/api/v1/bets/history${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setBets(data.bets);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // ========================================================
  // VIEW 1: Hub matching Screen Recording Frame 2 + Passbook
  // ========================================================
  if (activeSubView === 'hub') {
    return (
      <div className="bids-hub-view" style={{ paddingBottom: 85 }}>
        {/* Hub Header with Back button */}
        <div className="page-header-strip" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#0F172A', borderBottom: '1px solid #1E293B' }}>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onBack();
            }}
            className="header-back-circle-btn"
            aria-label="Back"
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1.5px solid #F59E0B',
              color: '#F59E0B',
              borderRadius: '50%',
              width: 34,
              height: 34,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 900, color: '#FDE047', letterSpacing: 0.5 }}>BIDS & HISTORY</span>
        </div>

        {/* Navigation Action Cards (Frame 2) */}
        <div className="hub-cards-container" style={{ padding: '16px 14px 10px' }}>
          {/* 1. Bid History Card */}
          <div
            className="hub-nav-card"
            onClick={() => {
              playClickSound();
              if (!token) {
                onRequireLogin();
              } else {
                setActiveSubView('bid_history');
              }
            }}
          >
            <div className="hub-card-icon-circle">
              <History size={20} color="white" strokeWidth={2.5} />
            </div>
            <div className="hub-card-content">
              <div className="hub-card-tag">BID</div>
              <div className="hub-card-title">Bid History</div>
            </div>
            <ChevronRight size={20} className="hub-card-arrow" />
          </div>

          {/* 2. Winning History Card */}
          <div
            className="hub-nav-card"
            onClick={() => {
              playClickSound();
              if (onNavigateWinningHistory) onNavigateWinningHistory();
            }}
          >
            <div className="hub-card-icon-circle">
              <Trophy size={20} color="white" strokeWidth={2.5} />
            </div>
            <div className="hub-card-content">
              <div className="hub-card-tag">RESULT</div>
              <div className="hub-card-title">Winning History</div>
            </div>
            <ChevronRight size={20} className="hub-card-arrow" />
          </div>

          {/* 3. Panel Chart Card */}
          <div
            className="hub-nav-card"
            onClick={() => {
              playClickSound();
              if (onNavigatePanelChart) onNavigatePanelChart();
            }}
          >
            <div className="hub-card-icon-circle">
              <TrendingUp size={20} color="white" strokeWidth={2.5} />
            </div>
            <div className="hub-card-content">
              <div className="hub-card-tag">CHART</div>
              <div className="hub-card-title">Panel Chart</div>
            </div>
            <ChevronRight size={20} className="hub-card-arrow" />
          </div>

          {/* 4. Passbook / Statement Card (Moved from Wallet as requested by user) */}
          <div
            className="hub-nav-card"
            onClick={() => {
              playClickSound();
              if (!token) {
                onRequireLogin();
              } else if (onNavigatePassbook) {
                onNavigatePassbook();
              }
            }}
          >
            <div className="hub-card-icon-circle">
              <Receipt size={20} color="white" strokeWidth={2.5} />
            </div>
            <div className="hub-card-content">
              <div className="hub-card-tag">STATEMENT</div>
              <div className="hub-card-title">Passbook / Ledger</div>
            </div>
            <ChevronRight size={20} className="hub-card-arrow" />
          </div>
        </div>

        {/* Recent Winners Feed (Matching Frame 2) */}
        <div style={{ padding: '0 14px' }}>
          <RecentWinnersFeed />
        </div>
      </div>
    );
  }

  // ========================================================
  // VIEW 2: User's Actual Bid History List
  // ========================================================
  return (
    <div style={{ paddingBottom: 85 }}>
      {/* Header */}
      <div className="page-header-strip">
        <button
          onClick={() => {
            playClickSound();
            setActiveSubView('hub');
          }}
          className="header-back-circle-btn"
          aria-label="Back"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
        <span style={{ fontSize: 17, fontWeight: 900, letterSpacing: 0.5 }}>BID HISTORY</span>
        <div style={{ width: 32 }} />
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        background: 'white',
        borderBottom: '1px solid #E2E8F0',
        padding: '4px 6px'
      }}>
        {(['ALL', 'PENDING', 'WON', 'LOST'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => {
              playTabSound();
              setFilter(tab);
            }}
            style={{
              padding: '10px 4px',
              border: 'none',
              background: 'none',
              fontSize: 12.5,
              fontWeight: 800,
              color: filter === tab ? 'var(--primary)' : '#64748B',
              borderBottom: filter === tab ? '3px solid var(--primary)' : '3px solid transparent',
              cursor: 'pointer'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ padding: '14px 12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 30, color: '#64748B' }}>Loading bets...</div>
        ) : bets.length === 0 ? (
          <div style={{ background: 'white', padding: 24, textAlign: 'center', borderRadius: 12, color: '#64748B' }}>
            No bets found in this section.
          </div>
        ) : (
          bets.map(b => (
            <div
              key={b.id}
              style={{
                background: 'white',
                borderRadius: 14,
                padding: '12px 14px',
                marginBottom: 10,
                boxShadow: 'var(--shadow-sm)',
                borderLeft: b.status === 'WON' ? '4px solid #10B981' : b.status === 'LOST' ? '4px solid #EF4444' : '4px solid #F59E0B'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A' }}>{b.market_name}</div>
                  <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                    {b.game_type_name} • Session: <strong style={{ color: 'var(--primary)' }}>{b.session}</strong>
                  </div>
                </div>

                <span style={{
                  padding: '3px 8px',
                  borderRadius: 9999,
                  fontSize: 11,
                  fontWeight: 800,
                  background: b.status === 'WON' ? '#DCFCE7' : b.status === 'LOST' ? '#FEE2E2' : '#FEF3C7',
                  color: b.status === 'WON' ? '#15803D' : b.status === 'LOST' ? '#DC2626' : '#B45309'
                }}>
                  {b.status}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 8 }}>
                <div>
                  <span style={{ fontSize: 11, color: '#64748B' }}>Number: </span>
                  <strong style={{ fontSize: 16, color: '#0F172A', fontWeight: 900 }}>{b.bet_number}</strong>
                  <span style={{ fontSize: 11, color: '#64748B', marginLeft: 12 }}>Points: </span>
                  <strong style={{ fontSize: 14, color: '#0F172A', fontWeight: 800 }}>₹{b.amount}</strong>
                </div>

                <div style={{ textAlign: 'right' }}>
                  {b.status === 'WON' ? (
                    <div>
                      <div style={{ fontSize: 10, color: '#16A34A', fontWeight: 700 }}>WINNING</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#16A34A' }}>+₹{b.won_amount}</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 10, color: '#64748B' }}>Potential Win</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>₹{b.potential_win}</div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                <span>Ticket: {b.ticket_id}</span>
                <span>{new Date(b.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
