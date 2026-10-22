// Quote endpoint logic (see ../quote/index.ts for the HTTP wiring). Free of Deno/Node specifics for testing.
// Pricing, cost price and margin live in ./calculators and never reach the browser except as the final result.

import { calculateQuote, getForms, validateQuoteInput } from "./quoteCalculator.js";

// `user` is the authenticated Supabase user (or null). `admin` = service-role client.
// body.action: "forms" -> allowed profiles per position; "create" -> validate, price and store a quote.
export async function handleQuote({ user, body }, { admin }) {
  if (!user) return { status: 401, json: { error: "Not authenticated" } };

  if (body?.action === "forms") return { status: 200, json: getForms() };

  if (body?.action === "create") {
    const { input, error } = validateQuoteInput(body);
    if (error) return { status: 400, json: { error } };

    const result = calculateQuote(input);
    const { data, error: insertError } = await admin
      .from("quotes")
      .insert({ user_id: user.id, input, result })
      .select("id, created_at")
      .single();
    if (insertError) return { status: 500, json: { error: "Server error" } };

    return { status: 201, json: { id: data.id, input, result, created_at: data.created_at } };
  }

  return { status: 400, json: { error: "Unknown action" } };
}
