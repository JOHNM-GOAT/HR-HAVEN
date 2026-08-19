import { BurnoutMetrics, MoodLog, WellnessReminder, PeerBadge, ChatMessage, BoundaryGuardConfig, AccessibilitySettings, UserAccount, UserProfile, HrNotification, DeletedUserAccount } from '../types/wellness';

export const initialHrNotifications: HrNotification[] = [
  {
    id: 'hr-notif-1',
    type: 'teammate_flag',
    targetTeammate: 'David Kim',
    reason: 'Logged 18+ overtime hours this week on the billing migration, seems deeply fatigued.',
    submittedByAnonymous: true,
    status: 'pending',
    timestamp: '15 mins ago',
    severity: 'high'
  },
  {
    id: 'hr-notif-2',
    type: 'burnout_alert',
    targetTeammate: 'Engineering - Backend Team',
    reason: 'Automated telemetry detected 6 consecutive days of late-night quiet-hour activity.',
    submittedByAnonymous: true,
    status: 'in_progress',
    timestamp: '2 hours ago',
    severity: 'medium'
  }
];

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
  overallScore: 68, // Moderate-high risk alert
  riskLevel: 'moderate',
  meetingHoursWeekly: 24.5,
  meetingHoursBenchmark: 15.0,
  overtimeHoursWeekly: 9.2,
  ptoDaysUsed: 3,
  ptoDaysRemaining: 18,
  afterHoursActivityCount: 14,
  consecutiveWorkDays: 9,
  trend: 'worsening',
  riskFactors: [
    'Meeting overload (+63% above team average)',
    '14 late-night Slack & email messages after 7:00 PM',
    '9 consecutive workdays without full disconnect',
    'Low PTO consumption rate this quarter'
  ]
};

export const initialMoodLogs: MoodLog[] = [
  { id: '1', timestamp: 'Today, 9:15 AM', mood: 'stressed', energyLevel: 2, note: 'Back-to-back meetings all morning', isAnonymousToHr: true },
  { id: '2', timestamp: 'Yesterday', mood: 'okay', energyLevel: 3, note: 'Finished sprint deliverables late', isAnonymousToHr: true },
  { id: '3', timestamp: '3 days ago', mood: 'good', energyLevel: 4, note: 'Great focus time in afternoon', isAnonymousToHr: true },
  { id: '4', timestamp: '4 days ago', mood: 'thriving', energyLevel: 5, note: 'Had weekend break!', isAnonymousToHr: true },
  { id: '5', timestamp: '5 days ago', mood: 'exhausted', energyLevel: 1, note: 'Overtime session', isAnonymousToHr: true },
];

export const initialReminders: WellnessReminder[] = [
  { id: 'r1', title: 'Hydration Break', description: 'Drink a glass of water (Target: 2.5L daily)', type: 'hydration', intervalMinutes: 45, isActive: false },
  { id: 'r2', title: 'Posture & Shoulder Stretch', description: '2-minute neck roll and shoulder stretch', type: 'stretch', intervalMinutes: 60, isActive: false },
  { id: 'r3', title: 'Eye Rest (20-20-20 Rule)', description: 'Look 20 feet away for 20 seconds', type: 'eye_rest', intervalMinutes: 20, isActive: false },
  { id: 'r4', title: 'Short Walk / Step Out', description: 'Step away from desk for fresh air', type: 'short_walk', intervalMinutes: 120, isActive: false },
];

export const initialBadges: PeerBadge[] = [
  {
    id: 'b1',
    senderName: 'Sarah Lin',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    recipientName: 'Alex Mercer (You)',
    recipientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    badgeType: 'lifesaver',
    message: 'Alex stepped in to handle the client presentation when I was sick. Total lifesaver!',
    virtualCoffeeSent: true,
    timestamp: '2 hours ago'
  },
  {
    id: 'b2',
    senderName: 'David Chen',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    recipientName: 'Elena Rostova',
    recipientAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    badgeType: 'focus_champion',
    message: 'Thanks for respecting focus mode hours and batching non-urgent requests!',
    virtualCoffeeSent: false,
    timestamp: 'Yesterday'
  },
  {
    id: 'b3',
    senderName: 'Alex Mercer (You)',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    recipientName: 'Marcus Vance',
    recipientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    badgeType: 'team_anchor',
    message: 'Always keeping the team grounded during intense release sprints.',
    virtualCoffeeSent: true,
    timestamp: '3 days ago'
  }
];

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'ai',
    text: 'Hello Alex! I am your AI Haven Wellness Coach. I noticed you have had 24+ meeting hours this week and late-night activity. How can I help you adjust your schedule or practice a micro-break today?',
    timestamp: '10:00 AM',
    category: 'burnout'
  }
];

export const initialBoundaryConfig: BoundaryGuardConfig = {
  activeShield: true,
  quietHoursStart: '18:30',
  quietHoursEnd: '08:30',
  delayedMessagesCount: 6,
  autoReplyMessage: 'AxionHR Haven Boundary Guard: Alex is currently disconnected for well-being hours. Messages will be delivered tomorrow at 8:30 AM.'
};

export const initialAccessibilitySettings: AccessibilitySettings = {
  focusModeActive: false,
  dyslexiaFont: false,
  highContrast: false,
  reducedMotion: false,
  batchNotifications: true,
  ambientSound: 'none'
};

export const teamBurnoutOverview = [
  { department: 'Engineering - Backend', riskScore: 74, status: 'high', totalMembers: 14, overworkingCount: 6 },
  { department: 'Product Design & UX', riskScore: 42, status: 'low', totalMembers: 8, overworkingCount: 1 },
  { department: 'Customer Success', riskScore: 65, status: 'moderate', totalMembers: 12, overworkingCount: 4 },
  { department: 'Marketing & Growth', riskScore: 38, status: 'low', totalMembers: 10, overworkingCount: 0 },
  { department: 'Sales Operations', riskScore: 79, status: 'high', totalMembers: 16, overworkingCount: 8 }
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
  }
];

export const initialDeletedAccounts: DeletedUserAccount[] = [];

