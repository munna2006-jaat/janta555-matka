import React from 'react';
import { 
  X, Home, User, BarChart2, PlayCircle, Trophy, 
  ListOrdered, Grid, Download, Languages, Share2, LogOut, LogIn, Receipt, Crown 
} from 'lucide-react';
import { playClickSound, playPopupSound } from '../utils/soundEffects';
import { useLanguage } from '../utils/translations';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; phone: string } | null;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onLoginClick: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onNavigate,
  onLogout,
  onLoginClick
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const handleItemClick = (action: () => void) => {
    playClickSound();
    action();
    onClose();
  };

  return (
    <div className="drawer-backdrop" onClick={() => { playClickSound(); onClose(); }}>
      <div className="drawer-content" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div
            className="drawer-user-info"
            onClick={() => handleItemClick(() => {
              if (!user) onLoginClick();
              else onNavigate('profile');
            })}
            style={{ cursor: 'pointer' }}
          >
            <div className="drawer-avatar">
              <User size={24} />
            </div>
            <div>
              <div className="drawer-name">{user ? user.name : t('guest_user')}</div>
              <div className="drawer-phone">{user ? user.phone : t('tap_to_login')}</div>
            </div>
          </div>
          <button className="drawer-close-btn" onClick={() => { playClickSound(); onClose(); }} aria-label="Close">
            <X size={22} />
          </button>
        </div>

        <ul className="drawer-menu-list">
          <li className="drawer-menu-item" onClick={() => handleItemClick(() => onNavigate('home'))}>
            <div className="drawer-icon-circle"><Home size={18} /></div>
            <span>{t('menu_home')}</span>
          </li>

          <li className="drawer-menu-item" onClick={() => handleItemClick(() => onNavigate('profile'))}>
            <div className="drawer-icon-circle"><User size={18} /></div>
            <span>{t('menu_profile')}</span>
          </li>

          <li className="drawer-menu-item" onClick={() => handleItemClick(() => onNavigate('game-rates'))}>
            <div className="drawer-icon-circle"><BarChart2 size={18} /></div>
            <span>{t('menu_game_rates')}</span>
          </li>

          <li className="drawer-menu-item" onClick={() => handleItemClick(() => onNavigate('how-to-play'))}>
            <div className="drawer-icon-circle"><PlayCircle size={18} /></div>
            <span>{t('menu_how_to_play')}</span>
          </li>

          <li className="drawer-menu-item" onClick={() => handleItemClick(() => onNavigate('winning-history'))}>
            <div className="drawer-icon-circle"><Trophy size={18} /></div>
            <span>{t('menu_winning_history')}</span>
          </li>

          <li className="drawer-menu-item" onClick={() => handleItemClick(() => onNavigate('bids'))}>
            <div className="drawer-icon-circle"><ListOrdered size={18} /></div>
            <span>{t('menu_bid_history')}</span>
          </li>

          <li className="drawer-menu-item" onClick={() => handleItemClick(() => onNavigate('passbook'))}>
            <div className="drawer-icon-circle"><Receipt size={18} /></div>
            <span>{t('menu_passbook')}</span>
          </li>

          <li className="drawer-menu-item" onClick={() => handleItemClick(() => onNavigate('panel-chart'))}>
            <div className="drawer-icon-circle"><Grid size={18} /></div>
            <span>{t('menu_panel_chart')}</span>
          </li>

          <li className="drawer-menu-item" onClick={() => handleItemClick(() => onNavigate('landing'))}>
            <div className="drawer-icon-circle"><Download size={18} /></div>
            <span>{t('menu_latest_app')}</span>
          </li>

          <li className="drawer-menu-item" onClick={() => handleItemClick(() => onNavigate('languages'))}>
            <div className="drawer-icon-circle"><Languages size={18} /></div>
            <span>{t('menu_languages')}</span>
          </li>

          <li className="drawer-menu-item" onClick={() => handleItemClick(() => {
            if (navigator.share) {
              navigator.share({
                title: 'JANTA555',
                text: 'Play Online Matka on JANTA555 with best rates and instant withdrawals!',
                url: window.location.origin
              }).catch(() => {});
            } else {
              navigator.clipboard?.writeText(window.location.origin);
              alert('Referral link copied to clipboard!');
            }
          })}>
            <div className="drawer-icon-circle"><Share2 size={18} /></div>
            <span>{t('menu_referral')}</span>
          </li>

          {user ? (
            <li className="drawer-menu-item" style={{ color: '#EF4444' }} onClick={() => handleItemClick(onLogout)}>
              <div className="drawer-icon-circle" style={{ backgroundColor: '#EF4444' }}><LogOut size={18} /></div>
              <span>{t('menu_logout')}</span>
            </li>
          ) : (
            <li className="drawer-menu-item" style={{ color: '#10B981' }} onClick={() => handleItemClick(onLoginClick)}>
              <div className="drawer-icon-circle" style={{ backgroundColor: '#10B981' }}><LogIn size={18} /></div>
              <span>{t('menu_login_reg')}</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
