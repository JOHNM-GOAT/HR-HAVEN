'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import {
  Moon,
  Clock,
  Mail,
  Inbox,
  Send,
  ShieldCheck
} from 'lucide-react';

import { ElectricPlasmaShield } from './ElectricPlasmaShield';
import { Tooltip } from '../common/Tooltip';
import { EmptyState } from '../common/EmptyState';
import { formatQuietHourLabel } from '../../types/wellness';

export const BoundaryGuardView: React.FC = () => {
  const {
    boundaryConfig,
    toggleBoundaryShield,
    updateQuietHours,
    isDarkMode,
    heldNotifications,
    isQuietHoursActive,
    isShieldHolding,
    releaseHeldNotifications
  } = useWellness();
  const [startTime, setStartTime] = useState(boundaryConfig.quietHoursStart);
  const [endTime, setEndTime] = useState(boundaryConfig.quietHoursEnd);

  const formatHeldSince = (heldAt: number) =>
    new Date(heldAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleSaveHours = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuietHours(startTime, endTime);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          After-Hours Communication & Disconnect Shield
        </h2>
        <Tooltip
          icon="help"
          align="left"
          content="Detects late-night emails and Slack messages past designated work hours, holding non-urgent notifications to protect rest & recovery."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Control Card with Electric Plasma Shield */}
        <div className={`enterprise-card p-6 border flex flex-col justify-between ${isDarkMode ? 'bg-[#202229] border-[#2e323d] text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}>
          {/* Top Header Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Moon className="w-5 h-5 text-blue-500" />
              <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Shield Status
              </h3>
              <Tooltip
                icon="help"
                align="left"
                content="Real-time status of your After-Hours Boundary Guard. When active, after-hours workplace alerts are safely held in queue."
              />
            </div>
            <button
              onClick={toggleBoundaryShield}
              className={`text-xs font-bold px-3 py-1 rounded-full border transition-all cursor-pointer hover:scale-105 active:scale-95 ${isShieldHolding
                ? isDarkMode
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : boundaryConfig.activeShield
                  ? isDarkMode
                    ? 'bg-blue-950/60 text-blue-300 border-blue-800'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                  : isDarkMode
                    ? 'bg-slate-800 text-slate-400 border-slate-700'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              title="Click to toggle Shield status"
            >
              {isShieldHolding ? 'HOLDING' : boundaryConfig.activeShield ? 'ARMED' : 'PAUSED'}
            </button>
          </div>

          {/* Animated Electric Plasma Lightning Sphere */}
          <div className="my-3">
            <ElectricPlasmaShield />
          </div>

        </div>

        {/* Quiet Hours & Delayed Queue Details */}
        <div className={`enterprise-card p-6 border lg:col-span-2 space-y-6 ${isDarkMode ? 'bg-[#202229] border-[#2e323d] text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
          {/* Quiet Hours Schedule Form */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className={`text-base font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                <Clock className="w-5 h-5 text-blue-500" />
                Quiet Hours Schedule
              </h3>
              <Tooltip
                icon="help"
                align="left"
                content="Set your personal quiet hours schedule to block evening work alerts and maintain healthy boundaries."
              />
            </div>

            <form onSubmit={handleSaveHours} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`text-xs font-bold block mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Evening Disconnect Start
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-colors border ${isDarkMode
                    ? 'bg-[#1a1c22] border-[#2e323d] text-white focus:bg-[#12141a]'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
                    }`}
                />
              </div>
              <div>
                <label className={`text-xs font-bold block mb-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Morning Re-engage End
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-colors border ${isDarkMode
                    ? 'bg-[#1a1c22] border-[#2e323d] text-white focus:bg-[#12141a]'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
                    }`}
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer active:scale-95"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>

          {/* Currently Held Messages Queue */}
          <div className={`pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <h4 className={`text-xs font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                  <Mail className="w-4 h-4 text-blue-500" />
                  Delayed Messages Queue (Held for Morning)
                </h4>
                <Tooltip
                  icon="help"
                  align="left"
                  content="In-app wellness and activity alerts intercepted during your quiet hours. Urgent items (clock-in/out, security, and account changes) are never held."
                />
              </div>
              <div className="flex items-center gap-2">
                {heldNotifications.length > 0 && (
                  <button
                    onClick={releaseHeldNotifications}
                    className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer active:scale-95 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    title="Deliver all held notifications now"
                  >
                    <Send className="w-3 h-3" />
                    Release Now
                  </button>
                )}
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${isDarkMode ? 'bg-blue-950/60 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                  {heldNotifications.length} Held
                </span>
              </div>
            </div>

            {heldNotifications.length === 0 ? (
              <EmptyState
                icon={isShieldHolding ? ShieldCheck : Inbox}
                iconAccent={isShieldHolding ? 'emerald' : 'slate'}
                size="sm"
                title={isShieldHolding ? 'Nothing held yet' : 'Queue is empty'}
                description={
                  isShieldHolding
                    ? 'Quiet hours are active — any non-urgent alert from now on waits here.'
                    : boundaryConfig.activeShield
                      ? `Alerts will start collecting here at ${formatQuietHourLabel(boundaryConfig.quietHoursStart)}.`
                      : 'Enable the shield to start holding non-urgent alerts during quiet hours.'
                }
              />
            ) : (
              <div className={`p-4 rounded-xl border space-y-2 max-h-56 overflow-y-auto ${isDarkMode ? 'bg-[#1a1c22] border-[#2e323d]' : 'bg-slate-50 border-slate-200'
                }`}>
                {heldNotifications.map(msg => (
                  <div key={msg.id} className="flex items-start justify-between gap-3 text-xs">
                    <span className={`font-semibold leading-snug ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      {msg.message}
                    </span>
                    <span className={`text-[10px] font-medium shrink-0 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      Held {formatHeldSince(msg.heldAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {heldNotifications.length > 0 && (
              <p className={`text-[11px] mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                These deliver automatically at {formatQuietHourLabel(boundaryConfig.quietHoursEnd)}, or release them now.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

