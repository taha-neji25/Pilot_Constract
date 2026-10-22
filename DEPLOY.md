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

## Day-to-day

| Task | How |
|---|---|
| Publish a site change | `git push` to `main` (GitHub builds and deploys) |
| Change prices / profile lists | edit `supabase/functions/_shared/calculators/*.js`, run `npm test`, redeploy the `quote` function (below) |
| Add another service calculator | add `supabase/functions/_shared/calculators/<service>.js`, register it in `quoteCalculator.js`, add its form in `frontend/src/pages/quoteForms.js` |
| Run the site locally | `frontend/.env.local` already points at the project; `npm run dev`. It talks to the **real** database, so prefer a second free Supabase project for experiments |
| Run the tests | `npm test` |
| Redeploy functions | `npx supabase login`, `npx supabase link --project-ref xtuwuethiumsuedhhgbi`, `npx supabase functions deploy quote signup --use-api` (or ask Claude, which can deploy through the Supabase connector) |
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
