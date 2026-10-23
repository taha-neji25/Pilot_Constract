// Page addresses, shared by the site (links, router) and the build script (static pages, sitemap).
// French is the default language and keeps the original addresses (/services, /faq...).
// English and Arabic live under /en and /ar, so every language has its own address that Google can index.
// Kept free of JSX/browser APIs so the Node build script can import it.

export const SITE_URL = "https://pilotconstract.com";
export const LANGS = ["fr", "en", "ar"];
export const DEFAULT_LANG = "fr";
export const RTL_LANGS = ["ar"];

// page key -> address segment per language ("" = the home page)
export const SLUGS = {
  home: { fr: "", en: "", ar: "" },
  services: { fr: "services", en: "services", ar: "services" },
  reviews: { fr: "avis", en: "reviews", ar: "reviews" },
  faq: { fr: "faq", en: "faq", ar: "faq" },
  gallery: { fr: "galerie", en: "gallery", ar: "gallery" },
  quote: { fr: "devis", en: "quote", ar: "quote" },
  login: { fr: "connexion", en: "login", ar: "login" },
  signup: { fr: "inscription", en: "signup", ar: "signup" },
  admin: { fr: "admin", en: "admin", ar: "admin" },
};

// One page per service: /services/<address>. ids match the services in i18n/translations.js and the gallery sections.
// (Arabic uses Latin addresses too: Arabic letters in a web address turn into long %-codes.)
export const SERVICE_IDS = ["calculation", "fabrication", "assembly", "framing", "walkways", "maintenance", "metalwork", "containers"];
const SERVICE_SLUGS = {
  calculation: { fr: "etude-structure-metallique", en: "structural-steel-engineering" },
  fabrication: { fr: "fabrication-atelier-metallique", en: "steel-fabrication-workshop" },
  assembly: { fr: "montage-structure-metallique", en: "steel-erection" },
  framing: { fr: "charpente-metallique-industrielle", en: "industrial-steel-framing" },
  walkways: { fr: "passerelles-escaliers-metalliques", en: "steel-walkways-stairs" },
  maintenance: { fr: "maintenance-renfort-structures", en: "steel-structure-maintenance" },
  metalwork: { fr: "ferronnerie-metallique", en: "metalwork" },
  containers: { fr: "containers-sur-mesure", en: "custom-containers" },
};
export const servicePage = (id) => `service:${id}`;
for (const id of SERVICE_IDS) {
  const s = SERVICE_SLUGS[id];
  SLUGS[servicePage(id)] = { fr: `services/${s.fr}`, en: `services/${s.en}`, ar: `services/${s.en}` };
}

// Pages Google should list; the others (account, quote tool, admin) carry a "noindex" tag.
export const INDEXED_PAGES = ["home", "services", ...SERVICE_IDS.map(servicePage), "reviews", "faq", "gallery"];
export const PRIVATE_PAGES = ["quote", "login", "signup", "admin"];

// "/services", "/en/services", "/ar" ... (no trailing slash: what the router and the links use)
export function pathFor(page, lang = DEFAULT_LANG) {
  const slug = SLUGS[page]?.[lang] ?? "";
  const prefix = lang === DEFAULT_LANG ? "" : `/${lang}`;
  return slug ? `${prefix}/${slug}` : prefix || "/";
}

// Address as the web server serves it (GitHub Pages redirects /services to /services/): used for canonical and sitemap.
export const canonicalPath = (page, lang) => {
  const p = pathFor(page, lang);
  return p.endsWith("/") ? p : `${p}/`;
};
export const canonicalUrl = (page, lang) => SITE_URL + canonicalPath(page, lang);

export function langFromPath(pathname = "/") {
  const seg = pathname.split("/")[1];
  return seg === "en" || seg === "ar" ? seg : DEFAULT_LANG;
}

// "/en/reviews" -> { lang: "en", page: "reviews" }; an unknown address gives page: null (404).
export function parsePath(pathname = "/") {
  const lang = langFromPath(pathname);
  const rest = pathname.replace(/^\/(en|ar)(?=\/|$)/, "").replace(/^\/+|\/+$/g, "");
  const page = Object.keys(SLUGS).find((p) => SLUGS[p][lang] === rest) ?? null;
  return { lang, page };
}
