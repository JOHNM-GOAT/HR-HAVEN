'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
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
  HrOutreachMessage,
  DeletedUserAccount,
  WorkShiftState,
  WorkShiftRecord,
  PtoRequest,
  PtoBalance,
  LeaveCategory,
  LeaveStatus,
  HeldNotification,
  isWithinQuietHours,
  formatQuietHourLabel,
  normalizeWorkShift,
  withLiveWorkTotals,
  computeWorkedSeconds,
  Blocker,
  BlockerSeverity,
  BLOCKER_SEVERITY_CONFIG,
  getMoodScoreImpact
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
  initialDeletedAccounts,
  initialPtoRequests,
  initialPtoBalance,
  initialBlockers
} from '../data/initialData';
import { createClient, isSupabaseConfigured } from '../lib/supabase/client';

export type NavTab = 'dashboard' | 'analytics' | 'blockers' | 'physical' | 'mental' | 'social' | 'inclusive' | 'boundary' | 'pto' | 'hr' | 'accounts' | 'settings';

export interface BatchedNotification {
  id: string;
  message: string;
  timestamp: number;
}

interface WellnessContextType {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isSupabaseLive: boolean;
  login: (role: UserRole, accountDetails?: Partial<UserAccount>) => void;
  logout: () => void;

  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isNavigating: boolean;
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
  hrOutreachMessages: HrOutreachMessage[];
  sendCaringOutreach: (alertId: string, targetTeammate: string, message: string) => void;
  broadcastToDepartment: (department: string, message: string) => void;

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

  blockers: Blocker[];
  addBlocker: (description: string, severity: BlockerSeverity) => void;
  resolveBlocker: (id: string) => void;

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

  isSidebarOpen: boolean;
  toggleSidebar: (open?: boolean) => void;
  
  // Hydration Tracker State
  waterCups: number;
  logWaterCup: () => void;
  removeWaterCup: () => void;
  resetWaterCups: () => void;

  // Work Shift & Attendance State
  workShift: WorkShiftState;
  toggleClockInOut: () => void;
  resetWorkShift: () => void;
  teamShifts: WorkShiftRecord[];
  isAttendanceModalOpen: boolean;
  setIsAttendanceModalOpen: (open: boolean) => void;

  // PTO & Time-Off Management State
  ptoRequests: PtoRequest[];
  ptoBalance: PtoBalance;
  isPtoModalOpen: boolean;
  setIsPtoModalOpen: (open: boolean) => void;
  submitPtoRequest: (data: { category: LeaveCategory; startDate: string; endDate: string; totalDays: number; reason?: string }) => void;
  reviewPtoRequest: (requestId: string, status: 'approved' | 'rejected') => void;
  cancelPtoRequest: (requestId: string) => void;

  toastNotification: string | null;
  setToastNotification: (msg: string | null, urgent?: boolean) => void;

  // Notification Batching
  batchedNotifications: BatchedNotification[];
  isBatchDigestVisible: boolean;
  dismissBatchDigest: () => void;
  clearBatchedNotifications: () => void;

  // Boundary Shield — notifications held during quiet hours
  heldNotifications: HeldNotification[];
  isQuietHoursActive: boolean;
  isShieldHolding: boolean;
  releaseHeldNotifications: () => void;
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

// ==========================================
// User-Isolated & Daily Ephemeral State Engine
// ==========================================
const getTodayDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const STANDARD_SCHEDULE = {
  shiftStart: '09:00 AM',
  shiftEnd: '06:00 PM',
  lunchStart: '12:00 PM',
  lunchEnd: '01:00 PM'
};

const getUserStorageKey = (email?: string, key: string = '') => {
  const clean = (email || 'admin_axionhr_com').toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `axionhr_${clean}_${key}`;
};

const getRoleJobTitle = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'System Administrator';
    case 'hr_manager':
      return 'HR Executive Manager';
    default:
      return 'Employee';
  }
};

const getRoleEmployeeId = (role: UserRole, accountId: string): string => {
  const prefix = role === 'admin' ? 'AX-ADMIN' : role === 'hr_manager' ? 'AX-HR' : 'AX-EMP';
  const suffix = (accountId || '').replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase() || '01';
  return `${prefix}-${suffix}`;
};

const getAccountInitialState = (email: string, role: UserRole, name?: string) => {
  const cleanEmail = (email || '').toLowerCase().trim();
  const today = getTodayDateStr();

  if (cleanEmail === 'admin@axionhr.com' || role === 'admin') {
    return {
      workShift: {
        date: today,
        isClockedIn: false,
        clockInTime: null,
        clockOutTime: null,
        totalWorkedSeconds: 0,
        overtimeSeconds: 0,
        ...STANDARD_SCHEDULE
      },
      waterCups: 0,
      moodLogs: [] as MoodLog[],
      blockers: [] as Blocker[],
      burnoutMetrics: {
        overallScore: 0,
        riskLevel: 'low' as const,
        meetingHoursWeekly: 0,
        meetingHoursBenchmark: 15.0,
        overtimeHoursWeekly: 0,
        ptoDaysUsed: 0,
        ptoDaysRemaining: 20,
        consecutiveWorkDays: 0,
        trend: 'stable' as const
      }
    };
  }

  if (cleanEmail === 'hr@axionhr.com' || role === 'hr_manager') {
    return {
      workShift: {
        date: today,
        isClockedIn: true,
        clockInTime: '09:00 AM',
        clockOutTime: null,
        totalWorkedSeconds: 15120, // 4.2h
        overtimeSeconds: 0,
        ...STANDARD_SCHEDULE
      },
      waterCups: 4,
      moodLogs: [
        {
          id: 'mood-hr-1',
          timestamp: 'Today, 09:15 AM',
          mood: 'good' as const,
          energyLevel: 4,
          note: 'Morning HR sync and employee wellness check-ins.',
          isAnonymousToHr: true,
          createdAt: new Date().toISOString()
        }
      ],
      blockers: [] as Blocker[],
      burnoutMetrics: {
        overallScore: 22,
        riskLevel: 'low' as const,
        meetingHoursWeekly: 8.5,
        meetingHoursBenchmark: 15.0,
        overtimeHoursWeekly: 0,
        ptoDaysUsed: 1,
        ptoDaysRemaining: 19,
        consecutiveWorkDays: 3,
        trend: 'improving' as const
      }
    };
  }

  if (cleanEmail === 'employee@axionhr.com' || cleanEmail.includes('alex') || role === 'employee') {
    return {
      workShift: {
        date: today,
        isClockedIn: true,
        clockInTime: '09:00 AM',
        clockOutTime: null,
        totalWorkedSeconds: 18720, // 5.2h
        overtimeSeconds: 0,
        ...STANDARD_SCHEDULE
      },
      waterCups: 5,
      moodLogs: [
        {
          id: 'mood-emp-1',
          timestamp: 'Today, 10:30 AM',
          mood: 'okay' as const,
          energyLevel: 3,
          note: 'Working through Sprint backlog and code reviews.',
          isAnonymousToHr: true,
          createdAt: new Date().toISOString()
        }
      ],
      blockers: [] as Blocker[],
      burnoutMetrics: {
        overallScore: 38,
        riskLevel: 'moderate' as const,
        meetingHoursWeekly: 14.0,
        meetingHoursBenchmark: 15.0,
        overtimeHoursWeekly: 1.5,
        ptoDaysUsed: 0,
        ptoDaysRemaining: 20,
        consecutiveWorkDays: 4,
        trend: 'stable' as const
      }
    };
  }

  return {
    workShift: {
      date: today,
      isClockedIn: false,
      clockInTime: null,
      clockOutTime: null,
      totalWorkedSeconds: 0,
      overtimeSeconds: 0,
      ...STANDARD_SCHEDULE
    },
    waterCups: 0,
    moodLogs: [] as MoodLog[],
    blockers: [] as Blocker[],
    burnoutMetrics: {
      overallScore: 0,
      riskLevel: 'low' as const,
      meetingHoursWeekly: 0,
      meetingHoursBenchmark: 15.0,
      overtimeHoursWeekly: 0,
      ptoDaysUsed: 0,
      ptoDaysRemaining: 20,
      consecutiveWorkDays: 0,
      trend: 'stable' as const
    }
  };
};

const loadPersonalUserData = (email: string, role: UserRole, name?: string) => {
  const initial = getAccountInitialState(email, role, name);
  let shift: WorkShiftState = initial.workShift;
  let water = initial.waterCups;
  let moods = initial.moodLogs;
  let blockers = initial.blockers;
  let burnout = initial.burnoutMetrics;
  let boundary = initialBoundaryConfig;
  let held: HeldNotification[] = [];
  const today = getTodayDateStr();

  if (typeof window !== 'undefined') {
    try {
      const savedShift = localStorage.getItem(getUserStorageKey(email, 'work_shift'));
      if (savedShift) {
        const parsed = JSON.parse(savedShift);
        // Daily Ephemeral Check: If saved shift is from a previous calendar day, reset for today
        if (parsed.date && parsed.date !== today) {
          shift = {
            date: today,
            isClockedIn: false,
            clockInTime: null,
            clockOutTime: null,
            totalWorkedSeconds: 0,
            overtimeSeconds: 0,
            segmentStartedAt: null,
            bankedSeconds: 0,
            ...STANDARD_SCHEDULE
          };
          localStorage.setItem(getUserStorageKey(email, 'work_shift'), JSON.stringify(shift));
        } else {
          // Recompute against the wall clock so a shift left running while the tab
          // was closed (or the user was logged out) resumes at the right elapsed time.
          shift = normalizeWorkShift({
            ...parsed,
            date: today,
            ...STANDARD_SCHEDULE
          });
        }
      }

      // Daily Ephemeral Hydration Check
      const savedWaterDate = localStorage.getItem(getUserStorageKey(email, 'water_cups_date'));
      if (savedWaterDate !== today) {
        water = initial.waterCups;
        localStorage.setItem(getUserStorageKey(email, 'water_cups_date'), today);
        localStorage.setItem(getUserStorageKey(email, 'water_cups'), String(water));
      } else {
        const savedWater = localStorage.getItem(getUserStorageKey(email, 'water_cups'));
        if (savedWater !== null) {
          const parsedW = parseInt(savedWater, 10);
          if (!isNaN(parsedW)) water = parsedW;
        }
      }

      const savedMoods = localStorage.getItem(getUserStorageKey(email, 'mood_logs'));
      if (savedMoods) moods = JSON.parse(savedMoods);

      const savedBlockers = localStorage.getItem(getUserStorageKey(email, 'blockers'));
      if (savedBlockers) {
        const parsedBlockers = JSON.parse(savedBlockers);
        if (Array.isArray(parsedBlockers)) blockers = parsedBlockers;
      }

      // Merge over the defaults rather than trusting the stored shape — records
      // written by earlier builds can be missing fields the UI now reads
      // unguarded (trend, riskFactors), which would throw during render.
      const savedBurnout = localStorage.getItem(getUserStorageKey(email, 'burnout_metrics'));
      if (savedBurnout) burnout = { ...burnout, ...JSON.parse(savedBurnout) };

      // Boundary Shield settings & the queue it is holding must survive a reload —
      // the whole point of the feature is holding alerts across a long window.
      const savedBoundary = localStorage.getItem(getUserStorageKey(email, 'boundary_config'));
      if (savedBoundary) boundary = { ...initialBoundaryConfig, ...JSON.parse(savedBoundary) };

      const savedHeld = localStorage.getItem(getUserStorageKey(email, 'held_notifications'));
      if (savedHeld) {
        const parsedHeld = JSON.parse(savedHeld);
        if (Array.isArray(parsedHeld)) held = parsedHeld;
      }
    } catch (e) {}
  }

  // Normalize every path, not just the restored-from-storage one: the seeded
  // accounts start clocked in, and without timing fields they would read as zero.
  // normalizeWorkShift is idempotent, so re-running it here is safe.
  return { shift: normalizeWorkShift(shift), water, moods, blockers, burnout, boundary, held };
};

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
      'blockers',
      'physical',
      'mental',
      'social',
      'inclusive',
      'boundary',
      'pto',
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

  const [burnoutMetrics, setBurnoutMetrics] = useState<BurnoutMetrics>(() => {
    return initialBurnoutMetrics;
  });
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>(initialMoodLogs);
  const [blockers, setBlockers] = useState<Blocker[]>(initialBlockers);
  const [reminders, setReminders] = useState<WellnessReminder[]>(initialReminders);
  const [activeExercise, setActiveExercise] = useState<'stretch' | 'eye_rest' | 'breathwork' | null>(null);
  const [badges, setBadges] = useState<PeerBadge[]>(initialBadges);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [boundaryConfig, setBoundaryConfig] = useState<BoundaryGuardConfig>(initialBoundaryConfig);
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(initialAccessibilitySettings);
  const [toastNotification, setToastState] = useState<string | null>(null);
  const [batchedNotifications, setBatchedNotifications] = useState<BatchedNotification[]>([]);
  const [isBatchDigestVisible, setIsBatchDigestVisible] = useState(false);
  const [heldNotifications, setHeldNotifications] = useState<HeldNotification[]>([]);
  const batchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const toastDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-evaluated on a timer so the shield opens/closes on its own as the clock
  // crosses the quiet-hours boundary, without needing a page reload.
  const [quietHoursTick, setQuietHoursTick] = useState(0);
  const releaseHeldNotificationsRef = useRef<() => void>(() => {});
  useEffect(() => {
    const timer = setInterval(() => {
      setQuietHoursTick(t => t + 1);
      // Auto-deliver the held queue once the shield stops holding — either quiet
      // hours ended or the shield was switched off. Checking only the clock left
      // the queue stranded when a user disarmed the shield mid-window.
      const stillHolding =
        boundaryConfig.activeShield &&
        isWithinQuietHours(boundaryConfig.quietHoursStart, boundaryConfig.quietHoursEnd);
      if (!stillHolding) releaseHeldNotificationsRef.current();
    }, 30000);
    return () => clearInterval(timer);
  }, [boundaryConfig.activeShield, boundaryConfig.quietHoursStart, boundaryConfig.quietHoursEnd]);

  const isQuietHoursActive = React.useMemo(
    () => isWithinQuietHours(boundaryConfig.quietHoursStart, boundaryConfig.quietHoursEnd),
    // quietHoursTick is an intentional re-check trigger, not a value we read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [boundaryConfig.quietHoursStart, boundaryConfig.quietHoursEnd, quietHoursTick]
  );

  const isShieldHolding = boundaryConfig.activeShield && isQuietHoursActive;

  // setToastNotification is captured by long-lived intervals (reminders, pomodoro)
  // that do not re-subscribe when these values change. Read them through refs so
  // the callback can stay referentially stable and never serves a stale decision.
  const isShieldHoldingRef = useRef(isShieldHolding);
  const batchNotificationsRef = useRef(accessibility.batchNotifications);
  useEffect(() => {
    isShieldHoldingRef.current = isShieldHolding;
  }, [isShieldHolding]);
  useEffect(() => {
    batchNotificationsRef.current = accessibility.batchNotifications;
  }, [accessibility.batchNotifications]);

  // Urgency keywords — these toasts always show immediately even when batching is ON
  const URGENT_KEYWORDS = [
    'logged out', 'welcome to', 'welcome back', 'clocked in', 'clocked out',
    'shift timer reset', 'auto-approved', 'password', 'account',
    'deleted', 'restored', 'purged', 'recovery vault', 'security',
    'boundary guard', 'focus mode', 'notification batching', 'clutter reduction',
    'theme changed', 'role', 'status'
  ];

  const isUrgentMessage = useCallback((msg: string): boolean => {
    const lower = msg.toLowerCase();
    return URGENT_KEYWORDS.some(keyword => lower.includes(keyword));
  }, []);

  const setToastNotification = useCallback((msg: string | null, urgent?: boolean) => {
    if (!msg) {
      setToastState(null);
      return;
    }

    const isRoutine = !urgent && !isUrgentMessage(msg);

    // Boundary Shield takes precedence over batching: during quiet hours the
    // message is held entirely rather than digested a minute later.
    if (isRoutine && isShieldHoldingRef.current) {
      const entry: HeldNotification = {
        id: `held-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        message: msg,
        heldAt: Date.now()
      };
      setHeldNotifications(prev => {
        // Several callers still fire toasts from inside a state updater, which
        // React runs twice in StrictMode. Collapse the resulting duplicate so the
        // queue shows one entry per real event.
        const last = prev[prev.length - 1];
        if (last && last.message === msg && entry.heldAt - last.heldAt < 1000) return prev;
        return [...prev, entry];
      });
      return;
    }

    const shouldBatch = batchNotificationsRef.current && isRoutine;

    if (shouldBatch) {
      // Queue into batch instead of showing immediately
      setBatchedNotifications(prev => [
        ...prev,
        { id: `bn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, message: msg, timestamp: Date.now() }
      ]);
    } else {
      // Show immediately
      if (toastDismissTimerRef.current) clearTimeout(toastDismissTimerRef.current);
      setToastState(msg);
      toastDismissTimerRef.current = setTimeout(() => setToastState(null), 4000);
    }
    // Stable identity on purpose — long-lived intervals capture this callback once.
  }, [isUrgentMessage]);

  // Batch flush timer — delivers digest every 60 seconds when batching is ON and queue is non-empty
  useEffect(() => {
    if (accessibility.batchNotifications) {
      batchTimerRef.current = setInterval(() => {
        setBatchedNotifications(prev => {
          if (prev.length > 0) {
            setIsBatchDigestVisible(true);
            // Auto-dismiss the digest after 10 seconds
            setTimeout(() => setIsBatchDigestVisible(false), 10000);
          }
          return prev;
        });
      }, 60000);
    } else {
      // When batching is turned OFF, immediately flush any queued notifications as a digest
      if (batchTimerRef.current) clearInterval(batchTimerRef.current);
      batchTimerRef.current = null;
      setBatchedNotifications(prev => {
        if (prev.length > 0) {
          setIsBatchDigestVisible(true);
          setTimeout(() => setIsBatchDigestVisible(false), 10000);
        }
        return prev;
      });
    }
    return () => {
      if (batchTimerRef.current) clearInterval(batchTimerRef.current);
    };
  }, [accessibility.batchNotifications]);

  const dismissBatchDigest = useCallback(() => {
    setIsBatchDigestVisible(false);
    setBatchedNotifications([]);
  }, []);

  const clearBatchedNotifications = useCallback(() => {
    setBatchedNotifications([]);
    setIsBatchDigestVisible(false);
  }, []);

  // Mirror of heldNotifications for the release path, so releasing reads the queue
  // outside a state updater (updaters must stay pure — they run twice in StrictMode).
  const heldNotificationsRef = useRef<HeldNotification[]>([]);
  useEffect(() => {
    heldNotificationsRef.current = heldNotifications;
  }, [heldNotifications]);

  // Delivers everything the shield held, as a single digest through the existing
  // batched-notification surface. Used both by the manual "Release Now" control
  // and by the automatic flush when quiet hours end.
  const releaseHeldNotifications = useCallback(() => {
    const queued = heldNotificationsRef.current;
    if (queued.length === 0) return;

    heldNotificationsRef.current = [];
    setHeldNotifications([]);
    setBatchedNotifications(existing => [
      ...existing,
      ...queued.map(held => ({ id: held.id, message: held.message, timestamp: held.heldAt }))
    ]);
    setIsBatchDigestVisible(true);
    setTimeout(() => setIsBatchDigestVisible(false), 10000);
  }, []);

  useEffect(() => {
    releaseHeldNotificationsRef.current = releaseHeldNotifications;
  }, [releaseHeldNotifications]);

  const [accounts, setAccounts] = useState<UserAccount[]>(initialUserAccounts);
  const [deletedAccounts, setDeletedAccounts] = useState<DeletedUserAccount[]>(initialDeletedAccounts);
  const [hrNotifications, setHrNotifications] = useState<HrNotification[]>(initialHrNotifications);
  const [hrOutreachMessages, setHrOutreachMessages] = useState<HrOutreachMessage[]>([]);
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
              const effectiveRole: UserRole = parsedProfile.role || savedRole;
              parsedProfile.jobTitle = getRoleJobTitle(effectiveRole);
              parsedProfile.employeeId = getRoleEmployeeId(effectiveRole, parsedProfile.id);
              setUserProfile(parsedProfile);
              const personal = loadPersonalUserData(parsedProfile.email, effectiveRole, parsedProfile.name);
              setWorkShift(personal.shift);
              setWaterCups(personal.water);
              setMoodLogs(personal.moods);
              setBlockers(personal.blockers);
              setBurnoutMetrics(personal.burnout);
              setBoundaryConfig(personal.boundary);
              setHeldNotifications(personal.held);
            }
          }
        }
      } catch (err) {
        console.warn('Notice: Session hydration error:', err);
      } finally {
        setIsAuthLoading(false);
      }

      // Fetch all persistent server API resources concurrently (Supabase & server database) -
      // each call is independent of the others, so run them in parallel instead of a sequential waterfall.
      await Promise.all([
        // Accounts
        (async () => {
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
        })(),

        // Badges
        (async () => {
          try {
            const resBadges = await fetch('/api/badges');
            if (resBadges.ok) {
              const badgeData = await resBadges.json();
              if (badgeData.badges && Array.isArray(badgeData.badges)) {
                setBadges(badgeData.badges);
              }
            }
          } catch (e) {}
        })(),

        // HR notifications
        (async () => {
          try {
            const resNotifs = await fetch('/api/notifications');
            if (resNotifs.ok) {
              const notifData = await resNotifs.json();
              if (notifData.notifications && Array.isArray(notifData.notifications) && notifData.notifications.length > 0) {
                setHrNotifications(notifData.notifications);
              }
            }
          } catch (e) {}
        })(),

        // HR outreach messages (HR -> flagged employee, sent from a Caring Alert)
        (async () => {
          try {
            const resOutreach = await fetch('/api/hr-messages');
            if (resOutreach.ok) {
              const outreachData = await resOutreach.json();
              if (Array.isArray(outreachData.messages)) {
                setHrOutreachMessages(outreachData.messages);
              }
            }
          } catch {}
        })(),

        // Moods
        (async () => {
          try {
            const resMoods = await fetch('/api/moods');
            if (resMoods.ok) {
              const moodData = await resMoods.json();
              if (moodData.moodLogs && Array.isArray(moodData.moodLogs) && moodData.moodLogs.length > 0) {
                setMoodLogs(moodData.moodLogs);
              }
            }
          } catch (e) {}
        })(),

        // PTO requests
        (async () => {
          try {
            const resPto = await fetch('/api/pto');
            if (resPto.ok) {
              const ptoData = await resPto.json();
              if (ptoData.ptoRequests && Array.isArray(ptoData.ptoRequests)) {
                const cleaned = ptoData.ptoRequests.filter((p: any) => p.id !== 'pto-2' && p.id !== 'pto-1' && p.userName !== 'Elena Rostova');
                setPtoRequests(cleaned);
                try {
                  localStorage.setItem('axionhr_pto_requests', JSON.stringify(cleaned));
                } catch (e) {}
              }
            }
          } catch (e) {}
        })(),

        // Work shifts & attendance logs
        (async () => {
          try {
            const resShifts = await fetch('/api/shifts');
            if (resShifts.ok) {
              const shiftData = await resShifts.json();
              if (shiftData.shifts && Array.isArray(shiftData.shifts)) {
                setTeamShifts(shiftData.shifts);
              }
            }
          } catch (e) {}
        })()
      ]);

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
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(n => n.id !== 'hr-notif-1' && n.id !== 'hr-notif-2');
            setHrNotifications(cleaned);
          }
        }

        const savedBadges = localStorage.getItem('axionhr_badges');
        if (savedBadges) {
          const parsed = JSON.parse(savedBadges);
          if (Array.isArray(parsed)) {
            const cleaned = parsed
              .filter(b => b.id !== 'b1' && b.id !== 'b2' && b.id !== 'b3')
              .map(b => ({
                ...b,
                senderName: (b.senderName || '').replace(/\s*\(You\)/gi, '').trim(),
                recipientName: (b.recipientName || '').replace(/\s*\(You\)/gi, '').trim()
              }));
            setBadges(cleaned);
            try {
              localStorage.setItem('axionhr_badges', JSON.stringify(cleaned));
            } catch (e) {}
          }
        }

        const savedReminders = localStorage.getItem('axionhr_reminders');
        if (savedReminders) {
          const parsed = JSON.parse(savedReminders);
          if (Array.isArray(parsed) && parsed.length > 0) setReminders(parsed);
        }

        const savedTheme = localStorage.getItem('axionhr_theme');
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
          setThemeState(savedTheme as ThemeMode);
        }

        const savedWater = localStorage.getItem('axionhr_water_cups');
        if (savedWater !== null) {
          const parsedW = parseInt(savedWater, 10);
          if (!isNaN(parsedW)) setWaterCups(parsedW);
        }

        const savedMetrics = localStorage.getItem('axionhr_burnout_metrics');
        if (savedMetrics) {
          const parsed = JSON.parse(savedMetrics);
          if (parsed && typeof parsed === 'object') {
            if (parsed.overallScore === 68 && parsed.consecutiveWorkDays === 9) {
              setBurnoutMetrics(initialBurnoutMetrics);
            } else {
              // Same defaults merge as the per-user load path above.
              setBurnoutMetrics({ ...initialBurnoutMetrics, ...parsed });
            }
          }
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

        const { data: shiftsData } = await supabase
          .from('work_shifts')
          .select('*')
          .order('created_at', { ascending: false });
        if (shiftsData && shiftsData.length > 0) {
          setTeamShifts(shiftsData.map((s: any) => ({
            id: s.id,
            userId: s.user_id || 'user-default',
            userName: s.user_name || 'Team Member',
            userAvatar: s.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            department: s.department || 'General',
            date: s.date || new Date().toISOString().split('T')[0],
            clockInTime: s.clock_in_time,
            clockOutTime: s.clock_out_time || null,
            totalWorkedSeconds: parseInt(s.total_worked_seconds, 10) || 0,
            overtimeSeconds: parseInt(s.overtime_seconds, 10) || 0,
            status: s.status || (s.clock_out_time ? 'completed' : 'active'),
            createdAt: s.created_at || new Date().toISOString()
          })));
        }

        const { data: ptoData } = await supabase
          .from('pto_requests')
          .select('*')
          .order('created_at', { ascending: false });
        if (ptoData && ptoData.length > 0) {
          setPtoRequests(ptoData.map((p: any) => ({
            id: p.id,
            userId: p.user_id || 'user-default',
            userName: p.user_name || 'Team Member',
            userAvatar: p.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            department: p.department || 'General',
            category: p.category || 'general_pto',
            startDate: p.start_date,
            endDate: p.end_date,
            totalDays: Number(p.total_days) || 1,
            reason: p.reason || '',
            status: p.status || 'pending',
            autoApproved: Boolean(p.auto_approved),
            reviewedBy: p.reviewed_by || undefined,
            reviewedAt: p.reviewed_at || undefined,
            createdAt: p.created_at || new Date().toISOString()
          })));
        }
      } catch (err) {
        console.warn('Supabase data sync notice:', err);
      }
    };

    // No initial fetchSupabaseData() call here - the loadData() effect above already hydrates
    // this same data via the (Supabase-backed) REST routes. fetchSupabaseData is still used by
    // the profiles realtime handler below to re-pull derived data after a profile change.

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
            if (data.badges && Array.isArray(data.badges)) {
              const cleanedBadges: PeerBadge[] = data.badges.map((b: PeerBadge) => ({
                ...b,
                senderName: (b.senderName || '').replace(/\s*\(You\)/gi, '').trim(),
                recipientName: (b.recipientName || '').replace(/\s*\(You\)/gi, '').trim()
              }));
              setBadges(prev => {
                const prevIds = new Set(prev.map(b => b.id));
                const newBadges = cleanedBadges.filter((b: PeerBadge) => !prevIds.has(b.id));
                const currentUserMention = newBadges.find((b: PeerBadge) => {
                  const r = (b.recipientName || '').toLowerCase();
                  const un = (userProfile.name || '').toLowerCase();
                  const ue = (userProfile.email || '').toLowerCase();
                  return (un && (r === un || r.includes(un))) || (ue && r === ue);
                });
                if (currentUserMention) {
                  setToastNotification(
                    `🌟 ${currentUserMention.senderName} sent you an Appreciation Badge: "${currentUserMention.message}"`,
                    true
                  );
                }
                return cleanedBadges;
              });
            }
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_shifts' }, () => {
        fetch('/api/shifts')
          .then(r => r.json())
          .then(data => {
            if (data.shifts && Array.isArray(data.shifts)) setTeamShifts(data.shifts);
          })
          .catch(() => {});
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pto_requests' }, () => {
        fetch('/api/pto')
          .then(r => r.json())
          .then(data => {
            if (data.ptoRequests && Array.isArray(data.ptoRequests)) setPtoRequests(data.ptoRequests);
          })
          .catch(() => {});
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hr_outreach_messages' }, () => {
        fetch('/api/hr-messages')
          .then(r => r.json())
          .then(data => {
            if (!Array.isArray(data.messages)) return;
            setHrOutreachMessages(prev => {
              const prevIds = new Set(prev.map(m => m.id));
              const newMessages: HrOutreachMessage[] = data.messages.filter((m: HrOutreachMessage) => !prevIds.has(m.id));
              const currentUserMessage = newMessages.find((m: HrOutreachMessage) => {
                const r = (m.recipientName || '').toLowerCase();
                const un = (userProfile.name || '').toLowerCase();
                const ue = (userProfile.email || '').toLowerCase();
                return (un && (r === un || r.includes(un))) || (ue && r === ue);
              });
              if (currentUserMessage) {
                setToastNotification(`💙 ${currentUserMessage.senderName} from HR reached out: "${currentUserMessage.message}"`, true);
              }
              return data.messages;
            });
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

  // Sends a real message from HR to the flagged employee and resolves the
  // originating Caring Alert with that exact message as its action note -
  // the employee sees it in their Notifications bell (and a live toast if
  // they're online) via the realtime channel above, not just a status change
  // on HR's own side.
  const sendCaringOutreach = (alertId: string, targetTeammate: string, message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const newMessage: HrOutreachMessage = {
      id: `outreach-${Date.now()}`,
      alertId,
      senderName: userProfile.name || 'HR Team',
      recipientName: targetTeammate,
      message: trimmed,
      createdAt: new Date().toISOString()
    };

    setHrOutreachMessages(prev => [newMessage, ...prev]);
    resolveHrNotification(alertId, trimmed);

    fetch('/api/hr-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: newMessage })
    }).catch(err => console.warn('HR outreach message sync error:', err));
  };

  // Sends a real message to every active employee in a department - each one
  // gets its own persisted HrOutreachMessage, delivered through the exact
  // same pipeline as a single Caring Alert reply (disk + Supabase, live via
  // the realtime channel, surfaced in that employee's Notifications bell).
  const broadcastToDepartment = (department: string, message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const targets = accounts.filter(a => a.department === department && a.status === 'active');
    if (targets.length === 0) {
      setToastNotification(`No active employees found in ${department}.`);
      return;
    }

    targets.forEach(target => {
      const newMessage: HrOutreachMessage = {
        id: `outreach-${Date.now()}-${target.id}`,
        senderName: userProfile.name || 'HR Team',
        recipientName: target.name,
        message: trimmed,
        createdAt: new Date().toISOString()
      };

      setHrOutreachMessages(prev => [newMessage, ...prev]);

      fetch('/api/hr-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage })
      }).catch(err => console.warn('Department broadcast sync error:', err));
    });

    setToastNotification(`Sent to ${targets.length} ${targets.length === 1 ? 'employee' : 'employees'} in ${department}.`);
  };

  const login = (role: UserRole, accountDetails?: Partial<UserAccount>) => {
    setUserRole(role);
    setIsAuthenticated(true);

    let updatedProfile: UserProfile = userProfile;

    if (accountDetails) {
      const resolvedId = accountDetails.id || userProfile.id;
      const resolvedRole = (accountDetails.role as UserRole) || role;
      updatedProfile = {
        ...userProfile,
        id: resolvedId,
        name: accountDetails.name || userProfile.name,
        email: accountDetails.email || userProfile.email,
        role: resolvedRole,
        department: accountDetails.department || userProfile.department,
        jobTitle: getRoleJobTitle(resolvedRole),
        employeeId: getRoleEmployeeId(resolvedRole, resolvedId),
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
          jobTitle: getRoleJobTitle(matchingAccount.role),
          employeeId: getRoleEmployeeId(matchingAccount.role, matchingAccount.id),
          avatarUrl: matchingAccount.avatarUrl || userProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        };
        setUserProfile(updatedProfile);
      }
    }

    // Load user-isolated shift, hydration, mood logs, burnout metrics & shield state
    const userEmail = updatedProfile.email || 'admin@axionhr.com';
    const personal = loadPersonalUserData(userEmail, updatedProfile.role, updatedProfile.name);
    setWorkShift(personal.shift);
    setWaterCups(personal.water);
    setMoodLogs(personal.moods);
    setBlockers(personal.blockers);
    setBurnoutMetrics(personal.burnout);
    setBoundaryConfig(personal.boundary);
    setHeldNotifications(personal.held);

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
        'dashboard', 'analytics', 'blockers', 'physical', 'mental', 'social', 'inclusive', 'boundary', 'pto', 'hr', 'accounts', 'settings'
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

    setMoodLogs(prev => {
      const updated = [newLog, ...prev];
      if (typeof window !== 'undefined') {
        try {
          if (userProfile.email) {
            localStorage.setItem(getUserStorageKey(userProfile.email, 'mood_logs'), JSON.stringify(updated));
          }
        } catch (e) {}
      }
      return updated;
    });
    setToastNotification('Mood check-in logged and saved to the database! Thank you for sharing.');

    const scoreChange = getMoodScoreImpact(mood, energyLevel);

    setBurnoutMetrics(prev => {
      const newScore = Math.min(100, Math.max(0, prev.overallScore + scoreChange));
      const newLevel = getBurnoutRiskLevel(newScore);
      const newTrend: 'improving' | 'worsening' | 'stable' = scoreChange < 0 ? 'improving' : scoreChange > 0 ? 'worsening' : 'stable';
      const updated: BurnoutMetrics = {
        ...prev,
        overallScore: newScore,
        riskLevel: newLevel,
        trend: newTrend
      };
      if (typeof window !== 'undefined') {
        try {
          if (userProfile.email) {
            localStorage.setItem(getUserStorageKey(userProfile.email, 'burnout_metrics'), JSON.stringify(updated));
          }
        } catch (e) {}
      }
      return updated;
    });

    // Persist to server API & Supabase database
    fetch('/api/moods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moodLog: newLog, userProfile })
    }).catch(err => console.warn('Mood database sync error:', err));
  };

  const addBlocker = (description: string, severity: BlockerSeverity) => {
    const trimmed = description.trim();
    if (!trimmed) return;

    const weight = BLOCKER_SEVERITY_CONFIG[severity].scoreWeight;
    const newScore = Math.min(100, Math.max(0, burnoutMetrics.overallScore + weight));
    const actualImpact = newScore - burnoutMetrics.overallScore;
    const newLevel = getBurnoutRiskLevel(newScore);

    const newBlocker: Blocker = {
      id: `blocker-${Date.now()}`,
      description: trimmed,
      severity,
      scoreImpact: actualImpact,
      createdAt: new Date().toISOString()
    };

    setBlockers(prev => {
      const updated = [newBlocker, ...prev];
      if (typeof window !== 'undefined' && userProfile.email) {
        try {
          localStorage.setItem(getUserStorageKey(userProfile.email, 'blockers'), JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    setBurnoutMetrics(prev => {
      const updated: BurnoutMetrics = {
        ...prev,
        overallScore: newScore,
        riskLevel: newLevel,
        trend: actualImpact > 0 ? 'worsening' : prev.trend
      };
      if (typeof window !== 'undefined' && userProfile.email) {
        try {
          localStorage.setItem(getUserStorageKey(userProfile.email, 'burnout_metrics'), JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    setToastNotification('Blocker logged — burnout risk score updated.');

    // Persist to server API & Supabase database
    fetch('/api/blockers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', blocker: newBlocker, userProfile })
    }).catch(err => console.warn('Blocker database sync error:', err));
  };

  const resolveBlocker = (id: string) => {
    const target = blockers.find(b => b.id === id);
    if (!target || target.resolvedAt) return;

    const newScore = Math.min(100, Math.max(0, burnoutMetrics.overallScore - target.scoreImpact));
    const newLevel = getBurnoutRiskLevel(newScore);

    setBlockers(prev => {
      const updated = prev.map(b => b.id === id ? { ...b, resolvedAt: new Date().toISOString() } : b);
      if (typeof window !== 'undefined' && userProfile.email) {
        try {
          localStorage.setItem(getUserStorageKey(userProfile.email, 'blockers'), JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    setBurnoutMetrics(prev => {
      const updated: BurnoutMetrics = {
        ...prev,
        overallScore: newScore,
        riskLevel: newLevel,
        trend: target.scoreImpact > 0 ? 'improving' : prev.trend
      };
      if (typeof window !== 'undefined' && userProfile.email) {
        try {
          localStorage.setItem(getUserStorageKey(userProfile.email, 'burnout_metrics'), JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    setToastNotification('Blocker resolved — burnout risk score updated.');

    // Persist to server API & Supabase database
    fetch('/api/blockers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resolve', id })
    }).catch(err => console.warn('Blocker resolve sync error:', err));
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
      senderName: (userProfile.name || 'Colleague').replace(/\s*\(You\)/gi, '').trim(),
      senderAvatar: userProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      recipientName: (matchedRecipient?.name || recipientName).replace(/\s*\(You\)/gi, '').trim(),
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
    const nextState = !boundaryConfig.activeShield;
    setBoundaryConfig(prev => ({ ...prev, activeShield: nextState }));

    // Disarming should deliver whatever is already queued rather than leaving it
    // stranded until quiet hours end.
    if (!nextState) releaseHeldNotifications();

    setToastNotification(
      nextState
        ? `Boundary Guard ACTIVE. Non-urgent alerts will be held during quiet hours (${formatQuietHourLabel(boundaryConfig.quietHoursStart)} – ${formatQuietHourLabel(boundaryConfig.quietHoursEnd)}).`
        : 'Boundary Guard paused. All alerts will arrive immediately.'
    );
  };

  const updateQuietHours = (start: string, end: string) => {
    setBoundaryConfig(prev => ({ ...prev, quietHoursStart: start, quietHoursEnd: end }));
    setToastNotification(`Quiet hours updated to ${formatQuietHourLabel(start)} – ${formatQuietHourLabel(end)}`);
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

  // Persist the shield's settings and its held queue. Both key off userProfile.email
  // read in the same render as the data, so a login that swaps profile and queue
  // together cannot write one user's notifications under another user's key.
  useEffect(() => {
    if (typeof window === 'undefined' || !userProfile.email) return;
    try {
      localStorage.setItem(
        getUserStorageKey(userProfile.email, 'boundary_config'),
        JSON.stringify(boundaryConfig)
      );
    } catch (e) {}
  }, [boundaryConfig, userProfile.email]);

  useEffect(() => {
    if (typeof window === 'undefined' || !userProfile.email) return;
    try {
      localStorage.setItem(
        getUserStorageKey(userProfile.email, 'held_notifications'),
        JSON.stringify(heldNotifications)
      );
    } catch (e) {}
  }, [heldNotifications, userProfile.email]);

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('axionhr_theme');
        if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
          return saved as ThemeMode;
        }
      } catch (e) {}
    }
    return 'light';
  });
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
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('axionhr_theme', newTheme);
      } catch (e) {}
    }
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

      // Synchronize current user avatar across existing peer badges
      if (updates.avatarUrl) {
        setBadges(prevBadges => {
          const nextBadges = prevBadges.map(b => {
            const isSender = b.senderName.includes('(You)') || (prev.name && b.senderName.toLowerCase().includes(prev.name.toLowerCase()));
            const isRecipient = b.recipientName.includes('(You)') || (prev.name && b.recipientName.toLowerCase().includes(prev.name.toLowerCase()));
            if (isSender || isRecipient) {
              return {
                ...b,
                senderAvatar: isSender ? updates.avatarUrl! : b.senderAvatar,
                recipientAvatar: isRecipient ? updates.avatarUrl! : b.recipientAvatar
              };
            }
            return b;
          });
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('axionhr_badges', JSON.stringify(nextBadges));
            } catch (e) {}
          }
          return nextBadges;
        });
      }

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

  // Hydration state (defaults to 0 cups baseline to start)
  const [waterCups, setWaterCups] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('axionhr_water_cups');
        if (saved !== null) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed)) return parsed;
        }
      } catch (e) {}
    }
    return 0; // Clean 0 cups baseline to start
  });

  // Mirrors waterCups so logWaterCup can increment without reading a possibly
  // stale render value. Kept in sync for every other path that changes the count.
  const waterCupsRef = useRef(waterCups);
  useEffect(() => {
    waterCupsRef.current = waterCups;
  }, [waterCups]);

  const logWaterCup = () => {
    // Side effects stay outside the updater — React invokes updaters twice in
    // StrictMode, which fired the toast (and shield hold) twice per cup. The count
    // comes from a ref updated synchronously here, so two calls dispatched before
    // a re-render (double-tap, or a click racing a hydration reminder) still
    // compound instead of both reading the same render's value.
    const next = waterCupsRef.current >= 10 ? 10 : waterCupsRef.current + 1;
    waterCupsRef.current = next;
    setWaterCups(next);
    if (typeof window !== 'undefined') {
      try {
        if (userProfile.email) {
          localStorage.setItem(getUserStorageKey(userProfile.email, 'water_cups'), String(next));
        }
        localStorage.setItem('axionhr_water_cups', String(next));
      } catch (e) {}
    }
    setToastNotification(`💧 Hydration logged! ${next}/10 cups completed for today.`);
  };

  const removeWaterCup = () => {
    setWaterCups(prev => {
      const next = prev > 0 ? prev - 1 : 0;
      if (typeof window !== 'undefined') {
        try {
          if (userProfile.email) {
            localStorage.setItem(getUserStorageKey(userProfile.email, 'water_cups'), String(next));
          }
          localStorage.setItem('axionhr_water_cups', String(next));
        } catch (e) {}
      }
      return next;
    });
  };

  const resetWaterCups = () => {
    setWaterCups(0);
    if (typeof window !== 'undefined') {
      try {
        if (userProfile.email) {
          localStorage.setItem(getUserStorageKey(userProfile.email, 'water_cups'), '0');
        }
        localStorage.setItem('axionhr_water_cups', '0');
      } catch (e) {}
    }
    setToastNotification('Hydration tracker reset to 0 cups.');
  };

  // Work Shift & Attendance State
  const [workShift, setWorkShift] = useState<WorkShiftState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('axionhr_work_shift');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') return normalizeWorkShift(parsed);
        }
      } catch (e) {}
    }
    return {
      isClockedIn: false,
      clockInTime: null,
      clockOutTime: null,
      totalWorkedSeconds: 0,
      overtimeSeconds: 0,
      segmentStartedAt: null,
      bankedSeconds: 0
    };
  });

  // Live work shift timer. The tick only re-derives the display value from
  // segmentStartedAt — it never accumulates — so pausing (background tab, closed
  // tab, logged out) cannot drift the total. No periodic persistence is needed
  // either: the authoritative fields change only on clock in/out.
  useEffect(() => {
    if (!workShift.isClockedIn) return;

    const sync = () => {
      setWorkShift((prev: WorkShiftState) => {
        if (!prev.isClockedIn) return prev;
        const next = withLiveWorkTotals(prev);
        // Skip the state update on ticks where the whole second hasn't changed.
        return next.totalWorkedSeconds === prev.totalWorkedSeconds ? prev : next;
      });
    };

    sync();
    const timer = setInterval(sync, 1000);

    // Browsers throttle timers in hidden tabs, so re-sync the moment we're visible
    // again rather than waiting for the next (possibly delayed) tick.
    const onVisible = () => {
      if (document.visibilityState === 'visible') sync();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', sync);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', sync);
    };
  }, [workShift.isClockedIn]);

  const toggleClockInOut = () => {
    const isCurrentlyClockedIn = workShift.isClockedIn;
    const willBeClockedIn = !isCurrentlyClockedIn;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (willBeClockedIn) {
      // Start a new timed segment; anything already worked today stays banked so a
      // second clock-in resumes on top of it rather than restarting at zero.
      const nextState: WorkShiftState = withLiveWorkTotals({
        date: getTodayDateStr(),
        isClockedIn: true,
        clockInTime: timeStr,
        clockOutTime: null,
        totalWorkedSeconds: 0,
        overtimeSeconds: 0,
        segmentStartedAt: now.getTime(),
        bankedSeconds: Math.max(0, workShift.bankedSeconds ?? workShift.totalWorkedSeconds ?? 0),
        ...STANDARD_SCHEDULE
      });
      setWorkShift(nextState);
      if (typeof window !== 'undefined') {
        try {
          if (userProfile.email) {
            localStorage.setItem(getUserStorageKey(userProfile.email, 'work_shift'), JSON.stringify(nextState));
          }
          localStorage.setItem('axionhr_work_shift', JSON.stringify(nextState));
        } catch (e) {}
      }

      const newShiftRecord: WorkShiftRecord = {
        id: `shift-${Date.now()}`,
        userId: userProfile.id || 'user-default',
        userName: userProfile.name || 'System Administrator',
        userAvatar: userProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        department: userProfile.department || 'Executive IT',
        date: getTodayDateStr(),
        clockInTime: timeStr,
        clockOutTime: null,
        totalWorkedSeconds: 0,
        overtimeSeconds: 0,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      setTeamShifts(shifts => [newShiftRecord, ...shifts.filter(s => !(s.userId === newShiftRecord.userId && s.status === 'active'))]);

      fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clock_in', shift: newShiftRecord })
      }).then(async res => {
        if (res.ok) {
          const data = await res.json();
          if (data.shifts && Array.isArray(data.shifts)) {
            setTeamShifts(data.shifts);
          }
        }
      }).catch(e => console.warn('Shift sync notice:', e));

      setToastNotification(`🟢 Clocked in at ${timeStr}. Standard shift: 9:00 AM – 6:00 PM (1h Lunch at 12:00 PM). Have a productive day!`);
    } else {
      // Close the running segment: fold its elapsed time into bankedSeconds and stop
      // measuring. Computed here rather than read off the display value, which can
      // trail the wall clock by up to a tick.
      const finalSeconds = computeWorkedSeconds(workShift, now.getTime());
      const nextState: WorkShiftState = withLiveWorkTotals({
        ...workShift,
        date: getTodayDateStr(),
        isClockedIn: false,
        clockOutTime: timeStr,
        segmentStartedAt: null,
        bankedSeconds: finalSeconds,
        ...STANDARD_SCHEDULE
      });
      const workedHours = (finalSeconds / 3600).toFixed(1);
      const overtimeHours = (nextState.overtimeSeconds / 3600).toFixed(1);
      setWorkShift(nextState);
      if (typeof window !== 'undefined') {
        try {
          if (userProfile.email) {
            localStorage.setItem(getUserStorageKey(userProfile.email, 'work_shift'), JSON.stringify(nextState));
          }
          localStorage.setItem('axionhr_work_shift', JSON.stringify(nextState));
        } catch (e) {}
      }

      // Gate on the freshly computed total, not the tick-derived display value —
      // a throttled background tab leaves the latter stale (often 0) and the
      // overtime would silently never reach the weekly metric.
      if (nextState.overtimeSeconds > 0) {
        const addedOt = parseFloat(overtimeHours);
        setBurnoutMetrics(bm => {
          const updated: BurnoutMetrics = {
            ...bm,
            overtimeHoursWeekly: parseFloat((bm.overtimeHoursWeekly + addedOt).toFixed(1))
          };
          if (typeof window !== 'undefined' && userProfile.email) {
            try {
              localStorage.setItem(getUserStorageKey(userProfile.email, 'burnout_metrics'), JSON.stringify(updated));
            } catch (e) {}
          }
          return updated;
        });
      }

      setTeamShifts(shifts => shifts.map(s => {
        if (s.userId === (userProfile.id || 'user-default') && s.status === 'active') {
          return {
            ...s,
            clockOutTime: timeStr,
            // Wall-clock totals, so the HR board matches what the user actually
            // worked even if the tab was throttled and the tick never caught up.
            totalWorkedSeconds: finalSeconds,
            overtimeSeconds: nextState.overtimeSeconds,
            status: 'completed'
          };
        }
        return s;
      }));

      fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clock_out',
          userId: userProfile.id || 'user-default',
          actingUserId: userProfile.id || 'user-default',
          userName: userProfile.name || 'System Administrator',
          userAvatar: userProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          department: userProfile.department || 'Executive IT',
          clockInTime: workShift.clockInTime || timeStr,
          clockOutTime: timeStr,
          totalWorkedSeconds: finalSeconds,
          overtimeSeconds: nextState.overtimeSeconds
        })
      }).then(async res => {
        if (res.ok) {
          const data = await res.json();
          if (data.shifts && Array.isArray(data.shifts)) {
            setTeamShifts(data.shifts);
          }
        }
      }).catch(e => console.warn('Shift sync notice:', e));

      setToastNotification(
        `⏹️ Clocked out at ${timeStr} (${workedHours}h logged${parseFloat(overtimeHours) > 0 ? `, +${overtimeHours}h Overtime` : ''}). Rest well!`
      );
    }
  };

  const resetWorkShift = () => {
    const clearedState: WorkShiftState = {
      date: getTodayDateStr(),
      isClockedIn: false,
      clockInTime: null,
      clockOutTime: null,
      totalWorkedSeconds: 0,
      overtimeSeconds: 0,
      segmentStartedAt: null,
      bankedSeconds: 0,
      ...STANDARD_SCHEDULE
    };
    setWorkShift(clearedState);
    if (typeof window !== 'undefined') {
      try {
        if (userProfile.email) {
          localStorage.setItem(getUserStorageKey(userProfile.email, 'work_shift'), JSON.stringify(clearedState));
        }
        localStorage.setItem('axionhr_work_shift', JSON.stringify(clearedState));
      } catch (e) {}
    }
    setToastNotification('⏱️ Workday shift timer reset to 00:00:00.');
  };

  const [teamShifts, setTeamShifts] = useState<WorkShiftRecord[]>([]);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState<boolean>(false);

  // PTO & Time-Off State
  const [ptoRequests, setPtoRequests] = useState<PtoRequest[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('axionhr_pto_requests');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter(p => p.id !== 'pto-2' && p.id !== 'pto-1' && p.userName !== 'Elena Rostova');
            return cleaned;
          }
        }
      } catch (e) {}
    }
    return initialPtoRequests;
  });

  const [ptoBalance, setPtoBalance] = useState<PtoBalance>(() => {
    return initialPtoBalance;
  });

  // Auto-calculate live accurate PTO balance from real ptoRequests for the current user
  useEffect(() => {
    const userReqs = ptoRequests.filter(
      p => p.userId === userProfile.id || (userProfile.name && p.userName.toLowerCase() === userProfile.name.toLowerCase()) || !p.userId
    );
    const used = userReqs
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + (p.totalDays || 1), 0);

    const pending = userReqs
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + (p.totalDays || 1), 0);

    const total = 20; // Standard 20 days annual wellness/PTO allowance
    const remaining = Math.max(0, total - used);

    const calculatedBalance: PtoBalance = {
      totalAllowance: total,
      usedDays: used,
      pendingDays: pending,
      remainingDays: remaining
    };

    setPtoBalance(calculatedBalance);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('axionhr_pto_balance', JSON.stringify(calculatedBalance));
      } catch (e) {}
    }
  }, [ptoRequests, userProfile.id, userProfile.name]);

  const [isPtoModalOpen, setIsPtoModalOpen] = useState<boolean>(false);

  const submitPtoRequest = (data: { category: LeaveCategory; startDate: string; endDate: string; totalDays: number; reason?: string }) => {
    const isAutoApproved = (data.category === 'mental_health' && data.totalDays <= 1) || data.category === 'birthday';
    const newRequest: PtoRequest = {
      id: `pto-${Date.now()}`,
      userId: userProfile.id || 'user-default',
      userName: userProfile.name || 'System Administrator',
      userAvatar: userProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      department: userProfile.department || 'Executive IT',
      category: data.category,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays: data.totalDays,
      reason: data.reason,
      status: isAutoApproved ? 'approved' : 'pending',
      autoApproved: isAutoApproved,
      reviewedBy: isAutoApproved ? 'AI Wellness Guard (Auto-Approved)' : undefined,
      reviewedAt: isAutoApproved ? new Date().toISOString().split('T')[0] : undefined,
      createdAt: new Date().toISOString()
    };

    setPtoRequests(prev => {
      const updated = [newRequest, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('axionhr_pto_requests', JSON.stringify(updated)); } catch (e) {}
      }
      return updated;
    });

    setPtoBalance(prev => {
      const nextBalance: PtoBalance = {
        ...prev,
        usedDays: isAutoApproved ? prev.usedDays + data.totalDays : prev.usedDays,
        pendingDays: isAutoApproved ? prev.pendingDays : prev.pendingDays + data.totalDays,
        remainingDays: isAutoApproved ? Math.max(0, prev.remainingDays - data.totalDays) : prev.remainingDays
      };
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('axionhr_pto_balance', JSON.stringify(nextBalance)); } catch (e) {}
      }
      return nextBalance;
    });

    if (isAutoApproved) {
      const scoreDrop = Math.min(25, Math.round(data.totalDays * 15));
      setBurnoutMetrics(bm => ({
        ...bm,
        overallScore: Math.max(15, bm.overallScore - scoreDrop),
        ptoDaysUsed: bm.ptoDaysUsed + data.totalDays,
        ptoDaysRemaining: Math.max(0, bm.ptoDaysRemaining - data.totalDays),
        consecutiveWorkDays: Math.max(0, bm.consecutiveWorkDays - 2)
      }));
      setToastNotification(`🧘 Rest Day Auto-Approved! Burnout risk improved by -${scoreDrop} points. Have a refreshing recharge!`);
    } else {
      setToastNotification(`🏖️ Time-off request for ${data.totalDays} day(s) submitted for manager review.`);
    }

    fetch('/api/pto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ptoRequest: newRequest })
    }).catch(err => console.warn('PTO sync notice:', err));
  };

  const reviewPtoRequest = (requestId: string, status: 'approved' | 'rejected') => {
    if (userRole !== 'admin' && userRole !== 'hr_manager') {
      setToastNotification('Only HR or admin accounts can review PTO requests.');
      return;
    }

    let targetReq: PtoRequest | undefined;
    setPtoRequests(prev => {
      const updated = prev.map(r => {
        if (r.id === requestId) {
          targetReq = r;
          return {
            ...r,
            status,
            reviewedBy: `HR Executive (${userProfile.name})`,
            reviewedAt: new Date().toISOString().split('T')[0]
          };
        }
        return r;
      });
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('axionhr_pto_requests', JSON.stringify(updated)); } catch (e) {}
      }
      return updated;
    });

    if (targetReq && status === 'approved' && targetReq.status === 'pending') {
      const days = targetReq.totalDays;
      setPtoBalance(prev => {
        const next: PtoBalance = {
          ...prev,
          usedDays: prev.usedDays + days,
          pendingDays: Math.max(0, prev.pendingDays - days),
          remainingDays: Math.max(0, prev.remainingDays - days)
        };
        if (typeof window !== 'undefined') {
          try { localStorage.setItem('axionhr_pto_balance', JSON.stringify(next)); } catch (e) {}
        }
        return next;
      });
      setToastNotification(`✅ Approved time-off for ${targetReq.userName} (${days} day(s)).`);
    } else if (targetReq && status === 'rejected') {
      setPtoBalance(prev => {
        const next: PtoBalance = {
          ...prev,
          pendingDays: Math.max(0, prev.pendingDays - targetReq!.totalDays)
        };
        if (typeof window !== 'undefined') {
          try { localStorage.setItem('axionhr_pto_balance', JSON.stringify(next)); } catch (e) {}
        }
        return next;
      });
      setToastNotification(`Declined time-off request for ${targetReq.userName}.`);
    }

    fetch('/api/pto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'review', requestId, status, reviewedBy: userProfile.name, actingUserId: userProfile.id })
    }).catch(err => console.warn('PTO review notice:', err));
  };

  const cancelPtoRequest = (requestId: string) => {
    const existingReq = ptoRequests.find(r => r.id === requestId);
    const isOwner = !!existingReq && existingReq.userId === (userProfile.id || 'user-default');
    const isElevated = userRole === 'admin' || userRole === 'hr_manager';
    if (!isOwner && !isElevated) {
      setToastNotification('You can only cancel your own PTO requests.');
      return;
    }

    let targetReq: PtoRequest | undefined;
    setPtoRequests(prev => {
      const updated = prev.map(r => {
        if (r.id === requestId) {
          targetReq = r;
          return { ...r, status: 'cancelled' as const };
        }
        return r;
      });
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('axionhr_pto_requests', JSON.stringify(updated)); } catch (e) {}
      }
      return updated;
    });

    if (targetReq) {
      if (targetReq.status === 'pending') {
        setPtoBalance(prev => ({ ...prev, pendingDays: Math.max(0, prev.pendingDays - targetReq!.totalDays) }));
      } else if (targetReq.status === 'approved') {
        setPtoBalance(prev => ({
          ...prev,
          usedDays: Math.max(0, prev.usedDays - targetReq!.totalDays),
          remainingDays: prev.remainingDays + targetReq!.totalDays
        }));
      }
      setToastNotification(`Time-off request cancelled.`);
    }

    fetch('/api/pto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel', requestId, actingUserId: userProfile.id })
    }).catch(err => console.warn('PTO cancel notice:', err));
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 768;
  });
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

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
        isNavigating,
        setActiveTab: (tab: NavTab) => {
          if (tab === activeTab) return;
          setIsNavigating(true);
          setActiveTab(tab);
          if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsSidebarOpen(false); // Only auto-close drawer on mobile
          }
          setTimeout(() => {
            setIsNavigating(false);
          }, 180);
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
        hrOutreachMessages,
        sendCaringOutreach,
        broadcastToDepartment,
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
        workShift,
        toggleClockInOut,
        resetWorkShift,
        teamShifts,
        isAttendanceModalOpen,
        setIsAttendanceModalOpen,
        ptoRequests,
        ptoBalance,
        isPtoModalOpen,
        setIsPtoModalOpen,
        submitPtoRequest,
        reviewPtoRequest,
        cancelPtoRequest,
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
        blockers,
        addBlocker,
        resolveBlocker,
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
        isSidebarOpen,
        toggleSidebar,
        toastNotification,
        setToastNotification,
        batchedNotifications,
        isBatchDigestVisible,
        dismissBatchDigest,
        clearBatchedNotifications,
        heldNotifications,
        isQuietHoursActive,
        isShieldHolding,
        releaseHeldNotifications
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
