// E-mail verification codes: issue, check and re-send. Kept free of Deno/Node specifics for testing
// (the Edge Function injects the Supabase admin client and the mailer).
//
// Rules: 6 digits, valid 10 minutes, 5 tries per code (counted atomically in the database), a new code at most once a
// minute and 5 per hour per account, per-IP limits on top. Codes are stored as salted SHA-256 hashes, never in clear.

export const CODE_TTL_MS = 10 * 60 * 1000;
export const MAX_ATTEMPTS = 5;
export const RESEND_COOLDOWN_MS = 60 * 1000;
export const MAX_SENDS_PER_HOUR = 5;
const HOUR_MS = 60 * 60 * 1000;

const GENERIC_BAD_CODE = "Invalid or expired code"; // same answer for "no such account", "expired" and "wrong code"

const enc = new TextEncoder();
const toHex = (bytes) => [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
export const hashCode = async (salt, userId, code) =>
  toHex(await crypto.subtle.digest("SHA-256", enc.encode(`${salt}:${userId}:${code}`)));
const safeEqual = (a, b) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};
export const newCode = () => String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");
const newSalt = () => toHex(crypto.getRandomValues(new Uint8Array(16)));

const cleanEmail = (v) => String(v ?? "").trim().toLowerCase();
const looksLikeEmail = (e) => e.length <= 254 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
const first = (data) => (Array.isArray(data) ? data[0] : data) ?? null;

// Stores a fresh code for the account and e-mails it. Returns { ok: true } or { status, error }.
export async function issueCode({ admin, mailer, userId, email, lang, now = Date.now() }) {
  const code = newCode();
  const salt = newSalt();

  // keep counting the codes sent within the current hour, so "send a new code" cannot be abused
  const { data: previous } = await admin.from("email_verifications").select("sent_count, window_start").eq("user_id", userId).maybeSingle();
  const sameHour = previous && now - Date.parse(previous.window_start) < HOUR_MS;

  const { error } = await admin.from("email_verifications").upsert({
    user_id: userId,
    salt,
    code_hash: await hashCode(salt, userId, code),
    expires_at: new Date(now + CODE_TTL_MS).toISOString(),
    attempts: 0,
    sent_count: sameHour ? previous.sent_count + 1 : 1,
    window_start: sameHour ? previous.window_start : new Date(now).toISOString(),
    last_sent_at: new Date(now).toISOString(),
  });
  if (error) return { status: 500, error: "Server error" };

  const sent = await mailer.sendVerification({ to: email, code, lang });
  return sent ? { ok: true } : { status: 502, error: "Could not send the verification code" };
}

// { action: "verify", email, code } -> confirms the account when the code is right.
export async function handleVerify({ body, ip, now = Date.now() }, { admin }) {
  const email = cleanEmail(body?.email);
  const code = String(body?.code ?? "").trim();
  if (!looksLikeEmail(email) || !/^\d{6}$/.test(code)) return { status: 400, json: { error: GENERIC_BAD_CODE } };

  const { data: allowed } = await admin.rpc("check_signup_rate", { p_ip: `verify:${ip}`, p_limit: 30, p_window: "1 hour" });
  if (allowed === false) return { status: 429, json: { error: "Too many attempts, try again later" } };

  const account = first((await admin.rpc("signup_user", { p_email: email })).data);
  if (!account || account.confirmed) return { status: 400, json: { error: GENERIC_BAD_CODE } };

  const { data: row } = await admin.from("email_verifications").select("salt, code_hash, expires_at").eq("user_id", account.id).maybeSingle();
  if (!row || Date.parse(row.expires_at) < now) return { status: 400, json: { error: GENERIC_BAD_CODE } };

  // count this try first (atomic): parallel guesses cannot get more than MAX_ATTEMPTS
  const attempts = (await admin.rpc("bump_verification_attempt", { p_user: account.id })).data;
  if (attempts == null) return { status: 400, json: { error: GENERIC_BAD_CODE } };
  if (attempts > MAX_ATTEMPTS) return { status: 429, json: { error: "Too many attempts, request a new code" } };

  if (!safeEqual(await hashCode(row.salt, account.id, code), row.code_hash)) return { status: 400, json: { error: GENERIC_BAD_CODE } };

  const { error } = await admin.auth.admin.updateUserById(account.id, { email_confirm: true });
  if (error) return { status: 500, json: { error: "Server error" } };
  await admin.from("email_verifications").delete().eq("user_id", account.id);
  return { status: 200, json: { ok: true } };
}

// { action: "resend", email, lang } -> a new code. Answers the same for unknown or already verified addresses.
export async function handleResend({ body, ip, now = Date.now() }, { admin, mailer }) {
  const email = cleanEmail(body?.email);
  if (!looksLikeEmail(email)) return { status: 400, json: { error: GENERIC_BAD_CODE } };

  const { data: allowed } = await admin.rpc("check_signup_rate", { p_ip: `resend:${ip}`, p_limit: 20, p_window: "1 hour" });
  if (allowed === false) return { status: 429, json: { error: "Too many attempts, try again later" } };

  const account = first((await admin.rpc("signup_user", { p_email: email })).data);
  if (!account || account.confirmed) return { status: 200, json: { ok: true } }; // do not reveal which addresses exist

  const { data: row } = await admin.from("email_verifications").select("last_sent_at, sent_count, window_start").eq("user_id", account.id).maybeSingle();
  if (row) {
    if (now - Date.parse(row.last_sent_at) < RESEND_COOLDOWN_MS)
      return { status: 429, json: { error: "Please wait before asking for a new code" } };
    if (now - Date.parse(row.window_start) < HOUR_MS && row.sent_count >= MAX_SENDS_PER_HOUR)
      return { status: 429, json: { error: "Too many attempts, try again later" } };
  }

  const sent = await issueCode({ admin, mailer, userId: account.id, email, lang: body?.lang, now });
  return sent.ok ? { status: 200, json: { ok: true } } : { status: sent.status, json: { error: sent.error } };
}
