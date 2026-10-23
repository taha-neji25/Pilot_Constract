// POST /functions/v1/signup: validates the form, creates the (locked) login and the profile row, and e-mails a 6-digit code.
// { action: "verify", email, code } confirms the account, { action: "resend", email, lang } sends a new code.
// The browser then signs in with the same e-mail and password.
import { createClient } from "npm:@supabase/supabase-js@2";
import { isSupportedCountry, parsePhoneNumberFromString } from "npm:libphonenumber-js@1.13.15";
import { clientIp, corsHeaders, json, readJson } from "../_shared/http.ts";
import { createMailer } from "../_shared/mailer.js";
import { handleAccount } from "../_shared/signup.js";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// E-mail provider: secrets RESEND_API_KEY (or BREVO_API_KEY) and MAIL_FROM, see DEPLOY.md
const mailer = createMailer({
  resendKey: Deno.env.get("RESEND_API_KEY"),
  brevoKey: Deno.env.get("BREVO_API_KEY"),
  from: Deno.env.get("MAIL_FROM"),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, 405, { error: "Method not allowed" });

  const body = await readJson(req);
  if (!body) return json(req, 400, { error: "Invalid JSON" });

  const { status, json: payload } = await handleAccount(
    { body, ip: clientIp(req) },
    { admin, mailer, phone: { isSupportedCountry, parsePhoneNumberFromString } },
  );
  return json(req, status, payload);
});
