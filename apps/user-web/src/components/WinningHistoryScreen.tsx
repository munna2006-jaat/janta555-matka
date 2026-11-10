import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Sparkles, User, Award, CheckCircle2 } from 'lucide-react';

interface WinningHistoryScreenProps {
  token: string | null;
  onBack: () => void;
  onRequireLogin: () => void;
}

export const WinningHistoryScreen: React.FC<WinningHistoryScreenProps> = ({
  token,
  onBack,
  onRequireLogin
}) => {
  const [tab, setTab] = useState<'platform' | 'my'>('platform');
  const [platformWinners, setPlatformWinners] = useState<any[]>([]);
  const [myWinners, setMyWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch live platform winners
  useEffect(() => {
    fetch('/api/v1/results/recent-winners')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.winners)) {
          setPlatformWinners(data.winners);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Fetch my winning bets if logged in
  useEffect(() => {
    if (tab === 'my' && token) {
      setLoading(true);
      fetch('/api/v1/bets/history?status=WON', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.success && Array.isArray(data.bets)) {
            setMyWinners(data.bets);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [tab, token]);

  return (
    <div style={{ paddingBottom: 80, minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Sticky Header */}
      <div style={{
        background: 'var(--primary)',
        color: 'white',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 45
      }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'white',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#1E293B'
          }}
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
        <span style={{ fontSize: 17, fontWeight: 900 }}>WINNING HISTORY</span>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: 'white',
        borderBottom: '1px solid #E2E8F0',
        padding: '2px 6px'
      }}>
        <button
          type="button"
          onClick={() => setTab('platform')}
          style={{
            padding: '11px',
            border: 'none',
            background: 'none',
            fontSize: 13,
            fontWeight: 800,
            color: tab === 'platform' ? 'var(--primary)' : '#64748B',
            borderBottom: tab === 'platform' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer'
          }}
        >
          🏆 Live Platform Winners
        </button>
        <button
          type="button"
          onClick={() => {
            if (!token) onRequireLogin();
            else setTab('my');
          }}
          style={{
            padding: '11px',
            border: 'none',
            background: 'none',
            fontSize: 13,
            fontWeight: 800,
            color: tab === 'my' ? 'var(--primary)' : '#64748B',
            borderBottom: tab === 'my' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer'
          }}
        >
          ⭐ My Won Bets
        </button>
      </div>

      <div style={{ padding: '14px 12px' }}>
        {tab === 'platform' ? (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              borderRadius: 14,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
              boxShadow: '0 4px 12px rgba(16,185,129,0.25)'
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900 }}>Live Winners Board</div>
                <div style={{ fontSize: 11, opacity: 0.9 }}>Real-time verified payouts credited to wallets</div>
              </div>
              <Sparkles size={24} />
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 30, color: '#64748B' }}>Loading live winners...</div>
            ) : platformWinners.length === 0 ? (
              <div style={{ background: 'white', padding: 24, textAlign: 'center', borderRadius: 12, color: '#64748B' }}>
                No recent winners yet today.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {platformWinners.map(w => (
                  <div
                    key={w.id}
                    style={{
                      background: 'white',
                      borderRadius: 12,
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      borderLeft: '4px solid #16A34A'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: '#DCFCE7',
                        color: '#15803D',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900
                      }}>
                        <Award size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: '#0F172A' }}>
                          {w.user_display_name}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748B' }}>
                          {w.market_name} • <strong style={{ color: 'var(--primary)' }}>{w.game_type_name}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#16A34A' }}>
                        +₹{Number(w.amount || 0).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: 10, color: '#94A3B8' }}>
                        {w.created_at ? new Date(w.created_at).toLocaleTimeString() : 'Just now'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {!token ? (
              <div style={{ textAlign: 'center', padding: 30, background: 'white', borderRadius: 12 }}>
                <p style={{ color: '#64748B', marginBottom: 14 }}>Please login to view your winning bets.</p>
                <button type="button" className="btn-primary" onClick={onRequireLogin}>
                  LOGIN TO JANTA555
                </button>
              </div>
            ) : loading ? (
              <div style={{ textAlign: 'center', padding: 30, color: '#64748B' }}>Loading your winning bets...</div>
            ) : myWinners.length === 0 ? (
              <div style={{ background: 'white', padding: 30, textAlign: 'center', borderRadius: 14, color: '#64748B' }}>
                <Trophy size={36} color="#CBD5E1" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>No Winning Bets Yet</div>
                <div style={{ fontSize: 12 }}>Place your bids on today's markets to see your winnings here!</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {myWinners.map(b => (
                  <div
                    key={b.id}
                    style={{
                      background: 'white',
                      borderRadius: 14,
                      padding: '14px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      borderLeft: '4px solid #10B981'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A' }}>{b.market_name}</div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>
                          {b.game_type_name} • #{b.bet_number}
                        </div>
                      </div>
                      <span style={{
                        background: '#DCFCE7',
                        color: '#15803D',
                        fontSize: 12,
                        fontWeight: 900,
                        padding: '3px 8px',
                        borderRadius: 8
                      }}>
                        WON
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 8 }}>
                      <div>
                        <span style={{ fontSize: 11, color: '#64748B' }}>Bet Points: </span>
                        <strong>₹{b.amount}</strong>
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 900, color: '#16A34A' }}>
                        +₹{b.won_amount}
                      </div>
                    </div>

                    <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 4 }}>
                      Ticket: {b.ticket_id} • {new Date(b.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
