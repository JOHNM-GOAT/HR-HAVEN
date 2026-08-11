'use client';

import React, { createContext, useContext, useState } from 'react';
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
  getBurnoutRiskLevel
} from '../types/wellness';
import { 
  initialBurnoutMetrics, 
  initialMoodLogs, 
  initialReminders, 
  initialBadges, 
  initialChatMessages, 
  initialBoundaryConfig, 
  initialAccessibilitySettings 
} from '../data/initialData';

export type NavTab = 'dashboard' | 'analytics' | 'physical' | 'mental' | 'social' | 'inclusive' | 'boundary' | 'hr';

interface WellnessContextType {
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;

  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  
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

  const login = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
    if (role === 'hr_manager') {
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
          setIsSidebarOpen(false); // Auto-close drawer on navigation select
        },
        userRole,
        setUserRole,
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
