import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import "./LanguageSwitcher.css";
// Import flag images
import enFlag from "../../assets/flags/en.webp";
import frFlag from "../../assets/flags/fr.png";
import arFlag from "../../assets/flags/ar.png";

const OPTIONS = [
  { code: "en", flag: enFlag, label: "English" },
  { code: "fr", flag: frFlag, label: "Français" },
  { code: "ar", flag: arFlag, label: "العربية" },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
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

  return (
    <div className="lang-switcher" ref={wrapperRef}>
      <button
        type="button"
        className="lang-switcher__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <img 
          src={current.flag} 
          alt={`${current.label} flag`}
          className="lang-switcher__flag-img"
        />
        <span className="lang-switcher__code">{current.code.toUpperCase()}</span>
      </button>

      {open && (
        <ul className="lang-switcher__menu" role="listbox">
          {OPTIONS.map((opt) => (
            <li key={opt.code}>
              <button
                type="button"
                role="option"
                aria-selected={opt.code === language}
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
                <img 
                  src={opt.flag} 
                  alt={`${opt.label} flag`}
                  className="lang-switcher__flag-img"
                />
                <span>{opt.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}