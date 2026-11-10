import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';

export const RecentWinnersFeed: React.FC = () => {
  const [winners, setWinners] = useState<any[]>([]);

  useEffect(() => {
    fetchWinners();
    const interval = setInterval(fetchWinners, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  const fetchWinners = () => {
    fetch('/api/v1/results/recent-winners')
      .then(res => res.json())
      .then(data => {
        if (data.success) setWinners(data.winners);
      })
      .catch(console.error);
  };

  if (winners.length === 0) return null;

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        padding: '0 4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Trophy size={18} color="var(--primary)" />
          <span style={{ fontSize: 14.5, fontWeight: 900, color: '#0F172A' }}>Recent Winners</span>
        </div>
        <span style={{
          background: '#DCFCE7',
          color: '#15803D',
          fontSize: 11,
          fontWeight: 800,
          padding: '2px 8px',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }}></span>
          Live
        </span>
      </div>

      <div>
        {winners.map(w => (
          <div key={w.id} className="winner-card">
            <div className="winner-info">
              <div className="winner-trophy-icon">
                <Trophy size={18} />
              </div>
              <div>
                <div className="winner-name">{w.user_display_name}</div>
                <div className="winner-game">{w.game_type_name} • {w.market_name}</div>
              </div>
            </div>

            <div className="winner-amount-box">
              <div className="winner-amount">+₹{w.amount.toLocaleString('en-IN')}</div>
              <div className="winner-time">{new Date(w.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
