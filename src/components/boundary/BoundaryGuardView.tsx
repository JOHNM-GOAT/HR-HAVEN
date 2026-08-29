'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import {
  Moon,
  Clock,
  Mail,
  BellOff,
  Bell,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

import { ElectricPlasmaShield } from './ElectricPlasmaShield';
import { Tooltip } from '../common/Tooltip';

export const BoundaryGuardView: React.FC = () => {
  const { boundaryConfig, toggleBoundaryShield, updateQuietHours, isDarkMode } = useWellness();
  const [startTime, setStartTime] = useState(boundaryConfig.quietHoursStart);
  const [endTime, setEndTime] = useState(boundaryConfig.quietHoursEnd);

  const heldMessages: { id: string; source: string; heldSince: string }[] = boundaryConfig.activeShield
    ? [
        { id: 'held-1', source: 'Slack: #engineering-sync (3 messages)', heldSince: '8:14 PM' },
        { id: 'held-2', source: 'Email: Q3 Release Roadmap Update', heldSince: '9:02 PM' },
        { id: 'held-3', source: 'Jira: Ticket #AX-204 Assignee update', heldSince: '10:15 PM' }
      ]
    : [];

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
              className={`text-xs font-bold px-3 py-1 rounded-full border transition-all cursor-pointer hover:scale-105 active:scale-95 ${boundaryConfig.activeShield
                ? isDarkMode
                  ? 'bg-blue-950/60 text-blue-300 border-blue-800'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
                : isDarkMode
                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              title="Click to toggle Shield status"
            >
              {boundaryConfig.activeShield ? 'ACTIVE' : 'PAUSED'}
            </button>
          </div>

          {/* Animated Electric Plasma Lightning Sphere */}
          <div className="my-3">
            <ElectricPlasmaShield />
          </div>

          {/* Bottom Rounded Pill Action Button matching Screenshot */}

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
                  content="Incoming Slack, email, and task notifications queued during quiet hours to protect your evening rest."
                />
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${isDarkMode ? 'bg-blue-950/60 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                {heldMessages.length} Held
              </span>
            </div>

            <div className={`p-4 rounded-xl border space-y-2 ${isDarkMode ? 'bg-[#1a1c22] border-[#2e323d]' : 'bg-slate-50 border-slate-200'
              }`}>
              {heldMessages.map(msg => (
                <div key={msg.id} className="flex items-center justify-between text-xs">
                  <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                    {msg.source}
                  </span>
                  <span className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    Held since {msg.heldSince}
                  </span>
                </div>
              ))}
            </div>
            <p className={`text-[11px] mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              All held notifications will automatically flush to your inbox tomorrow at {boundaryConfig.quietHoursEnd}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

