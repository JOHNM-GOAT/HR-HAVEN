'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { Bell, X, CheckCheck, Trash2 } from 'lucide-react';

export const NotificationsBell: React.FC = () => {
  const {
    ptoRequests,
    userProfile,
    badges,
    workShift,
    batchedNotifications,
    clearBatchedNotifications,
    setActiveTab,
    isDarkMode
  } = useWellness();

  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState<boolean>(false);

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

  const upcomingLeave = ptoRequests.find(
    r => (r.userId === userProfile.id || r.userName === userProfile.name) &&
      r.status === 'approved' && new Date(r.endDate) >= new Date()
  );

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
};
