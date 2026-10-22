// POST /functions/v1/signup: validates the form, creates the login (Supabase Auth) and the profile row.
// The browser then signs in with the same e-mail and password.
import { createClient } from "npm:@supabase/supabase-js@2";
import { isSupportedCountry, parsePhoneNumberFromString } from "npm:libphonenumber-js@1.13.15";
import { clientIp, corsHeaders, json, readJson } from "../_shared/http.ts";
import { handleSignup } from "../_shared/signup.js";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, 405, { error: "Method not allowed" });

  const body = await readJson(req);
  if (!body) return json(req, 400, { error: "Invalid JSON" });

  const { status, json: payload } = await handleSignup(
    { body, ip: clientIp(req) },
    { admin, phone: { isSupportedCountry, parsePhoneNumberFromString } },
  );
  return json(req, status, payload);
});
