// The verification e-mail, in the site's three languages. Plain and short: a 6-digit code and what to do with it.

export const LANGS = ["fr", "en", "ar"];
export const normLang = (lang) => (LANGS.includes(lang) ? lang : "fr");

const TEXT = {
  fr: {
    subject: "Votre code de vérification Pilot Constract",
    hello: "Bonjour,",
    line: "Voici votre code pour valider votre compte Pilot Constract :",
    expires: "Il est valable 10 minutes. Si vous n'avez pas créé de compte, ignorez simplement ce message.",
    sign: "L'équipe Pilot Constract",
  },
  en: {
    subject: "Your Pilot Constract verification code",
    hello: "Hello,",
    line: "Here is your code to verify your Pilot Constract account:",
    expires: "It is valid for 10 minutes. If you did not create an account, just ignore this message.",
    sign: "The Pilot Constract team",
  },
  ar: {
    subject: "رمز التحقق الخاص بحسابك في Pilot Constract",
    hello: "مرحبًا،",
    line: "هذا هو رمزك لتأكيد حسابك في Pilot Constract:",
    expires: "صالح لمدة 10 دقائق. إذا لم تنشئ حسابًا، تجاهل هذه الرسالة.",
    sign: "فريق Pilot Constract",
  },
};

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export function verificationEmail(code, lang) {
  const l = normLang(lang);
  const t = TEXT[l];
  const dir = l === "ar" ? "rtl" : "ltr";
  const text = `${t.hello}\n\n${t.line}\n\n${code}\n\n${t.expires}\n\n${t.sign}\n`;
  const html = `<!doctype html><html lang="${l}" dir="${dir}"><body style="margin:0;background:#f5f6f4;font-family:Arial,Helvetica,sans-serif;color:#1a1b1c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-top:4px solid #307faf">
<tr><td dir="${dir}" style="padding:28px 28px 8px;font-size:15px;line-height:1.5">
<p style="margin:0 0 12px">${escapeHtml(t.hello)}</p>
<p style="margin:0 0 20px">${escapeHtml(t.line)}</p>
<p dir="ltr" style="margin:0 0 20px;text-align:center;font-size:34px;letter-spacing:8px;font-weight:700;color:#307faf">${escapeHtml(code)}</p>
<p style="margin:0 0 20px;color:#4b5a66;font-size:13px">${escapeHtml(t.expires)}</p>
<p style="margin:0 0 20px">${escapeHtml(t.sign)}</p>
</td></tr></table></td></tr></table></body></html>`;
  return { subject: t.subject, text, html };
}
