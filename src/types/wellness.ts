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

// Standard working time starts 9:00 AM. Any clock-in after that is late.
export const getLateMinutes = (clockInStr?: string | null): number => {
  if (!clockInStr) return 0;
  const match = clockInStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return 0;
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = (match[3] || '').toUpperCase();

  if (period === 'PM' && hour < 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  const clockInMinutes = hour * 60 + minute;
  const standardStartMinutes = 9 * 60; // 9:00 AM standard working time

  return clockInMinutes > standardStartMinutes ? clockInMinutes - standardStartMinutes : 0;
};

export const formatLateDuration = (totalMinutes: number): string => {
  if (totalMinutes <= 0) return '0h 0m';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h 0m`;
  return `0h ${m}m`;
};

export interface WeeklyAttendanceSummary {
  attendedDays: number;
  lateDays: number;
  lateMinutesTotal: number;
  onTimeRate: number; // 0-100, 100 when nothing has been attended yet
}

/**
 * Aggregates this Mon-Sun week's punctuality from the same clock-in data and
 * 9:00 AM threshold used everywhere else (getLateMinutes, the attendance
 * calendar, the dashboard's live Late badge) so every surface agrees on what
 * "late" means instead of each computing its own definition.
 */
export const getWeeklyAttendanceSummary = (
  teamShifts: WorkShiftRecord[],
  workShift: WorkShiftState,
  userId: string,
  userName: string,
  now: Date = new Date()
): WeeklyAttendanceSummary => {
  const currentDayOfWeek = (now.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - currentDayOfWeek);
  monday.setHours(0, 0, 0, 0);

  let attendedDays = 0;
  let lateDays = 0;
  let lateMinutesTotal = 0;

  for (let index = 0; index < 7; index++) {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + index);
    const dateStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
    const isToday = index === currentDayOfWeek;

    const matchedShift = teamShifts.find(s => (s.userId === userId || s.userName === userName) && s.date === dateStr);
    let clockInForDay = matchedShift ? matchedShift.clockInTime : null;
    const hasShift = !!matchedShift || (isToday && (workShift.isClockedIn || workShift.totalWorkedSeconds > 0));
    if (isToday && (workShift.isClockedIn || workShift.totalWorkedSeconds > 0)) {
      clockInForDay = workShift.clockInTime || clockInForDay;
    }
    if (!hasShift) continue;

    attendedDays += 1;
    const lateMinutes = getLateMinutes(clockInForDay);
    if (lateMinutes > 0) {
      lateDays += 1;
      lateMinutesTotal += lateMinutes;
    }
  }

  const onTimeRate = attendedDays > 0 ? Math.round(((attendedDays - lateDays) / attendedDays) * 100) : 100;
  return { attendedDays, lateDays, lateMinutesTotal, onTimeRate };
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
}

export interface BoundaryGuardConfig {
  activeShield: boolean;
  quietHoursStart: string; // e.g. "18:00"
  quietHoursEnd: string;   // e.g. "08:00"
  autoReplyMessage: string;
}

// A notification the Boundary Shield intercepted during quiet hours.
export interface HeldNotification {
  id: string;
  message: string;
  heldAt: number; // epoch ms
}

const parseTimeToMinutes = (time?: string): number | null => {
  const match = (time || '').match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
};

/**
 * Quiet hours normally wrap past midnight (e.g. 18:30 -> 08:30), so a plain
 * start <= now < end comparison would never match. Handles both directions.
 */
export const isWithinQuietHours = (start: string, end: string, now: Date = new Date()): boolean => {
  const startMinutes = parseTimeToMinutes(start);
  const endMinutes = parseTimeToMinutes(end);
  if (startMinutes === null || endMinutes === null) return false;
  if (startMinutes === endMinutes) return false; // zero-length window

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return startMinutes < endMinutes
    ? currentMinutes >= startMinutes && currentMinutes < endMinutes  // same-day window
    : currentMinutes >= startMinutes || currentMinutes < endMinutes; // wraps past midnight
};

/** Formats "18:30" as "6:30 PM" for display. */
export const formatQuietHourLabel = (time: string): string => {
  const totalMinutes = parseTimeToMinutes(time);
  if (totalMinutes === null) return time;
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
};

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
  /** Derived for display from bankedSeconds + the running segment. Not authoritative. */
  totalWorkedSeconds: number;
  overtimeSeconds: number;
  /** Epoch ms the current clocked-in segment began; null while clocked out. */
  segmentStartedAt?: number | null;
  /** Seconds from segments already closed today (clock in -> out -> in again). */
  bankedSeconds?: number;
  shiftStart?: string; // "09:00 AM"
  shiftEnd?: string; // "06:00 PM"
  lunchStart?: string; // "12:00 PM"
  lunchEnd?: string; // "01:00 PM"
}

export const STANDARD_SHIFT_SECONDS = 8 * 3600;

/**
 * Worked time is measured against the wall clock rather than accumulated per tick,
 * so it stays correct while the tab is closed, backgrounded, or the user is logged
 * out — intervals simply don't fire in those states.
 */
export const computeWorkedSeconds = (shift: WorkShiftState, now: number = Date.now()): number => {
  const banked = shift.bankedSeconds ?? 0;
  if (!shift.isClockedIn || !shift.segmentStartedAt) return Math.max(0, Math.round(banked));
  // Guard against a clock change making the segment look negative.
  const elapsed = Math.max(0, (now - shift.segmentStartedAt) / 1000);
  return Math.max(0, Math.round(banked + elapsed));
};

/** Refreshes the derived display fields from the authoritative timing fields. */
export const withLiveWorkTotals = (shift: WorkShiftState, now: number = Date.now()): WorkShiftState => {
  const totalWorkedSeconds = computeWorkedSeconds(shift, now);
  return {
    ...shift,
    totalWorkedSeconds,
    overtimeSeconds: Math.max(0, totalWorkedSeconds - STANDARD_SHIFT_SECONDS)
  };
};

/**
 * Upgrades a stored shift to the wall-clock fields and recomputes totals. Records
 * saved before those fields existed only kept a display string like "04:32 PM",
 * so elapsed time cannot be recovered for them — measurement resumes from now.
 */
export const normalizeWorkShift = (shift: WorkShiftState, now: number = Date.now()): WorkShiftState =>
  withLiveWorkTotals(
    {
      ...shift,
      bankedSeconds: shift.bankedSeconds ?? shift.totalWorkedSeconds ?? 0,
      segmentStartedAt: shift.isClockedIn ? (shift.segmentStartedAt ?? now) : null
    },
    now
  );

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

