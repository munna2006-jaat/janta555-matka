import React, { useState, useEffect } from 'react';
import { 
  Download, Play, Smartphone, ShieldCheck, Zap, Award, 
  HelpCircle, CheckCircle2, Star, Sparkles, Crown, ArrowRight,
  TrendingUp, Clock, Headphones, ChevronDown, Check, Globe
} from 'lucide-react';
import { WhatsAppIcon } from './MarketCard';
import { playClickSound, playSuccessSound } from '../utils/soundEffects';
import { trackApkDownload, trackContact } from '../utils/metaPixel';

interface LandingPageProps {
  onPlayOnline: () => void;
  whatsappNumber?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onPlayOnline, whatsappNumber = '+919876543210' }) => {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const cleanWaNumber = whatsappNumber.replace(/[^0-9]/g, '');

  const handleDownloadApk = () => {
    playSuccessSound();
    trackApkDownload();
    setDownloadStarted(true);
    // Trigger download
    const link = document.createElement('a');
    link.href = '/goldmatka.apk';
    link.setAttribute('download', 'GoldMatka.apk');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setDownloadStarted(false), 5000);
  };

  const gameRates = [
    { title: 'Single Digit', payout: '1 : 9.5', example: '₹10 ➔ ₹95', desc: 'Single Ank 0 to 9' },
    { title: 'Jodi Digit', payout: '1 : 95', example: '₹10 ➔ ₹950', desc: 'Jodi Pair 00 to 99' },
    { title: 'Single Pana', payout: '1 : 150', example: '₹10 ➔ ₹1,500', desc: '3 Distinct Digits Panel' },
    { title: 'Double Pana', payout: '1 : 300', example: '₹10 ➔ ₹3,000', desc: 'Double Digits Panel' },
    { title: 'Triple Pana', payout: '1 : 900', example: '₹10 ➔ ₹9,000', desc: 'Triple Repetition Panel' },
    { title: 'Half Sangam', payout: '1 : 1,400', example: '₹10 ➔ ₹14,000', desc: 'Pana + Ank Combination' },
    { title: 'Full Sangam', payout: '1 : 10,000', example: '₹10 ➔ ₹1,00,000', desc: 'Open Pana + Close Pana' }
  ];

  const features = [
    {
      icon: <Zap size={24} color="#F59E0B" />,
      title: '15-Min Express Payout',
      desc: 'Instant UPI and Bank transfers 24x7 without any withdrawal fees.'
    },
    {
      icon: <ShieldCheck size={24} color="#10B981" />,
      title: '100% Safe & Trusted',
      desc: 'Certified secure platform with over 50,000 active daily players across India.'
    },
    {
      icon: <Award size={24} color="#F59E0B" />,
      title: 'Highest Market Rates',
      desc: 'Guaranteed highest game rates in market (Single 1:9.5, Jodi 1:95, Sangam 1:10000).'
    },
    {
      icon: <Globe size={24} color="#3B82F6" />,
      title: '9 Indian Languages',
      desc: 'Play comfortably in Hindi, Marathi, Gujarati, Punjabi, Telugu, Tamil, and more.'
    }
  ];

  const faqs = [
    {
      q: 'GoldMatka Android App kaise download aur install karein?',
      a: 'Upar diye gaye "Download Android App (APK)" button par click karein. Download hone ke baad file par tap karein aur "Install" select karein. Agar phone "Install from unknown sources" maangta hai to use allow karein.'
    },
    {
      q: 'Minimum Deposit aur Withdrawal kitna hai?',
      a: 'Minimum deposit sirf ₹100 hai aur minimum withdrawal sirf ₹300 hai. PhonePe, Google Pay, Paytm aur Bank transfer se turant payment ho jata hai.'
    },
    {
      q: 'Withdrawal aane me kitna time lagta hai?',
      a: 'GoldMatka par auto-approved payouts hain. Withdrawal request submit karte hi 10 se 15 minute ke andar paisa aapke account me credit ho jata hai.'
    },
    {
      q: 'Kya GoldMatka me Disawar aur Satta King bhi shamil hai?',
      a: 'Haan! GoldMatka me sabhi regular Matka (Kalyan, Milan, Rajdhani, Madhur) ke saath-saath Gali, Desawar, Faridabad, Gaziabad, Delhi Bazar aur Shree Ganesh ke live fastest results aur betting shamil hain.'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #09080D 0%, #120F18 50%, #07060A 100%)',
      color: '#FFFFFF',
      fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
      overflowX: 'hidden'
    }}>
      {/* 1. LUXURY STICKY NAVIGATION HEADER */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(9, 8, 13, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #FFD700 0%, #B45309 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(255, 215, 0, 0.5)'
          }}>
            <Crown size={22} color="#000000" strokeWidth={2.8} />
          </div>
          <div>
            <div style={{
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: 1,
              background: 'linear-gradient(90deg, #FFF5A6 0%, #FFD700 50%, #D4AF37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              GOLDMATKA
            </div>
            <div style={{ fontSize: 9.5, color: '#94A3B8', letterSpacing: 1.2, fontWeight: 700 }}>
              INDIA&apos;S #1 TRUSTED APP
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onPlayOnline();
            }}
            style={{
              background: 'transparent',
              color: '#FDE047',
              border: '1.5px solid rgba(253, 224, 71, 0.4)',
              borderRadius: 9999,
              padding: '7px 16px',
              fontSize: 12.5,
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Play Online ➔
          </button>

          <button
            type="button"
            onClick={handleDownloadApk}
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 9999,
              padding: '8px 18px',
              fontSize: 12.5,
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
            }}
          >
            <Download size={15} />
            <span>Download App</span>
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section style={{
        padding: '50px 20px 40px',
        textAlign: 'center',
        position: 'relative',
        background: 'radial-gradient(circle at 50% 20%, rgba(212, 175, 55, 0.15) 0%, transparent 60%)'
      }}>
        {/* Trust Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(255, 215, 0, 0.1)',
          border: '1.2px solid rgba(255, 215, 0, 0.35)',
          padding: '6px 16px',
          borderRadius: 9999,
          color: '#FDE047',
          fontSize: 12,
          fontWeight: 800,
          marginBottom: 20,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)'
        }}>
          <Sparkles size={14} />
          <span>OFFICIAL VERIFIED APP • 100% GENUINE & SAFE</span>
        </div>

        {/* Main Headline */}
        <h1 style={{
          fontSize: 'clamp(28px, 6vw, 48px)',
          fontWeight: 900,
          lineHeight: 1.15,
          maxWidth: 750,
          margin: '0 auto 16px',
          letterSpacing: '-0.5px'
        }}>
          Play Online Matka & Satta King with{' '}
          <span style={{
            background: 'linear-gradient(90deg, #FFF5A6 0%, #FFD700 50%, #F59E0B 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(255, 215, 0, 0.3)'
          }}>
            Fastest Live Results
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(14px, 3.5vw, 17px)',
          color: '#94A3B8',
          maxWidth: 600,
          margin: '0 auto 28px',
          lineHeight: 1.5,
          fontWeight: 500
        }}>
          India&apos;s most trusted Matka platform. Highest market rates, 15-minute express withdrawals directly to UPI/Bank, and 24x7 instant customer support.
        </p>

        {/* PROMINENT APK DOWNLOAD CARD */}
        <div style={{
          maxWidth: 460,
          margin: '0 auto 35px',
          background: 'linear-gradient(135deg, rgba(30, 26, 38, 0.95) 0%, rgba(18, 15, 24, 0.98) 100%)',
          border: '2px solid rgba(255, 215, 0, 0.45)',
          borderRadius: 20,
          padding: '24px 20px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(255, 215, 0, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            <Smartphone size={24} color="#34D399" />
            <span style={{ fontSize: 16, fontWeight: 900, color: '#F1F5F9' }}>
              GoldMatka Mobile App (Android)
            </span>
          </div>

          {/* Big Download Button */}
          <button
            type="button"
            onClick={handleDownloadApk}
            style={{
              width: '100%',
              background: 'linear-gradient(90deg, #F59E0B 0%, #FFD700 50%, #F59E0B 100%)',
              color: '#000000',
              border: 'none',
              borderRadius: 14,
              padding: '16px 20px',
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: 0.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              boxShadow: '0 6px 25px rgba(245, 158, 11, 0.45)',
              transition: 'transform 0.15s, box-shadow 0.15s'
            }}
          >
            <Download size={22} strokeWidth={2.8} />
            <span>DOWNLOAD ANDROID APP (APK)</span>
          </button>

          {downloadStarted && (
            <div style={{
              marginTop: 12,
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10B981',
              borderRadius: 8,
              padding: '8px 12px',
              color: '#34D399',
              fontSize: 12,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}>
              <CheckCircle2 size={16} />
              <span>APK Download Started! Check your notification bar.</span>
            </div>
          )}

          {/* Version & OS details */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            marginTop: 14,
            fontSize: 11.5,
            color: '#94A3B8',
            fontWeight: 700
          }}>
            <span>📦 Version 2.4.0</span>
            <span>•</span>
            <span>⚡ Size: ~4.8 MB</span>
            <span>•</span>
            <span>📱 Android 7.0 - 15+</span>
          </div>

          <div style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10
          }}>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onPlayOnline();
              }}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#F8FAFC',
                borderRadius: 10,
                padding: '10px 12px',
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <Play size={14} fill="#F8FAFC" />
              <span>Play in Browser</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                trackContact('whatsapp');
                window.open(`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent('Hello Admin, I want to play on GoldMatka')}`, '_blank');
              }}
              style={{
                flex: 1,
                background: 'rgba(37, 211, 102, 0.12)',
                border: '1px solid rgba(37, 211, 102, 0.35)',
                color: '#25D366',
                borderRadius: 10,
                padding: '10px 12px',
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <WhatsAppIcon size={16} />
              <span>WhatsApp Admin</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'clamp(14px, 4vw, 40px)',
          flexWrap: 'wrap',
          maxWidth: 700,
          margin: '0 auto'
        }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#FFD700' }}>50,000+</div>
            <div style={{ fontSize: 11.5, color: '#64748B', fontWeight: 700 }}>ACTIVE PLAYERS</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#34D399' }}>15 Mins</div>
            <div style={{ fontSize: 11.5, color: '#64748B', fontWeight: 700 }}>INSTANT WITHDRAWAL</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#38BDF8' }}>100%</div>
            <div style={{ fontSize: 11.5, color: '#64748B', fontWeight: 700 }}>WINNING PAYOUT</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#F43F5E' }}>★ 4.9 / 5</div>
            <div style={{ fontSize: 11.5, color: '#64748B', fontWeight: 700 }}>USER RATING</div>
          </div>
        </div>
      </section>

      {/* 3. GAME RATES SHOWCASE */}
      <section style={{
        padding: '40px 20px',
        maxWidth: 880,
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div style={{ color: '#F59E0B', fontSize: 12, fontWeight: 800, letterSpacing: 1.5, marginBottom: 4 }}>
            UNBEATABLE MARKET PAYOUTS
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900 }}>
            GoldMatka Game Rates (गेम रेट्स)
          </h2>
          <p style={{ fontSize: 13, color: '#94A3B8' }}>
            We provide the most competitive game rates with zero hidden commission.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 14
        }}>
          {gameRates.map(gr => (
            <div
              key={gr.title}
              style={{
                background: 'linear-gradient(135deg, rgba(26, 22, 34, 0.8) 0%, rgba(15, 13, 20, 0.95) 100%)',
                border: '1.2px solid rgba(212, 175, 55, 0.3)',
                borderRadius: 14,
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)'
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#F1F5F9' }}>{gr.title}</div>
                <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>{gr.desc}</div>
                <div style={{ fontSize: 11, color: '#10B981', fontWeight: 800, marginTop: 4 }}>{gr.example}</div>
              </div>
              <div style={{
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: 8,
                padding: '6px 12px',
                color: '#FDE047',
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: 0.5
              }}>
                {gr.payout}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. KEY FEATURES */}
      <section style={{
        padding: '40px 20px',
        maxWidth: 880,
        margin: '0 auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ color: '#10B981', fontSize: 12, fontWeight: 800, letterSpacing: 1.5, marginBottom: 4 }}>
            WHY 50,000+ PLAYERS TRUST US
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900 }}>
            GoldMatka Exclusive Benefits
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16
        }}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(22, 19, 29, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 16,
                padding: '20px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12
              }}>
                {f.icon}
              </div>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#F8FAFC', marginBottom: 6 }}>
                {f.title}
              </div>
              <div style={{ fontSize: 12.5, color: '#94A3B8', lineHeight: 1.5 }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. 3-STEP APK INSTALLATION GUIDE */}
      <section style={{
        padding: '40px 20px',
        maxWidth: 780,
        margin: '0 auto',
        background: 'linear-gradient(135deg, rgba(26, 22, 34, 0.9) 0%, rgba(13, 11, 18, 0.95) 100%)',
        border: '1.5px solid rgba(212, 175, 55, 0.35)',
        borderRadius: 22,
        boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#FFD700' }}>
            How to Install on Android in 3 Steps
          </h2>
          <p style={{ fontSize: 13, color: '#94A3B8' }}>
            Simple 1-minute setup on any Android smartphone
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: 'rgba(255,255,255,0.04)', padding: 14, borderRadius: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#F59E0B',
              color: 'black',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              1
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#F8FAFC' }}>Click &quot;Download Android App (APK)&quot;</div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                Click the download button above to save the lightweight <code>GoldMatka.apk</code> file to your device.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: 'rgba(255,255,255,0.04)', padding: 14, borderRadius: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#F59E0B',
              color: 'black',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              2
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#F8FAFC' }}>Tap the File &amp; Choose &quot;Install&quot;</div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                Open downloaded file from your notification bar. If prompted, toggle &quot;Allow installation from this source&quot;.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: 'rgba(255,255,255,0.04)', padding: 14, borderRadius: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#10B981',
              color: 'white',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              3
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#F8FAFC' }}>Open App &amp; Start Playing</div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                Open GoldMatka, login with your mobile number, and enjoy seamless betting with 3D startup animations!
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            type="button"
            onClick={handleDownloadApk}
            style={{
              background: 'linear-gradient(90deg, #F59E0B 0%, #FFD700 100%)',
              color: 'black',
              border: 'none',
              borderRadius: 12,
              padding: '12px 28px',
              fontSize: 14,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(245, 158, 11, 0.45)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Download size={18} />
            <span>Download APK Now (~4.8 MB)</span>
          </button>
        </div>
      </section>

      {/* 6. FAQS */}
      <section style={{
        padding: '40px 20px',
        maxWidth: 720,
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900 }}>Frequently Asked Questions</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(22, 19, 29, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 12,
                  overflow: 'hidden'
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: 'none',
                    border: 'none',
                    color: '#F8FAFC',
                    fontSize: 14,
                    fontWeight: 800,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      flexShrink: 0
                    }}
                  />
                </button>
                {isOpen && (
                  <div style={{
                    padding: '0 16px 14px',
                    fontSize: 12.5,
                    color: '#94A3B8',
                    lineHeight: 1.5,
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    paddingTop: 10
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. FLOATING WHATSAPP BUTTON */}
      <div
        onClick={() => {
          playClickSound();
          trackContact('whatsapp');
          window.open(`https://wa.me/${cleanWaNumber}?text=${encodeURIComponent('Hello Admin, I need help with GoldMatka app')}`, '_blank');
        }}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 20,
          zIndex: 60,
          background: '#25D366',
          color: 'white',
          borderRadius: 9999,
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 4px 20px rgba(37, 211, 102, 0.55)',
          cursor: 'pointer',
          fontWeight: 800,
          fontSize: 13,
          transition: 'transform 0.15s'
        }}
      >
        <WhatsAppIcon size={20} color="white" />
        <span>WhatsApp 24x7</span>
      </div>

      {/* 8. FOOTER */}
      <footer style={{
        borderTop: '1px solid rgba(212, 175, 55, 0.2)',
        padding: '30px 20px 40px',
        textAlign: 'center',
        background: '#050407',
        color: '#64748B',
        fontSize: 12
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '4px 12px',
          borderRadius: 6,
          color: '#F87171',
          fontWeight: 800,
          fontSize: 11,
          marginBottom: 14
        }}>
          🔞 18+ STRICTLY ENTERTAINMENT ONLY
        </div>

        <p style={{ maxWidth: 600, margin: '0 auto 12px', lineHeight: 1.5 }}>
          GoldMatka is a fantasy gaming and entertainment platform. Please play responsibly. We encourage safe and self-controlled gaming habits.
        </p>

        <div style={{ color: '#94A3B8', fontWeight: 600 }}>
          © 2026 GoldMatka. All Rights Reserved • Fastest Results &amp; Direct Payouts.
        </div>
      </footer>
    </div>
  );
};

