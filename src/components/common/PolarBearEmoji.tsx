import React from 'react';
import { MoodType } from '../../types/wellness';

interface MoodEmojiProps {
  mood: MoodType | string;
  size?: number | string;
  className?: string;
}

export const getRealMoodEmoji = (mood: MoodType | string): string => {
  switch (mood.toLowerCase()) {
    case 'thriving':
      return '🤩';
    case 'good':
      return '😊';
    case 'okay':
      return '🙂';
    case 'stressed':
      return '😰';
    case 'exhausted':
      return '😫';
    default:
      return '😊';
  }
};

export const PolarBearEmoji: React.FC<MoodEmojiProps> = ({
  mood,
  size = 40,
  className = ''
}) => {
  const emoji = getRealMoodEmoji(mood);
  const fontSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <span
      className={`emoji-${mood.toLowerCase()} inline-flex items-center justify-center select-none leading-none filter drop-shadow-xs transition-all duration-300 transform-gpu ${className}`}
      style={{ fontSize, width: fontSize, height: fontSize }}
      role="img"
      aria-label={typeof mood === 'string' ? mood : 'mood'}
    >
      {emoji}
    </span>
  );
};

export const MoodEmoji = PolarBearEmoji;
