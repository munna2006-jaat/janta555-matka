import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Crown } from 'lucide-react';
import { playSuccessSound } from '../utils/soundEffects';

interface GoldMatkaSplashScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

interface CoinParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number;
  spinSpeed: number;
  wobbleSpeed: number;
  wobbleAngle: number;
  tilt: number;
  colorType: number;
  alpha: number;
  symbol: string;
}

export const GoldMatkaSplashScreen: React.FC<GoldMatkaSplashScreenProps> = ({
  onComplete,
  durationMs = 3000
}) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Connecting to GoldMatka Cloud...');
  const [fadeOut, setFadeOut] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Play gold sound on mount
  useEffect(() => {
    try {
      playSuccessSound();
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  // Loading Progress Timer
  useEffect(() => {
    const intervalTime = 30;
    const step = 100 / (durationMs / intervalTime);

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        if (next > 75) {
          setStatusText('Welcome to GoldMatka!');
        } else if (next > 45) {
          setStatusText('Synchronizing Live Results & Disawar...');
        } else if (next > 20) {
          setStatusText('Loading Live Markets & Rates...');
        }
        return next;
      });
    }, intervalTime);

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, durationMs - 400);

    const finishTimer = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => {
      clearInterval(timer);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onComplete]);

  // 3D Realistic Tumbling Gold Coins Canvas Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initial Fountain Coins bursting from the Matka center
    const coins: CoinParticle[] = [];
    const matkaCenterY = height * 0.42;
    const matkaCenterX = width * 0.5;

    const coinCount = width < 480 ? 42 : 65;

    for (let i = 0; i < coinCount; i++) {
      const angle = (Math.random() * Math.PI * 1.5) - (Math.PI * 1.25); // Burst upward in an arc
      const speed = Math.random() * 9 + 4;
      coins.push({
        x: matkaCenterX + (Math.random() - 0.5) * 40,
        y: matkaCenterY + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
        vy: -Math.abs(Math.sin(angle)) * speed - 3.5, // Strong upward burst
        radius: Math.random() * 8 + 14, // 14px - 22px
        angle: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() * 0.12 + 0.05) * (Math.random() > 0.5 ? 1 : -1),
        wobbleSpeed: Math.random() * 0.08 + 0.02,
        wobbleAngle: Math.random() * Math.PI * 2,
        tilt: (Math.random() - 0.5) * 0.5,
        colorType: i % 3,
        alpha: 1,
        symbol: i % 4 === 0 ? '777' : '₹'
      });
    }

    // Sparkles
    interface Sparkle {
      x: number;
      y: number;
      size: number;
      life: number;
      maxLife: number;
      alpha: number;
    }
    const sparkles: Sparkle[] = [];

    // Helper: Draw 3D Coin with realistic depth and ₹ Rupee embossing
    function draw3DCoin(c: CoinParticle) {
      if (!ctx) return;
      const cosA = Math.cos(c.angle);
      const absCos = Math.abs(cosA);
      const sinW = Math.sin(c.wobbleAngle);

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.tilt + sinW * 0.2);
      ctx.globalAlpha = Math.max(0, c.alpha);

      const rX = Math.max(2, c.radius * absCos);
      const rY = c.radius;
      const thickness = Math.max(1.5, c.radius * 0.28 * (1 - absCos * 0.7));

      // 1. Draw 3D Extruded Coin Edge (Bronze/Deep Gold Rim)
      if (absCos < 0.95) {
        ctx.beginPath();
        const sideDir = cosA > 0 ? 1 : -1;
        ctx.fillStyle = c.colorType === 0 ? '#B47B14' : c.colorType === 1 ? '#8E600F' : '#9E6D12';
        ctx.ellipse(sideDir * (thickness * 0.5), 0, rX, rY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // 2. Draw Coin Face with Rich Gold Radial Gradient
      const grad = ctx.createRadialGradient(-rX * 0.3, -rY * 0.3, rX * 0.1, 0, 0, rY * 1.1);
      if (c.colorType === 0) {
        grad.addColorStop(0, '#FFFBE6');
        grad.addColorStop(0.25, '#FFD700');
        grad.addColorStop(0.7, '#D4AF37');
        grad.addColorStop(1, '#8A6218');
      } else if (c.colorType === 1) {
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.2, '#FFE57F');
        grad.addColorStop(0.65, '#E5A912');
        grad.addColorStop(1, '#6F4E07');
      } else {
        grad.addColorStop(0, '#FFF5A6');
        grad.addColorStop(0.3, '#F59E0B');
        grad.addColorStop(0.75, '#B45309');
        grad.addColorStop(1, '#502403');
      }

      ctx.beginPath();
      ctx.ellipse(0, 0, rX, rY, 0, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Outer Bevel Rim
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = '#FFE885';
      ctx.stroke();

      // Inner Decorative Circle (embossed dotted / line rim)
      if (absCos > 0.35) {
        ctx.beginPath();
        ctx.ellipse(0, 0, rX * 0.78, rY * 0.78, 0, 0, Math.PI * 2);
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = 'rgba(100, 60, 5, 0.45)';
        ctx.stroke();

        // 3. Center Embossed Symbol ('₹' or '777')
        ctx.fillStyle = '#5A3D06';
        ctx.font = `bold ${Math.round(rY * (c.symbol === '777' ? 0.45 : 0.62))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(c.symbol, 0, 1);

        // Highlight layer on symbol
        ctx.fillStyle = '#FFE57F';
        ctx.fillText(c.symbol, -0.6, 0.2);
      }

      // 4. Specular Shine / Glint when facing the camera
      if (absCos > 0.88 && Math.random() < 0.15) {
        sparkles.push({
          x: c.x + (Math.random() - 0.5) * rX,
          y: c.y + (Math.random() - 0.5) * rY,
          size: Math.random() * 8 + 6,
          life: 0,
          maxLife: 20,
          alpha: 1
        });
      }

      ctx.restore();
    }

    // Helper: Draw 4-point Diamond Star Glint
    function drawStarSparkle(s: Sparkle) {
      if (!ctx) return;
      const p = s.life / s.maxLife;
      const alpha = Math.sin(p * Math.PI) * s.alpha;
      const sz = s.size * (1 + p * 0.5);

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#FFE082';
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(0, -sz);
      ctx.quadraticCurveTo(0, 0, sz, 0);
      ctx.quadraticCurveTo(0, 0, 0, sz);
      ctx.quadraticCurveTo(0, 0, -sz, 0);
      ctx.quadraticCurveTo(0, 0, 0, -sz);
      ctx.fill();

      // Center core
      ctx.beginPath();
      ctx.arc(0, 0, sz * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFDE7';
      ctx.fill();

      ctx.restore();
    }

    // Main Canvas Render Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Update and Draw Coins
      for (let i = 0; i < coins.length; i++) {
        const c = coins[i];

        // Apply physics
        c.vy += 0.24; // Gravity
        c.vx *= 0.985; // Air resistance
        c.x += c.vx;
        c.y += c.vy;

        // Tumbling spin
        c.angle += c.spinSpeed;
        c.wobbleAngle += c.wobbleSpeed;

        // Ground bounce with dissipation
        if (c.y > height - 60 && c.vy > 0) {
          c.vy = -c.vy * 0.42;
          c.vx *= 0.8;
          if (Math.abs(c.vy) < 1.5) {
            c.vy = 0;
            c.spinSpeed *= 0.8;
          }
        }

        draw3DCoin(c);
      }

      // 2. Update and Draw Star Sparkles
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.life++;
        if (s.life >= s.maxLife) {
          sparkles.splice(i, 1);
        } else {
          drawStarSparkle(s);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className={`gold-splash-container ${fadeOut ? 'splash-fade-out' : ''}`}
      onClick={() => {
        setFadeOut(true);
        setTimeout(onComplete, 180);
      }}
      title="Tap anywhere to skip"
    >
      {/* 3D Realistic Falling & Tumbling Gold Coins HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Royal Sunburst Glow in Background */}
      <div className="splash-sunburst-backdrop" aria-hidden="true"></div>

      {/* Central Sacred Matka Pot & Royal Crown */}
      <div className="splash-center-content">
        {/* Hypnotic Golden Energy Aura Rings */}
        <div className="splash-emblem-wrap">
          <div className="splash-pulse-ring ring-1"></div>
          <div className="splash-pulse-ring ring-2"></div>
          <div className="splash-pulse-ring ring-3"></div>

          {/* Central 3D Sacred Golden Vessel (Matka) */}
          <div className="splash-matka-icon">
            {/* Imperial Gold Crown Floating on Top */}
            <div className="crown-topper">
              <Crown size={34} color="#FFE082" strokeWidth={2.8} />
              <div className="crown-gem ruby-center"></div>
            </div>

            {/* High-Fidelity 3D Golden Matka Pot SVG */}
            <svg width="96" height="96" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                {/* 3D Rich Gold Gradient */}
                <linearGradient id="goldPotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFBE6" />
                  <stop offset="20%" stopColor="#FFD700" />
                  <stop offset="55%" stopColor="#D4AF37" />
                  <stop offset="85%" stopColor="#AA771C" />
                  <stop offset="100%" stopColor="#5C3A00" />
                </linearGradient>

                {/* High-Gloss Mirror Highlight */}
                <radialGradient id="specularGleam" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                  <stop offset="25%" stopColor="#FFE57F" stopOpacity="0.6" />
                  <stop offset="60%" stopColor="#D4AF37" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.7" />
                </radialGradient>

                {/* Pot Rim Inner Shadow */}
                <radialGradient id="potMouthDark" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#2A1800" />
                  <stop offset="70%" stopColor="#523204" />
                  <stop offset="100%" stopColor="#8A560D" />
                </radialGradient>
              </defs>

              {/* Pot Base Pedestal */}
              <ellipse cx="60" cy="98" rx="28" ry="6" fill="#6A460A" />
              <ellipse cx="60" cy="97" rx="26" ry="5" fill="url(#goldPotGrad)" />

              {/* Matka Belly Sphere */}
              <circle cx="60" cy="68" r="38" fill="url(#goldPotGrad)" stroke="#FFE885" strokeWidth="1.2" />
              <circle cx="60" cy="68" r="38" fill="url(#specularGleam)" />

              {/* Ornate Gold Filigree Belly Bands */}
              <path d="M 24 64 Q 60 82 96 64" stroke="#FFF7C2" strokeWidth="3" fill="none" opacity="0.95" />
              <path d="M 28 73 Q 60 91 92 73" stroke="#FFF7C2" strokeWidth="2.2" fill="none" opacity="0.8" />
              <path d="M 32 82 Q 60 98 88 82" stroke="#FFF7C2" strokeWidth="1.5" fill="none" opacity="0.65" />

              {/* Center Royal Medallion on Belly */}
              <circle cx="60" cy="74" r="8" fill="#FFFBE6" stroke="#9E6D12" strokeWidth="1.5" />
              <polygon points="60,68 64,74 60,80 56,74" fill="#EF4444" /> {/* Sparkling Ruby Gem */}

              {/* Matka Neck & Collar */}
              <path d="M 38 32 C 38 46, 46 52, 46 56 L 74 56 C 74 52, 82 46, 82 32 Z" fill="url(#goldPotGrad)" stroke="#FFE57F" strokeWidth="1" />

              {/* Open Matka Mouth Overflowing with Gold */}
              <ellipse cx="60" cy="30" rx="28" ry="9" fill="url(#goldPotGrad)" stroke="#FFFFFF" strokeWidth="1.2" />
              <ellipse cx="60" cy="30" rx="22" ry="6" fill="url(#potMouthDark)" />

              {/* Overflowing Gold Coins at Rim */}
              <ellipse cx="50" cy="28" rx="8" ry="4" fill="#FFE57F" stroke="#9E6D12" strokeWidth="0.8" />
              <ellipse cx="68" cy="27" rx="7" ry="3.5" fill="#FFD700" stroke="#9E6D12" strokeWidth="0.8" />
              <ellipse cx="59" cy="25" rx="8" ry="4" fill="#FFF9C4" stroke="#9E6D12" strokeWidth="0.8" />
            </svg>
          </div>
        </div>

        {/* Brand Name Typography with Gold Metallic Sweep */}
        <h1 className="splash-title">
          <span className="shimmer-text">GOLDEN MATKA</span>
        </h1>

        <div className="splash-subtitle">
          INDIA&apos;S #1 TRUSTED ONLINE MATKA
        </div>

        <div className="splash-badge">
          <Sparkles size={14} color="#FFE082" />
          <span>Instant 24x7 Withdrawals • 100% Genuine Rates</span>
        </div>
      </div>

      {/* Bottom Loading Progress Bar */}
      <div className="splash-bottom-bar">
        <div className="splash-progress-track">
          <div
            className="splash-progress-fill"
            style={{ width: `${Math.min(100, Math.round(progress))}%` }}
          ></div>
        </div>
        <div className="splash-loading-text">
          {statusText} ({Math.min(100, Math.round(progress))}%)
        </div>
        <div className="splash-skip-hint">Tap anywhere to skip ➔</div>
      </div>
    </div>
  );
};
