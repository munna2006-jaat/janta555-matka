import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { playClickSound, playSuccessSound } from '../utils/soundEffects';

interface WithdrawScreenProps {
  balance: number;
  token: string | null;
  onBack: () => void;
  onRefreshBalance: () => void;
  onNavigateBank: () => void;
}

export const WithdrawScreen: React.FC<WithdrawScreenProps> = ({
  balance,
  token,
  onBack,
  onRefreshBalance,
  onNavigateBank
}) => {
  const [withdrawAmount, setWithdrawAmount] = useState<number>(500);
  const [withdrawMode, setWithdrawMode] = useState<'UPI' | 'BANK'>('UPI');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const [config, setConfig] = useState<any>(null);
  const [userBankDetails, setUserBankDetails] = useState<any>(null);
  const [withdrawHistory, setWithdrawHistory] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/wallet/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) setConfig(data.config);
      })
      .catch(console.error);

    if (token) {
      // Fetch user profile / bank
      fetch('/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setUserBankDetails(data.user.bankDetails);
          }
        })
        .catch(console.error);

      fetchWithdrawHistory();
    }
  }, [token]);

  const fetchWithdrawHistory = () => {
    if (!token) return;
    fetch('/api/v1/wallet/withdraw-history', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setWithdrawHistory(data.history || []);
      })
      .catch(console.error);
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    if (!token) return;

    if (!withdrawAmount || withdrawAmount < (config?.min_withdrawal || 500)) {
      setWithdrawError(`Minimum withdrawal amount is ₹${config?.min_withdrawal || 500}`);
      return;
    }

    if (withdrawAmount > (config?.max_withdrawal || 50000)) {
      setWithdrawError(`Maximum withdrawal amount is ₹${config?.max_withdrawal || 50000}`);
      return;
    }

    if (withdrawAmount > balance) {
      setWithdrawError(`Insufficient wallet balance. You have ₹${balance.toFixed(2)}.`);
      return;
    }

    setWithdrawLoading(true);
    setWithdrawError(null);
    setWithdrawSuccess(null);

    try {
      const res = await fetch('/api/v1/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          payout_mode: withdrawMode
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Withdrawal failed');

      playSuccessSound();
      setWithdrawSuccess(`Withdrawal request of ₹${withdrawAmount} submitted! Funds reserved.`);
      onRefreshBalance();
      fetchWithdrawHistory();
    } catch (err: any) {
      setWithdrawError(err.message);
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <div className="funds-view-container" style={{ paddingBottom: 85 }}>
      {/* Header */}
      <div className="page-header-strip">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => { playClickSound(); onBack(); }}
            className="header-back-circle-btn"
            aria-label="Back"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <span style={{ fontSize: 17, fontWeight: 900, letterSpacing: 0.5 }}>WITHDRAW POINTS</span>
        </div>

        <div className="header-balance-pill">
          ₹{balance.toFixed(2)}
        </div>
      </div>

      <div style={{ padding: '16px 14px' }}>
        {withdrawSuccess && (
          <div style={{ background: '#DCFCE7', color: '#15803D', padding: '12px 14px', borderRadius: 12, fontSize: 13, fontWeight: 700, marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
            <CheckCircle2 size={18} />
            <span>{withdrawSuccess}</span>
          </div>
        )}

        {withdrawError && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '12px 14px', borderRadius: 12, fontSize: 13, fontWeight: 700, marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
            <AlertCircle size={18} />
            <span>{withdrawError}</span>
          </div>
        )}

        {/* Available Balance Card */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: 'white',
          borderRadius: 18,
          padding: '20px 18px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
          marginBottom: 16
        }}>
          <div style={{ fontSize: 11.5, opacity: 0.75, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            WITHDRAWABLE BALANCE
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, margin: '6px 0', letterSpacing: 0.5 }}>
            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 11.5, opacity: 0.8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⏰ Withdrawal Window:</span>
            <strong>{config?.withdrawal_start_time || '10:00 AM'} - {config?.withdrawal_end_time || '08:00 PM'}</strong>
          </div>
        </div>

        {/* Check Bank / UPI details configured */}
        {(!userBankDetails?.upi_id && !userBankDetails?.account_number) && (
          <div style={{
            background: '#FFFBEB',
            border: '1.5px solid #FDE68A',
            padding: '14px 16px',
            borderRadius: 14,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#92400E' }}>No Bank or UPI Added</div>
              <div style={{ fontSize: 11.5, color: '#B45309', marginTop: 2 }}>Please add your payout details to receive funds.</div>
            </div>
            <button
              type="button"
              onClick={() => { playClickSound(); onNavigateBank(); }}
              style={{
                background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '7px 14px',
                fontSize: 12,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
              }}
            >
              ADD DETAILS
            </button>
          </div>
        )}

        {/* Withdrawal Form */}
        <form onSubmit={handleWithdrawSubmit} style={{ background: 'white', borderRadius: 18, padding: '18px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
          <div style={{ marginBottom: 14 }}>
            <label className="input-label" style={{ fontSize: 13, fontWeight: 800, color: '#334155', display: 'block', marginBottom: 8 }}>
              Select Payout Mode:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                onClick={() => { playClickSound(); setWithdrawMode('UPI'); }}
                style={{
                  padding: '11px',
                  borderRadius: 10,
                  border: withdrawMode === 'UPI' ? '2px solid #0284C7' : '1px solid #CBD5E1',
                  background: withdrawMode === 'UPI' ? '#E0F2FE' : '#F8FAFC',
                  color: withdrawMode === 'UPI' ? '#0284C7' : '#475569',
                  fontWeight: 900,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                UPI Payout
              </button>
              <button
                type="button"
                onClick={() => { playClickSound(); setWithdrawMode('BANK'); }}
                style={{
                  padding: '11px',
                  borderRadius: 10,
                  border: withdrawMode === 'BANK' ? '2px solid #0284C7' : '1px solid #CBD5E1',
                  background: withdrawMode === 'BANK' ? '#E0F2FE' : '#F8FAFC',
                  color: withdrawMode === 'BANK' ? '#0284C7' : '#475569',
                  fontWeight: 900,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                Bank Transfer
              </button>
            </div>
          </div>

          {withdrawMode === 'UPI' ? (
            <div style={{ marginBottom: 14, fontSize: 12, background: '#F1F5F9', padding: '10px 12px', borderRadius: 10 }}>
              <strong style={{ color: '#0F172A' }}>Saved UPI ID:</strong> {userBankDetails?.upi_id || 'Not set (Go to Bank tab)'}
            </div>
          ) : (
            <div style={{ marginBottom: 14, fontSize: 12, background: '#F1F5F9', padding: '10px 12px', borderRadius: 10 }}>
              <strong style={{ color: '#0F172A' }}>Bank A/C:</strong> {userBankDetails?.account_number ? `****${userBankDetails.account_number.slice(-4)}` : 'Not set'} | <strong style={{ color: '#0F172A' }}>IFSC:</strong> {userBankDetails?.ifsc_code || 'Not set'}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label className="input-label" style={{ fontSize: 13, fontWeight: 800, color: '#334155', display: 'block', marginBottom: 6 }}>
              Withdrawal Amount (₹):
            </label>
            <input
              type="number"
              min={config?.min_withdrawal || 500}
              max={config?.max_withdrawal || 50000}
              className="input-field"
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(parseInt(e.target.value) || 0)}
              style={{ fontSize: 18, fontWeight: 900, padding: '10px 14px', borderRadius: 10, width: '100%', border: '1.5px solid #CBD5E1' }}
            />
            <span style={{ fontSize: 11, color: '#64748B', display: 'block', marginTop: 5, fontWeight: 600 }}>
              Min: ₹{config?.min_withdrawal || 500} | Max: ₹{config?.max_withdrawal || 50000}
            </span>

            {/* Quick Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {[500, 1000, 2000, 5000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => { playClickSound(); setWithdrawAmount(amt); }}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 10,
                    border: withdrawAmount === amt ? '2px solid #0284C7' : '1px solid #CBD5E1',
                    background: withdrawAmount === amt ? '#E0F2FE' : '#F8FAFC',
                    color: withdrawAmount === amt ? '#0284C7' : '#334155',
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={withdrawLoading || balance < (config?.min_withdrawal || 500)}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
              color: 'white',
              border: 'none',
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: 0.5,
              cursor: balance >= (config?.min_withdrawal || 500) ? 'pointer' : 'not-allowed',
              opacity: balance >= (config?.min_withdrawal || 500) ? 1 : 0.6,
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
            }}
          >
            {withdrawLoading ? 'Processing Request...' : `REQUEST WITHDRAWAL (₹${withdrawAmount})`}
          </button>
        </form>

        {/* Withdrawal History */}
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#0F172A', marginBottom: 10 }}>
            Recent Withdrawal Requests
          </div>

          {withdrawHistory.length === 0 ? (
            <div style={{ background: 'white', padding: 24, textAlign: 'center', borderRadius: 14, color: '#64748B', fontSize: 13, border: '1px solid #E2E8F0', fontWeight: 600 }}>
              No recent withdrawal requests found.
            </div>
          ) : (
            withdrawHistory.map(w => (
              <div key={w.id} style={{
                background: 'white',
                borderRadius: 14,
                padding: '12px 14px',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid #F1F5F9'
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#0F172A' }}>₹{w.amount} via {w.payout_mode}</div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                    {w.transaction_reference ? `Ref: ${w.transaction_reference}` : 'Pending processing'}
                  </div>
                  <div style={{ fontSize: 10.5, color: '#94A3B8' }}>{new Date(w.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 800,
                    background: w.status === 'APPROVED' ? '#DCFCE7' : w.status === 'REJECTED' ? '#FEE2E2' : '#FEF3C7',
                    color: w.status === 'APPROVED' ? '#15803D' : w.status === 'REJECTED' ? '#DC2626' : '#B45309'
                  }}>
                    {w.status === 'APPROVED' ? 'PAID' : w.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
