'use client';

import React from 'react';
import { NavTab } from '../../types/wellness';
import { useWellness } from '../../context/WellnessContext';

interface ViewSkeletonProps {
  tab?: NavTab;
}

export const ViewSkeleton: React.FC<ViewSkeletonProps> = ({ tab = 'dashboard' }) => {
  const { isDarkMode } = useWellness();

  const cardBg = isDarkMode ? 'bg-[#16181f] border-slate-800' : 'bg-white border-slate-200';
  const blockBg = isDarkMode ? 'bg-slate-800/60' : 'bg-slate-200/70';

  if (tab === 'dashboard') {
    return (
      <div className="space-y-8 animate-page-enter">
        {/* Top Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className={`h-7 w-64 rounded-xl skeleton-shimmer ${blockBg}`} />
            <div className={`h-4 w-96 max-w-full rounded-lg skeleton-shimmer ${blockBg}`} />
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-9 w-28 rounded-xl skeleton-shimmer ${blockBg}`} />
            <div className={`h-9 w-28 rounded-xl skeleton-shimmer ${blockBg}`} />
            <div className={`h-9 w-10 rounded-xl skeleton-shimmer ${blockBg}`} />
          </div>
        </div>

        {/* 3 Main Grid Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className={`enterprise-card p-6 border rounded-2xl ${cardBg} flex flex-col justify-between min-h-[380px]`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-4 w-36 rounded-md skeleton-shimmer ${blockBg}`} />
                  <div className={`h-4 w-12 rounded-md skeleton-shimmer ${blockBg}`} />
                </div>
                {/* Circular Gauge / Center Visual Placeholder */}
                <div className="flex flex-col items-center my-6">
                  <div className={`w-36 h-36 rounded-full skeleton-shimmer ${blockBg} flex items-center justify-center p-3`}>
                    <div className={`w-24 h-24 rounded-full ${isDarkMode ? 'bg-[#16181f]' : 'bg-white'}`} />
                  </div>
                  <div className={`h-3 w-28 rounded-md mt-4 skeleton-shimmer ${blockBg}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Attendance Calendar Skeleton */}
        <div className={`enterprise-card p-6 border rounded-2xl ${cardBg} space-y-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className={`h-5 w-72 rounded-lg skeleton-shimmer ${blockBg}`} />
              <div className={`h-3.5 w-96 max-w-full rounded-md skeleton-shimmer ${blockBg}`} />
            </div>
            <div className={`h-9 w-44 rounded-2xl skeleton-shimmer ${blockBg}`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-2">
              <div className="grid grid-cols-7 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map(d => (
                  <div key={d} className={`h-6 rounded-md skeleton-shimmer ${blockBg}`} />
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div key={i} className={`h-16 rounded-xl skeleton-shimmer ${blockBg}`} />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#12141c] border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-3`}>
                <div className={`h-4 w-32 rounded skeleton-shimmer ${blockBg}`} />
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className={`h-10 rounded-lg skeleton-shimmer ${blockBg}`} />
                  <div className={`h-10 rounded-lg skeleton-shimmer ${blockBg}`} />
                  <div className={`h-10 rounded-lg skeleton-shimmer ${blockBg}`} />
                  <div className={`h-10 rounded-lg skeleton-shimmer ${blockBg}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'accounts' || tab === 'hr') {
    return (
      <div className="space-y-6 animate-page-enter">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className={`h-7 w-64 rounded-xl skeleton-shimmer ${blockBg}`} />
            <div className={`h-4 w-80 max-w-full rounded-lg skeleton-shimmer ${blockBg}`} />
          </div>
          <div className="flex items-center gap-2.5">
            <div className={`h-9 w-48 rounded-xl skeleton-shimmer ${blockBg}`} />
            <div className={`h-9 w-32 rounded-xl skeleton-shimmer ${blockBg}`} />
          </div>
        </div>

        {/* Search & Filter Bar Skeleton */}
        <div className={`p-4 rounded-2xl border ${cardBg} flex items-center justify-between gap-4`}>
          <div className={`h-9 w-64 rounded-xl skeleton-shimmer ${blockBg}`} />
          <div className="flex items-center gap-2">
            <div className={`h-9 w-24 rounded-xl skeleton-shimmer ${blockBg}`} />
            <div className={`h-9 w-24 rounded-xl skeleton-shimmer ${blockBg}`} />
          </div>
        </div>

        {/* Tabulated Rows Skeleton */}
        <div className={`border rounded-2xl overflow-hidden ${cardBg}`}>
          <div className={`p-4 border-b border-slate-200/60 dark:border-slate-800 ${isDarkMode ? 'bg-slate-900/40' : 'bg-slate-50'}`}>
            <div className="grid grid-cols-12 gap-4">
              <div className={`col-span-4 h-4 rounded skeleton-shimmer ${blockBg}`} />
              <div className={`col-span-3 h-4 rounded skeleton-shimmer ${blockBg}`} />
              <div className={`col-span-2 h-4 rounded skeleton-shimmer ${blockBg}`} />
              <div className={`col-span-3 h-4 rounded skeleton-shimmer ${blockBg}`} />
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {[1, 2, 3, 4, 5, 6].map(r => (
              <div key={r} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-1/3">
                  <div className={`w-10 h-10 rounded-full skeleton-shimmer ${blockBg} shrink-0`} />
                  <div className="space-y-1.5 w-full">
                    <div className={`h-4 w-32 rounded skeleton-shimmer ${blockBg}`} />
                    <div className={`h-3 w-40 rounded skeleton-shimmer ${blockBg}`} />
                  </div>
                </div>
                <div className={`h-4 w-28 rounded skeleton-shimmer ${blockBg}`} />
                <div className={`h-6 w-20 rounded-full skeleton-shimmer ${blockBg}`} />
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-16 rounded-lg skeleton-shimmer ${blockBg}`} />
                  <div className={`h-8 w-8 rounded-lg skeleton-shimmer ${blockBg}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Generic View Skeleton for Health, Mental, Social, Boundary, Settings
  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header */}
      <div className="space-y-2">
        <div className={`h-7 w-60 rounded-xl skeleton-shimmer ${blockBg}`} />
        <div className={`h-4 w-96 max-w-full rounded-lg skeleton-shimmer ${blockBg}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`enterprise-card p-6 border rounded-2xl ${cardBg} space-y-4`}>
          <div className="flex items-center justify-between">
            <div className={`h-5 w-40 rounded-lg skeleton-shimmer ${blockBg}`} />
            <div className={`h-5 w-16 rounded-full skeleton-shimmer ${blockBg}`} />
          </div>
          <div className={`h-24 w-full rounded-2xl skeleton-shimmer ${blockBg}`} />
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className={`h-10 rounded-xl skeleton-shimmer ${blockBg}`} />
            <div className={`h-10 rounded-xl skeleton-shimmer ${blockBg}`} />
            <div className={`h-10 rounded-xl skeleton-shimmer ${blockBg}`} />
          </div>
        </div>

        <div className={`enterprise-card p-6 border rounded-2xl ${cardBg} space-y-4`}>
          <div className="flex items-center justify-between">
            <div className={`h-5 w-40 rounded-lg skeleton-shimmer ${blockBg}`} />
            <div className={`h-5 w-16 rounded-full skeleton-shimmer ${blockBg}`} />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-14 w-full rounded-xl skeleton-shimmer ${blockBg}`} />
            ))}
          </div>
        </div>
      </div>

      <div className={`enterprise-card p-6 border rounded-2xl ${cardBg} space-y-4`}>
        <div className={`h-5 w-48 rounded-lg skeleton-shimmer ${blockBg}`} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-28 rounded-xl skeleton-shimmer ${blockBg}`} />
          ))}
        </div>
      </div>
    </div>
  );
};
