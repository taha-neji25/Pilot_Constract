-- Pilot Constract: initial schema.
-- Logins live in Supabase Auth (auth.users). Everything else is here, behind Row Level Security:
--   * profiles: one row per user, written ONLY by the `signup` Edge Function (service role).
--   * quotes:   written ONLY by the `quote` Edge Function, so prices cannot be forged from the browser.
-- Browsers (anon / authenticated roles) may only READ their own rows.

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  name          text not null,
  first_name    text not null,
  last_name     text not null,
  email         text not null,
  phone         text not null,            -- E.164, e.g. +21620123456
  phone_country text not null,
  address       text not null,
  postal_code   text not null,
  account_type  text not null check (account_type in ('person', 'company')),
  birth_date    date,                      -- person only
  gender        text check (gender in ('male', 'female')),   -- person only
  tax_id        text,                      -- company only
  position      text,                      -- company only: the user's role in the company
  created_at    timestamptz not null default now(),
  constraint profiles_type_fields check (
    (account_type = 'person'  and birth_date is not null and gender is not null) or
    (account_type = 'company' and tax_id is not null and position is not null)
  )
);

alter table public.profiles enable row level security;

create policy "read own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

-- ------------------------------------------------------------------ quotes
create table public.quotes (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  input      jsonb not null,
  result     jsonb not null,
  created_at timestamptz not null default now()
);

create index quotes_user_idx on public.quotes (user_id, id desc);

alter table public.quotes enable row level security;

create policy "read own quotes"
  on public.quotes for select to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------- signup throttle
-- Signup creates users with the admin API (no confirmation e-mail), which skips Supabase Auth's own
-- sign-up rate limits, so the `signup` function limits attempts per IP address through this table.
create table public.signup_attempts (
  id         bigint generated always as identity primary key,
  ip         text not null,
  created_at timestamptz not null default now()
);

create index signup_attempts_ip_idx on public.signup_attempts (ip, created_at);

alter table public.signup_attempts enable row level security;  -- no policies: service role only

-- Records an attempt and returns whether it is allowed (at most p_limit per p_window per IP).
create function public.check_signup_rate(p_ip text, p_limit int, p_window interval)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  attempts int;
begin
  delete from public.signup_attempts where created_at < now() - interval '1 day';
  select count(*) into attempts
    from public.signup_attempts
    where ip = p_ip and created_at > now() - p_window;
  insert into public.signup_attempts (ip) values (p_ip);
  return attempts < p_limit;
end;
$$;

-- ---------------------------------------------------------------- keep-alive
-- Free projects pause after 7 days without activity. The scheduled GitHub workflow calls this
-- harmless function once a week (see .github/workflows/keepalive.yml).
create function public.ping()
returns int
language sql
stable
set search_path = ''
as $$ select 1 $$;

-- ------------------------------------------------------------------- grants
-- Explicit grants (new Supabase projects no longer expose tables to the API by default).
revoke all on public.profiles, public.quotes, public.signup_attempts from anon, authenticated;
revoke all on function public.check_signup_rate(text, int, interval) from public, anon, authenticated;

grant select on public.profiles, public.quotes to authenticated;
grant all    on public.profiles, public.quotes, public.signup_attempts to service_role;
grant usage, select on all sequences in schema public to service_role;
grant execute on function public.check_signup_rate(text, int, interval) to service_role;
grant execute on function public.ping() to anon, authenticated;
