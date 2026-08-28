'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { Layers, ChevronDown, ChevronUp, X, Bell } from 'lucide-react';

export const BatchedToast: React.FC = () => {
  const { batchedNotifications, isBatchDigestVisible, dismissBatchDigest, isDarkMode } = useWellness();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isBatchDigestVisible || batchedNotifications.length === 0) return null;

  const count = batchedNotifications.length;
  const latestThree = batchedNotifications.slice(-3).reverse();

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 rounded-2xl border shadow-2xl transition-all duration-300 ${
        isExpanded ? 'w-96 max-w-[calc(100vw-2rem)]' : 'max-w-md'
      } ${
        isDarkMode
          ? 'bg-[#151722] border-[#2d3242] text-white shadow-black/80'
          : 'bg-white border-slate-200 text-slate-900 shadow-xl'
      }`}
    >
      {/* Header Row */}
      <div
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors rounded-t-2xl ${
          isDarkMode ? 'hover:bg-[#1c1f2e]' : 'hover:bg-slate-50'
        } ${!isExpanded ? 'rounded-b-2xl' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="relative">
          <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-950/60' : 'bg-blue-50'}`}>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-blue-500 text-white text-[9px] font-extrabold flex items-center justify-center">
            {count}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold">
            📋 {count} Batched Notification{count !== 1 ? 's' : ''}
          </p>
          <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Queued during focus — tap to {isExpanded ? 'collapse' : 'review'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              dismissBatchDigest();
            }}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Dismiss & Clear All"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Notification List */}
      {isExpanded && (
        <div className={`px-4 pb-3 border-t ${isDarkMode ? 'border-[#2d3242]' : 'border-slate-100'}`}>
          <div className="max-h-60 overflow-y-auto space-y-2 mt-3">
            {batchedNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all ${
                  isDarkMode
                    ? 'bg-[#1b1e2a] border-[#292d3b]'
                    : 'bg-slate-50 border-slate-100'
                }`}
              >
                <Bell className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] leading-relaxed">{notif.message}</p>
                  <span className={`text-[9px] mt-1 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {formatTime(notif.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-between pt-2.5 mt-2 border-t ${isDarkMode ? 'border-[#2d3242]' : 'border-slate-100'}`}>
            <span className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Next digest in ~60s
            </span>
            <button
              onClick={dismissBatchDigest}
              className="text-[10px] font-bold text-blue-500 hover:text-blue-400 cursor-pointer transition-colors"
            >
              Clear All & Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Collapsed Preview — show latest notification text */}
      {!isExpanded && (
        <div className={`px-4 pb-3 -mt-1`}>
          <p className={`text-[10px] truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Latest: {latestThree[0]?.message}
          </p>
        </div>
      )}
    </div>
  );
};
