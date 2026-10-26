// Runs after the two Vite builds (client -> dist, server -> dist-ssr). Writes one static HTML file per page and language
// (dist/services/index.html, dist/en/index.html ...) with the page content already inside and its own title, description,
// canonical address, hreflang links, social preview and structured data, plus sitemap.xml and robots.txt.
// Search engines (and visitors on slow phones) get everything immediately; React then takes over in the browser.
//
// GitHub Pages serves dist/404.html for unknown addresses, so that file is a neutral "noindex" shell.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { DEFAULT_LANG, INDEXED_PAGES, LANGS, PRIVATE_PAGES, RTL_LANGS, SITE_URL, canonicalUrl, pathFor } from "../src/seo/routes.js";
import { jsonLdFor, notFoundMeta, pageMeta } from "../src/seo/meta.js";
import { BRAND } from "../src/data/company.js";

const DIST = "dist";
const template = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
const { render } = await import(pathToFileURL(path.resolve("dist-ssr/entry-server.js")).href);

const SEO_BLOCK = /<!-- seo:start[\s\S]*?<!-- seo:end -->/;
if (!SEO_BLOCK.test(template)) throw new Error("index.html: the <!-- seo:start --> ... <!-- seo:end --> block is missing");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const LOCALE = { fr: "fr_FR", en: "en_US", ar: "ar_AR" };

function headBlock({ lang, meta, indexed, canonical, alternates, jsonLd }) {
  const lines = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<meta name="robots" content="${indexed ? "index, follow, max-image-preview:large" : "noindex, follow"}" />`,
  ];
  if (canonical) lines.push(`<link rel="canonical" href="${canonical}" />`);
  for (const [hreflang, href] of alternates ?? []) lines.push(`<link rel="alternate" hreflang="${hreflang}" href="${href}" />`);
  lines.push(
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${BRAND}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:image" content="${SITE_URL}/og-image.png" />`,
    `<meta property="og:locale" content="${LOCALE[lang]}" />`,
    ...LANGS.filter((l) => l !== lang).map((l) => `<meta property="og:locale:alternate" content="${LOCALE[l]}" />`),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${SITE_URL}/og-image.png" />`,
  );
  if (canonical) lines.push(`<meta property="og:url" content="${canonical}" />`);
  if (jsonLd) lines.push(`<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>`);
  return lines.join("\n    ");
}

function pageHtml({ lang, body, ...head }) {
  return template
    .replace(SEO_BLOCK, () => headBlock({ lang, ...head }))
    .replace(/<html lang="[^"]*">/, `<html lang="${lang}" dir="${RTL_LANGS.includes(lang) ? "rtl" : "ltr"}">`)
    .replace('<div id="root"></div>', () => `<div id="root">${body}</div>`);
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

// "/en/services" -> dist/en/services/index.html, "/" -> dist/index.html
const fileFor = (address) => path.join(DIST, address === "/" ? "" : address, "index.html");

let count = 0;
for (const lang of LANGS) {
  for (const page of INDEXED_PAGES) {
    const address = pathFor(page, lang);
    const alternates = [...LANGS.map((l) => [l, canonicalUrl(page, l)]), ["x-default", canonicalUrl(page, DEFAULT_LANG)]];
    write(
      fileFor(address),
      pageHtml({ lang, body: render(address), meta: pageMeta(page, lang), indexed: true, canonical: canonicalUrl(page, lang), alternates, jsonLd: jsonLdFor(page, lang) }),
    );
    count++;
  }
  // account, quote tool and admin: not for search results, drawn in the browser
  for (const page of PRIVATE_PAGES) {
    write(fileFor(pathFor(page, lang)), pageHtml({ lang, body: "", meta: pageMeta(page, lang), indexed: false }));
    count++;
  }
}
write(path.join(DIST, "404.html"), pageHtml({ lang: DEFAULT_LANG, body: "", meta: notFoundMeta(DEFAULT_LANG), indexed: false }));

// sitemap: every indexable page, each with its language alternates
const urlEntry = (page, lang) =>
  [
    "  <url>",
    `    <loc>${canonicalUrl(page, lang)}</loc>`,
    ...LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${canonicalUrl(page, l)}" />`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${canonicalUrl(page, DEFAULT_LANG)}" />`,
    "  </url>",
  ].join("\n");
write(
  path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${LANGS.flatMap((lang) => INDEXED_PAGES.map((page) => urlEntry(page, lang))).join("\n")}\n</urlset>\n`,
);
write(path.join(DIST, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

fs.rmSync("dist-ssr", { recursive: true, force: true });
console.log(`prerender: ${count} pages + 404.html, sitemap.xml, robots.txt`);
