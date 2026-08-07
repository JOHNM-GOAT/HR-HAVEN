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
  Sparkles
} from 'lucide-react';

export const SocialConnectivityView: React.FC = () => {
  const { badges, sendPeerBadge, suggestHrSupport } = useWellness();
  const [recipient, setRecipient] = useState('');
  const [badgeType, setBadgeType] = useState<PeerBadge['badgeType']>('lifesaver');
  const [message, setMessage] = useState('');
  const [sendCoffee, setSendCoffee] = useState(true);

  const [showHrSuggest, setShowHrSuggest] = useState(false);
  const [teammateName, setTeammateName] = useState('');
  const [hrReason, setHrReason] = useState('');

  const handleSendBadge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !message.trim()) return;
    sendPeerBadge(recipient, badgeType, message, sendCoffee);
    setRecipient('');
    setMessage('');
  };

  const handleHrSuggest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teammateName.trim()) return;
    suggestHrSupport(teammateName, hrReason);
    setShowHrSuggest(false);
    setTeammateName('');
    setHrReason('');
  };

  const badgeOptions: { type: PeerBadge['badgeType']; label: string; icon: string; desc: string }[] = [
    { type: 'lifesaver', label: 'Lifesaver', icon: '🛟', desc: 'Stepped in when work got heavy' },
    { type: 'focus_champion', label: 'Focus Champion', icon: '🎯', desc: 'Respected deep focus hours' },
    { type: 'team_anchor', label: 'Team Anchor', icon: '⚓', desc: 'Kept everyone grounded & supported' },
    { type: 'positive_energy', label: 'Positive Energy', icon: '☀️', desc: 'Brought optimism & kindness' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 inline-block mb-2">
            Social Connectivity Hub
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Peer Appreciation & Caring Support
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Build strong workplace connection by giving appreciation badges, virtual coffees, or privately suggesting HR support for a colleague.
          </p>
        </div>

        <button
          onClick={() => setShowHrSuggest(!showHrSuggest)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-rose-700 border border-rose-200 text-xs font-bold transition-all shadow-xs"
        >
          <UserCheck className="w-4 h-4 text-rose-600" />
          <span>Suggest HR Check-In for Teammate</span>
        </button>
      </div>

      {/* Suggest HR Check-In Box (Confidential) */}
      {showHrSuggest && (
        <div className="enterprise-card p-6 border border-rose-200 bg-rose-50/50 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="text-base font-bold text-slate-900">Confidential Teammate Wellness Flag</h3>
            <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200 font-bold">
              100% Anonymous
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            Noticed a colleague struggling with heavy workload or burnout? Send a gentle note so HR can reach out with supportive wellness resources.
          </p>

          <form onSubmit={handleHrSuggest} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Teammate Name / Email</label>
              <input
                type="text"
                value={teammateName}
                onChange={e => setTeammateName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Optional Context for HR</label>
              <textarea
                value={hrReason}
                onChange={e => setHrReason(e.target.value)}
                placeholder="e.g. Working very late every night this week, seems overwhelmed..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 h-20"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowHrSuggest(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
              >
                Send Confidential HR Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Send Badge + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Recognition Badge Form */}
        <div className="enterprise-card p-6 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">Send Appreciation Badge</h3>
            </div>

            <form onSubmit={handleSendBadge} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Recipient Teammate</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="e.g. Sarah Lin or David Chen"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Badge Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {badgeOptions.map(b => (
                    <button
                      key={b.type}
                      type="button"
                      onClick={() => setBadgeType(b.type)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        badgeType === b.type
                          ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xl">{b.icon}</span>
                      <span className="text-xs">{b.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Appreciation Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Write a warm note of thanks..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white h-24"
                  required
                />
              </div>

              {/* Include Virtual Coffee Toggle */}
              <div 
                onClick={() => setSendCoffee(!sendCoffee)}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-amber-600" />
                  <span className="text-xs text-slate-800 font-bold">Include Virtual Coffee Voucher ☕</span>
                </div>
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${sendCoffee ? 'bg-amber-500 border-amber-500' : 'border-slate-300'}`}>
                  {sendCoffee && <span className="text-[10px] text-white font-bold">✓</span>}
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs transition-all shadow-xs"
              >
                <Send className="w-4 h-4 fill-white" />
                <span>Send Appreciation Badge</span>
              </button>
            </form>
          </div>
        </div>

        {/* Appreciation Wall Feed */}
        <div className="enterprise-card p-6 border border-slate-200 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Company Gratitude & Recognition Feed
              </h3>
              <span className="text-xs text-slate-500">Live Team Feed</span>
            </div>

            <div className="space-y-4">
              {badges.map(badge => (
                <div key={badge.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={badge.senderAvatar} alt={badge.senderName} className="w-8 h-8 rounded-full border border-blue-400" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {badge.senderName} <span className="text-slate-500 font-normal">recognized</span> {badge.recipientName}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium">{badge.timestamp}</span>
                      </div>
                    </div>

                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1.5">
                      {badge.badgeType === 'lifesaver' ? '🛟 Lifesaver' :
                       badge.badgeType === 'focus_champion' ? '🎯 Focus Champion' :
                       badge.badgeType === 'team_anchor' ? '⚓ Team Anchor' : '☀️ Positive Energy'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                    "{badge.message}"
                  </p>

                  {badge.virtualCoffeeSent && (
                    <div className="flex items-center gap-2 text-[11px] font-bold text-amber-800">
                      <Coffee className="w-4 h-4 text-amber-600" />
                      <span>Virtual Coffee Voucher Included ☕</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
