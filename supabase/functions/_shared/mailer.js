// Sends the verification e-mail through an e-mail API (Resend or Brevo: both free for this volume).
// Configured with Supabase secrets, see DEPLOY.md:
//   RESEND_API_KEY  (or BREVO_API_KEY)  the provider key
//   MAIL_FROM       "Pilot Constract <no-reply@pilotconstract.com>"  (an address the provider has verified)
// With no provider configured, sending fails (and signup refuses) instead of silently skipping the verification.

import { verificationEmail } from "./emailTemplates.js";

// "Name <a@b.c>" -> { name, email }
const parseFrom = (from) => {
  const m = String(from ?? "").match(/^\s*(?:"?([^"<]*?)"?\s*)?<([^>]+)>\s*$/);
  return m ? { name: (m[1] ?? "").trim(), email: m[2].trim() } : { name: "", email: String(from ?? "").trim() };
};

export function createMailer(config = {}, fetchImpl = fetch) {
  const { resendKey, brevoKey, from } = config;

  async function send({ to, subject, text, html }) {
    try {
      if (resendKey) {
        const res = await fetchImpl("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from, to: [to], subject, text, html }),
          signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) console.error("Resend refused the e-mail:", res.status, (await res.text()).slice(0, 300));
        return res.ok;
      }
      if (brevoKey) {
        const sender = parseFrom(from);
        const res = await fetchImpl("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "api-key": brevoKey, "Content-Type": "application/json", accept: "application/json" },
          body: JSON.stringify({ sender, to: [{ email: to }], subject, textContent: text, htmlContent: html }),
          signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) console.error("Brevo refused the e-mail:", res.status, (await res.text()).slice(0, 300));
        return res.ok;
      }
      console.error("No e-mail provider configured: set RESEND_API_KEY (or BREVO_API_KEY) and MAIL_FROM");
      return false;
    } catch (err) {
      console.error("E-mail sending failed:", err?.name ?? "error");
      return false;
    }
  }

  return {
    // Never log the code itself.
    sendVerification: ({ to, code, lang }) => send({ to, ...verificationEmail(code, lang) }),
  };
}
