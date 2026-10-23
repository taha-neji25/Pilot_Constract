import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { notFoundMeta, pageMeta } from "./meta.js";
import { INDEXED_PAGES, canonicalUrl, parsePath } from "./routes.js";

// The static pages already carry the right tags for the page they were built for; this keeps the title, description
// and indexing tags right while a visitor moves between pages without a reload.
function setTag(selector, create, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(create.tag);
    for (const [k, v] of Object.entries(create.attrs)) el.setAttribute(k, v);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

export function useSeo() {
  const { pathname } = useLocation();
  useEffect(() => {
    const { lang, page } = parsePath(pathname);
    const meta = page ? pageMeta(page, lang) : notFoundMeta(lang);
    const indexed = page && INDEXED_PAGES.includes(page);
    document.title = meta.title;
    setTag('meta[name="description"]', { tag: "meta", attrs: { name: "description" } }, "content", meta.description);
    setTag('meta[name="robots"]', { tag: "meta", attrs: { name: "robots" } }, "content", indexed ? "index, follow, max-image-preview:large" : "noindex, follow");
    setTag('meta[property="og:title"]', { tag: "meta", attrs: { property: "og:title" } }, "content", meta.title);
    setTag('meta[property="og:description"]', { tag: "meta", attrs: { property: "og:description" } }, "content", meta.description);
    if (page) {
      const url = canonicalUrl(page, lang);
      setTag('link[rel="canonical"]', { tag: "link", attrs: { rel: "canonical" } }, "href", url);
      setTag('meta[property="og:url"]', { tag: "meta", attrs: { property: "og:url" } }, "content", url);
    }
  }, [pathname]);
}
