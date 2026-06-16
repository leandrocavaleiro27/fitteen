-- Fit Teen — initial schema
-- Run this in Supabase SQL Editor AFTER enabling Google OAuth in Authentication > Providers

-- ─── PROFILES ───
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  target_calories numeric not null default 2500,
  target_protein numeric not null default 150,
  target_carbs numeric not null default 250,
  target_fat numeric not null default 70,
  macros_configured boolean not null default false,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── MEAL ENTRIES (multiple per day) ───
create table public.meal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null default (timezone('utc', now()))::date,
  food_name text,
  calories numeric not null default 0 check (calories >= 0),
  protein numeric not null default 0 check (protein >= 0),
  carbs numeric not null default 0 check (carbs >= 0),
  fat numeric not null default 0 check (fat >= 0),
  source text not null default 'manual' check (source in ('manual', 'ai')),
  created_at timestamptz not null default now()
);

create index meal_entries_user_date_idx on public.meal_entries (user_id, log_date desc);

-- ─── DAILY CHECK-INS (sleep + notes, one row per day) ───
create table public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  sleep_hours numeric check (sleep_hours is null or (sleep_hours >= 0 and sleep_hours <= 24)),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create index daily_checkins_user_date_idx on public.daily_checkins (user_id, log_date desc);

-- ─── WORKOUTS (multiple per day) ───
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null default (timezone('utc', now()))::date,
  routine_name text not null,
  created_at timestamptz not null default now()
);

create index workouts_user_date_idx on public.workouts (user_id, log_date desc);

-- ─── EXERCISES ───
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  exercise_name text not null,
  created_at timestamptz not null default now()
);

create index exercises_workout_idx on public.exercises (workout_id);

-- ─── EXERCISE SETS (weight kg × reps) ───
create table public.exercise_sets (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  weight_kg numeric not null check (weight_kg > 0),
  reps integer not null check (reps > 0),
  set_order integer not null default 1 check (set_order > 0),
  created_at timestamptz not null default now()
);

create index exercise_sets_exercise_idx on public.exercise_sets (exercise_id, set_order);

-- ─── AI SCAN LOG (max 6/day enforced in app + serverless) ───
create table public.ai_scan_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null default (timezone('utc', now()))::date,
  created_at timestamptz not null default now()
);

create index ai_scan_log_user_date_idx on public.ai_scan_log (user_id, log_date);

-- ─── UPDATED_AT TRIGGER ───
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger daily_checkins_updated_at
  before update on public.daily_checkins
  for each row execute function public.set_updated_at();

-- ─── AUTO-CREATE PROFILE ON SIGNUP ───
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── ROW LEVEL SECURITY ───
alter table public.profiles enable row level security;
alter table public.meal_entries enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.workouts enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_sets enable row level security;
alter table public.ai_scan_log enable row level security;

-- profiles
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- meal_entries
create policy "Users CRUD own meals"
  on public.meal_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- daily_checkins
create policy "Users CRUD own checkins"
  on public.daily_checkins for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- workouts
create policy "Users CRUD own workouts"
  on public.workouts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- exercises (via workout ownership)
create policy "Users CRUD exercises in own workouts"
  on public.exercises for all
  using (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

-- exercise_sets (via exercise → workout ownership)
create policy "Users CRUD sets in own exercises"
  on public.exercise_sets for all
  using (
    exists (
      select 1
      from public.exercises e
      join public.workouts w on w.id = e.workout_id
      where e.id = exercise_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.exercises e
      join public.workouts w on w.id = e.workout_id
      where e.id = exercise_id and w.user_id = auth.uid()
    )
  );

-- ai_scan_log: users can read own; inserts via service role in Netlify function
create policy "Users read own ai scans"
  on public.ai_scan_log for select
  using (auth.uid() = user_id);

-- ─── HELPER: today's scan count (for client display) ───
create or replace function public.ai_scans_today_count(p_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.ai_scan_log
  where user_id = p_user_id
    and log_date = (timezone('utc', now()))::date;
$$;

revoke all on function public.ai_scans_today_count(uuid) from public;
grant execute on function public.ai_scans_today_count(uuid) to authenticated;
