'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import {
  Palmtree,
  Calendar,
  Heart,
  Stethoscope,
  Home,
  Cake,
  CheckCircle2,
  Clock3,
  Plus,
  Info,
  HelpCircle
} from 'lucide-react';

export const PtoHealthHubView: React.FC = () => {
  const {
    ptoBalance,
    ptoRequests,
    setIsPtoModalOpen,
    cancelPtoRequest,
    isDarkMode
  } = useWellness();

  const PtoTooltip: React.FC<{
    icon?: 'info' | 'help';
    content: React.ReactNode;
    align?: 'left' | 'center' | 'right';
    className?: string;
  }> = ({ icon = 'help', content, align = 'center', className = '' }) => {
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
          className="p-1 rounded-full text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
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
          className={`absolute top-full mt-2 w-64 sm:w-72 p-3.5 rounded-2xl border shadow-2xl z-40 text-left transition-all duration-200 transform origin-top ${align === 'left'
              ? 'left-0'
              : align === 'right'
                ? 'right-0'
                : 'left-1/2 -translate-x-1/2'
            } ${isOpen
              ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
            } ${isDarkMode
              ? 'bg-[#181a24]/95 backdrop-blur-md border-[#2d3242] text-slate-200 shadow-black/80'
              : 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-700 shadow-slate-200/80'
            }`}
        >
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-normal">
            {content}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Banner */}
      <div className={`enterprise-card p-6 sm:p-8 border ${isDarkMode
        ? 'border-slate-800 bg-[#16181f] text-white'
        : 'border-slate-200 bg-white text-slate-900'
        } flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden`}>
        {/* Subtle Decorative Ambient Background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="space-y-1.5 max-w-2xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Palmtree className="w-6 h-6" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
              Rest & Recovery Hub
            </span>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              PTO & Wellness Time-Off Hub
            </h2>
            <PtoTooltip
              icon="help"
              align="left"
              content="Taking scheduled rest days directly restores energy and keeps your real-time Burnout Risk low. Plan mental health recharges, vacations, and personal time-off with auto Boundary Shield protection."
            />
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => setIsPtoModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Request Time Off</span>
          </button>
        </div>
      </div>

      {/* 4 Balance Breakdown Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Allowance */}
        <div className={`enterprise-card p-5 border ${isDarkMode ? 'border-slate-800 bg-[#16181f]' : 'border-slate-200 bg-white'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Allowance</span>
            <PtoTooltip
              icon="help"
              align="right"
              content="Your annual standard paid time-off allotment allocated per policy year."
            />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {ptoBalance.totalAllowance}
            </span>
            <span className="text-xs font-bold text-slate-400">Days / Year</span>
          </div>
        </div>

        {/* Used So Far */}
        <div className={`enterprise-card p-5 border ${isDarkMode ? 'border-slate-800 bg-[#16181f]' : 'border-slate-200 bg-white'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Used So Far</span>
            <PtoTooltip
              icon="help"
              align="right"
              content="Total approved and logged rest days taken during the current year."
            />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {ptoBalance.usedDays}
            </span>
            <span className="text-xs font-bold text-slate-400">Days Taken</span>
          </div>
        </div>

        {/* Pending Review */}
        <div className={`enterprise-card p-5 border ${isDarkMode ? 'border-slate-800 bg-[#16181f]' : 'border-slate-200 bg-white'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Pending Review</span>
            <PtoTooltip
              icon="help"
              align="right"
              content="Time-off requests currently submitted and awaiting executive review or approval."
            />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {ptoBalance.pendingDays}
            </span>
            <span className="text-xs font-bold text-slate-400">Days Pending</span>
          </div>
        </div>

        {/* Available to Book */}
        <div className={`enterprise-card p-5 border ${isDarkMode ? 'bg-cyan-950/20 border-cyan-800/50' : 'bg-cyan-50/70 border-cyan-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300">Available to Book</span>
            <PtoTooltip
              icon="help"
              align="right"
              content="Remaining available rest balance ready for instant scheduling and burnout prevention."
            />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-black text-cyan-600 dark:text-cyan-300">
              {ptoBalance.remainingDays}
            </span>
            <span className="text-xs font-bold text-cyan-700/80 dark:text-cyan-400">Days Left</span>
          </div>
        </div>
      </div>

      {/* Leave Requests History Table Card */}
      <div className={`enterprise-card p-6 sm:p-8 border ${isDarkMode ? 'border-slate-800 bg-[#16181f]' : 'border-slate-200 bg-white'} space-y-6`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <Calendar className="w-4 h-4 text-cyan-500" />
            Your Time-Off & Recharge Requests ({ptoRequests.length})
          </h3>
        </div>

        {ptoRequests.length === 0 ? (
          <div className="py-12 px-4 text-center border-2 border-dashed rounded-3xl border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-center">

            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No time-off requests yet</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm">
              Ready for a recharge? Click the button below to submit a vacation, mental health day, or personal leave request.
            </p>
            <button
              onClick={() => setIsPtoModalOpen(true)}
              className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit First Request</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {ptoRequests.map(req => {
              const getIcon = () => {
                switch (req.category) {
                  case 'mental_health':
                    return <Heart className="w-4 h-4 text-rose-500" />;
                  case 'sick':
                    return <Stethoscope className="w-4 h-4 text-amber-500" />;
                  case 'personal':
                    return <Home className="w-4 h-4 text-purple-500" />;
                  case 'birthday':
                    return <Cake className="w-4 h-4 text-pink-500" />;
                  default:
                    return <Palmtree className="w-4 h-4 text-cyan-500" />;
                }
              };

              const getCategoryLabel = () => {
                switch (req.category) {
                  case 'mental_health':
                    return '🧘 Mental Health / Wellness';
                  case 'sick':
                    return '🤒 Medical / Sick';
                  case 'personal':
                    return '🏡 Personal / Family';
                  case 'birthday':
                    return '🎂 Birthday Perk';
                  default:
                    return '🏖️ Vacation';
                }
              };

              return (
                <div
                  key={req.id}
                  className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${isDarkMode
                    ? 'bg-[#12141a] border-[#262b3a] hover:border-slate-700'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-white hover:shadow-xs'
                    }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="p-3 rounded-2xl bg-white dark:bg-[#1a1c25] shadow-xs border border-slate-100 dark:border-slate-800 shrink-0">
                      {getIcon()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs sm:text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {getCategoryLabel()}
                        </span>
                        <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800">
                          {req.totalDays} {req.totalDays === 1 ? 'Day' : 'Days'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {req.startDate} {req.startDate !== req.endDate ? `to ${req.endDate}` : ''}{' '}
                        {req.reason && `• "${req.reason}"`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    {req.status === 'approved' ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        {req.autoApproved ? 'Auto-Approved' : 'Approved'}
                      </span>
                    ) : req.status === 'pending' ? (
                      <div className="flex items-center gap-2.5">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                          <Clock3 className="w-3.5 h-3.5 text-amber-500" />
                          Pending Review
                        </span>
                        <button
                          onClick={() => cancelPtoRequest(req.id)}
                          className="text-[11px] text-rose-600 hover:text-rose-700 dark:text-rose-400 font-bold hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {req.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
