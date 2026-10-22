// POST /functions/v1/quote  { action: "forms" } or { action: "create", service, ... }
// Requires a logged-in user (their access token in the Authorization header).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, json, readJson } from "../_shared/http.ts";
import { handleQuote } from "../_shared/quotes.js";

const url = Deno.env.get("SUPABASE_URL")!;
const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, 405, { error: "Method not allowed" });

  // The anon key is also a valid JWT, so check that the token belongs to a real user.
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const { data } = token ? await admin.auth.getUser(token) : { data: { user: null } };

  const body = await readJson(req);
  if (!body) return json(req, 400, { error: "Invalid JSON" });

  const { status, json: payload } = await handleQuote({ user: data.user, body }, { admin });
  return json(req, status, payload);
});
