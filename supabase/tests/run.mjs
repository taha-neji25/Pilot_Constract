// Unit tests for the Edge Function logic, run with plain Node:  node supabase/tests/run.mjs
// A tiny in-memory fake stands in for the Supabase admin client (no network, no Docker needed).
import assert from "node:assert/strict";
import { isSupportedCountry, parsePhoneNumberFromString } from "libphonenumber-js";
import { handleAccount, handleSignup, SIGNUP_LIMIT } from "../functions/_shared/signup.js";
import { handleResend, handleVerify, hashCode, MAX_ATTEMPTS, RESEND_COOLDOWN_MS } from "../functions/_shared/verification.js";
import { createMailer } from "../functions/_shared/mailer.js";
import { verificationEmail } from "../functions/_shared/emailTemplates.js";
import { handleQuote } from "../functions/_shared/quotes.js";
import { INDEXED_PAGES, LANGS, PRIVATE_PAGES, SLUGS, canonicalUrl, parsePath, pathFor } from "../../frontend/src/seo/routes.js";
import { jsonLdFor, pageMeta } from "../../frontend/src/seo/meta.js";

const phone = { isSupportedCountry, parsePhoneNumberFromString };

function fakeAdmin({ failProfile = false, failQuote = false, pricing = [], failPricing = false } = {}) {
  const db = { users: new Map(), profiles: [], quotes: [], attempts: new Map(), deleted: [], pricing, verifications: new Map() };
  let seq = 0;
  const insertable = (table, row) => {
    const result = (() => {
      if (table === "profiles" && failProfile) return { error: { message: "boom" } };
      if (table === "quotes" && failQuote) return { error: { message: "boom" } };
      db[table].push({ ...row, id: row.id ?? ++seq });
      return { error: null };
    })();
    // awaitable (profiles) and chainable .select().single() (quotes)
    return Object.assign(Promise.resolve(result), {
      select: () => ({
        single: async () => (result.error ? result : { data: { id: seq, created_at: "2026-10-22T00:00:00Z" }, error: null }),
      }),
    });
  };
  const byId = (id) => [...db.users.values()].find((u) => u.id === id);
  let userSeq = 0;
  return {
    db,
    rpc: async (name, args) => {
      if (name === "check_signup_rate") {
        const n = db.attempts.get(args.p_ip) ?? 0;
        db.attempts.set(args.p_ip, n + 1);
        return { data: n < args.p_limit, error: null };
      }
      if (name === "signup_user") {
        const u = db.users.get(String(args.p_email).toLowerCase());
        return { data: u ? [{ id: u.id, confirmed: u.confirmed }] : [], error: null };
      }
      if (name === "bump_verification_attempt") {
        const row = db.verifications.get(args.p_user);
        if (row) row.attempts += 1;
        return { data: row ? row.attempts : null, error: null };
      }
      return { data: null, error: null }; // purge_unverified
    },
    auth: {
      admin: {
        createUser: async ({ email, password, email_confirm }) => {
          if (db.users.has(email))
            return { data: null, error: { code: "email_exists", message: "A user with this email address has already been registered" } };
          const user = { id: `u${++userSeq}`, email, password, confirmed: email_confirm === true };
          db.users.set(email, user);
          return { data: { user }, error: null };
        },
        updateUserById: async (id, patch) => {
          const u = byId(id);
          if (u && patch.email_confirm) u.confirmed = true;
          return { error: null };
        },
        deleteUser: async (id) => {
          db.deleted.push(id);
          for (const [e, u] of db.users) if (u.id === id) db.users.delete(e);
          db.verifications.delete(id); // cascade
          return { error: null };
        },
      },
    },
    from: (table) => ({
      insert: (row) => insertable(table, row),
      upsert: async (row) => {
        db.verifications.set(row.user_id, { ...row });
        return { error: null };
      },
      delete: () => ({
        eq: async (_col, val) => {
          db.verifications.delete(val);
          return { error: null };
        },
      }),
      select: () => {
        // `await ...select()` (pricing rows set by the admin dashboard) or `...select().eq(col, val).maybeSingle()`
        const all =
          table === "pricing"
            ? { data: failPricing ? null : db.pricing, error: failPricing ? { message: "boom" } : null }
            : { data: [], error: null };
        return Object.assign(Promise.resolve(all), {
          eq: (_col, val) => ({ maybeSingle: async () => ({ data: table === "email_verifications" ? (db.verifications.get(val) ?? null) : null, error: null }) }),
        });
      },
    }),
  };
}

// a mailer that remembers the codes instead of sending them
function fakeMailer({ fail = false } = {}) {
  const sent = [];
  return {
    sent,
    last: () => sent[sent.length - 1],
    sendVerification: async ({ to, code, lang }) => {
      if (fail) return false;
      sent.push({ to, code, lang });
      return true;
    },
  };
}

const person = {
  firstName: "Amine", lastName: "Ben Salah", email: "  Amine@Example.com ", phoneCountry: "TN", phone: "20 123 456",
  address: "1 rue Test, Sfax", postalCode: "3000", password: "correct-horse", accountType: "person",
  birthDate: "1990-05-01", gender: "male",
};
const company = {
  ...person, email: "boss@acme.tn", accountType: "company", taxId: "1234567/A/M/000", position: "Manager",
  birthDate: undefined, gender: undefined,
};

let passed = 0;
const test = async (name, fn) => {
  await fn();
  passed++;
  console.log("ok -", name);
};
const signup = (body, admin = fakeAdmin(), ip = "1.1.1.1", mailer = fakeMailer()) => handleSignup({ body, ip }, { admin, phone, mailer });

await test("signup: valid person -> 201, LOCKED account + profile stored, E.164 phone, email normalised, code e-mailed", async () => {
  const admin = fakeAdmin();
  const mailer = fakeMailer();
  const r = await signup(person, admin, "1.1.1.1", mailer);
  assert.equal(r.status, 201);
  assert.deepEqual(r.json, { ok: true, verification: "email_code" });
  assert.equal(admin.db.users.get("amine@example.com").confirmed, false, "the account must be locked until the code is verified");
  assert.equal(admin.db.profiles.length, 1);
  const p = admin.db.profiles[0];
  assert.equal(p.email, "amine@example.com");
  assert.equal(p.phone, "+21620123456");
  assert.equal(p.name, "Amine Ben Salah");
  assert.equal(p.account_type, "person");
  assert.equal(p.tax_id, null);
  assert.equal(p.id, admin.db.users.get("amine@example.com").id);
  assert.equal(JSON.stringify(admin.db.profiles).includes("correct-horse"), false, "password must never be stored in the profile");
  assert.equal(mailer.sent.length, 1);
  assert.equal(mailer.last().to, "amine@example.com");
  assert.match(mailer.last().code, /^\d{6}$/);
  assert.equal(JSON.stringify(r.json).includes(mailer.last().code), false, "the code must never be returned to the browser");
});

await test("signup: valid company -> 201 with tax id and position", async () => {
  const admin = fakeAdmin();
  const r = await signup(company, admin);
  assert.equal(r.status, 201);
  assert.equal(admin.db.profiles[0].tax_id, "1234567/A/M/000");
  assert.equal(admin.db.profiles[0].birth_date, null);
});

await test("signup: email already used by a VERIFIED account -> 409", async () => {
  const admin = fakeAdmin();
  const mailer = fakeMailer();
  await signup(person, admin, "1.1.1.1", mailer);
  await handleVerify({ body: { email: "amine@example.com", code: mailer.last().code }, ip: "9.9.9.9" }, { admin });
  const r = await signup(person, admin, "2.2.2.2", mailer);
  assert.equal(r.status, 409);
  assert.equal(r.json.error, "Email already registered");
});

for (const [label, patch, message] of [
  ["missing first name", { firstName: "" }, "First name is required"],
  ["digits in last name", { lastName: "B3n" }, "Last name is required"],
  ["bad email", { email: "nope@" }, "Invalid email"],
  ["bad phone", { phone: "123" }, "Invalid phone number"],
  ["unsupported phone country", { phoneCountry: "ZZ" }, "Invalid phone number"],
  ["no address", { address: " " }, "Address is required"],
  ["bad postal code", { postalCode: "!" }, "Invalid postal code"],
  ["short password", { password: "short" }, "Password must be 8 to 72 characters"],
  ["long password", { password: "x".repeat(73) }, "Password must be 8 to 72 characters"],
  ["bad account type", { accountType: "alien" }, "Invalid account type"],
  ["future birth date", { birthDate: "2999-01-01" }, "Invalid birth date"],
  ["bad gender", { gender: "x" }, "Invalid gender"],
]) {
  await test(`signup: ${label} -> 400 "${message}"`, async () => {
    const admin = fakeAdmin();
    const r = await signup({ ...person, ...patch }, admin);
    assert.equal(r.status, 400);
    assert.equal(r.json.error, message);
    assert.equal(admin.db.users.size, 0, "no user created on invalid input");
  });
}

await test("signup: company with bad tax id / missing position -> 400", async () => {
  assert.equal((await signup({ ...company, taxId: "!" })).json.error, "Invalid tax ID");
  assert.equal((await signup({ ...company, position: "" })).json.error, "Position is required");
});

await test(`signup: attempt ${SIGNUP_LIMIT + 1} from one IP -> 429, other IP unaffected`, async () => {
  const admin = fakeAdmin();
  for (let i = 0; i < SIGNUP_LIMIT; i++)
    assert.equal((await signup({ ...person, email: `a${i}@example.com` }, admin)).status, 201);
  const blocked = await signup({ ...person, email: "late@example.com" }, admin);
  assert.equal(blocked.status, 429);
  assert.equal(blocked.json.error, "Too many attempts, try again later");
  assert.equal(admin.db.users.has("late@example.com"), false);
  assert.equal((await signup({ ...person, email: "other@example.com" }, admin, "9.9.9.9")).status, 201);
});

await test("signup: profile insert failure -> 500 and the login is rolled back", async () => {
  const admin = fakeAdmin({ failProfile: true });
  const r = await signup(person, admin);
  assert.equal(r.status, 500);
  assert.equal(admin.db.users.size, 0);
  assert.equal(admin.db.deleted.length, 1);
});

// ---------------------------------------------------------------- e-mail verification
const verify = (admin, email, code, extra = {}) => handleVerify({ body: { email, code }, ip: "5.5.5.5", ...extra }, { admin });
const resend = (admin, mailer, email, extra = {}) => handleResend({ body: { email, lang: "en" }, ip: "6.6.6.6", ...extra }, { admin, mailer });
const wrongOf = (code) => String((Number(code) + 1) % 1_000_000).padStart(6, "0");

await test("verify: the right code unlocks the account, once", async () => {
  const admin = fakeAdmin();
  const mailer = fakeMailer();
  await signup(person, admin, "1.1.1.1", mailer);
  const { code } = mailer.last();
  const r = await verify(admin, " Amine@Example.com ", code);
  assert.equal(r.status, 200);
  assert.deepEqual(r.json, { ok: true });
  assert.equal(admin.db.users.get("amine@example.com").confirmed, true);
  assert.equal(admin.db.verifications.size, 0, "the code is deleted once used");
  assert.equal((await verify(admin, "amine@example.com", code)).status, 400, "a used code cannot be replayed");
});

await test("verify: the code is stored only as a salted hash, never in clear", async () => {
  const admin = fakeAdmin();
  const mailer = fakeMailer();
  await signup(person, admin, "1.1.1.1", mailer);
  const row = [...admin.db.verifications.values()][0];
  const { code } = mailer.last();
  assert.equal(JSON.stringify(row).includes(code), false);
  assert.match(row.code_hash, /^[0-9a-f]{64}$/);
  assert.equal(row.code_hash, await hashCode(row.salt, admin.db.users.get("amine@example.com").id, code));
  await signup({ ...person, email: "other@example.com" }, admin, "1.1.1.1", mailer);
  const salts = [...admin.db.verifications.values()].map((v) => v.salt);
  assert.notEqual(salts[0], salts[1], "every code gets its own salt");
});

await test("verify: wrong code / unknown address / bad format -> the SAME 400 answer (nothing to learn from it)", async () => {
  const admin = fakeAdmin();
  const mailer = fakeMailer();
  await signup(person, admin, "1.1.1.1", mailer);
  const { code } = mailer.last();
  const answers = [
    await verify(admin, "amine@example.com", wrongOf(code)),
    await verify(admin, "nobody@example.com", code),
    await verify(admin, "amine@example.com", "12345"),
    await verify(admin, "amine@example.com", "abcdef"),
    await verify(admin, "not-an-email", code),
    await verify(admin, "amine@example.com", ""),
  ];
  for (const a of answers) {
    assert.equal(a.status, 400);
    assert.equal(a.json.error, "Invalid or expired code");
  }
  assert.equal(admin.db.users.get("amine@example.com").confirmed, false);
});

await test(`verify: ${MAX_ATTEMPTS} wrong tries lock the code, even the right one, until a new code is requested`, async () => {
  const admin = fakeAdmin();
  const mailer = fakeMailer();
  await signup(person, admin, "1.1.1.1", mailer);
  const { code } = mailer.last();
  for (let i = 0; i < MAX_ATTEMPTS; i++) assert.equal((await verify(admin, "amine@example.com", wrongOf(code))).status, 400);
  const locked = await verify(admin, "amine@example.com", code);
  assert.equal(locked.status, 429);
  assert.equal(locked.json.error, "Too many attempts, request a new code");
  assert.equal(admin.db.users.get("amine@example.com").confirmed, false);
  // a new code (after the cooldown) works again
  const later = Date.now() + RESEND_COOLDOWN_MS + 1000;
  assert.equal((await resend(admin, mailer, "amine@example.com", { now: later })).status, 200);
  assert.equal((await verify(admin, "amine@example.com", mailer.last().code, { now: later })).status, 200);
});

await test("verify: an expired code (after 10 minutes) is refused", async () => {
  const admin = fakeAdmin();
  const mailer = fakeMailer();
  await signup(person, admin, "1.1.1.1", mailer);
  const { code } = mailer.last();
  const r = await verify(admin, "amine@example.com", code, { now: Date.now() + 10 * 60 * 1000 + 5000 });
  assert.equal(r.status, 400);
  assert.equal(admin.db.users.get("amine@example.com").confirmed, false);
  assert.equal((await verify(admin, "amine@example.com", code, { now: Date.now() + 9 * 60 * 1000 })).status, 200, "still fine at 9 minutes");
});

await test("verify: a per-IP limit stops brute forcing across many accounts", async () => {
  const admin = fakeAdmin();
  let last;
  for (let i = 0; i < 31; i++) last = await verify(admin, `user${i}@example.com`, "123456");
  assert.equal(last.status, 429);
});

await test("resend: unknown or already verified address -> 200 and NO e-mail (does not reveal who has an account)", async () => {
  const admin = fakeAdmin();
  const mailer = fakeMailer();
  assert.equal((await resend(admin, mailer, "ghost@example.com")).status, 200);
  await signup(person, admin, "1.1.1.1", mailer);
  await verify(admin, "amine@example.com", mailer.last().code);
  const before = mailer.sent.length;
  assert.equal((await resend(admin, mailer, "amine@example.com")).status, 200);
  assert.equal(mailer.sent.length, before);
});

await test("resend: once a minute, 5 an hour; a new code replaces the old one", async () => {
  const admin = fakeAdmin();
  const mailer = fakeMailer();
  await signup(person, admin, "1.1.1.1", mailer);
  const first = mailer.last().code;
  const t0 = Date.now();
  const tooSoon = await resend(admin, mailer, "amine@example.com", { now: t0 + 10_000 });
  assert.equal(tooSoon.status, 429);
  assert.equal(tooSoon.json.error, "Please wait before asking for a new code");
  assert.equal(mailer.sent.length, 1, "nothing was sent while waiting");

  assert.equal((await resend(admin, mailer, "amine@example.com", { now: t0 + 61_000 })).status, 200);
  const second = mailer.last().code;
  assert.equal(mailer.sent.length, 2);
  if (second !== first) assert.equal((await verify(admin, "amine@example.com", first, { now: t0 + 62_000 })).status, 400, "the old code no longer works");

  // sends 3, 4, 5 within the hour are allowed, the 6th is refused
  for (let i = 0; i < 3; i++) assert.equal((await resend(admin, mailer, "amine@example.com", { now: t0 + (2 + i) * 61_000 })).status, 200);
  assert.equal(mailer.sent.length, 5);
  const sixth = await resend(admin, mailer, "amine@example.com", { now: t0 + 6 * 61_000 });
  assert.equal(sixth.status, 429);
  assert.equal(sixth.json.error, "Too many attempts, try again later");
  assert.equal(mailer.sent.length, 5);
});

await test("signup: if the e-mail cannot be sent -> 502 and everything is rolled back (the address stays free)", async () => {
  const admin = fakeAdmin();
  const r = await signup(person, admin, "1.1.1.1", fakeMailer({ fail: true }));
  assert.equal(r.status, 502);
  assert.equal(r.json.error, "Could not send the verification code");
  assert.equal(admin.db.users.size, 0);
  assert.equal(admin.db.verifications.size, 0);
  assert.equal((await signup(person, admin, "2.2.2.2", fakeMailer())).status, 201, "the same address can try again");
});

await test("signup: an abandoned, never-verified signup does not block the address (it is replaced, old code dies)", async () => {
  const admin = fakeAdmin();
  const mailer = fakeMailer();
  await signup(person, admin, "1.1.1.1", mailer);
  const oldCode = mailer.last().code;
  const oldId = admin.db.users.get("amine@example.com").id;
  const r = await signup({ ...person, password: "another-password" }, admin, "2.2.2.2", mailer);
  assert.equal(r.status, 201);
  const fresh = admin.db.users.get("amine@example.com");
  assert.notEqual(fresh.id, oldId);
  assert.equal(fresh.password, "another-password");
  assert.equal(fresh.confirmed, false);
  if (mailer.last().code !== oldCode) assert.equal((await verify(admin, "amine@example.com", oldCode)).status, 400);
  assert.equal((await verify(admin, "amine@example.com", mailer.last().code)).status, 200);
});

await test("handleAccount: routes verify / resend / signup by the `action` field", async () => {
  const admin = fakeAdmin();
  const mailer = fakeMailer();
  const deps = { admin, phone, mailer };
  assert.equal((await handleAccount({ body: person, ip: "1.1.1.1" }, deps)).status, 201);
  assert.equal((await handleAccount({ body: { action: "resend", email: "amine@example.com" }, ip: "1.1.1.1" }, deps)).status, 429); // within the minute
  assert.equal((await handleAccount({ body: { action: "verify", email: "amine@example.com", code: mailer.last().code }, ip: "1.1.1.1" }, deps)).status, 200);
});

// ---- the e-mail itself and the provider calls
await test("e-mail: fr / en / ar versions contain the code, 10 minutes, and escape the HTML", async () => {
  for (const lang of ["fr", "en", "ar"]) {
    const m = verificationEmail("482913", lang);
    assert.ok(m.subject.includes("Pilot Constract"));
    assert.ok(m.text.includes("482913") && m.html.includes("482913"));
    assert.ok(/10/.test(m.text));
    assert.equal(m.html.includes(`lang="${lang}"`), true);
  }
  assert.ok(verificationEmail("123456", "ar").html.includes('dir="rtl"'));
  assert.ok(verificationEmail("123456", "xx").subject.includes("Votre"), "unknown language falls back to French");
  assert.equal(verificationEmail("<b>1</b>", "en").html.includes("<b>1</b>"), false, "html is escaped");
});

await test("mailer: Resend and Brevo request shapes; no provider or a refusal -> false; the code is never logged", async () => {
  const calls = [];
  const okFetch = async (url, init) => (calls.push({ url, init, body: JSON.parse(init.body) }), { ok: true, status: 200, text: async () => "" });
  const logs = [];
  const realError = console.error;
  console.error = (...a) => logs.push(a.join(" "));
  try {
    const resendMailer = createMailer({ resendKey: "re_test", from: "Pilot Constract <no-reply@pilotconstract.com>" }, okFetch);
    assert.equal(await resendMailer.sendVerification({ to: "a@b.co", code: "111222", lang: "en" }), true);
    assert.equal(calls[0].url, "https://api.resend.com/emails");
    assert.equal(calls[0].init.headers.Authorization, "Bearer re_test");
    assert.deepEqual(calls[0].body.to, ["a@b.co"]);
    assert.equal(calls[0].body.from, "Pilot Constract <no-reply@pilotconstract.com>");
    assert.ok(calls[0].body.text.includes("111222"));

    const brevoMailer = createMailer({ brevoKey: "xkey", from: "Pilot Constract <no-reply@pilotconstract.com>" }, okFetch);
    assert.equal(await brevoMailer.sendVerification({ to: "a@b.co", code: "333444", lang: "fr" }), true);
    assert.equal(calls[1].url, "https://api.brevo.com/v3/smtp/email");
    assert.equal(calls[1].init.headers["api-key"], "xkey");
    assert.deepEqual(calls[1].body.sender, { name: "Pilot Constract", email: "no-reply@pilotconstract.com" });
    assert.deepEqual(calls[1].body.to, [{ email: "a@b.co" }]);

    const before = calls.length;
    assert.equal(await createMailer({}, okFetch).sendVerification({ to: "a@b.co", code: "555666", lang: "en" }), false);
    assert.equal(calls.length, before, "no provider configured: nothing is sent");
    const refused = async () => ({ ok: false, status: 403, text: async () => "domain not verified" });
    assert.equal(await createMailer({ resendKey: "k", from: "x@y.z" }, refused).sendVerification({ to: "a@b.co", code: "777888", lang: "en" }), false);
    const boom = async () => { throw new Error("network down"); };
    assert.equal(await createMailer({ resendKey: "k", from: "x@y.z" }, boom).sendVerification({ to: "a@b.co", code: "999000", lang: "en" }), false);
    for (const code of ["111222", "333444", "555666", "777888", "999000"]) assert.equal(logs.join("\n").includes(code), false, "the code must never be logged");
  } finally {
    console.error = realError;
  }
});

// ---------------------------------------------------------------- quotes
const user = { id: "u1" };
// Every position now starts on "none"; these are the profiles the sheet used to pre-select (its example hall).
const sheetProfiles = {
  posts: "IPE 270", rafters: "IPE 300", gablePosts: "IPE 220", purlins: "Pane C 160/2.5", struts: "HEA 100",
  bracing: "CE 60", anchorRods: "Rond 25", basePlates: "tole 20", cleats: "tole 6", underPlates: "tole 4",
};
const hall = { action: "create", service: "framing", length: 24, width: 18, height: 6, baySpacing: 6 };
const framing = { ...hall, profiles: sheetProfiles };
const quote = (body, u = user, admin = fakeAdmin()) => handleQuote({ user: u, body }, { admin });

await test("quote: no user -> 401", async () => {
  assert.equal((await quote(framing, null)).status, 401);
  assert.equal((await quote({ action: "forms" }, null)).status, 401);
});

await test("quote: forms -> 14 profile positions, each list starts with none", async () => {
  const r = await quote({ action: "forms" });
  assert.equal(r.status, 200);
  assert.equal(r.json.framing.profiles.length, 14);
  assert.ok(r.json.framing.profiles.every((p) => p.options[0] === "_"));
  assert.ok(r.json.framing.profiles.every((p) => p.default === "_"), "every position is preselected on none");
});

await test("quote: framing with the sheet's profiles -> 201, 11,314 kg at 6.50 TND/kg, 88,388.93 TND all taxes included", async () => {
  const admin = fakeAdmin();
  const r = await quote(framing, user, admin);
  assert.equal(r.status, 201);
  assert.equal(r.json.result.steelKg, 11314);
  assert.equal(r.json.result.pricePerKg, 6.5);
  assert.equal(r.json.result.subtotal, 73541); // 11,314 kg x 6.5
  assert.equal(r.json.result.fodec, 735.41); // 1% of the subtotal
  assert.equal(r.json.result.tax, 14112.52); // 19% of (subtotal + FODEC)
  assert.equal(r.json.result.total, 88388.93);
  assert.equal(admin.db.quotes.length, 1);
  assert.equal(admin.db.quotes[0].user_id, "u1");
});

await test("quote: result never exposes cost price or margin", async () => {
  const r = await quote(framing);
  const text = JSON.stringify(r.json).toLowerCase();
  for (const word of ["cost", "margin", "6.929", "purchase", "labour"]) assert.equal(text.includes(word), false, word);
});

await test("quote: custom profiles change the price", async () => {
  const base = (await quote(framing)).json.result.total;
  const bigger = (await quote({ ...framing, profiles: { ...sheetProfiles, bracing: "CE 80", rails: "UPN 100" } })).json.result.total;
  assert.ok(bigger > base);
});

await test("quote: parapet bayonets accept IPE 100-200 and HEA 100-160 (sheet update), priced by length x kg/m", async () => {
  const opts = (await quote({ action: "forms" })).json.framing.profiles.find((p) => p.id === "parapetBayonets").options;
  assert.deepEqual(opts, ["_", "IPE 100", "IPE 120", "IPE 140", "IPE 160", "IPE 180", "IPE 200", "HEA 100", "HEA 120", "HEA 140", "HEA 160"]);
  const base = (await quote(framing)).json.result;
  for (const [profile, kgPerM] of [["HEA 100", 17.1], ["HEA 120", 20.3], ["HEA 140", 25.2], ["HEA 160", 31]]) {
    const r = (await quote({ ...framing, profiles: { ...sheetProfiles, parapetBayonets: profile } })).json.result;
    const line = r.lines.find((l) => l.id === "parapetBayonets");
    assert.equal(line.profile, profile);
    assert.equal(line.quantity, 20); // 5 frames x 2 + 10 m, as in the sheet (=I*2+10)
    assert.equal(line.kg, Math.round(20 * kgPerM * 10) / 10);
    assert.ok(r.total > base.total);
  }
  assert.equal((await quote({ ...framing, profiles: { ...sheetProfiles, parapetBayonets: "HEA 180" } })).status, 400);
});

await test("quote: with no profile chosen (all none, or none sent) -> 400 'Select at least one steel profile'", async () => {
  for (const body of [hall, { ...hall, profiles: {} }, { ...hall, profiles: { posts: "_", rafters: "_" } }]) {
    const r = await quote(body);
    assert.equal(r.status, 400);
    assert.equal(r.json.error, "Select at least one steel profile");
  }
});

await test("quote: a single chosen profile is enough, the others stay none", async () => {
  const r = await quote({ ...hall, profiles: { bracing: "CE 60" } });
  assert.equal(r.status, 201);
  assert.deepEqual(r.json.result.lines.map((l) => l.id), ["bracing"]);
});

await test("quote: pending service, bad numbers, bad profile, bad action -> 400", async () => {
  assert.equal((await quote({ action: "create", service: "walkways", weightKg: 100 })).status, 400);
  assert.equal((await quote({ ...framing, length: 3 })).status, 400);
  assert.equal((await quote({ ...framing, profiles: { bracing: "IPE 300" } })).status, 400);
  assert.equal((await quote({ action: "nope" })).status, 400);
  assert.equal((await quote(undefined)).status, 400);
});

await test("quote: etude (calculation) - 15 DT/m2 up to 100 m2, 10 DT/m2 on the whole surface above, no taxes", async () => {
  const price = async (surface) => (await quote({ action: "create", service: "calculation", surface })).json.result;
  assert.equal((await price(80)).total, 1200);
  assert.equal((await price(100)).total, 1500); // 100 m2 is still in the first tier
  assert.equal("ratePerM2" in (await price(100)), false, "the rate per m2 must not be returned");
  assert.equal((await price(100.5)).total, 1005); // above 100: whole surface at 10
  assert.equal((await price(150)).total, 1500);
  assert.equal((await price(1)).total, 15);
  const r = await price(80);
  assert.equal(r.total, r.subtotal);
  assert.equal("tax" in r, false, "no tax field: the page shows the total excl. tax");
  assert.equal("fodec" in r, false);
  assert.equal(JSON.stringify(r).includes("15"), false, "no trace of the 15 DT rate in the response");
});

await test("quote: etude rejects 0, negative, text, missing and huge surfaces (400)", async () => {
  for (const surface of [0, -5, "abc", undefined, null, 50001])
    assert.equal((await quote({ action: "create", service: "calculation", surface })).status, 400, String(surface));
});

// ---- prices edited in the admin dashboard (table `pricing`)
const hall11314 = { ...framing }; // 11,314 kg with the sheet profiles
const priced = (rows, failPricing = false) => fakeAdmin({ pricing: rows, failPricing });

await test("quote: framing price per kg is read from the pricing table (admin dashboard)", async () => {
  const r = (await quote(hall11314, user, priced([{ key: "framing_price_per_kg", value: "7.250" }]))).json.result;
  assert.equal(r.pricePerKg, 7.25);
  assert.equal(r.subtotal, 82026.5); // 11,314 kg x 7.25
});

await test("quote: etude rates and threshold are read from the pricing table", async () => {
  const etude = (surface, rows) => quote({ action: "create", service: "calculation", surface }, user, priced(rows)).then((x) => x.json.result.total);
  const rows = [
    { key: "calculation_rate_small", value: "20" },
    { key: "calculation_rate_large", value: "12.5" },
    { key: "calculation_threshold_m2", value: "50" },
  ];
  assert.equal(await etude(50, rows), 1000); // up to the new threshold: 20 per m2
  assert.equal(await etude(60, rows), 750); // above: 12.5 per m2 on the whole surface
  assert.equal(await etude(80, []), 1200); // no rows: fallback 15 per m2 (threshold 100)
});

await test("quote: invalid or unreadable prices fall back to the defaults (a quote is never blocked)", async () => {
  const bad = [{ key: "framing_price_per_kg", value: "0" }, { key: "nope", value: "9" }, { key: "calculation_rate_small", value: "abc" }];
  assert.equal((await quote(hall11314, user, priced(bad))).json.result.total, 88388.93);
  assert.equal((await quote(hall11314, user, priced([], true))).json.result.total, 88388.93); // pricing table error
});

await test("quote: insert failure -> 500", async () => {
  assert.equal((await quote(framing, user, fakeAdmin({ failQuote: true }))).status, 500);
});

// ---- page addresses and search-engine tags (frontend/src/seo)
await test("seo: every page and language has its own address, and the address maps back to the page", () => {
  const seen = new Set();
  for (const lang of LANGS)
    for (const page of Object.keys(SLUGS)) {
      const address = pathFor(page, lang);
      assert.ok(!seen.has(address), `duplicate address ${address}`);
      seen.add(address);
      assert.deepEqual(parsePath(address), { lang, page });
      assert.deepEqual(parsePath(address + "/"), { lang, page }); // GitHub Pages serves folders with a trailing slash
    }
  assert.equal(pathFor("home", "fr"), "/");
  assert.equal(pathFor("services", "en"), "/en/services");
  assert.equal(parsePath("/en/avis").page, null); // French address under /en: unknown (404)
  assert.equal(canonicalUrl("faq", "ar"), "https://pilotconstract.com/ar/faq/");
});

await test("seo: indexable pages have a distinct title and a description of sensible length in every language", () => {
  const titles = new Set();
  for (const lang of LANGS)
    for (const page of INDEXED_PAGES) {
      const { title, description } = pageMeta(page, lang);
      assert.ok(title.length >= 20 && title.length <= 75, `${lang}/${page} title length ${title.length}`);
      assert.ok(description.length >= 70 && description.length <= 175, `${lang}/${page} description length ${description.length}`);
      assert.ok(!titles.has(title), `duplicate title ${title}`);
      titles.add(title);
    }
  assert.ok(PRIVATE_PAGES.every((p) => !INDEXED_PAGES.includes(p)));
  // the company's French name is a keyword that must be on every French page (title and description)
  for (const page of INDEXED_PAGES) {
    const { title, description } = pageMeta(page, "fr");
    assert.ok(title.includes("Pilotage et Construction") || description.includes("Pilotage et Construction"), `fr/${page}: missing the company name`);
    assert.ok(title.length <= 70, `fr/${page}: title too long to be shown whole (${title.length})`);
  }
});

await test("seo: structured data has the company, the FAQ questions and the service breadcrumb", () => {
  const types = (page, lang) => jsonLdFor(page, lang)["@graph"].map((n) => n["@type"]);
  assert.deepEqual(types("home", "fr"), ["GeneralContractor", "WebSite"]);
  assert.ok(types("faq", "en").includes("FAQPage"));
  assert.deepEqual(types("service:framing", "ar").slice(2), ["Service", "BreadcrumbList"]);
  const company = jsonLdFor("home", "fr")["@graph"][0];
  assert.equal(company.address.addressLocality, "Sfax");
  assert.ok(!("aggregateRating" in company) && !("review" in company)); // no ratings that are not real, verifiable ones
});

console.log(`\n${passed} tests passed`);
