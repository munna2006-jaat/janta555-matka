import React, { useState } from 'react';
import { 
  CreditCard, User, Phone, Calendar, Key, Eye, EyeOff, 
  CheckCircle2, AlertCircle, ArrowLeft 
} from 'lucide-react';

interface ProfileScreenProps {
  user: {
    id: number;
    name: string;
    phone: string;
    wallet_balance: number;
    created_at?: string;
  } | null;
  token: string | null;
  onBack: () => void;
  onRequireLogin: () => void;
  onNavigateFunds: () => void;
  onNavigateBank: () => void;
  onLogout: () => void;
  onRefreshUser: () => void;
}

// Format registration timestamp into "hh:mm A on DD MMM, YYYY"
function formatRegisteredDate(dateStr?: string): string {
  if (!dateStr) return '02:09 PM on 26 Oct, 2026';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '02:09 PM on 26 Oct, 2026';
    
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const hh = String(hours).padStart(2, '0');

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dd = d.getDate();
    const mmm = months[d.getMonth()];
    const yyyy = d.getFullYear();

    return `${hh}:${minutes} ${ampm} on ${dd} ${mmm}, ${yyyy}`;
  } catch {
    return '02:09 PM on 26 Oct, 2026';
  }
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  token,
  onBack,
  onRequireLogin,
  onLogout,
  onRefreshUser
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!user || !token) {
    return (
      <div className="profile-container-view">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              background: '#0F172A',
              border: '1.5px solid #F59E0B',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#F59E0B'
            }}
            aria-label="Back"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div className="section-title-bar" style={{ marginBottom: 0, flex: 1 }}>
            <div className="section-pink-indicator"></div>
            <h2 className="section-title-text">MY PROFILE</h2>
          </div>
        </div>
        <div className="profile-white-card" style={{ textAlign: 'center', padding: '36px 20px' }}>
          <div className="profile-circle-icon" style={{ margin: '0 auto 16px auto', width: 60, height: 60 }}>
            <User size={30} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>Guest Account</h3>
          <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>
            Please login or register to view your profile details and manage your account.
          </p>
          <button
            type="button"
            className="auth-submit-btn"
            onClick={onRequireLogin}
          >
            LOGIN / REGISTER
          </button>
        </div>
      </div>
    );
  }

  // Handle Save Profile (Updating 4-digit password)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!newPassword.trim()) {
      setErrorMsg('Please enter a new 4-digit password to update.');
      return;
    }

    if (newPassword.trim().length < 4) {
      setErrorMsg('Password must be at least 4 digits.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/save-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPassword.trim() })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to update profile');

      setSuccessMsg('Profile updated successfully!');
      setNewPassword('');
      onRefreshUser();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const userIdFormatted = `GR${1980 + user.id}`;
  const registeredDateFormatted = formatRegisteredDate(user.created_at);

  return (
    <div className="profile-container-view">
      {/* Messages */}
      {successMsg && (
        <div className="profile-alert alert-success">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="profile-alert alert-error">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: MY PROFILE matching Image 2 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: '#0F172A',
            border: '1.5px solid #F59E0B',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#F59E0B'
          }}
          aria-label="Back"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
        <div className="section-title-bar" style={{ marginBottom: 0, flex: 1 }}>
          <div className="section-pink-indicator"></div>
          <h2 className="section-title-text">MY PROFILE</h2>
        </div>
      </div>

      <div className="profile-white-card">
        {/* Row 1: USER ID */}
        <div className="profile-info-row">
          <div className="profile-circle-icon">
            <CreditCard size={18} />
          </div>
          <div className="profile-info-content">
            <span className="profile-info-label">USER ID</span>
            <span className="profile-info-val">{userIdFormatted}</span>
          </div>
        </div>

        <div className="profile-divider"></div>

        {/* Row 2: FULL NAME */}
        <div className="profile-info-row">
          <div className="profile-circle-icon">
            <User size={18} />
          </div>
          <div className="profile-info-content">
            <span className="profile-info-label">FULL NAME</span>
            <span className="profile-info-val">{user.name || 'Himanshu Chaudhary'}</span>
          </div>
        </div>

        <div className="profile-divider"></div>

        {/* Row 3: MOBILE NUMBER */}
        <div className="profile-info-row">
          <div className="profile-circle-icon">
            <Phone size={18} />
          </div>
          <div className="profile-info-content">
            <span className="profile-info-label">MOBILE NUMBER</span>
            <span className="profile-info-val">+91 {user.phone}</span>
          </div>
        </div>

        <div className="profile-divider"></div>

        {/* Row 4: REGISTERED ON */}
        <div className="profile-info-row">
          <div className="profile-circle-icon">
            <Calendar size={18} />
          </div>
          <div className="profile-info-content">
            <span className="profile-info-label">REGISTERED ON</span>
            <span className="profile-info-val">{registeredDateFormatted}</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: UPDATE PROFILE matching Image 2 */}
      <div className="section-title-bar" style={{ marginTop: 22 }}>
        <div className="section-pink-indicator"></div>
        <h2 className="section-title-text">UPDATE PROFILE</h2>
      </div>

      <div className="profile-white-card">
        <form onSubmit={handleSaveProfile}>
          {/* Readonly Mobile Number */}
          <div className="profile-field-block">
            <label className="profile-field-label">MOBILE NUMBER</label>
            <div className="profile-input-box box-readonly">
              <div className="profile-circle-icon-small">
                <Phone size={16} />
              </div>
              <span className="profile-readonly-text">{user.phone}</span>
            </div>
          </div>

          {/* Password (4 Digit) */}
          <div className="profile-field-block" style={{ marginTop: 14 }}>
            <label className="profile-field-label">PASSWORD (4 DIGIT)</label>
            <div className="profile-input-box box-editable">
              <div className="profile-circle-icon-small">
                <Key size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                maxLength={6}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••"
                className="profile-password-input"
              />
              <button
                type="button"
                className="profile-eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password view"
              >
                {showPassword ? <EyeOff size={20} color="#0F172A" /> : <Eye size={20} color="#0F172A" />}
              </button>
            </div>
          </div>

          {/* Buttons: SAVE PROFILE & LOGOUT matching Image 2 */}
          <div className="profile-action-btn-row">
            <button
              type="submit"
              className="btn-save-profile"
              disabled={loading}
            >
              {loading ? 'SAVING...' : 'SAVE PROFILE'}
            </button>

            <button
              type="button"
              className="btn-logout-profile"
              onClick={() => {
                if (confirm('Are you sure you want to logout?')) {
                  onLogout();
                }
              }}
            >
              LOGOUT
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
