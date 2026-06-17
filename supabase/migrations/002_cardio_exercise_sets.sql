-- Fit Teen — cardio / running sets (distance + time)
-- Run in Supabase SQL Editor after 001_initial_schema.sql

alter table public.exercise_sets
  alter column weight_kg drop not null,
  alter column reps drop not null,
  add column if not exists distance_km numeric check (distance_km is null or distance_km > 0),
  add column if not exists duration_min numeric check (duration_min is null or duration_min > 0);

-- Each row is either strength (weight + reps) or cardio (distance + time)
alter table public.exercise_sets drop constraint if exists exercise_sets_mode_check;

alter table public.exercise_sets add constraint exercise_sets_mode_check check (
  (
    weight_kg is not null and reps is not null and weight_kg > 0 and reps > 0
    and distance_km is null and duration_min is null
  )
  or
  (
    distance_km is not null and duration_min is not null and distance_km > 0 and duration_min > 0
    and weight_kg is null and reps is null
  )
);
