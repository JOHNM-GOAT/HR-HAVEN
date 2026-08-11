'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { 
  Heart, 
  Droplet, 
  Eye, 
  Activity, 
  Footprints, 
  Play, 
  CalendarCheck,
  Plus,
  Minus
} from 'lucide-react';

export const PhysicalHealthView: React.FC = () => {
  const { reminders, toggleReminder, setActiveExercise, setToastNotification } = useWellness();
  const [waterCups, setWaterCups] = useState(5); // Out of 8 cups

  const addCup = () => {
    if (waterCups < 10) {
      setWaterCups(prev => prev + 1);
      setToastNotification(`Hydration logged! ${waterCups + 1}/8 cups completed for today. 💧`);
    }
  };

  const removeCup = () => {
    if (waterCups > 0) setWaterCups(prev => prev - 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-block mb-2">
          Physical Well-Being Suite
        </span>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Smart Physical Health & Micro-Break Guidance
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Protects your eyes, posture, and hydration throughout your workday based on calendar availability.
        </p>
      </div>

      {/* Top Interactive Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interactive Hydration Tracker */}
        <div className="enterprise-card p-6 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Droplet className="w-5 h-5 fill-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Smart Hydration Tracker</h3>
                  <p className="text-xs text-slate-500">Target: 8 Cups (2.0 Liters) Daily</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                {Math.round((waterCups / 8) * 100)}% Goal
              </span>
            </div>

            {/* Cup Visual Grid */}
            <div className="flex flex-wrap items-center gap-3 my-5 justify-center">
              {Array.from({ length: 8 }).map((_, i) => (
                <div 
                  key={i}
                  className={`w-10 h-14 rounded-xl border flex flex-col items-center justify-end p-1 transition-all ${
                    i < waterCups 
                      ? 'bg-blue-500 text-white border-blue-600 scale-105 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <Droplet className={`w-4 h-4 mb-1 ${i < waterCups ? 'fill-white' : ''}`} />
                  <span className="text-[10px] font-bold">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-600 font-medium">{waterCups} of 8 cups logged</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={removeCup}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                title="Remove Cup"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button 
                onClick={addCup}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Log 1 Cup</span>
              </button>
            </div>
          </div>
        </div>

        {/* Guided Micro-Break Launchers */}
        <div className="enterprise-card p-6 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                <Heart className="w-5 h-5 fill-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Guided Micro-Breaks</h3>
                <p className="text-xs text-slate-500">2-Minute step-by-step sessions with active timers</p>
              </div>
            </div>

            <div className="space-y-3 my-3">
              <button
                onClick={() => setActiveExercise('stretch')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧘‍♂️</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">Posture & Neck Stretch</h4>
                    <p className="text-[11px] text-slate-500">Relieves upper back and neck tension</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                  <Play className="w-3.5 h-3.5 fill-blue-700" /> Start
                </span>
              </button>

              <button
                onClick={() => setActiveExercise('eye_rest')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👁️</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">20-20-20 Eye Rest</h4>
                    <p className="text-[11px] text-slate-500">Prevents digital eye strain</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                  <Play className="w-3.5 h-3.5 fill-blue-700" /> Start
                </span>
              </button>

              <button
                onClick={() => setActiveExercise('breathwork')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🫁</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">Diaphragmatic Breathwork</h4>
                    <p className="text-[11px] text-slate-500">Reduces heart rate & anxiety</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                  <Play className="w-3.5 h-3.5 fill-blue-700" /> Start
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Wellness Reminders Panel */}
      <div className="enterprise-card p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-blue-600" />
              Calendar-Aware Reminders
            </h3>
            <p className="text-xs text-slate-500">Automated prompts that pause during live Google/Outlook meetings</p>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Calendar Synced
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map(reminder => (
            <div key={reminder.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${reminder.isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>
                  {reminder.type === 'hydration' ? <Droplet className="w-5 h-5" /> :
                   reminder.type === 'stretch' ? <Heart className="w-5 h-5" /> :
                   reminder.type === 'eye_rest' ? <Eye className="w-5 h-5" /> :
                   <Footprints className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{reminder.title}</h4>
                  <p className="text-[11px] text-slate-500">{reminder.description}</p>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                    Interval: Every {reminder.intervalMinutes} mins
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleReminder(reminder.id)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  reminder.isActive ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  reminder.isActive ? 'left-[22px]' : 'left-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
