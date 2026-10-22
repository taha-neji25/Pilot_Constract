import { createClient } from "@supabase/supabase-js";

// Public values from Supabase Dashboard > Project Settings > API (the anon key is meant to be public:
// what it can reach is limited by the Row Level Security rules in supabase/migrations).
// Local dev: copy .env.example to .env.local. Production: set as GitHub repository variables (see DEPLOY.md).
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);
if (!supabaseConfigured) {
  console.warn("Supabase is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (see .env.example).");
}

// Placeholder values keep the site rendering (logged out) when unconfigured; requests then simply fail.
export const supabase = createClient(url || "http://127.0.0.1:54321", anonKey || "not-configured", {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});
