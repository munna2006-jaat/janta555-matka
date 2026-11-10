import React from 'react';

interface JantaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const JantaLogo: React.FC<JantaLogoProps> = ({ size = 'md', showSubtitle = false }) => {
  const fontSizes = {
    sm: { main: '18px', sub: '9px', icon: 16 },
    md: { main: '24px', sub: '11px', icon: 20 },
    lg: { main: '32px', sub: '13px', icon: 26 }
  }[size];

  return (
    <div className="janta-logo-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', userSelect: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, lineHeight: 1 }}>
        <span 
          style={{ 
            fontFamily: "'Outfit', 'Inter', sans-serif",
            fontSize: fontSizes.main,
            fontWeight: 900, 
            letterSpacing: '0.5px',
            color: '#0369A1',
            textTransform: 'uppercase'
          }}
        >
          JANTA
        </span>
        <span
          style={{
            fontFamily: "'Outfit', 'Inter', sans-serif",
            fontSize: fontSizes.main,
            fontWeight: 900,
            letterSpacing: '0.5px',
            background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          555
        </span>
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
            color: 'white',
            borderRadius: 6,
            width: fontSizes.icon + 4,
            height: fontSizes.icon + 4,
            marginLeft: 2,
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.4)'
          }}
        >
          <svg 
            width={fontSizes.icon - 4} 
            height={fontSizes.icon - 4} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>
      {showSubtitle && (
        <span style={{ fontSize: fontSizes.sub, fontWeight: 700, color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase', marginTop: 3 }}>
          Official Matka Platform
        </span>
      )}
    </div>
  );
};

