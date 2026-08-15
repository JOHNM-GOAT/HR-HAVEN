'use client';

import React, { useState, useEffect } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { AccessibilitySettings } from '../../types/wellness';
import {
  Zap,
  Sliders,
  Volume2,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { CrystalWaveTimer } from '../focus/CrystalWaveTimer';

export const CognitiveInclusivityView: React.FC = () => {
  const {
    accessibility,
    toggleFocusMode,
    toggleDyslexiaFont,
    toggleHighContrast,
    toggleBatchNotifications,
    toggleClutterReduction,
    setAmbientSound,
    setToastNotification,
    pomodoro,
    togglePomodoro,
    resetPomodoro,
    setPomodoroMode,
    isDarkMode
  } = useWellness();

  const soundOptions: { id: AccessibilitySettings['ambientSound']; label: string; icon: string }[] = [
    { id: 'none', label: 'Mute', icon: '🔇' },
    { id: 'rain', label: 'Gentle Rain', icon: '🌧️' },
    { id: 'lofi', label: 'Deep Focus Lo-Fi', icon: '🎧' },
    { id: 'waves', label: 'Ocean Waves', icon: '🌊' },
    { id: 'forest', label: 'Forest Birds', icon: '🌲' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Adaptive Focus Mode & Accessibility Controls
        </h2>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Adaptive Workspace Controls */}
        <div className="enterprise-card p-6 border border-slate-200 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              Workspace Accessibility & Neurodivergent Adaptations
            </h3>
            <button
              onClick={toggleFocusMode}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${accessibility.focusModeActive
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
            >
              Adaptive Focus Shield: {accessibility.focusModeActive ? 'ACTIVE' : 'OFF'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dyslexia Friendly Font Toggle */}
            <div
              onClick={toggleDyslexiaFont}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${accessibility.dyslexiaFont
                ? 'bg-blue-50 border-blue-400 text-blue-900'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900">Dyslexia-Friendly Font</span>
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${accessibility.dyslexiaFont ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                  {accessibility.dyslexiaFont && <span className="text-[10px] text-white font-bold">✓</span>}
                </div>
              </div>
              <p className="text-xs text-slate-500">Increases letter spacing and uses high-legibility character shapes.</p>
            </div>

            {/* High Contrast Mode Toggle */}
            <div
              onClick={toggleHighContrast}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${accessibility.highContrast
                ? 'bg-blue-50 border-blue-400 text-blue-900'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900">High Contrast UI</span>
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${accessibility.highContrast ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                  {accessibility.highContrast && <span className="text-[10px] text-white font-bold">✓</span>}
                </div>
              </div>
              <p className="text-xs text-slate-500">Enhances visual borders and background contrast for readability.</p>
            </div>

            {/* Notification Batching Toggle */}
            <div
              onClick={toggleBatchNotifications}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${accessibility.batchNotifications
                ? 'bg-blue-50 border-blue-400 text-blue-900'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900">Notification Batching</span>
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${accessibility.batchNotifications ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                  {accessibility.batchNotifications && <span className="text-[10px] text-white font-bold">✓</span>}
                </div>
              </div>
              <p className="text-xs text-slate-500">Batches non-urgent emails & Slack alerts into hourly focus digests.</p>
            </div>

            {/* Clutter Reduction Toggle */}
            <div
              onClick={toggleClutterReduction}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${accessibility.reducedMotion
                ? 'bg-blue-50 border-blue-400 text-blue-900'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900">Clutter Reduction</span>
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${accessibility.reducedMotion ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                  {accessibility.reducedMotion && <span className="text-[10px] text-white font-bold">✓</span>}
                </div>
              </div>
              <p className="text-xs text-slate-500">Removes non-essential decorative animations during focus sessions.</p>
            </div>
          </div>

          {/* Ambient Soundscapes Selector */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-600" />
              Soothing Ambient Soundscapes
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {soundOptions.map(sound => (
                <button
                  key={sound.id}
                  onClick={() => setAmbientSound(sound.id)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${accessibility.ambientSound === sound.id
                    ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <span className="text-2xl">{sound.icon}</span>
                  <span className="text-xs">{sound.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Deep Focus Timer Card */}
        <div className={`enterprise-card p-6 border flex flex-col justify-between items-center text-center ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
          <div className="w-full">

            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Pomodoro Focus Timer
            </h3>


            <div className="my-6 relative flex items-center justify-center">
              <CrystalWaveTimer size={210} />
            </div>

            {/* Quick Mode Toggle */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                onClick={() => setPomodoroMode('focus')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${pomodoro.mode === 'focus'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
              >
                25m Focus
              </button>
              <button
                onClick={() => setPomodoroMode('break')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${pomodoro.mode === 'break'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
              >
                5m Break
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={togglePomodoro}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs text-white transition-all shadow-xs cursor-pointer active:scale-95 ${pomodoro.mode === 'break'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {pomodoro.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{pomodoro.isRunning ? 'Pause Session' : pomodoro.secondsRemaining === pomodoro.totalSeconds ? 'Start Session' : 'Resume'}</span>
            </button>
            <button
              onClick={resetPomodoro}
              className={`p-3 rounded-xl border transition-colors cursor-pointer ${isDarkMode
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
