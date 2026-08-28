'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { PolarBearEmoji } from '../common/PolarBearEmoji';
import { MoodType } from '../../types/wellness';
import {
  Smile,
  Plus,
  History,
  CheckCircle,
  BarChart2,
  Flame,
  Clock
} from 'lucide-react';

interface MoodOption {
  type: MoodType;
  label: string;
  defaultEnergy: number;
  description: string;
  borderColor: string;
  activeBg: string;
}

const moodOptionsList: MoodOption[] = [
  {
    type: 'thriving',
    label: 'Thriving',
    defaultEnergy: 5,
    description: 'Energetic, motivated, & highly focused',
    borderColor: 'border-emerald-400',
    activeBg: 'bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-200'
  },
  {
    type: 'good',
    label: 'Good',
    defaultEnergy: 4,
    description: 'Balanced, steady, & feeling productive',
    borderColor: 'border-blue-400',
    activeBg: 'bg-blue-500/10 border-blue-500 text-blue-900 dark:text-blue-200'
  },
  {
    type: 'okay',
    label: 'Okay',
    defaultEnergy: 3,
    description: 'Managing baseline tasks & steady energy',
    borderColor: 'border-amber-400',
    activeBg: 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-200'
  },
  {
    type: 'stressed',
    label: 'Stressed',
    defaultEnergy: 2,
    description: 'Meeting pressure & tight deadlines',
    borderColor: 'border-orange-400',
    activeBg: 'bg-orange-500/10 border-orange-500 text-orange-900 dark:text-orange-200'
  },
  {
    type: 'exhausted',
    label: 'Exhausted',
    defaultEnergy: 1,
    description: 'Low battery, needing recovery rest',
    borderColor: 'border-rose-400',
    activeBg: 'bg-rose-500/10 border-rose-500 text-rose-900 dark:text-rose-200'
  }
];

export const MoodHistoryScrollWheel: React.FC = () => {
  const { moodLogs, addMoodLog, isDarkMode } = useWellness();
  const [viewMode, setViewMode] = useState<'history' | 'quick_log'>('history');
  const [activeFilter, setActiveFilter] = useState<'all' | MoodType>('all');

  // Logging state
  const [selectedMoodType, setSelectedMoodType] = useState<MoodType>('good');
  const [customEnergy, setCustomEnergy] = useState<number>(4);
  const [customNote, setCustomNote] = useState<string>('');

  const handleSelectMoodOption = (opt: MoodOption) => {
    setSelectedMoodType(opt.type);
    setCustomEnergy(opt.defaultEnergy);
  };

  const handleConfirmLog = () => {
    addMoodLog(selectedMoodType, customEnergy, customNote.trim() || undefined);
    setCustomNote('');
    setViewMode('history');
    setActiveFilter('all');
  };

  // Filter logs
  const filteredLogs = moodLogs.filter(log =>
    activeFilter === 'all' ? true : log.mood === activeFilter
  );

  // Compute analytics
  const totalEnergy = moodLogs.reduce((acc, curr) => acc + curr.energyLevel, 0);
  const avgEnergy = moodLogs.length > 0 ? (totalEnergy / moodLogs.length).toFixed(1) : '0';

  const moodCounts = moodLogs.reduce((acc, curr) => {
    acc[curr.mood] = (acc[curr.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostFrequentMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Good';

  const getMoodBadgeStyle = (mood: MoodType) => {
    switch (mood) {
      case 'thriving':
        return isDarkMode ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'good':
        return isDarkMode ? 'bg-blue-950/60 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200';
      case 'okay':
        return isDarkMode ? 'bg-amber-950/60 text-amber-300 border-amber-800' : 'bg-amber-50 text-amber-800 border-amber-200';
      case 'stressed':
        return isDarkMode ? 'bg-orange-950/60 text-orange-300 border-orange-800' : 'bg-orange-50 text-orange-800 border-orange-200';
      case 'exhausted':
        return isDarkMode ? 'bg-rose-950/60 text-rose-300 border-rose-800' : 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className={`enterprise-card p-5 sm:p-6 border flex flex-col h-[560px] ${
      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      {/* Header */}
      <div className="space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-2xs ${
              isDarkMode
                ? 'bg-blue-950/60 text-blue-400 border-blue-800'
                : 'bg-blue-50 text-blue-600 border-blue-200'
            }`}>
              <Smile className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm font-bold tracking-tight flex items-center gap-1.5 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Mood History & Log
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              </h3>
            </div>
          </div>

          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
            isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {moodLogs.length} Total Logs
          </span>
        </div>

        {/* View Mode Switcher (History vs Quick Log) */}
        <div className={`flex rounded-xl p-1 border ${
          isDarkMode ? 'bg-[#1a1c22] border-[#2e323d]' : 'bg-slate-100/90 border-slate-200/80'
        }`}>
          <button
            onClick={() => setViewMode('history')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              viewMode === 'history'
                ? isDarkMode
                  ? 'bg-[#202229] text-white shadow-sm border border-slate-700'
                  : 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : isDarkMode
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History Log</span>
          </button>
          <button
            onClick={() => setViewMode('quick_log')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              viewMode === 'quick_log'
                ? isDarkMode
                  ? 'bg-[#202229] text-white shadow-sm border border-slate-700'
                  : 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : isDarkMode
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Check In</span>
          </button>
        </div>

        {/* Filter Pills (History View) */}
        {viewMode === 'history' && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all border cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : isDarkMode
                  ? 'bg-[#1a1c22] text-slate-400 border-[#2e323d] hover:border-slate-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              All ({moodLogs.length})
            </button>
            {(['thriving', 'good', 'okay', 'stressed', 'exhausted'] as MoodType[]).map(type => {
              const count = moodLogs.filter(m => m.mood === type).length;
              if (count === 0) return null;
              return (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize shrink-0 transition-all border cursor-pointer ${
                    activeFilter === type
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-bold'
                      : isDarkMode
                      ? 'bg-[#1a1c22] text-slate-400 border-[#2e323d] hover:border-slate-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {type} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto my-3 pr-1 space-y-2.5 custom-scrollbar">
        {/* HISTORY VIEW: Clean Scrollable Card List */}
        {viewMode === 'history' && (
          <>
            {filteredLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-2xl border-slate-200 dark:border-slate-800">
                <Smile className="w-10 h-10 text-slate-400 mb-2" />
                <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  No mood entries found
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px]">
                  {activeFilter === 'all' ? 'Log your daily check-in to track energy and wellbeing.' : 'No entries matching this filter.'}
                </p>
                <button
                  onClick={() => setViewMode('quick_log')}
                  className="mt-3 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  + Log First Mood
                </button>
              </div>
            ) : (
              filteredLogs.map(log => (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isDarkMode
                      ? 'bg-[#14151b] border-[#242735] hover:border-slate-700'
                      : 'bg-slate-50/80 border-slate-200 hover:bg-white hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 pt-0.5">
                      <PolarBearEmoji mood={log.mood} size={32} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold capitalize ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {log.mood}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${getMoodBadgeStyle(log.mood)}`}>
                            {log.energyLevel}/5 Energy
                          </span>
                        </div>
                        <span className={`text-[10px] font-medium flex items-center gap-1 shrink-0 ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          <Clock className="w-3 h-3 opacity-60" />
                          {log.timestamp}
                        </span>
                      </div>

                      {log.note && (
                        <p className={`text-xs mt-1.5 p-2 rounded-xl border leading-relaxed italic ${
                          isDarkMode ? 'bg-slate-800/60 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'
                        }`}>
                          "{log.note}"
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 mt-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          isDarkMode ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          Energy Rating:
                        </span>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full transition-all ${
                                i < log.energyLevel
                                  ? 'bg-blue-600'
                                  : isDarkMode ? 'bg-slate-800' : 'bg-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* QUICK LOG VIEW: Clean Selectable Options & Input */}
        {viewMode === 'quick_log' && (
          <div className="space-y-3">
            <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              Select current mood state:
            </p>

            <div className="space-y-2">
              {moodOptionsList.map(opt => {
                const isSelected = selectedMoodType === opt.type;
                return (
                  <div
                    key={opt.type}
                    onClick={() => handleSelectMoodOption(opt)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20'
                          : 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20'
                        : isDarkMode
                        ? 'bg-[#14151b] border-[#242735] hover:border-slate-700'
                        : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="shrink-0">
                        <PolarBearEmoji mood={opt.type} size={30} />
                      </div>
                      <div>
                        <p className={`text-xs font-bold capitalize ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {opt.label}
                        </p>
                        <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {opt.description}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : isDarkMode
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}>
                      {opt.defaultEnergy}/5
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Optional Note Field */}
            <input
              type="text"
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              placeholder="Add optional note (e.g., 'Completed morning sprint!')..."
              className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-600 ${
                isDarkMode
                  ? 'bg-[#14151b] border-slate-700 text-white placeholder-slate-500'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />

            <button
              onClick={handleConfirmLog}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Log Mood Entry</span>
            </button>
          </div>
        )}
      </div>

      {/* History Analytics Summary Bar (History Mode) */}
      {viewMode === 'history' && (
        <div className={`pt-3 border-t flex items-center justify-between text-[11px] shrink-0 ${
          isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
        }`}>
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Avg Energy: <strong className={isDarkMode ? 'text-white' : 'text-slate-800'}>{avgEnergy}/5</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Top: <strong className={`capitalize ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{mostFrequentMood}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
