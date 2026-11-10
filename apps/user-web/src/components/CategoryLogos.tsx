import React from 'react';

interface CategoryLogoProps {
  id: string;
  size?: number;
}

export const CategoryLogo: React.FC<CategoryLogoProps> = ({ id, size = 80 }) => {
  // Shared Defs for Crown, Gold gradients, and shadows
  const renderSharedDefs = (key: string, discGradColors: [string, string], ribbonColors: [string, string]) => (
    <defs>
      {/* Metallic Gold Gradient for Crown and Medallion Borders */}
      <linearGradient id={`gold-metal-${key}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFF2A3" />
        <stop offset="35%" stopColor="#F59E0B" />
        <stop offset="70%" stopColor="#D97706" />
        <stop offset="100%" stopColor="#78350F" />
      </linearGradient>

      {/* Outer Ring Gold Glow */}
      <linearGradient id={`gold-ring-${key}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FDE68A" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>

      {/* Central Disc Gradient */}
      <radialGradient id={`disc-${key}`} cx="38%" cy="35%" r="65%">
        <stop offset="0%" stopColor={discGradColors[0]} />
        <stop offset="100%" stopColor={discGradColors[1]} />
      </radialGradient>

      {/* Ribbon Gradient */}
      <linearGradient id={`ribbon-${key}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={ribbonColors[1]} />
        <stop offset="50%" stopColor={ribbonColors[0]} />
        <stop offset="100%" stopColor={ribbonColors[1]} />
      </linearGradient>

      {/* Drop Shadow for 3D realism */}
      <filter id={`shadow-${key}`} x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#000" floodOpacity="0.32" />
      </filter>

      {/* Silver Wings Gradient (for SP & DP Motor) */}
      <linearGradient id={`silver-wing-${key}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="40%" stopColor="#CBD5E1" />
        <stop offset="75%" stopColor="#94A3B8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
    </defs>
  );

  // Royal Golden Crown Component
  const renderCrown = (key: string) => (
    <g filter={`url(#shadow-${key})`}>
      {/* Crown Base & 3 Peaks */}
      <path
        d="M 36 29 L 41 36 L 50 25 L 59 36 L 64 29 L 62 40 L 38 40 Z"
        fill={`url(#gold-metal-${key})`}
        stroke="#78350F"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {/* Jewel balls on top of peaks */}
      <circle cx="36" cy="28" r="2.2" fill="#FEF08A" stroke="#B45309" strokeWidth="0.7" />
      <circle cx="50" cy="24" r="2.8" fill="#FEF08A" stroke="#B45309" strokeWidth="0.8" />
      <circle cx="64" cy="28" r="2.2" fill="#FEF08A" stroke="#B45309" strokeWidth="0.7" />
      {/* Center Ruby Accent */}
      <circle cx="50" cy="34" r="1.6" fill="#DC2626" />
    </g>
  );

  // Award Ribbon Banner Component
  const renderRibbon = (key: string, text: string) => (
    <g filter={`url(#shadow-${key})`}>
      {/* Left Swallowtail Fold */}
      <polygon points="21,68 13,63 15,73 23,73" fill="#450A0A" />
      {/* Right Swallowtail Fold */}
      <polygon points="79,68 87,63 85,73 77,73" fill="#450A0A" />

      {/* Main Curved Banner */}
      <path
        d="M 20 67 Q 50 74 80 67 L 78 77 Q 50 84 22 77 Z"
        fill={`url(#ribbon-${key})`}
        stroke={`url(#gold-metal-${key})`}
        strokeWidth="0.9"
      />

      {/* Top and Bottom Gold Pinstripe */}
      <path d="M 21 68 Q 50 75 79 68" stroke="#FEF08A" strokeWidth="0.6" fill="none" opacity="0.8" />
      <path d="M 23 76 Q 50 83 77 76" stroke="#FEF08A" strokeWidth="0.6" fill="none" opacity="0.8" />

      {/* Ribbon Text */}
      <text
        x="50"
        y="75"
        textAnchor="middle"
        fill="#FEF08A"
        fontSize="5.2"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.4"
      >
        {text}
      </text>
    </g>
  );

  // Outer Golden Ring with subtle dash
  const renderOuterRing = (key: string) => (
    <>
      <circle
        cx="50"
        cy="50"
        r="44"
        stroke={`url(#gold-ring-${key})`}
        strokeWidth="1.6"
        fill="none"
        opacity="0.85"
      />
      <circle
        cx="50"
        cy="50"
        r="41"
        stroke="#FDE68A"
        strokeWidth="0.8"
        strokeDasharray="4 2"
        fill="none"
        opacity="0.6"
      />
      {/* Corner sparkle diamonds */}
      <polygon points="50,4 51.5,6 50,8 48.5,6" fill="#F59E0B" />
      <polygon points="50,92 51.5,94 50,96 48.5,94" fill="#F59E0B" />
      <polygon points="4,50 6,51.5 8,50 6,48.5" fill="#F59E0B" />
      <polygon points="92,50 94,51.5 96,50 94,48.5" fill="#F59E0B" />
    </>
  );

  // Central Circular Seal with Bevel & Inner Glow
  const renderCentralSeal = (key: string, content: React.ReactNode) => (
    <g filter={`url(#shadow-${key})`}>
      {/* Outer Metallic Bevel Rim */}
      <circle
        cx="50"
        cy="52"
        r="24"
        fill={`url(#gold-metal-${key})`}
        stroke="#78350F"
        strokeWidth="1"
      />
      {/* Inner Colored Disc */}
      <circle
        cx="50"
        cy="52"
        r="20.5"
        fill={`url(#disc-${key})`}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
      />
      {/* Glossy Reflection Highlight */}
      <path
        d="M 32 46 C 35 38 65 38 68 46 C 63 42 37 42 32 46 Z"
        fill="#FFFFFF"
        opacity="0.3"
      />
      {content}
    </g>
  );

  switch (id) {
    case 'single_digit':
      // Single Digit: Royal Crimson Medallion with Crown & "1"
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {renderSharedDefs('sd', ['#E11D48', '#881337'], ['#BE123C', '#4C0519'])}
          {renderOuterRing('sd')}
          {renderCrown('sd')}
          {renderCentralSeal(
            'sd',
            <text
              x="50"
              y="59"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="21"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              1
            </text>
          )}
          {renderRibbon('sd', 'SINGLE DIGIT')}
        </svg>
      );

    case 'jodi_digit':
      // Jodi Digit: Royal Navy Medallion with Crown & "12"
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {renderSharedDefs('jd', ['#1E40AF', '#0F172A'], ['#1D4ED8', '#0A0E1A'])}
          {renderOuterRing('jd')}
          {renderCrown('jd')}
          {renderCentralSeal(
            'jd',
            <text
              x="50"
              y="59"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="20"
              fontWeight="900"
              letterSpacing="-0.5"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              12
            </text>
          )}
          {renderRibbon('jd', 'JODI DIGIT')}
        </svg>
      );

    case 'single_panna':
      // Single Panna: Emerald Green Medallion with Crown & "123"
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {renderSharedDefs('sp', ['#059669', '#064E3B'], ['#047857', '#022C22'])}
          {renderOuterRing('sp')}
          {renderCrown('sp')}
          {renderCentralSeal(
            'sp',
            <text
              x="50"
              y="58"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="17"
              fontWeight="900"
              letterSpacing="-0.5"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              123
            </text>
          )}
          {renderRibbon('sp', 'SINGLE PANNA')}
        </svg>
      );

    case 'double_panna':
      // Double Panna: Rust / Amber-Red Medallion with Crown & "22"
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {renderSharedDefs('dp', ['#C2410C', '#7C2D12'], ['#9A3412', '#431407'])}
          {renderOuterRing('dp')}
          {renderCrown('dp')}
          {renderCentralSeal(
            'dp',
            <text
              x="50"
              y="59"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="20"
              fontWeight="900"
              letterSpacing="-0.5"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              22
            </text>
          )}
          {renderRibbon('dp', 'DOUBLE PANNA')}
        </svg>
      );

    case 'triple_panna':
      // Triple Panna: Rich Bronze / Gold Medallion with Crown & "333"
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {renderSharedDefs('tp', ['#D97706', '#78350F'], ['#B45309', '#451A03'])}
          {renderOuterRing('tp')}
          {renderCrown('tp')}
          {renderCentralSeal(
            'tp',
            <text
              x="50"
              y="58"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="17"
              fontWeight="900"
              letterSpacing="-0.5"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              333
            </text>
          )}
          {renderRibbon('tp', 'TRIPLE PANNA')}
        </svg>
      );

    case 'sp_motor':
      // SP Motor: Winged Silver/Royal Blue Medallion with "SP"
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {renderSharedDefs('spm', ['#1D4ED8', '#172554'], ['#1E40AF', '#0F172A'])}
          {renderOuterRing('spm')}
          {/* Silver Wings Extending to Left & Right */}
          <g filter="url(#shadow-spm)">
            {/* Left Wing Feathers */}
            <path d="M 28 44 C 18 36 8 46 14 54 C 20 48 26 48 30 52 Z" fill="url(#silver-wing-spm)" stroke="#475569" strokeWidth="0.7"/>
            <path d="M 28 50 C 16 46 10 56 18 61 C 24 57 28 55 31 56 Z" fill="url(#silver-wing-spm)" stroke="#475569" strokeWidth="0.7"/>
            {/* Right Wing Feathers */}
            <path d="M 72 44 C 82 36 92 46 86 54 C 80 48 74 48 70 52 Z" fill="url(#silver-wing-spm)" stroke="#475569" strokeWidth="0.7"/>
            <path d="M 72 50 C 84 46 90 56 82 61 C 76 57 72 55 69 56 Z" fill="url(#silver-wing-spm)" stroke="#475569" strokeWidth="0.7"/>
          </g>
          {renderCrown('spm')}
          {renderCentralSeal(
            'spm',
            <text
              x="50"
              y="59"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="19"
              fontWeight="900"
              letterSpacing="0.5"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              SP
            </text>
          )}
          {renderRibbon('spm', 'SP MOTOR')}
        </svg>
      );

    case 'dp_motor':
      // DP Motor: Winged Slate/Purple Medallion with "DP"
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {renderSharedDefs('dpm', ['#4338CA', '#1E1B4B'], ['#3730A3', '#111827'])}
          {renderOuterRing('dpm')}
          {/* Silver Wings Extending to Left & Right */}
          <g filter="url(#shadow-dpm)">
            {/* Left Wing Feathers */}
            <path d="M 28 44 C 18 36 8 46 14 54 C 20 48 26 48 30 52 Z" fill="url(#silver-wing-dpm)" stroke="#475569" strokeWidth="0.7"/>
            <path d="M 28 50 C 16 46 10 56 18 61 C 24 57 28 55 31 56 Z" fill="url(#silver-wing-dpm)" stroke="#475569" strokeWidth="0.7"/>
            {/* Right Wing Feathers */}
            <path d="M 72 44 C 82 36 92 46 86 54 C 80 48 74 48 70 52 Z" fill="url(#silver-wing-dpm)" stroke="#475569" strokeWidth="0.7"/>
            <path d="M 72 50 C 84 46 90 56 82 61 C 76 57 72 55 69 56 Z" fill="url(#silver-wing-dpm)" stroke="#475569" strokeWidth="0.7"/>
          </g>
          {renderCrown('dpm')}
          {renderCentralSeal(
            'dpm',
            <text
              x="50"
              y="59"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="19"
              fontWeight="900"
              letterSpacing="0.5"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              DP
            </text>
          )}
          {renderRibbon('dpm', 'DP MOTOR')}
        </svg>
      );

    case 'half_sangam':
      // Half Sangam: Fuchsia Rose Medallion with Crown & "1/2"
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {renderSharedDefs('hs', ['#BE185D', '#701A75'], ['#9D174D', '#4A044E'])}
          {renderOuterRing('hs')}
          {renderCrown('hs')}
          {renderCentralSeal(
            'hs',
            <text
              x="50"
              y="58"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="18"
              fontWeight="900"
              letterSpacing="-0.5"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              1/2
            </text>
          )}
          {renderRibbon('hs', 'HALF SANGAM')}
        </svg>
      );

    case 'full_sangam':
      // Full Sangam: Deep Ruby Gold Medallion with Crown & "FS"
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {renderSharedDefs('fs', ['#B91C1C', '#450A0A'], ['#991B1B', '#260404'])}
          {renderOuterRing('fs')}
          {renderCrown('fs')}
          {renderCentralSeal(
            'fs',
            <text
              x="50"
              y="59"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="19"
              fontWeight="900"
              letterSpacing="0.5"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              FS
            </text>
          )}
          {renderRibbon('fs', 'FULL SANGAM')}
        </svg>
      );

    default:
      return null;
  }
};
