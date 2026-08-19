'use client';

import React, { useState } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { Plus, Minus, RotateCcw, Sparkles, Check } from 'lucide-react';

export const WaterBottleChamber: React.FC = () => {
  const { waterCups, logWaterCup, removeWaterCup, resetWaterCups, isDarkMode, accessibility } = useWellness();
  const [isSplashing, setIsSplashing] = useState(false);
  const isReduced = accessibility.reducedMotion;

  const targetCups = 10;
  const fillPercent = Math.min(100, Math.max(0, (waterCups / targetCups) * 100));
  const isGoalReached = waterCups >= targetCups;

  const handleClickChamber = () => {
    if (!isReduced) setIsSplashing(true);
    logWaterCup();
    if (!isReduced) setTimeout(() => setIsSplashing(false), 600);
  };

  return (
    <div className="w-full flex flex-col items-center select-none py-2">
      {/* Top Header Row matching Reference Screenshot (Today 6 cups | 60% | Goal 10 cups) */}
      <div className="w-full max-w-[340px] xs:max-w-[380px] sm:max-w-[420px] md:max-w-[460px] flex items-end justify-between px-3 mb-2">
        {/* Left: Today Cups */}
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 font-medium tracking-wide">Today</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl sm:text-3xl font-black text-[#38bdf8] font-mono leading-none">
              {waterCups}
            </span>
            <span className="text-sm font-bold text-[#38bdf8]">cups</span>
          </div>
        </div>

        {/* Center: Percentage */}
        <div className="pb-0.5">
          <span className="text-xs sm:text-sm font-bold text-slate-400 font-mono tracking-wide">
            {Math.round(fillPercent)}%
          </span>
        </div>

        {/* Right: Goal Cups */}
        <div className="flex flex-col items-end text-right">
          <span className="text-xs text-slate-400 font-medium tracking-wide">Goal</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl sm:text-3xl font-black text-[#38bdf8] font-mono leading-none">
              {targetCups}
            </span>
            <span className="text-sm font-bold text-[#38bdf8]">cups</span>
          </div>
        </div>
      </div>

      {/* Water Capsule / Horizontal Bottle Container */}
      <div className="w-full flex items-center justify-center my-2">
        <div
          onClick={handleClickChamber}
          role="button"
          tabIndex={0}
          aria-label="Log 1 Cup of Water"
          title="Click capsule to log +1 cup of water!"
          className={`relative group cursor-pointer flex items-center transition-transform active:scale-[0.98] ${
            isSplashing ? 'scale-[1.02]' : ''
          }`}
        >
          {/* Main Capsule Chamber Body */}
          <div
            className={`relative w-64 xs:w-76 sm:w-88 md:w-96 h-14 sm:h-16 rounded-l-3xl rounded-r-xl p-1.5 border-4 shadow-2xl transition-all overflow-hidden ${
              isDarkMode
                ? 'bg-[#12141a] border-[#2c313f] shadow-black/80'
                : 'bg-slate-900 border-slate-700 shadow-xl'
            } ring-2 ring-black/40`}
          >
            {/* Dark Empty Chamber Interior Cavity */}
            <div className="w-full h-full rounded-l-2xl rounded-r-lg bg-[#0e1017] relative overflow-hidden flex items-center">
              {/* Measurement Volume Tick Marks */}
              <div className="absolute inset-0 z-20 pointer-events-none flex justify-between px-4 sm:px-6 items-end pb-1 opacity-25">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 h-2 bg-white/70 rounded-full"
                    title={`Cup ${i + 1}`}
                  />
                ))}
              </div>

              {/* Glowing Water Fluid Layer */}
              <div
                className="h-full rounded-l-2xl rounded-r-sm bg-gradient-to-r from-[#60a5fa] via-[#38bdf8] to-[#2563eb] transition-all duration-700 ease-out relative flex items-center overflow-hidden"
                style={{
                  width: `${fillPercent}%`,
                  boxShadow: fillPercent > 0 ? '0 0 25px rgba(56, 189, 248, 0.6), inset 0 0 12px rgba(255, 255, 255, 0.4)' : 'none'
                }}
              >
                {/* Floating Animated Bubbles inside Liquid (Disabled in Clutter Reduction) */}
                {fillPercent > 0 && !isReduced && (
                  <>
                    <span className="absolute left-[15%] bottom-2 w-2.5 h-2.5 rounded-full bg-white/70 shadow-xs animate-bounce" style={{ animationDuration: '2.2s' }} />
                    <span className="absolute left-[35%] top-2 w-1.5 h-1.5 rounded-full bg-white/80 shadow-xs animate-pulse" style={{ animationDuration: '1.6s' }} />
                    <span className="absolute left-[55%] bottom-3 w-3 h-3 rounded-full bg-white/60 shadow-xs animate-bounce" style={{ animationDuration: '2.8s' }} />
                    <span className="absolute left-[75%] top-2.5 w-2 h-2 rounded-full bg-white/75 shadow-xs animate-pulse" style={{ animationDuration: '2s' }} />
                    <span className="absolute left-[88%] bottom-1.5 w-1.5 h-1.5 rounded-full bg-white/90 shadow-xs animate-bounce" style={{ animationDuration: '1.9s' }} />
                  </>
                )}

                {/* Vertical Water Edge Shimmer / Meniscus */}
                {fillPercent > 0 && fillPercent < 100 && (
                  <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/60 blur-[1px] rounded-r-full shadow-lg" />
                )}
              </div>

              {/* Top Glass Gloss Reflection Sheen */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none rounded-t-2xl z-20" />

              {/* Bottom Subtle Glass Specular Line */}
              <div className="absolute inset-x-2 bottom-0.5 h-px bg-white/15 pointer-events-none z-20" />
            </div>
          </div>

          {/* Right Metallic Bottle Cap / Nozzle with Loop (Just like the reference photo!) */}
          <div className="relative shrink-0 flex items-center -ml-0.5 z-10">
            {/* Main Cap Cylinder */}
            <div className="w-4 sm:w-5 h-9 sm:h-10 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 rounded-r-md border-y-2 border-r-2 border-slate-500 shadow-md flex items-center justify-center relative">
              {/* Cap Grips */}
              <div className="w-full h-full flex flex-col justify-around py-1 opacity-40">
                <div className="h-0.5 w-full bg-slate-900" />
                <div className="h-0.5 w-full bg-slate-900" />
                <div className="h-0.5 w-full bg-slate-900" />
              </div>
            </div>

            {/* Cap Nozzle Loop / Latch Handle */}
            <div className="w-2.5 sm:w-3.5 h-5 sm:h-6 border-2 border-slate-400 rounded-r-full bg-slate-800/80 shadow-xs -ml-0.5 flex items-center justify-center">
              <div className="w-1 h-2 rounded-full bg-slate-900/60" />
            </div>
          </div>

          {/* Click Ripple / Splash Indicator */}
          {isSplashing && (
            <div className="absolute inset-0 rounded-3xl border-2 border-cyan-400 animate-ping pointer-events-none" />
          )}
        </div>
      </div>

      {/* Action Controls & Logging Buttons below */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-3">
        {/* Remove Cup Button */}
        <button
          onClick={removeWaterCup}
          disabled={waterCups <= 0}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
            waterCups <= 0 ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'
          } ${
            isDarkMode
              ? 'bg-[#1a1c22] border-[#2e323d] text-slate-300 hover:bg-[#262933]'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
          title="Remove 1 Cup"
          aria-label="Remove 1 Cup"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Primary "+ Log 1 Cup" Button */}
        <button
          onClick={handleClickChamber}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-md active:scale-95 cursor-pointer ${
            isGoalReached
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
          }`}
        >
          {isGoalReached ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isGoalReached ? `Daily Goal Completed (${targetCups}/${targetCups})!` : '+ Log 1 Cup (250ml)'}</span>
          {isGoalReached && <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />}
        </button>

        {/* Reset Tracker Button */}
        <button
          onClick={resetWaterCups}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
            isDarkMode
              ? 'bg-[#1a1c22] border-[#2e323d] text-slate-400 hover:text-slate-200 hover:bg-[#262933]'
              : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200'
          }`}
          title="Reset Hydration"
          aria-label="Reset Hydration"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Helpful Hydration Goal Hint */}
      <p className={`text-[11px] font-medium mt-2 text-center ${
        isDarkMode ? 'text-slate-400' : 'text-slate-500'
      }`}>
        {isGoalReached ? (
          <span className="text-emerald-400 font-bold">🎉 Outstanding hydration! You reached your {targetCups * 0.25}L daily intake goal.</span>
        ) : (
          <span>💧 Tap the capsule bottle or click <strong className="text-blue-500">+ Log 1 Cup</strong> to fill your water level.</span>
        )}
      </p>
    </div>
  );
};
