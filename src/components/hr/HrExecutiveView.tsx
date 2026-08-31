'use client';

import React, { useState, useEffect } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { MoodLog, Blocker, getLateMinutes, isSameLocalDay } from '../../types/wellness';
import {
  Users,
  Bell,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  HeartHandshake,
  X,
  Activity,
  Smile,
  AlertTriangle,
  Palmtree,
  Inbox,
  Megaphone,
  Zap,
  Calendar
} from 'lucide-react';
import { StatusChip } from '../common/StatusChip';
import { EmptyState } from '../common/EmptyState';
import { Tooltip } from '../common/Tooltip';

// Free-text message HR sends directly to the flagged employee. Each pending
// alert card gets its own instance (and its own draft state) via .map().
const OutreachComposer: React.FC<{
  targetTeammate: string;
  isDarkMode: boolean;
  onSend: (message: string) => void;
}> = ({ targetTeammate, isDarkMode, onSend }) => {
  const [draft, setDraft] = useState('');

  const handleSend = () => {
    if (!draft.trim()) return;
    onSend(draft);
    setDraft('');
  };

  return (
    <div className="space-y-2">
      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder={`Message ${targetTeammate} directly...`}
        rows={2}
        className={`w-full rounded-xl border px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/40 ${
          isDarkMode ? 'bg-[#0f1116] border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
        }`}
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSend}
          disabled={!draft.trim()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send Message</span>
        </button>
      </div>
    </div>
  );
};

type DeptActionType = 'focus' | 'checkin' | 'broadcast';

// HR burnout-response action for one department, only ever opened from a row
// gated to Moderate/High risk. All three action types funnel into the same
// real delivery pipeline (broadcastToDepartment -> one persisted
// HrOutreachMessage per active employee, live via the realtime channel,
// surfaced in each recipient's Notifications bell) — none of them are a
// local-only status change.
const DepartmentActionModal: React.FC<{
  department: string;
  teamSize: number;
  riskScore: number;
  isDarkMode: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
}> = ({ department, teamSize, riskScore, isDarkMode, onClose, onSend }) => {
  const [actionType, setActionType] = useState<DeptActionType>('focus');
  const [checkInDate, setCheckInDate] = useState('');
  const [note, setNote] = useState('');
  const [broadcastText, setBroadcastText] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const focusMessage = `🎯 HR has flagged elevated workload signals in ${department} this week (risk score ${riskScore}/100). We're calling a team Focus Session — please block time for deep work and recovery.${note.trim() ? ` ${note.trim()}` : ''}`;
  const checkInMessage = checkInDate
    ? `📅 A team wellness check-in has been scheduled for ${department} on ${checkInDate}. Please hold the time — it's a space to talk through workload and support, not a status update.${note.trim() ? ` ${note.trim()}` : ''}`
    : '';
  const broadcastMessage = broadcastText.trim();

  const message = actionType === 'focus' ? focusMessage : actionType === 'checkin' ? checkInMessage : broadcastMessage;
  const canSend = actionType === 'checkin' ? checkInDate.trim().length > 0 : actionType === 'broadcast' ? broadcastMessage.length > 0 : true;

  const handleSend = () => {
    if (!canSend) return;
    onSend(message);
    onClose();
  };

  const tabs: { type: DeptActionType; label: string; icon: React.ReactNode }[] = [
    { type: 'focus', label: 'Focus Session', icon: <Zap className="w-3.5 h-3.5" /> },
    { type: 'checkin', label: 'Schedule Check-In', icon: <Calendar className="w-3.5 h-3.5" /> },
    { type: 'broadcast', label: 'Broadcast Message', icon: <Megaphone className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-7 transition-all ${
          isDarkMode ? 'bg-[#14161e] border-[#2e323e] text-white shadow-black/60' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold tracking-tight">{department} — Team Wellness Action</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sends a real message to {teamSize} active {teamSize === 1 ? 'employee' : 'employees'} in this department.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className={`flex items-center gap-1.5 p-1 rounded-xl border w-full ${isDarkMode ? 'bg-[#12141c] border-[#2e323e]' : 'bg-slate-100 border-slate-200'}`}>
            {tabs.map(tab => (
              <button
                key={tab.type}
                type="button"
                onClick={() => setActionType(tab.type)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  actionType === tab.type
                    ? isDarkMode ? 'bg-[#252834] text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs'
                    : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {actionType === 'focus' && (
            <div className="space-y-2">
              <p className={`text-xs leading-relaxed p-3 rounded-xl border ${isDarkMode ? 'bg-[#0f1116] border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                {focusMessage}
              </p>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Optional additional note..."
                rows={2}
                className={`w-full rounded-xl border px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/40 ${
                  isDarkMode ? 'bg-[#0f1116] border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>
          )}

          {actionType === 'checkin' && (
            <div className="space-y-2">
              <input
                type="date"
                value={checkInDate}
                min={todayStr}
                onChange={e => setCheckInDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                  isDarkMode ? 'bg-[#0f1116] border-slate-700 text-white focus:border-rose-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-rose-500 focus:bg-white'
                }`}
              />
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Optional additional note..."
                rows={2}
                className={`w-full rounded-xl border px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/40 ${
                  isDarkMode ? 'bg-[#0f1116] border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>
          )}

          {actionType === 'broadcast' && (
            <textarea
              value={broadcastText}
              onChange={e => setBroadcastText(e.target.value)}
              placeholder={`Message everyone in ${department}...`}
              rows={3}
              className={`w-full rounded-xl border px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/40 ${
                isDarkMode ? 'bg-[#0f1116] border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Send to {teamSize} {teamSize === 1 ? 'Employee' : 'Employees'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const HrExecutiveView: React.FC = () => {
  const {
    hrNotifications,
    unreadHrNotificationCount,
    dismissHrNotification,
    sendCaringOutreach,
    broadcastToDepartment,
    ptoRequests,
    reviewPtoRequest,
    teamShifts,
    accounts,
    isDarkMode
  } = useWellness();

  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState<boolean>(false);
  const [actionModalDept, setActionModalDept] = useState<{ name: string; teamSize: number; riskScore: number } | null>(null);
  const [activeAlertFilter, setActiveAlertFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [shiftFilter, setShiftFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Org-wide mood logs and blockers aren't in WellnessContext (which only holds
  // the logged-in user's own copy of each) — fetched directly from the same API
  // routes every employee action already writes through, so this view reflects
  // real org-wide activity instead of a hardcoded department array.
  const [orgMoodLogs, setOrgMoodLogs] = useState<MoodLog[]>([]);
  const [orgBlockers, setOrgBlockers] = useState<Blocker[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [moodsRes, blockersRes] = await Promise.all([fetch('/api/moods'), fetch('/api/blockers')]);
        if (!cancelled && moodsRes.ok) {
          const data = await moodsRes.json();
          if (Array.isArray(data.moodLogs)) setOrgMoodLogs(data.moodLogs);
        }
        if (!cancelled && blockersRes.ok) {
          const data = await blockersRes.json();
          if (Array.isArray(data.blockers)) setOrgBlockers(data.blockers);
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredNotifications = hrNotifications.filter(n => {
    if (activeAlertFilter === 'pending') return n.status === 'pending';
    if (activeAlertFilter === 'resolved') return n.status === 'resolved' || n.status === 'in_progress';
    return true;
  });

  // Dynamic Risk Highlight Config based on score level (low, normal, moderate, high)
  const getRiskHighlight = (score: number) => {
    if (score <= 25) {
      return {
        level: 'low',
        label: 'Low Risk',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500',
        progressGrad: 'from-emerald-500 to-teal-400',
        text: 'text-emerald-600 dark:text-emerald-400'
      };
    }
    if (score <= 50) {
      return {
        level: 'normal',
        label: 'Normal',
        badge: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
        dot: 'bg-blue-500',
        progressGrad: 'from-blue-500 to-cyan-400',
        text: 'text-blue-600 dark:text-blue-400'
      };
    }
    if (score <= 75) {
      return {
        level: 'moderate',
        label: 'Moderate Risk',
        badge: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
        dot: 'bg-amber-500',
        progressGrad: 'from-amber-500 to-orange-400',
        text: 'text-amber-600 dark:text-amber-400'
      };
    }
    return {
      level: 'high',
      label: 'High Risk',
      badge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
      dot: 'bg-rose-500',
      progressGrad: 'from-rose-500 to-red-600',
      text: 'text-rose-600 dark:text-rose-400'
    };
  };

  // Current week (Monday -> today), same boundary convention used by the
  // dashboard's weekly attendance summary and the AI Burnout Predictor.
  const now = new Date();
  const currentDayOfWeek = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - currentDayOfWeek);
  monday.setHours(0, 0, 0, 0);
  const isThisWeek = (dateStr: string) => new Date(dateStr) >= monday;

  const activeAccounts = accounts.filter(a => a.status === 'active');
  const departments = Array.from(new Set(activeAccounts.map(a => a.department))).filter(Boolean).sort();

  // Every department row below is computed from real shifts/blockers/alerts —
  // no seeded array. The risk score is an explicit, documented weighting of
  // real signals (see the tooltip on the heatmap header), not an opaque "AI" number.
  const deptStats = departments
    .map(dept => {
      const deptAccounts = activeAccounts.filter(a => a.department === dept);
      const deptShiftsThisWeek = teamShifts.filter(s => s.department === dept && isThisWeek(s.date));
      const overtimeHoursThisWeek = deptShiftsThisWeek.reduce((sum, s) => sum + s.overtimeSeconds, 0) / 3600;
      const lateArrivalsThisWeek = deptShiftsThisWeek.filter(s => getLateMinutes(s.clockInTime) > 0).length;
      const activeBlockerCount = orgBlockers.filter(b => b.department === dept && !b.resolvedAt).length;
      const pendingAlertCount = hrNotifications.filter(
        n => n.status === 'pending' && deptAccounts.some(a => a.name === n.targetTeammate)
      ).length;

      const riskScore = Math.min(
        100,
        Math.round(overtimeHoursThisWeek * 4 + lateArrivalsThisWeek * 6 + activeBlockerCount * 8 + pendingAlertCount * 15)
      );

      return {
        department: dept,
        totalMembers: deptAccounts.length,
        overtimeHoursThisWeek,
        lateArrivalsThisWeek,
        activeBlockerCount,
        pendingAlertCount,
        riskScore
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore);

  const orgRiskScore = deptStats.length > 0 ? Math.round(deptStats.reduce((sum, d) => sum + d.riskScore, 0) / deptStats.length) : 0;
  const orgRisk = getRiskHighlight(orgRiskScore);
  const highestRiskDept = deptStats.find(d => d.riskScore > 0);

  const todaysOrgMoodLogs = orgMoodLogs.filter(m => isSameLocalDay(m.createdAt));
  const uniqueCheckedInToday = new Set(todaysOrgMoodLogs.map(m => m.userName).filter(Boolean)).size;
  const moodParticipationRate = activeAccounts.length > 0 ? Math.round((uniqueCheckedInToday / activeAccounts.length) * 100) : 0;

  const orgActiveBlockers = orgBlockers.filter(b => !b.resolvedAt);

  return (
    <div className="space-y-4 sm:space-y-5 font-sans relative">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[11px] uppercase font-extrabold tracking-wider px-3 py-1 rounded-full border inline-block ${isDarkMode
                ? 'bg-blue-950/60 text-blue-300 border-blue-800'
                : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
              HR Executive Dashboard
            </span>
          </div>
          <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Organization Well-Being Overview
          </h2>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Live telemetry from real attendance, blockers, and check-in activity — no seeded or simulated figures.
          </p>
        </div>

        <button
          onClick={() => setShowNotificationsDrawer(true)}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer group shrink-0 ${unreadHrNotificationCount > 0
              ? isDarkMode
                ? 'bg-rose-950/60 border-rose-800 text-rose-300 hover:bg-rose-900/60'
                : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
              : isDarkMode
                ? 'bg-[#1a1d26] border-[#2e323e] text-slate-200 hover:bg-[#252834]'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          title="Open Confidential Caring Alerts & Notifications"
        >
          <div className="relative">
            <Bell className={`w-4 h-4 transition-transform group-hover:scale-110 ${unreadHrNotificationCount > 0 ? 'text-rose-500 animate-bounce' : isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`} />
            {unreadHrNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </div>
          <span>Caring Alerts</span>
          {unreadHrNotificationCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-xs">
              {unreadHrNotificationCount}
            </span>
          )}
        </button>
      </div>

      {/* KPI Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Organization Risk Index — average of the real, weighted per-department
            scores below (see the heatmap tooltip for the exact formula). */}
        <div className={`enterprise-card p-5 border rounded-2xl shadow-sm relative overflow-hidden border-t-4 ${orgRisk.dot.replace('bg-', 'border-t-')} ${isDarkMode ? 'bg-[#181a22] border-[#2e323e]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between gap-1.5">
            <span className={`text-xs font-bold tracking-tight flex items-center gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Organization Risk Index
              <Tooltip
                icon="help"
                align="left"
                content="Average of each department's risk score. Each score adds up real signals from this week: +4 per overtime hour logged, +6 per late clock-in, +8 per active workflow blocker, +15 per pending caring alert — capped at 100."
              />
            </span>
            <Activity className={`w-4 h-4 shrink-0 ${orgRisk.text}`} />
          </div>

          <div className="flex items-baseline justify-between mt-3 mb-2 gap-2 flex-wrap">
            <span className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {orgRiskScore}/100
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border flex items-center gap-1.5 shadow-2xs ${orgRisk.badge}`}>
              <span className={`w-2 h-2 rounded-full ${orgRisk.dot}`} />
              <span>{orgRisk.label}</span>
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full bg-gradient-to-r ${orgRisk.progressGrad} transition-all duration-1000 rounded-full`}
              style={{ width: `${orgRiskScore}%` }}
            />
          </div>

          <p className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {highestRiskDept
              ? `${highestRiskDept.department} shows the highest risk this week (${highestRiskDept.riskScore}/100)`
              : departments.length > 0
              ? 'No department shows elevated risk this week'
              : 'No active departments yet'}
          </p>
        </div>

        {/* Mood Check-In Participation — real distinct-employee count from
            today's org-wide mood logs, never the mood content itself. */}
        <div className={`enterprise-card p-5 border rounded-2xl shadow-sm relative overflow-hidden border-t-4 border-t-emerald-500 ${isDarkMode ? 'bg-[#181a22] border-[#2e323e]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between gap-1.5">
            <span className={`text-xs font-bold tracking-tight flex items-center gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Mood Check-In Participation
              <Tooltip
                icon="help"
                align="left"
                content="Share of active employees who logged at least one mood check-in today. Individual moods and notes stay anonymous to HR — this counts participation only."
              />
            </span>
            <Smile className="w-4 h-4 shrink-0 text-emerald-500" />
          </div>

          <div className="flex items-baseline justify-between mt-3 mb-2 gap-2 flex-wrap">
            <span className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {moodParticipationRate}%
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold border bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{uniqueCheckedInToday}/{activeAccounts.length} today</span>
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000" style={{ width: `${moodParticipationRate}%` }} />
          </div>

          <p className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Anonymized — HR sees participation, never individual entries
          </p>
        </div>

        {/* Active Workflow Blockers — real org-wide count from the Blockers page. */}
        <div className={`enterprise-card p-5 border rounded-2xl shadow-sm relative overflow-hidden border-t-4 ${orgActiveBlockers.length > 0 ? 'border-t-rose-500' : 'border-t-emerald-500'} ${isDarkMode ? 'bg-[#181a22] border-[#2e323e]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between gap-1.5">
            <span className={`text-xs font-bold tracking-tight flex items-center gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Active Workflow Blockers
              <Tooltip
                icon="help"
                align="right"
                content="Org-wide count of unresolved blockers logged on employees' Workflow Blockers page right now."
              />
            </span>
            <AlertTriangle className={`w-4 h-4 shrink-0 ${orgActiveBlockers.length > 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
          </div>

          <div className="flex items-baseline justify-between mt-3 mb-2 gap-2 flex-wrap">
            <span className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {orgActiveBlockers.length}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border flex items-center gap-1.5 shadow-2xs ${
              orgActiveBlockers.length > 0
                ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${orgActiveBlockers.length > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              <span>{orgActiveBlockers.length > 0 ? 'Needs attention' : 'All clear'}</span>
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${orgActiveBlockers.length > 0 ? 'bg-gradient-to-r from-rose-500 to-red-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`}
              style={{ width: `${orgActiveBlockers.length === 0 ? 100 : Math.min(100, orgActiveBlockers.length * 20)}%` }}
            />
          </div>

          <p className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Feeds directly into each department&apos;s risk score above
          </p>
        </div>
      </div>

      {/* Department Heatmap (wide) + Caring Alerts summary (narrow) — bento split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`enterprise-card p-6 border rounded-2xl lg:col-span-2 ${isDarkMode ? 'bg-[#181a22] border-[#2e323e]' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-1.5 mb-4">
            <h3 className={`text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Users className="w-5 h-5 text-blue-600" />
              Department Risk Heatmap
            </h3>
            <Tooltip
              icon="info"
              align="left"
              content="Departments are derived from active accounts, not a fixed list — creating a new department in Account Management adds a row here automatically."
            />
          </div>

          {departments.length === 0 ? (
            <EmptyState icon={Users} size="sm" title="No active employee accounts yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`text-[11px] uppercase font-bold border-b ${isDarkMode ? 'text-slate-400 border-[#2e323e] bg-[#12141c]' : 'text-slate-600 border-slate-200 bg-slate-50'}`}>
                  <tr>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Risk Score</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Team</th>
                    <th className="p-3.5">Overtime (wk)</th>
                    <th className="p-3.5">Blockers</th>
                    <th className="p-3.5 text-right">HR Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-[#252834]' : 'divide-slate-200'}`}>
                  {deptStats.map(item => {
                    const deptHighlight = getRiskHighlight(item.riskScore);
                    const canTrigger = deptHighlight.level === 'moderate' || deptHighlight.level === 'high';
                    return (
                      <tr key={item.department} className={`transition-colors ${isDarkMode ? 'hover:bg-[#1e212b]' : 'hover:bg-slate-50'}`}>
                        <td className={`p-3.5 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.department}</td>
                        <td className={`p-3.5 font-extrabold ${deptHighlight.text}`}>{item.riskScore}/100</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border flex items-center gap-1 w-fit ${deptHighlight.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${deptHighlight.dot}`} />
                            <span>{deptHighlight.label}</span>
                          </span>
                        </td>
                        <td className={`p-3.5 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item.totalMembers} Employees</td>
                        <td className={`p-3.5 font-bold ${item.overtimeHoursThisWeek > 0 ? (isDarkMode ? 'text-amber-400' : 'text-amber-600') : isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {item.overtimeHoursThisWeek > 0 ? `${item.overtimeHoursThisWeek.toFixed(1)}h` : 'None'}
                        </td>
                        <td className={`p-3.5 font-bold ${item.activeBlockerCount > 0 ? (isDarkMode ? 'text-rose-400' : 'text-rose-600') : isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {item.activeBlockerCount > 0 ? `${item.activeBlockerCount} active` : 'None'}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            disabled={!canTrigger}
                            onClick={() => setActionModalDept({ name: item.department, teamSize: item.totalMembers, riskScore: item.riskScore })}
                            title={canTrigger ? `Take a wellness action for ${item.department}` : 'Only available once risk reaches Moderate or High'}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                              canTrigger
                                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer active:scale-95'
                                : isDarkMode ? 'bg-slate-800/60 text-slate-600 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            <Megaphone className="w-3.5 h-3.5" />
                            <span>Trigger</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Caring Alerts summary tile */}
        <div className={`enterprise-card p-6 border rounded-2xl lg:col-span-1 flex flex-col ${isDarkMode ? 'bg-[#181a22] border-[#2e323e]' : 'bg-white border-slate-200'}`}>
          <h3 className={`text-base font-bold flex items-center gap-2 mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <HeartHandshake className="w-5 h-5 text-rose-500" />
            Caring Alerts
          </h3>

          {hrNotifications.length === 0 ? (
            <div className="flex-1 flex items-center">
              <EmptyState icon={CheckCircle2} iconAccent="emerald" size="sm" title="No teammate flags on record." />
            </div>
          ) : (
            <div className="flex-1 space-y-2.5">
              {hrNotifications.slice(0, 3).map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border text-left ${
                    alert.status === 'pending'
                      ? isDarkMode ? 'bg-rose-950/20 border-rose-800/40' : 'bg-rose-50/70 border-rose-200'
                      : isDarkMode ? 'bg-[#12141a] border-[#262b3a] opacity-70' : 'bg-slate-50 border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{alert.targetTeammate}</span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${alert.status === 'pending' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                      {alert.status === 'pending' ? 'Pending' : 'Handled'}
                    </span>
                  </div>
                  <p className={`text-[11px] line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{alert.reason}</p>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowNotificationsDrawer(true)}
            className="mt-4 w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadHrNotificationCount > 0 ? `Review ${unreadHrNotificationCount} Pending` : 'View All Alerts'}
          </button>
        </div>
      </div>

      {/* Live Shift Attendance & Time-In Board */}
      <div className={`enterprise-card p-6 border rounded-2xl ${isDarkMode ? 'border-slate-800 bg-[#16181f]' : 'border-slate-200 bg-white'} space-y-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Live Shift Attendance & Time-In Board
              </h3>
              {teamShifts.filter(s => s.status === 'active').length > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  {teamShifts.filter(s => s.status === 'active').length} On Shift Now
                </span>
              ) : (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  All Staff Off Duty
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time company attendance telemetry tracking who is clocked in, active shifts, and overtime hours.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto">
            <button
              onClick={() => setShiftFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                shiftFilter === 'all' ? 'bg-white dark:bg-[#1f222e] text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              All ({teamShifts.length})
            </button>
            <button
              onClick={() => setShiftFilter('active')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                shiftFilter === 'active' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              🟢 Active ({teamShifts.filter(s => s.status === 'active').length})
            </button>
            <button
              onClick={() => setShiftFilter('completed')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                shiftFilter === 'completed' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Completed ({teamShifts.filter(s => s.status === 'completed').length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-emerald-50/70 border-emerald-200'}`}>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">Currently Clocked In</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {teamShifts.filter(s => s.status === 'active').length}
              </span>
              <span className="text-xs text-emerald-700/80 dark:text-emerald-400/80">Employees Active</span>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#12141a] border-[#262b3a]' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Completed Today</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {teamShifts.filter(s => s.status === 'completed').length}
              </span>
              <span className="text-xs text-slate-400">Shifts Finished</span>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-amber-950/20 border-amber-800/40' : 'bg-amber-50/70 border-amber-200'}`}>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">Overtime Logged</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {(teamShifts.reduce((acc, curr) => acc + curr.overtimeSeconds, 0) / 3600).toFixed(1)}h
              </span>
              <span className="text-xs text-amber-700/80 dark:text-amber-400/80">Total OT Accumulated</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {teamShifts.filter(s => shiftFilter === 'all' || s.status === shiftFilter).length === 0 ? (
            <EmptyState
              icon={Clock}
              size="sm"
              title={shiftFilter === 'active' ? 'No employees are currently clocked in.' : 'No attendance logs recorded yet.'}
            />
          ) : (
            <div className="space-y-2.5">
              {teamShifts
                .filter(s => shiftFilter === 'all' || s.status === shiftFilter)
                .map(shift => {
                  const isShiftActive = shift.status === 'active';
                  const workedHours = (shift.totalWorkedSeconds / 3600).toFixed(1);
                  const overtimeHours = (shift.overtimeSeconds / 3600).toFixed(1);

                  return (
                    <div
                      key={shift.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isShiftActive
                          ? isDarkMode ? 'bg-emerald-950/20 border-emerald-800/60 shadow-xs' : 'bg-emerald-50/40 border-emerald-200 shadow-xs'
                          : isDarkMode ? 'bg-[#12141a] border-[#262b3a]' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <img src={shift.userAvatar} alt={shift.userName} className="w-10 h-10 rounded-2xl border-2 border-blue-500 object-cover shrink-0" />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{shift.userName}</span>
                            <span className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>• {shift.department}</span>
                            {isShiftActive ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white flex items-center gap-1 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                On Shift (Live)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Off Duty</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                            📅 {shift.date} • Clocked in at <strong className="text-blue-600 dark:text-blue-400 font-bold">{shift.clockInTime}</strong>
                            {shift.clockOutTime && (
                              <span> &rarr; Clocked out at <strong className="text-slate-700 dark:text-slate-300 font-bold">{shift.clockOutTime}</strong></span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                        <div className="text-right">
                          <span className={`text-xs font-bold block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{workedHours}h Logged</span>
                          {parseFloat(overtimeHours) > 0 ? (
                            <span className="text-[10px] font-extrabold text-amber-500 block">+{overtimeHours}h Overtime</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 block">Standard 8.0h Shift</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Team Rest & Leave Approvals Vault */}
      <div className={`enterprise-card p-6 border rounded-2xl ${isDarkMode ? 'border-slate-800 bg-[#16181f]' : 'border-slate-200 bg-white'} space-y-6`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Palmtree className="w-5 h-5 text-cyan-500" />
              Team Leave Approvals & Rest Vault
            </h3>
            {ptoRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                {ptoRequests.filter(r => r.status === 'pending').length} Action Required
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review employee time-off requests. 1-Day mental health recharge leaves are auto-approved by AI Wellness Guard.
          </p>
        </div>

        <div className="space-y-3">
          {ptoRequests.length === 0 ? (
            <EmptyState icon={Inbox} size="sm" title="No team leave requests recorded." />
          ) : (
            <div className="space-y-3">
              {ptoRequests.map(req => {
                const getCategoryLabel = () => {
                  switch (req.category) {
                    case 'mental_health':
                      return '🧘 Mental Health / Wellness';
                    case 'sick':
                      return '🤒 Medical / Sick';
                    case 'personal':
                      return '🏡 Personal & Family Care';
                    case 'birthday':
                      return '🎂 Birthday Perk';
                    default:
                      return '🏖️ Annual Vacation';
                  }
                };

                return (
                  <div
                    key={req.id}
                    className={`p-4.5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isDarkMode ? 'bg-[#12141a] border-[#262b3a] hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-white hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <img src={req.userAvatar} alt={req.userName} className="w-10 h-10 rounded-2xl border-2 border-blue-500 object-cover shrink-0 shadow-xs" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{req.userName}</span>
                          <span className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>• {req.department}</span>
                          <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800">
                            {getCategoryLabel()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                          📅 {req.startDate} {req.startDate !== req.endDate ? `to ${req.endDate}` : ''}{' '}
                          <strong className="text-blue-600 dark:text-blue-400 font-bold">
                            ({req.totalDays} {req.totalDays === 1 ? 'Day' : 'Days'})
                          </strong>
                          {req.reason && ` — "${req.reason}"`}
                        </p>
                        {req.reviewedBy && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Status: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{req.status.toUpperCase()}</span> by {req.reviewedBy}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                      {req.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => reviewPtoRequest(req.id, 'approved')}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => reviewPtoRequest(req.id, 'rejected')}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all border cursor-pointer active:scale-95 ${
                              isDarkMode ? 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/50' : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </>
                      ) : req.status === 'approved' ? (
                        <StatusChip status="approved" size="md" label={req.autoApproved ? 'Auto-Approved' : 'Approved'} />
                      ) : (
                        <StatusChip status={req.status} size="md" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SLIDE-OVER SIDE DRAWER: Caring Teammate Wellness Flags & Outreach */}
      {showNotificationsDrawer && (
        <>
          <div
            onClick={() => setShowNotificationsDrawer(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
          />

          <div
            className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isDarkMode
                ? 'bg-[#151720] border-l border-[#2e323e] text-white'
                : 'bg-white border-l border-slate-200 text-slate-900'
              }`}
          >
            <div className={`p-5 sm:p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-[#252834] bg-[#12141c]' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold tracking-tight">Caring Alerts & Outreach</h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${isDarkMode ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-rose-100 text-rose-800 border-rose-200'}`}>
                      {unreadHrNotificationCount} Pending
                    </span>
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Confidential peer teammate flags</p>
                </div>
              </div>

              <button
                onClick={() => setShowNotificationsDrawer(false)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode ? 'border-[#2e323e] hover:bg-[#252834] text-slate-400 hover:text-white' : 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800'}`}
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'border-[#252834] bg-[#151720]' : 'border-slate-100 bg-white'}`}>
              <div className={`flex items-center gap-1.5 p-1 rounded-xl border w-full ${isDarkMode ? 'bg-[#12141c] border-[#2e323e]' : 'bg-slate-100 border-slate-200'}`}>
                <button
                  onClick={() => setActiveAlertFilter('all')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeAlertFilter === 'all' ? (isDarkMode ? 'bg-[#252834] text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs') : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')}`}
                >
                  All ({hrNotifications.length})
                </button>
                <button
                  onClick={() => setActiveAlertFilter('pending')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeAlertFilter === 'pending' ? (isDarkMode ? 'bg-[#252834] text-rose-300 shadow-xs' : 'bg-white text-rose-700 shadow-xs') : (isDarkMode ? 'text-slate-400 hover:text-rose-300' : 'text-slate-600 hover:text-rose-700')}`}
                >
                  Pending ({unreadHrNotificationCount})
                </button>
                <button
                  onClick={() => setActiveAlertFilter('resolved')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeAlertFilter === 'resolved' ? (isDarkMode ? 'bg-[#252834] text-emerald-300 shadow-xs' : 'bg-white text-emerald-700 shadow-xs') : (isDarkMode ? 'text-slate-400 hover:text-emerald-300' : 'text-slate-600 hover:text-emerald-700')}`}
                >
                  Resolved ({hrNotifications.length - unreadHrNotificationCount})
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {filteredNotifications.length === 0 ? (
                <EmptyState icon={CheckCircle2} iconAccent="emerald" title="All caring alerts addressed" description="No pending teammate wellness flags in this filter." />
              ) : (
                filteredNotifications.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      alert.status === 'pending'
                        ? isDarkMode ? 'bg-[#1c1f2a] border-rose-500/40 text-white' : 'bg-rose-50/60 border-rose-200 text-slate-900 shadow-xs'
                        : isDarkMode ? 'bg-[#12141c] border-[#252834] text-slate-300 opacity-80' : 'bg-slate-50 border-slate-200 text-slate-800 opacity-80'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{alert.targetTeammate}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isDarkMode ? 'bg-rose-950 text-rose-300 border-rose-900' : 'bg-rose-100 text-rose-800 border-rose-200'}`}>
                          🛡️ 100% Anonymous Flag
                        </span>
                      </div>

                      <button
                        onClick={() => dismissHrNotification(alert.id)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-950/40' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-100'}`}
                        title="Dismiss alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className={`text-xs font-medium leading-relaxed p-3 rounded-xl border mb-3 ${isDarkMode ? 'bg-black/30 text-slate-200 border-white/5' : 'bg-white text-slate-800 border-slate-200 shadow-2xs'}`}>
                      &ldquo;{alert.reason}&rdquo;
                    </p>

                    <span className={`text-[11px] flex items-center gap-1 font-medium mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      <Clock className="w-3 h-3" />
                      {alert.timestamp}
                    </span>

                    {alert.status === 'pending' ? (
                      <OutreachComposer
                        targetTeammate={alert.targetTeammate}
                        isDarkMode={isDarkMode}
                        onSend={(msg) => sendCaringOutreach(alert.id, alert.targetTeammate, msg)}
                      />
                    ) : (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Outreach Completed</span>
                        </span>
                        {alert.actionNote && (
                          <p className={`text-xs leading-relaxed p-3 rounded-xl border flex items-start gap-2 ${isDarkMode ? 'bg-blue-950/20 border-blue-900/40 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>
                            <Send className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>Sent to {alert.targetTeammate}: &ldquo;{alert.actionNote}&rdquo;</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {actionModalDept && (
        <DepartmentActionModal
          department={actionModalDept.name}
          teamSize={actionModalDept.teamSize}
          riskScore={actionModalDept.riskScore}
          isDarkMode={isDarkMode}
          onClose={() => setActionModalDept(null)}
          onSend={(message) => broadcastToDepartment(actionModalDept.name, message)}
        />
      )}

    </div>
  );
};
