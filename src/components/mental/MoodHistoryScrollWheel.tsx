'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { PolarBearEmoji } from '../common/PolarBearEmoji';
import { MoodType, MoodLog } from '../../types/wellness';
import {
  Smile,
  Lock,
  ChevronUp,
  ChevronDown,
  RotateCw,
  Plus,
  History,
  Sparkles,
  CheckCircle,
  BarChart2,
  Filter,
  Flame,
  Zap
} from 'lucide-react';

interface MoodOption {
  type: MoodType;
  label: string;
  defaultEnergy: number;
  description: string;
  bgGradient: string;
  borderColor: string;
}

const moodOptionsList: MoodOption[] = [
  {
    type: 'thriving',
    label: 'Thriving',
    defaultEnergy: 5,
    description: 'Energetic, motivated, & highly focused',
    bgGradient: 'from-emerald-500/10 to-teal-500/10',
    borderColor: 'border-emerald-400'
  },
  {
    type: 'good',
    label: 'Good',
    defaultEnergy: 4,
    description: 'Balanced, steady, & feeling productive',
    bgGradient: 'from-blue-500/10 to-cyan-500/10',
    borderColor: 'border-blue-400'
  },
  {
    type: 'okay',
    label: 'Okay',
    defaultEnergy: 3,
    description: 'Managing baseline tasks & steady energy',
    bgGradient: 'from-amber-500/10 to-yellow-500/10',
    borderColor: 'border-amber-400'
  },
  {
    type: 'stressed',
    label: 'Stressed',
    defaultEnergy: 2,
    description: 'Meeting pressure & tight deadlines',
    bgGradient: 'from-orange-500/10 to-amber-500/10',
    borderColor: 'border-orange-400'
  },
  {
    type: 'exhausted',
    label: 'Exhausted',
    defaultEnergy: 1,
    description: 'Low battery, needing immediate recovery rest',
    bgGradient: 'from-rose-500/10 to-pink-500/10',
    borderColor: 'border-rose-400'
  }
];

export const MoodHistoryScrollWheel: React.FC = () => {
  const { moodLogs, addMoodLog } = useWellness();
  const [viewMode, setViewMode] = useState<'history' | 'quick_log'>('history');
  const [activeFilter, setActiveFilter] = useState<'all' | MoodType>('all');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  // Logging state
  const [selectedLogMoodIndex, setSelectedLogMoodIndex] = useState<number>(1); // default 'good'
  const [customEnergy, setCustomEnergy] = useState<number>(4);
  const [customNote, setCustomNote] = useState<string>('');

  // Synchronize range slider changes with 3D scroll wheel mood selection
  const handleEnergySliderChange = (newEnergy: number) => {
    setCustomEnergy(newEnergy);
    const matchedIndex = moodOptionsList.findIndex(opt => opt.defaultEnergy === newEnergy);
    if (matchedIndex !== -1) {
      setSelectedLogMoodIndex(matchedIndex);
    }
  };

  // Dragging / gesture state
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const startYRef = useRef<number>(0);
  const lastWheelTimeRef = useRef<number>(0);

  // Filter logs
  const filteredLogs = moodLogs.filter(log =>
    activeFilter === 'all' ? true : log.mood === activeFilter
  );

  // Keep active index bounded when filter changes
  useEffect(() => {
    setActiveIndex(0);
  }, [activeFilter, viewMode, moodLogs.length]);

  // Handle Wheel Scroll
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const now = Date.now();
    // Throttle wheel to avoid rapid jumping
    if (now - lastWheelTimeRef.current < 80) return;
    lastWheelTimeRef.current = now;

    const maxItems = viewMode === 'history' ? filteredLogs.length : moodOptionsList.length;
    if (maxItems === 0) return;

    if (e.deltaY > 0) {
      // Scroll down -> next index
      if (viewMode === 'history') {
        setActiveIndex(prev => Math.min(maxItems - 1, prev + 1));
      } else {
        setSelectedLogMoodIndex(prev => {
          const next = Math.min(moodOptionsList.length - 1, prev + 1);
          setCustomEnergy(moodOptionsList[next].defaultEnergy);
          return next;
        });
      }
    } else if (e.deltaY < 0) {
      // Scroll up -> previous index
      if (viewMode === 'history') {
        setActiveIndex(prev => Math.max(0, prev - 1));
      } else {
        setSelectedLogMoodIndex(prev => {
          const next = Math.max(0, prev - 1);
          setCustomEnergy(moodOptionsList[next].defaultEnergy);
          return next;
        });
      }
    }
  }, [viewMode, filteredLogs.length]);

  // Touch / Mouse Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const diff = e.clientY - startYRef.current;
    if (Math.abs(diff) > 35) {
      const maxItems = viewMode === 'history' ? filteredLogs.length : moodOptionsList.length;
      if (maxItems === 0) return;

      if (diff < 0) {
        // dragged up -> next item
        if (viewMode === 'history') {
          setActiveIndex(prev => Math.min(maxItems - 1, prev + 1));
        } else {
          setSelectedLogMoodIndex(prev => {
            const next = Math.min(moodOptionsList.length - 1, prev + 1);
            setCustomEnergy(moodOptionsList[next].defaultEnergy);
            return next;
          });
        }
      } else {
        // dragged down -> previous item
        if (viewMode === 'history') {
          setActiveIndex(prev => Math.max(0, prev - 1));
        } else {
          setSelectedLogMoodIndex(prev => {
            const next = Math.max(0, prev - 1);
            setCustomEnergy(moodOptionsList[next].defaultEnergy);
            return next;
          });
        }
      }
      startYRef.current = e.clientY;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Spin Wheel function for interactive fun
  const handleSpinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    const maxItems = viewMode === 'history' ? filteredLogs.length : moodOptionsList.length;
    if (maxItems === 0) {
      setIsSpinning(false);
      return;
    }

    let spins = 0;
    const totalSpins = 12 + Math.floor(Math.random() * 8);
    const interval = setInterval(() => {
      spins++;
      const targetIndex = Math.floor(Math.random() * maxItems);
      if (viewMode === 'history') {
        setActiveIndex(targetIndex);
      } else {
        setSelectedLogMoodIndex(targetIndex);
        setCustomEnergy(moodOptionsList[targetIndex].defaultEnergy);
      }

      if (spins >= totalSpins) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 90);
  };

  // Submit check-in log
  const handleConfirmLog = () => {
    const selectedOption = moodOptionsList[selectedLogMoodIndex];
    addMoodLog(selectedOption.type, customEnergy, customNote.trim() || undefined);
    setCustomNote('');
    setViewMode('history');
    setActiveIndex(0);
  };

  // Calculate summary metrics
  const avgEnergy = moodLogs.length
    ? (moodLogs.reduce((acc, l) => acc + l.energyLevel, 0) / moodLogs.length).toFixed(1)
    : '0.0';

  const mostFrequentMood = moodLogs.length
    ? Object.entries(
        moodLogs.reduce((acc: Record<string, number>, log) => {
          acc[log.mood] = (acc[log.mood] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0][0]
    : 'None';

  return (
    <div className="enterprise-card p-5 border border-slate-200 flex flex-col justify-between h-[560px] select-none relative overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white shadow-xs">

      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shadow-2xs">
              <Smile className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                Mood History Wheel
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              </h3>
              <p className="text-[11px] text-slate-500">
                {viewMode === 'history' ? 'Wheel drum history picker' : 'Spin to log today’s mood'}
              </p>
            </div>
          </div>

          <span className="text-[10px] text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 font-semibold flex items-center gap-1 shrink-0">
            <Lock className="w-3 h-3 text-blue-600" /> Anonymous
          </span>
        </div>

        {/* View Mode Toggle Switch */}
        <div className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 mb-3">
          <button
            onClick={() => setViewMode('history')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'history'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History Wheel</span>
          </button>
          <button
            onClick={() => setViewMode('quick_log')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'quick_log'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Check-In</span>
          </button>
        </div>

        {/* Filters (History Mode only) */}
        {viewMode === 'history' && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-2 pt-0.5 border-b border-slate-100">
            <button
              onClick={() => setActiveFilter('all')}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              All ({moodLogs.length})
            </button>
            {(['thriving', 'good', 'okay', 'stressed', 'exhausted'] as MoodType[]).map(m => {
              const count = moodLogs.filter(l => l.mood === m).length;
              if (count === 0 && activeFilter !== m) return null;
              return (
                <button
                  key={m}
                  onClick={() => setActiveFilter(m)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize transition-all shrink-0 ${
                    activeFilter === m
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {m} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3D Wheel Container */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative flex-1 my-2 perspective-container flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden"
      >
        {/* Gradient backdrop guide lines for wheel drum effect */}
        <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white via-white/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white via-white/80 to-transparent z-20 pointer-events-none" />

        {/* Center active focus indicator box */}
        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-[100px] border-2 border-blue-500/30 bg-blue-50/40 rounded-2xl shadow-inner pointer-events-none z-0 transition-all backdrop-blur-[1px]">
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-6 bg-blue-600 rounded-r-md shadow-xs" />
          <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-6 bg-blue-600 rounded-l-md shadow-xs" />
        </div>

        {/* HISTORY MODE WHEEL ITEMS */}
        {viewMode === 'history' && (
          <div className="w-full h-full relative flex items-center justify-center preserve-3d">
            {filteredLogs.length === 0 ? (
              <div className="text-center p-6 z-30">
                <Smile className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">No mood history entries matching filter.</p>
                <button
                  onClick={() => setViewMode('quick_log')}
                  className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold"
                >
                  Log First Mood Entry
                </button>
              </div>
            ) : (
              filteredLogs.map((log, index) => {
                const offset = index - activeIndex;
                const distance = Math.abs(offset);

                // Render wheel perspective within range [-2, +2]
                if (distance > 2) return null;

                const rotateX = offset * -28;
                const translateY = offset * 70;
                const scale = distance === 0 ? 1 : distance === 1 ? 0.86 : 0.72;
                const opacity = distance === 0 ? 1 : distance === 1 ? 0.55 : 0.25;
                const zIndex = 10 - distance;

                return (
                  <div
                    key={log.id}
                    onClick={() => setActiveIndex(index)}
                    style={{
                      transform: `translateY(${translateY}px) rotateX(${rotateX}deg) scale(${scale})`,
                      opacity,
                      zIndex,
                      transition: isSpinning
                        ? 'transform 0.08s ease-out, opacity 0.08s ease-out'
                        : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out'
                    }}
                    className={`absolute inset-x-3 p-3.5 rounded-2xl transition-all duration-200 cursor-pointer ${
                      distance === 0
                        ? 'bg-white border-2 border-blue-500 shadow-lg ring-4 ring-blue-500/10'
                        : 'bg-slate-100/90 border border-slate-300/80 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 pt-0.5 transform transition-transform duration-300">
                        <PolarBearEmoji mood={log.mood} size={distance === 0 ? 38 : 30} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-extrabold text-slate-900 capitalize flex items-center gap-1.5">
                            {log.mood}
                            {distance === 0 && (
                              <span className="text-[9px] px-2 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold uppercase tracking-wider">
                                Active Focus
                              </span>
                            )}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">{log.timestamp}</span>
                        </div>

                        {log.note && (
                          <p className="text-xs text-slate-600 mt-1 line-clamp-1 italic font-medium">
                            "{log.note}"
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Energy:</span>
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${
                                  i < log.energyLevel
                                    ? distance === 0
                                      ? 'bg-blue-600 shadow-2xs scale-110'
                                      : 'bg-blue-400'
                                    : 'bg-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* QUICK LOG MODE WHEEL ITEMS */}
        {viewMode === 'quick_log' && (
          <div className="w-full h-full relative flex items-center justify-center preserve-3d">
            {moodOptionsList.map((opt, index) => {
              const offset = index - selectedLogMoodIndex;
              const distance = Math.abs(offset);

              if (distance > 2) return null;

              const rotateX = offset * -28;
              const translateY = offset * 70;
              const scale = distance === 0 ? 1 : distance === 1 ? 0.86 : 0.72;
              const opacity = distance === 0 ? 1 : distance === 1 ? 0.55 : 0.25;
              const zIndex = 10 - distance;

              return (
                <div
                  key={opt.type}
                  onClick={() => {
                    setSelectedLogMoodIndex(index);
                    setCustomEnergy(opt.defaultEnergy);
                  }}
                  style={{
                    transform: `translateY(${translateY}px) rotateX(${rotateX}deg) scale(${scale})`,
                    opacity,
                    zIndex,
                    transition: isSpinning
                      ? 'transform 0.08s ease-out, opacity 0.08s ease-out'
                      : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out'
                  }}
                  className={`absolute inset-x-3 p-3.5 rounded-2xl transition-all duration-200 cursor-pointer ${
                    distance === 0
                      ? `bg-white border-2 ${opt.borderColor} shadow-lg ring-4 ring-blue-500/10`
                      : 'bg-slate-100/90 border border-slate-300/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">
                      <PolarBearEmoji mood={opt.type} size={distance === 0 ? 40 : 32} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 capitalize">{opt.label}</h4>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          Energy Level {opt.defaultEnergy}/5
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{opt.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Wheel Control Nav Bar & Form Input */}
      <div>
        {/* Navigation & Spin Wheel Controls */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 mb-2.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (viewMode === 'history') {
                  setActiveIndex(prev => Math.max(0, prev - 1));
                } else {
                  setSelectedLogMoodIndex(prev => {
                    const next = Math.max(0, prev - 1);
                    setCustomEnergy(moodOptionsList[next].defaultEnergy);
                    return next;
                  });
                }
              }}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-700 transition-all active:scale-95"
              title="Scroll Up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const max = viewMode === 'history' ? filteredLogs.length - 1 : moodOptionsList.length - 1;
                if (viewMode === 'history') {
                  setActiveIndex(prev => Math.min(max, prev + 1));
                } else {
                  setSelectedLogMoodIndex(prev => {
                    const next = Math.min(max, prev + 1);
                    setCustomEnergy(moodOptionsList[next].defaultEnergy);
                    return next;
                  });
                }
              }}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-700 transition-all active:scale-95"
              title="Scroll Down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          <span className="text-[11px] text-slate-600 font-bold tracking-tight">
            {viewMode === 'history' ? (
              filteredLogs.length > 0 ? (
                `Entry ${activeIndex + 1} of ${filteredLogs.length}`
              ) : (
                '0 Entries'
              )
            ) : (
              `Option ${selectedLogMoodIndex + 1} of ${moodOptionsList.length}`
            )}
          </span>

          <button
            onClick={handleSpinWheel}
            disabled={isSpinning}
            className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all ${
              isSpinning ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>Spin Dial</span>
          </button>
        </div>

        {/* Quick Log Form Extensions (when in Quick Log mode) */}
        {viewMode === 'quick_log' && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {/* Energy Slider */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-semibold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> Energy Level:
              </span>
              <span className="font-bold text-blue-700">{customEnergy} / 5</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={customEnergy}
              onChange={e => handleEnergySliderChange(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 transition-all"
            />

            {/* Optional Note */}
            <input
              type="text"
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              placeholder="Add optional note (e.g., 'Finished sprint demo!')..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />

            <button
              onClick={handleConfirmLog}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Log Mood Entry Anonymously</span>
            </button>
          </div>
        )}

        {/* History Analytics Summary Bar (History Mode) */}
        {viewMode === 'history' && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Avg Energy: <strong className="text-slate-800">{avgEnergy}/5</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Top: <strong className="text-slate-800 capitalize">{mostFrequentMood}</strong></span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
