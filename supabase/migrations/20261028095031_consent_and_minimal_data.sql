-- Data minimisation and proof of consent (28 Oct 2026).
-- New accounts no longer provide an address, postal code, birth date, gender, tax id or job position: those columns
-- stay (nullable) only for the few accounts created before, and nothing writes them any more.
alter table public.profiles drop constraint if exists profiles_type_fields;
alter table public.profiles
  alter column address drop not null,
  alter column postal_code drop not null;

-- When, and to which version of the Terms / Privacy Policy, the visitor gave consent at signup.
alter table public.profiles
  add column if not exists consent_at timestamptz,
  add column if not exists consent_version text;

comment on column public.profiles.consent_at is 'Moment the visitor ticked the box accepting the Terms and the Privacy Policy (null for accounts created before the box existed).';
comment on column public.profiles.consent_version is 'Version (date) of the Terms and Privacy Policy that was accepted.';
