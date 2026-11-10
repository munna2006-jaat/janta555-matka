import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Copy, Check, AlertCircle, CheckCircle2, 
  Upload, Image as ImageIcon, Trash2, Camera, FileCheck 
} from 'lucide-react';
import { playClickSound, playSuccessSound } from '../utils/soundEffects';
import { trackInitiateCheckout, trackAddPaymentInfo, trackDepositPurchase } from '../utils/metaPixel';

interface AddPointsScreenProps {
  balance: number;
  token: string | null;
  onBack: () => void;
  onRefreshBalance: () => void;
}

export const AddPointsScreen: React.FC<AddPointsScreenProps> = ({
  balance,
  token,
  onBack,
  onRefreshBalance
}) => {
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [utrNumber, setUtrNumber] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState<string | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [depositHistory, setDepositHistory] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    trackInitiateCheckout(depositAmount);
    fetch('/api/v1/wallet/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) setConfig(data.config);
      })
      .catch(console.error);

    if (token) {
      fetchDepositHistory();
    }
  }, [token]);

  const fetchDepositHistory = () => {
    if (!token) return;
    fetch('/api/v1/wallet/deposit-history', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setDepositHistory(data.deposits || data.history || []);
      })
      .catch(console.error);
  };

  const copyUpiId = () => {
    playClickSound();
    trackAddPaymentInfo('UPI_COPY', depositAmount);
    const upi = config?.upi_id || 'goldmatkaofficial@upi';
    navigator.clipboard?.writeText(upi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setDepositError('Please select a valid image file (PNG, JPG, JPEG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setDepositError('Screenshot size should be less than 10MB.');
      return;
    }

    setReceiptFileName(file.name);
    setDepositError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setReceiptImage(compressedDataUrl);
        } else {
          setReceiptImage(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    playClickSound();
    setReceiptImage(null);
    setReceiptFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();
    if (!token) return;

    if (!depositAmount || depositAmount < (config?.min_deposit || 100)) {
      setDepositError(`Minimum deposit amount is ₹${config?.min_deposit || 100}`);
      return;
    }

    if (!utrNumber || utrNumber.length < 6) {
      setDepositError('Please enter a valid 12-digit UPI UTR number.');
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
          utr_number: utrNumber,
          receipt_url: receiptImage || null
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Deposit request failed');

      playSuccessSound();
      trackDepositPurchase(depositAmount, utrNumber);
      setDepositSuccess('Deposit request submitted! Points will be credited once verified.');
      setUtrNumber('');
      setReceiptImage(null);
      setReceiptFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onRefreshBalance();
      fetchDepositHistory();
    } catch (err: any) {
      setDepositError(err.message);
    } finally {
      setDepositLoading(false);
    }
  };

  const upiId = config?.upi_id || 'goldmatkaofficial@upi';
  const qrString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(config?.upi_name || 'GoldMatka')}&am=${depositAmount}&cu=INR`;
  const defaultQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrString)}`;
  const qrImgUrl = config?.qr_code_image || defaultQrUrl;

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
          <span style={{ fontSize: 17, fontWeight: 900, letterSpacing: 0.5 }}>ADD POINTS</span>
        </div>

        <div className="header-balance-pill">
          ₹{balance.toFixed(2)}
        </div>
      </div>

      <div style={{ padding: '16px 14px' }}>
        {depositSuccess && (
          <div style={{ background: '#DCFCE7', color: '#15803D', padding: '12px 14px', borderRadius: 12, fontSize: 13, fontWeight: 700, marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
            <CheckCircle2 size={18} />
            <span>{depositSuccess}</span>
          </div>
        )}

        {depositError && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '12px 14px', borderRadius: 12, fontSize: 13, fontWeight: 700, marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
            <AlertCircle size={18} />
            <span>{depositError}</span>
          </div>
        )}

        {/* Step 1: UPI QR Payment Box */}
        <div style={{ background: 'white', borderRadius: 18, padding: '20px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0', textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A', marginBottom: 6 }}>
            Scan QR & Pay with Any UPI App
          </div>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 14 }}>
            Google Pay • PhonePe • Paytm • BHIM • Amazon Pay
          </div>

          <div style={{ display: 'inline-block', padding: 10, background: '#F8FAFC', borderRadius: 14, border: '2px solid #E2E8F0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
            <img
              src={qrImgUrl}
              alt="Admin UPI QR Code"
              style={{ width: 190, height: 190, display: 'block', borderRadius: 10 }}
            />
          </div>

          {/* UPI ID Copy Box */}
          <div style={{ marginTop: 14, background: '#F1F5F9', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Official UPI ID</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#0F172A' }}>{upiId}</div>
            </div>
            <button
              type="button"
              onClick={copyUpiId}
              style={{
                background: copiedUpi ? '#10B981' : 'linear-gradient(135deg, #059669 0%, #0284C7 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)'
              }}
            >
              {copiedUpi ? <Check size={14} strokeWidth={3} /> : <Copy size={14} strokeWidth={2.5} />}
              <span>{copiedUpi ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>
        </div>

        {/* Step 2: Deposit Form */}
        <form onSubmit={handleDepositSubmit} style={{ background: 'white', borderRadius: 18, padding: '18px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
          <div style={{ marginBottom: 14 }}>
            <label className="input-label" style={{ fontSize: 13, fontWeight: 800, color: '#334155', display: 'block', marginBottom: 6 }}>
              Deposit Amount (₹):
            </label>
            <input
              type="number"
              min={config?.min_deposit || 100}
              max={config?.max_deposit || 100000}
              className="input-field"
              value={depositAmount}
              onChange={e => setDepositAmount(parseInt(e.target.value) || 0)}
              style={{ fontSize: 18, fontWeight: 900, padding: '10px 14px', borderRadius: 10, width: '100%', border: '1.5px solid #CBD5E1' }}
            />

            {/* Quick Amount Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {[100, 500, 1000, 2000, 5000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => { playClickSound(); setDepositAmount(amt); }}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 10,
                    border: depositAmount === amt ? '2px solid #0284C7' : '1px solid #CBD5E1',
                    background: depositAmount === amt ? '#E0F2FE' : '#F8FAFC',
                    color: depositAmount === amt ? '#0284C7' : '#334155',
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label className="input-label" style={{ fontSize: 13, fontWeight: 800, color: '#334155', display: 'block', marginBottom: 6 }}>
              12-Digit UPI UTR / Transaction ID:
            </label>
            <input
              type="text"
              maxLength={20}
              placeholder="e.g. 429812984123"
              className="input-field"
              value={utrNumber}
              onChange={e => setUtrNumber(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
              required
              style={{ fontSize: 15, fontWeight: 700, padding: '10px 14px', borderRadius: 10, width: '100%', border: '1.5px solid #CBD5E1' }}
            />
            <span style={{ fontSize: 11, color: '#64748B', display: 'block', marginTop: 5, fontWeight: 500 }}>
              Enter the 12-digit reference number from your payment receipt screenshot.
            </span>
          </div>

          {/* Payment Screenshot (SS) Upload Box */}
          <div style={{ marginBottom: 20 }}>
            <label className="input-label" style={{ fontSize: 13, fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span>Upload Payment Screenshot (SS):</span>
              <span style={{ fontSize: 11, color: '#0284C7', fontWeight: 700 }}>Recommended for Instant Verification</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />

            {!receiptImage ? (
              <div
                onClick={() => { playClickSound(); fileInputRef.current?.click(); }}
                style={{
                  border: '2px dashed #93C5FD',
                  borderRadius: 14,
                  padding: '16px 14px',
                  textAlign: 'center',
                  background: '#F0F9FF',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s'
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#E0F2FE',
                  color: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px'
                }}>
                  <Upload size={22} strokeWidth={2.4} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0369A1' }}>
                  Tap to Upload Payment Screenshot (SS)
                </div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>
                  Clear screenshot of GooglePay, PhonePe, Paytm, or UPI receipt
                </div>
              </div>
            ) : (
              <div style={{
                background: '#F8FAFC',
                border: '1.5px solid #10B981',
                borderRadius: 14,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                  <img
                    src={receiptImage}
                    alt="Receipt Preview"
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 8,
                      objectFit: 'cover',
                      border: '1px solid #CBD5E1',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#15803D', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FileCheck size={14} /> Screenshot Attached
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                      {receiptFileName || 'payment_screenshot.jpg'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => { playClickSound(); fileInputRef.current?.click(); }}
                    style={{
                      background: '#E0F2FE',
                      color: '#0284C7',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 10px',
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      background: '#FEE2E2',
                      color: '#DC2626',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={depositLoading}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #059669 0%, #0284C7 100%)',
              color: 'white',
              border: 'none',
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: 0.5,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)'
            }}
          >
            {depositLoading ? 'Submitting...' : 'SUBMIT DEPOSIT REQUEST'}
          </button>
        </form>

        {/* Deposit Requests History */}
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#0F172A', marginBottom: 10 }}>
            Recent Deposit Requests
          </div>

          {depositHistory.length === 0 ? (
            <div style={{ background: 'white', padding: 24, textAlign: 'center', borderRadius: 14, color: '#64748B', fontSize: 13, border: '1px solid #E2E8F0', fontWeight: 600 }}>
              No recent deposit requests found.
            </div>
          ) : (
            depositHistory.map(d => (
              <div key={d.id} style={{
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
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#0F172A' }}>₹{d.amount}</div>
                  <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>UTR: {d.utr_number}</div>
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
    </div>
  );
};
