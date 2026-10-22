// Small HTTP helpers shared by the Edge Functions.

const DEFAULT_ORIGINS = ["https://pilotconstract.com", "https://www.pilotconstract.com", "http://localhost:3000"];

// Extra origins can be added with: supabase secrets set ALLOWED_ORIGINS="https://a.example,https://b.example"
const allowedOrigins = [
  ...DEFAULT_ORIGINS,
  ...(Deno.env.get("ALLOWED_ORIGINS")?.split(",").map((s) => s.trim()).filter(Boolean) ?? []),
];

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

export function json(req: Request, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

// Reads a JSON body of at most 10 KB (same limit as the old API); returns undefined when invalid.
export async function readJson(req: Request): Promise<Record<string, unknown> | undefined> {
  try {
    const text = await req.text();
    if (text.length > 10_000) return undefined;
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}
