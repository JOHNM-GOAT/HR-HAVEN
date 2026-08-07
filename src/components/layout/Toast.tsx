'use client';

import React from 'react';
import { useWellness } from '../../context/WellnessContext';
import { CheckCircle2, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastNotification, setToastNotification } = useWellness();

  if (!toastNotification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-2xl animate-pulse-glow max-w-md">
      <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
      <p className="text-xs font-semibold text-slate-100 flex-1">{toastNotification}</p>
      <button 
        onClick={() => setToastNotification(null)}
        className="text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
