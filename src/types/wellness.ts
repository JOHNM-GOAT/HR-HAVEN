export type UserRole = 'admin' | 'hr_manager' | 'employee';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department: string;
  status: 'active' | 'disabled';
  avatarUrl?: string;
  createdAt: string;
  lastActive: string;
}

export interface DeletedUserAccount extends UserAccount {
  deletedAt: string;
  deletedBy: string;
  deletionReason?: string;
}

export type BurnoutRiskLevel = 'low' | 'normal' | 'moderate' | 'high';

export const getBurnoutRiskLevel = (score: number): BurnoutRiskLevel => {
  if (score <= 25) return 'low';
  if (score <= 50) return 'normal';
  if (score <= 75) return 'moderate';
  return 'high';
};

export const getBurnoutRiskConfig = (level: BurnoutRiskLevel) => {
  switch (level) {
    case 'low':
      return {
        level: 'low' as const,
        label: 'Low Risk',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        strokeColor: 'text-emerald-500',
        textColor: 'text-emerald-600',
        hexColor: '#10b981',
        recommendation: 'Optimal work balance. Excellent energy & focus!'
      };
    case 'normal':
      return {
        level: 'normal' as const,
        label: 'Normal',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
        strokeColor: 'text-blue-500',
        textColor: 'text-blue-600',
        hexColor: '#3b82f6',
        recommendation: 'Workload is within healthy parameters.'
      };
    case 'moderate':
      return {
        level: 'moderate' as const,
        label: 'Moderate Risk',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        strokeColor: 'text-amber-500',
        textColor: 'text-amber-700',
        hexColor: '#f59e0b',
        recommendation: 'Elevated workload. Reduce meeting density & take focus breaks.'
      };
    case 'high':
      return {
        level: 'high' as const,
        label: 'High Risk',
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
        strokeColor: 'text-rose-500',
        textColor: 'text-rose-600',
        hexColor: '#f43f5e',
        recommendation: 'Critical burnout warning! Immediate disconnect & quiet hours recommended.'
      };
  }
};

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
  createdAt?: string;
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
  createdAt?: string;
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

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  jobTitle: string;
  phoneNumber: string;
  address: UserAddress;
  avatarUrl: string;
  theme: ThemeMode;
  employeeId: string;
  joinDate: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface PomodoroTimer {
  secondsRemaining: number;
  totalSeconds: number;
  isRunning: boolean;
  mode: 'focus' | 'break';
  isMinimized: boolean;
  isOverlayVisible: boolean;
}

export interface HrNotification {
  id: string;
  type: 'teammate_flag' | 'burnout_alert' | 'quiet_hours_overload';
  targetTeammate: string;
  reason?: string;
  submittedByAnonymous: boolean;
  status: 'pending' | 'in_progress' | 'resolved';
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

export interface WorkShiftState {
  date?: string; // YYYY-MM-DD for daily ephemeral tracking
  isClockedIn: boolean;
  clockInTime: string | null;
  clockOutTime: string | null;
  totalWorkedSeconds: number;
  overtimeSeconds: number;
  shiftStart?: string; // "09:00 AM"
  shiftEnd?: string; // "06:00 PM"
  lunchStart?: string; // "12:00 PM"
  lunchEnd?: string; // "01:00 PM"
}

export interface WorkShiftRecord {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  department: string;
  date: string;
  clockInTime: string;
  clockOutTime: string | null;
  totalWorkedSeconds: number;
  overtimeSeconds: number;
  status: 'active' | 'completed';
  createdAt: string;
}

export type LeaveCategory = 'vacation' | 'mental_health' | 'sick' | 'personal' | 'birthday';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface PtoRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  department: string;
  category: LeaveCategory;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  status: LeaveStatus;
  autoApproved: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface PtoBalance {
  totalAllowance: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
}

export type NavTab =
  | 'dashboard'
  | 'analytics'
  | 'physical'
  | 'mental'
  | 'social'
  | 'inclusive'
  | 'boundary'
  | 'pto'
  | 'hr'
  | 'accounts'
  | 'settings';

