import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { MarketItem } from './MarketCard';
import { MatkaResultChartTable } from './MatkaResultChartTable';

interface PanelChartModalProps {
  market: MarketItem;
  onClose: () => void;
}

export const PanelChartModal: React.FC<PanelChartModalProps> = ({ market, onClose }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState<'panel' | 'jodi'>('panel');

  useEffect(() => {
    fetch(`/api/v1/results/panel-chart/${market.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setRecords(data.records);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [market.id]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 740, width: '95%', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <div className="modal-title">{market.name} PANEL RECORD</div>
            <div style={{ fontSize: 11.5, opacity: 0.9 }}>
              Historical Results & Weekly Panel Chart (Image 3 Style)
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Mode switch */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: 2 }}>
              <button
                type="button"
                onClick={() => setChartMode('panel')}
                style={{
                  background: chartMode === 'panel' ? 'white' : 'transparent',
                  color: chartMode === 'panel' ? 'var(--primary)' : 'white',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Panel
              </button>
              <button
                type="button"
                onClick={() => setChartMode('jodi')}
                style={{
                  background: chartMode === 'jodi' ? 'white' : 'transparent',
                  color: chartMode === 'jodi' ? 'var(--primary)' : 'white',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Jodi
              </button>
            </div>

            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={22} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ maxHeight: '78vh', padding: 12, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 30, color: '#64748B' }}>Loading panel chart...</div>
          ) : records.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, color: '#64748B' }}>No historical chart records found.</div>
          ) : (
            <MatkaResultChartTable
              marketName={market.name}
              records={records}
              mode={chartMode}
              openTime={market.open_time}
              closeTime={market.close_time}
            />
          )}
        </div>
      </div>
    </div>
  );
};
