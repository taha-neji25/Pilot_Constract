// Unit tests for the Edge Function logic, run with plain Node:  node supabase/tests/run.mjs
// A tiny in-memory fake stands in for the Supabase admin client (no network, no Docker needed).
import assert from "node:assert/strict";
import { isSupportedCountry, parsePhoneNumberFromString } from "libphonenumber-js";
import { handleSignup, SIGNUP_LIMIT } from "../functions/_shared/signup.js";
import { handleQuote } from "../functions/_shared/quotes.js";

const phone = { isSupportedCountry, parsePhoneNumberFromString };

function fakeAdmin({ failProfile = false, failQuote = false } = {}) {
  const db = { users: new Map(), profiles: [], quotes: [], attempts: new Map(), deleted: [] };
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
  return {
    db,
    rpc: async (_name, { p_ip, p_limit }) => {
      const n = db.attempts.get(p_ip) ?? 0;
      db.attempts.set(p_ip, n + 1);
      return { data: n < p_limit, error: null };
    },
    auth: {
      admin: {
        createUser: async ({ email, password }) => {
          if (db.users.has(email))
            return { data: null, error: { code: "email_exists", message: "A user with this email address has already been registered" } };
          const user = { id: `u${db.users.size + 1}`, email, password };
          db.users.set(email, user);
          return { data: { user }, error: null };
        },
        deleteUser: async (id) => {
          db.deleted.push(id);
          for (const [e, u] of db.users) if (u.id === id) db.users.delete(e);
          return { error: null };
        },
      },
    },
    from: (table) => ({ insert: (row) => insertable(table, row) }),
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
const signup = (body, admin = fakeAdmin(), ip = "1.1.1.1") => handleSignup({ body, ip }, { admin, phone });

await test("signup: valid person -> 201, user + profile stored, E.164 phone, email normalised", async () => {
  const admin = fakeAdmin();
  const r = await signup(person, admin);
  assert.equal(r.status, 201);
  assert.deepEqual(r.json, { ok: true });
  assert.equal(admin.db.profiles.length, 1);
  const p = admin.db.profiles[0];
  assert.equal(p.email, "amine@example.com");
  assert.equal(p.phone, "+21620123456");
  assert.equal(p.name, "Amine Ben Salah");
  assert.equal(p.account_type, "person");
  assert.equal(p.tax_id, null);
  assert.equal(p.id, admin.db.users.get("amine@example.com").id);
  assert.equal(JSON.stringify(admin.db.profiles).includes("correct-horse"), false, "password must never be stored in the profile");
});

await test("signup: valid company -> 201 with tax id and position", async () => {
  const admin = fakeAdmin();
  const r = await signup(company, admin);
  assert.equal(r.status, 201);
  assert.equal(admin.db.profiles[0].tax_id, "1234567/A/M/000");
  assert.equal(admin.db.profiles[0].birth_date, null);
});

await test("signup: duplicate email -> 409", async () => {
  const admin = fakeAdmin();
  await signup(person, admin);
  const r = await signup(person, admin, "2.2.2.2");
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

await test("quote: insert failure -> 500", async () => {
  assert.equal((await quote(framing, user, fakeAdmin({ failQuote: true }))).status, 500);
});

console.log(`\n${passed} tests passed`);
