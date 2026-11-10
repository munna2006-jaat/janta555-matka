import React, { useState, useEffect } from 'react';
import { ArrowLeft, Landmark, CheckCircle, AlertCircle } from 'lucide-react';

interface BankDetailsScreenProps {
  token: string | null;
  onBack: () => void;
  onRequireLogin: () => void;
}

export const BankDetailsScreen: React.FC<BankDetailsScreenProps> = ({
  token,
  onBack,
  onRequireLogin
}) => {
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch('/api/v1/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user?.bankDetails) {
          const b = data.user.bankDetails;
          setAccountHolder(b.account_holder || '');
          setAccountNumber(b.account_number || '');
          setIfscCode(b.ifsc_code || '');
          setBankName(b.bank_name || '');
          setUpiId(b.upi_id || '');
        }
      })
      .catch(console.error);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      onRequireLogin();
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/v1/auth/bank-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          account_holder: accountHolder.trim(),
          account_number: accountNumber.trim(),
          ifsc_code: ifscCode.trim().toUpperCase(),
          bank_name: bankName.trim(),
          upi_id: upiId.trim()
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to update details');

      setMessage('Bank and UPI details saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        background: 'var(--primary)',
        color: 'white',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        position: 'sticky',
        top: 0,
        zIndex: 45
      }}>
        <button
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
        <span style={{ fontSize: 17, fontWeight: 900 }}>BANK & UPI DETAILS</span>
      </div>

      <div style={{ padding: '16px 14px' }}>
        {message && (
          <div style={{ background: '#DCFCE7', color: '#15803D', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 14, display: 'flex', gap: 8 }}>
            <CheckCircle size={18} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 14, display: 'flex', gap: 8 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 16, padding: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Landmark size={18} />
            <span>Direct Bank Account Details</span>
          </div>

          <div style={{ marginBottom: 12 }}>
            <span className="input-label">Account Holder Name:</span>
            <input
              type="text"
              placeholder="Full name as in bank passbook"
              className="input-field"
              value={accountHolder}
              onChange={e => setAccountHolder(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <span className="input-label">Bank Account Number:</span>
            <input
              type="text"
              placeholder="e.g. 50100234567890"
              className="input-field"
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <span className="input-label">Bank IFSC Code:</span>
            <input
              type="text"
              placeholder="e.g. HDFC0001234"
              className="input-field"
              value={ifscCode}
              onChange={e => setIfscCode(e.target.value.toUpperCase())}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <span className="input-label">Bank Name:</span>
            <input
              type="text"
              placeholder="e.g. State Bank of India, HDFC Bank"
              className="input-field"
              value={bankName}
              onChange={e => setBankName(e.target.value)}
            />
          </div>

          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 14, marginTop: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)', marginBottom: 14 }}>
              UPI ID for Instant Withdrawal
            </div>
            <div style={{ marginBottom: 16 }}>
              <span className="input-label">Your UPI ID (VPA):</span>
              <input
                type="text"
                placeholder="e.g. 9876543210@paytm, user@okaxis"
                className="input-field"
                value={upiId}
                onChange={e => setUpiId(e.target.value.trim().toLowerCase())}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving Details...' : 'SAVE DETAILS'}
          </button>
        </form>
      </div>
    </div>
  );
};
