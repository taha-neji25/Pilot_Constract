-- Email verification at signup.
-- A new account is created UNCONFIRMED (Supabase refuses its logins with "email not confirmed") and gets a 6-digit code
-- by e-mail. The `signup` Edge Function checks the code and only then confirms the account.
-- Codes are stored as salted SHA-256 hashes, expire after 10 minutes and allow 5 wrong tries.

create table public.email_verifications (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  salt         text not null,
  code_hash    text not null,
  expires_at   timestamptz not null,
  attempts     int not null default 0,
  sent_count   int not null default 1,            -- codes sent in the current hour (resend limit)
  window_start timestamptz not null default now(),
  last_sent_at timestamptz not null default now()
);

alter table public.email_verifications enable row level security;  -- no policies: service role only

-- Looks an account up by e-mail: used by the Edge Function (auth.users is not exposed to the API).
create function public.signup_user(p_email text)
returns table (id uuid, confirmed boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select u.id, (u.email_confirmed_at is not null)
  from auth.users u
  where lower(u.email) = lower(p_email)
  limit 1
$$;

-- Counts one wrong/right try and returns the new count (null when there is no code pending). Atomic, so parallel
-- guesses cannot get around the limit.
create function public.bump_verification_attempt(p_user uuid)
returns int
language sql
security definer
set search_path = ''
as $$
  update public.email_verifications set attempts = attempts + 1 where user_id = p_user returning attempts
$$;

-- Removes accounts that asked for a code but never verified within 2 days (only accounts created by this flow).
create function public.purge_unverified()
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  n int;
begin
  delete from auth.users u
  where u.email_confirmed_at is null
    and u.created_at < now() - interval '2 days'
    and exists (select 1 from public.email_verifications v where v.user_id = u.id);
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on public.email_verifications from anon, authenticated;
grant all on public.email_verifications to service_role;
revoke all on function public.signup_user(text), public.bump_verification_attempt(uuid), public.purge_unverified()
  from public, anon, authenticated;
grant execute on function public.signup_user(text), public.bump_verification_attempt(uuid), public.purge_unverified()
  to service_role;
