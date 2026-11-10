import React from 'react';
import { ArrowLeft, Download, ShieldCheck, Smartphone, Bell, Zap, CheckCircle2 } from 'lucide-react';

interface LatestAppScreenProps {
  onBack: () => void;
}

export const LatestAppScreen: React.FC<LatestAppScreenProps> = ({ onBack }) => {
  const handleDownload = () => {
    // Direct APK download link or simulated APK
    const link = document.createElement('a');
    link.href = '/janta555.apk';
    link.download = 'Janta555.apk';
    alert('Starting JANTA555 APK Download...\nThank you for choosing JANTA555!');
  };

  return (
    <div style={{ paddingBottom: 80, minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Sticky Header */}
      <div style={{
        background: 'var(--primary)',
        color: 'white',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 45
      }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'white',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#1E293B'
          }}
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
        <span style={{ fontSize: 17, fontWeight: 900 }}>DOWNLOAD JANTA555 APP</span>
      </div>

      <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Hero App Card */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: 20,
          padding: '24px 20px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(15,23,42,0.2)'
        }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            boxShadow: '0 4px 14px rgba(225,29,72,0.4)'
          }}>
            <Smartphone size={36} color="white" />
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4, letterSpacing: 0.5 }}>
            JANTA555 OFFICIAL APP
          </h2>
          <div style={{ fontSize: 13, color: '#38BDF8', fontWeight: 800, marginBottom: 12 }}>
            Version 2.5.0 (Latest Stable) • 8.5 MB
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.1)',
            padding: '4px 12px',
            borderRadius: 9999,
            fontSize: 11.5,
            color: '#4ADE80',
            marginBottom: 20
          }}>
            <ShieldCheck size={14} />
            <span>100% Virus Free & Verified</span>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              fontWeight: 900,
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: '0 4px 14px rgba(16,185,129,0.4)'
            }}
          >
            <Download size={22} strokeWidth={2.8} />
            <span>DOWNLOAD ANDROID APK</span>
          </button>
        </div>

        {/* Feature Badges */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 900, color: '#0F172A', marginBottom: 12 }}>
            ⚡ Why Download JANTA555 App?
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              {
                icon: <Zap size={18} color="#D97706" />,
                title: 'Fastest 1-Click Bidding',
                desc: 'Zero lag, smooth responsive numbers keypad, instant bet confirmation.'
              },
              {
                icon: <Bell size={18} color="#0284C7" />,
                title: 'Live Result Push Notifications',
                desc: 'Get notified immediately the second your market result opens or closes.'
              },
              {
                icon: <ShieldCheck size={18} color="#16A34A" />,
                title: 'Auto-UPI Deposit & 5-Min Withdrawal',
                desc: 'Seamless UPI gateway integration for instant wallet top-up anytime 24x7.'
              }
            ].map(f => (
              <div key={f.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.4 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to Install Guide */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 900, color: '#0F172A', marginBottom: 12 }}>
            📲 3 Simple Steps to Install
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { step: '1', text: 'Click "DOWNLOAD ANDROID APK" button above to start download.' },
              { step: '2', text: 'When prompted in your browser, tap "Download Anyway" & Open the file.' },
              { step: '3', text: 'Allow "Install unknown apps" permission in Android settings and tap Install.' }
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: 'white',
                  fontWeight: 900,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {s.step}
                </div>
                <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.4 }}>
                  {s.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
