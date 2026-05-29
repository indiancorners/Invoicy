-- Supabase SQL Schema — Invoicy
--
-- Auth model: Clerk is the identity provider. Supabase is configured for Clerk
-- third-party auth, so every authenticated request carries a Clerk-signed JWT
-- whose `sub` claim is the Clerk user id (e.g. "user_2abc..."). RLS policies
-- compare that claim to the row owner. IDs are TEXT, not UUID, because Clerk
-- user ids are not UUIDs.
--
-- ⚠️ This script DROPs the tables first. Safe pre-launch (no production data);
-- do NOT run as-is once you have real customer rows.

drop table if exists invoices cascade;
drop table if exists profiles cascade;
drop table if exists processed_webhooks cascade;

-- 1. Profiles — one row per Clerk user.
create table profiles (
  id         text primary key,              -- Clerk user id
  email      text,                          -- nullable: webhook upserts without it
  is_premium boolean default false,
  created_at timestamptz default timezone('utc', now()) not null
);

-- 2. Invoices — the full InvoiceData object stored as JSONB.
create table invoices (
  id         text primary key,              -- InvoiceData.id
  user_id    text references profiles(id) on delete cascade,
  content    jsonb not null,
  created_at timestamptz default timezone('utc', now()) not null
);

-- 3. Processed webhooks — idempotency ledger, written server-side via the
--    service-role key (which bypasses RLS). Prevents double-processing of
--    Lemon Squeezy retries.
create table processed_webhooks (
  id           text primary key,
  event_name   text not null,
  processed_at timestamptz default timezone('utc', now()) not null
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table invoices enable row level security;

-- Profiles: a user may only see / create / update their own row.
create policy "select own profile" on profiles
  for select using ((select auth.jwt() ->> 'sub') = id);
create policy "insert own profile" on profiles
  for insert with check ((select auth.jwt() ->> 'sub') = id);
create policy "update own profile" on profiles
  for update using ((select auth.jwt() ->> 'sub') = id);

-- Invoices: scoped to the owning Clerk user.
create policy "select own invoices" on invoices
  for select using ((select auth.jwt() ->> 'sub') = user_id);
create policy "insert own invoices" on invoices
  for insert with check ((select auth.jwt() ->> 'sub') = user_id);
create policy "update own invoices" on invoices
  for update using ((select auth.jwt() ->> 'sub') = user_id);
create policy "delete own invoices" on invoices
  for delete using ((select auth.jwt() ->> 'sub') = user_id);

-- ---------------------------------------------------------------------------
-- Public share preview
-- ---------------------------------------------------------------------------
-- Anonymous visitors have no Clerk session, so RLS would block a direct table
-- read. This SECURITY DEFINER function returns an invoice ONLY when the caller
-- supplies both the id and the matching secret publicToken — no enumeration is
-- possible without the token. It bypasses RLS by design but stays safe because
-- the token check lives in SQL.
create or replace function get_public_invoice(p_id text, p_token text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select content
  from invoices
  where id = p_id
    and content ->> 'publicToken' = p_token
  limit 1;
$$;

grant execute on function get_public_invoice(text, text) to anon, authenticated;
