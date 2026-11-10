import React from 'react';

/**
 * OrnateGoldFrame:
 * Recreates the exact gold filigree / ornate baroque frame seen in the reference
 * screen recording (refrencehgd.mov Frame 000 - 003).
 */
export const OrnateGoldFrame: React.FC = () => {
  return (
    <div className="ornate-frame-svg-wrapper" aria-hidden="true">
      <svg
        className="ornate-svg-element"
        viewBox="0 0 380 120"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Rich metallic gold linear gradient */}
          <linearGradient id="goldFiligreeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#996515" />
            <stop offset="15%" stopColor="#d4af37" />
            <stop offset="35%" stopColor="#ffd700" />
            <stop offset="50%" stopColor="#fff5a6" />
            <stop offset="65%" stopColor="#ffd700" />
            <stop offset="85%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#996515" />
          </linearGradient>

          {/* Vertical gold gradient */}
          <linearGradient id="goldFiligreeVert" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffd700" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#996515" />
          </linearGradient>

          {/* Subtle gold glow filter */}
          <filter id="goldGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Outer Fine Border */}
        <rect
          x="3"
          y="3"
          width="374"
          height="114"
          rx="6"
          ry="6"
          fill="none"
          stroke="url(#goldFiligreeGrad)"
          strokeWidth="1.2"
          opacity="0.95"
        />

        {/* 2. Inner Hairline Accent Border */}
        <rect
          x="7"
          y="7"
          width="366"
          height="106"
          rx="4"
          ry="4"
          fill="none"
          stroke="url(#goldFiligreeGrad)"
          strokeWidth="0.6"
          opacity="0.6"
        />

        {/* ===================================================
            CORNER 1: TOP-LEFT FILIGREE SCROLLS
            =================================================== */}
        <g filter="url(#goldGlowFilter)" fill="none" stroke="url(#goldFiligreeGrad)" strokeWidth="1.4">
          <path d="M 6 32 C 6 16, 16 6, 32 6" />
          <path d="M 10 26 C 10 14, 14 10, 26 10" />
          <path d="M 16 16 C 18 12, 22 12, 24 14 C 26 16, 26 20, 22 22 C 18 24, 12 20, 16 16 Z" fill="url(#goldFiligreeGrad)" />
          <circle cx="28" cy="8" r="1.5" fill="url(#goldFiligreeGrad)" />
          <circle cx="8" cy="28" r="1.5" fill="url(#goldFiligreeGrad)" />
        </g>

        {/* ===================================================
            CORNER 2: TOP-RIGHT FILIGREE SCROLLS
            =================================================== */}
        <g filter="url(#goldGlowFilter)" fill="none" stroke="url(#goldFiligreeGrad)" strokeWidth="1.4">
          <path d="M 374 32 C 374 16, 364 6, 348 6" />
          <path d="M 370 26 C 370 14, 366 10, 354 10" />
          <path d="M 364 16 C 362 12, 358 12, 356 14 C 354 16, 354 20, 358 22 C 362 24, 368 20, 364 16 Z" fill="url(#goldFiligreeGrad)" />
          <circle cx="352" cy="8" r="1.5" fill="url(#goldFiligreeGrad)" />
          <circle cx="372" cy="28" r="1.5" fill="url(#goldFiligreeGrad)" />
        </g>

        {/* ===================================================
            CORNER 3: BOTTOM-LEFT FILIGREE SCROLLS
            =================================================== */}
        <g filter="url(#goldGlowFilter)" fill="none" stroke="url(#goldFiligreeGrad)" strokeWidth="1.4">
          <path d="M 6 88 C 6 104, 16 114, 32 114" />
          <path d="M 10 94 C 10 106, 14 110, 26 110" />
          <path d="M 16 104 C 18 108, 22 108, 24 106 C 26 104, 26 100, 22 98 C 18 96, 12 100, 16 104 Z" fill="url(#goldFiligreeGrad)" />
          <circle cx="28" cy="112" r="1.5" fill="url(#goldFiligreeGrad)" />
          <circle cx="8" cy="92" r="1.5" fill="url(#goldFiligreeGrad)" />
        </g>

        {/* ===================================================
            CORNER 4: BOTTOM-RIGHT FILIGREE SCROLLS
            =================================================== */}
        <g filter="url(#goldGlowFilter)" fill="none" stroke="url(#goldFiligreeGrad)" strokeWidth="1.4">
          <path d="M 374 88 C 374 104, 364 114, 348 114" />
          <path d="M 370 94 C 370 106, 366 110, 354 110" />
          <path d="M 364 104 C 362 108, 358 108, 356 106 C 354 104, 354 100, 358 98 C 362 96, 368 100, 364 104 Z" fill="url(#goldFiligreeGrad)" />
          <circle cx="352" cy="112" r="1.5" fill="url(#goldFiligreeGrad)" />
          <circle cx="372" cy="92" r="1.5" fill="url(#goldFiligreeGrad)" />
        </g>

        {/* ===================================================
            TOP-CENTER ORNAMENT CREST
            =================================================== */}
        <g transform="translate(190, 4)" filter="url(#goldGlowFilter)" fill="url(#goldFiligreeGrad)">
          <path d="M 0 -2 L 3 2 L 0 5 L -3 2 Z" />
          <path d="M -12 2 C -8 0, -4 0, 0 3 C 4 0, 8 0, 12 2 C 8 4, 4 4, 0 3 C -4 4, -8 4, -12 2 Z" opacity="0.8" />
          <circle cx="-16" cy="2" r="1" />
          <circle cx="16" cy="2" r="1" />
        </g>

        {/* ===================================================
            BOTTOM-CENTER ORNAMENT CREST
            =================================================== */}
        <g transform="translate(190, 116)" filter="url(#goldGlowFilter)" fill="url(#goldFiligreeGrad)">
          <path d="M 0 2 L 3 -2 L 0 -5 L -3 -2 Z" />
          <path d="M -12 -2 C -8 0, -4 0, 0 -3 C 4 0, 8 0, 12 -2 C 8 -4, 4 -4, 0 -3 C -4 -4, -8 -4, -12 -2 Z" opacity="0.8" />
          <circle cx="-16" cy="-2" r="1" />
          <circle cx="16" cy="-2" r="1" />
        </g>
      </svg>
    </div>
  );
};

