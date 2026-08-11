'use client';

import React from 'react';
import { useWellness } from '../../context/WellnessContext';
import { getBurnoutRiskConfig } from '../../types/wellness';
import { 
  Activity, 
  Clock, 
  Calendar, 
  Mail, 
  AlertTriangle, 
  TrendingUp, 
  Sparkles,
  ShieldAlert,
  Info
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const weeklyTelemetryData = [
  { day: 'Mon', meetingHours: 4.5, overtimeHours: 1.2, lateMessages: 1 },
  { day: 'Tue', meetingHours: 6.0, overtimeHours: 2.5, lateMessages: 4 },
  { day: 'Wed', meetingHours: 5.5, overtimeHours: 1.8, lateMessages: 2 },
  { day: 'Thu', meetingHours: 7.0, overtimeHours: 3.0, lateMessages: 5 },
  { day: 'Fri', meetingHours: 4.0, overtimeHours: 0.7, lateMessages: 2 },
  { day: 'Sat', meetingHours: 0.0, overtimeHours: 1.5, lateMessages: 3 },
  { day: 'Sun', meetingHours: 0.0, overtimeHours: 0.0, lateMessages: 0 },
];

export const PredictiveAnalyticsView: React.FC = () => {
  const { burnoutMetrics } = useWellness();
  const riskConfig = getBurnoutRiskConfig(burnoutMetrics.riskLevel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> AI Predictive Analytics Engine
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            AI Burnout Risk Predictor
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Analyzes non-invasive workplace telemetry to protect employees before burnout strikes.
          </p>
        </div>
        
        <div className={`px-4 py-2.5 rounded-xl border flex items-center gap-3 ${riskConfig.badgeBg}`}>
          <ShieldAlert className="w-6 h-6 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-900">
              Current Risk Score: {burnoutMetrics.overallScore}/100 ({riskConfig.label})
            </p>
            <p className="text-[11px] font-semibold opacity-90">{riskConfig.recommendation}</p>
          </div>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Meeting Hours */}
        <div className="enterprise-card p-4 border border-slate-200">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" /> Weekly Meetings
            </span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              +63% vs team
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{burnoutMetrics.meetingHoursWeekly}h</span>
            <span className="text-xs text-slate-500">/ {burnoutMetrics.meetingHoursBenchmark}h target</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: '82%' }} />
          </div>
        </div>

        {/* Overtime Hours */}
        <div className="enterprise-card p-4 border border-slate-200">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-amber-600" /> Overtime Logged
            </span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Elevated
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{burnoutMetrics.overtimeHoursWeekly}h</span>
            <span className="text-xs text-slate-500">this week</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '65%' }} />
          </div>
        </div>

        {/* PTO Usage */}
        <div className="enterprise-card p-4 border border-slate-200">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cyan-600" /> PTO Days Remaining
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              18 Left
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{burnoutMetrics.ptoDaysUsed} Days</span>
            <span className="text-xs text-slate-500">used of 21</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '15%' }} />
          </div>
        </div>

        {/* Late Communications */}
        <div className="enterprise-card p-4 border border-slate-200">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-rose-600" /> Late Messages
            </span>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Past 7:00 PM
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{burnoutMetrics.afterHoursActivityCount} Messages</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: '70%' }} />
          </div>
        </div>
      </div>

      {/* Main Telemetry Chart */}
      <div className="enterprise-card p-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Weekly Workload Telemetry Trend
            </h3>
            <p className="text-xs text-slate-500">Comparison of Meeting Density vs. Late-Night Activity</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-blue-700">
              <span className="w-3 h-3 rounded-full bg-blue-600" /> Meeting Hours
            </span>
            <span className="flex items-center gap-1.5 text-rose-700">
              <span className="w-3 h-3 rounded-full bg-rose-500" /> Late Messages
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyTelemetryData}>
              <defs>
                <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a' }}
              />
              <Area type="monotone" dataKey="meetingHours" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorMeetings)" name="Meeting Hours" />
              <Area type="monotone" dataKey="lateMessages" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorLate)" name="Late Messages" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Risk Factor Analysis */}
      <div className="enterprise-card p-6 border border-slate-200">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Detected Risk Factors & Proactive AI Recommendations
        </h3>
        <div className="space-y-3">
          {burnoutMetrics.riskFactors.map((factor, index) => (
            <div key={index} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-900">{factor}</p>
                <p className="text-xs text-slate-600 mt-1">
                  Suggested Action: Schedule 2 hours of Focus Mode tomorrow or take a rest day before month end.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
