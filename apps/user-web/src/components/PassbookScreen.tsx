import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowDownLeft, ArrowUpRight, Filter, Receipt, RefreshCw 
} from 'lucide-react';
import { playClickSound, playTabSound } from '../utils/soundEffects';

interface PassbookScreenProps {
  balance: number;
  token: string | null;
  onBack: () => void;
  onRequireLogin: () => void;
}

export const PassbookScreen: React.FC<PassbookScreenProps> = ({
  balance,
  token,
  onBack,
  onRequireLogin
}) => {
  const [filter, setFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      onRequireLogin();
      return;
    }
    fetchTransactions();
  }, [token]);

  const fetchTransactions = () => {
    if (!token) return;
    setLoading(true);
    fetch('/api/v1/wallet/transactions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTransactions(data.transactions || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'CREDIT') return tx.amount > 0;
    if (filter === 'DEBIT') return tx.amount < 0;
    return true;
  });

  const totalCredits = transactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const totalDebits = transactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(Number(tx.amount || 0)), 0);

  return (
    <div className="passbook-view-container" style={{ paddingBottom: 85, minHeight: '100vh', background: '#F8FAFC' }}>
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
          <span style={{ fontSize: 17, fontWeight: 900, letterSpacing: 0.5 }}>ACCOUNT PASSBOOK</span>
        </div>

        <div className="header-balance-pill">
          ₹{balance.toFixed(2)}
        </div>
      </div>

      <div style={{ padding: '14px' }}>
        {/* Summary Card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 14
        }}>
          <div style={{
            background: 'white',
            borderRadius: 14,
            padding: '12px 14px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowDownLeft size={14} /> TOTAL CREDITS
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#15803D', marginTop: 4 }}>
              +₹{totalCredits.toFixed(2)}
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: 14,
            padding: '12px 14px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowUpRight size={14} /> TOTAL DEBITS
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#B91C1C', marginTop: 4 }}>
              -₹{totalDebits.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 14,
          alignItems: 'center'
        }}>
          <button
            onClick={() => { playTabSound(); setFilter('ALL'); }}
            style={{
              padding: '7px 16px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              background: filter === 'ALL' ? '#0284C7' : '#FFFFFF',
              color: filter === 'ALL' ? 'white' : '#64748B',
              boxShadow: filter === 'ALL' ? '0 2px 8px rgba(2, 132, 199, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.15s'
            }}
          >
            All ({transactions.length})
          </button>

          <button
            onClick={() => { playTabSound(); setFilter('CREDIT'); }}
            style={{
              padding: '7px 16px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              background: filter === 'CREDIT' ? '#10B981' : '#FFFFFF',
              color: filter === 'CREDIT' ? 'white' : '#64748B',
              boxShadow: filter === 'CREDIT' ? '0 2px 8px rgba(16, 185, 129, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.15s'
            }}
          >
            Credits (+)
          </button>

          <button
            onClick={() => { playTabSound(); setFilter('DEBIT'); }}
            style={{
              padding: '7px 16px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              background: filter === 'DEBIT' ? '#EF4444' : '#FFFFFF',
              color: filter === 'DEBIT' ? 'white' : '#64748B',
              boxShadow: filter === 'DEBIT' ? '0 2px 8px rgba(239, 68, 68, 0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.15s'
            }}
          >
            Debits (-)
          </button>

          <button
            onClick={() => { playClickSound(); fetchTransactions(); }}
            style={{
              marginLeft: 'auto',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
              cursor: 'pointer'
            }}
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Transactions List */}
        {loading && transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748B', fontSize: 13, fontWeight: 700 }}>
            Loading Passbook Entries...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: '36px 20px',
            textAlign: 'center',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <Receipt size={40} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: 15, fontWeight: 800, color: '#1E293B', marginBottom: 4 }}>
              No Transactions Found
            </div>
            <div style={{ fontSize: 12, color: '#64748B' }}>
              Your financial ledger entries will appear here.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredTransactions.map(tx => {
              const isCredit = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  style={{
                    background: 'white',
                    borderRadius: 14,
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    border: '1px solid #E2E8F0',
                    borderLeft: isCredit ? '4px solid #10B981' : '4px solid #EF4444'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: isCredit ? '#DCFCE7' : '#FEE2E2',
                      color: isCredit ? '#15803D' : '#DC2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isCredit ? <ArrowDownLeft size={18} strokeWidth={2.5} /> : <ArrowUpRight size={18} strokeWidth={2.5} />}
                    </div>

                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                        {tx.type || (isCredit ? 'DEPOSIT' : 'WITHDRAWAL')}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: '#64748B',
                        maxWidth: 180,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginTop: 2
                      }}>
                        {tx.description}
                      </div>
                      <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>
                        {new Date(tx.created_at).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontSize: 15,
                      fontWeight: 900,
                      color: isCredit ? '#10B981' : '#EF4444'
                    }}>
                      {isCredit ? `+₹${Number(tx.amount).toFixed(2)}` : `-₹${Math.abs(Number(tx.amount)).toFixed(2)}`}
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: '#475569',
                      fontWeight: 700,
                      background: '#F1F5F9',
                      padding: '2px 8px',
                      borderRadius: 6,
                      marginTop: 4,
                      display: 'inline-block'
                    }}>
                      Bal: ₹{Number(tx.new_balance || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
