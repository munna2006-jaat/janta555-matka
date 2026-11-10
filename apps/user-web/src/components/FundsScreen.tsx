import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Copy, Check, QrCode, AlertCircle, 
  ArrowDownLeft, ArrowUpRight, Clock, CheckCircle2, XCircle 
} from 'lucide-react';

interface FundsScreenProps {
  balance: number;
  token: string | null;
  onBack: () => void;
  onRefreshBalance: () => void;
  onNavigateBank: () => void;
}

export const FundsScreen: React.FC<FundsScreenProps> = ({
  balance,
  token,
  onBack,
  onRefreshBalance,
  onNavigateBank
}) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'passbook'>('deposit');
  
  // Deposit state
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [utrNumber, setUtrNumber] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState<string | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState<number>(500);
  const [withdrawMode, setWithdrawMode] = useState<'UPI' | 'BANK'>('UPI');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Data
  const [config, setConfig] = useState<any>(null);
  const [userBankDetails, setUserBankDetails] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [depositHistory, setDepositHistory] = useState<any[]>([]);
  const [withdrawHistory, setWithdrawHistory] = useState<any[]>([]);

  // Fetch Payment Config
  useEffect(() => {
    fetch('/api/v1/wallet/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) setConfig(data.config);
      })
      .catch(console.error);

    if (token) {
      // Fetch user profile/bank
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

      // Fetch histories
      fetchTransactions();
      fetchDepositHistory();
      fetchWithdrawHistory();
    }
  }, [token]);

  const fetchTransactions = () => {
    if (!token) return;
    fetch('/api/v1/wallet/transactions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { if (data.success) setTransactions(data.transactions); });
  };

  const fetchDepositHistory = () => {
    if (!token) return;
    fetch('/api/v1/wallet/deposit-history', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { if (data.success) setDepositHistory(data.deposits); });
  };

  const fetchWithdrawHistory = () => {
    if (!token) return;
    fetch('/api/v1/wallet/withdrawal-history', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { if (data.success) setWithdrawHistory(data.withdrawals); });
  };

  const copyUpiId = () => {
    if (!config?.upi_id) return;
    navigator.clipboard.writeText(config.upi_id);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!utrNumber || utrNumber.trim().length < 8) {
      setDepositError('Please enter a valid 12-digit UPI UTR / Transaction ID.');
      return;
    }

    setDepositLoading(true);
    setDepositError(null);
    setDepositSuccess(null);

    try {
      const res = await fetch('/api/v1/wallet/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: depositAmount,
          utr_number: utrNumber.trim()
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Deposit failed');

      setDepositSuccess('Deposit request submitted! Admin will verify UTR and credit your wallet.');
      setUtrNumber('');
      fetchDepositHistory();
    } catch (err: any) {
      setDepositError(err.message);
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (withdrawAmount > balance) {
      setWithdrawError(`Insufficient wallet balance. You have ₹${balance}.`);
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

      setWithdrawSuccess(`Withdrawal of ₹${withdrawAmount} submitted! Funds reserved.`);
      onRefreshBalance();
      fetchWithdrawHistory();
    } catch (err: any) {
      setWithdrawError(err.message);
    } finally {
      setWithdrawLoading(false);
    }
  };

  const upiId = config?.upi_id || 'goldmatkaofficial@upi';
  const qrString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(config?.upi_name || 'GoldMatka')}&am=${depositAmount}&cu=INR`;
  const defaultQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrString)}`;
  const qrImgUrl = config?.qr_code_image || defaultQrUrl;

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        background: 'var(--primary)',
        color: 'white',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 45
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
          <span style={{ fontSize: 17, fontWeight: 900 }}>WALLET & FUNDS</span>
        </div>

        <div style={{
          background: 'white',
          color: '#0F172A',
          padding: '4px 12px',
          borderRadius: 9999,
          fontSize: 14,
          fontWeight: 800
        }}>
          ₹{balance.toFixed(2)}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        background: 'white',
        borderBottom: '1px solid #E2E8F0',
        padding: '4px 8px'
      }}>
        <button
          onClick={() => setActiveTab('deposit')}
          style={{
            padding: '10px 4px',
            border: 'none',
            background: 'none',
            fontSize: 13,
            fontWeight: 800,
            color: activeTab === 'deposit' ? 'var(--primary)' : '#64748B',
            borderBottom: activeTab === 'deposit' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer'
          }}
        >
          Add Cash
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          style={{
            padding: '10px 4px',
            border: 'none',
            background: 'none',
            fontSize: 13,
            fontWeight: 800,
            color: activeTab === 'withdraw' ? 'var(--primary)' : '#64748B',
            borderBottom: activeTab === 'withdraw' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer'
          }}
        >
          Withdraw
        </button>
        <button
          onClick={() => setActiveTab('passbook')}
          style={{
            padding: '10px 4px',
            border: 'none',
            background: 'none',
            fontSize: 13,
            fontWeight: 800,
            color: activeTab === 'passbook' ? 'var(--primary)' : '#64748B',
            borderBottom: activeTab === 'passbook' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer'
          }}
        >
          Passbook
        </button>
      </div>

      {/* Tab 1: DEPOSIT */}
      {activeTab === 'deposit' && (
        <div style={{ padding: '16px 14px' }}>
          {depositSuccess && (
            <div style={{ background: '#DCFCE7', color: '#15803D', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 14, display: 'flex', gap: 8 }}>
              <CheckCircle2 size={18} />
              <span>{depositSuccess}</span>
            </div>
          )}

          {depositError && (
            <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 14, display: 'flex', gap: 8 }}>
              <AlertCircle size={18} />
              <span>{depositError}</span>
            </div>
          )}

          {/* Step 1: UPI QR Payment Box */}
          <div style={{ background: 'white', borderRadius: 16, padding: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid #E2E8F0', textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
              Scan QR & Pay with Any UPI App
            </div>

            <div style={{ display: 'inline-block', padding: 8, background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <img
                src={qrImgUrl}
                alt="Admin UPI QR Code"
                style={{ width: 180, height: 180, display: 'block', borderRadius: 8 }}
              />
            </div>

            {/* UPI ID Copy Box */}
            <div style={{ marginTop: 12, background: '#F1F5F9', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>UPI ID:</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>{upiId}</div>
              </div>
              <button
                type="button"
                onClick={copyUpiId}
                style={{
                  background: copiedUpi ? '#10B981' : 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer'
                }}
              >
                {copiedUpi ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedUpi ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>

          {/* Step 2: Deposit Form */}
          <form onSubmit={handleDepositSubmit} style={{ background: 'white', borderRadius: 16, padding: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid #E2E8F0' }}>
            <div style={{ marginBottom: 14 }}>
              <span className="input-label">Deposit Amount (₹):</span>
              <input
                type="number"
                min={config?.min_deposit || 100}
                max={config?.max_deposit || 100000}
                className="input-field"
                value={depositAmount}
                onChange={e => setDepositAmount(parseInt(e.target.value) || 0)}
                style={{ fontSize: 18, fontWeight: 800 }}
              />

              {/* Quick Amount Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {[500, 1000, 2000, 5000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: depositAmount === amt ? '1.5px solid var(--primary)' : '1px solid #E2E8F0',
                      background: depositAmount === amt ? 'var(--primary-soft)' : '#F8FAFC',
                      color: depositAmount === amt ? 'var(--primary)' : '#334155',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <span className="input-label">12-Digit UPI UTR / Transaction ID:</span>
              <input
                type="text"
                maxLength={20}
                placeholder="e.g. 429812984123"
                className="input-field"
                value={utrNumber}
                onChange={e => setUtrNumber(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                required
              />
              <span style={{ fontSize: 11, color: '#64748B', display: 'block', marginTop: 4 }}>
                Enter the reference number from your Google Pay / PhonePe / Paytm receipt.
              </span>
            </div>

            <button type="submit" className="btn-primary" disabled={depositLoading}>
              {depositLoading ? 'Submitting...' : 'SUBMIT DEPOSIT REQUEST'}
            </button>
          </form>

          {/* Deposit Requests History */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>
              Recent Deposit Requests
            </div>

            {depositHistory.length === 0 ? (
              <div style={{ background: 'white', padding: 20, textAlign: 'center', borderRadius: 12, color: '#64748B', fontSize: 13 }}>
                No recent deposit requests found.
              </div>
            ) : (
              depositHistory.map(d => (
                <div key={d.id} style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: '12px 14px',
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#0F172A' }}>₹{d.amount}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>UTR: {d.utr_number}</div>
                    <div style={{ fontSize: 10.5, color: '#94A3B8' }}>{new Date(d.created_at).toLocaleString()}</div>
                  </div>
                  <div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 9999,
                      fontSize: 11,
                      fontWeight: 800,
                      background: d.status === 'APPROVED' ? '#DCFCE7' : d.status === 'REJECTED' ? '#FEE2E2' : '#FEF3C7',
                      color: d.status === 'APPROVED' ? '#15803D' : d.status === 'REJECTED' ? '#DC2626' : '#B45309'
                    }}>
                      {d.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: WITHDRAW */}
      {activeTab === 'withdraw' && (
        <div style={{ padding: '16px 14px' }}>
          {withdrawSuccess && (
            <div style={{ background: '#DCFCE7', color: '#15803D', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 14, display: 'flex', gap: 8 }}>
              <CheckCircle2 size={18} />
              <span>{withdrawSuccess}</span>
            </div>
          )}

          {withdrawError && (
            <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 14, display: 'flex', gap: 8 }}>
              <AlertCircle size={18} />
              <span>{withdrawError}</span>
            </div>
          )}

          {/* Withdrawable Balance Card */}
          <div style={{
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            color: 'white',
            borderRadius: 16,
            padding: '18px 16px',
            boxShadow: 'var(--shadow-md)',
            marginBottom: 16
          }}>
            <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 600 }}>AVAILABLE BALANCE</div>
            <div style={{ fontSize: 28, fontWeight: 900, margin: '6px 0' }}>₹{balance.toFixed(2)}</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>
              Withdrawal Window: {config?.withdrawal_start_time || '10:00 AM'} - {config?.withdrawal_end_time || '08:00 PM'}
            </div>
          </div>

          {/* Check Bank / UPI details configured */}
          {(!userBankDetails?.upi_id && !userBankDetails?.account_number) && (
            <div style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              padding: '12px 14px',
              borderRadius: 12,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#92400E' }}>No Bank or UPI Added</div>
                <div style={{ fontSize: 11, color: '#B45309' }}>Please add your payout details first.</div>
              </div>
              <button
                type="button"
                onClick={onNavigateBank}
                style={{
                  background: '#F59E0B',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                ADD DETAILS
              </button>
            </div>
          )}

          {/* Withdrawal Form */}
          <form onSubmit={handleWithdrawSubmit} style={{ background: 'white', borderRadius: 16, padding: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid #E2E8F0' }}>
            <div style={{ marginBottom: 14 }}>
              <span className="input-label">Select Payout Mode:</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setWithdrawMode('UPI')}
                  style={{
                    padding: '10px',
                    borderRadius: 10,
                    border: withdrawMode === 'UPI' ? '2px solid var(--primary)' : '1px solid #CBD5E1',
                    background: withdrawMode === 'UPI' ? 'var(--primary-soft)' : '#F8FAFC',
                    color: withdrawMode === 'UPI' ? 'var(--primary)' : '#475569',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  UPI Payout
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawMode('BANK')}
                  style={{
                    padding: '10px',
                    borderRadius: 10,
                    border: withdrawMode === 'BANK' ? '2px solid var(--primary)' : '1px solid #CBD5E1',
                    background: withdrawMode === 'BANK' ? 'var(--primary-soft)' : '#F8FAFC',
                    color: withdrawMode === 'BANK' ? 'var(--primary)' : '#475569',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Bank Transfer
                </button>
              </div>
            </div>

            {withdrawMode === 'UPI' ? (
              <div style={{ marginBottom: 14, fontSize: 12, background: '#F1F5F9', padding: '10px 12px', borderRadius: 10 }}>
                <strong>Saved UPI ID:</strong> {userBankDetails?.upi_id || 'Not set (Go to Bank tab)'}
              </div>
            ) : (
              <div style={{ marginBottom: 14, fontSize: 12, background: '#F1F5F9', padding: '10px 12px', borderRadius: 10 }}>
                <strong>Bank A/C:</strong> {userBankDetails?.account_number ? `****${userBankDetails.account_number.slice(-4)}` : 'Not set'} | <strong>IFSC:</strong> {userBankDetails?.ifsc_code || 'Not set'}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <span className="input-label">Withdrawal Amount (₹):</span>
              <input
                type="number"
                min={config?.min_withdrawal || 500}
                max={config?.max_withdrawal || 50000}
                className="input-field"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(parseInt(e.target.value) || 0)}
                style={{ fontSize: 18, fontWeight: 800 }}
              />
              <span style={{ fontSize: 11, color: '#64748B', display: 'block', marginTop: 4 }}>
                Min: ₹{config?.min_withdrawal || 500} | Max: ₹{config?.max_withdrawal || 50000}
              </span>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={withdrawLoading || balance < (config?.min_withdrawal || 500)}
            >
              {withdrawLoading ? 'Processing Request...' : `REQUEST WITHDRAWAL (₹${withdrawAmount})`}
            </button>
          </form>

          {/* Withdrawal History */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>
              Recent Withdrawal Requests
            </div>

            {withdrawHistory.length === 0 ? (
              <div style={{ background: 'white', padding: 20, textAlign: 'center', borderRadius: 12, color: '#64748B', fontSize: 13 }}>
                No recent withdrawal requests found.
              </div>
            ) : (
              withdrawHistory.map(w => (
                <div key={w.id} style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: '12px 14px',
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#0F172A' }}>₹{w.amount} via {w.payout_mode}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>
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
      )}

      {/* Tab 3: PASSBOOK / TRANSACTIONS */}
      {activeTab === 'passbook' && (
        <div style={{ padding: '16px 14px' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>
            Financial Ledger & Passbook
          </div>

          {transactions.length === 0 ? (
            <div style={{ background: 'white', padding: 24, textAlign: 'center', borderRadius: 12, color: '#64748B', fontSize: 13 }}>
              No transactions recorded yet.
            </div>
          ) : (
            transactions.map(tx => {
              const isCredit = tx.amount > 0;
              return (
                <div key={tx.id} style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: '12px 14px',
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                  borderLeft: isCredit ? '4px solid #10B981' : '4px solid #EF4444'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: isCredit ? '#DCFCE7' : '#FEE2E2',
                      color: isCredit ? '#15803D' : '#DC2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isCredit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{tx.type}</div>
                      <div style={{ fontSize: 11, color: '#64748B', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {tx.description}
                      </div>
                      <div style={{ fontSize: 10, color: '#94A3B8' }}>{new Date(tx.created_at).toLocaleString()}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: 15,
                      fontWeight: 900,
                      color: isCredit ? '#10B981' : '#EF4444'
                    }}>
                      {isCredit ? `+₹${tx.amount.toFixed(2)}` : `-₹${Math.abs(tx.amount).toFixed(2)}`}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>
                      Bal: ₹{tx.new_balance.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
