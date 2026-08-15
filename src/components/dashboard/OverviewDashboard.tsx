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
  Mail
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
            className={`p-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 flex items-center justify-center relative group ${
              isDarkMode
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
              pomodoro.isRunning
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
        </div>
      </div>

      {/* Main Grid: Burnout Gauge + Mood Check-In */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Burnout Risk Ring Gauge */}
        <div className="enterprise-card p-6 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Burnout Risk Gauge
              </h3>
              <span className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline" onClick={() => setActiveTab('analytics')}>
                Details →
              </span>
            </div>

            {/* Circular Gauge Visual */}
            <div className="flex flex-col items-center my-3">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
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
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {burnoutMetrics.overallScore}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${getBurnoutRiskConfig(burnoutMetrics.riskLevel).textColor} mt-0.5`}>
                    {getBurnoutRiskConfig(burnoutMetrics.riskLevel).label}
                  </span>
                </div>
              </div>

              {/* 4-Tier Risk Scale Indicator */}
              <div className="grid grid-cols-4 gap-1 text-[9px] font-bold text-center mt-3 w-full">
                <div className={`py-1 rounded-md transition-all ${burnoutMetrics.riskLevel === 'low' ? 'bg-emerald-600 text-white font-extrabold shadow-xs' : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'}`}>
                  Low<br />0-25
                </div>
                <div className={`py-1 rounded-md transition-all ${burnoutMetrics.riskLevel === 'normal' ? 'bg-blue-600 text-white font-extrabold shadow-xs' : 'bg-blue-50 text-blue-800 border border-blue-200/60'}`}>
                  Normal<br />26-50
                </div>
                <div className={`py-1 rounded-md transition-all ${burnoutMetrics.riskLevel === 'moderate' ? 'bg-amber-500 text-white font-extrabold shadow-xs' : 'bg-amber-50 text-amber-900 border border-amber-200/60'}`}>
                  Moderate<br />51-75
                </div>
                <div className={`py-1 rounded-md transition-all ${burnoutMetrics.riskLevel === 'high' ? 'bg-rose-600 text-white font-extrabold shadow-xs' : 'bg-rose-50 text-rose-800 border border-rose-200/60'}`}>
                  High<br />76-100
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Weekly Meeting Hours:</span>
              <span className="font-bold text-rose-600">{burnoutMetrics.meetingHoursWeekly} hrs (High)</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Overtime Logged:</span>
              <span className="font-bold text-amber-600">{burnoutMetrics.overtimeHoursWeekly} hrs</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Consecutive Days:</span>
              <span className="font-bold text-slate-800">{burnoutMetrics.consecutiveWorkDays} days</span>
            </div>
          </div>
        </div>

        {/* Daily Mood Check-In Widget */}
        <div className="enterprise-card p-6 sm:p-7 border border-slate-200 flex flex-col justify-between lg:col-span-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Smile className="w-5 h-5 text-blue-600" />
              Daily Mood Check-In
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {moodLogs.length > 0 ? `${moodLogs.length} logged today` : 'Quick Check'}
            </span>
          </div>

          {/* Centered Mood Selection Area */}
          <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-5">
            {/* Caption */}
            <p className="text-xs sm:text-sm font-medium text-slate-500 mb-6">
              How are you feeling right now? Select an emoji below to check in.
            </p>

            {/* Cooldown Timer */}
            {isCoolingDown && (
              <div className="flex items-center gap-3 mb-5 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <div className="relative w-8 h-8 shrink-0">
                  <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#fde68a" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15" fill="none" stroke="#f59e0b" strokeWidth="3"
                      strokeDasharray={`${(cooldownSeconds / CHECKIN_COOLDOWN) * 94.25} 94.25`}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-amber-700">
                    {cooldownSeconds}
                  </span>
                </div>
                <p className="text-xs text-amber-800 font-semibold">
                  Next check-in available in <span className="font-bold">{cooldownSeconds}s</span>
                </p>
              </div>
            )}

            {/* Emoji Selector - Centered & Comfortably Spaced with Pop & Movement Animation */}
            <div className={`grid grid-cols-5 gap-3 sm:gap-4 w-full max-w-2xl ${isCoolingDown ? 'opacity-50 pointer-events-none' : ''}`}>
              {moodOptions.map(option => (
                <button
                  key={option.type}
                  onClick={() => handleMoodCheckIn(option.type, option.type === 'thriving' ? 5 : option.type === 'good' ? 4 : option.type === 'okay' ? 3 : option.type === 'stressed' ? 2 : 1)}
                  disabled={isCoolingDown}
                  className={`flex flex-col items-center justify-center py-5 px-3 rounded-2xl border transition-all duration-300 transform-gpu hover:-translate-y-2.5 hover:scale-105 active:scale-95 shadow-xs hover:shadow-lg cursor-pointer ${
                    isDarkMode
                      ? 'bg-[#1a1c22] border-[#2e323d] hover:border-blue-500/80 hover:bg-[#222632] hover:shadow-blue-500/10'
                      : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-white hover:shadow-blue-500/15'
                  } ${isCoolingDown ? 'cursor-not-allowed' : option.color} group`}
                >
                  <span className="mb-2.5 flex items-center justify-center pointer-events-none">
                    <PolarBearEmoji mood={option.type} size={52} />
                  </span>
                  <span className={`text-xs font-bold transition-colors group-hover:text-blue-500 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid Cards (Matching WeMERGE HR summary stats layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Physical Health */}
        <div
          onClick={() => setActiveTab('physical')}
          className="enterprise-card enterprise-card-hover p-5 border border-slate-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 border border-rose-100">
              <Heart className="w-5 h-5 fill-rose-600" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Physical Health</h4>
            <p className="text-xs text-slate-500 mt-1">Hydration & guided 2-minute posture stretch breaks.</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-bold">
            <span>4 Active Reminders</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Boundary Guard */}
        <div
          onClick={() => setActiveTab('boundary')}
          className="enterprise-card enterprise-card-hover p-5 border border-slate-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 border border-blue-100">
              <Moon className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Boundary Guard</h4>
            <p className="text-xs text-slate-500 mt-1">Holds after-hours notifications until morning.</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-bold">
            <span>{boundaryConfig.activeShield ? 'Shield Active' : 'Shield Paused'}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Peer Recognition */}
        <div
          onClick={() => setActiveTab('social')}
          className="enterprise-card enterprise-card-hover p-5 border border-slate-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 border border-amber-100">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Peer Appreciation</h4>
            <p className="text-xs text-slate-500 mt-1">Send appreciation badges & virtual coffee to teammates.</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-700 font-bold">
            <span>{badges.length} Badges Shared</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Cognitive Inclusivity */}
        <div
          onClick={() => setActiveTab('inclusive')}
          className="enterprise-card enterprise-card-hover p-5 border border-slate-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-100">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Adaptive Focus</h4>
            <p className="text-xs text-slate-500 mt-1">Neurodivergent friendly fonts & soundscapes.</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-700 font-bold">
            <span>Customize Controls</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
