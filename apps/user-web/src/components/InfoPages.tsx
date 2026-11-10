import React from 'react';
import { ArrowLeft, MessageCircle, Phone, ShieldCheck, HelpCircle } from 'lucide-react';
import { MatkaRatesSection } from './MatkaRatesSection';

interface InfoPageProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

export const InfoPageContainer: React.FC<InfoPageProps> = ({ title, onBack, children }) => (
  <div style={{ paddingBottom: 80 }}>
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
      <span style={{ fontSize: 17, fontWeight: 900, textTransform: 'uppercase' }}>{title}</span>
    </div>
    <div style={{ padding: '16px 14px' }}>
      {children}
    </div>
  </div>
);

export const GameRatesView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{
        background: '#0284C7',
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
        <span style={{ fontSize: 17, fontWeight: 900, textTransform: 'uppercase' }}>Game Rates</span>
      </div>
      <div style={{ maxWidth: 900, margin: '16px auto', padding: '0 12px' }}>
        <MatkaRatesSection onPlayClick={onBack} />
      </div>
    </div>
  );
};

export const SupportView: React.FC<{ onBack: () => void; whatsapp?: string; phone?: string }> = ({ onBack, whatsapp, phone }) => {
  const wa = whatsapp || '+919876543210';
  const ph = phone || '+919876543210';

  return (
    <InfoPageContainer title="24x7 Customer Support" onBack={onBack}>
      <div style={{ background: 'white', borderRadius: 16, padding: '20px 16px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <MessageCircle size={32} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', marginBottom: 6 }}>We're Here to Help!</div>
        <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginBottom: 20 }}>
          For instant deposit approval, withdrawal assistance or any game queries, our customer support team is available 24/7.
        </div>

        <a
          href={`https://wa.me/${wa.replace(/[^0-9]/g, '')}?text=Hello%20GoldMatka%20Support`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            background: '#10B981',
            color: 'white',
            textDecoration: 'none',
            padding: '14px',
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 15,
            marginBottom: 10
          }}
        >
          <MessageCircle size={20} />
          <span>CHAT ON WHATSAPP ({wa})</span>
        </a>

        <a
          href={`tel:${ph}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            background: '#3B82F6',
            color: 'white',
            textDecoration: 'none',
            padding: '14px',
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 15
          }}
        >
          <Phone size={20} />
          <span>CALL SUPPORT ({ph})</span>
        </a>
      </div>
    </InfoPageContainer>
  );
};
