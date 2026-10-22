import { createContext, useContext, useEffect, useState } from "react";
import translations from "./translations.js";

const STORAGE_KEY = "pilot-constract-lang";
const SUPPORTED = ["en", "fr", "ar"];
const RTL_LANGS = ["ar"];

function detectLanguage() {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED.includes(stored)) return stored;
  const browserLang = (navigator.language || "en").slice(0, 2).toLowerCase();
  return SUPPORTED.includes(browserLang) ? browserLang : "en";
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(detectLanguage);

  useEffect(() => {
    const dir = RTL_LANGS.includes(language) ? "rtl" : "ltr";
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // localStorage unavailable — language just won't persist across visits
    }
  }, [language]);

  const setLanguage = (lang) => {
    if (SUPPORTED.includes(lang)) setLanguageState(lang);
  };

  const value = {
    language,
    setLanguage,
    dir: RTL_LANGS.includes(language) ? "rtl" : "ltr",
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
