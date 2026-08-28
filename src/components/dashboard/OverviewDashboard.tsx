'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { MoodType, getBurnoutRiskConfig } from '../../types/wellness';
import { PolarBearEmoji } from '../common/PolarBearEmoji';
import {
  ShieldAlert,
  Smile,
  Sparkles,
  Heart,
  Clock,
  Calendar,
  Activity,
  Award,
  Zap,
  ArrowRight,
  Moon,
  CheckCircle2,
  TrendingDown,
  Mail,
  Palmtree,
  Bell,
  X,
  ShieldCheck,
  Info,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCheck,
  Trash2,
  HelpCircle
} from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  const {
    burnoutMetrics,
    moodLogs,
    addMoodLog,
    setActiveExercise,
    setActiveTab,
    boundaryConfig,
    toggleFocusMode,
    accessibility,
    badges,
    userProfile,
    pomodoro,
    togglePomodoro,
    workShift,
    toggleClockInOut,
    resetWorkShift,
    teamShifts,
    ptoBalance,
    ptoRequests,
    setIsPtoModalOpen,
    setIsAttendanceModalOpen,
    batchedNotifications,
    clearBatchedNotifications,
    isDarkMode
  } = useWellness();

  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState<boolean>(false);
  const [calYear, setCalYear] = useState<number>(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState<number>(() => new Date().getMonth());
  const [calSelectedDay, setCalSelectedDay] = useState<number>(() => new Date().getDate());

  const [readNotifIds, setReadNotifIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('axionhr_read_notifs');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [clearedNotifIds, setClearedNotifIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('axionhr_cleared_notifs');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // 20-second cooldown between mood check-ins
  const CHECKIN_COOLDOWN = 20;
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const isCoolingDown = cooldownSeconds > 0;

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleMoodCheckIn = useCallback(
    (type: MoodType, energyLevel: number) => {
      if (isCoolingDown) return;
      addMoodLog(type, energyLevel);
      setCooldownSeconds(CHECKIN_COOLDOWN);
    },
    [isCoolingDown, addMoodLog]
  );

  const moodOptions: { type: MoodType; emoji: string; label: string; color: string }[] = [
    { type: 'thriving', emoji: '🤩', label: 'Thriving', color: 'hover:border-emerald-500 hover:bg-emerald-50 text-slate-800' },
    { type: 'good', emoji: '😊', label: 'Good', color: 'hover:border-blue-500 hover:bg-blue-50 text-slate-800' },
    { type: 'okay', emoji: '🙂', label: 'Okay', color: 'hover:border-amber-500 hover:bg-amber-50 text-slate-800' },
    { type: 'stressed', emoji: '😰', label: 'Stressed', color: 'hover:border-orange-500 hover:bg-orange-50 text-slate-800' },
    { type: 'exhausted', emoji: '😫', label: 'Exhausted', color: 'hover:border-rose-500 hover:bg-rose-50 text-slate-800' },
  ];

  const DashboardTooltip: React.FC<{
    icon?: 'info' | 'help';
    content: React.ReactNode;
    align?: 'left' | 'center' | 'right';
    className?: string;
  }> = ({ icon = 'info', content, align = 'center', className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div
        className={`relative inline-flex items-center group ${className}`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(prev => !prev);
          }}
          aria-label="More information"
          className="p-1 rounded-full text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          {icon === 'help' ? (
            <HelpCircle className="w-3.5 h-3.5" />
          ) : (
            <Info className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Tooltip Floating Card */}
        <div
          role="tooltip"
          className={`absolute top-full mt-2 w-64 sm:w-72 p-3.5 rounded-2xl border shadow-2xl z-40 text-left transition-all duration-200 transform origin-top ${
            align === 'left'
              ? 'left-0'
              : align === 'right'
              ? 'right-0'
              : 'left-1/2 -translate-x-1/2'
          } ${
            isOpen
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
          } ${
            isDarkMode
              ? 'bg-[#181a24]/95 backdrop-blur-md border-[#2d3242] text-slate-200 shadow-black/80'
              : 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-700 shadow-slate-200/80'
          }`}
        >
          {content}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Header (Transparent, Borderless & Boxless) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-2">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Hi, <span className="text-blue-600 dark:text-blue-400">{userProfile.name}</span>
          </h2>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* AI Coach Insight Icon-only Button */}
          <button
            onClick={() => setActiveTab('mental')}
            title="AI Coach Insight: Alex, you have 3 back-to-back meetings starting at 2:00 PM. Enable Boundary Guard to hold non-essential notifications."
            className={`p-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 flex items-center justify-center relative group ${isDarkMode
                ? 'bg-[#202229] border-[#2e323d] text-blue-400 hover:bg-[#282b35] hover:border-blue-500/50'
                : 'bg-white border-slate-200 text-blue-600 hover:bg-blue-50 shadow-xs'
              }`}
          >
            <Sparkles className="w-4 h-4 text-blue-500 transition-transform group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveExercise('stretch')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Heart className="w-4 h-4 fill-white" />
            <span>Take 2-Min Break</span>
          </button>
          <button
            onClick={() => {
              togglePomodoro();
              if (!accessibility.focusModeActive) {
                toggleFocusMode();
              }
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${pomodoro.isRunning
                ? 'bg-emerald-600 text-white shadow-emerald-500/20 shadow-md'
                : isDarkMode
                  ? 'bg-[#202229] border border-[#2e323d] text-slate-200 hover:bg-[#282b35]'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
              }`}
          >
            <Zap className={`w-4 h-4 ${pomodoro.isRunning ? 'animate-bounce' : ''}`} />
            <span>
              {pomodoro.isRunning
                ? `Focus Active (${Math.floor(pomodoro.secondsRemaining / 60)}:${String(pomodoro.secondsRemaining % 60).padStart(2, '0')})`
                : 'Start Focus Session'}
            </span>
          </button>

          {/* Interactive Notification Bell Icon & Popover */}
          {(() => {
            const upcomingLeave = ptoRequests.find(r => r.status === 'approved' && new Date(r.endDate) >= new Date());

            const isUserMentioned = (recipientName: string) => {
              if (!recipientName) return false;
              const cleanRecipient = recipientName.trim().toLowerCase();
              const userName = (userProfile.name || '').trim().toLowerCase();
              const userEmail = (userProfile.email || '').trim().toLowerCase();
              if (userName && (cleanRecipient === userName || cleanRecipient.includes(userName) || userName.includes(cleanRecipient))) return true;
              if (userEmail && cleanRecipient === userEmail) return true;
              return false;
            };

            const receivedBadgeNotifications = badges
              .filter(b => isUserMentioned(b.recipientName))
              .map(b => {
                const badgeIcon =
                  b.badgeType === 'lifesaver'
                    ? '🆘'
                    : b.badgeType === 'focus_champion'
                    ? '🎯'
                    : b.badgeType === 'team_anchor'
                    ? '⚓'
                    : '🌟';
                const badgeLabel =
                  b.badgeType === 'lifesaver'
                    ? 'Lifesaver'
                    : b.badgeType === 'focus_champion'
                    ? 'Focus Champion'
                    : b.badgeType === 'team_anchor'
                    ? 'Team Anchor'
                    : 'Positive Energy';

                return {
                  id: `notif-badge-${b.id}`,
                  type: 'badge' as const,
                  icon: badgeIcon,
                  title: `🌟 Appreciation: ${badgeLabel}`,
                  message: `${b.senderName} recognized you: "${b.message}"${b.virtualCoffeeSent ? ' ☕ (Includes Virtual Coffee!)' : ''}`,
                  time: b.timestamp || 'Recent',
                  unread: true,
                  actionTab: 'social' as const
                };
              });

            const rawNotificationsList = [
              ...receivedBadgeNotifications,
              ...(upcomingLeave ? [{
                id: 'notif-leave',
                type: 'leave' as const,
                icon: '🏖️',
                title: 'Upcoming Approved Rest Day',
                message: `${upcomingLeave.category === 'mental_health' ? '🧘 Mental Health Recharge' : '🏖️ Vacation Leave'} (${upcomingLeave.startDate} • ${upcomingLeave.totalDays} ${upcomingLeave.totalDays === 1 ? 'Day' : 'Days'}) — Auto Boundary Shield is scheduled.`,
                time: 'Scheduled',
                unread: true,
                actionTab: undefined
              }] : []),
              {
                id: 'notif-shift',
                type: 'shift' as const,
                icon: '⏱️',
                title: 'Workday Shift Telemetry',
                message: workShift.isClockedIn
                  ? `Shift active (${(workShift.totalWorkedSeconds / 3600).toFixed(1)}h logged). Target: 8.0h.`
                  : 'You are currently off duty. Click Clock In when starting your workday.',
                time: 'Just now',
                unread: workShift.isClockedIn,
                actionTab: undefined
              },
              {
                id: 'notif-wellness',
                type: 'wellness' as const,
                icon: '💡',
                title: 'AI Wellness Coach Tip',
                message: 'Maintain healthy intervals by taking a 2-min stretch or eye-relaxation break every 90 minutes.',
                time: 'Today',
                unread: false,
                actionTab: 'mental' as const
              },
              ...batchedNotifications.map(bn => ({
                id: bn.id,
                type: 'batch' as const,
                icon: '📦',
                title: 'Queued Focus Notification',
                message: bn.message,
                time: new Date(bn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                unread: true,
                actionTab: undefined
              }))
            ];

            const activeNotifications = rawNotificationsList.filter(n => !clearedNotifIds.includes(n.id));
            const notificationsList = activeNotifications.map(n => ({
              ...n,
              unread: readNotifIds.includes(n.id) ? false : n.unread
            }));
            const unreadCount = notificationsList.filter(n => n.unread).length;

            const handleMarkAllRead = () => {
              const allIds = activeNotifications.map(n => n.id);
              const nextRead = Array.from(new Set([...readNotifIds, ...allIds]));
              setReadNotifIds(nextRead);
              try {
                localStorage.setItem('axionhr_read_notifs', JSON.stringify(nextRead));
              } catch (e) {}
            };

            const handleClearAll = () => {
              const allIds = rawNotificationsList.map(n => n.id);
              const nextCleared = Array.from(new Set([...clearedNotifIds, ...allIds]));
              setClearedNotifIds(nextCleared);
              try {
                localStorage.setItem('axionhr_cleared_notifs', JSON.stringify(nextCleared));
              } catch (e) {}
              clearBatchedNotifications();
            };

            const handleClearItem = (id: string, e: React.MouseEvent) => {
              e.stopPropagation();
              const nextCleared = Array.from(new Set([...clearedNotifIds, id]));
              setClearedNotifIds(nextCleared);
              try {
                localStorage.setItem('axionhr_cleared_notifs', JSON.stringify(nextCleared));
              } catch (e) {}
            };

            const handleItemClick = (item: typeof notificationsList[0]) => {
              if (!readNotifIds.includes(item.id)) {
                const nextRead = Array.from(new Set([...readNotifIds, item.id]));
                setReadNotifIds(nextRead);
                try {
                  localStorage.setItem('axionhr_read_notifs', JSON.stringify(nextRead));
                } catch (e) {}
              }
              if (item.actionTab) {
                setActiveTab(item.actionTab);
                setShowNotificationsDropdown(false);
              }
            };

            return (
              <div className="relative">
                <button
                  onClick={() => setShowNotificationsDropdown(prev => !prev)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 flex items-center justify-center relative ${
                    showNotificationsDropdown
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : isDarkMode
                      ? 'bg-[#202229] border-[#2e323d] text-slate-200 hover:bg-[#282b35]'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
                  }`}
                  title="View Notifications & Rest Alerts"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Popover */}
                {showNotificationsDropdown && (
                  <>
                    <div
                      onClick={() => setShowNotificationsDropdown(false)}
                      className="fixed inset-0 z-40"
                    />
                    <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl border shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150 ${
                      isDarkMode
                        ? 'bg-[#151722] border-[#2d3242] text-white shadow-black/80'
                        : 'bg-white border-slate-200 text-slate-900 shadow-xl'
                    }`}>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <h4 className="text-xs font-black uppercase tracking-wider">Notifications & Alerts</h4>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              {unreadCount} New
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setShowNotificationsDropdown(false)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2.5 my-3 max-h-72 overflow-y-auto pr-0.5">
                        {notificationsList.length === 0 ? (
                          <div className="py-8 px-4 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-2xl mb-2.5">
                              ✨
                            </div>
                            <p className="text-xs font-black text-slate-800 dark:text-slate-200">All caught up!</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">No active notifications or alerts</p>
                          </div>
                        ) : (
                          notificationsList.map(item => (
                            <div
                              key={item.id}
                              onClick={() => handleItemClick(item)}
                              className={`p-3 rounded-2xl border transition-all relative group ${
                                item.actionTab ? 'cursor-pointer hover:border-blue-500/60 hover:scale-[1.01]' : 'cursor-default'
                              } ${
                                item.unread
                                  ? isDarkMode
                                    ? 'bg-blue-950/20 border-blue-800/40'
                                    : 'bg-blue-50/60 border-blue-200'
                                  : isDarkMode
                                  ? 'bg-[#1b1e2a] border-[#292d3b]'
                                  : 'bg-slate-50 border-slate-100'
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                                <div className="flex-1 min-w-0 pr-4">
                                  <div className="flex items-center justify-between gap-1">
                                    <h5 className="text-xs font-bold truncate flex items-center gap-1.5">
                                      {item.unread && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                      )}
                                      <span>{item.title}</span>
                                    </h5>
                                    <span className="text-[9px] text-slate-400 shrink-0">{item.time}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                    {item.message}
                                  </p>
                                  {item.actionTab === 'social' && (
                                    <span className="text-[10px] text-blue-500 dark:text-blue-400 hover:underline font-bold mt-1.5 inline-flex items-center gap-1">
                                      View in Appreciation Feed →
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => handleClearItem(item.id, e)}
                                  title="Remove notification"
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer shrink-0"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          disabled={notificationsList.length === 0 || unreadCount === 0}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                          <span>Read All</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleClearAll}
                          disabled={notificationsList.length === 0}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clear</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Main Grid: Burnout Gauge + Workday Shift Gauge (Clock In/Out) + Mood Check-In */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Workday Shift Gauge (Clock-In / Clock-Out) - Matching Gauge Design */}
        {(() => {
          const standardShiftSeconds = 8 * 3600; // 8 hours target
          const shiftProgress = Math.min(100, Math.round((workShift.totalWorkedSeconds / standardShiftSeconds) * 100));

          const formatTimer = (totalSecs: number) => {
            const h = Math.floor(totalSecs / 3600);
            const m = Math.floor((totalSecs % 3600) / 60);
            const s = totalSecs % 60;
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
          };

          const formatReadable = (totalSecs: number) => {
            const h = Math.floor(totalSecs / 3600);
            const m = Math.floor((totalSecs % 3600) / 60);
            const s = totalSecs % 60;
            if (h > 0) return `${h}h ${m}m ${s}s`;
            if (m > 0) return `${m}m ${s}s`;
            return `${s}s`;
          };

          const now = new Date();
          const currentHour = now.getHours();
          const isLunchWindow = currentHour === 12; // 12:00 PM to 12:59 PM

          const currentShiftTier = workShift.totalWorkedSeconds < 4 * 3600
            ? 'morning'
            : workShift.totalWorkedSeconds <= 8 * 3600
            ? 'standard'
            : workShift.totalWorkedSeconds <= 10 * 3600
            ? 'moderate_ot'
            : 'high_ot';

          return (
            <div className={`enterprise-card p-6 border ${isDarkMode ? 'border-slate-800 bg-[#16181f] text-white' : 'border-slate-200 bg-white'} flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Workday Shift Gauge
                    </h3>
                    <DashboardTooltip
                      icon="info"
                      align="left"
                      content={
                        <div className="space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                            <p className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-blue-500" />
                              Shift Tier Breakdown
                            </p>
                          </div>
                          <div className="space-y-1 text-[11px]">
                            <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                              <span className="font-bold text-slate-700 dark:text-slate-300">Standard Shift</span>
                              <span className="font-extrabold text-blue-600 dark:text-blue-400">Up to 8h</span>
                            </div>
                            <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300">
                              <span className="font-bold">Overtime</span>
                              <span className="font-extrabold">8–10h</span>
                            </div>
                            <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300">
                              <span className="font-bold">High Overtime</span>
                              <span className="font-extrabold">10h+</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight pt-0.5">
                            Standard schedule: 9:00 AM – 6:00 PM (including 12:00 PM – 1:00 PM lunch recharge).
                          </p>
                        </div>
                      }
                    />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    workShift.isClockedIn
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                  }`}>
                    {workShift.isClockedIn ? '● Active' : '○ Off Duty'}
                  </span>
                </div>

                {/* 9:00 AM – 6:00 PM Work Schedule & 12:00 PM – 1:00 PM Lunch Break Header Strip */}
                <div className="flex items-center justify-between gap-2 my-2 py-1.5 px-2.5 rounded-xl bg-slate-50 dark:bg-[#1f222e] border border-slate-100 dark:border-slate-800/80 text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>9:00 AM – 6:00 PM</span>
                  </div>
                  <div className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1 ${
                    isLunchWindow
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 animate-pulse'
                      : isDarkMode
                      ? 'bg-slate-800/90 text-slate-300 border border-slate-700/60'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}>
                    🍱 Lunch: 12PM–1PM
                  </div>
                </div>

                {/* Circular Shift Gauge Visual */}
                <div className="flex flex-col items-center my-4">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100 dark:text-slate-800"
                        strokeWidth="3.8"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={
                          workShift.overtimeSeconds > 0
                            ? 'text-amber-500'
                            : workShift.isClockedIn
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }
                        strokeDasharray={`${workShift.isClockedIn || workShift.totalWorkedSeconds > 0 ? shiftProgress : 0}, 100`}
                        strokeWidth="3.8"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className={`text-2xl sm:text-[26px] font-black font-mono tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {formatTimer(workShift.totalWorkedSeconds)}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                        isLunchWindow && workShift.isClockedIn
                          ? 'text-emerald-500 font-extrabold'
                          : workShift.overtimeSeconds > 0
                          ? 'text-amber-500 font-extrabold'
                          : workShift.isClockedIn
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-400'
                      }`}>
                        {isLunchWindow && workShift.isClockedIn
                          ? '🍱 Lunch Hour'
                          : workShift.overtimeSeconds > 0
                          ? `+${formatTimer(workShift.overtimeSeconds)} OT`
                          : workShift.isClockedIn
                          ? 'Active Shift'
                          : 'Off Duty'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactive Clock-In / Clock-Out & Reset Action Buttons */}
                <div className="mt-1 flex items-center gap-2">
                  <button
                    onClick={toggleClockInOut}
                    className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 ${
                      workShift.isClockedIn
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                    }`}
                  >
                    {workShift.isClockedIn ? (
                      <>
                        <Moon className="w-4 h-4" />
                        <span>Clock Out ({formatTimer(workShift.totalWorkedSeconds)})</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>Clock In (Start Workday)</span>
                      </>
                    )}
                  </button>

                  {(workShift.totalWorkedSeconds > 0 || workShift.isClockedIn) && (
                    <button
                      type="button"
                      onClick={resetWorkShift}
                      title="Reset shift timer to 00:00:00"
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                        isDarkMode
                          ? 'bg-slate-800/80 hover:bg-rose-950/60 border-slate-700 hover:border-rose-700 text-slate-400 hover:text-rose-300'
                          : 'bg-slate-100 hover:bg-rose-50 border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600'
                      }`}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Card 2: Burnout Risk Ring Gauge */}
        <div className={`enterprise-card p-6 border ${isDarkMode ? 'border-slate-800 bg-[#16181f] text-white' : 'border-slate-200 bg-white'} flex flex-col justify-between`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  Burnout Risk Gauge
                </h3>
                <DashboardTooltip
                  icon="info"
                  align="left"
                  content={
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                        <p className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                          Burnout Risk Breakdown
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px] font-bold">
                        <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                          0–25: Low
                        </div>
                        <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                          26–50: Normal
                        </div>
                        <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                          51–75: Moderate
                        </div>
                        <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40">
                          76–100: High Risk
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight pt-0.5">
                        Scores update automatically based on work hours, breaks, and mood logs.
                      </p>
                    </div>
                  }
                />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                Live Telemetry
              </span>
            </div>

            {/* Circular Gauge Visual */}
            <div className="flex flex-col items-center my-4">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={getBurnoutRiskConfig(burnoutMetrics.riskLevel).strokeColor}
                    strokeDasharray={`${burnoutMetrics.overallScore}, 100`}
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {burnoutMetrics.overallScore}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${getBurnoutRiskConfig(burnoutMetrics.riskLevel).textColor} mt-0.5`}>
                    {getBurnoutRiskConfig(burnoutMetrics.riskLevel).label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Daily Mood Check-In Widget (Re-adjusted to 1-Column Fit) */}
        <div className={`enterprise-card p-6 border ${isDarkMode ? 'border-slate-800 bg-[#16181f] text-white' : 'border-slate-200 bg-white'} flex flex-col justify-between`}>
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <Smile className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Daily Mood Check-In
                </h3>
                <DashboardTooltip
                  icon="help"
                  align="right"
                  content={
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Smile className="w-3.5 h-3.5 text-blue-500" />
                        Daily Mood Telemetry
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        Log your mood throughout the day. Entries factor into your real-time Burnout Risk score.
                      </p>
                    </div>
                  }
                />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                {moodLogs.length > 0 ? `${moodLogs.length} logged` : 'Quick Check'}
              </span>
            </div>

            {/* Cooldown Timer */}
            {isCoolingDown && (
              <div className="flex items-center gap-2.5 my-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                <div className="relative w-6 h-6 shrink-0">
                  <svg className="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#fde68a" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15" fill="none" stroke="#f59e0b" strokeWidth="3"
                      strokeDasharray={`${(cooldownSeconds / CHECKIN_COOLDOWN) * 94.25} 94.25`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-amber-700 dark:text-amber-400">
                    {cooldownSeconds}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold">
                  Next check-in in <span className="font-bold">{cooldownSeconds}s</span>
                </p>
              </div>
            )}

            {/* 5 Emojis Compact Grid */}
            <div className={`grid grid-cols-5 gap-1.5 sm:gap-2 my-4 ${isCoolingDown ? 'opacity-50 pointer-events-none' : ''}`}>
              {moodOptions.map(option => (
                <button
                  key={option.type}
                  onClick={() => handleMoodCheckIn(option.type, option.type === 'thriving' ? 5 : option.type === 'good' ? 4 : option.type === 'okay' ? 3 : option.type === 'stressed' ? 2 : 1)}
                  disabled={isCoolingDown}
                  className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl border transition-all duration-300 transform-gpu hover:-translate-y-1.5 hover:scale-105 active:scale-95 shadow-xs hover:shadow-md cursor-pointer ${
                    isDarkMode
                      ? 'bg-[#1a1c22] border-[#2e323d] hover:border-blue-500/80 hover:bg-[#222632]'
                      : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-white'
                  } ${isCoolingDown ? 'cursor-not-allowed' : option.color} group`}
                  title={option.label}
                >
                  <span className="mb-1 flex items-center justify-center pointer-events-none">
                    <PolarBearEmoji mood={option.type} size={36} />
                  </span>
                  <span className={`text-[10px] font-bold transition-colors group-hover:text-blue-500 truncate max-w-full ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full Inline Attendance & Shift Calendar Widget (Replaces bottom 4 cards) */}
      {(() => {
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
        const firstDayIndex = (new Date(calYear, calMonth, 1).getDay() + 6) % 7; // Monday = 0

        const handlePrevMonth = () => {
          if (calMonth === 0) {
            setCalMonth(11);
            setCalYear(prev => prev - 1);
          } else {
            setCalMonth(prev => prev - 1);
          }
        };

        const handleNextMonth = () => {
          if (calMonth === 11) {
            setCalMonth(0);
            setCalYear(prev => prev + 1);
          } else {
            setCalMonth(prev => prev + 1);
          }
        };

        const getLateMinutes = (clockInStr?: string | null): number => {
          if (!clockInStr) return 0;
          const match = clockInStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
          if (!match) return 0;
          let hour = parseInt(match[1], 10);
          const minute = parseInt(match[2], 10);
          const period = (match[3] || '').toUpperCase();

          if (period === 'PM' && hour < 12) hour += 12;
          if (period === 'AM' && hour === 12) hour = 0;

          const clockInMinutes = hour * 60 + minute;
          const standardStartMinutes = 9 * 60; // 9:00 AM standard working time

          return clockInMinutes > standardStartMinutes ? clockInMinutes - standardStartMinutes : 0;
        };

        const formatLateDuration = (totalMinutes: number): string => {
          if (totalMinutes <= 0) return '0h 0m';
          const h = Math.floor(totalMinutes / 60);
          const m = totalMinutes % 60;
          if (h > 0 && m > 0) return `${h}h ${m}m`;
          if (h > 0) return `${h}h 0m`;
          return `0h ${m}m`;
        };

        const realToday = new Date();
        const isCurrentViewingMonth = calYear === realToday.getFullYear() && calMonth === realToday.getMonth();
        const todayDayNum = realToday.getDate();
        const todayDateStr = `${realToday.getFullYear()}-${String(realToday.getMonth() + 1).padStart(2, '0')}-${String(realToday.getDate()).padStart(2, '0')}`;

        const getDayShiftInfo = (day: number) => {
          const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayOfWeek = (new Date(calYear, calMonth, day).getDay() + 6) % 7;
          const isWeekend = dayOfWeek >= 5;
          const isToday = isCurrentViewingMonth && day === todayDayNum;

          // Today's live active work shift
          if (isToday && (workShift.isClockedIn || workShift.totalWorkedSeconds > 0)) {
            const lateM = getLateMinutes(workShift.clockInTime);
            return {
              type: 'shift' as const,
              clockIn: workShift.clockInTime || 'Active Now',
              clockOut: workShift.isClockedIn ? 'Active Shift' : workShift.clockOutTime || 'Off Duty',
              hours: (workShift.totalWorkedSeconds / 3600).toFixed(1),
              overtime: (workShift.overtimeSeconds / 3600).toFixed(1),
              lateMinutes: lateM,
              status: workShift.isClockedIn ? ('active' as const) : ('completed' as const)
            };
          }

          // Matched team shift from persistent DB
          const matchedShift = teamShifts.find(
            s => (s.userId === userProfile.id || s.userName === userProfile.name) && s.date === dateStr
          );
          if (matchedShift) {
            const lateM = getLateMinutes(matchedShift.clockInTime);
            return {
              type: 'shift' as const,
              clockIn: matchedShift.clockInTime || 'Clocked In',
              clockOut: matchedShift.clockOutTime || (matchedShift.status === 'active' ? 'Active Shift' : 'Completed'),
              hours: (matchedShift.totalWorkedSeconds / 3600).toFixed(1),
              overtime: (matchedShift.overtimeSeconds / 3600).toFixed(1),
              lateMinutes: lateM,
              status: matchedShift.status
            };
          }

          // Matched approved PTO request
          const matchedPto = ptoRequests.find(
            r => r.status === 'approved' && dateStr >= r.startDate && dateStr <= r.endDate
          );
          if (matchedPto) {
            return {
              type: 'pto' as const,
              label: matchedPto.category === 'mental_health' ? '🧘 Mental Health Day' : '🏖️ Approved PTO',
              reason: matchedPto.reason || 'Rest & Recovery'
            };
          }

          if (isWeekend) {
            return { type: 'weekend' as const, label: 'Weekend Off' };
          }

          return { type: 'upcoming' as const, label: 'Scheduled Workday' };
        };

        const selectedDayData = getDayShiftInfo(calSelectedDay);

        // Real-time Monthly Summary Stats Calculations
        const monthPrefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
        const userMonthShifts = teamShifts.filter(
          s => (s.userId === userProfile.id || s.userName === userProfile.name) && s.date.startsWith(monthPrefix)
        );
        const hasTodayInUserShifts = userMonthShifts.some(s => s.date === todayDateStr);

        let totalMonthWorkedSecs = userMonthShifts.reduce((acc, s) => acc + (s.totalWorkedSeconds || 0), 0);
        let totalMonthOtSecs = userMonthShifts.reduce((acc, s) => acc + (s.overtimeSeconds || 0), 0);
        let totalLateCount = 0;
        let totalLateMins = 0;

        userMonthShifts.forEach(s => {
          const lateM = getLateMinutes(s.clockInTime);
          if (lateM > 0) {
            totalLateCount += 1;
            totalLateMins += lateM;
          }
        });

        if (isCurrentViewingMonth && !hasTodayInUserShifts && workShift.totalWorkedSeconds > 0) {
          totalMonthWorkedSecs += workShift.totalWorkedSeconds;
          totalMonthOtSecs += workShift.overtimeSeconds;
          const todayLateM = getLateMinutes(workShift.clockInTime);
          if (todayLateM > 0) {
            totalLateCount += 1;
            totalLateMins += todayLateM;
          }
        }

        const totalMonthHours = (totalMonthWorkedSecs / 3600).toFixed(1);
        const totalMonthOtHours = (totalMonthOtSecs / 3600).toFixed(1);

        const monthPtoDays = ptoRequests
          .filter(r => r.status === 'approved' && (r.startDate.startsWith(monthPrefix) || r.endDate.startsWith(monthPrefix)))
          .reduce((acc, r) => acc + r.totalDays, 0);

        const totalCompletedShifts = userMonthShifts.length + (isCurrentViewingMonth && (workShift.isClockedIn || workShift.totalWorkedSeconds > 0) ? 1 : 0);
        const onTimeRate = totalCompletedShifts > 0
          ? `${Math.round(((totalCompletedShifts - totalLateCount) / totalCompletedShifts) * 100)}%`
          : '100%';

        return (
          <div className={`enterprise-card p-6 border ${isDarkMode ? 'border-slate-800 bg-[#16181f]' : 'border-slate-200 bg-white'} space-y-6`}>
            {/* Widget Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`text-base font-black flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Monthly Attendance & Workday Shift Calendar
                  </h3>
                  <DashboardTooltip
                    icon="info"
                    align="left"
                    content={
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          Attendance & Shift History
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          View your shift logs, on-time records, overtime tracking, and monthly attendance history.
                        </p>
                      </div>
                    }
                  />
                </div>
              </div>

              {/* Month Navigation Pill */}
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto shadow-2xs">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-black px-2 text-slate-800 dark:text-slate-200">
                  {monthNames[calMonth]} {calYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split Layout: Calendar Grid (Left) + Selected Day Shift Inspector (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: 7-Column Calendar Grid */}
              <div className="lg:col-span-2 space-y-2">
                {/* Day of week headers */}
                <div className="grid grid-cols-7 gap-1.5 text-center mb-1">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(dayName => (
                    <span key={dayName} className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      {dayName}
                    </span>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Empty offsets */}
                  {Array.from({ length: firstDayIndex }).map((_, i) => (
                    <div key={`cal-pad-${i}`} className="h-16 rounded-2xl bg-transparent opacity-0" />
                  ))}

                  {/* Month Days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const shiftInfo = getDayShiftInfo(day);
                    const isSelected = calSelectedDay === day;
                    const isToday = isCurrentViewingMonth && day === todayDayNum;

                    return (
                      <button
                        type="button"
                        key={`day-${day}`}
                        onClick={() => setCalSelectedDay(day)}
                        className={`h-16 p-1.5 sm:p-2 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative group ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500 shadow-md'
                            : isToday
                            ? isDarkMode
                              ? 'bg-blue-950/40 border-blue-500/60'
                              : 'bg-blue-50/90 border-blue-400'
                            : shiftInfo.type === 'shift'
                            ? parseFloat(shiftInfo.overtime) > 0
                              ? isDarkMode
                                ? 'bg-amber-950/20 border-amber-800/40 hover:border-amber-500'
                                : 'bg-amber-50/50 border-amber-200 hover:border-amber-400'
                              : shiftInfo.lateMinutes && shiftInfo.lateMinutes > 0
                              ? isDarkMode
                                ? 'bg-rose-950/20 border-rose-800/40 hover:border-rose-500'
                                : 'bg-rose-50/50 border-rose-200 hover:border-rose-400'
                              : isDarkMode
                              ? 'bg-[#12141c] border-[#252834] hover:border-blue-500/50'
                              : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-blue-400'
                            : shiftInfo.type === 'pto'
                            ? isDarkMode
                              ? 'bg-cyan-950/30 border-cyan-800/50'
                              : 'bg-cyan-50 border-cyan-200'
                            : isDarkMode
                            ? 'bg-[#10121a]/60 border-slate-800/40 opacity-50'
                            : 'bg-slate-50/60 border-slate-100 opacity-50'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-xs font-black ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                            {day}
                          </span>
                          {isToday && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                          )}
                        </div>

                        {shiftInfo.type === 'shift' && (
                          <div className="text-[9px] sm:text-[10px] leading-tight">
                            <span className="font-extrabold text-blue-600 dark:text-blue-400 block truncate">
                              {shiftInfo.hours}h
                            </span>
                            {shiftInfo.lateMinutes && shiftInfo.lateMinutes > 0 ? (
                              <span className="text-[8px] font-bold text-rose-500 block truncate">
                                +{formatLateDuration(shiftInfo.lateMinutes)} Late
                              </span>
                            ) : parseFloat(shiftInfo.overtime) > 0 ? (
                              <span className="text-[8px] sm:text-[9px] font-bold text-amber-500 block truncate">
                                +{shiftInfo.overtime}h OT
                              </span>
                            ) : (
                              <span className="text-[8px] text-slate-400 block truncate hidden sm:block">
                                {shiftInfo.clockIn}
                              </span>
                            )}
                          </div>
                        )}

                        {shiftInfo.type === 'pto' && (
                          <div className="text-[8px] sm:text-[9px] font-bold text-cyan-600 dark:text-cyan-400 truncate">
                            🧘 Rest
                          </div>
                        )}

                        {shiftInfo.type === 'weekend' && (
                          <div className="text-[8px] text-slate-400 hidden sm:block">
                            Off
                          </div>
                        )}

                        {shiftInfo.type === 'upcoming' && (
                          <div className="text-[8px] text-slate-400 hidden sm:block">
                            9 AM
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Selected Day Inspector & Monthly Stats */}
              <div className="space-y-4">
                {/* Inspector Card */}
                <div className={`p-4.5 rounded-2xl border ${isDarkMode ? 'bg-[#12141c] border-[#252834]' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📅</span>
                      <div>
                        <h4 className="text-xs font-black">
                          {monthNames[calMonth]} {calSelectedDay}, {calYear}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {isCurrentViewingMonth && calSelectedDay === todayDayNum ? "Today's Active Shift" : "Shift History Report"}
                        </span>
                      </div>
                    </div>
                    {selectedDayData.type === 'shift' && parseFloat(selectedDayData.overtime) > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border bg-amber-500/10 text-amber-500 border-amber-500/30">
                        +{selectedDayData.overtime}h OT
                      </span>
                    ) : selectedDayData.type === 'shift' && selectedDayData.lateMinutes && selectedDayData.lateMinutes > 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border bg-rose-500/10 text-rose-500 border-rose-500/30">
                        +{formatLateDuration(selectedDayData.lateMinutes)} Late
                      </span>
                    ) : null}
                  </div>

                  {selectedDayData.type === 'shift' ? (
                    <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Time In</span>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <strong className="text-blue-600 dark:text-blue-400 font-extrabold text-sm">
                            {selectedDayData.clockIn}
                          </strong>
                          {selectedDayData.lateMinutes && selectedDayData.lateMinutes > 0 ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-rose-500/15 text-rose-500 border border-rose-500/30">
                              +{formatLateDuration(selectedDayData.lateMinutes)} Late
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                              On-Time
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Time Out</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-extrabold text-sm block mt-0.5">
                          {selectedDayData.clockOut}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Duration</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-extrabold text-sm block mt-0.5">
                          {selectedDayData.hours} Hours
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Overtime</span>
                        <strong className={`${parseFloat(selectedDayData.overtime) > 0 ? 'text-amber-500' : 'text-slate-400'} font-extrabold text-sm block mt-0.5`}>
                          {selectedDayData.overtime}h OT
                        </strong>
                      </div>
                    </div>
                  ) : selectedDayData.type === 'pto' ? (
                    <div className="mt-3 text-xs flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold">
                      <Palmtree className="w-4 h-4" />
                      <span>{selectedDayData.label}{selectedDayData.reason ? ` • ${selectedDayData.reason}` : ''}</span>
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-slate-400">
                      Scheduled Weekend / Off-Duty Rest Day
                    </div>
                  )}
                </div>

                {/* 4 Quick Monthly Summary Stats */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-[#12141c] border-[#252834]' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-[10px] font-bold text-slate-400 block">Total Work Logged</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white block mt-0.5">{totalMonthHours}h</span>
                  </div>

                  <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-emerald-50/70 border-emerald-200'}`}>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 block">On-Time Rate</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">{onTimeRate}</span>
                  </div>

                  <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-amber-950/20 border-amber-800/40' : 'bg-amber-50/70 border-amber-200'}`}>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 block">Total Overtime</span>
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400 block mt-0.5">{parseFloat(totalMonthOtHours) > 0 ? `+${totalMonthOtHours}h` : '0.0h'}</span>
                  </div>

                  <div className={`p-3 rounded-2xl border ${
                    totalLateCount > 0
                      ? isDarkMode
                        ? 'bg-rose-950/20 border-rose-800/40'
                        : 'bg-rose-50/70 border-rose-200'
                      : isDarkMode
                      ? 'bg-emerald-950/20 border-emerald-800/40'
                      : 'bg-emerald-50/70 border-emerald-200'
                  }`}>
                    <span className={`text-[10px] font-bold block ${
                      totalLateCount > 0
                        ? 'text-rose-700 dark:text-rose-300'
                        : 'text-emerald-700 dark:text-emerald-300'
                    }`}>
                      Late Arrival
                    </span>
                    <span className={`text-lg font-black block mt-0.5 ${
                      totalLateCount > 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {totalLateCount > 0 ? `${totalLateCount} (${formatLateDuration(totalLateMins)})` : '0 Late (0h 0m)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
