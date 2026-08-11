'use client';

import React from 'react';
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
    addMoodLog,
    setActiveExercise,
    setActiveTab,
    boundaryConfig,
    toggleFocusMode,
    accessibility,
    badges
  } = useWellness();

  const moodOptions: { type: MoodType; emoji: string; label: string; color: string }[] = [
    { type: 'thriving', emoji: '🐻‍❄️', label: 'Thriving', color: 'hover:border-emerald-500 hover:bg-emerald-50 text-slate-800' },
    { type: 'good', emoji: '🐻‍❄️', label: 'Good', color: 'hover:border-blue-500 hover:bg-blue-50 text-slate-800' },
    { type: 'okay', emoji: '🐻‍❄️', label: 'Okay', color: 'hover:border-amber-500 hover:bg-amber-50 text-slate-800' },
    { type: 'stressed', emoji: '🐻‍❄️', label: 'Stressed', color: 'hover:border-orange-500 hover:bg-orange-50 text-slate-800' },
    { type: 'exhausted', emoji: '🐻‍❄️', label: 'Exhausted', color: 'hover:border-rose-500 hover:bg-rose-50 text-slate-800' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Card */}
      <div className="enterprise-card p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AxionHR AI Shield Active
            </span>
            <span className="text-xs text-slate-500">Continuous Privacy-First Telemetry</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Hi, <span className="text-blue-600">Alex Mercer</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Here is your workplace well-being & burnout protection overview for today. All personal telemetry remains 100% anonymous.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveExercise('stretch')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm"
          >
            <Heart className="w-4 h-4 fill-white" />
            <span>Take 2-Min Break</span>
          </button>
          <button
            onClick={toggleFocusMode}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${accessibility.focusModeActive
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
          >
            <Zap className="w-4 h-4" />
            <span>{accessibility.focusModeActive ? 'Focus Active' : 'Start Focus Session'}</span>
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
                  Low<br/>0-25
                </div>
                <div className={`py-1 rounded-md transition-all ${burnoutMetrics.riskLevel === 'normal' ? 'bg-blue-600 text-white font-extrabold shadow-xs' : 'bg-blue-50 text-blue-800 border border-blue-200/60'}`}>
                  Normal<br/>26-50
                </div>
                <div className={`py-1 rounded-md transition-all ${burnoutMetrics.riskLevel === 'moderate' ? 'bg-amber-500 text-white font-extrabold shadow-xs' : 'bg-amber-50 text-amber-900 border border-amber-200/60'}`}>
                  Moderate<br/>51-75
                </div>
                <div className={`py-1 rounded-md transition-all ${burnoutMetrics.riskLevel === 'high' ? 'bg-rose-600 text-white font-extrabold shadow-xs' : 'bg-rose-50 text-rose-800 border border-rose-200/60'}`}>
                  High<br/>76-100
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
        <div className="enterprise-card p-6 border border-slate-200 flex flex-col justify-between lg:col-span-2">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Smile className="w-5 h-5 text-blue-600" />
                  Daily Mood Check-In
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Replaces traditional surveys with a single tap. 100% anonymous to HR.
                </p>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                🔒 Privacy Protected
              </span>
            </div>

            {/* Emoji Selector */}
            <div className="grid grid-cols-5 gap-3 my-5">
              {moodOptions.map(option => (
                <button
                  key={option.type}
                  onClick={() => addMoodLog(option.type, option.type === 'thriving' ? 5 : option.type === 'good' ? 4 : option.type === 'okay' ? 3 : option.type === 'stressed' ? 2 : 1)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-200 transition-all ${option.color} group`}
                >
                  <span className="mb-2 transform group-hover:scale-115 transition-transform flex items-center justify-center">
                    <PolarBearEmoji mood={option.type} size={44} />
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Coach Tip Banner */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                AI Coach Insight
                <span className="text-[10px] text-blue-700 font-semibold">Personalized</span>
              </h4>
              <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                "Alex, you have 3 back-to-back meetings starting at 2:00 PM. Enable Boundary Guard to hold non-essential notifications."
              </p>
            </div>
            <button
              onClick={() => setActiveTab('mental')}
              className="text-xs text-blue-700 hover:text-blue-900 font-bold shrink-0"
            >
              Open Coach →
            </button>
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
