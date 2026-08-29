'use client';

import React, { useState, useRef, useLayoutEffect } from 'react';
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
  const panelRef = useRef<HTMLDivElement>(null);

  // The panel is anchored to a small icon, so on narrow screens it can extend past
  // either viewport edge. Nudge it back inside once it opens.
  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    // Clear any previous correction so measurement starts from the class position.
    el.style.left = '';
    el.style.right = '';
    if (!isOpen) return;

    // Measure with the open/close transform neutralised — the scale/translate
    // animation is still mid-flight here and would skew the rect.
    el.style.transition = 'none';
    el.style.transform = 'none';

    const rect = el.getBoundingClientRect();
    const gutter = 8;
    let dx = 0;
    if (rect.right > window.innerWidth - gutter) dx = window.innerWidth - gutter - rect.right;
    if (rect.left + dx < gutter) dx = gutter - rect.left;
    const usedLeft = parseFloat(getComputedStyle(el).left);

    el.style.transform = '';
    el.style.transition = '';

    // Shift the used `left` by the delta. A margin cannot move a box that is
    // anchored with `right: 0`, and overriding `transform` would drop the
    // open animation; adjusting `left` works for every alignment.
    if (dx !== 0 && !Number.isNaN(usedLeft)) {
      el.style.right = 'auto';
      el.style.left = `${Math.round(usedLeft + dx)}px`;
    }
  }, [isOpen]);

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
        ref={panelRef}
        role="tooltip"
        className={`absolute top-full mt-2 w-64 sm:w-72 max-w-[calc(100vw-1rem)] p-3.5 rounded-2xl border shadow-2xl z-40 text-left transition-all duration-200 transform origin-top ${
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
