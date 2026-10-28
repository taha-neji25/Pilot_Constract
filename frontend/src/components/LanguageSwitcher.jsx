import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import "./LanguageSwitcher.css";

// Language names are written in their own language. No flags: a flag stands for a country, not a language.
const OPTIONS = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
];

// Language menu: a button that opens a list of buttons. Works with the keyboard (Tab, Enter/Space, Escape closes and
// gives focus back to the button) and announces the current language to screen readers.
export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const current = OPTIONS.find((opt) => opt.code === language) ?? OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onKeyDown = (event) => {
    if (event.key === "Escape" && open) {
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div className="lang-switcher" ref={wrapperRef} onKeyDown={onKeyDown}>
      <button
        type="button"
        ref={triggerRef}
        className="lang-switcher__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`${current.code.toUpperCase()} - ${t.nav.language}: ${current.label}`}
      >
        <span className="lang-switcher__code">{current.code.toUpperCase()}</span>
      </button>

      {open && (
        <ul className="lang-switcher__menu">
          {OPTIONS.map((opt) => (
            <li key={opt.code}>
              <button
                type="button"
                lang={opt.code}
                aria-current={opt.code === language ? "true" : undefined}
                className={
                  opt.code === language
                    ? "lang-switcher__option lang-switcher__option--active"
                    : "lang-switcher__option"
                }
                onClick={() => {
                  setLanguage(opt.code);
                  setOpen(false);
                }}
              >
                <span>{opt.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
