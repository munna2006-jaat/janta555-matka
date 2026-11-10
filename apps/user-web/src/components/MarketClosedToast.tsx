import React, { useEffect } from 'react';
import { Info } from 'lucide-react';

interface MarketClosedToastProps {
  message?: string;
  isVisible: boolean;
  onClose: () => void;
}

export const MarketClosedToast: React.FC<MarketClosedToastProps> = ({
  message = 'THIS GAME IS CURRENTLY CLOSED',
  isVisible,
  onClose
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="market-closed-toast-overlay" onClick={onClose}>
      <div className="market-closed-toast-pill" onClick={e => e.stopPropagation()}>
        <div className="toast-info-icon-circle">
          <Info size={16} strokeWidth={2.8} />
        </div>
        <span className="toast-text">{message}</span>
      </div>
    </div>
  );
};
