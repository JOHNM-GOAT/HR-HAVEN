'use client';

import React from 'react';
import { useWellness } from '../../context/WellnessContext';
import { getBurnoutRiskConfig, getLateMinutes, formatLateDuration, isSameLocalDay, getRiskFactors } from '../../types/wellness';
import {
  Activity,
  Clock,
  Calendar,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  Info,
  ShieldCheck
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const PredictiveAnalyticsView: React.FC = () => {
  const {
    burnoutMetrics,
    teamShifts,
    workShift,
    userProfile,
    isDarkMode,
    blockers,
    moodLogs,
    setActiveTab
  } = useWellness();

  // Dynamically compute the 7 days of the current week (Monday -> Sunday)
  const now = new Date();
  const currentDayOfWeek = (now.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const monday = new Date(now);
  monday.setDate(now.getDate() - currentDayOfWeek);
  monday.setHours(0, 0, 0, 0);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const weeklyChartData = daysOfWeek.map((dayName, index) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + index);
    const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
    const isToday = index === currentDayOfWeek;

    const matchedShift = teamShifts.find(
      s => (s.userId === userProfile.id || s.userName === userProfile.name) && s.date === dateStr
    );

    let otSecs = matchedShift ? matchedShift.overtimeSeconds : 0;
    // Prefer today's live clock-in time over the (possibly stale) teamShifts copy —
    // matches the convention already used by the attendance calendar.
    let clockInForDay = matchedShift ? matchedShift.clockInTime : null;
    const hasShift = !!matchedShift || (isToday && (workShift.isClockedIn || workShift.totalWorkedSeconds > 0));
    if (isToday && (workShift.isClockedIn || workShift.totalWorkedSeconds > 0)) {
      otSecs = Math.max(otSecs, workShift.overtimeSeconds);
      clockInForDay = workShift.clockInTime || clockInForDay;
    }

    // Blockers logged that calendar day — same createdAt-based day match used
    // for today's mood logs, just applied across the whole week here.
    const blockersLoggedCount = blockers.filter(b => {
      const created = new Date(b.createdAt);
      return created.getFullYear() === dayDate.getFullYear() && created.getMonth() === dayDate.getMonth() && created.getDate() === dayDate.getDate();
    }).length;

    return {
      day: dayName,
      date: dateStr,
      overtimeHours: parseFloat((otSecs / 3600).toFixed(1)),
      lateMinutes: getLateMinutes(clockInForDay),
      blockersLogged: blockersLoggedCount,
      hasShift
    };
  });

  const totalWeeklyOvertimeHours = weeklyChartData.reduce((acc, d) => acc + d.overtimeHours, 0);
  const overtimeBenchmark = 5; // 5h weekly threshold
  const overtimeProgress = Math.min(100, Math.round((totalWeeklyOvertimeHours / overtimeBenchmark) * 100));

  // Late Attendance: real per-day clock-in data against the same 9:00 AM standard
  // start used by the dashboard's Late badge and the attendance calendar — one
  // definition of "late" everywhere, just aggregated to a week here.
  const attendedDaysThisWeek = weeklyChartData.filter(d => d.hasShift).length;
  const lateDaysThisWeek = weeklyChartData.filter(d => d.lateMinutes > 0).length;
  const lateMinutesThisWeek = weeklyChartData.reduce((acc, d) => acc + d.lateMinutes, 0);
  const weeklyOnTimeRate = attendedDaysThisWeek > 0
    ? Math.round(((attendedDaysThisWeek - lateDaysThisWeek) / attendedDaysThisWeek) * 100)
    : 100;

  const activeBlockerCount = blockers.filter(b => !b.resolvedAt).length;

  // Single source of truth: same score & level driving the Dashboard's Burnout Risk Gauge.
  const computedScore = burnoutMetrics.overallScore;
  const riskConfig = getBurnoutRiskConfig(burnoutMetrics.riskLevel);
  const todaysMoodLogs = moodLogs.filter(log => isSameLocalDay(log.createdAt));
  const riskFactors = getRiskFactors(blockers, todaysMoodLogs);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            AI Burnout Risk Predictor
          </h2>
        </div>

        <div className={`px-4 py-2.5 rounded-xl border flex items-center gap-3 ${riskConfig.badgeBg}`}>
          <ShieldAlert className="w-6 h-6 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              Current Risk Score: {computedScore}/100 ({riskConfig.label})
            </p>
            <p className="text-[11px] font-semibold opacity-90">{riskConfig.recommendation}</p>
          </div>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Late Attendance — real per-day clock-in data, not a fabricated metric.
            The app has no meeting platform to source "Weekly Meetings" from. */}
        <div className={`enterprise-card p-4 border ${isDarkMode ? 'bg-[#16181f] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-rose-600 dark:text-rose-400" /> Late Attendance
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              lateDaysThisWeek === 0
                ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            }`}>
              {lateDaysThisWeek === 0 ? 'On Target' : `${lateDaysThisWeek} Late Day${lateDaysThisWeek > 1 ? 's' : ''}`}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{weeklyOnTimeRate}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {lateDaysThisWeek === 0
                ? `on-time (${attendedDaysThisWeek} day${attendedDaysThisWeek === 1 ? '' : 's'} tracked)`
                : `on-time · ${formatLateDuration(lateMinutesThisWeek)} late total`}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${lateDaysThisWeek === 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${weeklyOnTimeRate}%` }} />
          </div>
        </div>

        {/* Overtime Hours */}
        <div className={`enterprise-card p-4 border ${isDarkMode ? 'bg-[#16181f] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Overtime Logged
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              totalWeeklyOvertimeHours > 0
                ? 'text-amber-800 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}>
              {totalWeeklyOvertimeHours > 0 ? `+${totalWeeklyOvertimeHours.toFixed(1)}h OT` : '0h On-Track'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{totalWeeklyOvertimeHours.toFixed(1)}h</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">this week</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${totalWeeklyOvertimeHours > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${overtimeProgress}%` }} />
          </div>
        </div>

        {/* Active Blockers — real count from the Blockers page, each one currently
            contributing to the risk score above. Replaces the old "After-Hours
            Activity" card, which was hardcoded and never backed by real telemetry. */}
        <button
          type="button"
          onClick={() => setActiveTab('blockers')}
          className={`enterprise-card p-4 border text-left cursor-pointer transition-all hover:shadow-md ${isDarkMode ? 'bg-[#16181f] border-slate-800' : 'bg-white border-slate-200'}`}
        >
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Active Blockers
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              activeBlockerCount > 0
                ? 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                : 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}>
              {activeBlockerCount === 0 ? 'Clear' : `${activeBlockerCount} Logged`}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {activeBlockerCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {activeBlockerCount === 0 ? 'nothing blocking you' : 'raising your risk score'}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${activeBlockerCount > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${activeBlockerCount === 0 ? 100 : Math.min(100, activeBlockerCount * 25)}%` }}
            />
          </div>
        </button>
      </div>

      {/* Main Telemetry Chart */}
      <div className={`enterprise-card p-6 border ${isDarkMode ? 'bg-[#16181f] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <div>
            <h3 className={`text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Weekly Workload Telemetry Trend
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
              <span className="w-3 h-3 rounded-full bg-rose-500" /> Late Minutes
            </span>
            <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <span className="w-3 h-3 rounded-full bg-amber-500" /> Overtime Hours
            </span>
            <span className="flex items-center gap-1.5 text-violet-700 dark:text-violet-400">
              <span className="w-3 h-3 rounded-full bg-violet-500" /> Blockers Logged
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyChartData}>
              <defs>
                <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOvertime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBlockers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#2d3242' : '#e2e8f0'} />
              <XAxis dataKey="day" stroke={isDarkMode ? '#94a3b8' : '#64748b'} fontSize={12} />
              <YAxis yAxisId="late" hide />
              <YAxis yAxisId="ot" orientation="right" hide />
              <YAxis yAxisId="blockers" hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#1e2230' : '#ffffff',
                  borderColor: isDarkMode ? '#33384c' : '#cbd5e1',
                  borderRadius: '12px',
                  color: isDarkMode ? '#ffffff' : '#0f172a'
                }}
              />
              <Area yAxisId="late" type="monotone" dataKey="lateMinutes" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorLate)" name="Late Minutes" />
              <Area yAxisId="ot" type="monotone" dataKey="overtimeHours" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorOvertime)" name="Overtime Hours" />
              <Area yAxisId="blockers" type="monotone" dataKey="blockersLogged" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorBlockers)" name="Blockers Logged" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Risk Factor Analysis */}
      <div className={`enterprise-card p-6 border ${isDarkMode ? 'border-slate-800 bg-[#16181f]' : 'border-slate-200 bg-white'}`}>
        <h3 className={`text-base font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Detected Risk Factors & Proactive AI Recommendations
        </h3>
        <div className="space-y-3">
          {/* Gate on the list actually being empty, not on the score. The score is
              mood-driven and moves independently of riskFactors, so keying off it
              left this card rendering a heading with no body. */}
          {riskFactors.length === 0 ? (
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${isDarkMode ? 'bg-[#12141a] border-[#262b3a]' : 'bg-emerald-50/60 border-emerald-200'}`}>
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Optimal Work-Life Balance Active</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  No active blockers and no strained mood check-ins logged today. Keep up healthy boundaries!
                </p>
              </div>
            </div>
          ) : (
            riskFactors.map(factor => (
              <div key={factor.id} className={`p-4 rounded-xl border flex items-start gap-3 ${isDarkMode ? 'bg-[#12141a] border-[#262b3a]' : 'bg-slate-50 border-slate-200'}`}>
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
                  <Info className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{factor.label}</p>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 shrink-0">+{factor.scoreImpact} risk</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Suggested Action: {factor.action}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
