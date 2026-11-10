import React from 'react';
import { ArrowLeft, Wallet } from 'lucide-react';
import { MarketItem } from './MarketCard';
import { CategoryLogo } from './CategoryLogos';

export interface GameCategory {
  id: string;
  name: string;
  subtitle: string;
  badgeText: string;
  badgeBg: string;
  cardClass: string;
  payoutRate: number;
}

const CATEGORIES: GameCategory[] = [
  { id: 'single_digit', name: 'Single Digit', subtitle: '0 से 9', badgeText: '1', badgeBg: '#0284C7', cardClass: 'cat-card-glass', payoutRate: 9.5 },
  { id: 'jodi_digit', name: 'Jodi Digit', subtitle: '00 से 99', badgeText: '12', badgeBg: '#2563EB', cardClass: 'cat-card-glass', payoutRate: 95.0 },
  { id: 'single_panna', name: 'Single Panna', subtitle: 'तीन अंकों का योग', badgeText: '123', badgeBg: '#10B981', cardClass: 'cat-card-glass', payoutRate: 150.0 },
  { id: 'double_panna', name: 'Double Panna', subtitle: 'दोहरा अंक', badgeText: '122', badgeBg: '#8B5CF6', cardClass: 'cat-card-glass', payoutRate: 300.0 },
  { id: 'triple_panna', name: 'Triple Panna', subtitle: 'त्रिपल अंक', badgeText: '333', badgeBg: '#F59E0B', cardClass: 'cat-card-glass', payoutRate: 900.0 },
  { id: 'sp_motor', name: 'SP Motor', subtitle: 'सिंगल पत्ती मोटर', badgeText: 'SP', badgeBg: '#06B6D4', cardClass: 'cat-card-glass', payoutRate: 150.0 },
  { id: 'dp_motor', name: 'DP Motor', subtitle: 'डबल पत्ती मोटर', badgeText: 'DP', badgeBg: '#64748B', cardClass: 'cat-card-glass', payoutRate: 300.0 },
  { id: 'half_sangam', name: 'Half Sangam', subtitle: 'हाफ संगम', badgeText: '1/2', badgeBg: '#EC4899', cardClass: 'cat-card-glass', payoutRate: 1400.0 },
  { id: 'full_sangam', name: 'Full Sangam', subtitle: 'फुल संगम', badgeText: 'FS', badgeBg: '#E11D48', cardClass: 'cat-card-glass', payoutRate: 10000.0 },
];

interface CategorySelectionProps {
  market: MarketItem;
  balance: number;
  onBack: () => void;
  onSelectCategory: (category: GameCategory) => void;
}

export const CategorySelection: React.FC<CategorySelectionProps> = ({
  market,
  balance,
  onBack,
  onSelectCategory
}) => {
  return (
    <div style={{ paddingBottom: 80, minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Sub-header Glass Nav */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        color: '#0F172A',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 45,
        borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={onBack}
            style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '50%',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#0284C7'
            }}
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div>
            <span style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0F172A' }}>
              {market.name}
            </span>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0284C7' }}>
              Select Game Mode
            </div>
          </div>
        </div>

        <div style={{
          background: '#FFFFFF',
          color: '#0F172A',
          padding: '5px 14px',
          borderRadius: 9999,
          fontSize: 13,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          border: '1.5px solid #0284C7',
          boxShadow: '0 2px 6px rgba(2, 132, 199, 0.15)'
        }}>
          <Wallet size={15} color="#0284C7" />
          <span>₹{balance.toFixed(2)}</span>
        </div>
      </div>

      {/* 2-Column Glass Card Grid */}
      <div style={{ padding: '16px 14px' }}>
        <div className="category-grid">
          {CATEGORIES.map(cat => (
            <div
              key={cat.id}
              className="cat-card-glass"
              onClick={() => onSelectCategory(cat)}
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: 16,
                padding: '20px 14px',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.18s ease'
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <CategoryLogo id={cat.id} size={70} />
              </div>

              <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>{cat.name}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginTop: 2 }}>{cat.subtitle}</div>
              <div style={{
                marginTop: 8,
                background: '#EFF6FF',
                color: '#0284C7',
                fontSize: 11,
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 9999
              }}>
                1 KA {cat.payoutRate}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
