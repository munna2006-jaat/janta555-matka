import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { SidebarDrawer } from './components/SidebarDrawer';
import { MarketCard, MarketItem, WhatsAppIcon } from './components/MarketCard';
import { CategorySelection, GameCategory } from './components/CategorySelection';
import { BetPlacementModal } from './components/BetPlacementModal';
import { FundsScreen } from './components/FundsScreen';
import { AddPointsScreen } from './components/AddPointsScreen';
import { WithdrawScreen } from './components/WithdrawScreen';
import { PassbookScreen } from './components/PassbookScreen';
import { BankDetailsScreen } from './components/BankDetailsScreen';
import { MyBidsScreen } from './components/MyBidsScreen';
import { AuthModal } from './components/AuthModal';
import { RecentWinnersFeed } from './components/RecentWinnersFeed';
import { GameRatesView, SupportView } from './components/InfoPages';
import { MatkaRatesSection } from './components/MatkaRatesSection';
import { ProfileScreen } from './components/ProfileScreen';
import { HowToPlayScreen } from './components/HowToPlayScreen';
import { WinningHistoryScreen } from './components/WinningHistoryScreen';
import { PanelChartScreen } from './components/PanelChartScreen';
import { LatestAppScreen } from './components/LatestAppScreen';
import { LanguagesScreen } from './components/LanguagesScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { MarketClosedToast } from './components/MarketClosedToast';
import { DisawarScreen } from './components/DisawarScreen';
import { DisawarBettingScreen } from './components/DisawarBettingScreen';
import { LandingPage } from './components/LandingPage';
import { ArrowUp, IndianRupee, Play } from 'lucide-react';
import { useLanguage } from './utils/translations';
import { initMetaPixel, trackPageView, trackContact } from './utils/metaPixel';
import { 
  playClickSound, 
  playTabSound, 
  playPopupSound, 
  playSuccessSound, 
  playClosedMarketSound 
} from './utils/soundEffects';

export const App: React.FC = () => {
  const { t } = useLanguage();

  // Auth state
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('janta555_token') || localStorage.getItem('goldmatka_token') || localStorage.getItem('guru777_token')
  );
  const [user, setUser] = useState<{ id: number; name: string; phone: string; wallet_balance: number; created_at?: string } | null>(null);
  const [guestBrowsing, setGuestBrowsing] = useState<boolean>(false);

  // Check initial URL parameters to support direct navigation like in reference video:
  // e.g. /jodi-chart?cname=GOLDEN or /panel?cname=GOLDEN or /result or /chart or ?view=chart or /landing
  const initialUrlConfig = useMemo(() => {
    try {
      const path = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const isLanding = path.includes('landing') || params.get('view') === 'landing' || params.get('page') === 'landing';
      const isChart = path.includes('chart') || path.includes('result') || path.includes('panel') || params.get('view') === 'chart' || params.get('view') === 'result' || params.has('cname');
      const mode: 'jodi' | 'panel' = (path.includes('panel') || params.get('mode') === 'panel') ? 'panel' : 'jodi';
      const cname = params.get('cname') || params.get('market');
      return { isLanding, isChart, mode, cname };
    } catch {
      return { isLanding: false, isChart: false, mode: 'jodi' as const, cname: null };
    }
  }, []);

  // App Navigation
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [currentView, setCurrentView] = useState<string>(() => {
    if (initialUrlConfig.isLanding) return 'landing';
    if (initialUrlConfig.isChart) return 'panel-chart';
    return 'home';
  });
  const [chartInitialMode, setChartInitialMode] = useState<'jodi' | 'panel'>(() => initialUrlConfig.mode);

  // Markets
  const [markets, setMarkets] = useState<MarketItem[]>([]);
  const [loadingMarkets, setLoadingMarkets] = useState(true);

  // Settings / Notice
  const [settings, setSettings] = useState<any>(null);

  // Modals & Sub-views
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeMarketForCategories, setActiveMarketForCategories] = useState<MarketItem | null>(null);
  const [activeCategoryForBet, setActiveCategoryForBet] = useState<GameCategory | null>(null);
  const [activeMarketForChart, setActiveMarketForChart] = useState<MarketItem | null>(null);
  const [activeDisawarMarket, setActiveDisawarMarket] = useState<any>(null);
  const [closedToastVisible, setClosedToastVisible] = useState(false);

  // Floating Back to Top visibility
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ========================================================
  // BROWSER & MOBILE HARDWARE BACK BUTTON INTEGRATION
  // Fixes: "kahi se bhi back kre to ek step piche he jaaye"
  // ========================================================
  const lastBackPressRef = useRef<number>(0);
  const [backToastMsg, setBackToastMsg] = useState<string | null>(null);

  const showBackExitToast = (msg: string) => {
    setBackToastMsg(msg);
    setTimeout(() => setBackToastMsg(null), 2000);
  };

  // State refs to prevent stale closures in popstate listener
  const activeCategoryForBetRef = useRef(activeCategoryForBet);
  activeCategoryForBetRef.current = activeCategoryForBet;

  const sidebarOpenRef = useRef(sidebarOpen);
  sidebarOpenRef.current = sidebarOpen;

  const authModalOpenRef = useRef(authModalOpen);
  authModalOpenRef.current = authModalOpen;

  const currentViewRef = useRef(currentView);
  currentViewRef.current = currentView;

  const currentTabRef = useRef(currentTab);
  currentTabRef.current = currentTab;

  // Modal Openers with history push
  const openAuthModal = () => {
    setAuthModalOpen(true);
    window.history.pushState({ modal: 'auth' }, '', window.location.pathname);
  };

  const closeAuthModal = () => {
    if (window.history.state && window.history.state.modal === 'auth') {
      window.history.back();
    } else {
      setAuthModalOpen(false);
    }
  };

  const openSidebar = () => {
    setSidebarOpen(true);
    window.history.pushState({ modal: 'sidebar' }, '', window.location.pathname);
  };

  const closeSidebar = () => {
    if (window.history.state && window.history.state.modal === 'sidebar') {
      window.history.back();
    } else {
      setSidebarOpen(false);
    }
  };

  const openBetModal = (cat: GameCategory) => {
    setActiveCategoryForBet(cat);
    window.history.pushState({ modal: 'bet', categoryId: cat.id }, '', window.location.pathname);
  };

  const closeBetModal = () => {
    if (window.history.state && window.history.state.modal === 'bet') {
      window.history.back();
    } else {
      setActiveCategoryForBet(null);
    }
  };

  const navigateTo = (view: string, tab: NavTab = 'home', extra: { marketForCategories?: MarketItem | null; marketForChart?: MarketItem | null } = {}) => {
    setCurrentTab(tab);
    setCurrentView(view);
    if (extra.marketForCategories !== undefined) setActiveMarketForCategories(extra.marketForCategories);
    if (extra.marketForChart !== undefined) setActiveMarketForChart(extra.marketForChart);

    const stateObj = {
      view,
      tab,
      marketForCategoriesId: extra.marketForCategories?.id || null,
      marketForChartId: extra.marketForChart?.id || null
    };
    window.history.pushState(stateObj, '', window.location.pathname);
    scrollToTop();
  };

  const navigateBack = useCallback(() => {
    // 1. If bet placement modal is open, close it (Step 1 back)
    if (activeCategoryForBetRef.current) {
      setActiveCategoryForBet(null);
      return true;
    }
    // 2. If sidebar drawer is open, close it (Step 1 back)
    if (sidebarOpenRef.current) {
      setSidebarOpen(false);
      return true;
    }
    // 3. If auth modal is open, close it (Step 1 back)
    if (authModalOpenRef.current) {
      setAuthModalOpen(false);
      return true;
    }
    // 4. Subview: Category selection -> go back to Home
    if (activeMarketForCategories) {
      setActiveMarketForCategories(null);
      setCurrentTab('home');
      setCurrentView('home');
      scrollToTop();
      return true;
    }
    // 5. Subview: Chart -> go back to Home
    if (activeMarketForChart || currentView === 'panel-chart') {
      setActiveMarketForChart(null);
      setCurrentTab('home');
      setCurrentView('home');
      scrollToTop();
      return true;
    }
    // 6. Subview: Disawar betting -> go back to disawar market list
    if (currentView === 'disawar-betting') {
      setCurrentView('disawar');
      scrollToTop();
      return true;
    }
    // 7. Non-home view or tab -> return to Home dashboard
    if (currentView !== 'home' || currentTab !== 'home') {
      setActiveMarketForCategories(null);
      setActiveMarketForChart(null);
      setActiveDisawarMarket(null);
      setCurrentTab('home');
      setCurrentView('home');
      scrollToTop();
      return true;
    }
    return false;
  }, [activeMarketForCategories, activeMarketForChart, currentView, currentTab]);

  // Expose global navigator for Android WebView bridge
  useEffect(() => {
    (window as any).__janta555_navigate_back = navigateBack;
    (window as any).__goldmatka_navigate_back = navigateBack;
    return () => {
      delete (window as any).__janta555_navigate_back;
      delete (window as any).__goldmatka_navigate_back;
    };
  }, [navigateBack]);

  // Listen to popstate event (mobile swipe gesture, hardware back & browser back)
  useEffect(() => {
    // Ensure initial entry exists so first back press does not immediately leave the webview/app
    if (!window.history.state) {
      window.history.replaceState({ root: true, view: 'home', tab: 'home' }, '', window.location.pathname);
      window.history.pushState({ root: false, view: 'home', tab: 'home' }, '', window.location.pathname);
    }

    const handlePopState = (e: PopStateEvent) => {
      const handled = navigateBack();
      if (!handled) {
        // Already at root Home screen: prevent accidental exit
        const now = Date.now();
        if (now - lastBackPressRef.current < 2000) {
          return; // Double tap within 2s -> allow browser/system to exit
        } else {
          lastBackPressRef.current = now;
          showBackExitToast("Press BACK again to exit JANTA555");
          window.history.pushState({ root: true, view: 'home', tab: 'home' }, '', window.location.pathname);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigateBack]);

  // Fetch Current User
  useEffect(() => {
    if (token) {
      fetch('/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            localStorage.removeItem('janta555_token');
            localStorage.removeItem('goldmatka_token');
            localStorage.removeItem('guru777_token');
            setToken(null);
            setUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('janta555_token');
          localStorage.removeItem('goldmatka_token');
          localStorage.removeItem('guru777_token');
          setToken(null);
          setUser(null);
        });
    }
  }, [token]);

  const [isRefreshingData, setIsRefreshingData] = useState(false);

  const handleRefreshUserData = async () => {
    setIsRefreshingData(true);
    try {
      if (token) {
        const res = await fetch('/api/v1/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      }
      fetchMarkets();
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setTimeout(() => setIsRefreshingData(false), 600);
    }
  };

  // Auto-refresh user balance every 15 seconds so approved deposits reflect automatically
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      fetch('/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setUser(data.user);
          }
        })
        .catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [token]);
  const fetchMarkets = () => {
    fetch('/api/v1/markets')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMarkets(data.markets);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingMarkets(false));
  };

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-select market if cname was in URL (e.g. /jodi-chart?cname=GOLDEN)
  useEffect(() => {
    if (initialUrlConfig.isChart && initialUrlConfig.cname && markets.length > 0 && !activeMarketForChart) {
      const matched = markets.find(m => m.name.toUpperCase() === initialUrlConfig.cname?.toUpperCase());
      if (matched) {
        setActiveMarketForChart(matched);
      }
    }
  }, [markets, initialUrlConfig]);

  // Fetch Public Settings / Ticker & Meta Pixel
  useEffect(() => {
    fetch('/api/v1/wallet/config')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSettings(data.config);
          if (data.config?.meta_pixel_id) {
            initMetaPixel(data.config.meta_pixel_id);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Track Meta Pixel PageView on View/Tab Navigation
  useEffect(() => {
    trackPageView(`${currentTab}/${currentView}`);
  }, [currentTab, currentView]);

  // Handle Scroll for Back to Top
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthSuccess = (newToken: string, newUser: any) => {
    playSuccessSound();
    localStorage.setItem('janta555_token', newToken);
    localStorage.setItem('goldmatka_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    playClickSound();
    localStorage.removeItem('janta555_token');
    localStorage.removeItem('goldmatka_token');
    localStorage.removeItem('guru777_token');
    setToken(null);
    setUser(null);
    setGuestBrowsing(false);
    setCurrentTab('home');
    setCurrentView('home');
  };

  const handleTabChange = (tab: NavTab) => {
    setActiveMarketForCategories(null);
    setActiveMarketForChart(null);
    if (tab === 'home') navigateTo('home', 'home');
    else if (tab === 'funds') navigateTo('add-points', 'funds');
    else if (tab === 'bank') navigateTo('bank', 'bank');
    else if (tab === 'bids') navigateTo('bids', 'bids');
    else if (tab === 'support') navigateTo('support', 'support');
  };

  const handlePlayMarket = (market: MarketItem) => {
    navigateTo('category-selection', currentTab, { marketForCategories: market });
  };

  const handleCategorySelect = (cat: GameCategory) => {
    if (!token) {
      playPopupSound();
      openAuthModal();
      return;
    }
    playClickSound();
    openBetModal(cat);
  };

  const handleBetSuccess = (newBalance: number) => {
    playSuccessSound();
    if (user) {
      setUser({ ...user, wallet_balance: newBalance });
    }
    fetchMarkets();
  };

  const refreshUserBalance = () => {
    if (!token) return;
    fetch('/api/v1/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) setUser(data.user);
      });
  };

  const handleMarketClosed = () => {
    playClosedMarketSound();
    setClosedToastVisible(true);
  };

  const userBalance = user ? user.wallet_balance : 0.00;
  const marqueeText = settings?.notice_text || 'FAST DEPOSIT • FAST WITHDRAWAL • 24x7 SUPPORT • 100% TRUSTED MATKA PLATFORM • THANK YOU';

  const isLandingView = currentView === 'landing' || currentView === 'install';

  // Landing Page view: Always accessible to anyone (logged in or guest or new visitor)
  if (isLandingView) {
    return (
      <div className="landing-root-wrap">
        <LandingPage
          onPlayOnline={() => {
            if (token) {
              navigateTo('home', 'home');
            } else {
              setGuestBrowsing(true);
              navigateTo('home', 'home');
            }
          }}
          whatsappNumber={settings?.whatsapp_number}
        />
      </div>
    );
  }

  // Opening Registration Screen matching Image 1 when not logged in
  if (!token && !guestBrowsing) {
    return (
      <div className="app-container">
        <RegisterScreen
          onSuccess={(newToken, newUser) => {
            handleAuthSuccess(newToken, newUser);
          }}
          onExploreAsGuest={() => {
            playClickSound();
            setGuestBrowsing(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Top Header (Hidden on Disawar and Landing screens which have their own dedicated headers) */}
      {currentView !== 'disawar' && currentView !== 'disawar-betting' && !isLandingView && (
        <>
          <Header
            balance={userBalance}
            canGoBack={currentTab !== 'home' || currentView !== 'home' || Boolean(activeMarketForCategories) || Boolean(activeMarketForChart)}
            onBack={navigateBack}
            onOpenMenu={() => {
              playPopupSound();
              openSidebar();
            }}
            onOpenFunds={() => handleTabChange('funds')}
            onOpenNotifications={() => { playClickSound(); }}
            onGoHome={() => handleTabChange('home')}
            onRefresh={handleRefreshUserData}
            isRefreshing={isRefreshingData}
            currentView={currentView}
            onNavigateView={(viewId) => {
              if (viewId === 'charts') navigateTo('panel-chart');
              else if (viewId === 'rates') navigateTo('game-rates');
              else if (viewId === 'how-to-play') navigateTo('how-to-play');
              else if (viewId === 'about') navigateTo('support');
              else if (viewId === 'home') handleTabChange('home');
            }}
          />

          {/* Scrolling Live Marquee Ticker */}
          <div className="ticker-strip">
            <div className="ticker-content">
              {marqueeText} • {marqueeText}
            </div>
          </div>
        </>
      )}

      {/* Main View Router */}
      {activeMarketForCategories ? (
        /* Subview: Category Selection */
        <CategorySelection
          market={activeMarketForCategories}
          balance={userBalance}
          onBack={navigateBack}
          onSelectCategory={handleCategorySelect}
        />
      ) : currentView === 'profile' ? (
        /* View: User Profile */
        <ProfileScreen
          user={user}
          token={token}
          onBack={navigateBack}
          onRequireLogin={() => {
            playPopupSound();
            openAuthModal();
          }}
          onNavigateFunds={() => handleTabChange('funds')}
          onNavigateBank={() => handleTabChange('bank')}
          onLogout={handleLogout}
          onRefreshUser={refreshUserBalance}
        />
      ) : currentView === 'how-to-play' ? (
        /* View: How to Play / Game Rules */
        <HowToPlayScreen onBack={navigateBack} />
      ) : currentView === 'winning-history' ? (
        /* View: Winning History */
        <WinningHistoryScreen
          token={token}
          onBack={navigateBack}
          onRequireLogin={() => {
            playPopupSound();
            openAuthModal();
          }}
        />
      ) : currentView === 'panel-chart' ? (
        /* View: Market Panel & Jodi Charts */
        <PanelChartScreen
          initialMarketId={activeMarketForChart?.id || null}
          initialMode={chartInitialMode}
          onBack={navigateBack}
          onPlayMarket={handlePlayMarket}
          onMarketClosedClick={handleMarketClosed}
        />
      ) : currentView === 'languages' ? (
        /* View: Languages */
        <LanguagesScreen onBack={navigateBack} />
      ) : currentView === 'add-points' ? (
        /* View: Dedicated Add Points Screen (Image 3 separation) */
        <AddPointsScreen
          balance={userBalance}
          token={token}
          onBack={navigateBack}
          onRefreshBalance={refreshUserBalance}
        />
      ) : currentView === 'withdraw' ? (
        /* View: Dedicated Withdraw Screen (Image 3 separation) */
        <WithdrawScreen
          balance={userBalance}
          token={token}
          onBack={navigateBack}
          onRefreshBalance={refreshUserBalance}
          onNavigateBank={() => handleTabChange('bank')}
        />
      ) : currentView === 'passbook' ? (
        /* View: Dedicated Passbook Screen (Moved from Wallet as requested) */
        <PassbookScreen
          balance={userBalance}
          token={token}
          onBack={navigateBack}
          onRequireLogin={() => {
            playPopupSound();
            openAuthModal();
          }}
        />
      ) : currentView === 'funds' ? (
        /* View: Fallback for funds -> Add Points */
        <AddPointsScreen
          balance={userBalance}
          token={token}
          onBack={navigateBack}
          onRefreshBalance={refreshUserBalance}
        />
      ) : currentView === 'bank' ? (
        /* View: Bank Details */
        <BankDetailsScreen
          token={token}
          onBack={navigateBack}
          onRequireLogin={() => {
            playPopupSound();
            openAuthModal();
          }}
        />
      ) : currentView === 'bids' ? (
        /* View: My Bids & History Hub (Frame 2) */
        <MyBidsScreen
          token={token}
          onBack={navigateBack}
          onRequireLogin={() => {
            playPopupSound();
            openAuthModal();
          }}
          onNavigateWinningHistory={() => navigateTo('winning-history', 'bids')}
          onNavigatePanelChart={() => navigateTo('panel-chart', 'bids')}
          onNavigatePassbook={() => navigateTo('passbook', 'bids')}
        />
      ) : currentView === 'game-rates' ? (
        /* View: Game Rates */
        <GameRatesView onBack={navigateBack} />
      ) : currentView === 'support' ? (
        /* View: Support */
        <SupportView
          onBack={navigateBack}
          whatsapp={settings?.whatsapp_number}
          phone={settings?.whatsapp_number}
        />
      ) : currentView === 'disawar' ? (
        /* View: Disawar Dedicated Screen (Matching Reference Video) */
        <DisawarScreen
          user={user}
          onBack={navigateBack}
          onOpenBetting={(disawarMarket) => {
            setActiveDisawarMarket(disawarMarket);
            navigateTo('disawar-betting', 'home');
          }}
          onOpenBidHistory={() => navigateTo('bids', 'home')}
          onOpenWinHistory={() => navigateTo('winning-history', 'home')}
        />
      ) : currentView === 'disawar-betting' && activeDisawarMarket ? (
        /* View: Disawar Betting Screen with Jodi, Crossing, Copy Paste */
        <DisawarBettingScreen
          market={activeDisawarMarket}
          user={user}
          token={token}
          onBack={navigateBack}
          onOpenAuth={() => {
            playPopupSound();
            openAuthModal();
          }}
          onOpenFunds={() => handleTabChange('funds')}
          onBetPlacedSuccess={(newBal) => {
            setUser((prev: any) => prev ? { ...prev, wallet_balance: newBal } : null);
          }}
        />
      ) : (
        /* View: Home Dashboard */
        <main className="main-content">
          {/* Quick Action Buttons (Under WITHDRAW is WhatsApp, DISAWAR next to it) */}
          <div className="quick-actions">
            <button
              className="action-card-btn btn-withdraw"
              onClick={() => {
                playClickSound();
                if (!token) openAuthModal();
                else navigateTo('withdraw', 'home');
              }}
            >
              <div className="action-icon-circle">
                <IndianRupee size={15} strokeWidth={3} />
              </div>
              <span>{t('withdraw')}</span>
            </button>

            <button
              className="action-card-btn btn-deposit"
              onClick={() => {
                playClickSound();
                if (!token) openAuthModal();
                else navigateTo('add-points', 'home');
              }}
            >
              <div className="action-icon-circle">
                <IndianRupee size={15} strokeWidth={3} />
              </div>
              <span>{t('add_points')}</span>
            </button>

            {/* ONLY WhatsApp button kept as requested by user ("jo widhtrwal k niche hai sirf wahi whatsapp wala button rehne de") */}
            <button
              className="action-card-btn btn-whatsapp"
              onClick={() => {
                playClickSound();
                trackContact('whatsapp');
                const wa = (settings?.whatsapp_number || '+919876543210').replace(/[^0-9]/g, '');
                window.open(`https://wa.me/${wa}?text=${encodeURIComponent('Hello Admin, I want to play on JANTA555')}`, '_blank');
              }}
            >
              <div className="action-icon-circle">
                <WhatsAppIcon size={16} color="white" />
              </div>
              <span>{t('whatsapp')}</span>
            </button>

            <button
              className="action-card-btn btn-starline"
              onClick={() => {
                playClickSound();
                navigateTo('disawar', 'home');
              }}
            >
              <div className="action-icon-circle">
                <Play size={15} fill="white" strokeWidth={0} />
              </div>
              <span>{t('disawar')}</span>
            </button>
          </div>

          {/* Category Tabs Strip (Matka / Starline / Jackpot matching Reference Image 1) */}
          <div className="janta-category-pills">
            <button
              type="button"
              className="janta-cat-pill active"
              onClick={() => playClickSound()}
            >
              Matka
            </button>
            <button
              type="button"
              className="janta-cat-pill"
              onClick={() => {
                playClickSound();
                navigateTo('disawar', 'home');
              }}
            >
              Starline
            </button>
            <button
              type="button"
              className="janta-cat-pill"
              onClick={() => {
                playClickSound();
                navigateTo('disawar', 'home');
              }}
            >
              Jackpot
            </button>
          </div>

          {/* Timing Strip matching Reference Image */}
          {markets.length > 0 && (
            <div className="home-timing-strip">
              <span>{t('open_time')}: {markets[0].open_time}</span>
              <span className="timing-sep">|</span>
              <span>{t('close_time')}: {markets[0].close_time}</span>
            </div>
          )}

          {/* Market Cards List (Excludes dedicated Disawar markets which appear in Disawar screen) */}
          <div style={{ marginTop: 10 }}>
            {loadingMarkets ? (
              <div style={{ textAlign: 'center', padding: 30, color: '#F59E0B', fontWeight: 800 }}>{t('loading_markets')}</div>
            ) : (
              markets
                .filter(m => !['DELHI BAZAR', 'SHREE GANESH', 'FARIDABAD', 'GAZIABAD', 'GALI', 'DESAWAR'].includes(m.name.toUpperCase()))
                .map(m => (
                  <MarketCard
                    key={m.id}
                    market={m}
                    onPlay={handlePlayMarket}
                    onOpenChart={market => {
                      playClickSound();
                      navigateTo('panel-chart', currentTab, { marketForChart: market });
                    }}
                    onOpenJodiChart={market => {
                      playClickSound();
                      setChartInitialMode('jodi');
                      navigateTo('panel-chart', currentTab, { marketForChart: market });
                    }}
                    onOpenPanelChart={market => {
                      playClickSound();
                      setChartInitialMode('panel');
                      navigateTo('panel-chart', currentTab, { marketForChart: market });
                    }}
                    onMarketClosedClick={handleMarketClosed}
                    whatsappNumber={settings?.whatsapp_number}
                  />
                ))
            )}
          </div>

          {/* Matka Rates Section matching Reference Image 1 */}
          <div style={{ marginTop: 24, marginBottom: 16 }}>
            <MatkaRatesSection onPlayClick={scrollToTop} />
          </div>

          {/* Recent Winners Feed */}
          <RecentWinnersFeed />
        </main>
      )}

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          className="back-to-top-btn"
          onClick={() => {
            playClickSound();
            scrollToTop();
          }}
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} strokeWidth={2.8} />
        </button>
      )}

      {/* Fixed Bottom Navigation (Hidden on Disawar Betting Screen and Landing Page) */}
      {currentView !== 'disawar-betting' && currentView !== 'landing' && currentView !== 'install' && (
        <BottomNav currentTab={currentTab} onTabChange={handleTabChange} />
      )}

      {/* Sidebar Drawer */}
      <SidebarDrawer
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        user={user}
        onNavigate={view => {
          setActiveMarketForCategories(null);
          setActiveMarketForChart(null);
          closeSidebar();
          if (view === 'home' || view === 'bids' || view === 'funds' || view === 'bank' || view === 'support') {
            handleTabChange(view as NavTab);
          } else {
            navigateTo(view, currentTab);
          }
        }}
        onLogout={handleLogout}
        onLoginClick={() => {
          playPopupSound();
          openAuthModal();
        }}
      />

      {/* Bet Placement Modal */}
      {activeMarketForCategories && activeCategoryForBet && (
        <BetPlacementModal
          market={activeMarketForCategories}
          category={activeCategoryForBet}
          userBalance={userBalance}
          token={token}
          onClose={closeBetModal}
          onSuccess={handleBetSuccess}
          onRequireLogin={() => {
            playPopupSound();
            openAuthModal();
          }}
        />
      )}

      {/* Login & Registration Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Market Closed Toast Alert Banner (Frame 19) */}
      <MarketClosedToast
        isVisible={closedToastVisible}
        onClose={() => setClosedToastVisible(false)}
      />

      {/* Floating Back Exit Toast */}
      {backToastMsg && (
        <div style={{
          position: 'fixed',
          bottom: 78,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#FDE047',
          padding: '8px 18px',
          borderRadius: 24,
          fontSize: 12.5,
          fontWeight: 800,
          zIndex: 99999,
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          border: '1.5px solid rgba(245, 158, 11, 0.6)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap'
        }}>
          {backToastMsg}
        </div>
      )}
    </div>
  );
};
