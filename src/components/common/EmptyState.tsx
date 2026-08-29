'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  ctaLabel?: string;
  onCta?: () => void;
  ctaIcon?: LucideIcon;
  iconAccent?: 'blue' | 'amber' | 'emerald' | 'rose' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

const ACCENT_CLASSES: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-500',
  amber: 'bg-amber-500/10 text-amber-500',
  emerald: 'bg-emerald-500/10 text-emerald-500',
  rose: 'bg-rose-500/10 text-rose-500',
  slate: 'bg-slate-500/10 text-slate-400'
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  ctaLabel,
  onCta,
  ctaIcon: CtaIcon,
  iconAccent = 'slate',
  size = 'md',
  className = ''
}) => {
  const { isDarkMode } = useWellness();
  const padding = size === 'sm' ? 'py-8 px-4' : 'py-12 px-4';

  return (
    <div
      className={`${padding} text-center border-2 border-dashed rounded-3xl flex flex-col items-center justify-center ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'
        } ${className}`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${ACCENT_CLASSES[iconAccent]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h4 className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{title}</h4>
      {description && (
        <p className={`text-xs mt-1.5 max-w-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {description}
        </p>
      )}
      {ctaLabel && onCta && (
        <button
          onClick={onCta}
          className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
        >
          {CtaIcon && <CtaIcon className="w-3.5 h-3.5" />}
          <span>{ctaLabel}</span>
        </button>
      )}
    </div>
  );
};
