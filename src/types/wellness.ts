export type UserRole = 'employee' | 'hr_manager';

export type BurnoutRiskLevel = 'low' | 'moderate' | 'high';

export interface BurnoutMetrics {
  overallScore: number; // 0-100
  riskLevel: BurnoutRiskLevel;
  meetingHoursWeekly: number;
  meetingHoursBenchmark: number;
  overtimeHoursWeekly: number;
  ptoDaysUsed: number;
  ptoDaysRemaining: number;
  afterHoursActivityCount: number; // emails/messages past 7 PM
  consecutiveWorkDays: number;
  trend: 'improving' | 'stable' | 'worsening';
  riskFactors: string[];
}

export type MoodType = 'thriving' | 'good' | 'okay' | 'stressed' | 'exhausted';

export interface MoodLog {
  id: string;
  timestamp: string;
  mood: MoodType;
  energyLevel: number; // 1-5
  note?: string;
  isAnonymousToHr: boolean;
}

export interface WellnessReminder {
  id: string;
  title: string;
  description: string;
  type: 'hydration' | 'stretch' | 'eye_rest' | 'short_walk';
  intervalMinutes: number;
  lastTriggered?: string;
  isActive: boolean;
}

export interface PeerBadge {
  id: string;
  senderName: string;
  senderAvatar: string;
  recipientName: string;
  recipientAvatar: string;
  badgeType: 'lifesaver' | 'focus_champion' | 'team_anchor' | 'positive_energy';
  message: string;
  virtualCoffeeSent: boolean;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  category?: 'burnout' | 'stretching' | 'boundary' | 'mindfulness';
}

export interface AccessibilitySettings {
  focusModeActive: boolean;
  dyslexiaFont: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  batchNotifications: boolean;
  ambientSound: 'none' | 'rain' | 'lofi' | 'waves' | 'forest';
}

export interface BoundaryGuardConfig {
  activeShield: boolean;
  quietHoursStart: string; // e.g. "18:00"
  quietHoursEnd: string;   // e.g. "08:00"
  delayedMessagesCount: number;
  autoReplyMessage: string;
}
