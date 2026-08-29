-- ==============================================================================
-- AXIONHR HAVEN — COMPLETE SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Instructions:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your Project -> Click on "SQL Editor" in the left sidebar.
-- 3. Click "New Query", paste this entire script, and click "Run".
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES TABLE (User Accounts & Profiles)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'admin')),
  department TEXT NOT NULL DEFAULT 'Engineering',
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  password TEXT,
  phone TEXT,
  job_title TEXT,
  location TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. PTO_REQUESTS TABLE (Paid Time Off & Wellness Leave)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pto_requests (
  id TEXT PRIMARY KEY DEFAULT ('pto-' || floor(extract(epoch from now()) * 1000)::TEXT),
  user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  department TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('vacation', 'mental_health', 'sick', 'personal', 'birthday')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL CHECK (end_date >= start_date),
  total_days NUMERIC(4, 1) NOT NULL DEFAULT 1.0,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  auto_approved BOOLEAN DEFAULT FALSE,
  reviewed_by TEXT,
  reviewed_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. PEER_BADGES TABLE (Social Recognition Wall)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.peer_badges (
  id TEXT PRIMARY KEY DEFAULT ('badge-' || floor(extract(epoch from now()) * 1000)::TEXT),
  from_name TEXT NOT NULL,
  from_avatar TEXT,
  to_name TEXT NOT NULL,
  to_avatar TEXT,
  badge_name TEXT NOT NULL,
  badge_icon TEXT NOT NULL DEFAULT '🌟',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. MOOD_LOGS TABLE (Daily Polar Bear Energy & Mood Logs)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id TEXT PRIMARY KEY DEFAULT ('mood-' || floor(extract(epoch from now()) * 1000)::TEXT),
  user_id TEXT,
  user_name TEXT,
  mood TEXT NOT NULL,
  energy_level INTEGER NOT NULL DEFAULT 3 CHECK (energy_level BETWEEN 1 AND 5),
  note TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. HR_NOTIFICATIONS TABLE (Proactive Alerts & Caring Intervention Flags)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.hr_notifications (
  id TEXT PRIMARY KEY DEFAULT ('hr-notif-' || floor(extract(epoch from now()) * 1000)::TEXT),
  type TEXT NOT NULL CHECK (type IN ('teammate_flag', 'burnout_alert', 'quiet_hours_overload')),
  target_teammate TEXT NOT NULL,
  reason TEXT,
  submitted_by_anonymous BOOLEAN DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. WORK_SHIFTS TABLE (Attendance, Clock-In / Clock-Out & Overtime Telemetry)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.work_shifts (
  id TEXT PRIMARY KEY DEFAULT ('shift-' || floor(extract(epoch from now()) * 1000)::TEXT),
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  department TEXT NOT NULL DEFAULT 'Engineering',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  clock_in_time TEXT NOT NULL,
  clock_out_time TEXT,
  total_worked_seconds INTEGER NOT NULL DEFAULT 0,
  overtime_seconds INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pto_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_shifts ENABLE ROW LEVEL SECURITY;

-- Allow Public / Anon access for seamless frontend-backend synchronization
DROP POLICY IF EXISTS "Public access profiles" ON public.profiles;
CREATE POLICY "Public access profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access work_shifts" ON public.work_shifts;
CREATE POLICY "Public access work_shifts" ON public.work_shifts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access pto_requests" ON public.pto_requests;
CREATE POLICY "Public access pto_requests" ON public.pto_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access peer_badges" ON public.peer_badges;
CREATE POLICY "Public access peer_badges" ON public.peer_badges FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access mood_logs" ON public.mood_logs;
CREATE POLICY "Public access mood_logs" ON public.mood_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access hr_notifications" ON public.hr_notifications;
CREATE POLICY "Public access hr_notifications" ON public.hr_notifications FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 7. INITIAL SEED DATA (System Admin Account & Starter Data)
-- ==============================================================================
INSERT INTO public.profiles (id, email, name, role, department, avatar_url, status, password)
VALUES (
  'admin-001',
  'admin@axionhr.com',
  'System Administrator',
  'admin',
  'Executive IT & Administration',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'active',
  'admin'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO public.pto_requests (id, user_name, department, category, start_date, end_date, total_days, reason, status, auto_approved, reviewed_by, reviewed_at)
VALUES (
  'pto-1',
  'System Administrator',
  'Engineering',
  'mental_health',
  CURRENT_DATE + INTERVAL '6 days',
  CURRENT_DATE + INTERVAL '6 days',
  1.0,
  'Wellness recharge day to reset after product release sprint',
  'approved',
  true,
  'AI Wellness Guard (Auto-Approved)',
  CURRENT_DATE
) ON CONFLICT (id) DO NOTHING;
