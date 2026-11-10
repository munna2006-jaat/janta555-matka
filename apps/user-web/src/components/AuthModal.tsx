import React, { useState, useEffect } from 'react';
import { X, Phone, Key, User, UserPlus, CheckCircle2, Eye, EyeOff, AlertCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import { trackRegistration } from '../utils/metaPixel';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (token: string, user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
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

  if (!isOpen) return null;

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
      setError('Password must be at least 4 characters long.');
      return;
    }

    // In register mode, if OTP not sent yet, send OTP first
    if (mode === 'register' && !otpSent) {
      await handleSendOtp();
      return;
    }

    // If OTP was sent in register mode, make sure OTP is entered
    if (mode === 'register' && otpSent && otp.trim().length !== 4) {
      setError('Please enter the 4-digit OTP received on your mobile.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/register';
      const bodyData = mode === 'login'
        ? { phone: cleanPhone, password }
        : { phone: cleanPhone, name: name.trim() || 'Player', password, otp: otp.trim() };

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

      onAuthSuccess(data.token, data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const resetFormForMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
    setOtp('');
    setOtpSent(false);
    setCountdown(0);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 410, borderRadius: 24 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ background: '#FF0055', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white'
              }}
              title="Back"
              aria-label="Back"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </button>
            <div className="modal-title" style={{ fontWeight: 900, letterSpacing: 0.5, fontSize: 16 }}>
              {mode === 'login' ? 'SIGN IN TO GOLDMATKA' : 'REGISTER TO GOLDMATKA'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }} aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '22px 20px' }}>
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

          {/* Mode Switcher */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: '#F1F5F9',
            borderRadius: 12,
            padding: 4,
            marginBottom: 20
          }}>
            <button
              type="button"
              onClick={() => resetFormForMode('register')}
              style={{
                padding: '10px',
                borderRadius: 9,
                border: 'none',
                background: mode === 'register' ? 'white' : 'transparent',
                color: mode === 'register' ? '#FF0055' : '#64748B',
                fontWeight: 900,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: mode === 'register' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              REGISTER
            </button>
            <button
              type="button"
              onClick={() => resetFormForMode('login')}
              style={{
                padding: '10px',
                borderRadius: 9,
                border: 'none',
                background: mode === 'login' ? 'white' : 'transparent',
                color: mode === 'login' ? '#FF0055' : '#64748B',
                fontWeight: 900,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: mode === 'login' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              SIGN IN
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="auth-input-group border-pink" style={{ height: 48, marginBottom: 14 }}>
                <User size={18} className="auth-input-icon" />
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  className="auth-input-raw"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            )}

            {/* Mobile Number with integrated Send/Resend OTP button for register */}
            <div className="auth-input-group border-pink" style={{ height: 48, marginBottom: 14, display: 'flex', alignItems: 'center' }}>
              <Phone size={18} className="auth-input-icon" />
              <input
                type="tel"
                maxLength={10}
                required
                placeholder="10-Digit Mobile Number"
                className="auth-input-raw"
                value={phone}
                onChange={e => {
                  setPhone(e.target.value.replace(/[^0-9]/g, ''));
                  if (otpSent) {
                    setOtpSent(false);
                    setOtp('');
                  }
                }}
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

            {/* OTP Input Field (shown in Register mode) */}
            {mode === 'register' && otpSent && (
              <div className="auth-input-group border-pink" style={{ height: 48, marginBottom: 14, background: '#FFF1F2' }}>
                <ShieldCheck size={18} className="auth-input-icon" color="#FF0055" />
                <input
                  type="tel"
                  maxLength={4}
                  required
                  placeholder="Enter 4-Digit OTP"
                  className="auth-input-raw"
                  style={{ letterSpacing: 4, fontWeight: 800, fontSize: 16 }}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  autoFocus
                />
                <span style={{ fontSize: 11, color: '#FF0055', fontWeight: 800, paddingRight: 10 }}>
                  VIA SMS
                </span>
              </div>
            )}

            <div className="auth-input-group border-pink" style={{ height: 48, marginBottom: 14 }}>
              <Key size={18} className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                maxLength={6}
                required
                placeholder="4-Digit Password"
                className="auth-input-raw"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password"
              >
                {showPassword ? <EyeOff size={18} color="#475569" /> : <Eye size={18} color="#475569" />}
              </button>
            </div>

            {mode === 'register' && (
              <div className="auth-input-group border-green" style={{ height: 48, marginBottom: 18 }}>
                <UserPlus size={18} className="auth-input-icon" />
                <div className="auth-referral-content">
                  <input
                    type="text"
                    value={referralCode}
                    onChange={e => setReferralCode(e.target.value.toUpperCase())}
                    className="auth-referral-code-input"
                  />
                  <span className="auth-referral-label">Referred by: Atrsingh</span>
                </div>
                <CheckCircle2 size={18} className="auth-check-icon" />
              </div>
            )}

            <button
              type="submit"
              className="auth-submit-btn"
              style={{ height: 48 }}
              disabled={loading || sendingOtp}
            >
              {loading
                ? 'PLEASE WAIT...'
                : mode === 'register'
                  ? (otpSent ? 'VERIFY OTP & REGISTER' : 'SEND OTP & REGISTER')
                  : 'SIGN IN NOW'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
