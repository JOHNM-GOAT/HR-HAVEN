'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWellness } from '../../context/WellnessContext';
import {
  Play,
  Pause,
  RotateCcw,
  Minimize2,
  Maximize2,
  X,
  Flame,
  Coffee,
  Sliders,
  Sparkles,
  GripHorizontal,
  Move
} from 'lucide-react';
import { CrystalWaveTimer } from './CrystalWaveTimer';

export const PomodoroOverlay: React.FC = () => {
  const {
    pomodoro,
    togglePomodoro,
    resetPomodoro,
    setPomodoroMode,
    togglePomodoroMinimized,
    closePomodoroOverlay,
    activeTab,
    setActiveTab,
    accessibility,
    isDarkMode
  } = useWellness();
  const isReduced = accessibility.reducedMotion;

  // Glide / Drag Position State (Free Floating Coordinates)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    hasMoved: boolean;
  }>({ startX: 0, startY: 0, origX: 0, origY: 0, hasMoved: false });

  // Initialize position near bottom-right on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && position === null) {
      const defaultX = Math.max(16, window.innerWidth - (pomodoro.isMinimized ? 220 : 340));
      const defaultY = Math.max(16, window.innerHeight - (pomodoro.isMinimized ? 90 : 420));
      setPosition({ x: defaultX, y: defaultY });
    }
  }, [position, pomodoro.isMinimized]);

  // Keep within bounds on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!position || typeof window === 'undefined') return;
      const rect = containerRef.current?.getBoundingClientRect();
      const width = rect?.width || 320;
      const height = rect?.height || 360;
      const maxX = Math.max(10, window.innerWidth - width - 16);
      const maxY = Math.max(10, window.innerHeight - height - 16);

      setPosition(prev => {
        if (!prev) return null;
        return {
          x: Math.min(Math.max(16, prev.x), maxX),
          y: Math.min(Math.max(16, prev.y), maxY)
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);

  // Dragging / Gliding Handlers
  const startDrag = (clientX: number, clientY: number) => {
    if (!position) return;
    setIsDragging(true);
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      origX: position.x,
      origY: position.y,
      hasMoved: false
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    const target = e.target as HTMLElement;
    // Don't drag if clicking interactive buttons or links
    if (target.closest('button') || target.closest('a') || target.closest('input')) {
      return;
    }
    startDrag(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input')) {
      return;
    }
    if (e.touches.length === 1) {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.hasMoved = true;
      }
      const rect = containerRef.current?.getBoundingClientRect();
      const width = rect?.width || 320;
      const height = rect?.height || 360;
      const nextX = Math.min(Math.max(16, dragRef.current.origX + dx), window.innerWidth - width - 16);
      const nextY = Math.min(Math.max(16, dragRef.current.origY + dy), window.innerHeight - height - 16);
      setPosition({ x: nextX, y: nextY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - dragRef.current.startX;
      const dy = e.touches[0].clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.hasMoved = true;
      }
      const rect = containerRef.current?.getBoundingClientRect();
      const width = rect?.width || 320;
      const height = rect?.height || 360;
      const nextX = Math.min(Math.max(16, dragRef.current.origX + dx), window.innerWidth - width - 16);
      const nextY = Math.min(Math.max(16, dragRef.current.origY + dy), window.innerHeight - height - 16);
      setPosition({ x: nextX, y: nextY });
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  // Automatically hide floating overlay on the Adaptive Focus Mode tab to avoid redundant timer graphics
  if (!pomodoro.isOverlayVisible || activeTab === 'inclusive') {
    return null;
  }

  const minutes = Math.floor(pomodoro.secondsRemaining / 60);
  const seconds = pomodoro.secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const progress = pomodoro.totalSeconds > 0
    ? ((pomodoro.totalSeconds - pomodoro.secondsRemaining) / pomodoro.totalSeconds) * 100
    : 0;

  // Render style based on dynamic position
  const positionStyle: React.CSSProperties = position
    ? {
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none'
      }
    : {
        position: 'fixed',
        bottom: '20px',
        right: '20px'
      };

  return (
    <aside
      ref={containerRef}
      aria-label="Glideable Pomodoro Focus Session"
      style={positionStyle}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`z-50 select-none transition-shadow duration-200 ${
        isDragging ? 'cursor-grabbing scale-[1.02]' : 'cursor-grab'
      }`}
    >
      {/* Outer Card Container */}
      <div
        className={`border shadow-2xl backdrop-blur-xl transition-colors ${
          pomodoro.isMinimized ? 'px-3.5 py-2.5 rounded-2xl' : 'p-5 rounded-3xl w-76 sm:w-80'
        } ${
          isDarkMode
            ? 'bg-[#202229]/98 border-[#2e323d] text-white shadow-black/80'
            : 'bg-white/98 border-slate-200 text-slate-900 shadow-2xl shadow-slate-900/15'
        } ${
          isDragging
            ? 'ring-2 ring-blue-500 shadow-blue-500/30'
            : pomodoro.isRunning
              ? isDarkMode
                ? 'ring-1 ring-blue-500/50'
                : 'ring-1 ring-blue-500/40'
              : ''
        }`}
      >
        {/* COMPACT PILL VIEW (Glideable) */}
        {pomodoro.isMinimized ? (
          <div className="flex items-center gap-2.5">
            {/* Grip Icon for Gliding */}
            <div className={`cursor-grab active:cursor-grabbing flex items-center pr-0.5 ${
              isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'
            }`} title="Glide / Drag overlay">
              <GripHorizontal className="w-3.5 h-3.5 opacity-70" />
            </div>

            {/* Status Icon */}
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                pomodoro.mode === 'break'
                  ? isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : isDarkMode ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}
            >
              {pomodoro.mode === 'break' ? (
                <Coffee className="w-3.5 h-3.5" />
              ) : (
                <Flame className={`w-3.5 h-3.5 ${pomodoro.isRunning ? 'animate-pulse' : ''}`} />
              )}
            </div>

            {/* Time & Mode */}
            <div className="flex flex-col">
              <span className={`text-xs font-black font-mono tracking-tight leading-none ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                {timeFormatted}
              </span>
              <span className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {pomodoro.mode === 'break' ? 'Break' : 'Focus'}
                {pomodoro.isRunning && <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${!isReduced ? 'animate-ping' : ''}`} />}
              </span>
            </div>

            {/* Quick Play/Pause */}
            <button
              onClick={togglePomodoro}
              className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer active:scale-95 ml-1"
              title={pomodoro.isRunning ? 'Pause' : 'Start Focus'}
            >
              {pomodoro.isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-white" />}
            </button>

            {/* Expand Button */}
            <button
              onClick={togglePomodoroMinimized}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
              }`}
              title="Expand to Full HUD"
            >
              <Maximize2 className="w-3 h-3" />
            </button>

            {/* Close */}
            <button
              onClick={closePomodoroOverlay}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDarkMode ? 'hover:bg-rose-950/40 text-slate-400 hover:text-rose-400' : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
              }`}
              title="Close Timer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          /* FULL EXPANDED HUD VIEW (Glideable) */
          <div className="space-y-4">
            {/* Top Drag Grip Bar */}
            <div className={`flex items-center justify-between pb-2.5 border-b ${
              isDarkMode ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing group">
                <div className={`p-1 transition-colors ${
                  isDarkMode ? 'text-slate-400 group-hover:text-blue-400' : 'text-slate-500 group-hover:text-blue-600'
                }`} title="Glide / Drag anywhere">
                  <Move className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold leading-none flex items-center gap-1.5 ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {pomodoro.mode === 'break' ? 'Restorative Break' : 'Deep Focus Block'}
                    {pomodoro.isRunning && (
                      <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${!isReduced ? 'animate-ping' : ''}`} />
                    )}
                  </h4>
                  <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Drag / Glide anywhere on screen
                  </p>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1">
                {/* Minimize to Pill */}
                <button
                  onClick={togglePomodoroMinimized}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                  }`}
                  title="Minimize to Pill"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>

                {/* Close */}
                <button
                  onClick={closePomodoroOverlay}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isDarkMode ? 'hover:bg-rose-950/40 text-slate-400 hover:text-rose-400' : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                  }`}
                  title="Close Timer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Center Crystal Glass Torus & Undulating Wave Timer */}
            <div className="flex flex-col items-center justify-center relative py-1">
              <CrystalWaveTimer size={190} />

              {/* 25m Focus / 5m Break Mode Switcher */}
              <div className={`flex items-center gap-1.5 mt-3 p-1 rounded-xl border ${
                isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  onClick={() => setPomodoroMode('focus')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    pomodoro.mode === 'focus'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  25m Focus
                </button>
                <button
                  onClick={() => setPomodoroMode('break')}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    pomodoro.mode === 'break'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  5m Break
                </button>
              </div>
            </div>

            {/* Action Buttons (Play/Pause & Reset) */}
            <div className="flex items-center gap-2">
              <button
                onClick={togglePomodoro}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-md active:scale-95 cursor-pointer ${
                  pomodoro.mode === 'break'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                }`}
              >
                {pomodoro.isRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{pomodoro.secondsRemaining === pomodoro.totalSeconds ? 'Start Session' : 'Resume'}</span>
                  </>
                )}
              </button>

              <button
                onClick={resetPomodoro}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                  isDarkMode
                    ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Shortcut Link */}
            <button
              onClick={() => setActiveTab('inclusive')}
              className={`w-full pt-2.5 border-t flex items-center justify-center gap-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                isDarkMode ? 'border-slate-800 text-blue-400 hover:text-blue-300' : 'border-slate-100 text-blue-600 hover:text-blue-700'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Open Adaptive Focus Suite</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
