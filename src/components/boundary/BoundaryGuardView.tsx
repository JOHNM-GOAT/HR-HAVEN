'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { 
  Moon, 
  Clock, 
  Mail, 
  BellOff
} from 'lucide-react';

export const BoundaryGuardView: React.FC = () => {
  const { boundaryConfig, toggleBoundaryShield, updateQuietHours } = useWellness();
  const [startTime, setStartTime] = useState(boundaryConfig.quietHoursStart);
  const [endTime, setEndTime] = useState(boundaryConfig.quietHoursEnd);

  const handleSaveHours = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuietHours(startTime, endTime);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-block mb-2">
          Work-Life Boundary Guard
        </span>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          After-Hours Communication & Disconnect Shield
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Detects late-night emails and Slack messages past designated work hours, holding non-urgent notifications to protect rest & recovery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Control Card */}
        <div className="enterprise-card p-6 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Shield Status</h3>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                boundaryConfig.activeShield 
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}>
                {boundaryConfig.activeShield ? 'ACTIVE' : 'PAUSED'}
              </span>
            </div>

            <div className="my-6 text-center">
              <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center border-4 transition-all ${
                boundaryConfig.activeShield 
                  ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm'
                  : 'border-slate-200 bg-slate-100 text-slate-400'
              }`}>
                <BellOff className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mt-4">
                {boundaryConfig.activeShield ? 'Boundary Shield Engaged' : 'Shield Disabled'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {boundaryConfig.activeShield 
                  ? `Late notifications held between ${boundaryConfig.quietHoursStart} - ${boundaryConfig.quietHoursEnd}`
                  : 'Notifications will arrive immediately anytime.'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleBoundaryShield}
            className={`w-full py-3 rounded-xl font-bold text-xs transition-all shadow-xs ${
              boundaryConfig.activeShield
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {boundaryConfig.activeShield ? 'Pause Boundary Guard' : 'Enable Boundary Guard'}
          </button>
        </div>

        {/* Quiet Hours & Delayed Queue Details */}
        <div className="enterprise-card p-6 border border-slate-200 lg:col-span-2 space-y-6">
          {/* Quiet Hours Schedule Form */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Quiet Hours Schedule
            </h3>
            <p className="text-xs text-slate-500 mb-4">Set your personal quiet hours to block evening work alerts.</p>

            <form onSubmit={handleSaveHours} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Evening Disconnect Start</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Morning Re-engage End</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>

          {/* Currently Held Messages Queue */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                Delayed Messages Queue (Held for Morning)
              </h4>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {boundaryConfig.delayedMessagesCount} Held
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-800 font-semibold">Slack: #engineering-sync (3 messages)</span>
                <span className="text-[10px] text-slate-400 font-medium">Held since 8:14 PM</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-800 font-semibold">Email: Q3 Release Roadmap Update</span>
                <span className="text-[10px] text-slate-400 font-medium">Held since 9:02 PM</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-800 font-semibold">Jira: Ticket #AX-204 Assignee update</span>
                <span className="text-[10px] text-slate-400 font-medium">Held since 10:15 PM</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              All held notifications will automatically flush to your inbox tomorrow at {boundaryConfig.quietHoursEnd}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
