import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MarketItem } from './MarketCard';
import { GameCategory } from './CategorySelection';
import { generateSPMotor, generateDPMotor } from '../utils/matkaUtils';

interface BetPlacementModalProps {
  market: MarketItem;
  category: GameCategory;
  userBalance: number;
  token: string | null;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
  onRequireLogin: () => void;
}

export const BetPlacementModal: React.FC<BetPlacementModalProps> = ({
  market,
  category,
  userBalance,
  token,
  onClose,
  onSuccess,
  onRequireLogin
}) => {
  // Session selection: 'OPEN' or 'CLOSE' or 'FULL'
  const isJodi = category.id === 'jodi_digit';
  const isSangam = category.id === 'half_sangam' || category.id === 'full_sangam';
  
  const defaultSession = isJodi || isSangam ? 'FULL' : (market.canPlayOpen ? 'OPEN' : 'CLOSE');
  const [session, setSession] = useState<'OPEN' | 'CLOSE' | 'FULL'>(defaultSession);

  // Bet inputs
  const [betNumber, setBetNumber] = useState('');
  const [amount, setAmount] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Motor digits selection
  const [motorDigits, setMotorDigits] = useState<string[]>([]);

  // Sangam inputs
  const [sangamPanna, setSangamPanna] = useState('');
  const [sangamAnk, setSangamAnk] = useState('');
  const [sangamClosePanna, setSangamClosePanna] = useState('');

  // Quick Amount chips
  const quickAmounts = [10, 50, 100, 200, 500, 1000, 2000, 5000];

  // Calculate items and total amount
  let itemsToPlace: { number: string; amount: number }[] = [];

  if (category.id === 'sp_motor') {
    const generated = generateSPMotor(motorDigits);
    itemsToPlace = generated.map(num => ({ number: num, amount }));
  } else if (category.id === 'dp_motor') {
    const generated = generateDPMotor(motorDigits);
    itemsToPlace = generated.map(num => ({ number: num, amount }));
  } else if (category.id === 'half_sangam') {
    if (sangamPanna && sangamAnk) {
      itemsToPlace = [{ number: `${sangamPanna}/${sangamAnk}`, amount }];
    }
  } else if (category.id === 'full_sangam') {
    if (sangamPanna && sangamClosePanna) {
      itemsToPlace = [{ number: `${sangamPanna}/${sangamClosePanna}`, amount }];
    }
  } else if (betNumber) {
    itemsToPlace = [{ number: betNumber, amount }];
  }

  const totalPoints = itemsToPlace.length * amount;
  const potentialWin = Math.round(amount * category.payoutRate * 100) / 100;

  const handleMotorDigitToggle = (d: string) => {
    if (motorDigits.includes(d)) {
      setMotorDigits(motorDigits.filter(x => x !== d));
    } else {
      setMotorDigits([...motorDigits, d]);
    }
  };

  const handleSubmit = async () => {
    if (!token) {
      onRequireLogin();
      return;
    }

    if (itemsToPlace.length === 0) {
      setError('Please enter or select a valid bet number.');
      return;
    }

    if (totalPoints > userBalance) {
      setError(`Insufficient wallet balance. Total required: ₹${totalPoints}, Available: ₹${userBalance}.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/bets/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          marketId: market.id,
          gameType: category.id,
          session,
          bets: itemsToPlace
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to place bet.');
      }

      // Fire celebratory confetti!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      onSuccess(data.newBalance);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error occurred while placing bet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
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
            <div>
              <div className="modal-title">{market.name}</div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>{category.name} • Rate: 1:{category.payoutRate}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{
              background: '#FEE2E2',
              color: '#DC2626',
              padding: '10px 14px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 14
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Session Selector (for Open / Close games) */}
          {!isJodi && !isSangam && (
            <div style={{ marginBottom: 16 }}>
              <span className="input-label">Select Session:</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button
                  type="button"
                  disabled={!market.canPlayOpen}
                  onClick={() => setSession('OPEN')}
                  style={{
                    padding: '10px',
                    borderRadius: 10,
                    border: session === 'OPEN' ? '2px solid var(--primary)' : '1px solid #CBD5E1',
                    background: session === 'OPEN' ? 'var(--primary-soft)' : '#F8FAFC',
                    color: session === 'OPEN' ? 'var(--primary)' : '#475569',
                    fontWeight: 800,
                    cursor: market.canPlayOpen ? 'pointer' : 'not-allowed',
                    opacity: market.canPlayOpen ? 1 : 0.4
                  }}
                >
                  OPEN {market.canPlayOpen ? '' : '(CLOSED)'}
                </button>

                <button
                  type="button"
                  disabled={!market.canPlayClose}
                  onClick={() => setSession('CLOSE')}
                  style={{
                    padding: '10px',
                    borderRadius: 10,
                    border: session === 'CLOSE' ? '2px solid var(--primary)' : '1px solid #CBD5E1',
                    background: session === 'CLOSE' ? 'var(--primary-soft)' : '#F8FAFC',
                    color: session === 'CLOSE' ? 'var(--primary)' : '#475569',
                    fontWeight: 800,
                    cursor: market.canPlayClose ? 'pointer' : 'not-allowed',
                    opacity: market.canPlayClose ? 1 : 0.4
                  }}
                >
                  CLOSE {market.canPlayClose ? '' : '(CLOSED)'}
                </button>
              </div>
            </div>
          )}

          {/* Number Selector for Single Digit (0-9 interactive keypad) */}
          {category.id === 'single_digit' && (
            <div style={{ marginBottom: 16 }}>
              <span className="input-label">Choose Digit (0 - 9):</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setBetNumber(d)}
                    style={{
                      height: 48,
                      borderRadius: 12,
                      border: betNumber === d ? '2px solid var(--primary)' : '1.5px solid #E2E8F0',
                      background: betNumber === d ? 'var(--primary)' : 'white',
                      color: betNumber === d ? 'white' : '#0F172A',
                      fontSize: 18,
                      fontWeight: 900,
                      cursor: 'pointer',
                      boxShadow: betNumber === d ? '0 4px 10px rgba(243, 38, 91, 0.3)' : 'none'
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Jodi Digit Input */}
          {category.id === 'jodi_digit' && (
            <div style={{ marginBottom: 16 }}>
              <span className="input-label">Enter Jodi Number (00 to 99):</span>
              <input
                type="text"
                maxLength={2}
                placeholder="e.g. 46"
                className="input-field"
                value={betNumber}
                onChange={e => setBetNumber(e.target.value.replace(/[^0-9]/g, ''))}
                style={{ textAlign: 'center', fontSize: 24, letterSpacing: 4, fontWeight: 900 }}
              />
            </div>
          )}

          {/* Single / Double / Triple Panna Input */}
          {(category.id === 'single_panna' || category.id === 'double_panna' || category.id === 'triple_panna') && (
            <div style={{ marginBottom: 16 }}>
              <span className="input-label">Enter 3-Digit Pana:</span>
              <input
                type="text"
                maxLength={3}
                placeholder="e.g. 137"
                className="input-field"
                value={betNumber}
                onChange={e => setBetNumber(e.target.value.replace(/[^0-9]/g, ''))}
                style={{ textAlign: 'center', fontSize: 24, letterSpacing: 4, fontWeight: 900 }}
              />
            </div>
          )}

          {/* SP & DP Motor Digit Selector */}
          {(category.id === 'sp_motor' || category.id === 'dp_motor') && (
            <div style={{ marginBottom: 16 }}>
              <span className="input-label">Select Motor Digits (At least {category.id === 'sp_motor' ? 3 : 2} digits):</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleMotorDigitToggle(d)}
                    style={{
                      height: 44,
                      borderRadius: 10,
                      border: motorDigits.includes(d) ? '2px solid var(--primary)' : '1px solid #E2E8F0',
                      background: motorDigits.includes(d) ? 'var(--primary)' : 'white',
                      color: motorDigits.includes(d) ? 'white' : '#0F172A',
                      fontSize: 16,
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginTop: 8 }}>
                Total Panels Generated: {itemsToPlace.length}
              </div>
            </div>
          )}

          {/* Half Sangam Input */}
          {category.id === 'half_sangam' && (
            <div style={{ marginBottom: 16 }}>
              <span className="input-label">Open Pana & Close Ank:</span>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                <input
                  type="text"
                  maxLength={3}
                  placeholder="3-digit Pana (137)"
                  className="input-field"
                  value={sangamPanna}
                  onChange={e => setSangamPanna(e.target.value.replace(/[^0-9]/g, ''))}
                />
                <input
                  type="text"
                  maxLength={1}
                  placeholder="Ank (4)"
                  className="input-field"
                  value={sangamAnk}
                  onChange={e => setSangamAnk(e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
            </div>
          )}

          {/* Full Sangam Input */}
          {category.id === 'full_sangam' && (
            <div style={{ marginBottom: 16 }}>
              <span className="input-label">Open Pana & Close Pana:</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input
                  type="text"
                  maxLength={3}
                  placeholder="Open Pana (137)"
                  className="input-field"
                  value={sangamPanna}
                  onChange={e => setSangamPanna(e.target.value.replace(/[^0-9]/g, ''))}
                />
                <input
                  type="text"
                  maxLength={3}
                  placeholder="Close Pana (248)"
                  className="input-field"
                  value={sangamClosePanna}
                  onChange={e => setSangamClosePanna(e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
            </div>
          )}

          {/* Amount input & Quick Chips */}
          <div style={{ marginBottom: 16 }}>
            <span className="input-label">Points / Amount (₹):</span>
            <input
              type="number"
              min={10}
              className="input-field"
              value={amount}
              onChange={e => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
              style={{ fontSize: 18, fontWeight: 800 }}
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {quickAmounts.map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: amount === val ? '1.5px solid var(--primary)' : '1px solid #E2E8F0',
                    background: amount === val ? 'var(--primary-soft)' : '#F8FAFC',
                    color: amount === val ? 'var(--primary)' : '#334155',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  +₹{val}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Card */}
          <div style={{
            background: '#F1F5F9',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 16,
            fontSize: 13,
            fontWeight: 700
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#64748B' }}>Total Points to Deduct:</span>
              <span style={{ color: '#0F172A', fontWeight: 900 }}>₹{totalPoints}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#64748B' }}>Potential Win (Per Unit):</span>
              <span style={{ color: '#16A34A', fontWeight: 900 }}>₹{potentialWin}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Your Wallet Balance:</span>
              <span style={{ color: userBalance >= totalPoints ? '#16A34A' : '#DC2626', fontWeight: 900 }}>
                ₹{userBalance.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading || itemsToPlace.length === 0}
          >
            {loading ? 'Processing Bid...' : `PLACE BID (₹${totalPoints})`}
          </button>
        </div>
      </div>
    </div>
  );
};
