import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DisawarBettingScreenProps {
  market: {
    id: number;
    name: string;
    open_time: string;
    close_time: string;
    close_time_24: string;
    canPlay?: boolean;
  };
  user: any;
  token: string | null;
  onBack: () => void;
  onOpenAuth: () => void;
  onOpenFunds: () => void;
  onBetPlacedSuccess: (newBalance: number) => void;
}

interface BidEntry {
  number: string;
  amount: number;
  type: 'jodi' | 'andar' | 'bahar';
}

export const DisawarBettingScreen: React.FC<DisawarBettingScreenProps> = ({
  market,
  user,
  token,
  onBack,
  onOpenAuth,
  onOpenFunds,
  onBetPlacedSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'jodi' | 'crossing' | 'copypaste'>('jodi');

  // Tab 1: Jodi inputs (01 to 00)
  const [jodiInputs, setJodiInputs] = useState<{ [key: string]: string }>({});
  // Tab 1: Haruf inputs
  const [andarInputs, setAndarInputs] = useState<{ [key: string]: string }>({});
  const [baharInputs, setBaharInputs] = useState<{ [key: string]: string }>({});

  // Tab 2: Crossing state
  const [crossingDigits, setCrossingDigits] = useState<string>('');
  const [crossingAmount, setCrossingAmount] = useState<string>('');
  const [crossingWithJoda, setCrossingWithJoda] = useState<boolean>(true);
  const [crossingList, setCrossingList] = useState<{ id: string; number: string; amount: number }[]>([]);

  // Tab 3: Copy Paste state
  const [copyPasteText, setCopyPasteText] = useState<string>('');
  const [copyPasteDefaultAmount, setCopyPasteDefaultAmount] = useState<string>('');
  const [copyPasteList, setCopyPasteList] = useState<{ id: string; number: string; amount: number }[]>([]);

  // Submitting state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    success: boolean;
    title: string;
    message: string;
    ticketIds?: string[];
  }>({ open: false, success: false, title: '', message: '' });

  // Sound effects
  const playClickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {
      // Audio not allowed
    }
  };

  // Real-time ticking countdown to market close time
  const [timeRemainingStr, setTimeRemainingStr] = useState<string>('00:00:00');

  useEffect(() => {
    const updateCountdown = () => {
      if (!market?.close_time_24) {
        setTimeRemainingStr('00:00:00');
        return;
      }
      const [ch, cm] = market.close_time_24.split(':').map(Number);
      const now = new Date();
      const target = new Date();
      target.setHours(ch, cm, 0, 0);

      // If already past today, target is next day or 00:00:00
      let diffMs = target.getTime() - now.getTime();
      if (diffMs < 0) {
        setTimeRemainingStr('CLOSED');
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeRemainingStr(
        `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [market]);

  // Generate 10x10 Jodi grid numbers: 01 to 00
  // Rows 1-10: 01-10, 11-20, 21-30, ... 91-00
  const jodiGridRows = useMemo(() => {
    const rows: string[][] = [];
    for (let r = 0; r < 10; r++) {
      const row: string[] = [];
      for (let c = 1; c <= 10; c++) {
        let numVal = r * 10 + c;
        let str = numVal === 100 ? '00' : String(numVal).padStart(2, '0');
        row.push(str);
      }
      rows.push(row);
    }
    return rows;
  }, []);

  // Haruf digits: 0 to 9
  const harufDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  // Handle Jodi input change
  const handleJodiChange = (num: string, val: string) => {
    const clean = val.replace(/\D/g, '');
    setJodiInputs((prev) => ({
      ...prev,
      [num]: clean,
    }));
  };

  // Handle Andar Haruf input change
  const handleAndarChange = (digit: string, val: string) => {
    const clean = val.replace(/\D/g, '');
    setAndarInputs((prev) => ({
      ...prev,
      [digit]: clean,
    }));
  };

  // Handle Bahar Haruf input change
  const handleBaharChange = (digit: string, val: string) => {
    const clean = val.replace(/\D/g, '');
    setBaharInputs((prev) => ({
      ...prev,
      [digit]: clean,
    }));
  };

  // Calculate Total Points based on active tab
  const totalPoints = useMemo(() => {
    if (activeTab === 'jodi') {
      let sum = 0;
      Object.values(jodiInputs).forEach((v) => {
        const n = parseInt(v, 10);
        if (!isNaN(n) && n > 0) sum += n;
      });
      Object.values(andarInputs).forEach((v) => {
        const n = parseInt(v, 10);
        if (!isNaN(n) && n > 0) sum += n;
      });
      Object.values(baharInputs).forEach((v) => {
        const n = parseInt(v, 10);
        if (!isNaN(n) && n > 0) sum += n;
      });
      return sum;
    }

    if (activeTab === 'crossing') {
      return crossingList.reduce((acc, curr) => acc + curr.amount, 0);
    }

    if (activeTab === 'copypaste') {
      return copyPasteList.reduce((acc, curr) => acc + curr.amount, 0);
    }

    return 0;
  }, [activeTab, jodiInputs, andarInputs, baharInputs, crossingList, copyPasteList]);

  // Tab 2: Add Crossing Combinations
  const handleAddCrossing = () => {
    playClickSound();
    const cleanDigits = crossingDigits.replace(/\D/g, '');
    const amountNum = parseInt(crossingAmount, 10);

    if (!cleanDigits || cleanDigits.length < 2) {
      alert('Please enter at least 2 distinct digits for crossing.');
      return;
    }
    if (isNaN(amountNum) || amountNum < 10) {
      alert('Minimum bet amount is ₹10.');
      return;
    }

    // Generate crossing pairs
    const uniqueDigits = Array.from(new Set(cleanDigits.split('')));
    const pairs: string[] = [];

    for (let i = 0; i < uniqueDigits.length; i++) {
      for (let j = 0; j < uniqueDigits.length; j++) {
        if (!crossingWithJoda && i === j) {
          continue; // skip doubles if without joda
        }
        pairs.push(`${uniqueDigits[i]}${uniqueDigits[j]}`);
      }
    }

    const newEntries = pairs.map((pair) => ({
      id: `${pair}-${Date.now()}-${Math.random()}`,
      number: pair,
      amount: amountNum,
    }));

    setCrossingList((prev) => [...prev, ...newEntries]);
    setCrossingDigits('');
    setCrossingAmount('');
  };

  const handleRemoveCrossingItem = (id: string) => {
    playClickSound();
    setCrossingList((prev) => prev.filter((item) => item.id !== id));
  };

  // Tab 3: Parse and Add Copy Paste Text
  const handleAddCopyPaste = () => {
    playClickSound();
    if (!copyPasteText.trim()) {
      alert('Please paste numbers or text.');
      return;
    }

    const fallbackAmt = parseInt(copyPasteDefaultAmount, 10) || 10;
    const lines = copyPasteText.split(/[\n,;]+/);
    const parsed: { id: string; number: string; amount: number }[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Pattern 1: 01=50, 12=100, 45*50, 67-100, 89:50
      const matchKeyVal = line.match(/^(\d{2})\s*[=*\-:]\s*(\d+)$/);
      if (matchKeyVal) {
        parsed.push({
          id: `${matchKeyVal[1]}-${Date.now()}-${Math.random()}`,
          number: matchKeyVal[1],
          amount: parseInt(matchKeyVal[2], 10),
        });
        continue;
      }

      // Pattern 2: Series of pairs with single amount e.g. "01 02 03 - 50"
      if (line.includes('-') || line.includes('=')) {
        const parts = line.split(/[-=]+/);
        if (parts.length === 2) {
          const numbersStr = parts[0].trim();
          const amt = parseInt(parts[1].trim(), 10) || fallbackAmt;
          const nums = numbersStr.match(/\b\d{2}\b/g);
          if (nums) {
            for (const n of nums) {
              parsed.push({
                id: `${n}-${Date.now()}-${Math.random()}`,
                number: n,
                amount: amt,
              });
            }
            continue;
          }
        }
      }

      // Pattern 3: Space-separated pairs using fallback amount
      const isolatedPairs = line.match(/\b\d{2}\b/g);
      if (isolatedPairs) {
        for (const p of isolatedPairs) {
          parsed.push({
            id: `${p}-${Date.now()}-${Math.random()}`,
            number: p,
            amount: fallbackAmt,
          });
        }
      }
    }

    if (parsed.length === 0) {
      alert('Could not detect valid 2-digit Jodi numbers in the pasted text.');
      return;
    }

    setCopyPasteList((prev) => [...prev, ...parsed]);
    setCopyPasteText('');
  };

  const handleRemoveCopyPasteItem = (id: string) => {
    playClickSound();
    setCopyPasteList((prev) => prev.filter((item) => item.id !== id));
  };

  // Submit / Place Bets
  const handlePlayClick = async () => {
    playClickSound();

    if (!token || !user) {
      onOpenAuth();
      return;
    }

    if (totalPoints <= 0) {
      alert('Please enter bid amounts before playing.');
      return;
    }

    const currentBalance = Number(user.wallet_balance || 0);
    if (currentBalance < totalPoints) {
      setStatusModal({
        open: true,
        success: false,
        title: 'Insufficient Balance',
        message: `Your balance is ₹${currentBalance.toFixed(2)}, but you need ₹${totalPoints.toFixed(
          2
        )}. Please add funds to place these bids.`,
      });
      return;
    }

    // Collect all bets to place
    const betsToPlace: {
      gameType: string;
      session: string;
      bets: { number: string; amount: number }[];
    }[] = [];

    if (activeTab === 'jodi') {
      // 1. Jodis
      const jodiList: { number: string; amount: number }[] = [];
      Object.entries(jodiInputs).forEach(([num, amtStr]) => {
        const amt = parseInt(amtStr, 10);
        if (!isNaN(amt) && amt > 0) {
          jodiList.push({ number: num, amount: amt });
        }
      });
      if (jodiList.length > 0) {
        betsToPlace.push({
          gameType: 'jodi_digit',
          session: 'CLOSE',
          bets: jodiList,
        });
      }

      // 2. Andar Haruf
      const andarList: { number: string; amount: number }[] = [];
      Object.entries(andarInputs).forEach(([digit, amtStr]) => {
        const amt = parseInt(amtStr, 10);
        if (!isNaN(amt) && amt > 0) {
          andarList.push({ number: digit, amount: amt });
        }
      });
      if (andarList.length > 0) {
        betsToPlace.push({
          gameType: 'single_digit',
          session: 'OPEN',
          bets: andarList,
        });
      }

      // 3. Bahar Haruf
      const baharList: { number: string; amount: number }[] = [];
      Object.entries(baharInputs).forEach(([digit, amtStr]) => {
        const amt = parseInt(amtStr, 10);
        if (!isNaN(amt) && amt > 0) {
          baharList.push({ number: digit, amount: amt });
        }
      });
      if (baharList.length > 0) {
        betsToPlace.push({
          gameType: 'single_digit',
          session: 'CLOSE',
          bets: baharList,
        });
      }
    } else if (activeTab === 'crossing') {
      const list = crossingList.map((item) => ({
        number: item.number,
        amount: item.amount,
      }));
      betsToPlace.push({
        gameType: 'jodi_digit',
        session: 'CLOSE',
        bets: list,
      });
    } else if (activeTab === 'copypaste') {
      const list = copyPasteList.map((item) => ({
        number: item.number,
        amount: item.amount,
      }));
      betsToPlace.push({
        gameType: 'jodi_digit',
        session: 'CLOSE',
        bets: list,
      });
    }

    if (betsToPlace.length === 0) {
      alert('No valid bets to place.');
      return;
    }

    setSubmitting(true);
    try {
      const allTicketIds: string[] = [];
      let finalBalance = currentBalance;

      for (const batch of betsToPlace) {
        const res = await fetch('/api/v1/bets/place', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            marketId: market.id,
            gameType: batch.gameType,
            session: batch.session,
            bets: batch.bets,
          }),
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || 'Failed to place bets.');
        }
        if (data.tickets) {
          allTicketIds.push(...data.tickets);
        }
        if (typeof data.wallet_balance === 'number') {
          finalBalance = data.wallet_balance;
        }
      }

      // Success
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      onBetPlacedSuccess(finalBalance);

      // Reset active tab data
      if (activeTab === 'jodi') {
        setJodiInputs({});
        setAndarInputs({});
        setBaharInputs({});
      } else if (activeTab === 'crossing') {
        setCrossingList([]);
      } else if (activeTab === 'copypaste') {
        setCopyPasteList([]);
      }

      setStatusModal({
        open: true,
        success: true,
        title: 'Bids Placed Successfully!',
        message: `Successfully placed ${allTicketIds.length} bid(s) for ${market.name}. Total amount: ₹${totalPoints.toFixed(
          2
        )}`,
        ticketIds: allTicketIds.slice(0, 5),
      });
    } catch (err: any) {
      setStatusModal({
        open: true,
        success: false,
        title: 'Bet Placement Error',
        message: err.message || 'Something went wrong while placing your bets.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="disawar-betting-container">
      {/* 1. Header (Matching Reference Frame 9 & 13) */}
      <div className="disawar-bet-header">
        <button
          className="disawar-bet-back-btn"
          onClick={() => {
            playClickSound();
            onBack();
          }}
          aria-label="Back to Disawar"
        >
          <ArrowLeft size={22} color="#0f172a" />
        </button>

        <div className="disawar-bet-title">{market.name}</div>

        <div className="disawar-bet-timer-wrap">
          <span className="bet-timer-label">गेम का लास्ट टाइम</span>
          <span className="bet-timer-val">{timeRemainingStr}</span>
        </div>
      </div>

      {/* 2. Sub-header Hot Pink Banner (Matching Reference Frame 9) */}
      <div className="disawar-bet-subheader">
        <div className="subheader-left">
          मोटी जोड़ी लास्ट टाइम : {timeRemainingStr}
        </div>
        <div className="subheader-right">
          Wallet: ₹{user ? Number(user.wallet_balance || 0).toFixed(2) : '0.00'}
        </div>
      </div>

      {/* 3. Three Tabs (Matching Reference Frame 9 & 13) */}
      <div className="disawar-bet-tabs">
        <button
          className={`bet-tab-btn ${activeTab === 'jodi' ? 'active-tab' : ''}`}
          onClick={() => {
            playClickSound();
            setActiveTab('jodi');
          }}
        >
          JODI
        </button>
        <button
          className={`bet-tab-btn ${activeTab === 'crossing' ? 'active-tab' : ''}`}
          onClick={() => {
            playClickSound();
            setActiveTab('crossing');
          }}
        >
          CROSSING
        </button>
        <button
          className={`bet-tab-btn ${activeTab === 'copypaste' ? 'active-tab' : ''}`}
          onClick={() => {
            playClickSound();
            setActiveTab('copypaste');
          }}
        >
          COPY PASTE
        </button>
      </div>

      {/* 4. Tab Content */}
      <div className="disawar-bet-content">
        {/* TAB 1: JODI (Matching Frame 9, 10, 11, 20) */}
        {activeTab === 'jodi' && (
          <div className="tab-pane-jodi">
            {/* 10x10 Full Grid */}
            <div className="jodi-grid-container">
              {jodiGridRows.map((row, rIdx) => (
                <div key={rIdx} className="jodi-grid-row">
                  {row.map((num) => (
                    <div key={num} className="jodi-grid-cell">
                      <div className="jodi-cell-header">{num}</div>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="jodi-cell-input"
                        placeholder=""
                        value={jodiInputs[num] || ''}
                        onChange={(e) => handleJodiChange(num, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Andar Haruf (अंदर) */}
            <div className="haruf-section">
              <div className="haruf-section-title">Andar Haruf ( अंदर )</div>
              <div className="haruf-grid-row">
                {harufDigits.map((d) => (
                  <div key={`andar-${d}`} className="haruf-grid-cell">
                    <div className="haruf-cell-header">{d}</div>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="haruf-cell-input"
                      placeholder=""
                      value={andarInputs[d] || ''}
                      onChange={(e) => handleAndarChange(d, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Bahar Haruf (बाहर) */}
            <div className="haruf-section">
              <div className="haruf-section-title">Bahar Haruf ( बाहर )</div>
              <div className="haruf-grid-row">
                {harufDigits.map((d) => (
                  <div key={`bahar-${d}`} className="haruf-grid-cell">
                    <div className="haruf-cell-header">{d}</div>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="haruf-cell-input"
                      placeholder=""
                      value={baharInputs[d] || ''}
                      onChange={(e) => handleBaharChange(d, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CROSSING (Matching Frame 13 & 14) */}
        {activeTab === 'crossing' && (
          <div className="tab-pane-crossing">
            <div className="crossing-input-card">
              <div className="form-group">
                <label className="form-label">Enter Digit</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="crossing-input"
                  placeholder="e.g. 1234 or 0158"
                  value={crossingDigits}
                  onChange={(e) => setCrossingDigits(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Enter Amount</label>
                <input
                  type="number"
                  inputMode="numeric"
                  className="crossing-input"
                  placeholder="Points per pair (min ₹10)"
                  value={crossingAmount}
                  onChange={(e) => setCrossingAmount(e.target.value)}
                />
              </div>

              <div className="crossing-toggle-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={crossingWithJoda}
                    onChange={(e) => setCrossingWithJoda(e.target.checked)}
                  />
                  <span>With Joda (11, 22, 33...)</span>
                </label>
              </div>

              <button className="crossing-add-btn" onClick={handleAddCrossing}>
                ADD
              </button>
            </div>

            {/* Table of Crossing Pairs */}
            <div className="bids-table-wrap">
              <div className="bids-table-header">
                <span className="th-col th-col-num">NUMBER</span>
                <span className="th-col th-col-amt">AMOUNT</span>
                <span className="th-col th-col-act">ACTION</span>
              </div>

              <div className="bids-table-body">
                {crossingList.length === 0 ? (
                  <div className="bids-empty-msg">No crossing pairs added yet.</div>
                ) : (
                  crossingList.map((item) => (
                    <div key={item.id} className="bids-table-row">
                      <span className="td-col td-col-num">{item.number}</span>
                      <span className="td-col td-col-amt">₹{item.amount}</span>
                      <span className="td-col td-col-act">
                        <button
                          className="btn-trash"
                          onClick={() => handleRemoveCrossingItem(item.id)}
                          aria-label="Remove"
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </button>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COPY PASTE */}
        {activeTab === 'copypaste' && (
          <div className="tab-pane-copypaste">
            <div className="crossing-input-card">
              <div className="form-group">
                <label className="form-label">Paste Bids Text</label>
                <textarea
                  className="copypaste-textarea"
                  rows={4}
                  placeholder={`Paste games here, e.g.:\n01=50, 02=50, 15*100\nor\n12 14 16 - 50`}
                  value={copyPasteText}
                  onChange={(e) => setCopyPasteText(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Default Amount (if not in text)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  className="crossing-input"
                  placeholder="₹10"
                  value={copyPasteDefaultAmount}
                  onChange={(e) => setCopyPasteDefaultAmount(e.target.value)}
                />
              </div>

              <button className="crossing-add-btn" onClick={handleAddCopyPaste}>
                ADD TO BIDS
              </button>
            </div>

            {/* Table of Parsed Bids */}
            <div className="bids-table-wrap">
              <div className="bids-table-header">
                <span className="th-col th-col-num">NUMBER</span>
                <span className="th-col th-col-amt">AMOUNT</span>
                <span className="th-col th-col-act">ACTION</span>
              </div>

              <div className="bids-table-body">
                {copyPasteList.length === 0 ? (
                  <div className="bids-empty-msg">No bids added yet.</div>
                ) : (
                  copyPasteList.map((item) => (
                    <div key={item.id} className="bids-table-row">
                      <span className="td-col td-col-num">{item.number}</span>
                      <span className="td-col td-col-amt">₹{item.amount}</span>
                      <span className="td-col td-col-act">
                        <button
                          className="btn-trash"
                          onClick={() => handleRemoveCopyPasteItem(item.id)}
                          aria-label="Remove"
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </button>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Sticky Bottom Bar (Matching Reference Frame 9 & 13) */}
      <div className="disawar-sticky-footer">
        <div className="footer-total-box">
          <span className="footer-rupee-sign">₹</span>
          <span className="footer-total-val">{totalPoints}</span>
        </div>

        <button
          className="disawar-btn-play"
          onClick={handlePlayClick}
          disabled={submitting || totalPoints <= 0}
        >
          {submitting ? 'PLAYING...' : 'PLAY'}
        </button>
      </div>

      {/* Status Modal (Confirmation / Error) */}
      {statusModal.open && (
        <div className="disawar-modal-overlay">
          <div className="disawar-modal-dialog">
            <div className={`modal-icon-wrap ${statusModal.success ? 'icon-success' : 'icon-error'}`}>
              {statusModal.success ? (
                <CheckCircle2 size={40} color="#10b981" />
              ) : (
                <AlertCircle size={40} color="#ef4444" />
              )}
            </div>
            <h3 className="modal-title">{statusModal.title}</h3>
            <p className="modal-message">{statusModal.message}</p>

            {statusModal.ticketIds && statusModal.ticketIds.length > 0 && (
              <div className="modal-tickets-box">
                <div className="tickets-title">Placed Tickets:</div>
                <div className="tickets-list">
                  {statusModal.ticketIds.map((t) => (
                    <span key={t} className="ticket-badge">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-actions-row">
              {!statusModal.success && statusModal.title.includes('Insufficient') ? (
                <>
                  <button
                    className="modal-btn-secondary"
                    onClick={() => setStatusModal({ ...statusModal, open: false })}
                  >
                    Cancel
                  </button>
                  <button
                    className="modal-btn-primary"
                    onClick={() => {
                      setStatusModal({ ...statusModal, open: false });
                      onOpenFunds();
                    }}
                  >
                    Add Funds
                  </button>
                </>
              ) : (
                <button
                  className="modal-btn-primary full-width"
                  onClick={() => setStatusModal({ ...statusModal, open: false })}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
