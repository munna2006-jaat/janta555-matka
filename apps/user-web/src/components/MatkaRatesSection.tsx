import React from 'react';
import { 
  Dices, Layers, Smartphone, Copy, Zap, Crown, 
  CheckCircle2, Clock, Star 
} from 'lucide-react';

interface MatkaRatesSectionProps {
  onPlayClick?: () => void;
}

export const MatkaRatesSection: React.FC<MatkaRatesSectionProps> = ({ onPlayClick }) => {
  const rates = [
    {
      id: 'single',
      title: 'Single',
      subtitle: 'Rate',
      payout: '10 KA 95',
      icon: (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7' }}>
          <Dices size={20} />
        </div>
      )
    },
    {
      id: 'jodi',
      title: 'Jodi',
      subtitle: 'Rate',
      payout: '10 KA 950',
      icon: (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7' }}>
          <Copy size={20} />
        </div>
      )
    },
    {
      id: 'single-patti',
      title: 'Single Patti',
      subtitle: 'Rate',
      payout: '10 KA 1500',
      icon: (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FDF2F8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DB2777' }}>
          <Smartphone size={20} />
        </div>
      )
    },
    {
      id: 'double-patti',
      title: 'Double Patti',
      subtitle: 'Rate',
      payout: '10 KA 3000',
      icon: (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
          <Layers size={20} />
        </div>
      )
    },
    {
      id: 'triple-patti',
      title: 'Triple Patti',
      subtitle: 'Rate',
      payout: '10 KA 6000',
      icon: (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
          <Layers size={20} />
        </div>
      )
    },
    {
      id: 'half-sangam',
      title: 'Half Sangam',
      subtitle: 'Rate',
      payout: '10 KA 12000',
      icon: (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
          <Zap size={20} />
        </div>
      )
    },
    {
      id: 'full-sangam',
      title: 'Full Sangam',
      subtitle: 'Rate',
      payout: '10 KA 120000',
      icon: (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
          <Crown size={20} />
        </div>
      )
    }
  ];

  return (
    <div className="janta-rates-glass-card" style={{
      background: 'rgba(255, 255, 255, 0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRadius: 20,
      padding: '24px 20px',
      border: '1px solid rgba(255, 255, 255, 0.7)',
      boxShadow: '0 12px 36px rgba(2, 132, 199, 0.08), 0 1px 3px rgba(0,0,0,0.05)',
      margin: '16px 0'
    }}>
      {/* Card Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
          Matka Rates
        </h2>
        <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0', fontWeight: 500 }}>
          Standard market betting rates
        </p>
      </div>

      {/* Grid of Rate items matching reference Image 1 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 14
      }}>
        {rates.map(rate => (
          <div
            key={rate.id}
            style={{
              background: '#FFFFFF',
              borderRadius: 14,
              padding: '12px 16px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {rate.icon}
              <div>
                <div style={{ fontWeight: 800, fontSize: 14.5, color: '#0F172A' }}>
                  {rate.title}
                </div>
                <div style={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 600 }}>
                  {rate.subtitle}
                </div>
              </div>
            </div>

            <div style={{
              background: '#0F172A',
              color: '#FFFFFF',
              padding: '6px 14px',
              borderRadius: 9999,
              fontWeight: 900,
              fontSize: 13,
              letterSpacing: '0.4px',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)'
            }}>
              {rate.payout}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Trust Badges matching reference Image 1 */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 10,
        marginTop: 22,
        paddingTop: 16,
        borderTop: '1px solid #F1F5F9'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: '#DCFCE7',
          color: '#15803D',
          borderRadius: 9999,
          padding: '5px 12px',
          fontSize: 12,
          fontWeight: 700
        }}>
          <CheckCircle2 size={14} />
          <span>Guaranteed Payouts</span>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: '#EFF6FF',
          color: '#1D4ED8',
          borderRadius: 9999,
          padding: '5px 12px',
          fontSize: 12,
          fontWeight: 700
        }}>
          <Clock size={14} />
          <span>Instant Withdrawal</span>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: '#FEF3C7',
          color: '#B45309',
          borderRadius: 9999,
          padding: '5px 12px',
          fontSize: 12,
          fontWeight: 700
        }}>
          <Star size={14} fill="#B45309" />
          <span>Best Market Rates</span>
        </div>
      </div>
    </div>
  );
};

