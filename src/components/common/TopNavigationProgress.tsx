'use client';

import React from 'react';
import { useWellness } from '../../context/WellnessContext';

export const TopNavigationProgress: React.FC = () => {
  const { isNavigating } = useWellness();

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2.5px] pointer-events-none overflow-hidden">
      <div className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 shadow-[0_0_12px_rgba(37,99,235,0.7)] animate-top-loader w-full" />
    </div>
  );
};
