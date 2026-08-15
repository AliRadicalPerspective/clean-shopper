-- Clean Shopper — Supabase schema
--
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- It is idempotent, so re-running it is safe.
--
-- The brief rules out user accounts, so identity comes from Supabase's
-- anonymous sign-in: every browser silently gets a real auth.users row and a
-- stable auth.uid(). That is what makes row-level security meaningful here —
-- without it we would be keying rows on a guessable client-supplied id.
--
-- PREREQUISITE: enable Authentication → Sign In / Providers → Anonymous sign-ins.

-- One row per (anonymous) user. Preferences, cart, and history are small
-- documents that are always read and written whole, so they live as jsonb
-- rather than in separate relational tables.
create table if not exists public.user_state (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  preferences jsonb       not null default '{}'::jsonb,
  cart        jsonb       not null default '[]'::jsonb,
  history     jsonb       not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.user_state enable row level security;

-- A user may only ever see or touch their own row. Policies are dropped and
-- recreated so this file stays re-runnable.
drop policy if exists "own state: select" on public.user_state;
create policy "own state: select"
  on public.user_state for select
  using (auth.uid() = user_id);

drop policy if exists "own state: insert" on public.user_state;
create policy "own state: insert"
  on public.user_state for insert
  with check (auth.uid() = user_id);

drop policy if exists "own state: update" on public.user_state;
create policy "own state: update"
  on public.user_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own state: delete" on public.user_state;
create policy "own state: delete"
  on public.user_state for delete
  using (auth.uid() = user_id);

-- Keep updated_at honest; the client uses it to decide whether the remote row
-- or the local cache is the newer of the two.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_state_touch_updated_at on public.user_state;
create trigger user_state_touch_updated_at
  before update on public.user_state
  for each row execute function public.touch_updated_at();
