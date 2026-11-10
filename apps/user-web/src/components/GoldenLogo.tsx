import React from 'react';

interface GoldenLogoProps {
  variant?: 'header' | 'auth' | 'drawer' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
}

export const GoldenLogo: React.FC<GoldenLogoProps> = ({
  variant = 'header',
  size = 'md',
  onClick,
  className = ''
}) => {
  // SVG Crest Monogram (Crown + GM Shield)
  const renderCrest = (pixelSize: number) => (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.35))',
        flexShrink: 0
      }}
    >
      <defs>
        <linearGradient id="glGold24k" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFDF0" />
          <stop offset="20%" stopColor="#FFE885" />
          <stop offset="45%" stopColor="#FFC820" />
          <stop offset="70%" stopColor="#D49A12" />
          <stop offset="100%" stopColor="#7A5200" />
        </linearGradient>

        <linearGradient id="glGoldRev" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#5E3E00" />
          <stop offset="35%" stopColor="#D49A12" />
          <stop offset="70%" stopColor="#FFE57F" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>

        <radialGradient id="glDarkCenter" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#1C1824" />
          <stop offset="60%" stopColor="#0D0C13" />
          <stop offset="100%" stopColor="#050408" />
        </radialGradient>

        <linearGradient id="glRuby" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="60%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
      </defs>

      {/* Outer Beveled Gold Ring */}
      <circle cx="60" cy="64" r="48" fill="url(#glDarkCenter)" stroke="url(#glGold24k)" strokeWidth="4" />
      <circle cx="60" cy="64" r="44" fill="none" stroke="url(#glGoldRev)" strokeWidth="1" opacity="0.75" />
      <circle cx="60" cy="64" r="41" fill="none" stroke="url(#glGold24k)" strokeWidth="1" strokeDasharray="2, 4" opacity="0.6" />

      {/* Imperial Crown on Top */}
      <g transform="translate(60, 36) scale(0.6)">
        {/* Crown Base */}
        <path d="M-36,0 C-12,4 12,4 36,0 L32,8 C12,12 -12,12 -32,8 Z" fill="url(#glGold24k)" stroke="#5E3E00" strokeWidth="1" />
        <circle cx="-24" cy="5" r="2" fill="url(#glRuby)" />
        <circle cx="0" cy="6" r="2.2" fill="#60A5FA" />
        <circle cx="24" cy="5" r="2" fill="url(#glRuby)" />

        {/* Crown Peaks */}
        <path d="M-34,0 L-28,-22 L-16,-6 L0,-32 L16,-6 L28,-22 L34,0 C12,5 -12,5 -34,0 Z" fill="url(#glGold24k)" stroke="url(#glGoldRev)" strokeWidth="1" />
        <circle cx="-28" cy="-22" r="2.8" fill="url(#glGoldRev)" />
        <circle cx="28" cy="-22" r="2.8" fill="url(#glGoldRev)" />
        <circle cx="0" cy="-32" r="3.2" fill="url(#glRuby)" stroke="url(#glGold24k)" strokeWidth="1" />
      </g>

      {/* Monogram GM */}
      <text
        x="60"
        y="78"
        textAnchor="middle"
        fontFamily="'Cinzel', 'Playfair Display', 'Georgia', serif"
        fontWeight="900"
        fontSize="34"
        letterSpacing="-1.5"
        fill="#261700"
        opacity="0.9"
        dx="1"
        dy="1"
      >
        GM
      </text>
      <text
        x="60"
        y="78"
        textAnchor="middle"
        fontFamily="'Cinzel', 'Playfair Display', 'Georgia', serif"
        fontWeight="900"
        fontSize="34"
        letterSpacing="-1.5"
        fill="url(#glGold24k)"
        stroke="url(#glGoldRev)"
        strokeWidth="0.8"
      >
        GM
      </text>

      {/* Small Star Glints */}
      <polygon points="32,64 34,67 38,68 34,69 32,72 30,69 26,68 30,67" fill="url(#glGold24k)" />
      <polygon points="88,64 90,67 94,68 90,69 88,72 86,69 82,68 86,67" fill="url(#glGold24k)" />
    </svg>
  );

  // Variant 1: Header logo
  if (variant === 'header') {
    return (
      <div
        className={`golden-logo-header ${className}`}
        onClick={onClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 9,
          cursor: onClick ? 'pointer' : 'default',
          userSelect: 'none'
        }}
      >
        {renderCrest(34)}
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span
            style={{
              fontFamily: "'Outfit', 'Montserrat', 'Inter', sans-serif",
              fontWeight: 900,
              fontSize: 19,
              letterSpacing: '0.04em',
              background: 'linear-gradient(135deg, #FFFBEB 0%, #FDE047 35%, #F59E0B 75%, #B45309 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.45))'
            }}
          >
            GOLDEN MATKA
          </span>
        </div>
      </div>
    );
  }

  // Variant 2: Auth / Register Screen (Vertical, Grand Luxury Presentation)
  if (variant === 'auth') {
    return (
      <div
        className={`golden-logo-auth ${className}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 20,
          userSelect: 'none'
        }}
      >
        {renderCrest(76)}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: "'Outfit', 'Montserrat', 'Inter', sans-serif",
              fontWeight: 900,
              fontSize: 28,
              letterSpacing: '0.05em',
              background: 'linear-gradient(135deg, #FFE885 0%, #F59E0B 45%, #D97706 75%, #78350F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 3px rgba(120, 53, 15, 0.3))'
            }}
          >
            GOLDEN MATKA
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.18em',
              color: '#B45309',
              textTransform: 'uppercase',
              marginTop: 2
            }}
          >
            <span>★</span>
            <span>Official VIP Gaming</span>
            <span>★</span>
          </div>
        </div>
      </div>
    );
  }

  // Variant 3: Sidebar Drawer
  if (variant === 'drawer') {
    return (
      <div
        className={`golden-logo-drawer ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          userSelect: 'none'
        }}
      >
        {renderCrest(42)}
        <div>
          <div
            style={{
              fontFamily: "'Outfit', 'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: 20,
              letterSpacing: '0.04em',
              background: 'linear-gradient(135deg, #FFFBEB 0%, #FDE047 35%, #F59E0B 75%, #B45309 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            GOLDEN MATKA
          </div>
          <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.05em' }}>
            VIP PLATFORM
          </div>
        </div>
      </div>
    );
  }

  // Variant 4: Icon Only
  const iconPixel = size === 'sm' ? 28 : size === 'md' ? 38 : size === 'lg' ? 56 : 76;
  return renderCrest(iconPixel);
};

