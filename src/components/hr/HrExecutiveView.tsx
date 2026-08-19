'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { teamBurnoutOverview } from '../../data/initialData';
import {
  Users,
  Lock,
  ShieldAlert,
  Bell,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  HeartHandshake,
  X,
  TrendingUp,
  ShieldCheck,
  Activity
} from 'lucide-react';

export const HrExecutiveView: React.FC = () => {
  const {
    hrNotifications,
    unreadHrNotificationCount,
    dismissHrNotification,
    resolveHrNotification,
    setToastNotification,
    isDarkMode
  } = useWellness();

  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState<boolean>(false);
  const [activeAlertFilter, setActiveAlertFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  const handleIntervention = (dept: string, action: string) => {
    setToastNotification(`HR Intervention triggered for ${dept}: ${action}`);
  };

  const filteredNotifications = hrNotifications.filter(n => {
    if (activeAlertFilter === 'pending') return n.status === 'pending';
    if (activeAlertFilter === 'resolved') return n.status === 'resolved' || n.status === 'in_progress';
    return true;
  });

  // Calculate Average Organization Risk Score dynamically from team telemetry
  const avgOrgRiskScore = Math.round(
    teamBurnoutOverview.reduce((acc, curr) => acc + curr.riskScore, 0) / teamBurnoutOverview.length
  );

  // Dynamic Risk Highlight Config based on score level (low, normal, moderate, high)
  const getRiskHighlight = (score: number) => {
    if (score <= 25) {
      return {
        level: 'low',
        label: 'Low Risk',
        borderTop: 'border-t-4 border-t-emerald-500',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500',
        progressGrad: 'from-emerald-500 to-teal-400',
        text: 'text-emerald-600 dark:text-emerald-400'
      };
    }
    if (score <= 50) {
      return {
        level: 'normal',
        label: 'Normal / Healthy',
        borderTop: 'border-t-4 border-t-blue-500',
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
        borderTop: 'border-t-4 border-t-amber-500',
        badge: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
        dot: 'bg-amber-500',
        progressGrad: 'from-amber-500 to-orange-400',
        text: 'text-amber-600 dark:text-amber-400'
      };
    }
    return {
      level: 'high',
      label: 'High Risk (Critical)',
      borderTop: 'border-t-4 border-t-rose-500',
      badge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
      dot: 'bg-rose-500',
      progressGrad: 'from-rose-500 to-red-600',
      text: 'text-rose-600 dark:text-rose-400'
    };
  };

  const orgRisk = getRiskHighlight(avgOrgRiskScore);

  return (
    <div className="space-y-6 font-sans relative">

      {/* Top Header with Notification Icon Button */}
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
            Anonymized Organization Well-Being Heatmap
          </h2>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Aggregated telemetry insights and confidential peer flags for proactive HR well-being support.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Notification Icon Button (Opens Side Drawer) */}
          <button
            onClick={() => setShowNotificationsDrawer(true)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer group ${unreadHrNotificationCount > 0
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
      </div>

      {/* Summary KPI Cards with Dynamic Highlights (Low / Normal / Moderate / High) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* CARD 1: Total Organization Health Index (Dynamic Risk Highlight) */}
        <div className={`enterprise-card p-5 border rounded-2xl shadow-sm transition-all relative overflow-hidden ${orgRisk.borderTop} ${isDarkMode ? 'bg-[#181a22] border-[#2e323e]' : 'bg-white border-slate-200'
          }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold tracking-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Organization Health Index
            </span>
            <Activity className={`w-4 h-4 ${orgRisk.text}`} />
          </div>

          <div className="flex items-baseline justify-between mt-3 mb-2">
            <span className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {avgOrgRiskScore}/100
            </span>
            {/* Dynamic Highlight Pill Badge */}
            <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border flex items-center gap-1.5 shadow-2xs ${orgRisk.badge}`}>
              <span className={`w-2 h-2 rounded-full ${orgRisk.dot} animate-pulse`} />
              <span>{orgRisk.label}</span>
            </span>
          </div>

          {/* Mini Visual Score Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full bg-gradient-to-r ${orgRisk.progressGrad} transition-all duration-1000 rounded-full`}
              style={{ width: `${avgOrgRiskScore}%` }}
            />
          </div>

          <p className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Engineering & Sales show highest overtime risk
          </p>
        </div>

        {/* CARD 2: Anonymized Mood Check-In Rate (Optimal Highlight) */}
        <div className={`enterprise-card p-5 border rounded-2xl shadow-sm transition-all relative overflow-hidden border-t-4 border-t-emerald-500 ${isDarkMode ? 'bg-[#181a22] border-[#2e323e]' : 'bg-white border-slate-200'
          }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold tracking-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Anonymized Mood Check-In Rate
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="flex items-baseline justify-between mt-3 mb-2">
            <span className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              88.4%
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold border bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>+12% vs last month</span>
            </span>
          </div>

          {/* Mini Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              style={{ width: '88.4%' }}
            />
          </div>

          <p className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Replaced 100% of quarterly surveys with live check-ins
          </p>
        </div>

        {/* CARD 3: Active Boundary Shields Engaged (Normal/Active Highlight) */}
        <div className={`enterprise-card p-5 border rounded-2xl shadow-sm transition-all relative overflow-hidden border-t-4 border-t-blue-500 ${isDarkMode ? 'bg-[#181a22] border-[#2e323e]' : 'bg-white border-slate-200'
          }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold tracking-tight ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Active Boundary Shields Engaged
            </span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>

          <div className="flex items-baseline justify-between mt-3 mb-2">
            <span className={`text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              42 / 60
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold border bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>70% High Adoption</span>
            </span>
          </div>

          {/* Mini Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              style={{ width: '70%' }}
            />
          </div>

          <p className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Employees actively protecting quiet hours from after-hours pings
          </p>
        </div>

      </div>

      {/* Department Burnout Heatmap Table */}
      <div className={`enterprise-card p-6 border rounded-2xl ${isDarkMode ? 'bg-[#181a22] border-[#2e323e]' : 'bg-white border-slate-200'
        }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className={`text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Users className="w-5 h-5 text-blue-600" />
            Department Burnout Risk Heatmap & Interventions
          </h3>

          {unreadHrNotificationCount > 0 && (
            <button
              onClick={() => setShowNotificationsDrawer(true)}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer underline"
            >
              <span>{unreadHrNotificationCount} teammate flag(s) awaiting review ➔</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`text-[11px] uppercase font-bold border-b ${isDarkMode
                ? 'text-slate-400 border-[#2e323e] bg-[#12141c]'
                : 'text-slate-600 border-slate-200 bg-slate-50'
              }`}>
              <tr>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Risk Score</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Total Team</th>
                <th className="p-3.5">Overworking Alert</th>
                <th className="p-3.5 text-right">Recommended HR Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-[#252834]' : 'divide-slate-200'}`}>
              {teamBurnoutOverview.map((item, idx) => {
                const deptHighlight = getRiskHighlight(item.riskScore);
                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${isDarkMode
                        ? 'hover:bg-[#1e212b]'
                        : 'hover:bg-slate-50'
                      }`}
                  >
                    {/* Department Name */}
                    <td className={`p-3.5 font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                      {item.department}
                    </td>

                    {/* Risk Score with Colored Accent */}
                    <td className={`p-3.5 font-extrabold ${deptHighlight.text}`}>
                      {item.riskScore}/100
                    </td>

                    {/* Status Badge */}
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border flex items-center gap-1 w-fit ${deptHighlight.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${deptHighlight.dot}`} />
                        <span>{item.status}</span>
                      </span>
                    </td>

                    {/* Total Team */}
                    <td className={`p-3.5 font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                      {item.totalMembers} Employees
                    </td>

                    {/* Overworking Alert */}
                    <td className={`p-3.5 font-bold ${item.overworkingCount > 0
                        ? isDarkMode ? 'text-rose-400' : 'text-rose-600'
                        : isDarkMode ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                      {item.overworkingCount > 0 ? `${item.overworkingCount} Members Over 50h/wk` : 'No Overtime Flagged'}
                    </td>

                    {/* Action Button */}
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleIntervention(item.department, 'Scheduled Meeting-Free Focus Friday')}
                        className="px-3.5 py-1.5 rounded-lg bg-[#0070f3] hover:bg-blue-600 active:scale-95 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
                      >
                        Trigger Team Focus Day
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>


      {/* SLIDE-OVER SIDE DRAWER: Caring Teammate Wellness Flags & Outreach */}
      {showNotificationsDrawer && (
        <>
          {/* Backdrop Overlay */}
          <div
            onClick={() => setShowNotificationsDrawer(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
          />

          {/* Drawer Container (Slides In From Right) */}
          <div
            className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isDarkMode
                ? 'bg-[#151720] border-l border-[#2e323e] text-white'
                : 'bg-white border-l border-slate-200 text-slate-900'
              }`}
          >
            {/* Drawer Header */}
            <div className={`p-5 sm:p-6 border-b flex items-center justify-between ${isDarkMode ? 'border-[#252834] bg-[#12141c]' : 'border-slate-200 bg-slate-50'
              }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isDarkMode
                    ? 'bg-rose-950/50 border-rose-900 text-rose-400'
                    : 'bg-rose-50 border-rose-200 text-rose-600'
                  }`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold tracking-tight">
                      Caring Alerts & Outreach
                    </h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${isDarkMode
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}>
                      {unreadHrNotificationCount} Pending
                    </span>
                  </div>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Confidential peer teammate flags
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowNotificationsDrawer(false)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${isDarkMode
                    ? 'border-[#2e323e] hover:bg-[#252834] text-slate-400 hover:text-white'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                  }`}
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'border-[#252834] bg-[#151720]' : 'border-slate-100 bg-white'
              }`}>
              <div className={`flex items-center gap-1.5 p-1 rounded-xl border w-full ${isDarkMode
                  ? 'bg-[#12141c] border-[#2e323e]'
                  : 'bg-slate-100 border-slate-200'
                }`}>
                <button
                  onClick={() => setActiveAlertFilter('all')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeAlertFilter === 'all'
                      ? isDarkMode
                        ? 'bg-[#252834] text-white shadow-xs'
                        : 'bg-white text-slate-900 shadow-xs'
                      : isDarkMode
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  All ({hrNotifications.length})
                </button>
                <button
                  onClick={() => setActiveAlertFilter('pending')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeAlertFilter === 'pending'
                      ? isDarkMode
                        ? 'bg-[#252834] text-rose-300 shadow-xs'
                        : 'bg-white text-rose-700 shadow-xs'
                      : isDarkMode
                        ? 'text-slate-400 hover:text-rose-300'
                        : 'text-slate-600 hover:text-rose-700'
                    }`}
                >
                  Pending ({unreadHrNotificationCount})
                </button>
                <button
                  onClick={() => setActiveAlertFilter('resolved')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeAlertFilter === 'resolved'
                      ? isDarkMode
                        ? 'bg-[#252834] text-emerald-300 shadow-xs'
                        : 'bg-white text-emerald-700 shadow-xs'
                      : isDarkMode
                        ? 'text-slate-400 hover:text-emerald-300'
                        : 'text-slate-600 hover:text-emerald-700'
                    }`}
                >
                  Resolved ({hrNotifications.length - unreadHrNotificationCount})
                </button>
              </div>
            </div>

            {/* Scrollable Notification Cards List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className={`text-center py-16 border border-dashed rounded-2xl ${isDarkMode ? 'border-slate-800' : 'border-slate-200'
                  }`}>
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    All caring alerts addressed
                  </p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    No pending teammate wellness flags in this filter.
                  </p>
                </div>
              ) : (
                filteredNotifications.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-2xl border transition-all ${alert.status === 'pending'
                        ? isDarkMode
                          ? 'bg-[#1c1f2a] border-rose-500/40 text-white'
                          : 'bg-rose-50/60 border-rose-200 text-slate-900 shadow-xs'
                        : isDarkMode
                          ? 'bg-[#12141c] border-[#252834] text-slate-300 opacity-80'
                          : 'bg-slate-50 border-slate-200 text-slate-800 opacity-80'
                      }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {alert.targetTeammate}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isDarkMode
                            ? 'bg-rose-950 text-rose-300 border-rose-900'
                            : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}>
                          🛡️ 100% Anonymous Flag
                        </span>
                      </div>

                      <button
                        onClick={() => dismissHrNotification(alert.id)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${isDarkMode
                            ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-950/40'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-100'
                          }`}
                        title="Dismiss alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className={`text-xs font-medium leading-relaxed p-3 rounded-xl border mb-3 ${isDarkMode
                        ? 'bg-black/30 text-slate-200 border-white/5'
                        : 'bg-white text-slate-800 border-slate-200 shadow-2xs'
                      }`}>
                      &ldquo;{alert.reason}&rdquo;
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className={`text-[11px] flex items-center gap-1 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Clock className="w-3 h-3" />
                        {alert.timestamp}
                      </span>

                      {alert.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => resolveHrNotification(alert.id, `1:1 Wellness check-in scheduled with ${alert.targetTeammate}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
                          >
                            <HeartHandshake className="w-3.5 h-3.5" />
                            <span>1:1 Check-In</span>
                          </button>
                          <button
                            onClick={() => resolveHrNotification(alert.id, 'Dispatched EAP wellness materials & recovery days')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all border cursor-pointer active:scale-95 ${isDarkMode
                                ? 'bg-blue-950 text-blue-300 border-blue-800 hover:bg-blue-900'
                                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                              }`}
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send EAP</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Outreach Completed</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
};
