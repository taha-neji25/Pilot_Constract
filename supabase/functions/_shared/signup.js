// Signup logic, ported from the old Express backend (same rules, same English error strings: the frontend
// maps them to translated messages). Kept free of Deno/Node specifics so it can be unit-tested in Node:
// the HTTP wiring is in ../signup/index.ts, which injects the Supabase admin client, the phone library and the mailer.
//
// Accounts are created UNCONFIRMED: Supabase refuses their logins until the e-mail code is verified (see verification.js).

import { handleResend, handleVerify, issueCode } from "./verification.js";

// Practical email check: one @, sane local part, dotted domain with a 2+ letter TLD,
// no leading/trailing/consecutive dots, no spaces.
const EMAIL_RE =
  /^(?!\.)(?!.*\.\.)[A-Za-z0-9._%+-]{1,64}(?<!\.)@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;
const NAME_RE = /^\p{L}[\p{L} '.-]*$/u;

export const SIGNUP_LIMIT = 5; // attempts per IP...
export const SIGNUP_WINDOW = "1 hour"; // ...per window

// Version of the Terms and Privacy Policy the visitor accepted (kept with the account as proof of consent).
// Change it when those texts change in a way that needs a new acceptance.
export const CONSENT_VERSION = "2026-10-28";

// Returns { error } or { data } with cleaned values. Only what is needed is collected: name, e-mail, phone, account
// type and the password (kept by Supabase Auth as a one-way hash). No address, birth date, gender or tax id.
// `phone` = { parsePhoneNumberFromString, isSupportedCountry } from libphonenumber-js.
export function validateSignup(body, phone, now = new Date()) {
  const str = (k) => String(body?.[k] ?? "").trim();
  const firstName = str("firstName");
  const lastName = str("lastName");
  const email = str("email").toLowerCase();
  const phoneCountry = str("phoneCountry").toUpperCase();
  const password = String(body?.password ?? "");
  const accountType = str("accountType");

  if (!firstName || firstName.length > 50 || !NAME_RE.test(firstName))
    return { error: "First name is required" };
  if (!lastName || lastName.length > 50 || !NAME_RE.test(lastName))
    return { error: "Last name is required" };
  if (email.length > 254 || !EMAIL_RE.test(email)) return { error: "Invalid email" };

  const parsed = phone.isSupportedCountry(phoneCountry)
    ? phone.parsePhoneNumberFromString(str("phone"), phoneCountry)
    : undefined;
  if (!parsed?.isValid()) return { error: "Invalid phone number" };

  if (password.length < 8 || password.length > 72)
    return { error: "Password must be 8 to 72 characters" };
  if (!["person", "company"].includes(accountType)) return { error: "Invalid account type" };
  // the visitor must have ticked the box (accepting the Terms and the Privacy Policy): never assumed
  if (body?.consent !== true) return { error: "Consent required" };

  return {
    data: {
      profile: {
        name: `${firstName} ${lastName}`,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: parsed.number, // E.164
        phone_country: phoneCountry,
        account_type: accountType,
        consent_at: now.toISOString(),
        consent_version: CONSENT_VERSION,
      },
      password,
    },
  };
}

const first = (data) => (Array.isArray(data) ? data[0] : data) ?? null;
const isTaken = (e) => e.code === "email_exists" || /already|registered|exists/i.test(e.message ?? "");

// Returns { status, json }. `admin` is a Supabase client with the service-role key.
export async function handleSignup({ body, ip }, { admin, phone, mailer }) {
  const { data, error } = validateSignup(body, phone);
  if (error) return { status: 400, json: { error } };

  // Throttle per IP (also counts invalid attempts that got this far, which is the point).
  const { data: allowed, error: rateError } = await admin.rpc("check_signup_rate", {
    p_ip: ip,
    p_limit: SIGNUP_LIMIT,
    p_window: SIGNUP_WINDOW,
  });
  if (rateError) return { status: 500, json: { error: "Server error" } };
  if (!allowed) return { status: 429, json: { error: "Too many attempts, try again later" } };

  await admin.rpc("purge_unverified"); // tidy up: accounts that never verified within 2 days (errors ignored)

  // email_confirm: false = locked until the code sent by e-mail is verified.
  const credentials = { email: data.profile.email, password: data.password, email_confirm: false };
  let { data: created, error: createError } = await admin.auth.admin.createUser(credentials);
  if (createError && isTaken(createError)) {
    // a signup that was never verified does not block the address: replace it (nothing was ever usable on it)
    const stale = first((await admin.rpc("signup_user", { p_email: data.profile.email })).data);
    if (stale && !stale.confirmed) {
      await admin.auth.admin.deleteUser(stale.id);
      ({ data: created, error: createError } = await admin.auth.admin.createUser(credentials));
    }
  }
  if (createError) {
    if (isTaken(createError)) return { status: 409, json: { error: "Email already registered" } };
    if (createError.code === "weak_password") return { status: 400, json: { error: "Password must be 8 to 72 characters" } };
    return { status: 500, json: { error: "Server error" } };
  }

  const { error: profileError } = await admin.from("profiles").insert({ id: created.user.id, ...data.profile });
  if (profileError) {
    // Do not leave a login without a profile behind.
    await admin.auth.admin.deleteUser(created.user.id);
    return { status: 500, json: { error: "Server error" } };
  }

  // e-mail the code; if that is impossible, undo everything so the address stays free to try again
  const sent = await issueCode({ admin, mailer, userId: created.user.id, email: data.profile.email, lang: body?.lang });
  if (!sent.ok) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { status: sent.status, json: { error: sent.error } };
  }

  return { status: 201, json: { ok: true, verification: "email_code" } };
}

// One endpoint, three actions: { action: "verify" | "resend" } or a signup form (no action).
export function handleAccount(request, deps) {
  const action = request.body?.action;
  if (action === "verify") return handleVerify(request, deps);
  if (action === "resend") return handleResend(request, deps);
  return handleSignup(request, deps);
}
