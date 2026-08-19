'use client';

import React from 'react';
import { useWellness } from '../../context/WellnessContext';

interface CrystalWaveTimerProps {
  size?: number; // width & height in px, defaults to 220
  showControls?: boolean;
}

export const CrystalWaveTimer: React.FC<CrystalWaveTimerProps> = ({
  size = 220,
}) => {
  const { pomodoro, isDarkMode, togglePomodoro, accessibility } = useWellness();
  const isReduced = accessibility.reducedMotion;
  const minutes = Math.floor(pomodoro.secondsRemaining / 60);
  const seconds = pomodoro.secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isLight = !isDarkMode;

  // Wave color scheme based on break or focus mode
  const isBreak = pomodoro.mode === 'break';
  const isRunning = pomodoro.isRunning;

  return (
    <div
      onClick={togglePomodoro}
      role="button"
      tabIndex={0}
      title={isRunning ? 'Click to Pause Timer' : 'Click to Start Timer'}
      className={`relative flex items-center justify-center cursor-pointer select-none group transition-transform duration-300 ${
        isReduced ? '' : 'hover:scale-105 active:scale-95'
      }`}
      style={{ width: size, height: size }}
    >
      {/* Outer Soft Ambient Luminous Halo (Hidden in Clutter Reduction) */}
      {!isReduced && (
        <div
          className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${
            isRunning
              ? isBreak
                ? 'bg-emerald-400/25 blur-2xl scale-110 animate-pulse'
                : 'bg-sky-400/30 blur-2xl scale-110 animate-pulse'
              : isLight
                ? 'bg-blue-200/30 blur-xl scale-100'
                : 'bg-blue-900/20 blur-xl scale-100'
          }`}
        />
      )}

      {/* SVG Crystal Glass Torus Ring with Undulating Sine Wave Ribbon & Sparkles */}
      <svg
        viewBox="0 0 240 240"
        className="w-full h-full relative z-10"
      >
        <defs>
          {/* Glass Outer Torus Gradient */}
          <radialGradient id="glass-torus-grad" cx="50%" cy="50%" r="50%">
            <stop offset="55%" stopColor={isLight ? '#ffffff' : '#1e293b'} stopOpacity="0.9" />
            <stop offset="68%" stopColor={isBreak ? '#a7f3d0' : '#bae6fd'} stopOpacity="0.85" />
            <stop offset="82%" stopColor={isBreak ? '#34d399' : '#60a5fa'} stopOpacity="0.7" />
            <stop offset="92%" stopColor={isBreak ? '#059669' : '#3b82f6'} stopOpacity="0.85" />
            <stop offset="100%" stopColor={isBreak ? '#065f46' : '#1d4ed8'} stopOpacity="0.95" />
          </radialGradient>

          {/* Top Glass Specular Reflection Highlight */}
          <linearGradient id="glass-specular" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#93c5fd" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.6" />
          </linearGradient>

          {/* Glowing Silk Ribbon Filter */}
          <filter id="silk-wave-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="blur1" />
            <feGaussianBlur stdDeviation="1.5" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Sparkle Glint Filter */}
          <filter id="sparkle-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Torus Glass Shading Base */}
        <circle
          cx="120"
          cy="120"
          r="105"
          fill="url(#glass-torus-grad)"
          className="transition-all duration-500"
        />

        {/* Outer Rim Crisp Border */}
        <circle
          cx="120"
          cy="120"
          r="105"
          fill="none"
          stroke={isLight ? '#93c5fd' : '#3b82f6'}
          strokeWidth="2"
          opacity="0.8"
        />

        {/* Specular Crescent Highlight on Top-Left */}
        <path
          d="M 35 120 A 85 85 0 0 1 205 120 A 105 105 0 0 0 35 120 Z"
          fill="url(#glass-specular)"
          opacity="0.55"
        />

        {/* Animated Undulating Luminous Sine Wave Energy Ribbon (Rotating smoothly when not in reduced motion) */}
        <g
          className={isRunning && !isReduced ? 'animate-spin' : ''}
          style={{ transformOrigin: '120px 120px', animationDuration: '16s' }}
        >
          {/* Main Glowing Sine-Wave Silk Ribbon (8 smooth harmonic wave lobes around the ring) */}
          <path
            d="
              M 120 40 
              C 138 34, 154 48, 168 56
              C 182 64, 198 78, 194 98
              C 190 118, 172 130, 178 150
              C 184 170, 172 186, 152 194
              C 132 202, 118 188, 98 194
              C 78 200, 62 184, 56 166
              C 50 148, 66 132, 60 112
              C 54 92, 70 76, 88 68
              C 106 60, 102 46, 120 40 Z
            "
            fill="none"
            stroke="#ffffff"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#silk-wave-glow)"
            opacity="0.95"
          />

          {/* Secondary Soft Cyan/Blue Echo Wave Ribbon */}
          <path
            d="
              M 120 44
              C 136 38, 150 50, 164 58
              C 178 66, 192 78, 188 96
              C 184 114, 168 126, 174 144
              C 180 162, 168 178, 148 186
              C 128 194, 116 182, 98 188
              C 80 194, 66 180, 60 164
              C 54 148, 68 134, 62 116
              C 56 98, 72 82, 88 74
              C 104 66, 104 50, 120 44 Z
            "
            fill="none"
            stroke={isBreak ? '#6ee7b7' : '#93c5fd'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#silk-wave-glow)"
            opacity="0.5"
          />

          {/* Constellation Diamond Sparkles scattered along the ribbon */}
          {/* Sparkle 1: Top Right */}
          <path
            d="M 168 56 L 170 52 L 172 56 L 176 58 L 172 60 L 170 64 L 168 60 L 164 58 Z"
            fill="#ffffff"
            filter="url(#sparkle-glow)"
          />
          {/* Sparkle 2: Far Right */}
          <path
            d="M 194 98 L 195 95 L 196 98 L 199 99 L 196 100 L 195 103 L 194 100 L 191 99 Z"
            fill="#ffffff"
            filter="url(#sparkle-glow)"
          />
          {/* Sparkle 3: Bottom Right */}
          <path
            d="M 178 150 L 180 146 L 182 150 L 186 152 L 182 154 L 180 158 L 178 154 L 174 152 Z"
            fill="#ffffff"
            filter="url(#sparkle-glow)"
          />
          {/* Sparkle 4: Bottom */}
          <path
            d="M 120 196 L 121 193 L 122 196 L 125 197 L 122 198 L 121 201 L 120 198 L 117 197 Z"
            fill="#ffffff"
            filter="url(#sparkle-glow)"
          />
          {/* Sparkle 5: Bottom Left */}
          <path
            d="M 56 166 L 58 162 L 60 166 L 64 168 L 60 170 L 58 174 L 56 170 L 52 168 Z"
            fill="#ffffff"
            filter="url(#sparkle-glow)"
          />
          {/* Sparkle 6: Far Left */}
          <path
            d="M 60 112 L 61 109 L 62 112 L 65 113 L 62 114 L 61 117 L 60 114 L 57 113 Z"
            fill="#ffffff"
            filter="url(#sparkle-glow)"
          />
          {/* Sparkle 7: Top Left */}
          <path
            d="M 88 68 L 90 64 L 92 68 L 96 70 L 92 72 L 90 76 L 88 72 L 84 70 Z"
            fill="#ffffff"
            filter="url(#sparkle-glow)"
          />
          {/* Sparkle 8: Top */}
          <path
            d="M 120 40 L 121 37 L 122 40 L 125 41 L 122 42 L 121 45 L 120 42 L 117 41 Z"
            fill="#ffffff"
            filter="url(#sparkle-glow)"
          />

          {/* Micro Stardust Dots */}
          <circle cx="145" cy="45" r="1.5" fill="#ffffff" opacity="0.9" />
          <circle cx="185" cy="75" r="1.8" fill="#ffffff" opacity="0.9" />
          <circle cx="188" cy="125" r="1.5" fill="#ffffff" opacity="0.9" />
          <circle cx="165" cy="175" r="1.8" fill="#ffffff" opacity="0.9" />
          <circle cx="100" cy="195" r="1.5" fill="#ffffff" opacity="0.9" />
          <circle cx="70" cy="180" r="1.8" fill="#ffffff" opacity="0.9" />
          <circle cx="55" cy="135" r="1.5" fill="#ffffff" opacity="0.9" />
          <circle cx="72" cy="85" r="1.8" fill="#ffffff" opacity="0.9" />
        </g>

        {/* Inner Hole Center Disc (Crisp Background for 25:00 digits) */}
        <circle
          cx="120"
          cy="120"
          r="54"
          fill={isLight ? '#ffffff' : '#171922'}
          stroke={isLight ? '#e2e8f0' : '#2e323d'}
          strokeWidth="1.5"
          className="shadow-inner"
        />

        {/* Inner Circular Specular Sheen */}
        <circle
          cx="120"
          cy="120"
          r="53"
          fill="none"
          stroke={isLight ? '#f1f5f9' : '#1e293b'}
          strokeWidth="3"
        />
      </svg>

      {/* Centered Large Bold Digits 25:00 (Matching image exact typography & contrast) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        <span
          className={`font-black font-mono tracking-tight leading-none transition-colors select-none ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
          style={{ fontSize: size * 0.22 }}
        >
          {timeFormatted}
        </span>
        <span
          className={`text-[9px] font-extrabold uppercase tracking-widest mt-1.5 px-2.5 py-0.5 rounded-full border transition-all ${
            isBreak
              ? isLight
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
              : isLight
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-blue-950/70 text-blue-300 border-blue-800'
          }`}
        >
          {isRunning ? (isBreak ? 'Resting' : 'Focusing') : 'Paused'}
        </span>
      </div>

      {/* Floating Dynamic Star Particles (Twinkling outside - hidden when clutter is reduced) */}
      {isRunning && !isReduced && (
        <>
          <span
            className="absolute top-6 right-10 w-2 h-2 rounded-full bg-white shadow-md animate-ping pointer-events-none"
            style={{ animationDuration: '2.8s' }}
          />
          <span
            className="absolute bottom-8 left-10 w-2 h-2 rounded-full bg-sky-200 shadow-md animate-ping pointer-events-none"
            style={{ animationDuration: '3.4s' }}
          />
        </>
      )}
    </div>
  );
};
