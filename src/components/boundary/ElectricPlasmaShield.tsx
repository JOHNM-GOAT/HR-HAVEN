'use client';

import React from 'react';
import { useWellness } from '../../context/WellnessContext';
import { formatQuietHourLabel } from '../../types/wellness';

export const ElectricPlasmaShield: React.FC = () => {
  const { boundaryConfig, toggleBoundaryShield, isDarkMode, accessibility, isShieldHolding } = useWellness();
  const isActive = boundaryConfig.activeShield;
  const isLight = !isDarkMode;
  const isReduced = accessibility.reducedMotion;

  // Adaptive High-Contrast Colors
  const lightningPrimary = isLight ? '#0284c7' : '#67e8f9';
  const lightningSecondary = isLight ? '#2563eb' : '#bae6fd';
  const lightningCore = isLight ? '#1d4ed8' : '#ffffff';
  const sparkColor = isLight ? '#0284c7' : '#ffffff';

  const bellMainStroke = isActive
    ? isLight ? '#1d4ed8' : '#ffffff'
    : isLight ? '#334155' : '#94a3b8';

  const bellAccentStroke = isActive
    ? isLight ? '#0284c7' : '#67e8f9'
    : isLight ? '#64748b' : '#64748b';

  return (
    <div
      onClick={toggleBoundaryShield}
      role="button"
      tabIndex={0}
      title={isActive ? 'Click to Pause Boundary Shield' : 'Click to Engage Boundary Shield'}
      className={`relative flex flex-col items-center justify-center cursor-pointer select-none group py-2 ${
        isReduced ? '' : 'transition-transform duration-300 hover:scale-105'
      }`}
    >
      {/* Outer Glowing Energy Field Container */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
        {/* Soft Ambient Energy Radial Backlight (Disabled in Clutter Reduction) */}
        {!isReduced && (
          <div
            className={`absolute inset-2 rounded-full transition-all duration-700 pointer-events-none ${
              isActive
                ? isLight
                  ? 'bg-gradient-to-r from-blue-200/60 via-cyan-100/80 to-blue-200/60 blur-xl scale-105 animate-pulse'
                  : 'bg-gradient-to-r from-blue-500/25 via-cyan-400/30 to-blue-600/25 blur-2xl scale-110 animate-pulse'
                : isLight
                  ? 'bg-slate-100/80 blur-md scale-95'
                  : 'bg-slate-500/10 blur-xl scale-90'
            }`}
          />
        )}

        {/* Ambient Floor Glow Pool */}
        <div
          className={`absolute bottom-2 inset-x-8 h-8 rounded-full blur-lg transition-opacity duration-700 pointer-events-none ${
            isActive
              ? isLight ? 'bg-cyan-300/40' : 'bg-cyan-400/30'
              : 'opacity-0'
          }`}
        />

        {/* Inner Radial Backdrop Orb for crisp contrast in Light and Dark mode */}
        <div
          className={`absolute w-44 h-44 sm:w-48 sm:h-48 rounded-full transition-all duration-500 pointer-events-none ${
            isActive
              ? isLight
                ? 'bg-gradient-to-b from-sky-50/90 via-blue-50/60 to-cyan-50/80 border border-blue-100/80 shadow-sm'
                : 'bg-gradient-to-b from-blue-950/40 via-[#171c28]/70 to-[#121520]/80 border border-blue-500/20 shadow-lg shadow-blue-500/10'
              : isLight
                ? 'bg-slate-50 border border-slate-200/80 shadow-xs'
                : 'bg-slate-800/40 border border-slate-700/50'
          }`}
        />

        {/* SVG Animated Lightning / Electric Plasma Sphere */}
        <svg
          viewBox="0 0 240 240"
          className={`relative z-10 w-full h-full transform transition-transform duration-500 group-hover:scale-105 ${
            isActive ? 'opacity-100' : 'opacity-60'
          }`}
        >
          <defs>
            {/* Plasma Glow Filter */}
            <filter id="plasma-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation={isLight ? '1.5' : '3.5'} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Intense Core Neon Filter */}
            <filter id="neon-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation={isLight ? '2.5' : '5'} result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Radial Gradient for Outer Energy Corona */}
            <radialGradient id="corona-grad" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor={isLight ? '#38bdf8' : '#38bdf8'} stopOpacity="0" />
              <stop offset="85%" stopColor={isLight ? '#0284c7' : '#67e8f9'} stopOpacity={isLight ? '0.25' : '0.35'} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Soft Corona Circle */}
          {isActive && (
            <circle
              cx="120"
              cy="120"
              r="95"
              fill="url(#corona-grad)"
              className={!isReduced ? 'animate-pulse' : ''}
              style={{ animationDuration: '3s' }}
            />
          )}

          {/* Layer 1: Clockwise Rotating Outer Lightning Arc Ring */}
          <g
            className={isActive && !isReduced ? 'animate-spin' : ''}
            style={{ transformOrigin: '120px 120px', animationDuration: '14s' }}
          >
            {/* Fractal Lightning Ring 1 */}
            <path
              d="M 120 30 
                 Q 145 32, 160 48 T 195 75 Q 208 100, 210 120 
                 T 198 165 Q 175 195, 150 205 T 120 210 
                 Q 85 208, 65 190 T 32 145 Q 28 115, 38 90 
                 T 75 45 Q 98 32, 120 30 Z"
              fill="none"
              stroke={lightningPrimary}
              strokeWidth={isLight ? '2.2' : '1.8'}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#plasma-glow)"
              opacity={isLight ? '0.95' : '0.85'}
            />
            {/* Crackling Branch Filaments */}
            <path
              d="M 160 48 L 175 35 L 180 50 M 198 165 L 215 175 L 205 185 M 65 190 L 45 205 L 55 195 M 75 45 L 60 30 L 68 48"
              fill="none"
              stroke={lightningSecondary}
              strokeWidth={isLight ? '1.8' : '1.4'}
              filter="url(#plasma-glow)"
              opacity={isLight ? '0.95' : '0.9'}
            />
          </g>

          {/* Layer 2: Counter-Rotating Secondary Lightning Filaments */}
          <g
            className={isActive && !isReduced ? 'animate-spin' : ''}
            style={{ transformOrigin: '120px 120px', animationDuration: '9s', animationDirection: 'reverse' }}
          >
            <path
              d="M 120 40 
                 Q 150 44, 172 65 T 200 120 Q 195 155, 175 180 
                 T 120 200 Q 80 196, 58 175 T 40 120 
                 Q 44 80, 68 58 T 120 40 Z"
              fill="none"
              stroke={lightningSecondary}
              strokeWidth={isLight ? '2.2' : '1.8'}
              strokeLinecap="round"
              filter="url(#plasma-glow)"
              opacity={isLight ? '0.95' : '0.9'}
            />
            <path
              d="M 172 65 L 190 55 L 185 75 M 175 180 L 195 195 L 180 190 M 58 175 L 38 185 L 48 168 M 68 58 L 50 45 L 62 60"
              fill="none"
              stroke={lightningCore}
              strokeWidth={isLight ? '1.8' : '1.4'}
              filter="url(#plasma-glow)"
            />
          </g>

          {/* Layer 3: High-Frequency Electric Spark Tendrils */}
          {isActive && (
            <g
              className={!isReduced ? 'animate-spin' : ''}
              style={{ transformOrigin: '120px 120px', animationDuration: '5s' }}
            >
              <path
                d="M 120 50 Q 140 55, 160 72 T 188 120 Q 180 150, 160 168 T 120 190 Q 75 185, 52 155 T 52 85 T 120 50"
                fill="none"
                stroke={lightningCore}
                strokeWidth={isLight ? '1.8' : '1.4'}
                strokeDasharray="8, 6"
                filter="url(#plasma-glow)"
                opacity="0.95"
              />
              {/* Lightning Spark Nodes */}
              <circle cx="160" cy="72" r="3.5" fill={sparkColor} filter="url(#neon-glow)" />
              <circle cx="188" cy="120" r="3" fill={lightningPrimary} filter="url(#neon-glow)" />
              <circle cx="160" cy="168" r="4" fill={sparkColor} filter="url(#neon-glow)" />
              <circle cx="52" cy="155" r="3" fill={lightningSecondary} filter="url(#neon-glow)" />
              <circle cx="52" cy="85" r="3.5" fill={sparkColor} filter="url(#neon-glow)" />
              <circle cx="120" cy="50" r="3" fill={lightningPrimary} filter="url(#neon-glow)" />
            </g>
          )}

          {/* Center High-Contrast Bell-Off / Bell Glyph */}
          <g filter={isActive ? 'url(#neon-glow)' : undefined}>
            {/* Bell Outline Body */}
            <path
              d="M 100 135 C 95 135, 90 138, 90 142 C 90 146, 150 146, 150 142 C 150 138, 145 135, 140 135 L 140 115 C 140 98, 134 88, 120 88 C 106 88, 100 98, 100 115 Z"
              fill="none"
              stroke={bellMainStroke}
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Bell Clapper / Bottom Curve */}
            <path
              d="M 112 152 C 112 156, 116 160, 120 160 C 124 160, 128 156, 128 152"
              fill="none"
              stroke={bellMainStroke}
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            {/* Slash Bar (only when active or always present for boundary shield) */}
            <line
              x1="82"
              y1="78"
              x2="158"
              y2="162"
              stroke={bellMainStroke}
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Cyan/Blue Accent Overlay Line */}
            {isActive && (
              <line
                x1="82"
                y1="78"
                x2="158"
                y2="162"
                stroke={bellAccentStroke}
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity="0.9"
              />
            )}
          </g>
        </svg>

        {/* Dynamic Center Sparkle Burst (Disabled in Clutter Reduction) */}
        {isActive && !isReduced && (
          <>
            <span
              className={`absolute top-10 left-12 w-2.5 h-2.5 rounded-full shadow-md animate-ping pointer-events-none ${
                isLight ? 'bg-blue-600' : 'bg-white'
              }`}
              style={{ animationDuration: '2.5s' }}
            />
            <span
              className={`absolute bottom-12 right-12 w-3 h-3 rounded-full shadow-md animate-ping pointer-events-none ${
                isLight ? 'bg-cyan-500' : 'bg-cyan-200'
              }`}
              style={{ animationDuration: '3.2s' }}
            />
            <span
              className={`absolute top-1/2 left-8 w-2 h-2 rounded-full shadow-md animate-pulse pointer-events-none ${
                isLight ? 'bg-blue-600' : 'bg-white'
              }`}
              style={{ animationDuration: '1.8s' }}
            />
            <span
              className={`absolute top-14 right-10 w-2.5 h-2.5 rounded-full shadow-md animate-pulse pointer-events-none ${
                isLight ? 'bg-sky-600' : 'bg-sky-200'
              }`}
              style={{ animationDuration: '2.1s' }}
            />
          </>
        )}
      </div>

      {/* Title & Schedule Description underneath Sphere */}
      <div className="text-center mt-2">
        <h4
          className={`text-xl font-bold tracking-tight transition-colors flex items-center justify-center gap-1.5 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}
        >
          {isShieldHolding ? 'Holding Notifications' : isActive ? 'Boundary Shield Armed' : 'Shield Disabled'}
        </h4>
        <p className={`text-xs mt-1.5 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {isShieldHolding
            ? `Non-urgent alerts queued until ${formatQuietHourLabel(boundaryConfig.quietHoursEnd)}`
            : isActive
              ? `Holding begins at ${formatQuietHourLabel(boundaryConfig.quietHoursStart)}`
              : 'Notifications will arrive immediately anytime.'}
        </p>
      </div>
    </div>
  );
};

