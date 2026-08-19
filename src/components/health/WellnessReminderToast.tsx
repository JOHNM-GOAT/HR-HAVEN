'use client';

import React, { useEffect, useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { 
  Droplet, 
  Heart, 
  Eye, 
  Footprints, 
  X, 
  Clock, 
  Check, 
  Sparkles,
  CalendarCheck
} from 'lucide-react';

export const WellnessReminderToast: React.FC = () => {
  const { 
    activeReminderAlert, 
    dismissReminderAlert, 
    snoozeReminderAlert, 
    completeReminderAlert,
    isDarkMode 
  } = useWellness();

  const [progress, setProgress] = useState(100);

  // Gentle auto-dismiss after 14 seconds without disturbing the user
  useEffect(() => {
    if (!activeReminderAlert) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const duration = 14000;
    const intervalTime = 100;
    const step = (intervalTime / duration) * 100;

    const progressTimer = setInterval(() => {
      setProgress(prev => Math.max(0, prev - step));
    }, intervalTime);

    const dismissTimer = setTimeout(() => {
      dismissReminderAlert();
    }, duration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(dismissTimer);
    };
  }, [activeReminderAlert?.id, dismissReminderAlert]);

  if (!activeReminderAlert) return null;

  const getIcon = () => {
    switch (activeReminderAlert.type) {
      case 'hydration':
        return <Droplet className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'stretch':
        return <Heart className="w-5 h-5 text-rose-500 animate-pulse" />;
      case 'eye_rest':
        return <Eye className="w-5 h-5 text-teal-500 animate-pulse" />;
      case 'short_walk':
        return <Footprints className="w-5 h-5 text-emerald-500 animate-pulse" />;
      default:
        return <CalendarCheck className="w-5 h-5 text-blue-500" />;
    }
  };

  const getActionLabel = () => {
    switch (activeReminderAlert.type) {
      case 'hydration':
        return '💧 Drink & Log (+1 Cup)';
      case 'stretch':
        return '🧘 Do 2-Min Stretch';
      case 'eye_rest':
        return '👀 Rest Eyes (20s)';
      case 'short_walk':
        return '🚶 Stepped Out';
      default:
        return '✓ Done';
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-slide-up max-w-sm w-full pointer-events-auto">
      <div 
        className={`rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-md transition-all ${
          isDarkMode 
            ? 'bg-[#151722]/95 border-blue-900/60 text-white shadow-black/80' 
            : 'bg-white/95 border-blue-200 text-slate-900 shadow-blue-500/10'
        }`}
      >
        {/* Soft Auto-Dismiss Progress Line at Top */}
        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-4 sm:p-4.5">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl border flex items-center justify-center ${
                isDarkMode ? 'bg-blue-950/70 border-blue-800' : 'bg-blue-50 border-blue-200'
              }`}>
                {getIcon()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    Gentle Reminder
                  </span>
                  <span className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Every {activeReminderAlert.intervalMinutes}m
                  </span>
                </div>
                <h4 className={`text-sm font-extrabold mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {activeReminderAlert.title}
                </h4>
              </div>
            </div>

            <button
              onClick={dismissReminderAlert}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer`}
              title="Dismiss Notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Gentle Description */}
          <p className={`text-xs mt-2.5 mb-3.5 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {activeReminderAlert.description}
          </p>

          {/* Non-Disturbing Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={() => snoozeReminderAlert(5)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Snooze 5m</span>
            </button>

            <button
              onClick={() => completeReminderAlert(activeReminderAlert)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-blue-600/25 transition-all cursor-pointer"
            >
              <span>{getActionLabel()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
