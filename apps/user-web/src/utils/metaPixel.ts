// Meta (Facebook) Pixel Integration Utility for GoldMatka
declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

let activePixelId: string = '2066705063996932';

/**
 * Initialize or reconfigure Meta Pixel with a specific Pixel ID
 */
export const initMetaPixel = (pixelId?: string) => {
  if (typeof window === 'undefined') return;
  const targetId = pixelId?.trim() || activePixelId;
  activePixelId = targetId;

  if (!window.fbq) {
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  }

  try {
    window.fbq('init', targetId);
    console.log(`[Meta Pixel] Initialized with ID: ${targetId}`);
  } catch (err) {
    console.warn('[Meta Pixel] Init error:', err);
  }
};

/**
 * Track standard Meta Pixel Event
 */
export const trackMetaEvent = (eventName: string, params?: Record<string, any>) => {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      if (params) {
        window.fbq('track', eventName, params);
      } else {
        window.fbq('track', eventName);
      }
      console.log(`[Meta Pixel] Event: ${eventName}`, params || '');
    }
  } catch (err) {
    console.warn(`[Meta Pixel] Track failed for ${eventName}:`, err);
  }
};

/**
 * Track custom Meta Pixel Event
 */
export const trackCustomEvent = (eventName: string, params?: Record<string, any>) => {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      if (params) {
        window.fbq('trackCustom', eventName, params);
      } else {
        window.fbq('trackCustom', eventName);
      }
      console.log(`[Meta Pixel] Custom Event: ${eventName}`, params || '');
    }
  } catch (err) {
    console.warn(`[Meta Pixel] Custom track failed for ${eventName}:`, err);
  }
};

// Specialized Event Shortcuts
export const trackPageView = (pageName?: string) => {
  trackMetaEvent('PageView', pageName ? { page_name: pageName } : undefined);
};

export const trackRegistration = (phone?: string) => {
  trackMetaEvent('CompleteRegistration', {
    content_name: 'User Registration',
    status: 'success',
    phone: phone ? phone.slice(0, 4) + '****' : undefined
  });
};

export const trackInitiateCheckout = (amount?: number) => {
  trackMetaEvent('InitiateCheckout', {
    currency: 'INR',
    value: amount || 500,
    content_name: 'Deposit Intent'
  });
};

export const trackAddPaymentInfo = (method: string = 'UPI', amount?: number) => {
  trackMetaEvent('AddPaymentInfo', {
    currency: 'INR',
    value: amount,
    payment_method: method
  });
};

export const trackDepositPurchase = (amount: number, utr?: string) => {
  trackMetaEvent('Purchase', {
    currency: 'INR',
    value: amount,
    content_type: 'wallet_deposit',
    transaction_id: utr || `DEP_${Date.now()}`
  });
};

export const trackContact = (channel: string = 'whatsapp') => {
  trackMetaEvent('Contact', {
    channel: channel,
    content_category: 'Customer Support'
  });
};

export const trackApkDownload = () => {
  trackMetaEvent('Lead', {
    content_name: 'GoldMatka Official APK Download',
    content_category: 'Android App Download'
  });
  trackCustomEvent('ApkDownloadClick', {
    app: 'GoldMatka',
    platform: 'Android'
  });
};

