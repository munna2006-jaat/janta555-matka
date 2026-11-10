import React, { useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle, HelpCircle, Trophy, Sparkles, AlertCircle } from 'lucide-react';

interface HowToPlayScreenProps {
  onBack: () => void;
}

export const HowToPlayScreen: React.FC<HowToPlayScreenProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'games' | 'calculation' | 'cut' | 'rules'>('games');

  const games = [
    {
      title: '1. Single Digit (अंक)',
      subtitle: 'Choose any single digit from 0 to 9',
      rate: '10 Ka 95 (1 : 9.5)',
      desc: 'You place a bet on any digit between 0 and 9 for the Open or Close session.',
      example: 'If result is 147-28-350: Open Single is 2. If you bet on 2, you win ₹95 on a ₹10 bet!',
      color: '#E11D48'
    },
    {
      title: '2. Jodi Digit (जोड़ी)',
      subtitle: 'Pair of 2 digits from 00 to 99',
      rate: '10 Ka 950 (1 : 95)',
      desc: 'A pair formed by the Open Single Digit + Close Single Digit.',
      example: 'If Open Single is 2 and Close Single is 8, winning Jodi is 28. If you bet on 28, you win ₹950 on ₹10!',
      color: '#0284C7'
    },
    {
      title: '3. Single Pana (सिंगल पाना)',
      subtitle: '3 unique ascending digits (120 Total Panas)',
      rate: '10 Ka 1500 (1 : 150)',
      desc: 'All 3 digits must be different and in strictly ascending order (e.g. 128, 357, 469).',
      example: 'If Open Pana result is 147, and your ticket is 147, you win ₹1,500 on ₹10!',
      color: '#16A34A'
    },
    {
      title: '4. Double Pana (डबल पाना)',
      subtitle: '2 identical digits + 1 unique (90 Total Panas)',
      rate: '10 Ka 3000 (1 : 300)',
      desc: 'Two digits are the same and one is different, in ascending order (e.g. 112, 224, 558, 779).',
      example: 'If Close Pana is 224, and your bet is 224, you win ₹3,000 on a ₹10 bet!',
      color: '#D97706'
    },
    {
      title: '5. Triple Pana (ट्रिपल पाना)',
      subtitle: 'All 3 identical digits (10 Total Panas)',
      rate: '10 Ka 9000 (1 : 900)',
      desc: 'All 3 digits are identical: 000, 111, 222, 333, 444, 555, 666, 777, 888, 999.',
      example: 'If Open Pana is 777, and you played 777, you win ₹9,000 on a ₹10 bet!',
      color: '#8B5CF6'
    },
    {
      title: '6. Half Sangam (हाफ संगम)',
      subtitle: 'Combination of Open Pana + Close Digit OR Open Digit + Close Pana',
      rate: '10 Ka 14,000 (1 : 1400)',
      desc: 'Two types: (A) Open Pana + Close Single Digit, OR (B) Open Single Digit + Close Pana.',
      example: 'If result is 147-28-350: Type A winning is (147 x 8). Type B winning is (2 x 350). You win ₹14,000 on ₹10!',
      color: '#EC4899'
    },
    {
      title: '7. Full Sangam (फुल संगम)',
      subtitle: 'Open Pana + Close Pana exact match',
      rate: '10 Ka 1,00,000 (1 : 10,000)',
      desc: 'Match both the Open Pana (3 digits) and Close Pana (3 digits) exactly.',
      example: 'If result is 147-28-350: Winning Full Sangam is 147 x 350. You win ₹1,00,000 on a ₹10 bet!',
      color: '#F59E0B'
    },
    {
      title: '8. SP Motor / DP Motor',
      subtitle: 'Group permutations of selected digits',
      rate: 'Standard Pana Rates',
      desc: 'Select 4 to 8 digits. The system automatically places bets on all possible Single Panas (SP) or Double Panas (DP) for those digits.',
      example: 'Playing SP Motor 1, 2, 3, 4 will generate: 123, 124, 134, 234 in one click.',
      color: '#0D9488'
    }
  ];

  return (
    <div style={{ paddingBottom: 80, minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Sticky Header */}
      <div style={{
        background: 'var(--primary)',
        color: 'white',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 45
      }}>
        <button
          type="button"
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
        <span style={{ fontSize: 17, fontWeight: 900 }}>HOW TO PLAY & GAME RULES</span>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        background: 'white',
        borderBottom: '1px solid #E2E8F0',
        padding: '2px 4px'
      }}>
        {[
          { id: 'games', label: 'Games' },
          { id: 'calculation', label: 'Formula' },
          { id: 'cut', label: 'Cut Digits' },
          { id: 'rules', label: 'Rules' }
        ].map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            style={{
              padding: '11px 4px',
              border: 'none',
              background: 'none',
              fontSize: 12.5,
              fontWeight: 800,
              color: activeTab === t.id ? 'var(--primary)' : '#64748B',
              borderBottom: activeTab === t.id ? '3px solid var(--primary)' : '3px solid transparent',
              cursor: 'pointer'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '14px 12px' }}>
        {/* TAB 1: ALL GAMES */}
        {activeTab === 'games' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {games.map(g => (
              <div
                key={g.title}
                style={{
                  background: 'white',
                  borderRadius: 14,
                  padding: 14,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  borderLeft: `5px solid ${g.color}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#0F172A' }}>{g.title}</div>
                    <div style={{ fontSize: 11.5, color: '#64748B' }}>{g.subtitle}</div>
                  </div>
                  <span style={{
                    background: '#DCFCE7',
                    color: '#15803D',
                    fontSize: 12,
                    fontWeight: 900,
                    padding: '3px 8px',
                    borderRadius: 8
                  }}>
                    {g.rate}
                  </span>
                </div>

                <p style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.5, marginBottom: 8 }}>
                  {g.desc}
                </p>

                <div style={{
                  background: '#F1F5F9',
                  borderRadius: 8,
                  padding: '8px 10px',
                  fontSize: 11.5,
                  color: '#475569',
                  borderLeft: '3px solid #94A3B8'
                }}>
                  <strong>Example:</strong> {g.example}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: PANA ADDITION FORMULA */}
        {activeTab === 'calculation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'white', borderRadius: 14, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', marginBottom: 8 }}>
                🔢 How the Single Digit (Ank) is Calculated
              </h3>
              <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, marginBottom: 14 }}>
                In Satta Matka, a 3-digit Pana always determines the Single Digit through the sum of its three numbers. The unit's place of the sum is the Single Digit.
              </p>

              <div style={{ background: '#0F172A', color: 'white', borderRadius: 12, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: '#38BDF8', fontWeight: 800 }}>STEP 1: ADD THREE DIGITS</div>
                <div style={{ fontSize: 18, fontWeight: 900, margin: '6px 0', letterSpacing: 1 }}>
                  1 + 4 + 7 = 12
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>Take only the last digit (Unit place)</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#4ADE80', marginTop: 4 }}>
                  Open Single = 2
                </div>
              </div>

              <div style={{ background: '#F8FAFC', borderRadius: 10, padding: 12, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>More Examples:</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#475569', lineHeight: 1.8 }}>
                  <li>Pana <strong>248</strong>: 2 + 4 + 8 = 14 → Single is <strong>4</strong></li>
                  <li>Pana <strong>136</strong>: 1 + 3 + 6 = 10 → Single is <strong>0</strong></li>
                  <li>Pana <strong>578</strong>: 5 + 7 + 8 = 20 → Single is <strong>0</strong></li>
                  <li>Pana <strong>337</strong>: 3 + 3 + 7 = 13 → Single is <strong>3</strong></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CUT DIGITS */}
        {activeTab === 'cut' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'white', borderRadius: 14, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', marginBottom: 6 }}>
                ✂️ Cut Digits Chart (कट अंक)
              </h3>
              <p style={{ fontSize: 12.5, color: '#64748B', marginBottom: 14 }}>
                A "Cut Digit" is the opposite or mirror digit obtained by adding 5 to any number (mod 10).
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 16 }}>
                {[
                  { orig: '0', cut: '5' },
                  { orig: '1', cut: '6' },
                  { orig: '2', cut: '7' },
                  { orig: '3', cut: '8' },
                  { orig: '4', cut: '9' }
                ].map(pair => (
                  <div
                    key={pair.orig}
                    style={{
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      borderRadius: 10,
                      padding: '10px 4px',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--primary)' }}>{pair.orig}</div>
                    <div style={{ fontSize: 10, color: '#94A3B8', margin: '2px 0' }}>↔</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#16A34A' }}>{pair.cut}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#EFF6FF', borderRadius: 10, padding: 12, border: '1px solid #BFDBFE' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#1E40AF', marginBottom: 4 }}>
                  Family Jodi Concept:
                </div>
                <div style={{ fontSize: 12, color: '#3B82F6', lineHeight: 1.5 }}>
                  If Jodi is <strong>28</strong>, its family jodis include Cut Open (78), Cut Close (23), and Cut Both (73), along with reversals (82, 87, 32, 37).
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GENERAL RULES */}
        {activeTab === 'rules' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'white', borderRadius: 14, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', marginBottom: 12 }}>
                📜 Platform Betting Rules & Guidelines
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  {
                    title: '1. Bidding Deadlines',
                    desc: 'Open Session bids close exactly at market Open Time. Close Session bids close at Close Time. No bids can be placed once market timer hits zero.'
                  },
                  {
                    title: '2. Instant Auto-Settlement',
                    desc: 'When an admin declares the result or an automated draw occurs, all winning tickets are settled immediately and funds are credited directly to your JANTA555 wallet balance.'
                  },
                  {
                    title: '3. Minimum & Maximum Bet Limits',
                    desc: 'Minimum bet is ₹10. Maximum bet limits apply per game category to ensure fair play across all players.'
                  },
                  {
                    title: '4. Non-Cancellable Bets',
                    desc: 'Once placed and confirmed, a bet ticket cannot be edited or canceled by the player.'
                  },
                  {
                    title: '5. Fast Withdrawals',
                    desc: 'Withdrawal requests are processed via UPI or direct IMPS Bank Transfer 24/7 without delays.'
                  }
                ].map(r => (
                  <div key={r.title} style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 10 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', marginBottom: 3 }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
