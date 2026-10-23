import { createContext, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import translations from "./translations.js";
import { DEFAULT_LANG, LANGS, RTL_LANGS, langFromPath, parsePath, pathFor } from "../seo/routes.js";

// The language is the one in the address (/ = French, /en = English, /ar = Arabic): each language has its own
// pages, which is what lets search engines index all three. Only an explicit choice in the switcher is remembered.
const STORAGE_KEY = "pilot-constract-lang";

const readChoice = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return LANGS.includes(stored) ? stored : null;
  } catch {
    return null;
  }
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const language = langFromPath(pathname);
  const dir = RTL_LANGS.includes(language) ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  // A visitor who once chose another language gets it back when arriving at the front door (the French home page).
  // Search engines never have a stored choice, so they always see the French page at "/".
  useEffect(() => {
    const choice = readChoice();
    if (pathname === "/" && choice && choice !== DEFAULT_LANG) navigate(pathFor("home", choice), { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Same page, other language.
  const setLanguage = (lang) => {
    if (!LANGS.includes(lang) || lang === language) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // localStorage unavailable: the choice just won't be remembered
    }
    const { page } = parsePath(pathname);
    navigate(page ? pathFor(page, lang) + search : pathFor("home", lang));
  };

  const value = {
    language,
    setLanguage,
    dir,
    t: translations[language],
    // address of a page in the current language: path("gallery", "section=framing")
    path: (page, query) => pathFor(page, language) + (query ? `?${query}` : ""),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
