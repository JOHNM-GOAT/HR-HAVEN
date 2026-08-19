-- =========================================================
-- AXIONHR HAVEN - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- =========================================================
-- Run this script in your Supabase Project -> SQL Editor

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. PUBLIC PROFILES & USER ACCOUNTS
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text unique not null,
  role text check (role in ('admin', 'hr_manager', 'employee')) default 'employee',
  department text not null default 'Engineering',
  job_title text default 'Team Member',
  status text check (status in ('active', 'disabled')) default 'active',
  avatar_url text default 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  phone_number text,
  employee_id text,
  theme text default 'light',
  deleted_at timestamp with time zone,
  deleted_by text,
  deletion_reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_active timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. DAILY MOOD LOGS (Wellness Check-ins)
create table if not exists public.mood_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  mood text check (mood in ('thriving', 'good', 'okay', 'stressed', 'exhausted')) not null,
  energy_level integer check (energy_level between 1 and 5) not null,
  note text,
  is_anonymous_to_hr boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. HR CARING ALERTS & NOTIFICATIONS
create table if not exists public.hr_notifications (
  id uuid default gen_random_uuid() primary key,
  type text not null default 'teammate_flag',
  target_teammate text not null,
  reason text not null,
  submitted_by_anonymous boolean default true,
  status text check (status in ('pending', 'in_progress', 'resolved')) default 'pending',
  severity text check (severity in ('low', 'medium', 'high')) default 'medium',
  action_note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. PEER RECOGNITION BADGES (Social Connectivity)
create table if not exists public.peer_badges (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_name text not null,
  recipient_name text not null,
  badge_type text not null,
  message text not null,
  send_coffee boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. BURNOUT METRICS & TELEMETRY
create table if not exists public.burnout_metrics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade unique not null,
  overall_score integer check (overall_score between 0 and 100) default 50,
  meeting_hours_weekly numeric(4,1) default 15.0,
  meeting_hours_benchmark numeric(4,1) default 15.0,
  overtime_hours_weekly numeric(4,1) default 0.0,
  pto_days_used integer default 0,
  pto_days_remaining integer default 20,
  after_hours_activity_count integer default 0,
  consecutive_work_days integer default 0,
  trend text check (trend in ('improving', 'stable', 'worsening')) default 'stable',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.mood_logs enable row level security;
alter table public.hr_notifications enable row level security;
alter table public.peer_badges enable row level security;
alter table public.burnout_metrics enable row level security;

-- 8. ROW LEVEL SECURITY POLICIES

-- Profiles: Users can view their own profile; HR and Admins can view all active directory profiles
create policy "Profiles are viewable by user or HR/Admin" on public.profiles
  for select using (
    auth.uid() = id or exists (
      select 1 from public.profiles where id = auth.uid() and role in ('admin', 'hr_manager')
    )
  );

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Admins can insert and update all profiles" on public.profiles
  for all using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Mood Logs: User can manage own; HR can view aggregated logs
create policy "Users can view own mood logs" on public.mood_logs
  for select using (
    auth.uid() = user_id or exists (
      select 1 from public.profiles where id = auth.uid() and role in ('admin', 'hr_manager')
    )
  );

create policy "Users can insert own mood logs" on public.mood_logs
  for insert with check (auth.uid() = user_id);

-- HR Notifications: HR and Admins full access; any authenticated user can submit anonymous caring flags
create policy "HR and Admins manage all notifications" on public.hr_notifications
  for all using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role in ('admin', 'hr_manager')
    )
  );

create policy "Authenticated users can submit caring flags" on public.hr_notifications
  for insert with check (auth.role() = 'authenticated');

-- Peer Badges: Authenticated users can view badges and award them
create policy "Badges are viewable by everyone" on public.peer_badges
  for select using (true);

create policy "Users can award badges" on public.peer_badges
  for insert with check (auth.role() = 'authenticated');

-- 9. AUTH TRIGGER FOR AUTO-CREATING PROFILES
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role, department, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'employee'),
    coalesce(new.raw_user_meta_data->>'department', 'Engineering'),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop if exists and recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 10. REALTIME PUBLICATIONS
alter publication supabase_realtime add table public.hr_notifications;
alter publication supabase_realtime add table public.mood_logs;
alter publication supabase_realtime add table public.peer_badges;
alter publication supabase_realtime add table public.profiles;
