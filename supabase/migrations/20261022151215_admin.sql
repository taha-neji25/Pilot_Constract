-- Admin dashboard: who is an admin, editable prices (with history), and read access to all clients' data for admins.
-- Customers keep seeing only their own rows; the new tables are invisible to them.

-- ------------------------------------------------------------------- admins
-- Accounts listed here can open /admin. There is no way to add one from the website: do it in the SQL editor:
--   insert into public.admins (user_id) select id from auth.users where email = 'someone@example.com';
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;  -- no policies: only the function below reads it

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()))
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

-- ------------------------------------------------------------------ pricing
-- The quote function reads these on every quote; admins edit them from the dashboard.
create table public.pricing (
  key        text primary key,
  value      numeric(12, 3) not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  constraint pricing_known_key check (
    key in ('framing_price_per_kg', 'calculation_rate_small', 'calculation_rate_large', 'calculation_threshold_m2')
  ),
  constraint pricing_sane_value check (
    (key = 'calculation_threshold_m2' and value between 1 and 50000) or
    (key <> 'calculation_threshold_m2' and value between 0.01 and 10000)
  )
);

insert into public.pricing (key, value) values
  ('framing_price_per_kg', 6.5),         -- TND per kg of steel, excl. tax
  ('calculation_rate_small', 15),        -- TND per m2, surface up to and including the threshold
  ('calculation_rate_large', 10),        -- TND per m2, whole surface when above the threshold
  ('calculation_threshold_m2', 100);     -- m2

create table public.pricing_history (
  id         bigint generated always as identity primary key,
  key        text not null,
  old_value  numeric(12, 3),
  new_value  numeric(12, 3) not null,
  changed_by uuid references auth.users (id) on delete set null,
  changed_at timestamptz not null default now()
);

alter table public.pricing enable row level security;
alter table public.pricing_history enable row level security;

create policy "admins read pricing"
  on public.pricing for select to authenticated
  using ((select public.is_admin()));

create policy "admins update pricing"
  on public.pricing for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admins read pricing history"
  on public.pricing_history for select to authenticated
  using ((select public.is_admin()));

-- stamps who/when on every change and keeps a history row (runs as the table owner, so it can write the history)
create function public.pricing_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := (select auth.uid());
  if new.value is distinct from old.value then
    insert into public.pricing_history (key, old_value, new_value, changed_by)
    values (new.key, old.value, new.value, (select auth.uid()));
  end if;
  return new;
end;
$$;

revoke all on function public.pricing_audit() from public, anon, authenticated;

create trigger pricing_audit
  before update on public.pricing
  for each row execute function public.pricing_audit();

-- -------------------------------------------- admins can read all clients and quotes
create policy "admins read all profiles"
  on public.profiles for select to authenticated
  using ((select public.is_admin()));

create policy "admins read all quotes"
  on public.quotes for select to authenticated
  using ((select public.is_admin()));

-- ------------------------------------------------------------------- grants
revoke all on public.admins, public.pricing, public.pricing_history from anon, authenticated;
grant select, update (value) on public.pricing to authenticated;   -- admins only, through the policies above
grant select on public.pricing_history to authenticated;
grant all on public.admins, public.pricing, public.pricing_history to service_role;
grant usage, select on all sequences in schema public to service_role;
