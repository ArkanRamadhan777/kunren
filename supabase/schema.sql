-- kunren Supabase schema
-- Run this file in Supabase SQL Editor after creating your project.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rundown_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  title text not null,
  start_time time not null,
  end_time time not null,
  category text not null default 'personal',
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'pending' check (status in ('pending', 'active', 'done', 'skipped')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rundown_items_user_date_idx
  on public.rundown_items (user_id, date, start_time);

create table if not exists public.life_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rule_title text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists life_rules_user_created_idx
  on public.life_rules (user_id, created_at desc);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_name text not null,
  frequency text not null default 'daily',
  default_time time not null default '07:00',
  streak integer not null default 0,
  status_today boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists habits_user_created_idx
  on public.habits (user_id, created_at desc);

alter table public.habits
  add column if not exists default_time time not null default '07:00';

alter table public.rundown_items
  add column if not exists habit_id uuid references public.habits(id) on delete set null;

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  log_date date not null default current_date,
  status_today boolean not null default false,
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

create index if not exists habit_logs_user_date_idx
  on public.habit_logs (user_id, log_date);

create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  review_date date not null default current_date,
  notes text not null,
  completed_tasks integer not null default 0,
  skipped_tasks integer not null default 0,
  habit_consistency integer not null default 0,
  mood_score integer check (mood_score between 1 and 10),
  energy_score integer check (energy_score between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, review_date)
);

create index if not exists reflections_user_date_idx
  on public.reflections (user_id, review_date);

alter table public.profiles enable row level security;
alter table public.rundown_items enable row level security;
alter table public.life_rules enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.reflections enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can manage own rundown items" on public.rundown_items;
create policy "Users can manage own rundown items" on public.rundown_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage own life rules" on public.life_rules;
create policy "Users can manage own life rules" on public.life_rules
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage own habits" on public.habits;
create policy "Users can manage own habits" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage own habit logs" on public.habit_logs;
create policy "Users can manage own habit logs" on public.habit_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage own reflections" on public.reflections;
create policy "Users can manage own reflections" on public.reflections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_rundown_items_updated_at on public.rundown_items;
create trigger set_rundown_items_updated_at
  before update on public.rundown_items
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_reflections_updated_at on public.reflections;
create trigger set_reflections_updated_at
  before update on public.reflections
  for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
