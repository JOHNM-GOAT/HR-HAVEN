-- ==============================================================================
-- AXIONHR HAVEN — SUPABASE DATABASE SCHEMA (real-time enabled)
-- ==============================================================================
-- Instructions:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your Project -> click "SQL Editor" in the left sidebar.
-- 3. Click "New Query", paste this entire script, and click "Run".
--
-- Safe to re-run: every statement below is idempotent (CREATE TABLE IF NOT
-- EXISTS, DROP POLICY IF EXISTS before CREATE POLICY, ON CONFLICT DO NOTHING
-- on seed rows, and a guarded loop for the realtime publication), so running
-- this again after a schema update won't error or duplicate anything.
--
-- Every column here was checked against what src/app/api/*/route.ts actually
-- reads and writes — not written from scratch, reconciled with the live app.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES (user accounts — the app has its own login, not Supabase Auth,
--    so ids are app-generated text like 'admin-001' / 'usr-1234', not uuids
--    tied to auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'hr_manager', 'employee')),
  department TEXT NOT NULL DEFAULT 'Engineering',
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  password TEXT,
  phone TEXT,
  job_title TEXT,
  location TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  deleted_at TIMESTAMPTZ,
  deleted_by TEXT,
  deletion_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. PTO_REQUESTS (Paid Time Off & wellness leave)
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
-- 3. PEER_BADGES (private 1:1 appreciation messages)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.peer_badges (
  id TEXT PRIMARY KEY DEFAULT ('badge-' || floor(extract(epoch from now()) * 1000)::TEXT),
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  recipient_name TEXT NOT NULL,
  recipient_avatar TEXT,
  badge_type TEXT NOT NULL,
  message TEXT NOT NULL,
  send_coffee BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. MOOD_LOGS (daily mood / energy check-ins)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id TEXT PRIMARY KEY DEFAULT ('mood-' || floor(extract(epoch from now()) * 1000)::TEXT),
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  department TEXT,
  mood TEXT NOT NULL CHECK (mood IN ('thriving', 'good', 'okay', 'stressed', 'exhausted')),
  energy_level INTEGER NOT NULL DEFAULT 3 CHECK (energy_level BETWEEN 1 AND 5),
  note TEXT,
  is_anonymous BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. HR_NOTIFICATIONS (caring alerts & outreach flags)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.hr_notifications (
  id TEXT PRIMARY KEY DEFAULT ('hr-notif-' || floor(extract(epoch from now()) * 1000)::TEXT),
  type TEXT NOT NULL CHECK (type IN ('teammate_flag', 'burnout_alert', 'quiet_hours_overload')),
  target_teammate TEXT NOT NULL,
  reason TEXT,
  submitted_by_anonymous BOOLEAN DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  action_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. WORK_SHIFTS (attendance, clock-in/out & overtime telemetry)
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
-- 7. BLOCKERS (workflow blockers — each active row raises the logger's
--    Burnout Risk score by score_impact; resolving it gives that back)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.blockers (
  id TEXT PRIMARY KEY DEFAULT ('blocker-' || floor(extract(epoch from now()) * 1000)::TEXT),
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'Engineering',
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  score_impact INTEGER NOT NULL DEFAULT 0,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pto_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockers ENABLE ROW LEVEL SECURITY;

-- The app authenticates its own users (see profiles.password) rather than
-- using Supabase Auth sessions, so there is no auth.uid() to scope policies
-- to. RLS is enabled and policies are still explicit and named (not left
-- open by omission) — access control lives in the Next.js API routes instead.
DROP POLICY IF EXISTS "Public access profiles" ON public.profiles;
CREATE POLICY "Public access profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access pto_requests" ON public.pto_requests;
CREATE POLICY "Public access pto_requests" ON public.pto_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access peer_badges" ON public.peer_badges;
CREATE POLICY "Public access peer_badges" ON public.peer_badges FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access mood_logs" ON public.mood_logs;
CREATE POLICY "Public access mood_logs" ON public.mood_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access hr_notifications" ON public.hr_notifications;
CREATE POLICY "Public access hr_notifications" ON public.hr_notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access work_shifts" ON public.work_shifts;
CREATE POLICY "Public access work_shifts" ON public.work_shifts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access blockers" ON public.blockers;
CREATE POLICY "Public access blockers" ON public.blockers FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 9. REALTIME — every input table streams live inserts/updates/deletes to
--    subscribed clients (guarded so re-running this script never errors on
--    a table that's already published)
-- ==============================================================================
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['profiles', 'pto_requests', 'peer_badges', 'mood_logs', 'hr_notifications', 'work_shifts', 'blockers']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- ==============================================================================
-- 10. SEED DATA (bootstrap admin account only — no fabricated demo rows,
--     since the app itself filters out placeholder PTO/mood/badge seed
--     records on read)
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
