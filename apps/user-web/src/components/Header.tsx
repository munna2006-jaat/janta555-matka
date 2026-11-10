import React from 'react';
import { Menu, RotateCw, ArrowLeft, Download, Wallet, Plus, Bell } from 'lucide-react';
import { playClickSound, playPopupSound } from '../utils/soundEffects';
import { JantaLogo } from './JantaLogo';

interface HeaderProps {
  balance: number;
  onOpenMenu: () => void;
  onOpenFunds: () => void;
  onOpenNotifications: () => void;
  onGoHome?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  canGoBack?: boolean;
  onBack?: () => void;
  onNavigateView?: (view: string) => void;
  currentView?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  balance, 
  onOpenMenu, 
  onOpenFunds, 
  onOpenNotifications, 
  onGoHome,
  onRefresh,
  isRefreshing = false,
  canGoBack = false,
  onBack,
  onNavigateView,
  currentView = 'home'
}) => {
  const handleDownloadApk = () => {
    playClickSound();
    const link = document.createElement('a');
    link.href = '/janta555.apk';
    link.setAttribute('download', 'Janta555.apk');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="janta-header glass-navbar" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Left: Hamburger & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {canGoBack && onBack ? (
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onBack();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'linear-gradient(135deg, #0284C7, #2563EB)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
              }}
            >
              <ArrowLeft size={15} strokeWidth={3} />
              <span>BACK</span>
            </button>
          ) : (
            <button
              type="button"
              className="menu-btn"
              onClick={() => {
                playPopupSound();
                onOpenMenu();
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              aria-label="Open menu"
            >
              <Menu size={20} strokeWidth={2.5} />
            </button>
          )}

          <div onClick={onGoHome} style={{ cursor: 'pointer' }}>
            <JantaLogo size="md" />
          </div>
        </div>

        {/* Center: Desktop Navigation Links (matching Reference Image 1) */}
        <nav className="janta-desktop-nav" style={{
          display: 'none',
          alignItems: 'center',
          gap: 24
        }}>
          {[
            { id: 'charts', label: 'Charts' },
            { id: 'rates', label: 'Rates' },
            { id: 'home', label: 'Markets' },
            { id: 'about', label: 'About Us' },
            { id: 'how-to-play', label: 'How To Play' }
          ].map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                playClickSound();
                if (onNavigateView) onNavigateView(item.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 14,
                fontWeight: currentView === item.id ? 800 : 600,
                color: currentView === item.id ? '#0284C7' : '#475569',
                cursor: 'pointer',
                padding: '6px 0',
                borderBottom: currentView === item.id ? '2px solid #0284C7' : '2px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: Balance Pill & Download APK button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Refresh balance */}
          {onRefresh && (
            <button
              type="button"
              className={`refresh-btn ${isRefreshing ? 'spinning' : ''}`}
              onClick={() => {
                playClickSound();
                onRefresh();
              }}
              title="Refresh Balance"
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#2563EB',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <RotateCw size={15} strokeWidth={2.5} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          )}

          {/* Wallet Balance Pill */}
          <div
            onClick={() => {
              playClickSound();
              onOpenFunds();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#FFFFFF',
              border: '1.5px solid #0284C7',
              borderRadius: 9999,
              padding: '4px 10px 4px 6px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.15)'
            }}
          >
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284C7, #2563EB)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Plus size={14} strokeWidth={3} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 900, color: '#0F172A', fontFamily: 'monospace' }}>
              ₹{Number(balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Download APK Pill (Matching Reference Image 1) */}
          <button
            type="button"
            className="janta-download-btn"
            onClick={handleDownloadApk}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'linear-gradient(135deg, #0284C7 0%, #2563EB 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 9999,
              padding: '7px 16px',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 3px 12px rgba(2, 132, 199, 0.35)',
              transition: 'all 0.15s ease'
            }}
          >
            <Download size={15} strokeWidth={2.8} />
            <span>Download APK</span>
          </button>
        </div>
      </div>
    </header>
  );
};
