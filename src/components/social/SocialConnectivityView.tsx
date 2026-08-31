'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { PeerBadge } from '../../types/wellness';
import {
  Coffee,
  Send,
  UserCheck,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Tooltip } from '../common/Tooltip';
import { EmptyState } from '../common/EmptyState';

const stripYou = (name: string) => name.replace(/\s*\(You\)/gi, '').trim();

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

  const [recipient, setRecipient] = useState('');
  const [badgeType, setBadgeType] = useState<PeerBadge['badgeType']>('lifesaver');
  const [message, setMessage] = useState('');
  const [sendCoffee, setSendCoffee] = useState(true);

  const [showHrSuggest, setShowHrSuggest] = useState(false);
  const [teammateName, setTeammateName] = useState('');
  const [hrReason, setHrReason] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSendBadge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !message.trim()) return;
    // The recipient dropdown only lists eligible colleagues (admin already
    // excluded), so there's no freeform name to validate here anymore.
    sendPeerBadge(recipient, badgeType, message.trim(), sendCoffee);
    setMessage('');
    // Keep the recipient selected — this is a conversation, not a one-off form.
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

  const badgeOptions: { type: PeerBadge['badgeType']; label: string; icon: string }[] = [
    { type: 'lifesaver', label: 'Lifesaver', icon: '🆘' },
    { type: 'focus_champion', label: 'Focus Champion', icon: '🎯' },
    { type: 'team_anchor', label: 'Team Anchor', icon: '⚓' },
    { type: 'positive_energy', label: 'Positive Energy', icon: '🌟' }
  ];

  const badgeLabel = (type: PeerBadge['badgeType']) =>
    badgeOptions.find(b => b.type === type)?.label ?? type;

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
    const cleanName = stripYou(name).toLowerCase();
    const matched = accounts.find(
      a => a.name.toLowerCase() === cleanName || a.email.toLowerCase() === cleanName
    );
    return matched?.avatarUrl || fallbackAvatar;
  };

  // Private conversation: only badges exchanged between the current user and the
  // selected recipient, in either direction — not the company-wide feed. Reuses
  // the same badges array/API as before; this is a view-level filter, the same
  // privacy pattern the rest of the app already uses (e.g. anonymous mood logs)
  // rather than a new backend concept.
  const myName = stripYou(userProfile.name || '').toLowerCase();
  const conversation = recipient
    ? badges
        .filter(b => {
          const sender = stripYou(b.senderName).toLowerCase();
          const recip = stripYou(b.recipientName).toLowerCase();
          const other = recipient.toLowerCase();
          return (sender === myName && recip === other) || (sender === other && recip === myName);
        })
        .slice()
        .reverse() // badges are newest-first; a conversation reads oldest-first
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Peer Appreciation & Caring Support
          </h2>
          <Tooltip accent="amber"
            icon="help"
            align="left"
            content="Send a private appreciation note to a teammate, or confidentially alert HR."
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
            <h3 className={`text-base font-extrabold tracking-tight ${isDarkMode ? 'text-rose-100' : 'text-rose-950'}`}>
              Confidential Teammate Wellness Flag
            </h3>
            <span className="text-[10px] bg-rose-600 text-white font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              100% Anonymous
            </span>
            <Tooltip accent="amber"
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
                <datalist id="colleagues-list">
                  {availableColleagues.map(a => (
                    <option key={a.id} value={a.name}>
                      {a.name} ({a.department})
                    </option>
                  ))}
                </datalist>
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
                <div className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Your identity and email will never be revealed to anyone.
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

      {/* Peer Appreciation — a single bordered card: pick a teammate, see your
          private conversation with just them, and send a new note. Replaces the
          old two-panel form + company-wide feed layout. */}
      <div className={`enterprise-card border flex flex-col ${isDarkMode ? 'bg-[#202229] border-[#2e323d] text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        {/* Recipient selector */}
        <div className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center gap-3 ${isDarkMode ? 'border-[#2e323e]' : 'border-slate-100'}`}>
          <label htmlFor="recipient-select" className={`text-xs font-bold shrink-0 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Conversation with
          </label>
          <select
            id="recipient-select"
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all border cursor-pointer focus:outline-none ${isDarkMode
                ? 'bg-[#181a22] border-[#2e323e] text-white focus:border-amber-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500 focus:bg-white'
              }`}
          >
            <option value="">Select a teammate…</option>
            {availableColleagues.map(a => (
              <option key={a.id} value={a.name}>{a.name} · {a.department}</option>
            ))}
          </select>
          {recipient && (
            <span className={`text-[11px] font-semibold shrink-0 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {conversation.length} message{conversation.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {/* Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 min-h-[280px] max-h-[440px]">
          {!recipient ? (
            <EmptyState
              icon={UserCheck}
              iconAccent="amber"
              title="Select a teammate"
              description="Choose someone from the list above to see your private appreciation conversation with them."
            />
          ) : conversation.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              iconAccent="amber"
              size="sm"
              title={`No messages with ${recipient} yet`}
              description="Send the first appreciation note below to start the conversation."
            />
          ) : (
            conversation.map(badge => {
              const isMine = stripYou(badge.senderName).toLowerCase() === myName;
              return (
                <div key={badge.id} className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                  {!isMine && (
                    <img
                      src={resolveAvatar(badge.senderName, badge.senderAvatar)}
                      alt={badge.senderName}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mb-0.5"
                    />
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[65%] rounded-2xl p-3.5 border space-y-1.5 ${isMine
                        ? isDarkMode ? 'bg-amber-950/40 border-amber-800/60' : 'bg-amber-50 border-amber-200'
                        : isDarkMode ? 'bg-[#181a22] border-[#2e323e]' : 'bg-slate-50 border-slate-200'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-[#12141a] text-amber-300' : 'bg-white text-amber-800'}`}>
                        {badgeLabel(badge.badgeType)}
                      </span>
                      <span className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {badge.timestamp}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                      {badge.message}
                    </p>
                    {badge.virtualCoffeeSent && (
                      <p className="text-[10px] font-bold text-amber-500">☕ Coffee voucher included</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Compose */}
        <form
          onSubmit={handleSendBadge}
          className={`p-4 sm:p-5 border-t space-y-3 ${isDarkMode ? 'border-[#2e323e]' : 'border-slate-100'} ${!recipient ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {badgeOptions.map(b => (
              <button
                key={b.type}
                type="button"
                onClick={() => setBadgeType(b.type)}
                className={`px-2.5 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${badgeType === b.type
                    ? isDarkMode
                      ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                      : 'bg-amber-50 border-amber-400 text-amber-900'
                    : isDarkMode
                      ? 'bg-[#181a22] border-[#2e323e] text-slate-300 hover:bg-[#20232e]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
              >
                <span>{b.icon}</span>
                <span className="truncate">{b.label}</span>
              </button>
            ))}
          </div>

          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={recipient ? `Write a warm note to ${recipient}...` : 'Select a teammate first...'}
            disabled={!recipient}
            className={`w-full rounded-xl px-4 py-2.5 text-xs transition-all border resize-none h-20 focus:outline-none ${isDarkMode
                ? 'bg-[#181a22] border-[#2e323e] text-white placeholder-slate-500 focus:border-amber-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:bg-white'
              }`}
          />

          <div className="flex items-center justify-between gap-3">
            <label className={`flex items-center gap-2 cursor-pointer text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              <input
                type="checkbox"
                checked={sendCoffee}
                onChange={e => setSendCoffee(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
              />
              <Coffee className="w-4 h-4 text-amber-500" />
              <span>Include coffee voucher</span>
            </label>

            <button
              type="submit"
              disabled={!recipient || !message.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-white font-extrabold text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send className="w-3.5 h-3.5 fill-white" />
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
