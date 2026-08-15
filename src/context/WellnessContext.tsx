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
  PomodoroTimer
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
  initialUserProfile
} from '../data/initialData';

export type NavTab = 'dashboard' | 'analytics' | 'physical' | 'mental' | 'social' | 'inclusive' | 'boundary' | 'hr' | 'accounts' | 'settings';

interface WellnessContextType {
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
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
  createAccount: (accountData: Omit<UserAccount, 'id' | 'createdAt' | 'lastActive'>) => void;
  updateAccountRole: (accountId: string, newRole: UserRole) => void;
  toggleAccountStatus: (accountId: string) => void;
  updateAccount: (accountId: string, updates: Partial<UserAccount>) => void;
  deleteAccount: (accountId: string) => void;

  burnoutMetrics: BurnoutMetrics;
  moodLogs: MoodLog[];
  addMoodLog: (mood: MoodType, energyLevel: number, note?: string) => void;
  
  reminders: WellnessReminder[];
  toggleReminder: (id: string) => void;
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
  const [userRole, setUserRole] = useState<UserRole>('employee');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

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

  const login = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
    if (role === 'admin') {
      setActiveTab('accounts');
      setToastNotification('Welcome to AxionHR Admin Portal (System Administrator)!');
    } else if (role === 'hr_manager') {
      setActiveTab('hr');
      setToastNotification('Welcome to AxionHR Executive Portal (HR View)!');
    } else {
      setActiveTab('dashboard');
      setToastNotification('Welcome back to AxionHR Haven (Employee View)!');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToastNotification('Logged out successfully.');
  };

  const addMoodLog = (mood: MoodType, energyLevel: number, note?: string) => {
    const newLog: MoodLog = {
      id: Date.now().toString(),
      timestamp: 'Just now',
      mood,
      energyLevel,
      note,
      isAnonymousToHr: true
    };
    setMoodLogs([newLog, ...moodLogs]);
    setToastNotification('Mood check-in logged anonymously! Thank you for sharing.');

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
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const sendPeerBadge = (recipientName: string, badgeType: PeerBadge['badgeType'], message: string, sendCoffee: boolean) => {
    const newBadge: PeerBadge = {
      id: Date.now().toString(),
      senderName: 'Alex Mercer (You)',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      recipientName,
      recipientAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      badgeType,
      message,
      virtualCoffeeSent: sendCoffee,
      timestamp: 'Just now'
    };
    setBadges([newBadge, ...badges]);
    setToastNotification(`Appreciation badge sent to ${recipientName}! ${sendCoffee ? '☕ Virtual coffee included!' : ''}`);
  };

  const suggestHrSupport = (teammateName: string, reason: string) => {
    setToastNotification(`Encouraging HR wellness check-in requested for ${teammateName} (100% Confidential).`);
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
  };

  const updateAccountRole = (accountId: string, newRole: UserRole) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        setToastNotification(`Updated role for ${acc.name} to ${newRole.toUpperCase().replace('_', ' ')}`);
        return { ...acc, role: newRole };
      }
      return acc;
    }));
  };

  const toggleAccountStatus = (accountId: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        const nextStatus = acc.status === 'active' ? 'disabled' : 'active';
        setToastNotification(`Account for ${acc.name} is now ${nextStatus.toUpperCase()}`);
        return { ...acc, status: nextStatus };
      }
      return acc;
    }));
  };

  const updateAccount = (accountId: string, updates: Partial<UserAccount>) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        setToastNotification(`Account details updated for ${acc.name}`);
        return { ...acc, ...updates };
      }
      return acc;
    }));
  };

  const deleteAccount = (accountId: string) => {
    const target = accounts.find(a => a.id === accountId);
    setAccounts(prev => prev.filter(acc => acc.id !== accountId));
    if (target) {
      setToastNotification(`Account for ${target.name} has been removed`);
    }
  };

  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Sync theme with system and HTML document element
  useEffect(() => {
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
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    setUserProfile(prev => ({ ...prev, theme: newTheme }));
    setToastNotification(`Theme changed to ${newTheme === 'dark' ? 'Dark Mode 🌙' : newTheme === 'light' ? 'Light Mode ☀️' : 'System Default 💻'}`);
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...updates };
      // Also sync user name & avatar with accounts list
      setAccounts(accs => accs.map(acc => {
        if (acc.id === updated.id || acc.email === updated.email) {
          return {
            ...acc,
            name: updated.name,
            avatarUrl: updated.avatarUrl,
            department: updated.department || acc.department
          };
        }
        return acc;
      }));
      return updated;
    });
    setToastNotification('Your profile settings have been saved.');
  };

  const changePassword = (currentPass: string, newPass: string): { success: boolean; message: string } => {
    const userAccount = accounts.find(a => a.id === userProfile.id || a.email === userProfile.email);
    const existingPass = userAccount?.password || 'password123';

    if (currentPass !== existingPass) {
      return { success: false, message: 'Current password is incorrect. Please try again.' };
    }

    if (!newPass || newPass.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }

    setAccounts(prev => prev.map(a => {
      if (a.id === userProfile.id || a.email === userProfile.email) {
        return { ...a, password: newPass };
      }
      return a;
    }));

    setToastNotification('Password successfully updated!');
    return { success: true, message: 'Password has been updated successfully.' };
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
        createAccount,
        updateAccountRole,
        toggleAccountStatus,
        updateAccount,
        deleteAccount,
        burnoutMetrics,
        moodLogs,
        addMoodLog,
        reminders,
        toggleReminder,
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
