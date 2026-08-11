import React from 'react';
import { MoodType } from '../../types/wellness';

interface PolarBearEmojiProps {
  mood: MoodType | string;
  size?: number | string;
  className?: string;
}

export const PolarBearEmoji: React.FC<PolarBearEmojiProps> = ({
  mood,
  size = 40,
  className = ''
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;
  const moodKey = mood.toLowerCase();

  const renderFacialExpression = () => {
    switch (moodKey) {
      case 'thriving':
        return (
          <>
            {/* Rosy Cheeks */}
            <circle cx="17" cy="35" r="5" fill="#f472b6" opacity="0.5" />
            <circle cx="47" cy="35" r="5" fill="#f472b6" opacity="0.5" />
            
            {/* Star Sparkle Eyes */}
            <polygon points="22,23 23.5,27 27.5,27 24.5,29.5 25.5,33.5 22,31 18.5,33.5 19.5,29.5 16.5,27 20.5,27" fill="#f59e0b" />
            <polygon points="42,23 43.5,27 47.5,27 44.5,29.5 45.5,33.5 42,31 38.5,33.5 39.5,29.5 36.5,27 40.5,27" fill="#f59e0b" />
            
            {/* Open Super Happy Smile */}
            <path d="M 23 39 Q 32 52 41 39 Z" fill="#f43f5e" stroke="#1e293b" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M 26 42 Q 32 47 38 42" fill="none" stroke="#fecdd3" strokeWidth="1.5" />

            {/* Sparkle badge above ear */}
            <polygon points="50,7 51.5,10 55,10 52,12 53,15.5 50,13.5 47,15.5 48,12 45,10 48.5,10" fill="#f59e0b" />
          </>
        );

      case 'good':
        return (
          <>
            {/* Soft Cheeks */}
            <circle cx="17" cy="35" r="4.5" fill="#f472b6" opacity="0.4" />
            <circle cx="47" cy="35" r="4.5" fill="#f472b6" opacity="0.4" />

            {/* Smiling Arch Eyes */}
            <path d="M 17 28 Q 22 20 27 28" fill="none" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 37 28 Q 42 20 47 28" fill="none" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />

            {/* Sweet Smile */}
            <path d="M 24 40 Q 32 48 40 40" fill="none" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
          </>
        );

      case 'okay':
        return (
          <>
            {/* Calm Neutral Eyes */}
            <circle cx="22" cy="27" r="3.5" fill="#334155" />
            <circle cx="42" cy="27" r="3.5" fill="#334155" />
            <circle cx="23.5" cy="25.5" r="1.2" fill="#ffffff" />
            <circle cx="43.5" cy="25.5" r="1.2" fill="#ffffff" />

            {/* Straight Neutral Line */}
            <path d="M 25 41 L 39 41" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          </>
        );

      case 'stressed':
        return (
          <>
            {/* Slanted Anxious Eyebrows */}
            <path d="M 16 20 L 26 23" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
            <path d="M 48 20 L 38 23" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />

            {/* Wide Worried Eyes */}
            <circle cx="22" cy="28" r="4" fill="#0f172a" />
            <circle cx="42" cy="28" r="4" fill="#0f172a" />
            <circle cx="23.5" cy="26.5" r="1.2" fill="#ffffff" />
            <circle cx="43.5" cy="26.5" r="1.2" fill="#ffffff" />

            {/* Wavy Nervous Mouth */}
            <path d="M 23 42 Q 27 38 32 42 Q 37 46 41 42" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />

            {/* Sweat Drop on Head */}
            <path d="M 50 14 C 53 14 55 18 53 21 C 51 23 48 22 48 19 C 48 16 50 14 50 14 Z" fill="#3b82f6" />
          </>
        );

      case 'exhausted':
        return (
          <>
            {/* Tired Closed Eyes (X) */}
            <path d="M 17 25 L 25 31 M 17 31 L 25 25" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
            <path d="M 39 25 L 47 31 M 39 31 L 47 25" fill="none" stroke="#475569" strokeWidth="3" strokeLinecap="round" />

            {/* Downward Open Yawn Mouth */}
            <ellipse cx="32" cy="42" rx="4.5" ry="5.5" fill="#334155" />

            {/* Sleepiness Zzz floating */}
            <text x="47" y="16" fill="#3b82f6" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Z</text>
            <text x="54" y="9" fill="#60a5fa" fontSize="9" fontWeight="bold" fontFamily="sans-serif">z</text>
          </>
        );

      default:
        return (
          <>
            <circle cx="22" cy="27" r="3.5" fill="#334155" />
            <circle cx="42" cy="27" r="3.5" fill="#334155" />
            <path d="M 25 40 Q 32 46 39 40" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          </>
        );
    }
  };

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 align-middle ${className}`}
    >
      <defs>
        <linearGradient id="polarBearHeadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="85%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <linearGradient id="polarBearEarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#fbcfe8" />
        </linearGradient>
      </defs>

      {/* Outer Ears */}
      <circle cx="14" cy="15" r="9.5" fill="url(#polarBearHeadGrad)" stroke="#cbd5e1" strokeWidth="1.5" />
      <circle cx="50" cy="15" r="9.5" fill="url(#polarBearHeadGrad)" stroke="#cbd5e1" strokeWidth="1.5" />

      {/* Inner Ears */}
      <circle cx="14" cy="15" r="5.5" fill="url(#polarBearEarGrad)" opacity="0.8" />
      <circle cx="50" cy="15" r="5.5" fill="url(#polarBearEarGrad)" opacity="0.8" />

      {/* Head Base */}
      <ellipse cx="32" cy="33" rx="25" ry="22" fill="url(#polarBearHeadGrad)" stroke="#cbd5e1" strokeWidth="2" />

      {/* Snout */}
      <ellipse cx="32" cy="38" rx="10.5" ry="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.2" />

      {/* Nose */}
      <path d="M 28.5 34 C 28.5 32.5 35.5 32.5 35.5 34 C 35.5 36.5 32 38 32 38 C 32 38 28.5 36.5 28.5 34 Z" fill="#1e293b" />
      <ellipse cx="30.5" cy="33.8" rx="1.2" ry="0.7" fill="#ffffff" opacity="0.7" />

      {/* Facial Expression Content */}
      {renderFacialExpression()}
    </svg>
  );
};
