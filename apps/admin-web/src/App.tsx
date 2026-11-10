import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Crown, ArrowDown, ArrowUp, ArrowLeft, TrendingUp, LogOut, Download, 
  MessageSquare, Play, BarChart3, Users, Activity, UserX, 
  UserPlus, Award, ListFilter, RotateCcw, List, RefreshCw, 
  Landmark, Sliders, Smartphone, Bell, Gift, Percent, 
  KeyRound, HelpCircle, FileText, CheckCircle, XCircle, AlertCircle, 
  Search, ShieldAlert, Sparkles, Check, X, Calendar, Clock, Cpu, 
  DollarSign, ChevronRight, Upload, QrCode, Image, Eye, Radio, Copy, Plus,
  ShieldCheck, Trash2, ChevronDown, Lock, Shield, Globe, Menu,
  Gamepad2, Gavel, UserCheck
} from 'lucide-react';
import { calculateAnkFromPanna } from './utils/matkaUtils';

export const App: React.FC = () => {
  // Auth state
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('janta555_admin_token') || localStorage.getItem('goldmatka_admin_token') || localStorage.getItem('guru777_admin_token')
  );
  const [adminUser, setAdminUser] = useState<any>(null);

  // Live Clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Profile Dropdown
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Security & Active Devices / Sessions State
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [currPasswordInput, setCurrPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [changePassLoading, setChangePassLoading] = useState(false);
  const [changePassMsg, setChangePassMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Sub-Admins / Subordinates State
  const [subAdminsList, setSubAdminsList] = useState<any[]>([]);
  const [loadingSubAdmins, setLoadingSubAdmins] = useState(false);
  const [newSubUser, setNewSubUser] = useState('');
  const [newSubPass, setNewSubPass] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubRole, setNewSubRole] = useState<'ADMIN' | 'SUBORDINATE'>('SUBORDINATE');
  const [createSubLoading, setCreateSubLoading] = useState(false);
  const [subAdminMsg, setSubAdminMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Login inputs (Empty by default, no prefilled credentials)
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard stats
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [stats, setStats] = useState<any>(null);
  const [markets, setMarkets] = useState<any[]>([]);

  // Active Management Modal
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Modal Specific State
  // 1. Declare Result & Automation Tabs
  const [declareTab, setDeclareTab] = useState<'instant' | 'scheduled' | 'auto'>('instant');
  const [selectedMarketId, setSelectedMarketId] = useState<string>('1');
  const [openPannaInput, setOpenPannaInput] = useState('');
  const [closePannaInput, setClosePannaInput] = useState('');
  const [settlementResult, setSettlementResult] = useState<any>(null);
  const [settleLoading, setSettleLoading] = useState(false);

  // Pre-scheduled manual state
  const [schedOpenPanna, setSchedOpenPanna] = useState('');
  const [schedClosePanna, setSchedClosePanna] = useState('');
  const [schedMode, setSchedMode] = useState<'MANUAL' | 'SCHEDULED_MANUAL' | 'AUTOMATIC'>('SCHEDULED_MANUAL');
  const [autoAlgorithm, setAutoAlgorithm] = useState<'MIN_LIABILITY' | 'RANDOM_DRAW'>('MIN_LIABILITY');

  // 2. Rollback
  const [rollbackMarketId, setRollbackMarketId] = useState<string>('1');
  const [rollbackSuccess, setRollbackSuccess] = useState<string | null>(null);

  // 3. Deposits Management & Queues
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);
  const [depositStatusTab, setDepositStatusTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [depositSearch, setDepositSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // Satta King Live Auto-Sync State
  const [sattaKingStatus, setSattaKingStatus] = useState<any>(null);
  const [sattaKingSyncing, setSattaKingSyncing] = useState<boolean>(false);
  const [sattaKingMonthSyncing, setSattaKingMonthSyncing] = useState<boolean>(false);
  const [sattaKingMonthInput, setSattaKingMonthInput] = useState<string>(() => new Date().toISOString().slice(0, 7));

  // 4. Withdrawals Management & Queues
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
  const [withdrawalStatusTab, setWithdrawalStatusTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [withdrawalSearch, setWithdrawalSearch] = useState('');

  // 5. Users
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userFilterMode, setUserFilterMode] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');
  const [selectedUserForAdjust, setSelectedUserForAdjust] = useState<any>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(100);
  const [adjustType, setAdjustType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [adjustReason, setAdjustReason] = useState('');

  // 6. Bids & Ledgers
  const [allBids, setAllBids] = useState<any[]>([]);
  const [bidStatusFilter, setBidStatusFilter] = useState<'ALL' | 'PENDING' | 'WON' | 'LOST'>('ALL');
  const [bidSearch, setBidSearch] = useState('');

  // 7. Settings
  const [settingsData, setSettingsData] = useState<any>({});
  const [gameRates, setGameRates] = useState<any[]>([]);
  const [winnersList, setWinnersList] = useState<any[]>([]);
  const [testSmsPhone, setTestSmsPhone] = useState('');
  const [testingSms, setTestingSms] = useState(false);
  const [testSmsResult, setTestSmsResult] = useState<string | null>(null);

  // Reference Dashboard State (Matching Images 2 & 3)
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedBidGameId, setSelectedBidGameId] = useState<string>('');
  const [selectedAnkGameId, setSelectedAnkGameId] = useState<string>('');
  const [selectedAnkTime, setSelectedAnkTime] = useState<'OPEN' | 'CLOSE'>('OPEN');
  const [unapprovedSearch, setUnapprovedSearch] = useState('');
  const [unapprovedEntriesLimit, setUnapprovedEntriesLimit] = useState(10);
  const [userPermissionStates, setUserPermissionStates] = useState<Record<number, { betting: boolean, transfer: boolean, active: boolean }>>({
    1: { betting: true, transfer: true, active: true },
    2: { betting: true, transfer: true, active: true },
    3: { betting: true, transfer: true, active: true },
    4: { betting: true, transfer: true, active: true }
  });

  const toggleUserPermission = (userId: number, type: 'betting' | 'transfer' | 'active') => {
    setUserPermissionStates(prev => {
      const curr = prev[userId] || { betting: true, transfer: true, active: true };
      return {
        ...prev,
        [userId]: {
          ...curr,
          [type]: !curr[type]
        }
      };
    });
  };

  // Market List & Result Modification State
  const [marketSearch, setMarketSearch] = useState('');
  const [marketFilter, setMarketFilter] = useState<'ALL' | 'REGULAR' | 'DISAWAR' | 'ACTIVE' | 'MODIFIED'>('ALL');
  const [marketDateInput, setMarketDateInput] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedMarketForModify, setSelectedMarketForModify] = useState<any | null>(null);
  const [modifyOpenPanna, setModifyOpenPanna] = useState('');
  const [modifyClosePanna, setModifyClosePanna] = useState('');
  const [modifyJodi, setModifyJodi] = useState('');
  const [modifyLoading, setModifyLoading] = useState(false);

  // Create New Market State & Handlers
  const [showCreateMarketModal, setShowCreateMarketModal] = useState(false);
  const [createMarketLoading, setCreateMarketLoading] = useState(false);
  const [newMarketForm, setNewMarketForm] = useState({
    name: '',
    hindi_name: '',
    open_time: '10:00 AM',
    close_time: '11:00 AM',
    open_time_24: '10:00',
    close_time_24: '11:00',
    sort_order: 50,
    result_mode: 'MANUAL',
    is_active: 1
  });

  const convert24To12 = (time24: string) => {
    if (!time24) return '';
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  const handleCreateMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMarketForm.name.trim()) {
      alert('Kripya Market Name darj karein!');
      return;
    }
    if (!newMarketForm.open_time.trim() || !newMarketForm.close_time.trim()) {
      alert('Open Time aur Close Time dono zaroori hain!');
      return;
    }

    setCreateMarketLoading(true);
    try {
      const res = await fetch('/api/v1/admin/markets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newMarketForm)
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Market create karne me error aaya');
      }

      alert(data.message || 'Market successfully create ho gaya!');
      setShowCreateMarketModal(false);
      setNewMarketForm({
        name: '',
        hindi_name: '',
        open_time: '10:00 AM',
        close_time: '11:00 AM',
        open_time_24: '10:00',
        close_time_24: '11:00',
        sort_order: 50,
        result_mode: 'MANUAL',
        is_active: 1
      });
      fetchMarkets(marketDateInput);
      fetchStats();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreateMarketLoading(false);
    }
  };

  // 8. Clipboard helper
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyToClipboard = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Fetch Dashboard Stats & Markets
  useEffect(() => {
    if (token) {
      fetchStats();
      fetchMarkets();
      // Fetch admin user profile if not populated
      fetch('/api/v1/admin/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (res.status === 401) {
            handleLogout();
            return null;
          }
          return res.json();
        })
        .then(data => {
          if (data && data.success && data.admin) {
            setAdminUser(data.admin);
          }
        })
        .catch(console.error);
    }
  }, [token, dateFilter]);

  const fetchStats = () => {
    if (!token) return;
    fetch(`/api/v1/admin/dashboard-stats?filter=${dateFilter}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          handleLogout();
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.success) {
          setStats(data.stats);
        }
      })
      .catch(console.error);
  };

  const fetchMarkets = (targetDate?: string) => {
    if (!token) return;
    const dateQuery = targetDate || marketDateInput || new Date().toISOString().split('T')[0];
    fetch(`/api/v1/admin/markets?date=${dateQuery}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) {
          handleLogout();
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.success && Array.isArray(data.markets)) {
          setMarkets(data.markets);
          if (data.markets.length > 0 && selectedMarketId === '1') {
            setSelectedMarketId(data.markets[0].id.toString());
            setRollbackMarketId(data.markets[0].id.toString());
            setSchedOpenPanna(data.markets[0].scheduled_open_panna || '');
            setSchedClosePanna(data.markets[0].scheduled_close_panna || '');
            setSchedMode(data.markets[0].result_mode || 'MANUAL');
            setAutoAlgorithm(data.markets[0].auto_algorithm || 'MIN_LIABILITY');
          }
        }
      })
      .catch(console.error);
  };

  // Open Result Modifier for a Market
  const handleOpenModifyModal = (market: any) => {
    setSelectedMarketForModify(market);
    setModifyOpenPanna(market.open_panna || '');
    setModifyClosePanna(market.close_panna || '');
    setModifyJodi(market.jodi || '');
    window.history.pushState({ adminModal: 'modify-market' }, '', window.location.pathname);
  };

  // Submit Result Modification (Locks in Manual Override)
  const handleSaveModifiedResult = async () => {
    if (!selectedMarketForModify) return;
    setModifyLoading(true);

    const isDisawar = ['DELHI BAZAR', 'SHREE GANESH', 'FARIDABAD', 'GAZIABAD', 'GALI', 'DESAWAR'].includes(
      selectedMarketForModify.name.toUpperCase()
    );

    try {
      const res = await fetch(`/api/v1/admin/markets/${selectedMarketForModify.id}/modify-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: marketDateInput,
          openPanna: isDisawar ? null : (modifyOpenPanna || null),
          closePanna: isDisawar ? null : (modifyClosePanna || null),
          jodi: isDisawar ? modifyJodi : null
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to modify result');

      alert(data.message);
      setSelectedMarketForModify(null);
      fetchMarkets(marketDateInput);
      fetchStats();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setModifyLoading(false);
    }
  };

  // Reset Market Result to Automatic
  const handleResetMarketToAuto = async (market: any) => {
    if (!confirm(`Kya aap "${market.name}" ko wapas Automatic mode me reset karna chahte hain? Ab se iska result automatic sync/draw hoga.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/admin/markets/${market.id}/reset-result-auto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: marketDateInput })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to reset market');

      alert(data.message);
      fetchMarkets(marketDateInput);
      fetchStats();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const fetchDepositsList = (status: string = depositStatusTab) => {
    if (!token) return;
    fetch(`/api/v1/admin/deposits?status=${status}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) { handleLogout(); return null; }
        return res.json();
      })
      .then(data => {
        if (data && data.success && Array.isArray(data.deposits)) {
          setPendingDeposits(data.deposits);
        }
      })
      .catch(console.error);
  };

  const fetchWithdrawalsList = (status: string = withdrawalStatusTab) => {
    if (!token) return;
    fetch(`/api/v1/admin/withdrawals?status=${status}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) { handleLogout(); return null; }
        return res.json();
      })
      .then(data => {
        if (data && data.success && Array.isArray(data.withdrawals)) {
          setPendingWithdrawals(data.withdrawals);
        }
      })
      .catch(console.error);
  };

  // Real-time Auto-Polling (every 6 seconds): keeps stats, deposit & withdrawal queues live
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      fetchStats();
      if (activeModal === 'deposits') {
        fetchDepositsList(depositStatusTab);
      } else if (activeModal === 'withdrawals') {
        fetchWithdrawalsList(withdrawalStatusTab);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [token, activeModal, depositStatusTab, withdrawalStatusTab, dateFilter]);

  useEffect(() => {
    if (token && activeModal === 'deposits') {
      fetchDepositsList(depositStatusTab);
    }
  }, [depositStatusTab, activeModal, token]);

  useEffect(() => {
    if (token && activeModal === 'withdrawals') {
      fetchWithdrawalsList(withdrawalStatusTab);
    }
  }, [withdrawalStatusTab, activeModal, token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/v1/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Login failed');

      localStorage.setItem('janta555_admin_token', data.token);
      localStorage.setItem('goldmatka_admin_token', data.token);
      localStorage.removeItem('guru777_admin_token');
      setToken(data.token);
      setAdminUser(data.admin);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('janta555_admin_token');
    localStorage.removeItem('goldmatka_admin_token');
    localStorage.removeItem('guru777_admin_token');
    setToken(null);
    setAdminUser(null);
  };

  // Back button & history management
  const lastAdminBackPressRef = useRef<number>(0);
  const [adminBackToastMsg, setAdminBackToastMsg] = useState<string | null>(null);

  const showAdminBackExitToast = (msg: string) => {
    setAdminBackToastMsg(msg);
    setTimeout(() => setAdminBackToastMsg(null), 2000);
  };

  const activeModalRef = useRef(activeModal);
  activeModalRef.current = activeModal;

  const selectedReceiptRef = useRef(selectedReceipt);
  selectedReceiptRef.current = selectedReceipt;

  const showCreateMarketModalRef = useRef(showCreateMarketModal);
  showCreateMarketModalRef.current = showCreateMarketModal;

  const selectedMarketForModifyRef = useRef(selectedMarketForModify);
  selectedMarketForModifyRef.current = selectedMarketForModify;

  const profileDropdownOpenRef = useRef(profileDropdownOpen);
  profileDropdownOpenRef.current = profileDropdownOpen;

  const handleOpenReceipt = (receipt: any) => {
    setSelectedReceipt(receipt);
    window.history.pushState({ adminModal: 'receipt' }, '', window.location.pathname);
  };

  const handleCloseReceipt = () => {
    if (window.history.state && window.history.state.adminModal === 'receipt') {
      window.history.back();
    } else {
      setSelectedReceipt(null);
    }
  };

  const handleOpenCreateMarket = () => {
    setShowCreateMarketModal(true);
    window.history.pushState({ adminModal: 'create-market' }, '', window.location.pathname);
  };

  const handleCloseCreateMarket = () => {
    if (window.history.state && window.history.state.adminModal === 'create-market') {
      window.history.back();
    } else {
      setShowCreateMarketModal(false);
    }
  };

  const handleCloseModifyModal = () => {
    if (window.history.state && window.history.state.adminModal === 'modify-market') {
      window.history.back();
    } else {
      setSelectedMarketForModify(null);
    }
  };

  const handleCloseAdminModal = () => {
    setActiveModal(null);
    setSelectedReceipt(null);
    setShowCreateMarketModal(false);
    setSelectedMarketForModify(null);
    setProfileDropdownOpen(false);
    if (window.history.state && window.history.state.adminModal) {
      window.history.back();
    }
  };

  // Expose global navigator for WebView & hardware back
  useEffect(() => {
    const navBack = () => {
      if (selectedReceiptRef.current) {
        setSelectedReceipt(null);
        return true;
      }
      if (showCreateMarketModalRef.current) {
        setShowCreateMarketModal(false);
        return true;
      }
      if (selectedMarketForModifyRef.current) {
        setSelectedMarketForModify(null);
        return true;
      }
      if (profileDropdownOpenRef.current) {
        setProfileDropdownOpen(false);
        return true;
      }
      if (activeModalRef.current) {
        setActiveModal(null);
        return true;
      }
      return false;
    };
    (window as any).__janta555_navigate_back = navBack;
    (window as any).__goldmatka_navigate_back = navBack;
    return () => {
      delete (window as any).__janta555_navigate_back;
      delete (window as any).__goldmatka_navigate_back;
    };
  }, []);

  // Popstate listener for mobile hardware back button & swipe
  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({ root: true }, '', window.location.pathname);
      window.history.pushState({ root: false }, '', window.location.pathname);
    }

    const handleAdminPopState = (e: PopStateEvent) => {
      // 1. If viewing payment receipt, close it (goes back 1 step to deposits)
      if (selectedReceiptRef.current) {
        setSelectedReceipt(null);
        return;
      }
      // 2. If creating market modal is open, close it (goes back 1 step to market list)
      if (showCreateMarketModalRef.current) {
        setShowCreateMarketModal(false);
        return;
      }
      // 3. If modifying market modal is open, close it (goes back 1 step to market list)
      if (selectedMarketForModifyRef.current) {
        setSelectedMarketForModify(null);
        return;
      }
      // 4. If profile dropdown is open, close it
      if (profileDropdownOpenRef.current) {
        setProfileDropdownOpen(false);
        return;
      }
      // 5. If any admin modal is open, close it (goes back 1 step to dashboard)
      if (activeModalRef.current) {
        setActiveModal(null);
        return;
      }

      // 6. Root dashboard: double back to exit
      const now = Date.now();
      if (now - lastAdminBackPressRef.current < 2000) {
        return; // Allow exit
      } else {
        lastAdminBackPressRef.current = now;
        showAdminBackExitToast("Press BACK again to exit Admin Panel");
        window.history.pushState({ root: true }, '', window.location.pathname);
      }
    };

    window.addEventListener('popstate', handleAdminPopState);
    return () => window.removeEventListener('popstate', handleAdminPopState);
  }, []);

  // Open Specific Management Modals
  const handleOpenModal = (modalName: string) => {
    setActiveModal(modalName);
    window.history.pushState({ adminModal: modalName }, '', window.location.pathname);

    const fetchWithAuth = (url: string) => {
      return fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => {
          if (res.status === 401) {
            handleLogout();
            return null;
          }
          return res.json();
        });
    };

    if (modalName === 'deposits') {
      fetchDepositsList(depositStatusTab);
    } else if (modalName === 'withdrawals') {
      fetchWithdrawalsList(withdrawalStatusTab);
    } else if (modalName === 'users') {
      fetchWithAuth('/api/v1/admin/users')
        .then(data => { if (data && data.success && Array.isArray(data.users)) setUsersList(data.users); })
        .catch(console.error);
    } else if (modalName === 'bids' || modalName === 'bids-won') {
      fetchWithAuth('/api/v1/admin/bids')
        .then(data => { if (data && data.success && Array.isArray(data.bets)) setAllBids(data.bets); })
        .catch(console.error);
    } else if (['settings', 'limits', 'notice', 'whatsapp', 'banner', 'bonus', 'referral', 'chat', 'pixel'].includes(modalName)) {
      fetchWithAuth('/api/v1/admin/settings')
        .then(data => { if (data && data.success && data.settings) setSettingsData(data.settings); })
        .catch(console.error);
    } else if (modalName === 'rates') {
      fetchWithAuth('/api/v1/admin/game-rates')
        .then(data => { if (data && data.success && Array.isArray(data.rates)) setGameRates(data.rates); })
        .catch(console.error);
    } else if (modalName === 'winners') {
      fetch('/api/v1/results/recent-winners')
        .then(res => res.json())
        .then(data => { if (data && data.success && Array.isArray(data.winners)) setWinnersList(data.winners); })
        .catch(console.error);
    } else if (modalName === 'declare') {
      fetchWithAuth('/api/v1/admin/markets-automation')
        .then(data => { if (data && data.success && Array.isArray(data.markets)) setMarkets(data.markets); })
        .catch(console.error);
    } else if (modalName === 'markets' || modalName === 'market-list') {
      fetchMarkets();
    } else if (modalName === 'satta-king') {
      fetchWithAuth('/api/v1/admin/satta-king/status')
        .then(data => { if (data && data.success && data.status) setSattaKingStatus(data.status); })
        .catch(console.error);
    } else if (modalName === 'security') {
      fetchSessions();
    } else if (modalName === 'sub-admins') {
      fetchSubAdmins();
    }
  };

  // Sessions & Devices API Handlers
  const fetchSessions = () => {
    if (!token) return;
    setLoadingSessions(true);
    fetch('/api/v1/admin/sessions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          setSessions(data.sessions || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingSessions(false));
  };

  const handleRevokeSession = async (sessionId: number) => {
    if (!confirm('Kya aap is phone/device ko admin panel se logout karna chahte hain?')) return;
    try {
      const res = await fetch(`/api/v1/admin/sessions/${sessionId}/revoke`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to logout session');
      fetchSessions();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogoutAllOthers = async () => {
    if (!confirm('Kya aap baaki sabhi devices/phones se admin panel ko turant logout karna chahte hain?')) return;
    try {
      const res = await fetch('/api/v1/admin/sessions/logout-all-others', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to logout other devices');
      alert(data.message || 'Sabhi doosre devices se logout kar diya gaya hai!');
      fetchSessions();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePassMsg(null);
    if (!currPasswordInput || !newPasswordInput) {
      setChangePassMsg({ type: 'error', text: 'Kripya current aur new password dono darj karein!' });
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setChangePassMsg({ type: 'error', text: 'New password aur Confirm password match nahi ho rahe hain!' });
      return;
    }
    if (newPasswordInput.length < 6) {
      setChangePassMsg({ type: 'error', text: 'New password kam se kam 6 characters ka hona chahiye!' });
      return;
    }

    setChangePassLoading(true);
    try {
      const res = await fetch('/api/v1/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: currPasswordInput,
          newPassword: newPasswordInput
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to change password');
      setChangePassMsg({ type: 'success', text: data.message || 'Password successfully change ho gaya! Sabhi doosre devices logout ho gaye.' });
      setCurrPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      fetchSessions();
    } catch (err: any) {
      setChangePassMsg({ type: 'error', text: err.message });
    } finally {
      setChangePassLoading(false);
    }
  };

  // Sub-Admins API Handlers
  const fetchSubAdmins = () => {
    if (!token) return;
    setLoadingSubAdmins(true);
    fetch('/api/v1/admin/sub-admins', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          setSubAdminsList(data.subAdmins || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingSubAdmins(false));
  };

  const handleCreateSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubAdminMsg(null);
    if (!newSubUser.trim() || !newSubPass.trim()) {
      setSubAdminMsg({ type: 'error', text: 'Username aur Password dono zaroori hain!' });
      return;
    }
    setCreateSubLoading(true);
    try {
      const res = await fetch('/api/v1/admin/create-sub-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: newSubUser.trim(),
          password: newSubPass.trim(),
          fullName: newSubName.trim() || newSubUser.trim(),
          role: newSubRole,
          permissions: newSubRole === 'SUBORDINATE' ? ['markets', 'deposits', 'withdrawals', 'bids'] : ['all']
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to create sub-admin');
      setSubAdminMsg({ type: 'success', text: data.message || 'Naya Sub-Admin/Subordinate successfully create ho gaya!' });
      setNewSubUser('');
      setNewSubPass('');
      setNewSubName('');
      fetchSubAdmins();
    } catch (err: any) {
      setSubAdminMsg({ type: 'error', text: err.message });
    } finally {
      setCreateSubLoading(false);
    }
  };

  const handleDeleteSubAdmin = async (id: number) => {
    if (!confirm('Kya aap is subordinate/sub-admin ko delete karna chahte hain? Iska access turant band ho jayega.')) return;
    try {
      const res = await fetch(`/api/v1/admin/sub-admins/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to delete');
      alert(data.message || 'Sub-admin successfully deleted!');
      fetchSubAdmins();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Satta King Manual Sync Handlers
  const handleSyncSattaKingNow = async () => {
    setSattaKingSyncing(true);
    try {
      const res = await fetch('/api/v1/admin/satta-king/sync-now', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status) {
        setSattaKingStatus(data.status);
      }
      alert(data.message || 'Live sync completed!');
      fetchStats();
      fetchMarkets();
    } catch (err: any) {
      alert('Sync failed: ' + (err.message || 'Network error'));
    } finally {
      setSattaKingSyncing(false);
    }
  };

  const handleSyncSattaKingMonth = async (ym: string) => {
    setSattaKingMonthSyncing(true);
    try {
      const res = await fetch('/api/v1/admin/satta-king/sync-month', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ yearMonth: ym })
      });
      const data = await res.json();
      alert(data.message || 'Monthly chart sync completed!');
      fetchStats();
      fetchMarkets();
    } catch (err: any) {
      alert('Monthly chart sync failed: ' + (err.message || 'Network error'));
    } finally {
      setSattaKingMonthSyncing(false);
    }
  };

  // 1. Declare Result (Instant Manual)
  const handleDeclareInstant = async () => {
    setSettleLoading(true);
    setSettlementResult(null);

    const openDigit = openPannaInput.length === 3 ? calculateAnkFromPanna(openPannaInput) : null;
    const closeDigit = closePannaInput.length === 3 ? calculateAnkFromPanna(closePannaInput) : null;

    try {
      const res = await fetch('/api/v1/admin/declare-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          marketId: selectedMarketId,
          openPanna: openPannaInput || null,
          openDigit,
          closeDigit,
          closePanna: closePannaInput || null
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to settle');

      setSettlementResult(data);
      fetchStats();
      fetchMarkets();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSettleLoading(false);
    }
  };

  // 2. Save Pre-Scheduled Result or Auto-Mode for a Market
  const handleSaveAutomation = async () => {
    try {
      const res = await fetch(`/api/v1/admin/markets/${selectedMarketId}/automation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          result_mode: schedMode,
          auto_algorithm: autoAlgorithm,
          scheduled_open_panna: schedOpenPanna || null,
          scheduled_close_panna: schedClosePanna || null
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      alert(`Automation Configuration Saved!\nMode: ${schedMode}\nWhen time comes, system will automatically execute.`);
      fetchMarkets();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 3. Rollback Result
  const handleRollback = async () => {
    if (!confirm('Are you sure you want to rollback this result? All win payouts will be reversed from user wallets.')) return;

    try {
      const res = await fetch('/api/v1/admin/rollback-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ marketId: rollbackMarketId })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      setRollbackSuccess(data.message);
      fetchStats();
      fetchMarkets();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 4. Approve / Reject Deposit
  const handleApproveDeposit = async (id: number) => {
    try {
      const res = await fetch(`/api/v1/admin/deposits/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setPendingDeposits((Array.isArray(pendingDeposits) ? pendingDeposits : []).filter(d => d.id !== id));
      fetchStats();
      fetchDepositsList(depositStatusTab);
      alert(data.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRejectDeposit = async (id: number) => {
    const reason = prompt('Enter reason for rejection:', 'Invalid UTR / Payment not received');
    if (!reason) return;

    try {
      const res = await fetch(`/api/v1/admin/deposits/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setPendingDeposits((Array.isArray(pendingDeposits) ? pendingDeposits : []).filter(d => d.id !== id));
      fetchStats();
      fetchDepositsList(depositStatusTab);
      alert('Deposit rejected.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 5. Approve / Reject Withdrawal
  const handleApproveWithdrawal = async (id: number) => {
    const ref = prompt('Enter Bank / UPI Transaction Reference:', `TXN${Date.now()}`);
    if (!ref) return;

    try {
      const res = await fetch(`/api/v1/admin/withdrawals/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reference: ref })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setPendingWithdrawals((Array.isArray(pendingWithdrawals) ? pendingWithdrawals : []).filter(w => w.id !== id));
      fetchStats();
      fetchWithdrawalsList(withdrawalStatusTab);
      alert('Withdrawal marked as paid.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRejectWithdrawal = async (id: number) => {
    const reason = prompt('Enter reason for rejection (Funds will be refunded to user wallet):', 'Incorrect bank IFSC / account number');
    if (!reason) return;

    try {
      const res = await fetch(`/api/v1/admin/withdrawals/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setPendingWithdrawals((Array.isArray(pendingWithdrawals) ? pendingWithdrawals : []).filter(w => w.id !== id));
      fetchStats();
      fetchWithdrawalsList(withdrawalStatusTab);
      alert(data.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 6. User Status Toggle & Adjust
  const handleToggleUserStatus = async (userId: number) => {
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setUsersList((Array.isArray(usersList) ? usersList : []).map(u => u.id === userId ? { ...u, status: data.newStatus } : u));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdjustWallet = async () => {
    if (!selectedUserForAdjust) return;

    try {
      const res = await fetch(`/api/v1/admin/users/${selectedUserForAdjust.id}/adjust-wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          amount: adjustAmount,
          type: adjustType,
          reason: adjustReason || 'Admin Manual Adjustment'
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      alert(data.message);
      setSelectedUserForAdjust(null);
      handleOpenModal('users');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 7. Save Settings
  const handleSaveSettings = async (updates: any) => {
    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      alert('Settings saved successfully!');
      setActiveModal(null);
      fetchStats();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSendTestSms = async () => {
    if (!testSmsPhone || testSmsPhone.length !== 10) {
      alert('Please enter a 10-digit mobile number to test.');
      return;
    }
    setTestingSms(true);
    setTestSmsResult(null);
    try {
      const res = await fetch('/api/v1/admin/sms/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ phone: testSmsPhone })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'SMS test failed');
      setTestSmsResult(`✅ OTP ${data.testOtp} sent successfully to ${testSmsPhone}!`);
    } catch (err: any) {
      setTestSmsResult(`❌ Failed: ${err.message}`);
    } finally {
      setTestingSms(false);
    }
  };

  // IF NOT LOGGED IN -> RENDER LOGIN FORM
  if (!token) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}>
        <div style={{
          width: '100%',
          maxWidth: 400,
          background: 'white',
          borderRadius: 20,
          padding: 24,
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          textAlign: 'center'
        }}>
          <div style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: '#FEF3C7',
            color: '#D97706',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12
          }}>
            <Crown size={28} />
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0F172A', marginBottom: 4 }}>
            JANTA555 Master Admin
          </h2>
          <p style={{ fontSize: 12, color: '#64748B', marginBottom: 20 }}>
            Enter Master Credentials to Access Control Panel
          </p>

          {loginError && (
            <div style={{
              background: '#FEE2E2',
              color: '#DC2626',
              padding: '10px 14px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16
            }}>
              <AlertCircle size={18} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ textAlign: 'left' }} autoComplete="off">
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                Username:
              </label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Enter Admin Username"
                autoComplete="off"
                value={usernameInput}
                onChange={e => setUsernameInput(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                Password:
              </label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="Enter Admin Password"
                autoComplete="new-password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loginLoading}>
              {loginLoading ? 'Authenticating...' : 'LOGIN TO ADMIN PANEL'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Previews
  const openAnkPreview = (openPannaInput && openPannaInput.length === 3) ? calculateAnkFromPanna(openPannaInput) : '*';
  const closeAnkPreview = (closePannaInput && closePannaInput.length === 3) ? calculateAnkFromPanna(closePannaInput) : '*';
  const jodiPreview = (openAnkPreview !== '*' && closeAnkPreview !== '*') ? `${openAnkPreview}${closeAnkPreview}` : '**';

  const marketListSafe = Array.isArray(markets) ? markets : [];
  const selectedMarketObj = marketListSafe.find(m => m && m.id && m.id.toString() === selectedMarketId) || marketListSafe[0] || null;

  // Ank Stats for Ank 0 through 9
  const ankStats = useMemo(() => {
    const counts: Record<number, { count: number, amount: number }> = {};
    for (let i = 0; i <= 9; i++) counts[i] = { count: 0, amount: 0 };
    if (Array.isArray(allBids)) {
      allBids.forEach(b => {
        if (!selectedAnkGameId || b.market_id?.toString() === selectedAnkGameId.toString()) {
          const num = parseInt(b.digit || b.bet_number, 10);
          if (!isNaN(num) && num >= 0 && num <= 9) {
            counts[num].count += 1;
            counts[num].amount += (Number(b.amount) || 0);
          }
        }
      });
    }
    return counts;
  }, [allBids, selectedAnkGameId]);

  // Market Bid Details total amount
  const selectedMarketTotalBidAmount = useMemo(() => {
    if (!selectedBidGameId) return 'N/A';
    if (!Array.isArray(allBids)) return '₹0';
    const total = allBids
      .filter(b => b.market_id?.toString() === selectedBidGameId.toString())
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    return `₹${total.toLocaleString('en-IN')}`;
  }, [allBids, selectedBidGameId]);

  // Unapproved users list with fallback data matching reference Image 2
  const defaultUnapprovedUsers = [
    { id: 1, name: 'Kk', phone: '8103878199', email: 'temp@gmail.com', created_at: '2026-09-03', wallet_balance: 2000 },
    { id: 2, name: 'Faran', phone: '7398757997', email: 'temp@gmail.com', created_at: '2026-09-01', wallet_balance: 1005 },
    { id: 3, name: 'Danish', phone: '8800911099', email: 'temp@gmail.com', created_at: '2026-09-01', wallet_balance: 5 },
    { id: 4, name: 'Shaauk', phone: '7881146561', email: 'temp@gmail.com', created_at: '2026-09-01', wallet_balance: 1005 }
  ];

  const unapprovedSource = Array.isArray(usersList) && usersList.length > 0 ? usersList : defaultUnapprovedUsers;

  const filteredUnapprovedUsers = useMemo(() => {
    if (!unapprovedSearch.trim()) return unapprovedSource;
    const q = unapprovedSearch.toLowerCase();
    return unapprovedSource.filter(u => 
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  }, [unapprovedSource, unapprovedSearch]);

  return (
    <div className="gm-dashboard-container" style={{ background: '#F8FAFC' }}>
      {/* 1. LEFT SLEEK DARK SIDEBAR (Matching Reference Image 3) */}
      <aside className="ref-sidebar-dark" style={{ display: sidebarOpen ? 'flex' : 'none' }}>
        {/* Brand Header */}
        <div className="ref-sidebar-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 900, color: 'white' }}>
            <span style={{ color: '#0284C7' }}>JANTA</span>
            <span style={{ color: '#38BDF8' }}>555</span>
          </div>
          <span style={{ fontSize: 10, background: '#0284C7', color: 'white', padding: '2px 6px', borderRadius: 4, fontWeight: 800 }}>ADMIN</span>
        </div>

        {/* Sidebar Menu Items (Exact structure from Image 3) */}
        <div className="ref-sidebar-menu">
          {/* 1. Dashboards */}
          <button
            type="button"
            className={`ref-menu-item ${!activeModal ? 'active' : ''}`}
            onClick={handleCloseAdminModal}
          >
            <div className="ref-menu-item-left">
              <BarChart3 size={17} color="#38BDF8" />
              <span>Dashboards</span>
            </div>
          </button>

          {/* 2. Declare Result */}
          <button
            type="button"
            className={`ref-menu-item ${activeModal === 'declare' ? 'active' : ''}`}
            onClick={() => handleOpenModal('declare')}
          >
            <div className="ref-menu-item-left">
              <Award size={17} color="#F59E0B" />
              <span>Declare Result</span>
            </div>
          </button>

          {/* 3. Starline */}
          <button
            type="button"
            className={`ref-menu-item ${activeModal === 'satta-king' ? 'active' : ''}`}
            onClick={() => handleOpenModal('satta-king')}
          >
            <div className="ref-menu-item-left">
              <Sparkles size={17} color="#A855F7" />
              <span>Starline</span>
            </div>
            <ChevronDown size={14} color="#64748B" />
          </button>

          {/* 4. Gali Disawar */}
          <button
            type="button"
            className="ref-menu-item"
            onClick={() => handleOpenModal('market-list')}
          >
            <div className="ref-menu-item-left">
              <Radio size={17} color="#EC4899" />
              <span>Gali Disawar</span>
            </div>
            <ChevronDown size={14} color="#64748B" />
          </button>

          {/* 5. Report Management */}
          <button
            type="button"
            className={`ref-menu-item ${activeModal === 'bids' ? 'active' : ''}`}
            onClick={() => { setBidStatusFilter('ALL'); handleOpenModal('bids'); }}
          >
            <div className="ref-menu-item-left">
              <FileText size={17} color="#10B981" />
              <span>Report Management</span>
            </div>
            <ChevronDown size={14} color="#64748B" />
          </button>

          {/* 6. Wallet Management */}
          <button
            type="button"
            className={`ref-menu-item ${activeModal === 'deposits' || activeModal === 'withdrawals' ? 'active' : ''}`}
            onClick={() => { setDepositStatusTab('PENDING'); handleOpenModal('deposits'); }}
          >
            <div className="ref-menu-item-left">
              <Landmark size={17} color="#06B6D4" />
              <span>Wallet Management</span>
            </div>
            <ChevronDown size={14} color="#64748B" />
          </button>

          {/* 7. User Management */}
          <button
            type="button"
            className={`ref-menu-item ${activeModal === 'users' ? 'active' : ''}`}
            onClick={() => { setUserFilterMode('ALL'); handleOpenModal('users'); }}
          >
            <div className="ref-menu-item-left">
              <Users size={17} color="#3B82F6" />
              <span>User Management</span>
            </div>
          </button>

          {/* 8. Main Games */}
          <button
            type="button"
            className={`ref-menu-item ${activeModal === 'market-list' ? 'active' : ''}`}
            onClick={() => handleOpenModal('market-list')}
          >
            <div className="ref-menu-item-left">
              <Play size={17} color="#10B981" />
              <span>Main Games</span>
            </div>
            <ChevronDown size={14} color="#64748B" />
          </button>

          {/* 9. Game & Numbers */}
          <button
            type="button"
            className={`ref-menu-item ${activeModal === 'rates' ? 'active' : ''}`}
            onClick={() => handleOpenModal('rates')}
          >
            <div className="ref-menu-item-left">
              <Sliders size={17} color="#F97316" />
              <span>Game & Numbers</span>
            </div>
          </button>

          {/* 10. Notice Management */}
          <button
            type="button"
            className={`ref-menu-item ${activeModal === 'notice' ? 'active' : ''}`}
            onClick={() => handleOpenModal('notice')}
          >
            <div className="ref-menu-item-left">
              <Bell size={17} color="#EAB308" />
              <span>Notice Management</span>
            </div>
          </button>

          {/* 11. Users Query */}
          <button
            type="button"
            className={`ref-menu-item ${activeModal === 'whatsapp' ? 'active' : ''}`}
            onClick={() => handleOpenModal('whatsapp')}
          >
            <div className="ref-menu-item-left">
              <MessageSquare size={17} color="#06B6D4" />
              <span>Users Query</span>
            </div>
          </button>

          {/* 12. Settings */}
          <button
            type="button"
            className={`ref-menu-item ${activeModal === 'limits' || activeModal === 'pixel' ? 'active' : ''}`}
            onClick={() => handleOpenModal('limits')}
          >
            <div className="ref-menu-item-left">
              <Sliders size={17} color="#64748B" />
              <span>Settings</span>
            </div>
            <ChevronDown size={14} color="#64748B" />
          </button>

          {/* 13. Meta Pixel & Ads Quick Item */}
          <button
            type="button"
            className={`ref-menu-item ${activeModal === 'pixel' ? 'active' : ''}`}
            onClick={() => handleOpenModal('pixel')}
            style={{ background: 'rgba(37, 99, 235, 0.15)', border: '1px solid rgba(37, 99, 235, 0.3)', marginTop: 8 }}
          >
            <div className="ref-menu-item-left">
              <Globe size={17} color="#38BDF8" />
              <span style={{ color: '#38BDF8', fontWeight: 700 }}>Meta Pixel & Ads</span>
            </div>
            <span style={{ background: '#22C55E', color: 'white', fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>LIVE</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN LAYOUT */}
      <main className="gm-main-layout" style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
        {/* TOPBAR (Ref Image 2: Hamburger, Home, Notification Bell, Yellow Avatar) */}
        <header className="ref-admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              className="ref-hamburger-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Menu"
            >
              <Menu size={20} color="#1E293B" />
            </button>
            <span
              style={{ fontSize: 13, fontWeight: 700, color: '#334155', cursor: 'pointer' }}
              onClick={handleCloseAdminModal}
            >
              Home
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Notification Bell */}
            <button
              type="button"
              className="gm-notif-btn"
              onClick={() => { setDepositStatusTab('PENDING'); handleOpenModal('deposits'); }}
              title="Deposit & Withdrawal Requests"
              style={{
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                padding: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              <Bell size={18} color="#475569" />
              {((stats?.pendingDepositsCount || 0) + (stats?.pendingWithdrawalsCount || 0)) > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    background: '#EF4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: 18,
                    height: 18,
                    fontSize: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900
                  }}
                >
                  {(stats?.pendingDepositsCount || 0) + (stats?.pendingWithdrawalsCount || 0)}
                </span>
              )}
            </button>

            {/* Profile Avatar (Yellow/gold circular avatar matching Image 2) */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: '#FEF08A',
                  border: '2px solid #FDE047',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden'
                }}
                title="Admin Profile"
              >
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#CA8A04', margin: '0 auto' }}></div>
              </button>

              {profileDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    width: 200,
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                    padding: 8,
                    zIndex: 200
                  }}
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div style={{ padding: '8px 10px', borderBottom: '1px solid #F1F5F9', marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{adminUser?.username || 'admin'}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Role: Super Admin</div>
                  </div>
                  <button
                    type="button"
                    style={{ width: '100%', padding: '8px 10px', fontSize: 12, color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                    onClick={handleLogout}
                  >
                    <LogOut size={14} color="#EF4444" />
                    <span>Logout Panel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* BREADCRUMB BAR (DASHBOARD | Dashboards / Dashboard) */}
        <div className="ref-breadcrumb-bar">
          <span className="ref-page-title">DASHBOARD</span>
          <div className="ref-breadcrumbs">
            <span>Dashboards</span>
            <span style={{ color: '#CBD5E1' }}>/</span>
            <span style={{ color: '#64748B' }}>Dashboard</span>
          </div>
        </div>

        {/* 9 VIBRANT STAT CARDS (3x3 Grid Matching Reference Image 2) */}
        <div className="ref-stat-grid">
          {/* Card 1: Total User (Pink/Red: 25150) */}
          <div className="ref-stat-card pink" onClick={() => { setUserFilterMode('ALL'); handleOpenModal('users'); }}>
            <div>
              <div className="ref-stat-title">Total User</div>
              <div className="ref-stat-val">{(stats?.totalUsers || 25150).toLocaleString('en-IN')}</div>
            </div>
            <div className="ref-stat-icon-wrap">
              <Users size={22} />
            </div>
          </div>

          {/* Card 2: Games (Blue: 20) */}
          <div className="ref-stat-card blue" onClick={() => handleOpenModal('market-list')}>
            <div>
              <div className="ref-stat-title">Games</div>
              <div className="ref-stat-val">{markets.length || 20}</div>
            </div>
            <div className="ref-stat-icon-wrap">
              <Gamepad2 size={22} />
            </div>
          </div>

          {/* Card 3: Today Bid (Pink/Red: 30) */}
          <div className="ref-stat-card pink" onClick={() => { setBidStatusFilter('ALL'); handleOpenModal('bids'); }}>
            <div>
              <div className="ref-stat-title">Today Bid</div>
              <div className="ref-stat-val">{stats?.todayBidsCount || 30}</div>
            </div>
            <div className="ref-stat-icon-wrap">
              <Gavel size={22} />
            </div>
          </div>

          {/* Card 4: Today Win (Blue: 0) */}
          <div className="ref-stat-card blue" onClick={() => { setBidStatusFilter('WON'); handleOpenModal('bids'); }}>
            <div>
              <div className="ref-stat-title">Today Win</div>
              <div className="ref-stat-val">{stats?.todayWinsCount || 0}</div>
            </div>
            <div className="ref-stat-icon-wrap">
              <Award size={22} />
            </div>
          </div>

          {/* Card 5: Today Withdraw (Blue: 0) */}
          <div className="ref-stat-card blue" onClick={() => { setWithdrawalStatusTab('ALL'); handleOpenModal('withdrawals'); }}>
            <div>
              <div className="ref-stat-title">Today Withdraw</div>
              <div className="ref-stat-val">{stats?.todayWithdrawalsAmount || 0}</div>
            </div>
            <div className="ref-stat-icon-wrap">
              <ArrowDown size={22} />
            </div>
          </div>

          {/* Card 6: Today Play (Blue: 1) */}
          <div className="ref-stat-card blue" onClick={() => { setBidStatusFilter('ALL'); handleOpenModal('bids'); }}>
            <div>
              <div className="ref-stat-title">Today Play</div>
              <div className="ref-stat-val">{stats?.todayActivePlayers || 1}</div>
            </div>
            <div className="ref-stat-icon-wrap">
              <DollarSign size={22} />
            </div>
          </div>

          {/* Card 7: Today Deposit (Pink/Red: 300) */}
          <div className="ref-stat-card pink" onClick={() => { setDepositStatusTab('ALL'); handleOpenModal('deposits'); }}>
            <div>
              <div className="ref-stat-title">Today Deposit</div>
              <div className="ref-stat-val">{stats?.todayDepositsAmount || 300}</div>
            </div>
            <div className="ref-stat-icon-wrap">
              <Landmark size={22} />
            </div>
          </div>

          {/* Card 8: Today User (Blue: 1) */}
          <div className="ref-stat-card blue" onClick={() => { setUserFilterMode('ALL'); handleOpenModal('users'); }}>
            <div>
              <div className="ref-stat-title">Today User</div>
              <div className="ref-stat-val">{stats?.todayNewUsersCount || 1}</div>
            </div>
            <div className="ref-stat-icon-wrap">
              <UserCheck size={22} />
            </div>
          </div>

          {/* Card 9: Deposit Admin (Blue: 0) */}
          <div className="ref-stat-card blue" onClick={() => { setDepositStatusTab('ALL'); handleOpenModal('deposits'); }}>
            <div>
              <div className="ref-stat-title">Deposit Admin</div>
              <div className="ref-stat-val">{stats?.adminDepositsCount || 0}</div>
            </div>
            <div className="ref-stat-icon-wrap">
              <ShieldCheck size={22} />
            </div>
          </div>
        </div>

        {/* SECTION 2: MARKET BID DETAILS */}
        <div className="ref-section-card">
          <div className="ref-section-title">Market Bid Details</div>
          <div style={{ maxWidth: 500 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 6 }}>
              Game Name
            </label>
            <select
              value={selectedBidGameId}
              onChange={e => setSelectedBidGameId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: 13,
                color: '#334155',
                background: '#FFFFFF',
                outline: 'none',
                marginBottom: 12
              }}
            >
              <option value="">-Select Game Name-</option>
              {marketListSafe.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
              {selectedMarketTotalBidAmount}
            </div>
            <div style={{ fontSize: 11.5, color: '#64748B', fontWeight: 600 }}>
              Market Amount
            </div>
          </div>
        </div>

        {/* SECTION 3: TOTAL BIDS ON SINGLE ANK OF DATE */}
        <div className="ref-section-card">
          <div className="ref-section-title">
            Total Bids On Single Ank Of Date {currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, alignItems: 'flex-end', marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 6 }}>
                Game Name
              </label>
              <select
                value={selectedAnkGameId}
                onChange={e => setSelectedAnkGameId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  fontSize: 13,
                  color: '#334155',
                  background: '#FFFFFF',
                  outline: 'none'
                }}
              >
                <option value="">-Select Game Name-</option>
                {marketListSafe.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 6 }}>
                Market Time
              </label>
              <select
                value={selectedAnkTime}
                onChange={e => setSelectedAnkTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  fontSize: 13,
                  color: '#334155',
                  background: '#FFFFFF',
                  outline: 'none'
                }}
              >
                <option value="">-Select Market Time-</option>
                <option value="OPEN">OPEN</option>
                <option value="CLOSE">CLOSE</option>
              </select>
            </div>

            <div>
              <button
                type="button"
                style={{
                  background: '#0284C7',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 28px',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Get
              </button>
            </div>
          </div>

          {/* 10 COLORFUL ANK CARDS (0 to 9) */}
          <div className="ref-ank-grid">
            {[
              { num: 0, tagColor: '#3B82F6' },
              { num: 1, tagColor: '#10B981' },
              { num: 2, tagColor: '#0EA5E9' },
              { num: 3, tagColor: '#F59E0B' },
              { num: 4, tagColor: '#8B5CF6' },
              { num: 5, tagColor: '#F97316' },
              { num: 6, tagColor: '#EC4899' },
              { num: 7, tagColor: '#6366F1' },
              { num: 8, tagColor: '#F43F5E' },
              { num: 9, tagColor: '#14B8A6' },
            ].map(ank => (
              <div key={ank.num} className="ref-ank-card">
                <div className="ref-ank-top-header">
                  Total Bids {ankStats[ank.num]?.count || 0}
                </div>
                <div className="ref-ank-big-num">
                  {ankStats[ank.num]?.count || 0}
                </div>
                <div className="ref-ank-subtitle">
                  Total Bid Amount {ankStats[ank.num]?.amount || 0}
                </div>
                <div className="ref-ank-tag" style={{ background: ank.tagColor }}>
                  Ank {ank.num}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: UN-APPROVED USERS LIST */}
        <div className="ref-section-card">
          <div className="ref-section-title">Un-Approved Users List</div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748B' }}>
              <span>Show</span>
              <select
                value={unapprovedEntriesLimit}
                onChange={e => setUnapprovedEntriesLimit(Number(e.target.value))}
                style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 12 }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>entries</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, color: '#64748B' }}>Search:</span>
              <input
                type="text"
                placeholder="Search user..."
                value={unapprovedSearch}
                onChange={e => setUnapprovedSearch(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 12, outline: 'none' }}
              />
            </div>
          </div>

          <div className="ref-table-wrap">
            <table className="ref-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Mobile</th>
                  <th>email</th>
                  <th>Date</th>
                  <th>Balance</th>
                  <th>Betting</th>
                  <th>Transfer</th>
                  <th>Active</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnapprovedUsers.slice(0, unapprovedEntriesLimit).map((u, idx) => {
                  const state = userPermissionStates[u.id] || { betting: false, transfer: false, active: true };
                  return (
                    <tr key={u.id || idx}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 700, color: '#0F172A' }}>{u.name || 'User'}</td>
                      <td style={{ fontFamily: 'monospace' }}>{u.phone || 'N/A'}</td>
                      <td>{u.email || 'temp@gmail.com'}</td>
                      <td style={{ color: '#64748B', fontSize: 11.5 }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '01 Sep 2026'}
                      </td>
                      <td style={{ fontWeight: 800, color: '#0F172A' }}>{u.wallet_balance || 0}</td>
                      <td>
                        <button
                          type="button"
                          className={`ref-badge ${state.betting ? 'yes' : 'no'}`}
                          onClick={() => toggleUserPermission(u.id, 'betting')}
                        >
                          {state.betting ? 'Yes' : 'No'}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`ref-badge ${state.transfer ? 'yes' : 'no'}`}
                          onClick={() => toggleUserPermission(u.id, 'transfer')}
                        >
                          {state.transfer ? 'Yes' : 'No'}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`ref-badge ${state.active ? 'yes' : 'no'}`}
                          onClick={() => toggleUserPermission(u.id, 'active')}
                        >
                          {state.active ? 'Yes' : 'No'}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => { setUserFilterMode('ALL'); handleOpenModal('users'); }}
                          style={{
                            background: '#0284C7',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: 28,
                            height: 28,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title="View user"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      {/* MODAL 1: RESULT DECLARATION (INSTANT, PRE-SCHEDULED & AUTOMATIC MODES) */}
      {activeModal === 'declare' && (
        <div className="admin-modal-overlay" onClick={handleCloseAdminModal}>
          <div className="admin-modal-box" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ background: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleCloseAdminModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1.5px solid rgba(255, 255, 255, 0.45)',
                    color: '#FFFFFF',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                  title="Go Back to Dashboard"
                >
                  <ArrowLeft size={16} strokeWidth={3} />
                  <span>BACK</span>
                </button>
                <div style={{ fontWeight: 900, fontSize: 16 }}>RESULT DECLARATION & SETTLEMENT ENGINE</div>
              </div>
              <button type="button" onClick={handleCloseAdminModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* 3 Mode Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: '#FEF3C7', padding: 4 }}>
              <button
                type="button"
                onClick={() => setDeclareTab('instant')}
                style={{
                  padding: '8px 4px',
                  borderRadius: 6,
                  border: 'none',
                  background: declareTab === 'instant' ? '#D97706' : 'transparent',
                  color: declareTab === 'instant' ? 'white' : '#92400E',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                1. Instant Manual
              </button>
              <button
                type="button"
                onClick={() => setDeclareTab('scheduled')}
                style={{
                  padding: '8px 4px',
                  borderRadius: 6,
                  border: 'none',
                  background: declareTab === 'scheduled' ? '#D97706' : 'transparent',
                  color: declareTab === 'scheduled' ? 'white' : '#92400E',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                2. Pre-Schedule
              </button>
              <button
                type="button"
                onClick={() => setDeclareTab('auto')}
                style={{
                  padding: '8px 4px',
                  borderRadius: 6,
                  border: 'none',
                  background: declareTab === 'auto' ? '#D97706' : 'transparent',
                  color: declareTab === 'auto' ? 'white' : '#92400E',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                3. Auto Draw (AI)
              </button>
            </div>

            <div className="admin-modal-body">
              {settlementResult && (
                <div style={{ background: '#DCFCE7', color: '#15803D', padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
                  {settlementResult.message}
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label className="input-label">Select Market:</label>
                <select
                  className="input-field"
                  value={selectedMarketId}
                  onChange={e => {
                    setSelectedMarketId(e.target.value);
                    const found = (Array.isArray(markets) ? markets : []).find(m => m.id.toString() === e.target.value);
                    if (found) {
                      setSchedOpenPanna(found.scheduled_open_panna || '');
                      setSchedClosePanna(found.scheduled_close_panna || '');
                      setSchedMode(found.result_mode || 'MANUAL');
                      setAutoAlgorithm(found.auto_algorithm || 'MIN_LIABILITY');
                    }
                  }}
                >
                  {(Array.isArray(markets) ? markets : []).map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} [{m.open_time} - {m.close_time}] • Mode: {m.result_mode || 'MANUAL'}
                    </option>
                  ))}
                </select>
              </div>

              {/* TAB 1: INSTANT MANUAL RESULT */}
              {declareTab === 'instant' && (
                <div>
                  <div style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>
                    Declare numbers right now. Winning bets are settled and credited immediately.
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    <div>
                      <label className="input-label">Open Pana (3-digit):</label>
                      <input
                        type="text"
                        maxLength={3}
                        placeholder="e.g. 137"
                        className="input-field"
                        value={openPannaInput}
                        onChange={e => setOpenPannaInput(e.target.value.replace(/[^0-9]/g, ''))}
                        style={{ textAlign: 'center', fontSize: 18, fontWeight: 900 }}
                      />
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                        Open Single: <strong style={{ color: '#16A34A', fontSize: 13 }}>{openAnkPreview}</strong>
                      </div>
                    </div>

                    <div>
                      <label className="input-label">Close Pana (3-digit):</label>
                      <input
                        type="text"
                        maxLength={3}
                        placeholder="e.g. 248"
                        className="input-field"
                        value={closePannaInput}
                        onChange={e => setClosePannaInput(e.target.value.replace(/[^0-9]/g, ''))}
                        style={{ textAlign: 'center', fontSize: 18, fontWeight: 900 }}
                      />
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                        Close Single: <strong style={{ color: '#16A34A', fontSize: 13 }}>{closeAnkPreview}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Computed Preview */}
                  <div style={{ background: '#0F172A', color: 'white', borderRadius: 12, padding: 12, textAlign: 'center', marginBottom: 16 }}>
                    <div style={{ fontSize: 11, opacity: 0.8 }}>COMPUTED RESULT PREVIEW</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#38BDF8', letterSpacing: 2 }}>
                      {openPannaInput || '***'}-{jodiPreview}-{closePannaInput || '***'}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleDeclareInstant}
                    disabled={settleLoading || (!openPannaInput && !closePannaInput)}
                    style={{ background: '#D97706' }}
                  >
                    {settleLoading ? 'Settling & Crediting Wallets...' : 'DECLARE & AUTO-SETTLE NOW'}
                  </button>
                </div>
              )}

              {/* TAB 2: PRE-SCHEDULED MANUAL RESULT */}
              {declareTab === 'scheduled' && (
                <div>
                  <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: 10, fontSize: 12, color: '#1E40AF', marginBottom: 12 }}>
                    <strong>Pre-Schedule Feature:</strong> Set the winning numbers in advance. When the market's Open Time ({selectedMarketObj?.open_time}) and Close Time ({selectedMarketObj?.close_time}) arrive, the system will automatically declare them!
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    <div>
                      <label className="input-label">Pre-Set Open Pana:</label>
                      <input
                        type="text"
                        maxLength={3}
                        placeholder="e.g. 137"
                        className="input-field"
                        value={schedOpenPanna}
                        onChange={e => setSchedOpenPanna(e.target.value.replace(/[^0-9]/g, ''))}
                        style={{ textAlign: 'center', fontSize: 18, fontWeight: 900 }}
                      />
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                        Auto-triggers at: <strong>{selectedMarketObj?.open_time}</strong>
                      </div>
                    </div>

                    <div>
                      <label className="input-label">Pre-Set Close Pana:</label>
                      <input
                        type="text"
                        maxLength={3}
                        placeholder="e.g. 248"
                        className="input-field"
                        value={schedClosePanna}
                        onChange={e => setSchedClosePanna(e.target.value.replace(/[^0-9]/g, ''))}
                        style={{ textAlign: 'center', fontSize: 18, fontWeight: 900 }}
                      />
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                        Auto-triggers at: <strong>{selectedMarketObj?.close_time}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      setSchedMode('SCHEDULED_MANUAL');
                      handleSaveAutomation();
                    }}
                    style={{ background: '#2563EB' }}
                  >
                    SAVE PRE-SCHEDULED RESULT
                  </button>
                </div>
              )}

              {/* TAB 3: AUTOMATIC ALGORITHMIC DRAW */}
              {declareTab === 'auto' && (
                <div>
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: 10, fontSize: 12, color: '#166534', marginBottom: 12 }}>
                    <strong>Full Automatic AI Draw:</strong> The system automatically computes and declares the result at market open/close times using the selected algorithm.
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label className="input-label">Select Algorithm:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => setAutoAlgorithm('MIN_LIABILITY')}
                        style={{
                          padding: 10,
                          borderRadius: 8,
                          border: autoAlgorithm === 'MIN_LIABILITY' ? '2px solid #16A34A' : '1px solid #CBD5E1',
                          background: autoAlgorithm === 'MIN_LIABILITY' ? '#DCFCE7' : 'white',
                          color: autoAlgorithm === 'MIN_LIABILITY' ? '#15803D' : '#475569',
                          fontWeight: 800,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        House Profit Maximizer (Least Liability)
                      </button>

                      <button
                        type="button"
                        onClick={() => setAutoAlgorithm('RANDOM_DRAW')}
                        style={{
                          padding: 10,
                          borderRadius: 8,
                          border: autoAlgorithm === 'RANDOM_DRAW' ? '2px solid #16A34A' : '1px solid #CBD5E1',
                          background: autoAlgorithm === 'RANDOM_DRAW' ? '#DCFCE7' : 'white',
                          color: autoAlgorithm === 'RANDOM_DRAW' ? '#15803D' : '#475569',
                          fontWeight: 800,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        Fair Random Lottery Draw
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      setSchedMode('AUTOMATIC');
                      handleSaveAutomation();
                    }}
                    style={{ background: '#16A34A' }}
                  >
                    ACTIVATE AUTOMATIC DRAW FOR {selectedMarketObj?.name || 'MARKET'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ROLLBACK / BID REVISE */}
      {activeModal === 'rollback' && (
        <div className="admin-modal-overlay" onClick={handleCloseAdminModal}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleCloseAdminModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1.5px solid rgba(255, 255, 255, 0.45)',
                    color: '#FFFFFF',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                  title="Go Back to Dashboard"
                >
                  <ArrowLeft size={16} strokeWidth={3} />
                  <span>BACK</span>
                </button>
                <div style={{ fontWeight: 900, fontSize: 16 }}>BID REVISE / RESULT ROLLBACK</div>
              </div>
              <button type="button" onClick={handleCloseAdminModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              {rollbackSuccess && (
                <div style={{ background: '#DCFCE7', color: '#15803D', padding: 12, borderRadius: 10, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
                  {rollbackSuccess}
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label className="input-label">Select Market to Rollback:</label>
                <select
                  className="input-field"
                  value={rollbackMarketId}
                  onChange={e => setRollbackMarketId(e.target.value)}
                >
                  {(Array.isArray(markets) ? markets : []).map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: 12, borderRadius: 10, fontSize: 12, marginBottom: 16 }}>
                <strong>Warning:</strong> Rolling back will reverse any win payouts credited for today's result, deduct user balances safely, and return bets to PENDING status.
              </div>

              <button type="button" className="btn-primary" onClick={handleRollback} style={{ background: '#DC2626' }}>
                EXECUTE RESULT ROLLBACK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DEPOSITS APPROVAL QUEUE & HISTORY */}
      {activeModal === 'deposits' && (
        <div className="admin-modal-overlay" onClick={handleCloseAdminModal}>
          <div className="admin-modal-box" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleCloseAdminModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1.5px solid rgba(255, 255, 255, 0.45)',
                    color: '#FFFFFF',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                  title="Go Back to Dashboard"
                >
                  <ArrowLeft size={16} strokeWidth={3} />
                  <span>BACK</span>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ArrowDown size={18} />
                  <div style={{ fontWeight: 900, fontSize: 16 }}>DEPOSITS APPROVAL & HISTORY</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => fetchDepositsList(depositStatusTab)}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, color: 'white', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}
                  title="Refresh deposits"
                >
                  <RefreshCw size={12} /> Sync
                </button>
                <button type="button" onClick={handleCloseAdminModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="admin-modal-body">
              {/* Status Filter Tabs */}
              <div className="modal-filter-tabs">
                {[
                  { id: 'PENDING', label: `Pending (${pendingDeposits.filter(d => d.status === 'PENDING').length})` },
                  { id: 'APPROVED', label: 'Approved' },
                  { id: 'REJECTED', label: 'Rejected' },
                  { id: 'ALL', label: 'All History' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    className={`modal-filter-tab ${depositStatusTab === t.id ? 'active' : ''}`}
                    onClick={() => setDepositStatusTab(t.id as any)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <input
                  type="text"
                  placeholder="Search by UTR number, Phone, or Name..."
                  className="input-field"
                  style={{ paddingLeft: 34, fontSize: 12 }}
                  value={depositSearch}
                  onChange={e => setDepositSearch(e.target.value)}
                />
                <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 10, top: 12 }} />
              </div>

              {/* List */}
              <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                {(() => {
                  const filtered = (Array.isArray(pendingDeposits) ? pendingDeposits : []).filter(d => {
                    if (!d) return false;
                    const search = depositSearch.toLowerCase().trim();
                    const matchesSearch = !search ||
                      String(d.utr_number || '').toLowerCase().includes(search) ||
                      String(d.user_name || '').toLowerCase().includes(search) ||
                      String(d.user_phone || '').includes(search);
                    return matchesSearch;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748B' }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>📭</div>
                        <div style={{ fontWeight: 800 }}>No deposits found</div>
                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                          {depositStatusTab === 'PENDING' ? 'No pending deposits waiting for approval.' : `No ${depositStatusTab.toLowerCase()} records matching your search.`}
                        </div>
                      </div>
                    );
                  }

                  return filtered.map(d => (
                    <div key={d.id} style={{
                      background: '#F8FAFC',
                      border: d.status === 'PENDING' ? '2px solid #86EFAC' : '1px solid #E2E8F0',
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 10,
                      boxShadow: d.status === 'PENDING' ? '0 2px 8px rgba(34, 197, 94, 0.15)' : 'none'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 900, color: '#0F172A' }}>{d.user_name || 'User'}</div>
                          <div style={{ fontSize: 12, color: '#64748B' }}>Phone: {d.user_phone || 'N/A'}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 18, fontWeight: 900, color: '#16A34A' }}>
                            ₹{Number(d.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                          <span style={{
                            display: 'inline-block',
                            marginTop: 2,
                            padding: '2px 8px',
                            borderRadius: 9999,
                            fontSize: 10,
                            fontWeight: 900,
                            background: d.status === 'APPROVED' ? '#DCFCE7' : d.status === 'REJECTED' ? '#FEE2E2' : '#FEF3C7',
                            color: d.status === 'APPROVED' ? '#15803D' : d.status === 'REJECTED' ? '#DC2626' : '#B45309'
                          }}>
                            {d.status === 'APPROVED' ? '✓ APPROVED' : d.status === 'REJECTED' ? '✕ REJECTED' : '⏳ PENDING'}
                          </span>
                        </div>
                      </div>

                      <div style={{
                        fontSize: 12,
                        background: 'white',
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        marginBottom: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 6
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <strong>UTR:</strong>
                          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0F172A' }}>{d.utr_number || 'N/A'}</span>
                          {d.utr_number && (
                            <button
                              type="button"
                              className="copy-chip"
                              onClick={() => copyToClipboard(d.utr_number, `utr-${d.id}`)}
                            >
                              <Copy size={11} /> {copiedId === `utr-${d.id}` ? 'Copied!' : 'Copy'}
                            </button>
                          )}
                        </div>
                        <span style={{ color: '#94A3B8', fontSize: 11 }}>
                          {d.created_at ? new Date(d.created_at).toLocaleString() : ''}
                        </span>
                      </div>

                      {d.admin_notes && (
                        <div style={{ fontSize: 11, background: '#FEF2F2', color: '#991B1B', padding: '6px 8px', borderRadius: 6, marginBottom: 8 }}>
                          <strong>Note:</strong> {d.admin_notes}
                        </div>
                      )}

                      {d.receipt_url ? (
                        <div style={{ marginBottom: 12, background: 'white', padding: 8, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#0F766E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              📸 Payment Screenshot Attached
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenReceipt(d)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                background: '#0D9488',
                                color: 'white',
                                border: 'none',
                                borderRadius: 6,
                                padding: '4px 8px',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              <Eye size={12} /> View Full
                            </button>
                          </div>
                          <div
                            onClick={() => handleOpenReceipt(d)}
                            style={{
                              cursor: 'pointer',
                              borderRadius: 6,
                              overflow: 'hidden',
                              maxHeight: 120,
                              background: '#0F172A',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <img
                              src={d.receipt_url}
                              alt="Payment Screenshot"
                              style={{ width: '100%', maxHeight: 120, objectFit: 'contain' }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: 11, color: '#94A3B8', fontStyle: 'italic', marginBottom: 10 }}>
                          No Screenshot Uploaded
                        </div>
                      )}

                      {d.status === 'PENDING' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '8px 12px', fontSize: 13, background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                            onClick={() => handleApproveDeposit(d.id)}
                          >
                            <Check size={14} /> APPROVE & CREDIT
                          </button>
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '8px 12px', fontSize: 13, background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                            onClick={() => handleRejectDeposit(d.id)}
                          >
                            <X size={14} /> REJECT
                          </button>
                        </div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: WITHDRAWAL REQUESTS & PAYOUTS */}
      {activeModal === 'withdrawals' && (
        <div className="admin-modal-overlay" onClick={handleCloseAdminModal}>
          <div className="admin-modal-box" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ background: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleCloseAdminModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1.5px solid rgba(255, 255, 255, 0.45)',
                    color: '#FFFFFF',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                  title="Go Back to Dashboard"
                >
                  <ArrowLeft size={16} strokeWidth={3} />
                  <span>BACK</span>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Landmark size={18} />
                  <div style={{ fontWeight: 900, fontSize: 16 }}>WITHDRAWAL REQUESTS & PAYOUTS</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => fetchWithdrawalsList(withdrawalStatusTab)}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, color: 'white', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}
                  title="Refresh withdrawals"
                >
                  <RefreshCw size={12} /> Sync
                </button>
                <button type="button" onClick={handleCloseAdminModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="admin-modal-body">
              {/* Status Filter Tabs */}
              <div className="modal-filter-tabs">
                {[
                  { id: 'PENDING', label: `Pending (${pendingWithdrawals.filter(w => w.status === 'PENDING').length})` },
                  { id: 'APPROVED', label: 'Paid / Done' },
                  { id: 'REJECTED', label: 'Rejected / Refunded' },
                  { id: 'ALL', label: 'All History' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    className={`modal-filter-tab ${withdrawalStatusTab === t.id ? 'active' : ''}`}
                    onClick={() => setWithdrawalStatusTab(t.id as any)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <input
                  type="text"
                  placeholder="Search by User, Phone, UPI ID, or Bank Account..."
                  className="input-field"
                  style={{ paddingLeft: 34, fontSize: 12 }}
                  value={withdrawalSearch}
                  onChange={e => setWithdrawalSearch(e.target.value)}
                />
                <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 10, top: 12 }} />
              </div>

              {/* List */}
              <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                {(() => {
                  const filtered = (Array.isArray(pendingWithdrawals) ? pendingWithdrawals : []).filter(w => {
                    if (!w) return false;
                    const search = withdrawalSearch.toLowerCase().trim();
                    const matchesSearch = !search ||
                      String(w.user_name || '').toLowerCase().includes(search) ||
                      String(w.user_phone || '').includes(search) ||
                      String(w.upi_id || '').toLowerCase().includes(search) ||
                      String(w.account_number || '').includes(search);
                    return matchesSearch;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748B' }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>📭</div>
                        <div style={{ fontWeight: 800 }}>No withdrawal requests found</div>
                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                          {withdrawalStatusTab === 'PENDING' ? 'No pending withdrawal requests waiting for payout.' : `No ${withdrawalStatusTab.toLowerCase()} records matching your search.`}
                        </div>
                      </div>
                    );
                  }

                  return filtered.map(w => (
                    <div key={w.id} style={{
                      background: '#F8FAFC',
                      border: w.status === 'PENDING' ? '2px solid #FCA5A5' : '1px solid #E2E8F0',
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 10,
                      boxShadow: w.status === 'PENDING' ? '0 2px 8px rgba(239, 68, 68, 0.15)' : 'none'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 900, color: '#0F172A' }}>{w.user_name || 'User'}</div>
                          <div style={{ fontSize: 12, color: '#64748B' }}>Phone: {w.user_phone || 'N/A'}</div>
                          {w.user_wallet !== undefined && (
                            <div style={{ fontSize: 11, color: '#0284C7', fontWeight: 700, marginTop: 1 }}>
                              User Current Wallet: ₹{Number(w.user_wallet || 0).toFixed(2)}
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 18, fontWeight: 900, color: '#DC2626' }}>
                            ₹{Number(w.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                          <span style={{
                            display: 'inline-block',
                            marginTop: 2,
                            padding: '2px 8px',
                            borderRadius: 9999,
                            fontSize: 10,
                            fontWeight: 900,
                            background: w.status === 'APPROVED' ? '#DCFCE7' : w.status === 'REJECTED' ? '#FEE2E2' : '#FEF3C7',
                            color: w.status === 'APPROVED' ? '#15803D' : w.status === 'REJECTED' ? '#DC2626' : '#B45309'
                          }}>
                            {w.status === 'APPROVED' ? '✓ PAID / APPROVED' : w.status === 'REJECTED' ? '✕ REJECTED & REFUNDED' : '⏳ PENDING PAYOUT'}
                          </span>
                        </div>
                      </div>

                      {/* Payment Destination Details */}
                      <div style={{ fontSize: 12, background: 'white', padding: '10px 12px', borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 800, color: '#334155' }}>Payout Mode: <strong>{w.payout_mode}</strong></span>
                          <span style={{ fontSize: 11, color: '#94A3B8' }}>{w.created_at ? new Date(w.created_at).toLocaleString() : ''}</span>
                        </div>

                        {w.payout_mode === 'UPI' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <strong>UPI ID:</strong>
                            <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0F172A', fontSize: 13 }}>{w.upi_id || 'N/A'}</span>
                            {w.upi_id && (
                              <button
                                type="button"
                                className="copy-chip"
                                onClick={() => copyToClipboard(w.upi_id, `upi-${w.id}`)}
                              >
                                <Copy size={11} /> {copiedId === `upi-${w.id}` ? 'Copied!' : 'Copy'}
                              </button>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <strong>A/C Number:</strong>
                              <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0F172A' }}>{w.account_number}</span>
                              {w.account_number && (
                                <button
                                  type="button"
                                  className="copy-chip"
                                  onClick={() => copyToClipboard(w.account_number, `ac-${w.id}`)}
                                >
                                  <Copy size={11} /> {copiedId === `ac-${w.id}` ? 'Copied!' : 'Copy'}
                                </button>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <strong>IFSC:</strong>
                              <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0F172A' }}>{w.ifsc_code}</span>
                              {w.ifsc_code && (
                                <button
                                  type="button"
                                  className="copy-chip"
                                  onClick={() => copyToClipboard(w.ifsc_code, `ifsc-${w.id}`)}
                                >
                                  <Copy size={11} /> {copiedId === `ifsc-${w.id}` ? 'Copied!' : 'Copy'}
                                </button>
                              )}
                            </div>
                            <div>
                              <strong>Account Holder:</strong> {w.account_holder || 'N/A'}
                            </div>
                          </div>
                        )}

                        {w.transaction_reference && (
                          <div style={{ marginTop: 6, fontSize: 11, color: '#047857', background: '#F0FDF4', padding: '4px 6px', borderRadius: 4 }}>
                            <strong>Txn Reference:</strong> {w.transaction_reference}
                          </div>
                        )}
                      </div>

                      {w.admin_notes && (
                        <div style={{ fontSize: 11, background: '#FEF2F2', color: '#991B1B', padding: '6px 8px', borderRadius: 6, marginBottom: 8 }}>
                          <strong>Reason / Note:</strong> {w.admin_notes}
                        </div>
                      )}

                      {w.status === 'PENDING' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '8px 12px', fontSize: 13, background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                            onClick={() => handleApproveWithdrawal(w.id)}
                          >
                            <Check size={14} /> MARK PAID
                          </button>
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '8px 12px', fontSize: 13, background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                            onClick={() => handleRejectWithdrawal(w.id)}
                          >
                            <X size={14} /> REJECT & REFUND
                          </button>
                        </div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: USERS DIRECTORY */}
      {activeModal === 'users' && (
        <div className="admin-modal-overlay" onClick={handleCloseAdminModal}>
          <div className="admin-modal-box" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ background: '#57534E', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleCloseAdminModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1.5px solid rgba(255, 255, 255, 0.45)',
                    color: '#FFFFFF',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                  title="Go Back to Dashboard"
                >
                  <ArrowLeft size={16} strokeWidth={3} />
                  <span>BACK</span>
                </button>
                <div style={{ fontWeight: 900, fontSize: 16 }}>USERS MANAGEMENT ({Array.isArray(usersList) ? usersList.length : 0})</div>
              </div>
              <button type="button" onClick={handleCloseAdminModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ position: 'relative', marginBottom: 12 }}>
                <input
                  type="text"
                  placeholder="Search by phone number or name..."
                  className="input-field"
                  style={{ paddingLeft: 36 }}
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
                <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: 12, top: 14 }} />
              </div>

              <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                {(Array.isArray(usersList) ? usersList : [])
                  .filter(u => {
                    if (!u) return false;
                    const phone = String(u.phone || '');
                    const name = String(u.name || '').toLowerCase();
                    const search = (userSearch || '').toLowerCase().trim();
                    const matchesSearch = !search || phone.includes(search) || name.includes(search);
                    const matchesFilter = userFilterMode === 'ALL' || u.status === userFilterMode;
                    return matchesSearch && matchesFilter;
                  })
                  .map(u => (
                    <div key={u.id} style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: 10,
                      padding: '10px 12px',
                      marginBottom: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>{u.name || 'Unnamed User'}</div>
                        <div style={{ fontSize: 11.5, color: '#64748B' }}>{u.phone || 'No phone'}</div>
                        <div style={{ fontSize: 12, fontWeight: 900, color: '#16A34A', marginTop: 2 }}>
                          Wallet: ₹{Number(u.wallet_balance || 0).toFixed(2)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => setSelectedUserForAdjust(u)}
                          style={{
                            background: '#0284C7',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 10px',
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          ± Wallet
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(u.id)}
                          style={{
                            background: u.status === 'ACTIVE' ? '#DC2626' : '#16A34A',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 10px',
                            fontSize: 11,
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                        >
                          {u.status === 'ACTIVE' ? 'Block' : 'Unblock'}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Adjust Wallet Form */}
              {selectedUserForAdjust && (
                <div style={{ marginTop: 14, background: 'white', border: '2px solid #0284C7', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
                    Adjust Wallet: {selectedUserForAdjust.name} ({selectedUserForAdjust.phone})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                    <button
                      type="button"
                      onClick={() => setAdjustType('CREDIT')}
                      style={{
                        padding: 8,
                        borderRadius: 8,
                        border: adjustType === 'CREDIT' ? '2px solid #16A34A' : '1px solid #CBD5E1',
                        background: adjustType === 'CREDIT' ? '#DCFCE7' : 'white',
                        color: adjustType === 'CREDIT' ? '#15803D' : '#475569',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      Credit (+)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustType('DEBIT')}
                      style={{
                        padding: 8,
                        borderRadius: 8,
                        border: adjustType === 'DEBIT' ? '2px solid #DC2626' : '1px solid #CBD5E1',
                        background: adjustType === 'DEBIT' ? '#FEE2E2' : 'white',
                        color: adjustType === 'DEBIT' ? '#B91C1C' : '#475569',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      Debit (-)
                    </button>
                  </div>
                  <input
                    type="number"
                    min={1}
                    className="input-field"
                    value={adjustAmount}
                    onChange={e => setAdjustAmount(parseInt(e.target.value) || 0)}
                    style={{ marginBottom: 8 }}
                  />
                  <input
                    type="text"
                    placeholder="Reason for adjustment"
                    className="input-field"
                    value={adjustReason}
                    onChange={e => setAdjustReason(e.target.value)}
                    style={{ marginBottom: 10 }}
                  />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" className="btn-primary" onClick={handleAdjustWallet} style={{ background: '#0284C7' }}>
                      CONFIRM ADJUSTMENT
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedUserForAdjust(null)}
                      style={{ background: '#E2E8F0', border: 'none', borderRadius: 10, padding: '0 14px', fontWeight: 800, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: ALL BID DATA & WINNING LEDGER */}
      {(activeModal === 'bids' || activeModal === 'bids-won') && (
        <div className="admin-modal-overlay" onClick={handleCloseAdminModal}>
          <div className="admin-modal-box" style={{ maxWidth: 680, width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ background: '#57534E', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleCloseAdminModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1.5px solid rgba(255, 255, 255, 0.45)',
                    color: '#FFFFFF',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                  title="Go Back to Dashboard"
                >
                  <ArrowLeft size={16} strokeWidth={3} />
                  <span>BACK</span>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={18} />
                  <div style={{ fontWeight: 900, fontSize: 16 }}>
                    {activeModal === 'bids-won' ? 'WINNING BETS & PAYOUTS LEDGER' : 'BIDS STREAM & BETTING LEDGER'}
                  </div>
                </div>
              </div>
              <button type="button" onClick={handleCloseAdminModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ maxHeight: '82vh', padding: 14 }}>
              {/* Filter Tabs */}
              <div className="modal-filter-tabs">
                {[
                  { id: 'ALL', label: `All Bids (${allBids.length})` },
                  { id: 'WON', label: `Winning Bids (${allBids.filter(b => b.status === 'WON').length})` },
                  { id: 'PENDING', label: `Pending Draws (${allBids.filter(b => b.status === 'PENDING').length})` },
                  { id: 'LOST', label: `Lost (${allBids.filter(b => b.status === 'LOST').length})` }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    className={`modal-filter-tab ${bidStatusFilter === t.id ? 'active' : ''}`}
                    onClick={() => setBidStatusFilter(t.id as any)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <input
                  type="text"
                  placeholder="Search by User, Phone, Market, or Bet Number..."
                  className="input-field"
                  style={{ paddingLeft: 34, fontSize: 12 }}
                  value={bidSearch}
                  onChange={e => setBidSearch(e.target.value)}
                />
                <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: 10, top: 12 }} />
              </div>

              {/* Summary Stats bar */}
              {(() => {
                const filtered = (Array.isArray(allBids) ? allBids : []).filter(b => {
                  if (!b) return false;
                  const matchesFilter = bidStatusFilter === 'ALL' || b.status === bidStatusFilter;
                  const search = bidSearch.toLowerCase().trim();
                  const matchesSearch = !search ||
                    String(b.user_name || '').toLowerCase().includes(search) ||
                    String(b.user_phone || '').includes(search) ||
                    String(b.market_name || '').toLowerCase().includes(search) ||
                    String(b.bet_number || '').includes(search);
                  return matchesFilter && matchesSearch;
                });

                const totalVol = filtered.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

                return (
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      padding: '8px 12px',
                      borderRadius: 8,
                      marginBottom: 10,
                      fontSize: 12
                    }}>
                      <span>Matching Bets: <strong>{filtered.length}</strong></span>
                      <span style={{ fontWeight: 800, color: '#0F172A' }}>
                        Total Volume: <span style={{ color: '#16A34A', fontSize: 14 }}>₹{totalVol.toLocaleString('en-IN')}</span>
                      </span>
                    </div>

                    <div style={{ maxHeight: 360, overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: 8 }}>
                      <table className="admin-data-table">
                        <thead>
                          <tr>
                            <th>Ticket / Time</th>
                            <th>User</th>
                            <th>Market</th>
                            <th>Game / Num</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.length === 0 ? (
                            <tr>
                              <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#64748B' }}>
                                No bids found matching this filter.
                              </td>
                            </tr>
                          ) : (
                            filtered.map(b => (
                              <tr key={b.id}>
                                <td>
                                  <div style={{ fontWeight: 800 }}>{b.ticket_id || b.id}</div>
                                  <div style={{ fontSize: 10, color: '#94A3B8' }}>{b.created_at ? new Date(b.created_at).toLocaleTimeString() : ''}</div>
                                </td>
                                <td>
                                  <div>{b.user_name}</div>
                                  <div style={{ fontSize: 11, color: '#64748B' }}>{b.user_phone}</div>
                                </td>
                                <td>{b.market_name}</td>
                                <td>
                                  <strong>{b.game_type_name}</strong>
                                  <div style={{ fontSize: 13, fontWeight: 900, color: '#0284C7' }}>#{b.bet_number}</div>
                                </td>
                                <td style={{ fontWeight: 800 }}>₹{b.amount}</td>
                                <td>
                                  <span style={{
                                    padding: '3px 8px',
                                    borderRadius: 9999,
                                    fontSize: 10.5,
                                    fontWeight: 800,
                                    background: b.status === 'WON' ? '#DCFCE7' : b.status === 'LOST' ? '#FEE2E2' : '#FEF3C7',
                                    color: b.status === 'WON' ? '#15803D' : b.status === 'LOST' ? '#DC2626' : '#B45309'
                                  }}>
                                    {b.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: GAME RATES CONFIG */}
      {activeModal === 'rates' && (
        <div className="admin-modal-overlay" onClick={handleCloseAdminModal}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ background: '#57534E', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleCloseAdminModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1.5px solid rgba(255, 255, 255, 0.45)',
                    color: '#FFFFFF',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                  title="Go Back to Dashboard"
                >
                  <ArrowLeft size={16} strokeWidth={3} />
                  <span>BACK</span>
                </button>
                <div style={{ fontWeight: 900, fontSize: 16 }}>GAME RATES & PAYOUT MULTIPLIERS</div>
              </div>
              <button type="button" onClick={handleCloseAdminModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              {(Array.isArray(gameRates) ? gameRates : []).map(r => (
                <div key={r.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #F1F5F9'
                }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>Min: ₹{r.min_bet} | Max: ₹{r.max_bet}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>1 : </span>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field"
                      style={{ width: 80, padding: '6px 8px', textAlign: 'center', fontWeight: 800 }}
                      defaultValue={r.payout_rate}
                      onBlur={e => {
                        const val = parseFloat(e.target.value);
                        if (val > 0) {
                          fetch('/api/v1/admin/game-rates', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ id: r.id, payout_rate: val })
                          });
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: SETTINGS & LIMITS & NOTICE */}
      {(['limits', 'whatsapp', 'notice', 'banner', 'bonus', 'referral', 'chat'].includes(activeModal || '')) && (
        <div className="admin-modal-overlay" onClick={handleCloseAdminModal}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleCloseAdminModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1.5px solid rgba(255, 255, 255, 0.45)',
                    color: '#FFFFFF',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                  title="Go Back to Dashboard"
                >
                  <ArrowLeft size={16} strokeWidth={3} />
                  <span>BACK</span>
                </button>
                <div style={{ fontWeight: 900, fontSize: 16 }}>
                  {activeModal === 'pixel' ? 'META PIXEL & FACEBOOK ADS HUB' :
                   activeModal === 'limits' ? 'UPI QR, LIMITS & FINANCIAL SETTINGS' :
                   activeModal === 'whatsapp' ? 'WHATSAPP & SUPPORT SETTINGS' :
                   activeModal === 'notice' ? 'MARQUEE NOTICE TICKER' :
                   activeModal === 'banner' ? 'BANNER POPUP SETTINGS' :
                   activeModal === 'bonus' ? 'BONUS RATES' :
                   activeModal === 'referral' ? 'REFERRAL COMMISSION' : 'SETTINGS'}
                </div>
              </div>
              <button type="button" onClick={handleCloseAdminModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              {activeModal === 'limits' && (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <label className="input-label">Admin UPI ID (for QR Deposits):</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. janta555official@upi"
                      value={settingsData.upi_id || ''}
                      onChange={e => setSettingsData({ ...settingsData, upi_id: e.target.value })}
                    />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label className="input-label">Merchant / Payee Name:</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. JANTA555 ENTERPRISE"
                      value={settingsData.upi_name || ''}
                      onChange={e => setSettingsData({ ...settingsData, upi_name: e.target.value })}
                    />
                  </div>

                  {/* QR Code Upload & Preview Section */}
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 14
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <label className="input-label" style={{ margin: 0, fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <QrCode size={16} color="var(--primary)" />
                        <span>Deposit Scanner QR Code</span>
                      </label>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: settingsData.qr_code_image ? '#DCFCE7' : '#EFF6FF',
                        color: settingsData.qr_code_image ? '#15803D' : '#1D4ED8'
                      }}>
                        {settingsData.qr_code_image ? '✓ Custom Uploaded QR' : '⚡ Auto-Generated QR'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      {/* QR Preview Box */}
                      <div style={{
                        width: 120,
                        height: 120,
                        background: 'white',
                        border: '2px solid #CBD5E1',
                        borderRadius: 10,
                        padding: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                      }}>
                        <img
                          src={settingsData.qr_code_image || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${settingsData.upi_id || 'janta555official@upi'}&pn=${encodeURIComponent(settingsData.upi_name || 'JANTA555')}&cu=INR`)}`}
                          alt="QR Code Preview"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                        />
                      </div>

                      {/* Upload Controls */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10, lineHeight: 1.4 }}>
                          Upload your PhonePe, GPay, Paytm, or BharatPe QR scanner image. Users will see and scan this QR to deposit.
                        </div>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <label
                            style={{
                              background: '#0284C7',
                              color: 'white',
                              borderRadius: 8,
                              padding: '8px 12px',
                              fontSize: 12,
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6
                            }}
                          >
                            <Upload size={14} />
                            <span>Upload QR Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 5 * 1024 * 1024) {
                                    alert('Image size should be less than 5MB');
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onload = ev => {
                                    const base64 = ev.target?.result as string;
                                    setSettingsData({ ...settingsData, qr_code_image: base64 });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>

                          {settingsData.qr_code_image && (
                            <button
                              type="button"
                              onClick={() => setSettingsData({ ...settingsData, qr_code_image: '' })}
                              style={{
                                background: '#FEE2E2',
                                color: '#DC2626',
                                border: '1px solid #FECACA',
                                borderRadius: 8,
                                padding: '8px 12px',
                                fontSize: 12,
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}
                            >
                              Remove Custom QR
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div>
                      <label className="input-label">Min Deposit (₹):</label>
                      <input
                        type="number"
                        className="input-field"
                        value={settingsData.min_deposit || 100}
                        onChange={e => setSettingsData({ ...settingsData, min_deposit: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="input-label">Min Withdrawal (₹):</label>
                      <input
                        type="number"
                        className="input-field"
                        value={settingsData.min_withdrawal || 500}
                        onChange={e => setSettingsData({ ...settingsData, min_withdrawal: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label className="input-label" style={{ fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                      <Smartphone size={14} color="#16A34A" />
                      <span>Support WhatsApp Number (Home & Market Buttons):</span>
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. +919876543210"
                      value={settingsData.whatsapp_number || "+919876543210"}
                      onChange={e => setSettingsData({ ...settingsData, whatsapp_number: e.target.value })}
                    />
                  </div>

                  {/* Renflair SMS Gateway & Registration OTP Settings */}
                  <div style={{
                    marginTop: 18,
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: 12,
                    padding: 14
                  }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#0F172A', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Smartphone size={15} color="#FF0055" />
                      <span>Renflair SMS Gateway & Registration OTP</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748B', marginBottom: 12 }}>
                      New players will receive a 4-digit SMS OTP upon registration via Renflair SMS Gateway (sms.renflair.in). Duplicate numbers are strictly blocked.
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <label className="input-label">Renflair API Key:</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="888a969c6d992798abd6f4d4a0b9318c"
                        value={settingsData.sms_api_key ?? '888a969c6d992798abd6f4d4a0b9318c'}
                        onChange={e => setSettingsData({ ...settingsData, sms_api_key: e.target.value })}
                      />
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="checkbox"
                          checked={settingsData.sms_otp_enabled !== 'false'}
                          onChange={e => setSettingsData({ ...settingsData, sms_otp_enabled: e.target.checked ? 'true' : 'false' })}
                          style={{ width: 16, height: 16 }}
                        />
                        <span>Enable SMS OTP Verification on Registration</span>
                      </label>
                    </div>

                    {/* Test SMS Block */}
                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 10 }}>
                      <label className="input-label" style={{ fontSize: 11.5, color: '#475569' }}>Test SMS Gateway (Send Real Test OTP):</label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="Enter 10-digit mobile number"
                          className="input-field"
                          style={{ flex: 1, padding: '7px 10px', fontSize: 12 }}
                          value={testSmsPhone}
                          onChange={e => setTestSmsPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        />
                        <button
                          type="button"
                          onClick={handleSendTestSms}
                          disabled={testingSms || testSmsPhone.length !== 10}
                          style={{
                            background: '#0F172A',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            padding: '8px 14px',
                            fontSize: 11.5,
                            fontWeight: 800,
                            cursor: testingSms || testSmsPhone.length !== 10 ? 'not-allowed' : 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {testingSms ? 'Sending...' : 'Test SMS'}
                        </button>
                      </div>
                      {testSmsResult && (
                        <div style={{ marginTop: 6, fontSize: 12, color: testSmsResult.startsWith('✅') ? '#166534' : '#DC2626', fontWeight: 700 }}>
                          {testSmsResult}
                        </div>
                      )}
                    </div>

                    {/* Meta Facebook Pixel Config */}
                    <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: '#1E293B' }}>
                          <Globe size={16} color="#2563EB" />
                          <span>Meta (Facebook) Pixel Tracking</span>
                        </div>
                        <span style={{ fontSize: 11, background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: 9999, fontWeight: 700 }}>LIVE</span>
                      </div>
                      <div style={{ marginBottom: 6 }}>
                        <label className="input-label" style={{ fontSize: 11.5 }}>Meta Pixel Dataset ID:</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="e.g. 2066705063996932"
                          value={settingsData.meta_pixel_id ?? '2066705063996932'}
                          onChange={e => setSettingsData({ ...settingsData, meta_pixel_id: e.target.value })}
                        />
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>
                        Tracks PageView, Registration, Deposit Requests, WhatsApp & APK Downloads for Facebook/Instagram Ads.
                      </div>
                    </div>
                  </div>
                </>
              )}

              {(activeModal === 'whatsapp' || activeModal === 'chat') && (
                <>
                  <div style={{ marginBottom: 14, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: 12 }}>
                    <div style={{ fontWeight: 800, color: "#166534", fontSize: 13, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                      <Smartphone size={16} />
                      <span>WhatsApp Support Configuration</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "#15803D" }}>
                      Users clicking the WhatsApp button on the Home Page and Market Cards will be directly redirected to chat with this number.
                    </div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label className="input-label" style={{ fontWeight: 800 }}>Support WhatsApp Number (with Country Code):</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. +919876543210"
                      value={settingsData.whatsapp_number || "+919876543210"}
                      onChange={e => setSettingsData({ ...settingsData, whatsapp_number: e.target.value })}
                    />
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "#64748B" }}>
                        Live Test Link: <a href={`https://wa.me/${(settingsData.whatsapp_number || "+919876543210").replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" style={{ color: "#16A34A", fontWeight: 700 }}>Open Chat ↗</a>
                      </span>
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label className="input-label">Support Calling Helpline:</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsData.support_phone || '+919876543210'}
                      onChange={e => setSettingsData({ ...settingsData, support_phone: e.target.value })}
                    />
                  </div>
                </>
              )}

              {(activeModal === 'notice' || activeModal === 'banner') && (
                <div style={{ marginBottom: 16 }}>
                  <label className="input-label">Marquee Notice Text:</label>
                  <textarea
                    rows={4}
                    className="input-field"
                    value={settingsData.notice_text || ''}
                    onChange={e => setSettingsData({ ...settingsData, notice_text: e.target.value })}
                  />
                </div>
              )}

              {activeModal === 'bonus' && (
                <div style={{ marginBottom: 16 }}>
                  <label className="input-label">First Deposit Bonus (%):</label>
                  <input
                    type="number"
                    className="input-field"
                    value={settingsData.bonus_rate || '10'}
                    onChange={e => setSettingsData({ ...settingsData, bonus_rate: e.target.value })}
                  />
                </div>
              )}

              {activeModal === 'referral' && (
                <div style={{ marginBottom: 16 }}>
                  <label className="input-label">Referral Commission Rate (%):</label>
                  <input
                    type="number"
                    className="input-field"
                    value={settingsData.ref_commission || '5'}
                    onChange={e => setSettingsData({ ...settingsData, ref_commission: e.target.value })}
                  />
                </div>
              )}

              {activeModal === 'pixel' && (
                <div>
                  {/* Banner */}
                  <div style={{
                    background: 'linear-gradient(135deg, #1877F2 0%, #0D47A1 100%)',
                    borderRadius: 12,
                    padding: 16,
                    color: 'white',
                    marginBottom: 16,
                    boxShadow: '0 4px 12px rgba(24, 119, 242, 0.25)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 800 }}>
                        <Globe size={20} color="white" />
                        <span>Meta Pixel Conversion Tracking</span>
                      </div>
                      <span style={{
                        background: '#22C55E',
                        color: 'white',
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 9999,
                        letterSpacing: 0.5
                      }}>
                        ACTIVE & VERIFIED
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, opacity: 0.92, lineHeight: 1.5 }}>
                      JANTA555 website aur landing page me Meta Pixel automatically active hai. Jab aap Facebook / Instagram par ad chalate hain, tab visitors ka registration, deposits aur WhatsApp leads yahan Meta Events Manager me capture hoti hain.
                    </p>
                  </div>

                  {/* Pixel ID Input Box */}
                  <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: 10,
                    padding: 14,
                    marginBottom: 16
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label className="input-label" style={{ fontWeight: 700, margin: 0 }}>
                        Current Meta Pixel / Dataset ID:
                      </label>
                      <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 600 }}>
                        Meta Events Manager Dataset
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. 2066705063996932"
                        style={{ flex: 1, fontFamily: 'monospace', fontWeight: 700, letterSpacing: 0.5, fontSize: 13 }}
                        value={settingsData.meta_pixel_id ?? '2066705063996932'}
                        onChange={e => setSettingsData({ ...settingsData, meta_pixel_id: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const id = settingsData.meta_pixel_id || '2066705063996932';
                          navigator.clipboard?.writeText(id);
                          alert(`Pixel ID copied to clipboard: ${id}`);
                        }}
                        style={{
                          background: '#F1F5F9',
                          border: '1px solid #CBD5E1',
                          borderRadius: 8,
                          padding: '0 12px',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          color: '#334155'
                        }}
                      >
                        Copy ID
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: '#64748B' }}>
                        Default ID: <strong style={{ color: '#0F172A' }}>2066705063996932</strong> (Active)
                      </span>
                      <a
                        href="https://eventsmanager.facebook.com"
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 11, color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}
                      >
                        Open Meta Events Manager ↗
                      </a>
                    </div>
                  </div>

                  {/* Active Events Overview */}
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 10,
                    padding: 14,
                    marginBottom: 16
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A', marginBottom: 10 }}>
                      ⚡ Real-Time Tracked Events on JANTA555
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                      <div style={{ background: 'white', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, fontSize: 12, color: '#0F172A' }}>PageView</span>
                          <span style={{ fontSize: 10, background: '#DCFCE7', color: '#15803D', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>Auto</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>
                          Fired on every website and landing page visit.
                        </div>
                      </div>

                      <div style={{ background: 'white', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, fontSize: 12, color: '#0F172A' }}>CompleteRegistration</span>
                          <span style={{ fontSize: 10, background: '#EFF6FF', color: '#1D4ED8', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>High Value</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>
                          Fired immediately when a player registers.
                        </div>
                      </div>

                      <div style={{ background: 'white', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, fontSize: 12, color: '#0F172A' }}>InitiateCheckout</span>
                          <span style={{ fontSize: 10, background: '#FEF3C7', color: '#B45309', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>Funnel</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>
                          Fired when player opens the Add Points screen.
                        </div>
                      </div>

                      <div style={{ background: 'white', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, fontSize: 12, color: '#0F172A' }}>Purchase (Deposit)</span>
                          <span style={{ fontSize: 10, background: '#DCFCE7', color: '#15803D', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>Conversion</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>
                          Fired with deposit INR amount when UTR submitted.
                        </div>
                      </div>

                      <div style={{ background: 'white', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, fontSize: 12, color: '#0F172A' }}>Contact (WhatsApp)</span>
                          <span style={{ fontSize: 10, background: '#DCFCE7', color: '#15803D', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>Lead</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>
                          Fired when player taps any WhatsApp support button.
                        </div>
                      </div>

                      <div style={{ background: 'white', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, fontSize: 12, color: '#0F172A' }}>Lead (APK Download)</span>
                          <span style={{ fontSize: 10, background: '#EDE9FE', color: '#6D28D9', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>Install</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 3 }}>
                          Fired when visitor clicks Download Android App.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step by Step Ad Setup Guide */}
                  <div style={{
                    background: '#FFFBEB',
                    border: '1px solid #FCD34D',
                    borderRadius: 10,
                    padding: 14,
                    marginBottom: 16
                  }}>
                    <div style={{ fontWeight: 800, fontSize: 12.5, color: '#92400E', marginBottom: 8 }}>
                      📋 Meta Ad Campaign Setup Guide (3 Steps)
                    </div>
                    <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#78350F', lineHeight: 1.6 }}>
                      <li>
                        <strong>Meta Ads Manager</strong> me new campaign banayein aur Objective <em>"Leads"</em> ya <em>"Sales"</em> select karein.
                      </li>
                      <li>
                        Ad Set me Conversion Location <em>"Website"</em> chunein aur Pixel Dataset <code>{settingsData.meta_pixel_id || '2066705063996932'}</code> select karein.
                      </li>
                      <li>
                        Conversion Event me <strong>"CompleteRegistration"</strong> (User Register) ya <strong>"Lead"</strong> (App Download / WhatsApp) select karein. Destination URL me <code>https://janta555.com/</code> ya <code>https://janta555.onvoroa.com/</code> daalein.
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              <button type="button" className="btn-primary" onClick={() => handleSaveSettings(settingsData)}>
                SAVE CONFIGURATION
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 9: RECENT WINNERS */}
      {activeModal === 'winners' && (
        <div className="admin-modal-overlay" onClick={handleCloseAdminModal}>
          <div className="admin-modal-box" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleCloseAdminModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1.5px solid rgba(255, 255, 255, 0.45)',
                    color: '#FFFFFF',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                  title="Go Back to Dashboard"
                >
                  <ArrowLeft size={16} strokeWidth={3} />
                  <span>BACK</span>
                </button>
                <div style={{ fontWeight: 900, fontSize: 16 }}>RECENT WINNERS FEED ({Array.isArray(winnersList) ? winnersList.length : 0})</div>
              </div>
              <button type="button" onClick={handleCloseAdminModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ maxHeight: 420 }}>
              {(Array.isArray(winnersList) ? winnersList : []).map(w => (
                <div key={w.id} style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{w.user_display_name || 'Winner'}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{w.game_type_name} • {w.market_name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, color: '#16A34A', fontSize: 15 }}>+₹{w.amount}</div>
                    <div style={{ fontSize: 10, color: '#94A3B8' }}>{w.created_at ? new Date(w.created_at).toLocaleTimeString() : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 10: MARKET LIST & RESULTS MANAGEMENT */}
      {(activeModal === 'markets' || activeModal === 'market-list') && (
        <div className="admin-modal-overlay" onClick={handleCloseAdminModal}>
          <div className="admin-modal-box" style={{ maxWidth: 780, width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ background: 'linear-gradient(90deg, #0284C7 0%, #1D4ED8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleCloseAdminModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1.5px solid rgba(255, 255, 255, 0.45)',
                    color: '#FFFFFF',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                  title="Go Back to Dashboard"
                >
                  <ArrowLeft size={16} strokeWidth={3} />
                  <span>BACK</span>
                </button>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <List size={20} />
                    <span>MARKET LIST & RESULTS MANAGEMENT</span>
                  </div>
                  <div style={{ fontSize: 11.5, opacity: 0.9, marginTop: 2 }}>
                    Saare markets ki live list, timings aur results yaha se modify karein
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseAdminModal}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ maxHeight: '80vh', overflowY: 'auto', padding: '16px 14px' }}>
              {/* TOP SEARCH, DATE PICKER & FILTER TABS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {/* Search Input */}
                  <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="🔍 Search market (e.g. Kalyan, Milan, Gali)..."
                      value={marketSearch}
                      onChange={e => setMarketSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        fontSize: 13,
                        fontWeight: 600
                      }}
                    />
                    {marketSearch && (
                      <button
                        type="button"
                        onClick={() => setMarketSearch('')}
                        style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8' }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Target Date Picker */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={16} color="#0284C7" />
                    <input
                      type="date"
                      value={marketDateInput}
                      onChange={e => {
                        setMarketDateInput(e.target.value);
                        fetchMarkets(e.target.value);
                      }}
                      style={{
                        padding: '7px 10px',
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: '#0F172A'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fetchMarkets(marketDateInput)}
                      style={{
                        background: '#0284C7',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '7px 12px',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <RefreshCw size={13} />
                      <span>Refresh</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenCreateMarket}
                      style={{
                        background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '7px 14px',
                        fontSize: 12.5,
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <Plus size={15} />
                      <span>+ Create Market</span>
                    </button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="modal-filter-tabs" style={{ margin: 0 }}>
                  <button
                    type="button"
                    className={`modal-filter-tab ${marketFilter === 'ALL' ? 'active' : ''}`}
                    onClick={() => setMarketFilter('ALL')}
                  >
                    All ({markets.length})
                  </button>
                  <button
                    type="button"
                    className={`modal-filter-tab ${marketFilter === 'REGULAR' ? 'active' : ''}`}
                    onClick={() => setMarketFilter('REGULAR')}
                  >
                    Regular Matka
                  </button>
                  <button
                    type="button"
                    className={`modal-filter-tab ${marketFilter === 'DISAWAR' ? 'active' : ''}`}
                    onClick={() => setMarketFilter('DISAWAR')}
                  >
                    Disawar / Satta King
                  </button>
                  <button
                    type="button"
                    className={`modal-filter-tab ${marketFilter === 'ACTIVE' ? 'active' : ''}`}
                    onClick={() => setMarketFilter('ACTIVE')}
                  >
                    Active Only
                  </button>
                  <button
                    type="button"
                    className={`modal-filter-tab ${marketFilter === 'MODIFIED' ? 'active' : ''}`}
                    onClick={() => setMarketFilter('MODIFIED')}
                  >
                    Admin Modified
                  </button>
                </div>
              </div>

              {/* MODIFY RESULT INLINE POPUP / FORM */}
              {selectedMarketForModify && (() => {
                const isDisawar = ['DELHI BAZAR', 'SHREE GANESH', 'FARIDABAD', 'GAZIABAD', 'GALI', 'DESAWAR'].includes(
                  selectedMarketForModify.name.toUpperCase()
                );
                const openAnk = modifyOpenPanna ? calculateAnkFromPanna(modifyOpenPanna) : (isDisawar && modifyJodi ? modifyJodi[0] : '*');
                const closeAnk = modifyClosePanna ? calculateAnkFromPanna(modifyClosePanna) : (isDisawar && modifyJodi ? modifyJodi[1] : '*');
                const resultPreview = isDisawar 
                  ? (modifyJodi || 'XX')
                  : `${modifyOpenPanna || '***'}-${openAnk}${closeAnk}-${modifyClosePanna || '***'}`;

                return (
                  <div style={{
                    background: '#FFFBEB',
                    border: '2px solid #F59E0B',
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 16,
                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button
                          type="button"
                          onClick={handleCloseModifyModal}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            background: '#FDE68A',
                            border: '1.5px solid #D97706',
                            color: '#92400E',
                            borderRadius: 6,
                            padding: '4px 8px',
                            fontSize: 11,
                            fontWeight: 900,
                            cursor: 'pointer'
                          }}
                          title="Back to Market List"
                        >
                          <ArrowLeft size={14} strokeWidth={3} />
                          <span>BACK</span>
                        </button>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 900, color: '#92400E', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>✏️ MODIFY RESULT:</span>
                            <span style={{ color: '#B45309' }}>{selectedMarketForModify.name}</span>
                          </div>
                          <div style={{ fontSize: 11.5, color: '#B45309', fontWeight: 600 }}>
                            Target Date: {marketDateInput} • Timings: {selectedMarketForModify.open_time} - {selectedMarketForModify.close_time}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCloseModifyModal}
                        style={{ background: 'white', border: '1px solid #CBD5E1', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer' }}
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Explanatory Note */}
                    <div style={{
                      background: '#FEF3C7',
                      border: '1px solid #FDE68A',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 11.5,
                      color: '#92400E',
                      marginBottom: 12,
                      lineHeight: 1.4
                    }}>
                      ⚡ <strong>Auto-System Rule:</strong> Jab tak aap result modify nahi karte, tab tak automatic system pehle ki tarah chalta rahega. Result modify karne ke baad yeh result <strong>Lock (Manual Override)</strong> ho jayega aur automatic draw isko overwrite nahi karega.
                    </div>

                    {/* Input Fields */}
                    {isDisawar ? (
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#78350F', marginBottom: 4 }}>
                          Enter 2-Digit Satta King Jodi (00 - 99):
                        </label>
                        <input
                          type="text"
                          maxLength={2}
                          placeholder="e.g. 45"
                          value={modifyJodi}
                          onChange={e => setModifyJodi(e.target.value.replace(/[^0-9]/g, ''))}
                          style={{
                            fontSize: 22,
                            fontWeight: 900,
                            letterSpacing: 4,
                            textAlign: 'center',
                            width: 140,
                            padding: '8px',
                            borderRadius: 8,
                            border: '2px solid #F59E0B',
                            color: '#78350F'
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                        {/* Open Panna Input */}
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#78350F', marginBottom: 4 }}>
                            Open Pana (3 Digits):
                          </label>
                          <input
                            type="text"
                            maxLength={3}
                            placeholder="e.g. 110"
                            value={modifyOpenPanna}
                            onChange={e => setModifyOpenPanna(e.target.value.replace(/[^0-9]/g, ''))}
                            style={{
                              width: '100%',
                              fontSize: 16,
                              fontWeight: 900,
                              letterSpacing: 2,
                              padding: '8px 10px',
                              borderRadius: 8,
                              border: '1.5px solid #F59E0B'
                            }}
                          />
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#B45309', marginTop: 3 }}>
                            Open Ank: <strong>{modifyOpenPanna && modifyOpenPanna.length === 3 ? calculateAnkFromPanna(modifyOpenPanna) : '--'}</strong>
                          </div>
                        </div>

                        {/* Close Panna Input */}
                        <div>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#78350F', marginBottom: 4 }}>
                            Close Pana (3 Digits):
                          </label>
                          <input
                            type="text"
                            maxLength={3}
                            placeholder="e.g. 555"
                            value={modifyClosePanna}
                            onChange={e => setModifyClosePanna(e.target.value.replace(/[^0-9]/g, ''))}
                            style={{
                              width: '100%',
                              fontSize: 16,
                              fontWeight: 900,
                              letterSpacing: 2,
                              padding: '8px 10px',
                              borderRadius: 8,
                              border: '1.5px solid #F59E0B'
                            }}
                          />
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#B45309', marginTop: 3 }}>
                            Close Ank: <strong>{modifyClosePanna && modifyClosePanna.length === 3 ? calculateAnkFromPanna(modifyClosePanna) : '--'}</strong>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Result Live Preview Banner */}
                    <div style={{
                      background: '#1E293B',
                      color: 'white',
                      padding: '10px 14px',
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 14
                    }}>
                      <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 700 }}>NEW RESULT PREVIEW:</span>
                      <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: 2, color: '#FDE047' }}>
                        {resultPreview}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedMarketForModify(null)}
                        style={{
                          background: '#E2E8F0',
                          color: '#475569',
                          border: 'none',
                          borderRadius: 8,
                          padding: '9px 16px',
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveModifiedResult}
                        disabled={modifyLoading}
                        style={{
                          background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 8,
                          padding: '9px 20px',
                          fontSize: 13,
                          fontWeight: 900,
                          cursor: modifyLoading ? 'not-allowed' : 'pointer',
                          boxShadow: '0 3px 10px rgba(22, 163, 74, 0.35)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <CheckCircle size={16} />
                        <span>{modifyLoading ? 'Saving Result...' : 'Save & Declare Result (रिजल्ट सेव करें)'}</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* MARKETS LIST CARDS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {markets
                  .filter(m => {
                    const isDisawar = ['DELHI BAZAR', 'SHREE GANESH', 'FARIDABAD', 'GAZIABAD', 'GALI', 'DESAWAR'].includes(m.name.toUpperCase());
                    if (marketFilter === 'REGULAR' && isDisawar) return false;
                    if (marketFilter === 'DISAWAR' && !isDisawar) return false;
                    if (marketFilter === 'ACTIVE' && !m.is_active) return false;
                    if (marketFilter === 'MODIFIED' && !m.is_manual_override) return false;
                    if (marketSearch) {
                      const q = marketSearch.toLowerCase();
                      return m.name.toLowerCase().includes(q) || (m.hindi_name && m.hindi_name.toLowerCase().includes(q));
                    }
                    return true;
                  })
                  .map(m => {
                    const isDisawar = ['DELHI BAZAR', 'SHREE GANESH', 'FARIDABAD', 'GAZIABAD', 'GALI', 'DESAWAR'].includes(m.name.toUpperCase());
                    const displayResult = isDisawar
                      ? (m.jodi ? m.jodi : 'XX')
                      : (m.resultString ? m.resultString : '***-**-***');
                    const isModified = Boolean(m.is_manual_override);

                    return (
                      <div
                        key={m.id}
                        style={{
                          background: 'white',
                          border: isModified ? '1.5px solid #F59E0B' : '1px solid #E2E8F0',
                          borderRadius: 12,
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                          boxShadow: isModified ? '0 3px 10px rgba(245, 158, 11, 0.12)' : '0 2px 6px rgba(0,0,0,0.04)'
                        }}
                      >
                        {/* Top Row: Name, Badges & Timings */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 15, fontWeight: 900, color: '#0F172A' }}>{m.name}</span>
                              {m.hindi_name && (
                                <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>({m.hindi_name})</span>
                              )}
                              <span style={{
                                fontSize: 10,
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: 4,
                                background: isDisawar ? '#FDF2F8' : '#EFF6FF',
                                color: isDisawar ? '#DB2777' : '#2563EB',
                                border: `1px solid ${isDisawar ? '#FBCFE8' : '#BFDBFE'}`
                              }}>
                                {isDisawar ? 'Disawar / Satta' : 'Regular Matka'}
                              </span>
                            </div>
                            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                              Open Time: <strong>{m.open_time}</strong> | Close Time: <strong>{m.close_time}</strong>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              fontSize: 11,
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: 9999,
                              background: m.is_active ? '#DCFCE7' : '#F1F5F9',
                              color: m.is_active ? '#166534' : '#64748B'
                            }}>
                              {m.is_active ? '● Active' : '○ Disabled'}
                            </span>
                          </div>
                        </div>

                        {/* Middle Row: Result Box & Mode Status */}
                        <div style={{
                          background: '#F8FAFC',
                          borderRadius: 8,
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 8,
                          border: '1px solid #E2E8F0'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569' }}>TODAY&apos;S RESULT:</span>
                            <span style={{
                              fontSize: 15,
                              fontWeight: 900,
                              letterSpacing: 1.5,
                              color: isModified ? '#B45309' : '#0F172A',
                              background: isModified ? '#FEF3C7' : '#FFFFFF',
                              padding: '2px 8px',
                              borderRadius: 6,
                              border: `1px solid ${isModified ? '#FDE68A' : '#CBD5E1'}`
                            }}>
                              {displayResult}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {isModified ? (
                              <span style={{
                                fontSize: 11,
                                fontWeight: 800,
                                background: '#FEF3C7',
                                color: '#B45309',
                                padding: '3px 8px',
                                borderRadius: 6,
                                border: '1px solid #FDE68A'
                              }}>
                                ✏️ Modified by Admin (Locked)
                              </span>
                            ) : (
                              <span style={{
                                fontSize: 11,
                                fontWeight: 700,
                                background: '#E0F2FE',
                                color: '#0369A1',
                                padding: '3px 8px',
                                borderRadius: 6,
                                border: '1px solid #BAE6FD'
                              }}>
                                ⚡ Automatic System Active
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {/* Modify Result Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenModifyModal(m)}
                            style={{
                              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: 6,
                              padding: '6px 12px',
                              fontSize: 12,
                              fontWeight: 900,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              boxShadow: '0 2px 5px rgba(217, 119, 6, 0.3)'
                            }}
                          >
                            <span>✏️ Modify Result</span>
                          </button>

                          {/* Reset to Automatic Button (Shown if Admin Modified) */}
                          {isModified && (
                            <button
                              type="button"
                              onClick={() => handleResetMarketToAuto(m)}
                              style={{
                                background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 6,
                                padding: '6px 12px',
                                fontSize: 12,
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                              title="Reset back to automatic draw/sync"
                            >
                              <RotateCcw size={12} />
                              <span>Reset to Auto</span>
                            </button>
                          )}

                          {/* Edit Times */}
                          <button
                            type="button"
                            onClick={() => {
                              const newOpen = prompt(`Enter new Open Time for ${m.name} (e.g. 10:10 AM):`, m.open_time);
                              const newClose = prompt(`Enter new Close Time for ${m.name} (e.g. 11:10 AM):`, m.close_time);
                              if (newOpen && newClose) {
                                fetch(`/api/v1/admin/markets/${m.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                  body: JSON.stringify({ open_time: newOpen, close_time: newClose })
                                }).then(() => fetchMarkets(marketDateInput));
                              }
                            }}
                            style={{
                              background: '#F1F5F9',
                              color: '#334155',
                              border: '1px solid #CBD5E1',
                              borderRadius: 6,
                              padding: '6px 10px',
                              fontSize: 11.5,
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            ⏰ Edit Times
                          </button>

                          {/* Disable / Enable Market Toggle */}
                          <button
                            type="button"
                            onClick={() => {
                              fetch(`/api/v1/admin/markets/${m.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                                body: JSON.stringify({ is_active: m.is_active ? 0 : 1 })
                              }).then(() => fetchMarkets(marketDateInput));
                            }}
                            style={{
                              background: m.is_active ? '#FEE2E2' : '#DCFCE7',
                              color: m.is_active ? '#991B1B' : '#166534',
                              border: `1px solid ${m.is_active ? '#FCA5A5' : '#86EFAC'}`,
                              borderRadius: 6,
                              padding: '6px 10px',
                              fontSize: 11.5,
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            {m.is_active ? 'Disable' : 'Enable'}
                          </button>

                          {/* Delete Market Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Kya aap sach me "${m.name}" market ko delete (hataana) chahte hain?`)) {
                                fetch(`/api/v1/admin/markets/${m.id}`, {
                                  method: 'DELETE',
                                  headers: { 'Authorization': `Bearer ${token}` }
                                }).then(res => res.json()).then(data => {
                                  if (data.success) {
                                    alert(`Market "${m.name}" successfully hata diya gaya.`);
                                    fetchMarkets(marketDateInput);
                                  } else {
                                    alert(data.message || 'Error deleting market');
                                  }
                                });
                              }
                            }}
                            style={{
                              background: '#EF4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: 6,
                              padding: '6px 10px',
                              fontSize: 11.5,
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                            title="Market Hatayein (Delete)"
                          >
                            <Trash2 size={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SATTA KING LIVE AUTO-SYNC */}
      {activeModal === 'satta-king' && (
        <div className="admin-modal-overlay" onClick={handleCloseAdminModal}>
          <div className="admin-modal-box" style={{ maxWidth: 650, width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ background: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleCloseAdminModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1.5px solid rgba(255, 255, 255, 0.45)',
                    color: '#FFFFFF',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                  title="Go Back to Dashboard"
                >
                  <ArrowLeft size={16} strokeWidth={3} />
                  <span>BACK</span>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Radio size={20} />
                  <div style={{ fontWeight: 900, fontSize: 16 }}>MATKAPULSE LIVE AUTO-SYNC ENGINE</div>
                </div>
              </div>
              <button type="button" onClick={handleCloseAdminModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              {/* Status Header Banner */}
              <div style={{
                background: '#F0F9FF',
                border: '1px solid #BAE6FD',
                borderRadius: 10,
                padding: '12px 16px',
                marginBottom: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }}></span>
                    <strong style={{ color: '#0369A1', fontSize: 13 }}>Live Scraper Active (Auto-checks every 30s)</strong>
                  </div>
                  <span style={{ fontSize: 11, color: '#64748B' }}>
                    Source: <a href="https://matkapulse.com" target="_blank" rel="noreferrer" style={{ color: '#0284C7', fontWeight: 700 }}>matkapulse.com</a>
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#334155' }}>
                  <strong>Last Sync:</strong> {sattaKingStatus?.lastSyncAt ? new Date(sattaKingStatus.lastSyncAt).toLocaleTimeString() : 'In progress...'} • <span>{sattaKingStatus?.lastMessage || 'Connected'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={sattaKingSyncing}
                  onClick={handleSyncSattaKingNow}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                    padding: '10px 16px',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <RefreshCw size={15} className={sattaKingSyncing ? 'spin-icon' : ''} />
                  {sattaKingSyncing ? 'Scraping Live Results...' : 'SYNC LIVE RESULTS NOW'}
                </button>
              </div>

              {/* Matched Markets Live Table */}
              <div style={{ fontSize: 13, fontWeight: 900, color: '#0F172A', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span>MARKETS LIVE STATUS (MATKAPULSE.COM)</span>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Real-Time Draw Results</span>
              </div>

              <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                      <th style={{ padding: '8px 10px', fontWeight: 800 }}>Market Name</th>
                      <th style={{ padding: '8px 10px', fontWeight: 800, textAlign: 'center' }}>Scraped Today</th>
                      <th style={{ padding: '8px 10px', fontWeight: 800, textAlign: 'center' }}>Scraped Yesterday</th>
                      <th style={{ padding: '8px 10px', fontWeight: 800, textAlign: 'right' }}>Sync State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(sattaKingStatus?.matchedMarkets && sattaKingStatus.matchedMarkets.length > 0) ? (
                      sattaKingStatus.matchedMarkets.map((m: any, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', background: idx % 2 === 0 ? 'white' : '#FAFAFA' }}>
                          <td style={{ padding: '8px 10px', fontWeight: 800, color: '#0F172A' }}>
                            {m.marketName}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            {m.todayResult ? (
                              <span style={{ background: '#DCFCE7', color: '#166534', fontWeight: 900, padding: '2px 8px', borderRadius: 6, fontSize: 13 }}>
                                {m.todayResult}
                              </span>
                            ) : (
                              <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Pending Draw</span>
                            )}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'center', color: '#475569', fontWeight: 700 }}>
                            {m.yesterdayResult || '--'}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                            {m.status === 'UPDATED' && (
                              <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: 10, fontWeight: 900, padding: '2px 6px', borderRadius: 4 }}>
                                UPDATED & SETTLED
                              </span>
                            )}
                            {m.status === 'ALREADY_SET' && (
                              <span style={{ background: '#DCFCE7', color: '#166534', fontSize: 10, fontWeight: 900, padding: '2px 6px', borderRadius: 4 }}>
                                LIVE IN SYNC
                              </span>
                            )}
                            {m.status === 'AWAITING_DRAW' && (
                              <span style={{ background: '#F1F5F9', color: '#64748B', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                                AWAITING TIME
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: 20, color: '#64748B' }}>
                          Click 'SYNC LIVE RESULTS NOW' to fetch current board.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Monthly Chart Historical Sync Section */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 14 }}>
                <div style={{ fontWeight: 900, fontSize: 13, color: '#0F172A', marginBottom: 6 }}>
                  📊 HISTORICAL MONTHLY CHART SYNC
                </div>
                <div style={{ fontSize: 11, color: '#64748B', marginBottom: 12 }}>
                  MatkaPulse (matkapulse.com) ke genuine daily results automatically apni database me import karne ke liye month select karein.
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    type="month"
                    value={sattaKingMonthInput}
                    onChange={e => setSattaKingMonthInput(e.target.value)}
                    className="admin-input"
                    style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={sattaKingMonthSyncing}
                    onClick={() => handleSyncSattaKingMonth(sattaKingMonthInput)}
                    style={{
                      background: '#0D9488',
                      padding: '8px 16px',
                      fontSize: 13,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {sattaKingMonthSyncing ? 'Syncing Chart...' : 'Sync Month Chart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW MARKET (FULL ADMIN CONTROL) */}
      {showCreateMarketModal && (
        <div className="admin-modal-overlay" onClick={handleCloseCreateMarket}>
          <div className="admin-modal-box" style={{ maxWidth: 540, width: '95%' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ background: 'linear-gradient(90deg, #059669 0%, #10B981 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleCloseCreateMarket}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1.5px solid rgba(255, 255, 255, 0.45)',
                    color: '#FFFFFF',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                  title="Back to Markets"
                >
                  <ArrowLeft size={16} strokeWidth={3} />
                  <span>BACK</span>
                </button>
                <div style={{ fontWeight: 900, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Plus size={20} />
                  <span>CREATE NEW MARKET (Full Control)</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseCreateMarket}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateMarket} className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 18 }}>
              {/* Market Name English */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#334155', marginBottom: 4 }}>
                  MARKET NAME (ENGLISH) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KALYAN PRO, GOA STAR, SUPREME KING"
                  value={newMarketForm.name}
                  onChange={e => setNewMarketForm(f => ({ ...f, name: e.target.value.toUpperCase() }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700 }}
                />
              </div>

              {/* Market Name Hindi */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#334155', marginBottom: 4 }}>
                  HINDI NAME (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="e.g. कल्याण प्रो, गोवा स्टार"
                  value={newMarketForm.hindi_name}
                  onChange={e => setNewMarketForm(f => ({ ...f, hindi_name: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 600 }}
                />
              </div>

              {/* Timings 24-hr & 12-hr Pickers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* Open Time */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#334155', marginBottom: 4 }}>
                    OPEN TIME (Clock) *
                  </label>
                  <input
                    type="time"
                    required
                    value={newMarketForm.open_time_24}
                    onChange={e => {
                      const t24 = e.target.value;
                      setNewMarketForm(f => ({
                        ...f,
                        open_time_24: t24,
                        open_time: convert24To12(t24)
                      }));
                    }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700 }}
                  />
                  <div style={{ fontSize: 11, color: '#059669', fontWeight: 800, marginTop: 3 }}>
                    Display: {newMarketForm.open_time || '10:00 AM'}
                  </div>
                </div>

                {/* Close Time */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#334155', marginBottom: 4 }}>
                    CLOSE TIME (Clock) *
                  </label>
                  <input
                    type="time"
                    required
                    value={newMarketForm.close_time_24}
                    onChange={e => {
                      const t24 = e.target.value;
                      setNewMarketForm(f => ({
                        ...f,
                        close_time_24: t24,
                        close_time: convert24To12(t24)
                      }));
                    }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700 }}
                  />
                  <div style={{ fontSize: 11, color: '#059669', fontWeight: 800, marginTop: 3 }}>
                    Display: {newMarketForm.close_time || '11:00 AM'}
                  </div>
                </div>
              </div>

              {/* Sort Order & Result Mode */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#334155', marginBottom: 4 }}>
                    SORT ORDER (Position)
                  </label>
                  <input
                    type="number"
                    value={newMarketForm.sort_order}
                    onChange={e => setNewMarketForm(f => ({ ...f, sort_order: parseInt(e.target.value, 10) || 50 }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#334155', marginBottom: 4 }}>
                    RESULT MODE
                  </label>
                  <select
                    value={newMarketForm.result_mode}
                    onChange={e => setNewMarketForm(f => ({ ...f, result_mode: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, fontWeight: 700 }}
                  >
                    <option value="MANUAL">MANUAL (Admin declare)</option>
                    <option value="AUTOMATIC">AUTOMATIC (MatkaPulse sync)</option>
                  </select>
                </div>
              </div>

              {/* Status (Active / Disabled) */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#334155', marginBottom: 4 }}>
                  INITIAL STATUS
                </label>
                <div style={{ display: 'flex', gap: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#166534' }}>
                    <input
                      type="radio"
                      name="market_status"
                      checked={newMarketForm.is_active === 1}
                      onChange={() => setNewMarketForm(f => ({ ...f, is_active: 1 }))}
                    />
                    <span>● Active (Live for users)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#64748B' }}>
                    <input
                      type="radio"
                      name="market_status"
                      checked={newMarketForm.is_active === 0}
                      onChange={() => setNewMarketForm(f => ({ ...f, is_active: 0 }))}
                    />
                    <span>○ Disabled</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={handleCloseCreateMarket}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    background: '#F1F5F9',
                    color: '#475569',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMarketLoading}
                  style={{
                    padding: '9px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                    color: 'white',
                    fontSize: 13,
                    fontWeight: 900,
                    cursor: createMarketLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  {createMarketLoading ? 'Creating Market...' : '✓ Create Market Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT / SCREENSHOT LIGHTBOX MODAL */}
      {selectedReceipt && (
        <div
          className="admin-modal-overlay"
          style={{ zIndex: 9999, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)' }}
          onClick={handleCloseReceipt}
        >
          <div
            className="admin-modal-box"
            style={{ maxWidth: 640, width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="admin-modal-header" style={{ background: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleCloseReceipt}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1.5px solid rgba(255, 255, 255, 0.45)',
                    color: '#FFFFFF',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                  title="Back to Deposits"
                >
                  <ArrowLeft size={16} strokeWidth={3} />
                  <span>BACK</span>
                </button>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>PAYMENT SCREENSHOT VERIFICATION</div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>
                    {selectedReceipt.user_name} ({selectedReceipt.user_phone}) • ₹{selectedReceipt.amount}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseReceipt}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
              <div style={{ background: '#F8FAFC', padding: 12, borderRadius: 10, border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, fontSize: 12 }}>
                <div><strong>Amount:</strong> <span style={{ color: '#16A34A', fontWeight: 900, fontSize: 15 }}>₹{selectedReceipt.amount}</span></div>
                <div><strong>UTR / Ref No:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0F172A' }}>{selectedReceipt.utr_number || 'N/A'}</span></div>
                <div><strong>User:</strong> {selectedReceipt.user_name} ({selectedReceipt.user_phone})</div>
                <div><strong>Submitted At:</strong> {selectedReceipt.created_at ? new Date(selectedReceipt.created_at).toLocaleString() : 'N/A'}</div>
              </div>

              <div style={{
                background: '#0B0F17',
                borderRadius: 10,
                padding: 10,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 280,
                maxHeight: '52vh',
                overflow: 'hidden'
              }}>
                <img
                  src={selectedReceipt.receipt_url}
                  alt="Payment Receipt"
                  style={{ maxWidth: '100%', maxHeight: '50vh', objectFit: 'contain', borderRadius: 6 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <a
                  href={selectedReceipt.receipt_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: '#F1F5F9',
                    color: '#0F172A',
                    fontSize: 12,
                    fontWeight: 800,
                    textDecoration: 'none',
                    border: '1px solid #CBD5E1'
                  }}
                >
                  Open Original Image ↗
                </a>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: 13, background: '#DC2626' }}
                    onClick={() => {
                      const depositId = selectedReceipt.id;
                      handleCloseReceipt();
                      handleRejectDeposit(depositId);
                    }}
                  >
                    REJECT
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ padding: '8px 18px', fontSize: 13, background: '#16A34A' }}
                    onClick={() => {
                      const depositId = selectedReceipt.id;
                      handleCloseReceipt();
                      handleApproveDeposit(depositId);
                    }}
                  >
                    APPROVE & CREDIT (₹{selectedReceipt.amount})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SECURITY, MASTER PASSWORD & ACTIVE LOGGED-IN PHONES */}
      {activeModal === 'security' && adminUser?.role !== 'SUBORDINATE' && (
        <div className="admin-modal-overlay" onClick={handleCloseAdminModal}>
          <div className="admin-modal-box" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ background: '#0F172A', borderBottom: '1.5px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleCloseAdminModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1.5px solid rgba(255, 255, 255, 0.35)',
                    color: '#FFFFFF',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                  title="Go Back to Dashboard"
                >
                  <ArrowLeft size={16} strokeWidth={3} />
                  <span>BACK</span>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: 16 }}>
                  <KeyRound size={20} color="#F59E0B" />
                  <span>SECURITY, PASSWORD & CONNECTED PHONES</span>
                </div>
              </div>
              <button type="button" onClick={handleCloseAdminModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ maxHeight: '80vh', overflowY: 'auto', padding: 20 }}>
              {/* Section 1: Change Master Password */}
              <div style={{ background: '#1E293B', padding: 18, borderRadius: 12, marginBottom: 20, border: '1px solid #334155', color: '#F8FAFC' }}>
                <h3 style={{ fontSize: 15, fontWeight: 900, marginBottom: 8, color: '#FDE047', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={16} /> Change Admin Password
                </h3>
                <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 14 }}>
                  Jaise hi aap password change karenge, is current device ke alawa baaki sabhi phones aur computers se admin panel turant logout ho jayega!
                </p>

                {changePassMsg && (
                  <div style={{
                    padding: 10,
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 700,
                    marginBottom: 12,
                    background: changePassMsg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: changePassMsg.type === 'success' ? '#10B981' : '#EF4444',
                    border: `1px solid ${changePassMsg.type === 'success' ? '#10B981' : '#EF4444'}`
                  }}>
                    {changePassMsg.text}
                  </div>
                )}

                <form onSubmit={handleChangePassword}>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                      Current Password:
                    </label>
                    <input
                      type="password"
                      required
                      className="input-field"
                      style={{ background: '#0F172A', color: 'white', borderColor: '#475569' }}
                      value={currPasswordInput}
                      onChange={e => setCurrPasswordInput(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                        New Password:
                      </label>
                      <input
                        type="password"
                        required
                        className="input-field"
                        style={{ background: '#0F172A', color: 'white', borderColor: '#475569' }}
                        value={newPasswordInput}
                        onChange={e => setNewPasswordInput(e.target.value)}
                        placeholder="Min 6 characters"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                        Confirm New Password:
                      </label>
                      <input
                        type="password"
                        required
                        className="input-field"
                        style={{ background: '#0F172A', color: 'white', borderColor: '#475569' }}
                        value={confirmPasswordInput}
                        onChange={e => setConfirmPasswordInput(e.target.value)}
                        placeholder="Re-enter new password"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={changePassLoading}
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#000', fontWeight: 900 }}
                  >
                    {changePassLoading ? 'Changing Password...' : '🔑 UPDATE PASSWORD & LOGOUT OTHER PHONES'}
                  </button>
                </form>
              </div>

              {/* Section 2: Active Connected Phones / Devices */}
              <div style={{ background: '#1E293B', padding: 18, borderRadius: 12, border: '1px solid #334155', color: '#F8FAFC' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 900, color: '#38BDF8', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Smartphone size={16} /> Active Logged-in Devices & Phones ({sessions.length})
                    </h3>
                    <p style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 2 }}>
                      Admin panel kitne phones ya computers mein khula hai yahan dekhein:
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={fetchSessions}
                      className="shortcut-btn"
                      style={{ padding: '6px 12px', fontSize: 11.5, background: '#334155', color: 'white' }}
                    >
                      <RefreshCw size={12} className={loadingSessions ? 'anim-spin' : ''} />
                      Refresh
                    </button>
                    {sessions.filter(s => !s.is_current).length > 0 && (
                      <button
                        type="button"
                        onClick={handleLogoutAllOthers}
                        className="shortcut-btn"
                        style={{ padding: '6px 12px', fontSize: 11.5, background: '#DC2626', color: 'white' }}
                      >
                        <LogOut size={12} />
                        Logout All Other Phones
                      </button>
                    )}
                  </div>
                </div>

                {loadingSessions ? (
                  <div style={{ textAlign: 'center', padding: 20, color: '#94A3B8' }}>Loading connected devices...</div>
                ) : sessions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20, color: '#94A3B8' }}>No active sessions found</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {sessions.map(s => (
                      <div
                        key={s.id}
                        style={{
                          background: s.is_current ? 'rgba(16, 185, 129, 0.1)' : '#0F172A',
                          border: `1.5px solid ${s.is_current ? '#10B981' : '#334155'}`,
                          borderRadius: 10,
                          padding: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 10
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: s.is_current ? '#065F46' : '#1E293B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: s.is_current ? '#34D399' : '#94A3B8'
                          }}>
                            <Smartphone size={18} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 800, fontSize: 13, color: '#FFFFFF' }}>{s.device_name}</span>
                              {s.is_current && (
                                <span style={{ background: '#10B981', color: '#000', fontSize: 10, fontWeight: 900, padding: '2px 6px', borderRadius: 6 }}>
                                  CURRENT DEVICE
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                              <span>IP: <strong style={{ color: '#E2E8F0' }}>{s.ip_address}</strong></span>
                              <span>Logged in: {new Date(s.login_time).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {!s.is_current && (
                          <button
                            type="button"
                            onClick={() => handleRevokeSession(s.id)}
                            style={{
                              background: '#DC2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: 6,
                              padding: '6px 12px',
                              fontSize: 11.5,
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <LogOut size={12} />
                            Logout Device
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE SUBORDINATE & ADMIN MANAGEMENT */}
      {activeModal === 'sub-admins' && adminUser?.role !== 'SUBORDINATE' && (
        <div className="admin-modal-overlay" onClick={handleCloseAdminModal}>
          <div className="admin-modal-box" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ background: '#0F172A', borderBottom: '1.5px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleCloseAdminModal}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1.5px solid rgba(255, 255, 255, 0.35)',
                    color: '#FFFFFF',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                  title="Go Back to Dashboard"
                >
                  <ArrowLeft size={16} strokeWidth={3} />
                  <span>BACK</span>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: 16 }}>
                  <UserPlus size={20} color="#38BDF8" />
                  <span>CREATE SUBORDINATE & ADMIN MANAGEMENT</span>
                </div>
              </div>
              <button type="button" onClick={handleCloseAdminModal} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ maxHeight: '80vh', overflowY: 'auto', padding: 20 }}>
              {/* Section 1: Create New Subordinate */}
              <div style={{ background: '#1E293B', padding: 18, borderRadius: 12, marginBottom: 20, border: '1px solid #334155', color: '#F8FAFC' }}>
                <h3 style={{ fontSize: 15, fontWeight: 900, marginBottom: 8, color: '#38BDF8', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <UserPlus size={16} /> Create Subordinate or Admin Account
                </h3>
                <p style={{ fontSize: 11.5, color: '#94A3B8', marginBottom: 14 }}>
                  Subordinate account ko sirf Game, Result aur Deposit/Withdrawal manage karne ki permission hoti hai. Subordinate ko <strong>Change Password</strong> aur <strong>Active Logged-in Devices</strong> nahi dikhenge.
                </p>

                {subAdminMsg && (
                  <div style={{
                    padding: 10,
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 700,
                    marginBottom: 12,
                    background: subAdminMsg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: subAdminMsg.type === 'success' ? '#10B981' : '#EF4444',
                    border: `1px solid ${subAdminMsg.type === 'success' ? '#10B981' : '#EF4444'}`
                  }}>
                    {subAdminMsg.text}
                  </div>
                )}

                <form onSubmit={handleCreateSubAdmin}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                        Username:
                      </label>
                      <input
                        type="text"
                        required
                        className="input-field"
                        style={{ background: '#0F172A', color: 'white', borderColor: '#475569' }}
                        value={newSubUser}
                        onChange={e => setNewSubUser(e.target.value)}
                        placeholder="e.g. staff1"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                        Password:
                      </label>
                      <input
                        type="password"
                        required
                        className="input-field"
                        style={{ background: '#0F172A', color: 'white', borderColor: '#475569' }}
                        value={newSubPass}
                        onChange={e => setNewSubPass(e.target.value)}
                        placeholder="Enter password"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                        Full Name / Label:
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        style={{ background: '#0F172A', color: 'white', borderColor: '#475569' }}
                        value={newSubName}
                        onChange={e => setNewSubName(e.target.value)}
                        placeholder="e.g. Staff Operator"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#CBD5E1', marginBottom: 4 }}>
                        Account Role:
                      </label>
                      <select
                        className="input-field"
                        style={{ background: '#0F172A', color: 'white', borderColor: '#475569' }}
                        value={newSubRole}
                        onChange={e => setNewSubRole(e.target.value as any)}
                      >
                        <option value="SUBORDINATE">Subordinate (Restricted - No Password/Sessions)</option>
                        <option value="ADMIN">Admin (Full Administrative Access)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={createSubLoading}
                    style={{ background: 'linear-gradient(135deg, #0284C7, #0369A1)', color: '#FFF', fontWeight: 900 }}
                  >
                    {createSubLoading ? 'Creating...' : '+ CREATE SUBORDINATE ACCOUNT'}
                  </button>
                </form>
              </div>

              {/* Section 2: Existing Subordinate Accounts */}
              <div style={{ background: '#1E293B', padding: 18, borderRadius: 12, border: '1px solid #334155', color: '#F8FAFC' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 900, color: '#FDE047', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={16} /> Sub-Admin Accounts ({subAdminsList.length})
                  </h3>
                  <button
                    type="button"
                    onClick={fetchSubAdmins}
                    className="shortcut-btn"
                    style={{ padding: '6px 12px', fontSize: 11.5, background: '#334155', color: 'white' }}
                  >
                    <RefreshCw size={12} className={loadingSubAdmins ? 'anim-spin' : ''} />
                    Refresh
                  </button>
                </div>

                {loadingSubAdmins ? (
                  <div style={{ textAlign: 'center', padding: 20, color: '#94A3B8' }}>Loading accounts...</div>
                ) : subAdminsList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20, color: '#94A3B8' }}>No subordinate accounts created yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {subAdminsList.map(sub => (
                      <div
                        key={sub.id}
                        style={{
                          background: '#0F172A',
                          border: '1px solid #334155',
                          borderRadius: 8,
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 800, fontSize: 13, color: 'white' }}>{sub.username}</span>
                            <span style={{
                              background: sub.role === 'SUBORDINATE' ? '#B45309' : '#0284C7',
                              color: 'white',
                              fontSize: 10,
                              fontWeight: 900,
                              padding: '2px 6px',
                              borderRadius: 6
                            }}>
                              {sub.role}
                            </span>
                            {sub.full_name && <span style={{ fontSize: 12, color: '#94A3B8' }}>({sub.full_name})</span>}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                            Created: {new Date(sub.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteSubAdmin(sub.id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid #EF4444',
                            color: '#EF4444',
                            padding: '5px 10px',
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Floating Back Exit Toast */}
      {adminBackToastMsg && (
        <div style={{
          position: 'fixed',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#FDE047',
          padding: '10px 22px',
          borderRadius: 24,
          fontSize: 13,
          fontWeight: 800,
          zIndex: 999999,
          boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
          border: '1.5px solid rgba(245, 158, 11, 0.6)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap'
        }}>
          {adminBackToastMsg}
        </div>
      )}
      </main>
    </div>
  );
};
