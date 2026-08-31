'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { LeaveCategory } from '../../types/wellness';
import { Tooltip } from '../common/Tooltip';
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

export const PtoRequestModal: React.FC = () => {
  const {
    isPtoModalOpen,
    setIsPtoModalOpen,
    ptoBalance,
    submitPtoRequest,
    isDarkMode
  } = useWellness();

  const todayStr = new Date().toISOString().split('T')[0];
  const [category, setCategory] = useState<LeaveCategory>('mental_health');
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [reason, setReason] = useState<string>('');

  if (!isPtoModalOpen) return null;

  // Calculate business/calendar days difference
  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  };

  const totalDays = calculateDays();
  const isAutoApproved =
    (category === 'mental_health' && totalDays <= 1) || category === 'birthday';
  const remainingAfter = Math.max(0, ptoBalance.remainingDays - totalDays);

  const categories: {
    type: LeaveCategory;
    label: string;
    desc: string;
    badge: string;
    badgeColor: string;
  }[] = [
      {
        type: 'mental_health',
        label: 'Mental Health / Wellness',
        desc: '1-day restorative break to prevent burnout',
        badge: 'Auto-Approved (1D)',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
      },
      {
        type: 'vacation',
        label: 'Annual Vacation',
        desc: 'Holidays, travel, and extended time-off',
        badge: 'Manager Review',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
      },
      {
        type: 'sick',
        label: 'Medical / Sick Leave',
        desc: 'Health appointments & illness recovery',
        badge: 'Immediate Rest',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
      },
      {
        type: 'personal',
        label: 'Personal & Family Care',
        desc: 'Family obligations & personal errands',
        badge: 'Standard Review',
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800'
      },
      {
        type: 'birthday',
        label: 'Birthday / Milestone Perk',
        desc: 'Special company wellness day perk',
        badge: 'Auto-Approved',
        badgeColor: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/50 dark:text-pink-300 dark:border-pink-800'
      }
    ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalDays > ptoBalance.remainingDays) {
      alert(`You only have ${ptoBalance.remainingDays} PTO days remaining.`);
      return;
    }
    submitPtoRequest({
      category,
      startDate,
      endDate,
      totalDays,
      reason: reason.trim()
    });
    setIsPtoModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-7 transition-all ${isDarkMode
            ? 'bg-[#14161e] border-[#2e323e] text-white shadow-black/60'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
          }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold tracking-tight">Request Time Off / Rest Day</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {ptoBalance.remainingDays} PTO days available in your wellness allowance
            </p>
          </div>
          <button
            onClick={() => setIsPtoModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4.5 mt-5">
          {/* Leave Category Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Select Leave Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categories.map(cat => (
                <div key={cat.type} className="relative">
                  <button
                    type="button"
                    onClick={() => setCategory(cat.type)}
                    className={`w-full p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${category === cat.type
                        ? 'border-blue-500 bg-blue-500/10 shadow-xs ring-1 ring-blue-500'
                        : isDarkMode
                          ? 'border-[#262a36] bg-[#1a1c25] hover:border-slate-600'
                          : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                      }`}
                  >
                    <div className="w-full pr-6">
                      <span className="text-xs font-bold truncate block">{cat.label}</span>
                      <span className={`inline-block mt-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full border ${cat.badgeColor}`}>
                        {cat.badge}
                      </span>
                    </div>
                  </button>
                  {/* Full description moved into a help-icon tooltip instead of an
                      inline paragraph — the on-screen text was truncating mid-word
                      on these narrow cards. */}
                  <div className="absolute top-2 right-2">
                    <Tooltip icon="help" align="right" content={cat.desc} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range Picker */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                min={todayStr}
                onChange={e => {
                  setStartDate(e.target.value);
                  if (e.target.value > endDate) setEndDate(e.target.value);
                }}
                required
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all ${isDarkMode
                    ? 'bg-[#1a1c25] border-[#2e323e] text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 focus:bg-white'
                  }`}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || todayStr}
                onChange={e => setEndDate(e.target.value)}
                required
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all ${isDarkMode
                    ? 'bg-[#1a1c25] border-[#2e323e] text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 focus:bg-white'
                  }`}
              />
            </div>
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Reason / Wellness Note (Optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Wellness reset after intense release sprint..."
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs border transition-all ${isDarkMode
                  ? 'bg-[#1a1c25] border-[#2e323e] text-white placeholder-slate-500 focus:border-blue-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white'
                }`}
            />
          </div>

          {/* Burnout Recovery & Boundary Shield Banner */}
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-3 ${isAutoApproved
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-300'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-300'
              }`}
          >
            {isAutoApproved ? (
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            )}
            <div className="text-xs leading-relaxed">
              <p className="font-bold">
                {isAutoApproved
                  ? 'Instant Auto-Approval Active'
                  : ' Standard Manager Review'}
              </p>
              <p className="text-[11px] opacity-90 mt-0.5">
                Total duration:{' '}
                <strong>
                  {totalDays} {totalDays === 1 ? 'Day' : 'Days'}
                </strong>{' '}
                • Remaining allowance after:{' '}
                <strong>{remainingAfter} Days</strong>.
              </p>
              <p className="text-[11px] opacity-80 mt-1">
                Boundary Shield will auto-silence all notifications during this period to protect your rest.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsPtoModalOpen(false)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isDarkMode
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Book ({totalDays} {totalDays === 1 ? 'Day' : 'Days'})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
