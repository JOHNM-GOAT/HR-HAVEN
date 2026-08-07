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

export const CognitiveInclusivityView: React.FC = () => {
  const { 
    accessibility, 
    toggleFocusMode, 
    toggleDyslexiaFont, 
    toggleHighContrast, 
    setAmbientSound,
    setToastNotification 
  } = useWellness();

  // Pomodoro timer state
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setFocusSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimerRunning(false);
          setToastNotification('Deep focus session complete! Take a 5-minute physical stretch break.');
          return 25 * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, setToastNotification]);

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
        <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-block mb-2">
          Cognitive Inclusivity & Focus Suite
        </span>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Adaptive Focus Mode & Accessibility Controls
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Customizes your workspace for different working styles, including neurodivergent users (ADHD, Dyslexia, Sensory sensitivity).
        </p>
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
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                accessibility.focusModeActive
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
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                accessibility.dyslexiaFont
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
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                accessibility.highContrast
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

            {/* Notification Batching */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900">Notification Batching</span>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">Active</span>
              </div>
              <p className="text-xs text-slate-500">Batches non-urgent emails & Slack alerts into hourly focus digests.</p>
            </div>

            {/* Minimal Distraction View */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900">Clutter Reduction</span>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">Enabled</span>
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
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    accessibility.ambientSound === sound.id
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
        <div className="enterprise-card p-6 border border-slate-200 flex flex-col justify-between items-center text-center">
          <div className="w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 inline-block mb-3">
              Deep Focus Session
            </span>
            <h3 className="text-lg font-bold text-slate-900">Pomodoro Timer</h3>
            <p className="text-xs text-slate-500 mt-1">25-minute focus, 5-minute rest</p>

            <div className="my-8 relative flex items-center justify-center">
              <div className="w-44 h-44 rounded-full border-4 border-blue-500 flex items-center justify-center bg-slate-50 shadow-inner">
                <span className="text-4xl font-black text-slate-900 tracking-tight">
                  {Math.floor(focusSeconds / 60)}:{String(focusSeconds % 60).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs"
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isTimerRunning ? 'Pause Session' : 'Start 25m Focus'}</span>
            </button>
            <button
              onClick={() => {
                setFocusSeconds(25 * 60);
                setIsTimerRunning(false);
              }}
              className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
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
