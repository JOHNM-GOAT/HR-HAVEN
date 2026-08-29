'use client';

import React from 'react';
import { useWellness } from '../../context/WellnessContext';
import {
  Heart,
  Droplet,
  Eye,
  Activity,
  Footprints,
  Play,
  CalendarCheck
} from 'lucide-react';
import { WaterBottleChamber } from './WaterBottleChamber';
import { Tooltip } from '../common/Tooltip';

export const PhysicalHealthView: React.FC = () => {
  const { reminders, toggleReminder, setActiveExercise, waterCups, isDarkMode } = useWellness();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Smart Physical Health & Micro-Break Guidance
        </h2>
        <Tooltip
          icon="help"
          align="left"
          content="Monitor daily water intake, launch guided ergonomic and breathwork micro-breaks, and configure calendar-aware wellness reminders."
        />
      </div>

      {/* Top Interactive Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interactive Hydration Tracker (Horizontal Capsule Bottle) */}
        <div className={`enterprise-card p-6 border flex flex-col justify-between ${isDarkMode ? 'bg-[#202229] border-[#2e323d] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-blue-950/60 text-blue-400 border-blue-800' : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                  <Droplet className="w-5 h-5 fill-blue-600" />
                </div>
                <div className="flex items-center gap-1.5">
                  <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Smart Hydration Tracker</h3>
                  <Tooltip
                    icon="help"
                    align="left"
                    content="Log your daily water consumption toward the recommended 10 cups (2.5L) daily goal."
                  />
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${waterCups >= 10
                ? isDarkMode ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isDarkMode ? 'bg-blue-950/60 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                {Math.round((waterCups / 10) * 100)}% Goal
              </span>
            </div>

            {/* Horizontal Interactive Water Chamber Bottle */}
            <WaterBottleChamber />
          </div>
        </div>

        {/* Guided Micro-Break Launchers */}
        <div className={`enterprise-card p-6 border flex flex-col justify-between ${isDarkMode ? 'bg-[#202229] border-[#2e323d] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-rose-950/60 text-rose-400 border-rose-800' : 'bg-rose-50 text-rose-600 border-rose-100'
                }`}>
                <Heart className="w-5 h-5 fill-rose-600" />
              </div>
              <div className="flex items-center gap-1.5">
                <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Guided Micro-Breaks</h3>
                <Tooltip
                  icon="help"
                  align="left"
                  content="Interactive 2-minute restorative sessions for posture stretching, 20-20-20 eye strain relief, and diaphragmatic breathing."
                />
              </div>
            </div>

            <div className="space-y-3 my-3">
              <button
                onClick={() => setActiveExercise('stretch')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left group cursor-pointer ${isDarkMode
                  ? 'bg-[#1a1c22] border-[#2e323d] hover:border-blue-500 hover:bg-[#252833]'
                  : 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
              >
                <div className="flex items-center gap-3">

                  <div>
                    <h4 className={`text-xs font-bold transition-colors ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-700'
                      }`}>Posture & Neck Stretch</h4>
                    <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Relieves upper back and neck tension</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg border ${isDarkMode ? 'bg-blue-950/60 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                  <Play className="w-3.5 h-3.5 fill-current" /> Start
                </span>
              </button>

              <button
                onClick={() => setActiveExercise('eye_rest')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left group cursor-pointer ${isDarkMode
                  ? 'bg-[#1a1c22] border-[#2e323d] hover:border-blue-500 hover:bg-[#252833]'
                  : 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
              >
                <div className="flex items-center gap-3">

                  <div>
                    <h4 className={`text-xs font-bold transition-colors ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-700'
                      }`}>20-20-20 Eye Rest</h4>
                    <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Prevents digital eye strain</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg border ${isDarkMode ? 'bg-blue-950/60 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                  <Play className="w-3.5 h-3.5 fill-current" /> Start
                </span>
              </button>

              <button
                onClick={() => setActiveExercise('breathwork')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left group cursor-pointer ${isDarkMode
                  ? 'bg-[#1a1c22] border-[#2e323d] hover:border-blue-500 hover:bg-[#252833]'
                  : 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
              >
                <div className="flex items-center gap-3">

                  <div>
                    <h4 className={`text-xs font-bold transition-colors ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-700'
                      }`}>Diaphragmatic Breathwork</h4>
                    <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Reduces heart rate & anxiety</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg border ${isDarkMode ? 'bg-blue-950/60 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                  <Play className="w-3.5 h-3.5 fill-current" /> Start
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Wellness Reminders Panel */}
      <div className={`enterprise-card p-6 border ${isDarkMode ? 'bg-[#202229] border-[#2e323d] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <h3 className={`text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <CalendarCheck className="w-5 h-5 text-blue-500" />
              Calendar-Aware Reminders
            </h3>
            <Tooltip
              icon="help"
              align="left"
              content="Automated background notifications scheduled around your calendar to remind you to stretch, hydrate, and rest your eyes."
            />
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${isDarkMode ? 'bg-blue-950/60 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
            Calendar Synced
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map(reminder => (
            <div
              key={reminder.id}
              className={`p-4 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-[#1a1c22] border-[#2e323d]' : 'bg-slate-50 border-slate-200'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${reminder.isActive
                  ? isDarkMode ? 'bg-blue-950/70 text-blue-400 border border-blue-800' : 'bg-blue-100 text-blue-700'
                  : isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-500'
                  }`}>
                  {reminder.type === 'hydration' ? <Droplet className="w-5 h-5" /> :
                    reminder.type === 'stretch' ? <Heart className="w-5 h-5" /> :
                      reminder.type === 'eye_rest' ? <Eye className="w-5 h-5" /> :
                        <Footprints className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{reminder.title}</h4>
                  <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{reminder.description}</p>
                  <span className={`text-[10px] font-medium mt-0.5 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Interval: Every {reminder.intervalMinutes} mins
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleReminder(reminder.id)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${reminder.isActive ? 'bg-blue-600' : isDarkMode ? 'bg-slate-700' : 'bg-slate-300'
                  }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${reminder.isActive ? 'left-[22px]' : 'left-0.5'
                  }`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
