import { useState } from "react";
import { NavLink } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import "./Navbar.css";
import logoReversed from "../assets/brand/logo-horizontal-reversed.svg";
import markReversed from "../assets/brand/mark-reversed.svg";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { t, path } = useLanguage();
  const { user, isAdmin, logout } = useAuth();

  const links = [
    { page: "home", label: t.nav.home },
    { page: "services", label: t.nav.services },
    { page: "reviews", label: t.nav.reviews },
    { page: "faq", label: t.nav.faq },
    { page: "gallery", label: t.nav.gallery },
  ];

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to={path("home")} className="navbar__brand" aria-label="Pilot Constract" onClick={() => setOpen(false)}>
          {/* Full lockup from 481px; the mark alone on small phones (Brand Guidelines: minimum sizes) */}
          <img src={logoReversed} alt="Pilot Constract" className="navbar__logo navbar__logo--full" />
          <img src={markReversed} alt="" aria-hidden="true" className="navbar__logo navbar__logo--mark" />
        </NavLink>

        <nav className={`navbar__nav ${open ? "navbar__nav--open" : ""}`}>
          <ul>
            {links.map((link) => (
              <li key={link.page}>
                <NavLink
                  to={path(link.page)}
                  end={link.page === "home"}
                  className={({ isActive }) =>
                    isActive ? "navbar__link navbar__link--active" : "navbar__link"
                  }
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <NavLink to={path("quote")} className="btn btn-primary navbar__cta" onClick={() => setOpen(false)}>
            {t.nav.cta}
          </NavLink>
        </nav>

        <div className="navbar__right">
          {isAdmin && (
            <NavLink to={path("admin")} className="navbar__auth" aria-label={t.nav.admin} onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              <span className="navbar__auth-label">{t.nav.admin}</span>
            </NavLink>
          )}
          {user && <span className="navbar__user">{user.firstName || user.name}</span>}
          {user ? (
            <button
              type="button"
              className="navbar__auth"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              title={user.name}
              aria-label={t.nav.logout}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M10 4H5v16h5M15 8l5 4-5 4M20 12H9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="navbar__auth-label">{t.nav.logout}</span>
            </button>
          ) : (
            <NavLink to={path("login")} className="navbar__auth" aria-label={t.nav.login} onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M4 21c0-4 4-6 8-6s8 2 8 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="navbar__auth-label">{t.nav.login}</span>
            </NavLink>
          )}
          <LanguageSwitcher />
          <button
            className="navbar__toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}