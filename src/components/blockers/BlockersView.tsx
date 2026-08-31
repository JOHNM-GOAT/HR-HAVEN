'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { BLOCKER_SEVERITY_CONFIG, BlockerSeverity, getBurnoutRiskConfig } from '../../types/wellness';
import { AlertTriangle, CheckCircle2, Send } from 'lucide-react';
import { Tooltip } from '../common/Tooltip';
import { EmptyState } from '../common/EmptyState';

export const BlockersView: React.FC = () => {
  const { blockers, addBlocker, resolveBlocker, burnoutMetrics, isDarkMode } = useWellness();
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<BlockerSeverity>('medium');

  const activeBlockers = blockers.filter(b => !b.resolvedAt);
  const resolvedBlockers = blockers.filter(b => b.resolvedAt).slice(0, 10);
  const riskConfig = getBurnoutRiskConfig(burnoutMetrics.riskLevel);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    addBlocker(description, severity);
    setDescription('');
    setSeverity('medium');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Workflow Blockers
          </h2>
          <Tooltip
            icon="help"
            align="left"
            content="Log anything actively getting in the way of your work — a dependency, an outage, unclear requirements. Each active blocker raises your Burnout Risk score by its severity weight; resolving it gives that score back."
          />
        </div>

        <div className={`px-4 py-2.5 rounded-xl border flex items-center gap-3 ${riskConfig.badgeBg}`}>
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {activeBlockers.length} active blocker{activeBlockers.length === 1 ? '' : 's'}
            </p>
            <p className="text-[11px] font-semibold opacity-90">
              Contributing to a {burnoutMetrics.overallScore}/100 risk score ({riskConfig.label})
            </p>
          </div>
        </div>
      </div>

      {/* Log a Blocker */}
      <div className={`enterprise-card p-5 sm:p-6 border ${isDarkMode ? 'bg-[#16181f] border-slate-800' : 'bg-white border-slate-200'}`}>
        <h3 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Log a new blocker</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What's blocking you? e.g. Waiting on API access from the platform team"
            rows={3}
            maxLength={300}
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
              isDarkMode ? 'bg-[#1c1e26] border-slate-700 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
            }`}
          />

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              {(Object.keys(BLOCKER_SEVERITY_CONFIG) as BlockerSeverity[]).map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSeverity(level)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    severity === level
                      ? BLOCKER_SEVERITY_CONFIG[level].badgeBg
                      : isDarkMode ? 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-600' : 'bg-transparent border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {BLOCKER_SEVERITY_CONFIG[level].label}
                  <span className="opacity-70"> (+{BLOCKER_SEVERITY_CONFIG[level].scoreWeight})</span>
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!description.trim()}
              className="sm:ml-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              Log Blocker
            </button>
          </div>
        </form>
      </div>

      {/* Active Blockers */}
      <div className={`enterprise-card p-5 sm:p-6 border ${isDarkMode ? 'bg-[#16181f] border-slate-800' : 'bg-white border-slate-200'}`}>
        <h3 className={`text-sm font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Active blockers</h3>
        {activeBlockers.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            iconAccent="emerald"
            title="Nothing blocking you right now"
            description="Log one above the moment something starts slowing you down."
            size="sm"
          />
        ) : (
          <div className="space-y-2.5">
            {activeBlockers.map(blocker => (
              <div
                key={blocker.id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 ${isDarkMode ? 'bg-[#12141a] border-[#262b3a]' : 'bg-slate-50 border-slate-200'}`}
              >
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${BLOCKER_SEVERITY_CONFIG[blocker.severity].dotColor}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${BLOCKER_SEVERITY_CONFIG[blocker.severity].badgeBg}`}>
                      {BLOCKER_SEVERITY_CONFIG[blocker.severity].label}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">+{blocker.scoreImpact} risk</span>
                  </div>
                  <p className={`text-sm mt-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{blocker.description}</p>
                </div>
                <button
                  onClick={() => resolveBlocker(blocker.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                    isDarkMode ? 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Resolve
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Resolved */}
      {resolvedBlockers.length > 0 && (
        <div className={`enterprise-card p-5 sm:p-6 border ${isDarkMode ? 'bg-[#16181f] border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className={`text-sm font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Recently resolved</h3>
          <div className="space-y-2">
            {resolvedBlockers.map(blocker => (
              <div key={blocker.id} className="flex items-center gap-3 text-sm opacity-60">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className={`line-through truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{blocker.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
