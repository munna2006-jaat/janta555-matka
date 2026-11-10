import React, { useState, useEffect } from 'react';
import { Trophy, Wallet, Home, Landmark, Headphones } from 'lucide-react';
import { playTabSound } from '../utils/soundEffects';
import { t, getActiveLanguage, LanguageCode } from '../utils/translations';

export type NavTab = 'home' | 'bids' | 'funds' | 'bank' | 'support';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const [lang, setLang] = useState<LanguageCode>(getActiveLanguage());

  useEffect(() => {
    const handleLangChange = (e: any) => {
      if (e.detail?.lang) setLang(e.detail.lang);
    };
    window.addEventListener('goldmatka_lang_changed', handleLangChange);
    return () => window.removeEventListener('goldmatka_lang_changed', handleLangChange);
  }, []);

  const handleSelect = (tab: NavTab) => {
    playTabSound();
    onTabChange(tab);
  };

  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${currentTab === 'bids' ? 'active' : ''}`}
        onClick={() => handleSelect('bids')}
      >
        <Trophy size={20} strokeWidth={currentTab === 'bids' ? 2.5 : 2} />
        <span>{t('nav_bids', lang)}</span>
      </button>

      <button
        className={`nav-item ${currentTab === 'funds' ? 'active' : ''}`}
        onClick={() => handleSelect('funds')}
      >
        <Wallet size={20} strokeWidth={currentTab === 'funds' ? 2.5 : 2} />
        <span>{t('nav_funds', lang)}</span>
      </button>

      <div
        className="nav-center-elevated"
        onClick={() => handleSelect('home')}
        title={t('nav_home', lang)}
      >
        <Home size={24} strokeWidth={2.4} />
      </div>

      <button
        className={`nav-item ${currentTab === 'bank' ? 'active' : ''}`}
        onClick={() => handleSelect('bank')}
      >
        <Landmark size={20} strokeWidth={currentTab === 'bank' ? 2.5 : 2} />
        <span>{t('nav_bank', lang)}</span>
      </button>

      <button
        className={`nav-item ${currentTab === 'support' ? 'active' : ''}`}
        onClick={() => handleSelect('support')}
      >
        <Headphones size={20} strokeWidth={currentTab === 'support' ? 2.5 : 2} />
        <span>{t('nav_support', lang)}</span>
      </button>
    </nav>
  );
};
