'use client';

import React, { useState } from 'react';
import { Info, HelpCircle } from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';

const ACCENT_CLASSES: Record<'blue' | 'cyan' | 'amber', string> = {
  blue: 'hover:text-blue-500 dark:hover:text-blue-400 focus:ring-blue-500/40',
  cyan: 'hover:text-cyan-500 dark:hover:text-cyan-400 focus:ring-cyan-500/40',
  amber: 'hover:text-amber-500 dark:hover:text-amber-400 focus:ring-amber-500/40'
};

export const Tooltip: React.FC<{
  icon?: 'info' | 'help';
  content: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  accent?: 'blue' | 'cyan' | 'amber';
  className?: string;
}> = ({ icon = 'help', content, align = 'center', accent = 'blue', className = '' }) => {
  const { isDarkMode } = useWellness();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`relative inline-flex items-center group ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        aria-label="More information"
        className={`p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 ${ACCENT_CLASSES[accent]}`}
      >
        {icon === 'info' ? (
          <Info className="w-3.5 h-3.5" />
        ) : (
          <HelpCircle className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Tooltip Floating Card */}
      <div
        role="tooltip"
        className={`absolute top-full mt-2 w-64 sm:w-72 p-3.5 rounded-2xl border shadow-2xl z-40 text-left transition-all duration-200 transform origin-top ${
          align === 'left'
            ? 'left-0'
            : align === 'right'
            ? 'right-0'
            : 'left-1/2 -translate-x-1/2'
        } ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
        } ${
          isDarkMode
            ? 'bg-[#181a24]/95 backdrop-blur-md border-[#2d3242] text-slate-200 shadow-black/80'
            : 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-700 shadow-slate-200/80'
        }`}
      >
        <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-normal">
          {content}
        </div>
      </div>
    </div>
  );
};
