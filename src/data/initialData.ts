import {
  BurnoutMetrics,
  MoodLog,
  WellnessReminder,
  PeerBadge,
  ChatMessage,
  BoundaryGuardConfig,
  AccessibilitySettings,
  UserAccount,
  UserProfile,
  HrNotification,
  DeletedUserAccount,
  PtoRequest,
  PtoBalance
} from '../types/wellness';

export const initialHrNotifications: HrNotification[] = [];

export const initialUserProfile: UserProfile = {
  id: 'admin-001',
  name: 'System Administrator',
  email: 'admin@axionhr.com',
  role: 'admin',
  department: 'Executive IT & Administration',
  jobTitle: 'System Administrator',
  phoneNumber: '+1 (555) 019-2831',
  employeeId: 'AX-ADMIN-01',
  joinDate: 'January 1, 2026',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  theme: 'light',
  address: {
    street: '742 Innovation Way, Suite 400',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94107',
    country: 'United States'
  },
  emergencyContactName: 'Taylor Vance',
  emergencyContactPhone: '+1 (555) 890-1234'
};

export const initialBurnoutMetrics: BurnoutMetrics = {
  overallScore: 0, // Zero baseline (Low Risk 0-25)
  riskLevel: 'low',
  meetingHoursWeekly: 0,
  meetingHoursBenchmark: 15.0,
  overtimeHoursWeekly: 0,
  ptoDaysUsed: 0,
  ptoDaysRemaining: 20,
  afterHoursActivityCount: 0,
  consecutiveWorkDays: 0,
  trend: 'stable',
  riskFactors: []
};

export const initialMoodLogs: MoodLog[] = [];

export const initialReminders: WellnessReminder[] = [
  { id: 'r1', title: 'Hydration Break', description: 'Drink a glass of water (Target: 2.5L daily)', type: 'hydration', intervalMinutes: 45, isActive: false },
  { id: 'r2', title: 'Posture & Shoulder Stretch', description: '2-minute neck roll and shoulder stretch', type: 'stretch', intervalMinutes: 60, isActive: false },
  { id: 'r3', title: 'Eye Rest (20-20-20 Rule)', description: 'Look 20 feet away for 20 seconds', type: 'eye_rest', intervalMinutes: 20, isActive: false },
  { id: 'r4', title: 'Short Walk / Step Out', description: 'Step away from desk for fresh air', type: 'short_walk', intervalMinutes: 120, isActive: false },
];

export const initialBadges: PeerBadge[] = [];

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'ai',
    text: 'Hello! I am your AI Haven Wellness Coach. How can I support your focus, physical health, and work-life balance today?',
    timestamp: 'Just now',
    category: 'mindfulness'
  }
];

export const initialBoundaryConfig: BoundaryGuardConfig = {
  activeShield: false,
  quietHoursStart: '18:30',
  quietHoursEnd: '08:30',
  autoReplyMessage: 'AxionHR Haven Boundary Guard: User is currently disconnected for well-being hours. Messages will be delivered tomorrow at 8:30 AM.'
};

export const initialAccessibilitySettings: AccessibilitySettings = {
  focusModeActive: false,
  dyslexiaFont: false,
  highContrast: false,
  reducedMotion: false,
  batchNotifications: true
};

export const teamBurnoutOverview = [
  { department: 'Engineering - Backend', riskScore: 18, status: 'low', totalMembers: 14, overworkingCount: 0 },
  { department: 'Product Design & UX', riskScore: 15, status: 'low', totalMembers: 8, overworkingCount: 0 },
  { department: 'Customer Success', riskScore: 22, status: 'low', totalMembers: 12, overworkingCount: 0 },
  { department: 'Marketing & Growth', riskScore: 12, status: 'low', totalMembers: 10, overworkingCount: 0 },
  { department: 'Sales Operations', riskScore: 20, status: 'low', totalMembers: 16, overworkingCount: 0 }
];

export const initialUserAccounts: UserAccount[] = [
  {
    id: 'admin-001',
    name: 'System Administrator',
    email: 'admin@axionhr.com',
    password: 'admin',
    role: 'admin',
    department: 'Executive IT & Administration',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: '2026-01-01',
    lastActive: 'Just now'
  },
  {
    id: 'hr-001',
    name: 'Sarah Jenkins',
    email: 'hr@axionhr.com',
    password: 'hr123',
    role: 'hr_manager',
    department: 'People & Culture',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    createdAt: '2026-01-01',
    lastActive: '10 mins ago'
  },
  {
    id: 'emp-001',
    name: 'Alex Rivera',
    email: 'employee@axionhr.com',
    password: 'emp123',
    role: 'employee',
    department: 'Engineering',
    status: 'active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: '2026-01-01',
    lastActive: 'Just now'
  }
];

export const initialDeletedAccounts: DeletedUserAccount[] = [];

export const initialPtoBalance: PtoBalance = {
  totalAllowance: 20,
  usedDays: 0,
  pendingDays: 0,
  remainingDays: 20
};

export const initialPtoRequests: PtoRequest[] = [];
