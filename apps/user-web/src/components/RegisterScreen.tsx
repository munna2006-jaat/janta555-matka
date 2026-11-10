import React, { useState, useEffect } from 'react';
import { User, Phone, Key, UserPlus, CheckCircle2, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { GoldenLogo } from './GoldenLogo';
import { trackRegistration } from '../utils/metaPixel';

interface RegisterScreenProps {
  onSuccess: (token: string, user: any) => void;
  onExploreAsGuest?: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSuccess, onExploreAsGuest }) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [referralCode, setReferralCode] = useState('GR1982');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    setError(null);
    setSuccessMsg(null);

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await fetch('/api/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to send OTP.');
      }
      setOtpSent(true);
      setCountdown(45);
      setSuccessMsg(`OTP sent to +91 ${cleanPhone}. Please enter the 4-digit code below.`);
    } catch (err: any) {
      setError(err.message || 'Could not send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 digits.');
      return;
    }

    // In register mode, if OTP not sent yet, send OTP first
    if (mode === 'register' && !otpSent) {
      await handleSendOtp();
      return;
    }

    // If OTP was sent in register mode, ensure OTP is entered
    if (mode === 'register' && otpSent && otp.trim().length !== 4) {
      setError('Please enter the 4-digit OTP received on your mobile.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'register' ? '/api/v1/auth/register' : '/api/v1/auth/login';
      const bodyData = mode === 'register'
        ? { phone: cleanPhone, name: name.trim() || 'Player', password, otp: otp.trim() }
        : { phone: cleanPhone, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (mode === 'register') {
        trackRegistration(cleanPhone);
      }

      onSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetFormForMode = (newMode: 'register' | 'login') => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
    setOtp('');
    setOtpSent(false);
    setCountdown(0);
  };

  return (
    <div className="auth-landing-wrapper">
      {/* Brand Logo - GoldenMatka Luxury GM Crest */}
      <GoldenLogo variant="auth" />

      {/* Main Registration / Sign In Card */}
      <div className="auth-register-card">
        <h1 className="auth-card-title">
          {mode === 'register' ? 'REGISTER' : 'SIGN IN'}
        </h1>
        <p className="auth-card-subtitle">
          {mode === 'register' ? 'Join GOLDEN MATKA' : 'Welcome to GOLDEN MATKA'}
        </p>

        {error && (
          <div className="auth-error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-success-alert">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="auth-input-group border-pink">
              <User size={20} className="auth-input-icon" />
              <input
                type="text"
                placeholder="Full Name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="auth-input-raw"
              />
            </div>
          )}

          {/* Mobile input with Get / Resend OTP button for register */}
          <div className="auth-input-group border-pink" style={{ display: 'flex', alignItems: 'center' }}>
            <Phone size={20} className="auth-input-icon" />
            <input
              type="tel"
              maxLength={10}
              placeholder="10-Digit Mobile Number"
              required
              value={phone}
              onChange={e => {
                setPhone(e.target.value.replace(/[^0-9]/g, ''));
                if (otpSent) {
                  setOtpSent(false);
                  setOtp('');
                }
              }}
              className="auth-input-raw"
            />
            {mode === 'register' && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp || countdown > 0 || phone.replace(/[^0-9]/g, '').length !== 10}
                style={{
                  background: countdown > 0 ? '#E2E8F0' : '#FF0055',
                  color: countdown > 0 ? '#64748B' : 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: countdown > 0 || phone.replace(/[^0-9]/g, '').length !== 10 ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  marginRight: 6
                }}
              >
                {sendingOtp ? 'SENDING...' : countdown > 0 ? `RESEND IN ${countdown}s` : otpSent ? 'RESEND OTP' : 'GET OTP'}
              </button>
            )}
          </div>

          {/* OTP Input Field */}
          {mode === 'register' && otpSent && (
            <div className="auth-input-group border-pink" style={{ background: '#FFF1F2' }}>
              <ShieldCheck size={20} className="auth-input-icon" color="#FF0055" />
              <input
                type="tel"
                maxLength={4}
                placeholder="Enter 4-Digit OTP"
                required
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                className="auth-input-raw"
                style={{ letterSpacing: 4, fontWeight: 800, fontSize: 16 }}
                autoFocus
              />
              <span style={{ fontSize: 11, color: '#FF0055', fontWeight: 800, paddingRight: 10 }}>
                VIA SMS
              </span>
            </div>
          )}

          <div className="auth-input-group border-pink">
            <Key size={20} className="auth-input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              maxLength={6}
              placeholder="4-Digit Password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="auth-input-raw"
            />
            <button
              type="button"
              className="auth-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={20} color="#475569" /> : <Eye size={20} color="#475569" />}
            </button>
          </div>

          {mode === 'register' && (
            <div className="auth-input-group border-green">
              <UserPlus size={20} className="auth-input-icon" />
              <div className="auth-referral-content">
                <input
                  type="text"
                  value={referralCode}
                  onChange={e => setReferralCode(e.target.value.toUpperCase())}
                  className="auth-referral-code-input"
                  placeholder="CODE"
                />
                <span className="auth-referral-label">Referred by: Atrsingh</span>
              </div>
              <CheckCircle2 size={20} className="auth-check-icon" />
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading || sendingOtp}
          >
            {loading
              ? 'PLEASE WAIT...'
              : mode === 'register'
                ? (otpSent ? 'VERIFY OTP & REGISTER' : 'SEND OTP & REGISTER')
                : 'SIGN IN NOW'}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="auth-toggle-footer">
          {mode === 'register' ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => resetFormForMode('login')}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => resetFormForMode('register')}
              >
                Register
              </button>
            </span>
          )}
        </div>

        {/* Guest Explore Option & Landing Page Link */}
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          {onExploreAsGuest && (
            <button
              type="button"
              onClick={onExploreAsGuest}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: 13,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                cursor: 'pointer'
              }}
            >
              <span>Explore Live Markets as Guest</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
