# Deploying pilotconstract.com (GitHub Pages + Supabase)

```
 visitors ──► pilotconstract.com (GitHub Pages: the built React site, free)
                     │
                     └─► Supabase (free): Auth (logins) · Postgres (profiles, quotes)
                                          · Edge Functions: signup, quote (pricing logic + margin stay here)
```

Cost: 0 €/month (plus the domain you already pay at Porkbun). DNS already points at GitHub Pages, so nothing changes at Porkbun.

## Already done (22 Oct 2026)

- Supabase project **pilotconstract** (Frankfurt, free plan): URL `https://xtuwuethiumsuedhhgbi.supabase.co`, ref `xtuwuethiumsuedhhgbi`.
- Database schema applied from `supabase/migrations/` (tables, Row Level Security, throttle and keep-alive functions).
- Edge Functions `signup` and `quote` deployed.
- Tested live end to end: signup, login, profile, quote, history, and that one user cannot see another's data or forge a quote. Test accounts were deleted.

## Still to do

### 1. One switch in the Supabase dashboard (30 seconds)

Dashboard → your project → **Authentication → Sign In / Providers → Email** → turn **off "Allow new users to sign up"**.
Accounts are created only by the `signup` function (it validates the form and limits attempts). This switch stops anyone from
bypassing it with the public key. The function keeps working with the switch off.

### 2. GitHub repository and Pages

1. Create an **empty public repository** on github.com (no README, no .gitignore), for example `pilotconstract-site`.
2. In this folder (the first commit already exists):
   ```bash
   git remote add origin https://github.com/YOUR-USER/pilotconstract-site.git
   git push -u origin main        # a browser window opens once to sign in to GitHub
   ```
3. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. **Settings → Secrets and variables → Actions → Variables → New repository variable**, twice (both values are public):
   - `VITE_SUPABASE_URL` = `https://xtuwuethiumsuedhhgbi.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_onsZ2mYq9A6984wWu9jTGw_rdvWZ5Y1`
5. Move the domain: in the **old** site's repository, *Settings → Pages* → remove the custom domain. In the **new** repository,
   *Settings → Pages → Custom domain* → `pilotconstract.com` → Save, then tick **Enforce HTTPS** when it appears (can take a few minutes).
6. **Actions** tab → *Deploy site* → **Run workflow** (it also runs on every push to `main`). When it is green the site is live.

### 3. Test it

Open <https://pilotconstract.com>: create an account, log in, run a framing quote, refresh a deep link such as `/devis`.
Supabase dashboard → **Table Editor → profiles / quotes** shows the new rows.

## Admin dashboard (`/admin`)

Admins see an **Admin** link in the navbar. The page has three tabs:

- **Clients**: every account (name, phone, e-mail, address, tax ID / birth date, registration date), with each client's quotes.
- **Quotes**: all quotes, filterable by service and client, with the full breakdown (profiles and weights, taxes, total).
- **Prices**: the steel price per kg (framing), the two study rates per m² and the m² threshold. A change applies to **new** quotes at once; existing quotes keep their price. Every change is logged (who, when, old and new value).

Who is an admin is decided in the database only (the website cannot create admins). To add or remove one, run in the Supabase SQL editor:

```sql
insert into public.admins (user_id) select id from auth.users where email = 'someone@example.com';
delete from public.admins where user_id = (select id from auth.users where email = 'someone@example.com');
```

The security is enforced by the database (Row Level Security), not by the page: only admins can read other clients' data or the prices, whatever the browser does. Admins can read clients' personal data, so keep admin accounts to the people who need them and use strong passwords.
Optional hardening: Supabase dashboard → Authentication → Passwords → *Leaked password protection* (may need a paid plan).

## E-mail verification code at signup

New accounts are created **locked**. A 6-digit code is e-mailed to the address, and the account only works once the code is entered
(valid 10 minutes, 5 tries per code, a new code at most once a minute and 5 per hour). Accounts that never verify are deleted after 2 days.
Existing accounts are not affected.

The code needs an e-mail provider. Both options below are free for this volume:

**Resend (recommended)** — free: 100 e-mails a day, 3,000 a month
1. Create an account at <https://resend.com> and add the domain `pilotconstract.com` (Domains → Add domain).
2. Resend shows a few DNS records. Add them at **Porkbun** (your domain → DNS records), then press *Verify* in Resend (a few minutes, sometimes an hour).
3. Create an API key (API Keys → Create, permission *Sending access*).

**Brevo (alternative)** — free: 300 e-mails a day. Create an account, verify the sender address in *Senders & IP*, and create an API key.

Then give the key to the site as Supabase **secrets** (Dashboard → Edge Functions → Secrets, or the CLI):

| Secret | Value |
|---|---|
| `RESEND_API_KEY` (or `BREVO_API_KEY`) | the provider key |
| `MAIL_FROM` | `Pilot Constract <no-reply@pilotconstract.com>` (an address the provider has verified) |

Roll-out order (so nobody is blocked): the site (GitHub push) first, then the updated `signup` function, then a test signup with a real mailbox.
If the provider is not configured, or refuses, signup is **refused** with a clear message instead of silently skipping the verification.
Each signup uses one e-mail (plus any resend); the limits above are far from your expected volume.

## Google search (SEO)

The build (`npm run build`) writes one real HTML page per page and language, so Google reads the content without running JavaScript:

- French at the original addresses (`/`, `/services`, `/faq`...), English under `/en/`, Arabic under `/ar/`; one page per service (`/services/charpente-metallique-industrielle`...).
- Each page has its own title, description, canonical address, `hreflang` links, social preview and structured data (company, services, FAQ). Texts: `frontend/src/seo/meta.js` and `frontend/src/i18n/serviceDetails.js`; addresses: `frontend/src/seo/routes.js`.
- `sitemap.xml` and `robots.txt` are generated at the same time. Login, account, quote tool and admin pages are `noindex`.
- **Company names and address live in ONE file: `frontend/src/data/company.js`** (Pilot Constract, Pilotage et Construction, legal name, Arabic name, street address). Titles, headlines, descriptions, footer, contact page and structured data all read from it; an automated test fails if a name is typed into a text again. Phones, e-mail and social links: `frontend/src/data/contact.js`.
- Guides (`/guides`, 3 articles in 3 languages): texts in `frontend/src/i18n/guides.js`, addresses in `routes.js`. More guides = more ways to be found; write about questions clients actually ask.
- A new page or service needs: its address in `routes.js`, its texts, and nothing else (sitemap and tags follow).

What only the owner can do (a website alone does not make Google rank it):
1. **Google Search Console** (<https://search.google.com/search-console>): add the property `pilotconstract.com` (Domain, verify with the DNS record at Porkbun), then *Sitemaps* -> submit `sitemap.xml`. Check *Pages* after a week for problems.
2. **Google Business Profile** (<https://business.google.com>): create the profile for the Sfax workshop (name, address, phones, category, photos, opening hours, link to the site). This is what makes the company appear on Google Maps and in the local results ("charpente métallique Sfax").
3. **Reviews and links**: ask satisfied clients for a Google review; get the site listed in partner/supplier pages, directories and social profiles (Facebook, Instagram and LinkedIn already link to it).

## Legal and compliance (read `COMPLIANCE.md`)

Privacy Policy, Terms, Cookie Policy, Refund Policy and Legal Notice are in the footer (texts: `frontend/src/i18n/legal*.js`). Signup collects only name,
e-mail, phone and account type, and requires a ticked consent box. **Roll-out order for this change:** migration `consent_and_minimal_data` (already applied),
then deploy the `signup` function, then push the site (the new form sends `consent`, the old function would refuse it, and the new function refuses the old form).
Owner to-do list (INPDP declaration, legal identity fields, lawyer review, proofs): see `COMPLIANCE.md`.

## Day-to-day

| Task | How |
|---|---|
| Publish a site change | `git push` to `main` (GitHub builds and deploys) |
| Change prices | in the website: `/admin` → Prices (no code, no deploy) |
| Change profile lists or formulas | edit `supabase/functions/_shared/calculators/*.js`, run `npm test`, redeploy the `quote` function (below) |
| Add another service calculator | add `supabase/functions/_shared/calculators/<service>.js`, register it in `quoteCalculator.js`, add its form in `frontend/src/pages/quoteForms.js` |
| Run the site locally | `frontend/.env.local` already points at the project; `npm run dev`. It talks to the **real** database, so prefer a second free Supabase project for experiments |
| Run the tests | `npm test` |
| Redeploy functions | `npx supabase login`, `npx supabase link --project-ref xtuwuethiumsuedhhgbi`, `npx supabase functions deploy quote signup --use-api` (or ask Claude, which can deploy through the Supabase connector) |
| Change the e-mail wording | `supabase/functions/_shared/emailTemplates.js`, then redeploy the `signup` function |
| Change the database | add a new file in `supabase/migrations/` and `npx supabase db push` |

## Things to know

- **Free-plan pause**: Supabase pauses a free project after 7 days without activity. `.github/workflows/keepalive.yml`
  pings it every Monday and Thursday (it uses the same two repository variables). If it ever pauses, press *Restore* in the dashboard; data is kept.
- **Backups**: the free plan has no automatic backups. Customers' phone numbers, addresses, birth dates and tax IDs are stored,
  so export regularly: `npx supabase db dump --linked -f backup.sql` (needs Docker Desktop) and keep the file somewhere private. **Never commit it.**
- **Sessions** are kept in the browser's storage (the old site used an HTTP-only cookie). The site has no user-written content, which keeps the risk low.
- **Signup** gives an instant account without a confirmation e-mail (as before), limited to 5 attempts per hour per IP address. Logins are rate-limited by Supabase Auth.
- **Extra allowed origins** (e.g. a staging site): `npx supabase secrets set ALLOWED_ORIGINS="https://staging.example.com"`.
- **Old accounts**: accounts created on the old local server are test data and are not migrated; people simply sign up again. The retired backend is kept in `backend/`
  (see `backend/LEGACY.md`).
