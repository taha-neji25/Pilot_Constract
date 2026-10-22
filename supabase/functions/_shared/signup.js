// Signup logic, ported from the old Express backend (same rules, same English error strings: the frontend
// maps them to translated messages). Kept free of Deno/Node specifics so it can be unit-tested in Node:
// the HTTP wiring is in ../signup/index.ts, which injects the Supabase admin client and the phone library.

// Practical email check: one @, sane local part, dotted domain with a 2+ letter TLD,
// no leading/trailing/consecutive dots, no spaces.
const EMAIL_RE =
  /^(?!\.)(?!.*\.\.)[A-Za-z0-9._%+-]{1,64}(?<!\.)@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;
const NAME_RE = /^\p{L}[\p{L} '.-]*$/u;
const POSTAL_RE = /^[A-Za-z0-9][A-Za-z0-9 -]{1,8}[A-Za-z0-9]$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TAX_ID_RE = /^[A-Za-z0-9/ .-]{3,30}$/;

export const SIGNUP_LIMIT = 5; // attempts per IP...
export const SIGNUP_WINDOW = "1 hour"; // ...per window

// Returns { error } or { data } with cleaned values for the chosen account type.
// `phone` = { parsePhoneNumberFromString, isSupportedCountry } from libphonenumber-js.
export function validateSignup(body, phone) {
  const str = (k) => String(body?.[k] ?? "").trim();
  const firstName = str("firstName");
  const lastName = str("lastName");
  const email = str("email").toLowerCase();
  const phoneCountry = str("phoneCountry").toUpperCase();
  const address = str("address");
  const postalCode = str("postalCode");
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

  if (!address || address.length > 200) return { error: "Address is required" };
  if (!POSTAL_RE.test(postalCode)) return { error: "Invalid postal code" };
  if (password.length < 8 || password.length > 72)
    return { error: "Password must be 8 to 72 characters" };

  const base = {
    name: `${firstName} ${lastName}`,
    first_name: firstName,
    last_name: lastName,
    email,
    phone: parsed.number, // E.164
    phone_country: phoneCountry,
    address,
    postal_code: postalCode,
    account_type: accountType,
  };

  if (accountType === "person") {
    const birthDate = str("birthDate");
    const gender = str("gender");
    const d = new Date(birthDate);
    if (!DATE_RE.test(birthDate) || Number.isNaN(d.getTime()) || d > new Date() || d.getFullYear() < 1900)
      return { error: "Invalid birth date" };
    if (!["male", "female"].includes(gender)) return { error: "Invalid gender" };
    return { data: { profile: { ...base, birth_date: birthDate, gender, tax_id: null, position: null }, password } };
  }

  if (accountType === "company") {
    const taxId = str("taxId");
    const position = str("position");
    if (!TAX_ID_RE.test(taxId)) return { error: "Invalid tax ID" };
    if (!position || position.length > 100) return { error: "Position is required" };
    return { data: { profile: { ...base, tax_id: taxId, position, birth_date: null, gender: null }, password } };
  }

  return { error: "Invalid account type" };
}

// Returns { status, json }. `admin` is a Supabase client with the service-role key.
export async function handleSignup({ body, ip }, { admin, phone }) {
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

  // email_confirm: true = no confirmation e-mail, same behaviour as the old site (instant account).
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: data.profile.email,
    password: data.password,
    email_confirm: true,
  });
  if (createError) {
    const taken = createError.code === "email_exists" || /already|registered|exists/i.test(createError.message ?? "");
    if (taken) return { status: 409, json: { error: "Email already registered" } };
    if (createError.code === "weak_password") return { status: 400, json: { error: "Password must be 8 to 72 characters" } };
    return { status: 500, json: { error: "Server error" } };
  }

  const { error: profileError } = await admin.from("profiles").insert({ id: created.user.id, ...data.profile });
  if (profileError) {
    // Do not leave a login without a profile behind.
    await admin.auth.admin.deleteUser(created.user.id);
    return { status: 500, json: { error: "Server error" } };
  }

  return { status: 201, json: { ok: true } };
}
