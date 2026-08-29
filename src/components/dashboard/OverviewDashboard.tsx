'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { MoodType, getBurnoutRiskConfig, getLateMinutes, formatLateDuration } from '../../types/wellness';
import { PolarBearEmoji } from '../common/PolarBearEmoji';
import { Tooltip } from '../common/Tooltip';
import { NotificationsBell } from './NotificationsBell';
import { AttendanceCalendar } from './AttendanceCalendar';
import {
  ShieldAlert,
  Smile,
  Sparkles,
  Heart,
  Clock,
  Zap,
  Moon,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ShieldCheck
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
    userProfile,
    pomodoro,
    togglePomodoro,
    workShift,
    toggleClockInOut,
    resetWorkShift,
    isDarkMode
  } = useWellness();

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

  // Daily reset: only count/display mood check-ins logged today (calendar-day boundary,
  // same convention as the workday shift & hydration resets). History is preserved in
  // moodLogs / localStorage — this is a display-time filter, not a data wipe.
  const isSameLocalDay = (iso?: string) => {
    if (!iso) return false;
    const d = new Date(iso);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  };
  const todaysMoodLogs = moodLogs.filter(log => isSameLocalDay(log.createdAt));

  const trendConfig = {
    improving: { icon: TrendingDown, label: 'Improving', classes: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60' },
    worsening: { icon: TrendingUp, label: 'Worsening', classes: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60' },
    stable: { icon: Minus, label: 'Stable', classes: 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700' }
  }[burnoutMetrics.trend];

  const moodOptions: { type: MoodType; emoji: string; label: string; color: string }[] = [
    { type: 'thriving', emoji: '🤩', label: 'Thriving', color: 'hover:border-emerald-500 hover:bg-emerald-50 text-slate-800' },
    { type: 'good', emoji: '😊', label: 'Good', color: 'hover:border-blue-500 hover:bg-blue-50 text-slate-800' },
    { type: 'okay', emoji: '🙂', label: 'Okay', color: 'hover:border-amber-500 hover:bg-amber-50 text-slate-800' },
    { type: 'stressed', emoji: '😰', label: 'Stressed', color: 'hover:border-orange-500 hover:bg-orange-50 text-slate-800' },
    { type: 'exhausted', emoji: '😫', label: 'Exhausted', color: 'hover:border-rose-500 hover:bg-rose-50 text-slate-800' },
  ];

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

          <NotificationsBell />
        </div>
      </div>

      {/* Main Grid: Burnout Gauge + Workday Shift Gauge (Clock In/Out) + Mood Check-In */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Workday Shift Gauge (Clock-In / Clock-Out) - Matching Gauge Design */}
        {(() => {
          const standardShiftSeconds = 8 * 3600; // 8 hours target
          const shiftProgress = Math.min(100, Math.round((workShift.totalWorkedSeconds / standardShiftSeconds) * 100));

          // Late = clocked in after 9:00 AM. workShift resets to a fresh, un-clocked-in
          // state each new calendar day, so this is naturally re-evaluated daily.
          const lateMinutes = getLateMinutes(workShift.clockInTime);
          const isLate = lateMinutes > 0;

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
                    <Tooltip
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
                  <div className="flex items-center gap-1.5">
                    {isLate && (
                      <span
                        title={`Clocked in ${formatLateDuration(lateMinutes)} after the 9:00 AM standard start`}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                      >
                        ⏰ Late {formatLateDuration(lateMinutes)}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      workShift.isClockedIn
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                    }`}>
                      {workShift.isClockedIn ? '● Active' : '○ Off Duty'}
                    </span>
                  </div>
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
                <Tooltip
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

            {/* Trend + Risk Factors (live-computed, same source as AI Burnout Predictor page) */}
            <div className="space-y-2">
              <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border ${trendConfig.classes}`}>
                <trendConfig.icon className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">{trendConfig.label}</span>
              </div>

              {burnoutMetrics.riskFactors.length === 0 ? (
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${isDarkMode ? 'bg-emerald-950/20 border-emerald-800/40' : 'bg-emerald-50/70 border-emerald-200'}`}>
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">No risk factors detected — keep it up!</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {burnoutMetrics.riskFactors.slice(0, 2).map((factor, i) => (
                    <div key={i} className={`flex items-start gap-2 px-3 py-2 rounded-xl border ${isDarkMode ? 'bg-amber-950/20 border-amber-800/40' : 'bg-amber-50/70 border-amber-200'}`}>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 leading-snug">{factor}</span>
                    </div>
                  ))}
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`w-full text-center text-[10px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer ${isDarkMode ? 'text-blue-400 hover:bg-blue-950/30' : 'text-blue-600 hover:bg-blue-50'}`}
                  >
                    {burnoutMetrics.riskFactors.length > 2 ? `+${burnoutMetrics.riskFactors.length - 2} more — ` : ''}View Full Analysis
                  </button>
                </div>
              )}
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
                <Tooltip
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
                {todaysMoodLogs.length > 0 ? `${todaysMoodLogs.length} logged today` : 'Quick Check'}
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
                  <span className={`text-[10px] leading-tight font-bold text-center transition-colors group-hover:text-blue-500 break-words ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Today's Check-Ins Log (auto-resets to empty each new calendar day) */}
            <div className={`pt-3 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Today&apos;s Check-Ins
                </span>
                <span className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Resets daily
                </span>
              </div>

              {todaysMoodLogs.length === 0 ? (
                <div className={`px-3 py-3 rounded-xl border border-dashed text-center ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                  <span className="text-[11px] font-semibold">No check-ins yet today — how are you feeling?</span>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {todaysMoodLogs.map(log => {
                    const opt = moodOptions.find(o => o.type === log.mood);
                    return (
                      <div
                        key={log.id}
                        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg ${isDarkMode ? 'bg-[#1a1c22]' : 'bg-slate-50'}`}
                      >
                        <PolarBearEmoji mood={log.mood} size={18} />
                        <span className={`text-[11px] font-bold flex-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                          {opt?.label || log.mood}
                        </span>
                        <span className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {log.timestamp.replace('Today, ', '')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AttendanceCalendar variant="inline" />
    </div>
  );
};
