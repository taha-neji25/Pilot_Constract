# Compliance notes: pilotconstract.com

Written 28 Oct 2026. **This is a technical and practical review, not legal advice.** Nobody can promise "no risk". Have a
Tunisian lawyer read the five legal pages once (about an hour); the points marked **LAWYER** need their confirmation.

## What the site does with data (the legal pages describe exactly this)

| Item | Reality |
|---|---|
| Analytics, ads, trackers, pixels | **None.** No code for them exists in the site. |
| Cookies | **None set by the site.** Checked in a real browser on 16 pages. |
| Browser storage | `pilot-constract-lang` (only after the visitor picks a language) and the login session (only when logged in). |
| Third parties contacted when a page opens | **None.** Fonts are now served from the site itself (they used to come from Google, which sends every visitor's IP address to Google). |
| Embeds (maps, videos, widgets, iframes) | **None.** Maps/WhatsApp/social are plain links. |
| Data collected at signup | First name, last name, e-mail, phone (+ country), account type, password (stored hashed by Supabase). **No** address, birth date, gender, tax id or job title any more. |
| Consent | Required, unticked checkbox (Terms + Privacy). The server refuses a signup without it and stores the date and the version accepted (`consent_at`, `consent_version`). |
| IP addresses | Kept at most 24 h for abuse protection (automatic deletion). |
| Unverified accounts | Deleted automatically after 2 days. |
| Where data lives | Supabase, Frankfurt (Germany). E-mail codes go through Resend (USA). Pages are served by GitHub Pages (USA). |

## Which rules apply (to be confirmed by the lawyer)

* **Tunisian Organic Law n° 2004-63 of 27 July 2004 on the protection of personal data** (authority: **INPDP**,
  www.inpdp.nat.tn). Points taken from a law-firm guide to the law (check against the official text): processing needs a
  **prior declaration to the INPDP** (art. 7); security measures (art. 18-19); destruction when no longer needed (art. 45);
  **sending personal data abroad needs INPDP authorisation** (art. 52; the INPDP decides within one month; art. 90 sets a penalty of
  one year in prison and 5,000 DT for a transfer without it). Rights of access/objection exist in the law.
* **Law n° 2000-83 on electronic exchanges and commerce**: applies to online sales. The site sells nothing online. If you ever add
  online ordering or payment, the information duties and the 10-day withdrawal period for consumers will apply (draft law 42/2024
  on online sales is also pending).
* **Consumer protection (law 92-117)** and **misleading advertising**: this is why unproven claims and fake reviews were removed.
* **Copyright and trademarks** (law 94-36 and the trademark law): photos, logos, fonts.
* **No Tunisian cookie statute was found**, so no cookie banner is legally needed for a site that sets none. If you ever add analytics,
  ads, a chat widget or an embedded video, add a consent banner **before** switching it on and update the Cookie Policy.
* **GDPR**: only if you deliberately target people in the EU. The site is built so it would be close to compliant anyway
  (no trackers, minimal data, EU hosting, consent, rights by e-mail).

## What YOU must do (the site cannot do these)

1. **HIGH: INPDP formalities.** Declare the processing (account data, quotes) to the INPDP, and ask for the **authorisation to transfer data
   abroad** (Supabase in Germany, Resend/GitHub in the USA). Ask the lawyer or the INPDP how a cloud-hosted site is handled in practice.
   Until this is done, the privacy policy must not (and does not) claim that it was.
2. **Fill in your legal identity** in `frontend/src/data/company.js` -> `LEGAL` (legal form, capital, trade register/RNE number, matricule fiscal, name
   of the publication director). They appear on the Legal Notice page as soon as they are filled in. This is the "business details" part: the
   rest (names, addresses, phones, e-mail, hours) is already there.
3. **LAWYER: confirm these choices I made for you**: courts of **Sfax** for disputes; **French version prevails** over Arabic/English; you answer
   rights requests **within one month**; refunds/cancellations are governed by the **signed quote or contract** (so your quotes/contracts must
   state deposit, cancellation and refund terms); the site is for **adults/professionals (18+)**.
4. **Keep proof** (a folder with the messages/emails): the two client testimonials (SO.MA.TRAV, MTR-Ressort) and their permission; the written
   permission of the six partner companies to show their logos; that you own the photos in the gallery (you or your staff took them) and
   that no photo shows a recognisable person without their consent (faces were already removed).
5. **Check "5 countries served".** You confirmed it is true, but you could not confirm "projects delivered abroad". If you serve clients in five
   countries, be ready to show it; if not, remove that figure (it is in `frontend/src/i18n/translations.js`, `home.stats`).
6. **Public GitHub repository.** It was public and contained an unrelated document (`App_Project_Proposal.docx`). It is no longer in the current
   files, but **it is still in the Git history**. Decide with me whether to erase the history (needs a force-push) and make the repository private if
   you prefer (GitHub Pages on a private repository needs a paid plan).
7. Accounts created **before** the consent box (the three administrators) have no consent record: this is normal, nothing to do.
8. Supabase: turn on "Leaked password protection" if your plan allows it; keep your own database backups.

## What changed in the code (for the record)

* Pages: Privacy Policy, Terms, Cookie Policy, Refund Policy, Legal Notice (fr/en/ar), linked in the footer and the sitemap:
  `frontend/src/i18n/legal*.js`; names and addresses come from `frontend/src/data/company.js`.
* Signup: fewer fields, consent checkbox, server-side check (`supabase/functions/_shared/signup.js`), database migration `consent_and_minimal_data`.
* Removed: 3 sample testimonials with no real client; every "certified workshop" (no certificate); "projects delivered internationally"; "industry leaders /
  exceptional results".
* Language flags (US for English, the historical pan-Arab "Arab Revolt" flag for Arabic, France for French): kept at the owner's request. They are decorative
  (the language name is always written next to them). Keep a note of where the three image files came from.
* Fonts self-hosted (`@fontsource/*`, SIL Open Font License).
* Accessibility: automated audit (axe-core, WCAG 2.1 A/AA) = 0 violations on 26 pages x desktop/phone; text blue darkened to 5:1 contrast; heading levels;
  skip link; focus moves to the page heading after each page change; visible focus ring on light and dark areas; language menu and photo viewer work
  with the keyboard (Escape, focus trap, focus returns); each photo has its own alt text; the menu button is translated.
  **Limits:** automated tools find only part of the problems. Do a 30-minute test with a screen reader (NVDA) in French and Arabic when you can.

## Keeping it compliant

* Change a policy -> update `LEGAL_UPDATED` in `company.js` **and** `CONSENT_VERSION` in `supabase/functions/_shared/signup.js` (and redeploy the `signup`
  function) when the change needs people to accept again.
* New tool that sets cookies or loads something from another company -> consent banner first, then update the Cookie and Privacy pages.
* New data field -> ask whether it is really needed, then update the Privacy Policy.
* `npm test` fails if a company name is typed by hand in a text, if a French page loses its name, or if page titles are too long.
