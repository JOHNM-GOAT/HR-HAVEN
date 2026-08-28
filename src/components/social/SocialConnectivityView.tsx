'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { PeerBadge } from '../../types/wellness';
import {
  Award,
  Coffee,
  Send,
  UserCheck,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Calendar,
  Filter,
  HelpCircle,
  Info
} from 'lucide-react';

export const SocialConnectivityView: React.FC = () => {
  const {
    badges,
    sendPeerBadge,
    suggestHrSupport,
    userRole,
    setActiveTab,
    isDarkMode,
    accounts,
    userProfile
  } = useWellness();

  const SocialTooltip: React.FC<{
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
          className="p-1 rounded-full text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/40"
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
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-normal">
            {content}
          </p>
        </div>
      </div>
    );
  };

  const [recipient, setRecipient] = useState('');
  const [badgeType, setBadgeType] = useState<PeerBadge['badgeType']>('lifesaver');
  const [message, setMessage] = useState('');
  const [sendCoffee, setSendCoffee] = useState(true);

  const [showHrSuggest, setShowHrSuggest] = useState(false);
  const [teammateName, setTeammateName] = useState('');
  const [hrReason, setHrReason] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | PeerBadge['badgeType']>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month'>('all');

  const handleSendBadge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !message.trim()) return;
    const cleanRecip = recipient.trim().toLowerCase();
    const isAdminTarget = cleanRecip.includes('system administrator') || accounts.some(a => (a.name.toLowerCase() === cleanRecip || a.email.toLowerCase() === cleanRecip) && a.role === 'admin');
    if (isAdminTarget) {
      alert('System Administrator cannot be mentioned for appreciation badges. Please select an HR Manager or Teammate.');
      return;
    }
    sendPeerBadge(recipient.trim(), badgeType, message.trim(), sendCoffee);
    setRecipient('');
    setMessage('');
  };

  const handleHrSuggest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teammateName.trim()) return;
    const cleanName = teammateName.trim().toLowerCase();
    const isAdminTarget = cleanName.includes('system administrator') || accounts.some(a => (a.name.toLowerCase() === cleanName || a.email.toLowerCase() === cleanName) && a.role === 'admin');
    if (isAdminTarget) {
      alert('System Administrator cannot be flagged for teammate check-in. Please select an employee or team member.');
      return;
    }
    suggestHrSupport(teammateName.trim(), hrReason.trim());
    setSubmittedSuccess(true);
    setTimeout(() => {
      setShowHrSuggest(false);
      setSubmittedSuccess(false);
      setTeammateName('');
      setHrReason('');
    }, 2500);
  };

  const badgeOptions: { type: PeerBadge['badgeType']; label: string; icon: string; desc: string }[] = [
    { type: 'lifesaver', label: 'Lifesaver', icon: '🆘', desc: 'Stepped in when work got heavy' },
    { type: 'focus_champion', label: 'Focus Champion', icon: '🎯', desc: 'Respected deep focus hours' },
    { type: 'team_anchor', label: 'Team Anchor', icon: '⚓', desc: 'Kept everyone grounded & supported' },
    { type: 'positive_energy', label: 'Positive Energy', icon: '🌟', desc: 'Brought optimism & kindness' }
  ];

  // Eligible colleagues for recipient mentions (Only HR Managers and Employees; System Administrator excluded)
  const availableColleagues = accounts.filter(
    a =>
      a.email.toLowerCase() !== userProfile.email.toLowerCase() &&
      a.status === 'active' &&
      a.role !== 'admin' &&
      !a.name.toLowerCase().includes('system administrator')
  );

  // Resolve avatar dynamically so it always reflects the current user / registered account profile picture
  const resolveAvatar = (name: string, fallbackAvatar: string) => {
    if (!name) return fallbackAvatar;
    if (
      name.includes('(You)') ||
      (userProfile.name && name.toLowerCase().includes(userProfile.name.toLowerCase()))
    ) {
      return userProfile.avatarUrl || fallbackAvatar;
    }
    const cleanName = name.replace(/\s*\(You\)/i, '').trim().toLowerCase();
    const matched = accounts.find(
      a => a.name.toLowerCase() === cleanName || a.email.toLowerCase() === cleanName
    );
    return matched?.avatarUrl || fallbackAvatar;
  };

  const matchesDateFilter = (badge: PeerBadge, filter: 'all' | 'today' | 'yesterday' | 'week' | 'month'): boolean => {
    if (filter === 'all') return true;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    let badgeTime = 0;
    if (badge.createdAt) {
      const parsed = new Date(badge.createdAt).getTime();
      if (!isNaN(parsed)) badgeTime = parsed;
    }

    if (!badgeTime && badge.timestamp) {
      const tsLower = badge.timestamp.toLowerCase();
      if (tsLower.includes('just now') || tsLower.includes('today') || tsLower.includes('min') || tsLower.includes('hour') || tsLower.includes('sec')) {
        badgeTime = now.getTime();
      } else if (tsLower.includes('yesterday')) {
        badgeTime = todayStart - 1000;
      } else {
        const parsed = Date.parse(badge.timestamp);
        if (!isNaN(parsed)) badgeTime = parsed;
      }
    }

    if (!badgeTime) return true;

    if (filter === 'today') {
      return badgeTime >= todayStart;
    }
    if (filter === 'yesterday') {
      return badgeTime >= yesterdayStart && badgeTime < todayStart;
    }
    if (filter === 'week') {
      return badgeTime >= sevenDaysAgo;
    }
    if (filter === 'month') {
      return badgeTime >= monthStart;
    }

    return true;
  };

  const filteredBadges = badges.filter(badge => {
    const matchesCategory = activeFilter === 'all' || badge.badgeType === activeFilter;
    if (!matchesCategory) return false;
    return matchesDateFilter(badge, dateFilter);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Peer Appreciation & Caring Support
          </h2>
          <SocialTooltip
            icon="help"
            align="left"
            content="Celebrate peer contributions in real-time, send gratitude badges, and confidentially alert HR."
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Quick HR Navigation if user is HR/Admin */}
          {(userRole === 'hr_manager' || userRole === 'admin') && (
            <button
              onClick={() => setActiveTab('hr')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer ${isDarkMode
                  ? 'bg-[#181a22] border-[#2e323e] text-blue-400 hover:bg-[#20232e]'
                  : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                }`}
              title="Navigate to HR Executive Dashboard"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
              <span>Go to HR View</span>
            </button>
          )}

          {/* Suggest HR Check-In for Teammate */}
          <button
            onClick={() => setShowHrSuggest(!showHrSuggest)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${showHrSuggest
                ? isDarkMode
                  ? 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-rose-900/30'
                  : 'bg-rose-100 border-rose-400 text-rose-900 shadow-rose-200'
                : isDarkMode
                  ? 'bg-[#181a24] hover:bg-[#222533] text-rose-300 border-rose-800/80 shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300 shadow-xs'
              }`}
          >
            <UserCheck className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Suggest HR Check-In for Teammate</span>
          </button>
        </div>
      </div>

      {/* Suggest HR Check-In Box (Confidential - High Contrast & Clean in both modes) */}
      {showHrSuggest && (
        <div className={`enterprise-card p-6 sm:p-7 border shadow-xl rounded-2xl animate-fade-in relative overflow-hidden ${isDarkMode
            ? 'bg-[#151722] border-rose-900/70 text-white shadow-black/60'
            : 'bg-gradient-to-br from-rose-50/90 via-white to-rose-50/60 border-rose-300/80 text-slate-900 shadow-rose-500/10'
          }`}>
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-rose-100 text-rose-600 border border-rose-200'}`}>
              <ShieldAlert className="w-5 h-5 shrink-0" />
            </div>
            <h3 className={`text-base font-extrabold tracking-tight ${isDarkMode ? 'text-rose-100' : 'text-rose-950'}`}>
              Confidential Teammate Wellness Flag
            </h3>
            <span className="text-[10px] bg-rose-600 text-white font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              100% Anonymous
            </span>
            <SocialTooltip
              icon="help"
              align="left"
              content="Noticed a colleague struggling with heavy workload or burnout? Send a gentle note so HR can reach out with supportive wellness resources."
            />
          </div>

          {submittedSuccess ? (
            <div className={`p-4 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">✓</span>
                <span className="text-xs font-bold">Confidential wellness flag sent to HR! They will gently check in.</span>
              </div>
              {(userRole === 'hr_manager' || userRole === 'admin') && (
                <button
                  onClick={() => setActiveTab('hr')}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-200 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Open HR Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleHrSuggest} className="space-y-4">
              <div>
                <label className={`text-xs font-bold block mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  Teammate Name / Email
                </label>
                <input
                  type="text"
                  list="colleagues-list"
                  value={teammateName}
                  onChange={e => setTeammateName(e.target.value)}
                  placeholder="e.g. Elena Rostova or Nicole Arciaga"
                  className={`w-full rounded-xl px-4 py-3 text-xs font-medium transition-all border ${isDarkMode
                      ? 'bg-[#0f1118] border-[#2e323e] text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-900/40'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-xs focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                    }`}
                  required
                />
              </div>

              <div>
                <label className={`text-xs font-bold block mb-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  Optional Context for HR
                </label>
                <textarea
                  value={hrReason}
                  onChange={e => setHrReason(e.target.value)}
                  placeholder="e.g. Working very late every night this week, seems overwhelmed..."
                  className={`w-full rounded-xl px-4 py-3 text-xs font-medium transition-all border resize-none h-24 ${isDarkMode
                      ? 'bg-[#0f1118] border-[#2e323e] text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-900/40'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-xs focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                    }`}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className={`text-[11px] font-medium flex items-center gap-1.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>🛡️</span>
                  <span>Your identity and email will never be revealed to anyone.</span>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setShowHrSuggest(false)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 border ${isDarkMode
                        ? 'bg-[#202330] hover:bg-[#282c3d] text-slate-200 border-[#2e323e]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                  >
                    Send Confidential HR Request
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Main Grid: Send Badge + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Recognition Badge Form */}
        <div className={`enterprise-card p-6 border flex flex-col justify-between ${isDarkMode ? 'bg-[#202229] border-[#2e323d] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className={`p-2 rounded-xl border ${isDarkMode ? 'bg-amber-950/60 text-amber-400 border-amber-800' : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                <Award className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex items-center gap-1.5">
                <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Send Appreciation Badge
                </h3>
                <SocialTooltip
                  icon="help"
                  align="left"
                  content="Recognize teammates and sync peer appreciation live to the company database and feed."
                />
              </div>
            </div>

            <form onSubmit={handleSendBadge} className="space-y-4">
              <div>
                <label className={`text-xs font-bold block mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Recipient Teammate
                </label>
                <input
                  type="text"
                  list="colleagues-list"
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="e.g. Nicole Arciaga or type a name..."
                  className={`w-full rounded-xl px-4 py-2.5 text-xs transition-all border ${isDarkMode
                      ? 'bg-[#181a22] border-[#2e323e] text-white placeholder-slate-500 focus:border-amber-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:bg-white'
                    }`}
                  required
                />
                <datalist id="colleagues-list">
                  {availableColleagues.map(a => (
                    <option key={a.id} value={a.name}>
                      {a.name} ({a.department})
                    </option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className={`text-xs font-bold block mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Select Badge Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {badgeOptions.map(b => (
                    <button
                      key={b.type}
                      type="button"
                      onClick={() => setBadgeType(b.type)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${badgeType === b.type
                          ? isDarkMode
                            ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold shadow-xs'
                            : 'bg-amber-50 border-amber-400 text-amber-900 font-bold shadow-xs'
                          : isDarkMode
                            ? 'bg-[#181a22] border-[#2e323e] text-slate-300 hover:bg-[#20232e]'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                      <span className="text-xl">{b.icon}</span>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold truncate">{b.label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`text-xs font-bold block mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Appreciation Message
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Write a warm note of thanks..."
                  className={`w-full rounded-xl px-4 py-2.5 text-xs transition-all border resize-none h-24 ${isDarkMode
                      ? 'bg-[#181a22] border-[#2e323e] text-white placeholder-slate-500 focus:border-amber-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:bg-white'
                    }`}
                  required
                />
              </div>

              {/* Include Virtual Coffee Toggle */}
              <div
                onClick={() => setSendCoffee(!sendCoffee)}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isDarkMode
                    ? 'bg-[#181a22] border-[#2e323e] hover:border-amber-500/50'
                    : 'bg-slate-50 border-slate-200 hover:border-amber-300'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-amber-500" />
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    Include Virtual Coffee Voucher ☕
                  </span>
                </div>
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${sendCoffee ? 'bg-amber-500 border-amber-500' : isDarkMode ? 'border-slate-600' : 'border-slate-300'
                  }`}>
                  {sendCoffee && <span className="text-[10px] text-white font-bold">✓</span>}
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-white font-extrabold text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <Send className="w-4 h-4 fill-white" />
                <span>Send Appreciation Badge</span>
              </button>
            </form>
          </div>
        </div>

        {/* Appreciation Wall Feed */}
        <div className={`enterprise-card p-6 border lg:col-span-2 flex flex-col h-[600px] ${isDarkMode ? 'bg-[#202229] border-[#2e323d] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
          {/* Feed Title & Badges Filter Header */}
          <div className={`flex flex-col gap-3 pb-3 mb-3 border-b shrink-0 ${isDarkMode ? 'border-[#2e323e]' : 'border-slate-100'
            }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Company Gratitude & Recognition Feed
                </h3>
                <SocialTooltip
                  icon="help"
                  align="left"
                  content="Real-time timeline of company-wide peer badges, recognition messages, and coffee vouchers."
                />
              </div>

              {/* Badge Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(['all', 'lifesaver', 'focus_champion', 'team_anchor', 'positive_energy'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`text-[11px] px-2.5 py-1 rounded-full font-bold transition-all shrink-0 cursor-pointer ${activeFilter === f
                        ? 'bg-amber-500 text-white shadow-xs'
                        : isDarkMode
                          ? 'bg-[#181a22] text-slate-400 hover:text-white border border-[#2e323e]'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {f === 'all' ? `All (${badges.length})` : f === 'lifesaver' ? '🆘 Lifesaver' : f === 'focus_champion' ? '🎯 Focus' : f === 'team_anchor' ? '⚓ Anchor' : '🌟 Energy'}
                  </button>
                ))}
              </div>
            </div>

            {/* Time / Date Filter Bar (Today, Yesterday, This Week, This Month, All Time) */}
            <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t ${isDarkMode ? 'border-[#2a2e3b]' : 'border-slate-100'
              }`}>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <div className={`flex items-center gap-1 text-[11px] font-bold mr-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>Timeframe:</span>
                </div>
                {[
                  { key: 'all', label: 'All Time' },
                  { key: 'today', label: '📅 Today' },
                  { key: 'yesterday', label: '⏪ Yesterday' },
                  { key: 'week', label: '🗓️ This Week' },
                  { key: 'month', label: '📆 This Month' }
                ].map(t => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setDateFilter(t.key as any)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${dateFilter === t.key
                        ? isDarkMode
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-xs'
                          : 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                        : isDarkMode
                          ? 'bg-[#181a22] text-slate-400 hover:text-white border border-[#2e323e]'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Showing <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{filteredBadges.length}</strong> of {badges.length}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5">
            {badges.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-3">
                  <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
                </div>
                <h4 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  No Peer Appreciations Yet
                </h4>
                <p className={`text-xs max-w-sm mt-1.5 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Be the first to recognize a colleague! Use the form on the left to send an appreciation badge.
                </p>
              </div>
            ) : filteredBadges.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-3">
                  <Award className="w-7 h-7 text-amber-500" />
                </div>
                <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  No recognitions found for this timeframe
                </h4>
                <p className={`text-xs max-w-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Try switching to <button onClick={() => { setDateFilter('all'); setActiveFilter('all'); }} className="text-amber-500 underline font-bold cursor-pointer">All Time</button> or send a new badge!
                </p>
              </div>
            ) : (
              filteredBadges.map(badge => (
                <div
                  key={badge.id}
                  className={`p-4 rounded-xl border space-y-3 transition-all ${isDarkMode
                      ? 'bg-[#181a22] border-[#2e323e] hover:border-amber-500/50'
                      : 'bg-slate-50 border-slate-200 hover:border-amber-300'
                    }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={resolveAvatar(badge.senderName, badge.senderAvatar)}
                        alt={badge.senderName}
                        className="w-9 h-9 rounded-full border-2 border-blue-500 object-cover shrink-0 shadow-xs"
                      />
                      <div>
                        <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {badge.senderName}{' '}
                          <span className={`font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            recognized
                          </span>{' '}
                          <span className="text-amber-500 font-extrabold">{badge.recipientName}</span>
                        </p>
                        <span className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {badge.timestamp}
                        </span>
                      </div>
                    </div>

                    <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 shrink-0 ${isDarkMode
                        ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                        : 'bg-amber-50 text-amber-900 border-amber-200'
                      }`}>
                      {badge.badgeType === 'lifesaver' ? '🆘 Lifesaver' :
                        badge.badgeType === 'focus_champion' ? '🎯 Focus Champion' :
                          badge.badgeType === 'team_anchor' ? '⚓ Team Anchor' : '🌟 Positive Energy'}
                    </span>
                  </div>

                  <p className={`text-xs leading-relaxed p-3 rounded-lg border ${isDarkMode
                      ? 'bg-[#12141a] text-slate-200 border-[#262b3a]'
                      : 'bg-white text-slate-700 border-slate-200'
                    }`}>
                    "{badge.message}"
                  </p>

                  {badge.virtualCoffeeSent && (
                    <div className="flex items-center gap-2 text-[11px] font-bold text-amber-500">
                      <Coffee className="w-4 h-4 text-amber-500" />
                      <span>Virtual Coffee Voucher Included ☕</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
