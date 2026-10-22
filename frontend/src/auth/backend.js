import { supabase } from "../lib/supabase.js";

// Calls a Supabase Edge Function and turns failures into Error objects shaped like the old API's:
// err.message = the server's { error } text (the pages map it to a translated message), err.status = HTTP status.
export async function callFunction(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (!error) return data;

  let payload = {};
  try {
    payload = await error.context.json();
  } catch {
    /* network failure or non-JSON response */
  }
  const err = new Error(payload.error || "Request failed");
  err.status = error.context?.status;
  throw err;
}
