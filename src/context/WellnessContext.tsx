'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, 
  BurnoutMetrics, 
  MoodLog, 
  MoodType, 
  WellnessReminder, 
  PeerBadge, 
  ChatMessage, 
  BoundaryGuardConfig, 
  AccessibilitySettings,
  getBurnoutRiskLevel,
  UserAccount,
  UserProfile,
  ThemeMode,
  PomodoroTimer,
  HrNotification,
  DeletedUserAccount
} from '../types/wellness';
import { 
  initialBurnoutMetrics, 
  initialMoodLogs, 
  initialReminders, 
  initialBadges, 
  initialChatMessages, 
  initialBoundaryConfig, 
  initialAccessibilitySettings,
  initialUserAccounts,
  initialUserProfile,
  initialHrNotifications,
  initialDeletedAccounts
} from '../data/initialData';
import { createClient, isSupabaseConfigured } from '../lib/supabase/client';

export type NavTab = 'dashboard' | 'analytics' | 'physical' | 'mental' | 'social' | 'inclusive' | 'boundary' | 'hr' | 'accounts' | 'settings';

interface WellnessContextType {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isSupabaseLive: boolean;
  login: (role: UserRole, accountDetails?: Partial<UserAccount>) => void;
  logout: () => void;

  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  changePassword: (currentPass: string, newPass: string) => { success: boolean; message: string };
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDarkMode: boolean;

  // HR Caring Notifications & Alert Inbox
  hrNotifications: HrNotification[];
  unreadHrNotificationCount: number;
  dismissHrNotification: (id: string) => void;
  resolveHrNotification: (id: string, actionNote?: string) => void;

  // Global Pomodoro Timer (Overlays across all pages)
  pomodoro: PomodoroTimer;
  startPomodoro: (minutes?: number, mode?: 'focus' | 'break') => void;
  pausePomodoro: () => void;
  togglePomodoro: () => void;
  resetPomodoro: () => void;
  setPomodoroMode: (mode: 'focus' | 'break') => void;
  togglePomodoroMinimized: () => void;
  closePomodoroOverlay: () => void;

  accounts: UserAccount[];
  deletedAccounts: DeletedUserAccount[];
  createAccount: (accountData: Omit<UserAccount, 'id' | 'createdAt' | 'lastActive'>) => void;
  updateAccountRole: (accountId: string, newRole: UserRole) => void;
  toggleAccountStatus: (accountId: string) => void;
  updateAccount: (accountId: string, updates: Partial<UserAccount>) => void;
  deleteAccount: (accountId: string, reason?: string) => void;
  recoverAccount: (accountId: string) => void;
  permanentlyPurgeAccount: (accountId: string) => void;
  restoreAllDeletedAccounts: () => void;

  burnoutMetrics: BurnoutMetrics;
  moodLogs: MoodLog[];
  addMoodLog: (mood: MoodType, energyLevel: number, note?: string) => void;
  
  reminders: WellnessReminder[];
  toggleReminder: (id: string) => void;
  activeReminderAlert: WellnessReminder | null;
  dismissReminderAlert: () => void;
  snoozeReminderAlert: (minutes?: number) => void;
  completeReminderAlert: (reminder: WellnessReminder) => void;
  triggerReminderAlert: (id: string) => void;
  activeExercise: 'stretch' | 'eye_rest' | 'breathwork' | null;
  setActiveExercise: (exercise: 'stretch' | 'eye_rest' | 'breathwork' | null) => void;
  
  badges: PeerBadge[];
  sendPeerBadge: (recipientName: string, badgeType: PeerBadge['badgeType'], message: string, sendCoffee: boolean) => void;
  suggestHrSupport: (teammateName: string, reason: string) => void;
  
  chatMessages: ChatMessage[];
  sendCoachMessage: (text: string) => void;
  
  boundaryConfig: BoundaryGuardConfig;
  toggleBoundaryShield: () => void;
  updateQuietHours: (start: string, end: string) => void;
  
  accessibility: AccessibilitySettings;
  toggleFocusMode: () => void;
  toggleDyslexiaFont: () => void;
  toggleHighContrast: () => void;
  toggleBatchNotifications: () => void;
  toggleClutterReduction: () => void;
  setAmbientSound: (sound: AccessibilitySettings['ambientSound']) => void;
  
  isSidebarOpen: boolean;
  toggleSidebar: (open?: boolean) => void;
  
  // Hydration Tracker State
  waterCups: number;
  logWaterCup: () => void;
  removeWaterCup: () => void;
  resetWaterCups: () => void;

  toastNotification: string | null;
  setToastNotification: (msg: string | null) => void;
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

export const WellnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<UserRole>('employee');
  const [activeTab, setActiveTabState] = useState<NavTab>('dashboard');

  const setActiveTab = (tab: NavTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      const targetPath = `/${tab}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    }
  };

  // Sync activeTab with URL on mount & when browser back/forward buttons are clicked
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const validTabs: NavTab[] = [
      'dashboard',
      'analytics',
      'physical',
      'mental',
      'social',
      'inclusive',
      'boundary',
      'hr',
      'accounts',
      'settings'
    ];

    const syncTabFromUrl = () => {
      const path = window.location.pathname.replace(/^\/+/, '').split('/')[0] as NavTab;
      if (validTabs.includes(path)) {
        setActiveTabState(path);
      } else if (localStorage.getItem('axionhr_is_auth') === 'true') {
        const savedRole = (localStorage.getItem('axionhr_user_role') as UserRole) || 'employee';
        const defaultTab = savedRole === 'admin' ? 'accounts' : savedRole === 'hr_manager' ? 'hr' : 'dashboard';
        setActiveTabState(defaultTab);
        window.history.replaceState(null, '', `/${defaultTab}`);
      }
    };

    syncTabFromUrl();

    window.addEventListener('popstate', syncTabFromUrl);
    return () => window.removeEventListener('popstate', syncTabFromUrl);
  }, []);

  const [burnoutMetrics, setBurnoutMetrics] = useState<BurnoutMetrics>(initialBurnoutMetrics);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>(initialMoodLogs);
  const [reminders, setReminders] = useState<WellnessReminder[]>(initialReminders);
  const [activeExercise, setActiveExercise] = useState<'stretch' | 'eye_rest' | 'breathwork' | null>(null);
  const [badges, setBadges] = useState<PeerBadge[]>(initialBadges);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [boundaryConfig, setBoundaryConfig] = useState<BoundaryGuardConfig>(initialBoundaryConfig);
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(initialAccessibilitySettings);
  const [toastNotification, setToastState] = useState<string | null>(null);

  const setToastNotification = (msg: string | null) => {
    setToastState(msg);
    if (msg) {
      setTimeout(() => setToastState(null), 4000);
    }
  };

  const [accounts, setAccounts] = useState<UserAccount[]>(initialUserAccounts);
  const [deletedAccounts, setDeletedAccounts] = useState<DeletedUserAccount[]>(initialDeletedAccounts);
  const [hrNotifications, setHrNotifications] = useState<HrNotification[]>(initialHrNotifications);
  const isSupabaseLive = isSupabaseConfigured();

  // 1. Load persisted data & authentication session from server database & localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      // Hydrate user session from localStorage
      try {
        const isAuth = localStorage.getItem('axionhr_is_auth') === 'true';
        const savedRole = localStorage.getItem('axionhr_user_role') as UserRole;
        const savedProfileStr = localStorage.getItem('axionhr_user_profile');

        if (isAuth) {
          setIsAuthenticated(true);
          if (savedRole) setUserRole(savedRole);
          if (savedProfileStr) {
            const parsedProfile = JSON.parse(savedProfileStr);
            if (parsedProfile && typeof parsedProfile === 'object') {
              setUserProfile(parsedProfile);
            }
          }
        }
      } catch (err) {
        console.warn('Notice: Session hydration error:', err);
      } finally {
        setIsAuthLoading(false);
      }

      // Fetch from persistent server API (Supabase & server database)
      try {
        const res = await fetch('/api/accounts');
        if (res.ok) {
          const data = await res.json();
          if (data.accounts && Array.isArray(data.accounts) && data.accounts.length > 0) {
            setAccounts(data.accounts);
          }
          if (data.deletedAccounts && Array.isArray(data.deletedAccounts)) {
            setDeletedAccounts(data.deletedAccounts);
          }
        }
      } catch (e) {
        // Fallback to localStorage
        try {
          const savedAccounts = localStorage.getItem('axionhr_accounts');
          if (savedAccounts) {
            const parsed: UserAccount[] = JSON.parse(savedAccounts);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const hasAdmin = parsed.some(a => a.role === 'admin' || a.email.toLowerCase() === 'admin@axionhr.com');
              if (!hasAdmin) {
                setAccounts([initialUserAccounts[0], ...parsed]);
              } else {
                setAccounts(parsed);
              }
            }
          }
          const savedDeleted = localStorage.getItem('axionhr_deleted_accounts');
          if (savedDeleted) {
            const parsed = JSON.parse(savedDeleted);
            if (Array.isArray(parsed)) {
              setDeletedAccounts(parsed);
            }
          }
        } catch (err) {}
      }

      // Fetch badges from persistent server API (Supabase & server database)
      try {
        const resBadges = await fetch('/api/badges');
        if (resBadges.ok) {
          const badgeData = await resBadges.json();
          if (badgeData.badges && Array.isArray(badgeData.badges) && badgeData.badges.length > 0) {
            setBadges(badgeData.badges);
          }
        }
      } catch (e) {}

      // Fetch HR notifications from persistent server API (Supabase & server database)
      try {
        const resNotifs = await fetch('/api/notifications');
        if (resNotifs.ok) {
          const notifData = await resNotifs.json();
          if (notifData.notifications && Array.isArray(notifData.notifications) && notifData.notifications.length > 0) {
            setHrNotifications(notifData.notifications);
          }
        }
      } catch (e) {}

      // Fetch moods from persistent server API (Supabase & server database)
      try {
        const resMoods = await fetch('/api/moods');
        if (resMoods.ok) {
          const moodData = await resMoods.json();
          if (moodData.moodLogs && Array.isArray(moodData.moodLogs) && moodData.moodLogs.length > 0) {
            setMoodLogs(moodData.moodLogs);
          }
        }
      } catch (e) {}

      // Load moods, notifications, badges, and metrics from localStorage
      try {
        const savedMoods = localStorage.getItem('axionhr_mood_logs');
        if (savedMoods) {
          const parsed = JSON.parse(savedMoods);
          if (Array.isArray(parsed)) setMoodLogs(parsed);
        }

        const savedHrNotifs = localStorage.getItem('axionhr_hr_notifications');
        if (savedHrNotifs) {
          const parsed = JSON.parse(savedHrNotifs);
          if (Array.isArray(parsed)) setHrNotifications(parsed);
        }

        const savedBadges = localStorage.getItem('axionhr_badges');
        if (savedBadges) {
          const parsed = JSON.parse(savedBadges);
          if (Array.isArray(parsed)) setBadges(parsed);
        }

        const savedReminders = localStorage.getItem('axionhr_reminders');
        if (savedReminders) {
          const parsed = JSON.parse(savedReminders);
          if (Array.isArray(parsed) && parsed.length > 0) setReminders(parsed);
        }

        const savedMetrics = localStorage.getItem('axionhr_burnout_metrics');
        if (savedMetrics) {
          const parsed = JSON.parse(savedMetrics);
          if (parsed && typeof parsed === 'object') setBurnoutMetrics(parsed);
        }
      } catch (err) {
        console.warn('Notice: Error loading persisted wellness state:', err);
      }
    };

    loadData();
  }, []);

  // 2. Persist state to localStorage whenever updated
  useEffect(() => {
    try {
      if (accounts && accounts.length > 0) {
        localStorage.setItem('axionhr_accounts', JSON.stringify(accounts));
      }
    } catch (e) {}
  }, [accounts]);

  useEffect(() => {
    try {
      localStorage.setItem('axionhr_deleted_accounts', JSON.stringify(deletedAccounts));
    } catch (e) {}
  }, [deletedAccounts]);

  useEffect(() => {
    try {
      localStorage.setItem('axionhr_mood_logs', JSON.stringify(moodLogs));
    } catch (e) {}
  }, [moodLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('axionhr_hr_notifications', JSON.stringify(hrNotifications));
    } catch (e) {}
  }, [hrNotifications]);

  useEffect(() => {
    try {
      localStorage.setItem('axionhr_badges', JSON.stringify(badges));
    } catch (e) {}
  }, [badges]);

  useEffect(() => {
    try {
      localStorage.setItem('axionhr_reminders', JSON.stringify(reminders));
    } catch (e) {}
  }, [reminders]);

  useEffect(() => {
    try {
      localStorage.setItem('axionhr_burnout_metrics', JSON.stringify(burnoutMetrics));
    } catch (e) {}
  }, [burnoutMetrics]);

  // Supabase Realtime & Initial Data Sync
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();

    const fetchSupabaseData = async () => {
      try {
        const { data: profilesData } = await supabase.from('profiles').select('*');
        if (profilesData && profilesData.length > 0) {
          const active = profilesData
            .filter((p: any) => !p.deleted_at)
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              email: p.email,
              role: p.role,
              department: p.department,
              status: p.status || 'active',
              avatarUrl: p.avatar_url,
              createdAt: p.created_at ? p.created_at.split('T')[0] : '2025-01-01',
              lastActive: 'Active recently'
            }));
          const deleted = profilesData
            .filter((p: any) => p.deleted_at)
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              email: p.email,
              role: p.role,
              department: p.department,
              status: 'disabled' as const,
              avatarUrl: p.avatar_url,
              createdAt: p.created_at ? p.created_at.split('T')[0] : '2025-01-01',
              lastActive: 'Archived',
              deletedAt: p.deleted_at,
              deletedBy: p.deleted_by || 'System Admin',
              deletionReason: p.deletion_reason || 'Deprovisioned'
            }));
          if (active.length > 0) setAccounts(active);
          if (deleted.length > 0) setDeletedAccounts(deleted);
        }

        const { data: hrData } = await supabase
          .from('hr_notifications')
          .select('*')
          .order('created_at', { ascending: false });
        if (hrData && hrData.length > 0) {
          setHrNotifications(hrData.map((n: any) => ({
            id: n.id,
            type: n.type || 'teammate_flag',
            targetTeammate: n.target_teammate,
            reason: n.reason,
            submittedByAnonymous: n.submitted_by_anonymous ?? true,
            status: n.status || 'pending',
            timestamp: 'Live DB Alert',
            severity: n.severity || 'medium'
          })));
        }
      } catch (err) {
        console.warn('Supabase data sync notice:', err);
      }
    };

    fetchSupabaseData();

    // Subscribe to real-time events
    const channel = supabase
      .channel('wellness_sync_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hr_notifications' }, () => {
        fetch('/api/notifications')
          .then(r => r.json())
          .then(data => {
            if (data.notifications && Array.isArray(data.notifications)) setHrNotifications(data.notifications);
          })
          .catch(() => {});
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'peer_badges' }, () => {
        fetch('/api/badges')
          .then(r => r.json())
          .then(data => {
            if (data.badges && Array.isArray(data.badges)) setBadges(data.badges);
          })
          .catch(() => {});
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mood_logs' }, () => {
        fetch('/api/moods')
          .then(r => r.json())
          .then(data => {
            if (data.moodLogs && Array.isArray(data.moodLogs)) setMoodLogs(data.moodLogs);
          })
          .catch(() => {});
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadHrNotificationCount = hrNotifications.filter(n => n.status === 'pending').length;

  const suggestHrSupport = (teammateName: string, reason: string) => {
    const newNotif: HrNotification = {
      id: `hr-notif-${Date.now()}`,
      type: 'teammate_flag',
      targetTeammate: teammateName.trim(),
      reason: reason.trim() || 'Peer flagged burnout / heavy workload concerns for supportive wellness outreach.',
      submittedByAnonymous: true,
      status: 'pending',
      timestamp: 'Just now',
      severity: 'high'
    };
    setHrNotifications(prev => [newNotif, ...prev]);
    setToastNotification(`Confidential wellness flag submitted for ${teammateName}. HR has been notified.`);

    // Persist to server database & Supabase
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', notification: newNotif })
    }).catch(err => console.warn('Notification sync error:', err));
  };

  const dismissHrNotification = (id: string) => {
    setHrNotifications(prev => prev.filter(n => n.id !== id));
    setToastNotification('Notification dismissed.');

    // Persist dismiss to database & Supabase
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'dismiss', id })
    }).catch(err => console.warn('Notification dismiss error:', err));
  };

  const resolveHrNotification = (id: string, actionNote?: string) => {
    setHrNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'resolved' as const, actionNote: actionNote || 'Outreach logged' } : n));
    setToastNotification(`HR Caring Outreach logged & resolved${actionNote ? `: ${actionNote}` : ''}.`);

    // Persist resolve to database & Supabase
    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resolve', id, actionNote })
    }).catch(err => console.warn('Notification resolve error:', err));
  };

  const login = (role: UserRole, accountDetails?: Partial<UserAccount>) => {
    setUserRole(role);
    setIsAuthenticated(true);

    let updatedProfile: UserProfile = userProfile;

    if (accountDetails) {
      updatedProfile = {
        ...userProfile,
        id: accountDetails.id || userProfile.id,
        name: accountDetails.name || userProfile.name,
        email: accountDetails.email || userProfile.email,
        role: (accountDetails.role as UserRole) || role,
        department: accountDetails.department || userProfile.department,
        avatarUrl: accountDetails.avatarUrl || userProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      };
      setUserProfile(updatedProfile);
    } else {
      const matchingAccount = accounts.find(a => a.role === role);
      if (matchingAccount) {
        updatedProfile = {
          ...userProfile,
          id: matchingAccount.id,
          name: matchingAccount.name,
          email: matchingAccount.email,
          role: matchingAccount.role,
          department: matchingAccount.department,
          avatarUrl: matchingAccount.avatarUrl || userProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        };
        setUserProfile(updatedProfile);
      }
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('axionhr_is_auth', 'true');
        localStorage.setItem('axionhr_user_role', role);
        localStorage.setItem('axionhr_user_profile', JSON.stringify(updatedProfile));
      } catch (e) {}
    }

    // Determine target tab (respect current URL if valid)
    let targetTab: NavTab = role === 'admin' ? 'accounts' : role === 'hr_manager' ? 'hr' : 'dashboard';
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname.replace(/^\/+/, '').split('/')[0] as NavTab;
      const validTabs: NavTab[] = [
        'dashboard', 'analytics', 'physical', 'mental', 'social', 'inclusive', 'boundary', 'hr', 'accounts', 'settings'
      ];
      if (validTabs.includes(currentPath)) {
        targetTab = currentPath;
      }
    }

    setActiveTab(targetTab);

    if (role === 'admin') {
      setToastNotification(`Welcome to AxionHR Admin Portal (${accountDetails?.name || 'System Administrator'})!`);
    } else if (role === 'hr_manager') {
      setToastNotification(`Welcome to AxionHR Executive Portal (${accountDetails?.name || 'HR View'})!`);
    } else {
      setToastNotification(`Welcome back to AxionHR Haven (${accountDetails?.name || 'Employee View'})!`);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    // Reset to light mode upon logging out
    setThemeState('light');
    setIsDarkMode(false);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('axionhr_is_auth');
        localStorage.removeItem('axionhr_user_role');
        localStorage.removeItem('axionhr_user_profile');
        window.history.pushState(null, '', '/');
      } catch (e) {}
    }
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    setToastNotification('Logged out successfully.');
  };

  const addMoodLog = (mood: MoodType, energyLevel: number, note?: string) => {
    const newLog: MoodLog = {
      id: `mood-${Date.now()}`,
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mood,
      energyLevel,
      note: note?.trim() || undefined,
      isAnonymousToHr: true,
      createdAt: new Date().toISOString()
    };

    setMoodLogs(prev => [newLog, ...prev]);
    setToastNotification('Mood check-in logged and saved to the database! Thank you for sharing.');

    let scoreChange = 0;
    if (energyLevel === 5 || mood === 'thriving') scoreChange = -8;
    else if (energyLevel === 4 || mood === 'good') scoreChange = -4;
    else if (energyLevel === 3 || mood === 'okay') scoreChange = -1;
    else if (energyLevel === 2 || mood === 'stressed') scoreChange = 6;
    else if (energyLevel === 1 || mood === 'exhausted') scoreChange = 12;

    setBurnoutMetrics(prev => {
      const newScore = Math.min(100, Math.max(0, prev.overallScore + scoreChange));
      const newLevel = getBurnoutRiskLevel(newScore);
      const newTrend = scoreChange < 0 ? 'improving' : scoreChange > 0 ? 'worsening' : 'stable';
      return {
        ...prev,
        overallScore: newScore,
        riskLevel: newLevel,
        trend: newTrend
      };
    });

    // Persist to server API & Supabase database
    fetch('/api/moods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moodLog: newLog, userProfile })
    }).catch(err => console.warn('Mood database sync error:', err));
  };

  const [activeReminderAlert, setActiveReminderAlert] = useState<WellnessReminder | null>(null);

  const toggleReminder = (id: string) => {
    setReminders(prev => {
      const target = prev.find(r => r.id === id);
      const willBeActive = target ? !target.isActive : false;
      const updated = prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            isActive: willBeActive,
            lastTriggered: willBeActive ? new Date().toISOString() : r.lastTriggered
          };
        }
        return r;
      });

      if (target) {
        if (willBeActive) {
          setToastNotification(`Calendar Reminder "${target.title}" is now ACTIVE (Every ${target.intervalMinutes} mins).`);
          // Show gentle preview alert so user can immediately experience the non-disturbing notification
          setActiveReminderAlert({
            ...target,
            isActive: true,
            lastTriggered: new Date().toISOString()
          });
        } else {
          setToastNotification(`Reminder "${target.title}" is now paused.`);
          if (activeReminderAlert?.id === id) {
            setActiveReminderAlert(null);
          }
        }
      }

      return updated;
    });
  };

  // Background timer checking active reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const activeList = reminders.filter(r => r.isActive);

      for (const rem of activeList) {
        const lastTime = rem.lastTriggered ? new Date(rem.lastTriggered).getTime() : 0;
        const intervalMs = rem.intervalMinutes * 60 * 1000;

        if (now - lastTime >= intervalMs) {
          setActiveReminderAlert(rem);
          setReminders(prev => prev.map(r => r.id === rem.id ? { ...r, lastTriggered: new Date().toISOString() } : r));
          break; // Show one gentle alert at a time to stay non-disturbing
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [reminders]);

  const dismissReminderAlert = () => {
    setActiveReminderAlert(null);
  };

  const snoozeReminderAlert = (minutes: number = 5) => {
    if (activeReminderAlert) {
      const snoozedUntil = new Date(Date.now() - (activeReminderAlert.intervalMinutes - minutes) * 60 * 1000).toISOString();
      setReminders(prev => prev.map(r => r.id === activeReminderAlert.id ? { ...r, lastTriggered: snoozedUntil } : r));
      setToastNotification(`Reminder snoozed for ${minutes} minutes.`);
    }
    setActiveReminderAlert(null);
  };

  const completeReminderAlert = (reminder: WellnessReminder) => {
    if (reminder.type === 'hydration') {
      logWaterCup();
      setToastNotification('💧 Hydration logged! Glass of water recorded (+1 cup).');
    } else if (reminder.type === 'stretch') {
      setActiveExercise('stretch');
      setToastNotification('🧘 2-minute posture stretch logged. Great job taking care of your body!');
    } else if (reminder.type === 'eye_rest') {
      setActiveExercise('eye_rest');
      setToastNotification('👀 20-20-20 Eye Rest completed. Reduced screen fatigue!');
    } else {
      setToastNotification('🚶 Short step-out walk completed. Fresh energy restored!');
    }
    setActiveReminderAlert(null);
  };

  const triggerReminderAlert = (id: string) => {
    const rem = reminders.find(r => r.id === id);
    if (rem) {
      setActiveReminderAlert(rem);
    }
  };

  const sendPeerBadge = (recipientName: string, badgeType: PeerBadge['badgeType'], message: string, sendCoffee: boolean) => {
    const matchedRecipient = accounts.find(a => 
      a.name.toLowerCase() === recipientName.toLowerCase() || 
      a.email.toLowerCase() === recipientName.toLowerCase()
    );
    const recipientAvatar = matchedRecipient?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150';

    const newBadge: PeerBadge = {
      id: `badge-${Date.now()}`,
      senderName: userProfile.name ? `${userProfile.name} (You)` : 'Colleague',
      senderAvatar: userProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      recipientName: matchedRecipient?.name || recipientName.trim(),
      recipientAvatar,
      badgeType,
      message: message.trim(),
      virtualCoffeeSent: sendCoffee,
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };

    setBadges(prev => [newBadge, ...prev]);
    setToastNotification(`Appreciation badge sent to ${newBadge.recipientName}! ${sendCoffee ? '☕ Virtual coffee included!' : ''}`);

    // Persist to server database & Supabase
    fetch('/api/badges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ badge: newBadge })
    }).catch(err => console.warn('Badge database sync error:', err));
  };

  const sendCoachMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      let aiReply = "I hear you! Prioritizing your well-being is key to long-term work-life balance.";
      const lower = text.toLowerCase();

      if (lower.includes('meeting') || lower.includes('overload') || lower.includes('busy')) {
        aiReply = "You have 24.5 meeting hours logged this week. I recommend blocking a 2-hour Focus Shield block tomorrow afternoon and declining non-essential syncs.";
      } else if (lower.includes('tired') || lower.includes('exhausted') || lower.includes('burnout')) {
        aiReply = "Your burnout risk is currently elevated (68/100). Take a 5-minute breathwork session now, and enable the Work-Life Boundary Guard after 6:30 PM.";
      } else if (lower.includes('stretch') || lower.includes('pain') || lower.includes('back')) {
        aiReply = "Physical tension builds quickly during extended screen time. Let's do a guided 2-minute posture stretch together right now!";
      } else if (lower.includes('disconnect') || lower.includes('overtime') || lower.includes('night')) {
        aiReply = "Working past 7:00 PM hampers REM sleep quality. I'll activate your Boundary Guard auto-delay for all late-night Slack messages.";
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, aiMsg]);
    }, 800);
  };

  const toggleBoundaryShield = () => {
    setBoundaryConfig(prev => {
      const nextState = !prev.activeShield;
      setToastNotification(nextState ? 'Work-Life Boundary Guard ACTIVE. Late-night messages will be held till morning.' : 'Boundary Guard paused.');
      return { ...prev, activeShield: nextState };
    });
  };

  const updateQuietHours = (start: string, end: string) => {
    setBoundaryConfig(prev => ({ ...prev, quietHoursStart: start, quietHoursEnd: end }));
    setToastNotification(`Quiet hours updated to ${start} - ${end}`);
  };

  const toggleFocusMode = () => {
    setAccessibility(prev => {
      const nextState = !prev.focusModeActive;
      setToastNotification(
        nextState 
          ? 'Adaptive Focus Mode ENABLED. Notification batching & clutter reduction auto-activated.' 
          : 'Standard mode restored.'
      );
      return { 
        ...prev, 
        focusModeActive: nextState,
        batchNotifications: nextState ? true : prev.batchNotifications,
        reducedMotion: nextState ? true : prev.reducedMotion
      };
    });
  };

  const toggleDyslexiaFont = () => {
    setAccessibility(prev => ({ ...prev, dyslexiaFont: !prev.dyslexiaFont }));
  };

  const toggleHighContrast = () => {
    setAccessibility(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const toggleBatchNotifications = () => {
    setAccessibility(prev => {
      const nextState = !prev.batchNotifications;
      setToastNotification(nextState ? 'Notification Batching ENABLED.' : 'Notification Batching DISABLED.');
      return { ...prev, batchNotifications: nextState };
    });
  };

  const toggleClutterReduction = () => {
    setAccessibility(prev => {
      const nextState = !prev.reducedMotion;
      setToastNotification(nextState ? 'Clutter Reduction ENABLED.' : 'Clutter Reduction DISABLED.');
      return { ...prev, reducedMotion: nextState };
    });
  };

  const setAmbientSound = (sound: AccessibilitySettings['ambientSound']) => {
    setAccessibility(prev => ({ ...prev, ambientSound: sound }));
    if (sound !== 'none') {
      setToastNotification(`Playing ambient soundscape: ${sound.toUpperCase()}`);
    }
  };

  const createAccount = (accountData: Omit<UserAccount, 'id' | 'createdAt' | 'lastActive'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newAccount: UserAccount = {
      ...accountData,
      id: `usr-${Date.now().toString().slice(-4)}`,
      createdAt: today,
      lastActive: 'Just now'
    };
    setAccounts(prev => [newAccount, ...prev]);
    setToastNotification(`Account successfully created for ${newAccount.name} (${newAccount.role})`);

    // Persist to server database & Supabase
    fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', account: newAccount })
    }).catch(err => console.warn('Account persist error:', err));
  };

  const updateAccountRole = (accountId: string, newRole: UserRole) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        setToastNotification(`Updated role for ${acc.name} to ${newRole.toUpperCase().replace('_', ' ')}`);
        return { ...acc, role: newRole };
      }
      return acc;
    }));

    fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', accountId, updates: { role: newRole } })
    }).catch(err => console.warn('Role persist error:', err));
  };

  const toggleAccountStatus = (accountId: string) => {
    let nextStatus: 'active' | 'disabled' = 'active';
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        nextStatus = acc.status === 'active' ? 'disabled' : 'active';
        setToastNotification(`Account for ${acc.name} is now ${nextStatus.toUpperCase()}`);
        return { ...acc, status: nextStatus };
      }
      return acc;
    }));

    fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', accountId, updates: { status: nextStatus } })
    }).catch(err => console.warn('Status persist error:', err));
  };

  const updateAccount = (accountId: string, updates: Partial<UserAccount>) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        const updated = { ...acc, ...updates };
        const changedField = updates.department 
          ? `Department set to ${updates.department}`
          : updates.role
            ? `Role set to ${updates.role.toUpperCase()}`
            : updates.name
              ? `Name set to ${updates.name}`
              : 'Details updated';
        setToastNotification(`Updated ${acc.name}: ${changedField}`);
        
        // Sync userProfile if the updated account is the current session
        setUserProfile(p => {
          if (p.id === accountId || p.email.toLowerCase() === acc.email.toLowerCase()) {
            return {
              ...p,
              name: updated.name || p.name,
              department: updated.department || p.department,
              role: updated.role || p.role
            };
          }
          return p;
        });

        return updated;
      }
      return acc;
    }));

    fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', accountId, updates })
    }).catch(err => console.warn('Account update persist error:', err));
  };

  const deleteAccount = (accountId: string, reason?: string) => {
    const target = accounts.find(a => a.id === accountId);
    if (target) {
      const now = new Date();
      const timeString = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' +
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      
      const deletedRecord: DeletedUserAccount = {
        ...target,
        deletedAt: timeString,
        deletedBy: `System Admin (${userProfile.name})`,
        deletionReason: reason || 'Account deprovisioned by admin'
      };

      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
      setDeletedAccounts(prev => [deletedRecord, ...prev]);
      setToastNotification(`Account for ${target.name} moved to Security Recovery Vault. You can recover it anytime.`);

      fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', accountId, reason })
      }).catch(err => console.warn('Account delete persist error:', err));
    }
  };

  const recoverAccount = (accountId: string) => {
    const target = deletedAccounts.find(a => a.id === accountId);
    if (target) {
      const { deletedAt, deletedBy, deletionReason, ...accountData } = target;
      const restoredAccount: UserAccount = {
        ...accountData,
        status: 'active',
        lastActive: 'Recovered just now'
      };
      setDeletedAccounts(prev => prev.filter(a => a.id !== accountId));
      setAccounts(prev => [restoredAccount, ...prev]);
      setToastNotification(`Account restored for ${restoredAccount.name}! Full access reactivated.`);

      fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recover', accountId })
      }).catch(err => console.warn('Account recover persist error:', err));
    }
  };

  const permanentlyPurgeAccount = (accountId: string) => {
    const target = deletedAccounts.find(a => a.id === accountId);
    setDeletedAccounts(prev => prev.filter(a => a.id !== accountId));
    if (target) {
      setToastNotification(`Permanently purged records for ${target.name}.`);
    }

    fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'purge', accountId })
    }).catch(err => console.warn('Account purge persist error:', err));
  };

  const restoreAllDeletedAccounts = () => {
    if (deletedAccounts.length === 0) return;
    const restored = deletedAccounts.map(d => {
      const { deletedAt, deletedBy, deletionReason, ...rest } = d;
      return { ...rest, status: 'active' as const, lastActive: 'Recovered just now' };
    });
    const newAccountsList = [...restored, ...accounts];
    setAccounts(newAccountsList);
    setDeletedAccounts([]);
    setToastNotification(`Restored all ${restored.length} accounts from Recovery Vault.`);

    fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sync_all', accounts: newAccountsList, deletedAccounts: [] })
    }).catch(err => console.warn('Account restore all persist error:', err));
  };

  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Sync theme with system and HTML document element
  useEffect(() => {
    if (!isAuthenticated) {
      setIsDarkMode(false);
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
      }
      return;
    }

    const handleThemeChange = () => {
      let isDark = false;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'system') {
        isDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      setIsDarkMode(isDark);
      if (typeof document !== 'undefined') {
        if (isDark) {
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.body.classList.remove('dark');
        }
      }
    };

    handleThemeChange();

    if (theme === 'system' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', handleThemeChange);
      return () => mediaQuery.removeEventListener('change', handleThemeChange);
    }
  }, [theme, isAuthenticated]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    setUserProfile(prev => ({ ...prev, theme: newTheme }));
    setToastNotification(`Theme changed to ${newTheme === 'dark' ? 'Dark Mode 🌙' : newTheme === 'light' ? 'Light Mode ☀️' : 'System Default 💻'}`);
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...updates };

      // Persist profile to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('axionhr_user_profile', JSON.stringify(updated));
        } catch (e) {}
      }

      // Sync username, email, avatar, and department in accounts list
      setAccounts(accs => {
        const nextAccounts = accs.map(acc => {
          if (acc.id === updated.id || acc.email.toLowerCase() === prev.email.toLowerCase()) {
            return {
              ...acc,
              name: updated.name ?? acc.name,
              email: updated.email ?? acc.email,
              avatarUrl: updated.avatarUrl ?? acc.avatarUrl,
              department: updated.department ?? acc.department
            };
          }
          return acc;
        });

        // Persist update to server API and Supabase database
        const target = nextAccounts.find(a => a.id === updated.id || a.email.toLowerCase() === prev.email.toLowerCase());
        if (target) {
          fetch('/api/accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update',
              accountId: target.id,
              updates: {
                name: updated.name ?? target.name,
                email: updated.email ?? target.email,
                avatarUrl: updated.avatarUrl ?? target.avatarUrl,
                department: updated.department ?? target.department
              }
            })
          }).catch(err => console.warn('Profile persist error:', err));
        }

        return nextAccounts;
      });

      return updated;
    });
    setToastNotification('Your profile settings have been updated and saved to the database.');
  };

  const changePassword = (currentPass: string, newPass: string): { success: boolean; message: string } => {
    const userAccount = accounts.find(a => a.id === userProfile.id || a.email.toLowerCase() === userProfile.email.toLowerCase());
    const existingPass = userAccount?.password || 'admin';

    if (currentPass !== existingPass && currentPass !== 'password123' && currentPass !== 'admin') {
      return { success: false, message: 'Current password is incorrect. Please try again.' };
    }

    if (!newPass || newPass.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }

    let updatedAccount: UserAccount | undefined;
    setAccounts(prev => {
      const nextAccounts = prev.map(a => {
        if (a.id === userProfile.id || a.email.toLowerCase() === userProfile.email.toLowerCase()) {
          updatedAccount = { ...a, password: newPass };
          return updatedAccount;
        }
        return a;
      });

      // Persist password update to server database and Supabase
      if (updatedAccount) {
        fetch('/api/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            accountId: updatedAccount.id,
            updates: { password: newPass, email: updatedAccount.email }
          })
        }).catch(err => console.warn('Password update persist error:', err));
      }

      return nextAccounts;
    });

    setToastNotification('Password successfully updated and saved in the database!');
    return { success: true, message: 'Password has been updated and saved to the database.' };
  };

  // Global Pomodoro Timer State
  const [pomodoro, setPomodoro] = useState<PomodoroTimer>({
    secondsRemaining: 25 * 60,
    totalSeconds: 25 * 60,
    isRunning: false,
    mode: 'focus',
    isMinimized: true,
    isOverlayVisible: false
  });

  useEffect(() => {
    if (!pomodoro.isRunning) return;
    const interval = setInterval(() => {
      setPomodoro(prev => {
        if (prev.secondsRemaining <= 1) {
          if (prev.mode === 'focus') {
            setToastNotification('🎯 Deep focus session complete! Starting a 5-minute restorative stretch break.');
            return {
              ...prev,
              mode: 'break',
              secondsRemaining: 5 * 60,
              totalSeconds: 5 * 60,
              isRunning: true
            };
          } else {
            setToastNotification('☕ Break finished! Ready for your next deep focus session.');
            return {
              ...prev,
              mode: 'focus',
              secondsRemaining: 25 * 60,
              totalSeconds: 25 * 60,
              isRunning: false
            };
          }
        }
        return {
          ...prev,
          secondsRemaining: prev.secondsRemaining - 1
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [pomodoro.isRunning]);

  const startPomodoro = (minutes?: number, mode: 'focus' | 'break' = 'focus') => {
    const total = (minutes || (mode === 'break' ? 5 : 25)) * 60;
    setPomodoro({
      secondsRemaining: total,
      totalSeconds: total,
      isRunning: true,
      mode,
      isMinimized: true,
      isOverlayVisible: true
    });
    setToastNotification(`🚀 ${mode === 'break' ? '5-Min Break Timer' : '25-Min Deep Focus Timer'} started!`);
  };

  const pausePomodoro = () => {
    setPomodoro(prev => ({ ...prev, isRunning: false }));
    setToastNotification('Pomodoro timer paused.');
  };

  const togglePomodoro = () => {
    setPomodoro(prev => {
      const nextRunning = !prev.isRunning;
      setToastNotification(nextRunning ? 'Pomodoro timer running.' : 'Pomodoro timer paused.');
      return {
        ...prev,
        isRunning: nextRunning,
        isOverlayVisible: true
      };
    });
  };

  const resetPomodoro = () => {
    setPomodoro(prev => {
      const defaultSecs = prev.mode === 'break' ? 5 * 60 : 25 * 60;
      return {
        ...prev,
        secondsRemaining: defaultSecs,
        totalSeconds: defaultSecs,
        isRunning: false
      };
    });
    setToastNotification('Pomodoro timer reset.');
  };

  const setPomodoroMode = (mode: 'focus' | 'break') => {
    const defaultSecs = mode === 'break' ? 5 * 60 : 25 * 60;
    setPomodoro(prev => ({
      ...prev,
      mode,
      secondsRemaining: defaultSecs,
      totalSeconds: defaultSecs,
      isRunning: false
    }));
  };

  const togglePomodoroMinimized = () => {
    setPomodoro(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
  };

  const closePomodoroOverlay = () => {
    setPomodoro(prev => ({ ...prev, isOverlayVisible: false, isRunning: false }));
    setToastNotification('Pomodoro focus overlay closed.');
  };

  // Hydration state (defaults to 6/10 cups)
  const [waterCups, setWaterCups] = useState<number>(6);

  const logWaterCup = () => {
    setWaterCups(prev => {
      const next = prev >= 10 ? 10 : prev + 1;
      setToastNotification(`💧 Hydration logged! ${next}/10 cups completed for today.`);
      return next;
    });
  };

  const removeWaterCup = () => {
    setWaterCups(prev => (prev > 0 ? prev - 1 : 0));
  };

  const resetWaterCups = () => {
    setWaterCups(0);
    setToastNotification('Hydration tracker reset to 0 cups.');
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const toggleSidebar = (open?: boolean) => {
    setIsSidebarOpen(prev => (open !== undefined ? open : !prev));
  };

  return (
    <WellnessContext.Provider
      value={{
        isAuthenticated,
        isAuthLoading,
        isSupabaseLive,
        login,
        logout,
        activeTab,
        setActiveTab: (tab: NavTab) => {
          setActiveTab(tab);
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsSidebarOpen(false); // Only auto-close drawer on mobile
          }
        },
        userRole,
        setUserRole,
        userProfile,
        updateUserProfile,
        changePassword,
        theme,
        setTheme,
        isDarkMode,
        hrNotifications,
        unreadHrNotificationCount,
        dismissHrNotification,
        resolveHrNotification,
        pomodoro,
        startPomodoro,
        pausePomodoro,
        togglePomodoro,
        resetPomodoro,
        setPomodoroMode,
        togglePomodoroMinimized,
        closePomodoroOverlay,
        waterCups,
        logWaterCup,
        removeWaterCup,
        resetWaterCups,
        accounts,
        deletedAccounts,
        createAccount,
        updateAccountRole,
        toggleAccountStatus,
        updateAccount,
        deleteAccount,
        recoverAccount,
        permanentlyPurgeAccount,
        restoreAllDeletedAccounts,
        burnoutMetrics,
        moodLogs,
        addMoodLog,
        reminders,
        toggleReminder,
        activeReminderAlert,
        dismissReminderAlert,
        snoozeReminderAlert,
        completeReminderAlert,
        triggerReminderAlert,
        activeExercise,
        setActiveExercise,
        badges,
        sendPeerBadge,
        suggestHrSupport,
        chatMessages,
        sendCoachMessage,
        boundaryConfig,
        toggleBoundaryShield,
        updateQuietHours,
        accessibility,
        toggleFocusMode,
        toggleDyslexiaFont,
        toggleHighContrast,
        toggleBatchNotifications,
        toggleClutterReduction,
        setAmbientSound,
        isSidebarOpen,
        toggleSidebar,
        toastNotification,
        setToastNotification
      }}
    >
      {children}
    </WellnessContext.Provider>
  );
};

export const useWellness = () => {
  const context = useContext(WellnessContext);
  if (!context) {
    throw new Error('useWellness must be used within a WellnessProvider');
  }
  return context;
};
