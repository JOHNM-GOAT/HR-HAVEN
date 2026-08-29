'use client';

import React from 'react';
import { CheckCircle2, Clock3, XCircle, LucideIcon } from 'lucide-react';
import { useWellness } from '../../context/WellnessContext';

interface StatusChipProps {
  status: string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const CONFIG: Record<string, { icon: LucideIcon | null; iconColor: string; light: string; dark: string }> = {
  approved: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    light: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dark: 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
  },
  pending: {
    icon: Clock3,
    iconColor: 'text-amber-500',
    light: 'bg-amber-50 text-amber-800 border-amber-200',
    dark: 'bg-amber-950/60 text-amber-300 border-amber-800'
  },
  rejected: {
    icon: XCircle,
    iconColor: 'text-rose-500',
    light: 'bg-rose-50 text-rose-700 border-rose-200',
    dark: 'bg-rose-950/60 text-rose-300 border-rose-800'
  }
};

const DEFAULT_CONFIG = {
  icon: null,
  iconColor: '',
  light: 'bg-slate-100 text-slate-600 border-slate-200',
  dark: 'bg-slate-800 text-slate-400 border-slate-700'
};

export const StatusChip: React.FC<StatusChipProps> = ({ status, label, size = 'sm', className = '' }) => {
  const { isDarkMode } = useWellness();
  const cfg = CONFIG[status] || DEFAULT_CONFIG;
  const Icon = cfg.icon;
  const sizeClasses = size === 'md' ? 'px-3 py-1.5 text-xs gap-1.5' : 'px-3 py-1 text-[10px] gap-1';
  const iconSize = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <span
      className={`rounded-full font-bold border inline-flex items-center ${sizeClasses} ${isDarkMode ? cfg.dark : cfg.light} ${className}`}
    >
      {Icon && <Icon className={`${iconSize} ${cfg.iconColor}`} />}
      <span>{label || status.toUpperCase()}</span>
    </span>
  );
};
