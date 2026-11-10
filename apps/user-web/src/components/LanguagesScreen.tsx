import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getActiveLanguage, setActiveLanguage, t, LanguageCode } from '../utils/translations';
import { playClickSound, playTabSound } from '../utils/soundEffects';

interface LanguagesScreenProps {
  onBack: () => void;
}

export const LanguagesScreen: React.FC<LanguagesScreenProps> = ({ onBack }) => {
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(getActiveLanguage());
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleLangChange = (e: any) => {
      if (e.detail?.lang) {
        setSelectedLang(e.detail.lang);
      }
    };
    window.addEventListener('goldmatka_lang_changed', handleLangChange);
    return () => window.removeEventListener('goldmatka_lang_changed', handleLangChange);
  }, []);

  const handleSelect = (lang: LanguageCode) => {
    playTabSound();
    setSelectedLang(lang);
    setActiveLanguage(lang);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2400);
  };

  return (
    <div style={{ paddingBottom: 90, minHeight: '100dvh', background: '#F8FAFC' }}>
      {/* Sticky Header */}
      <div style={{
        background: 'linear-gradient(90deg, #10B981 0%, #06B6D4 50%, #2563EB 100%)',
        color: 'white',
        padding: 'max(12px, env(safe-area-inset-top)) 16px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'sticky',
        top: 0,
        zIndex: 45,
        boxShadow: '0 2px 10px rgba(37, 99, 235, 0.25)'
      }}>
        <button
          type="button"
          onClick={() => {
            playClickSound();
            onBack();
          }}
          style={{
            background: 'white',
            border: 'none',
            borderRadius: '50%',
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#1E293B',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}
          aria-label="Back"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
        <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.4px' }}>
          {t('select_language', selectedLang)}
        </span>
      </div>

      <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: 13, color: '#475569', margin: '4px 0 6px', fontWeight: 600 }}>
          {t('choose_language', selectedLang)}
        </p>

        {showToast && (
          <div style={{
            background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
            color: 'white',
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <Sparkles size={16} />
            <span>{t('lang_changed_toast', selectedLang)}</span>
          </div>
        )}

        {SUPPORTED_LANGUAGES.map(l => {
          const isSelected = selectedLang === l.code;
          return (
            <div
              key={l.code}
              onClick={() => handleSelect(l.code)}
              style={{
                background: 'white',
                borderRadius: 14,
                padding: '14px 16px',
                border: isSelected ? '2px solid #0284C7' : '1px solid #E2E8F0',
                boxShadow: isSelected ? '0 4px 14px rgba(2,132,199,0.18)' : '0 2px 6px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                transform: isSelected ? 'scale(1.01)' : 'scale(1)'
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{l.native}</span>
                  <span style={{ fontSize: 13, color: '#64748B', fontWeight: 700 }}>({l.name})</span>
                </div>
                <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 3 }}>
                  {l.subtitle}
                </div>
              </div>

              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: isSelected ? 'linear-gradient(135deg, #10B981 0%, #0284C7 100%)' : '#F1F5F9',
                border: isSelected ? 'none' : '1.5px solid #CBD5E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: isSelected ? '0 2px 8px rgba(16,185,129,0.4)' : 'none'
              }}>
                {isSelected && <Check size={16} strokeWidth={3} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
