import { Link } from "react-router-dom";
import logoReversed from "../assets/brand/logo-horizontal-reversed.svg";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import contact from "../data/contact.js";
import { BRAND } from "../data/company.js";
import "./Footer.css";

const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className="footer__icon">
    {children}
  </svg>
);

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

const ICONS = {
  phone: (
    <Icon>
      <path {...stroke} d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
    </Icon>
  ),
  fax: (
    <Icon>
      <path {...stroke} d="M7 9V3h10v6M7 17H5a2 2 0 01-2-2v-4a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2h-2M7 14h10v7H7z" />
    </Icon>
  ),
  pin: (
    <Icon>
      <path {...stroke} d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" />
      <circle {...stroke} cx="12" cy="10" r="2.5" />
    </Icon>
  ),
  mail: (
    <Icon>
      <rect {...stroke} x="3" y="5" width="18" height="14" rx="2" />
      <path {...stroke} d="M3 7l9 6 9-6" />
    </Icon>
  ),
};

const SOCIAL = {
  facebook: {
    label: "Facebook",
    path: "M14 8h2V5h-2.5C10.9 5 10 6.6 10 8.5V10H8v3h2v7h3v-7h2.2l.4-3H13V8.7c0-.5.2-.7 1-.7z",
  },
  instagram: {
    label: "Instagram",
    rule: "evenodd", // ring shapes: rounded square, lens and dot
    path: "M7.5 3h9A4.5 4.5 0 0121 7.5v9a4.5 4.5 0 01-4.5 4.5h-9A4.5 4.5 0 013 16.5v-9A4.5 4.5 0 017.5 3zm0 2A2.5 2.5 0 005 7.5v9A2.5 2.5 0 007.5 19h9a2.5 2.5 0 002.5-2.5v-9A2.5 2.5 0 0016.5 5h-9zM12 7.8a4.2 4.2 0 100 8.4 4.2 4.2 0 000-8.4zm0 1.8a2.4 2.4 0 110 4.8 2.4 2.4 0 010-4.8zm5.2-3.4a1.1 1.1 0 100 2.2 1.1 1.1 0 000-2.2z",
  },
  linkedin: {
    label: "LinkedIn",
    path: "M6.5 9h-3v10h3V9zM5 4.5a1.7 1.7 0 100 3.4 1.7 1.7 0 000-3.4zM20.5 19h-3v-5c0-1.3-.5-2.1-1.6-2.1-.9 0-1.4.6-1.6 1.2-.1.2-.1.5-.1.8V19h-3s.1-8.5 0-9.4h3v1.3c.4-.6 1.1-1.5 2.8-1.5 2 0 3.5 1.3 3.5 4.1V19z",
  },
  whatsapp: {
    label: "WhatsApp",
    path: "M12 3a9 9 0 00-7.7 13.6L3 21l4.5-1.2A9 9 0 1012 3zm4.6 12.6c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-3-1.2-4.9-4.2-5.1-4.4-.1-.2-1.2-1.6-1.2-3s.8-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.8.9c.3.1.5.2.5.4.1.2.1.8-.1 1.5z",
  },
};

export default function Footer() {
  const { t, path } = useLanguage();
  const { footer, nav } = t;

  const socials = Object.entries(contact.social).filter(([, url]) => url);
  const telHref = (n) => `tel:${n.replace(/[^\d+]/g, "")}`;

  const companyLinks = [
    { to: path("home"), label: nav.home },
    { to: path("services"), label: nav.services },
    { to: path("gallery"), label: nav.gallery },
  ];
  const resourceLinks = [
    { to: path("guides"), label: nav.guides },
    { to: path("reviews"), label: nav.reviews },
    { to: path("faq"), label: nav.faq },
    { to: path("contact"), label: nav.contact },
    { to: path("quote"), label: nav.cta },
  ];

  const LinkList = ({ links }) => (
    <ul className="footer__links">
      {links.map((l) => (
        <li key={l.to}>
          <Link to={l.to}>{l.label}</Link>
        </li>
      ))}
    </ul>
  );

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__col footer__col--brand">
            <img src={logoReversed} alt={BRAND} className="footer__logo" />
            <p className="footer__tagline">{footer.tagline}</p>
            {socials.length > 0 && (
              <div className="footer__social">
                {socials.map(([key, url]) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={SOCIAL[key].label}
                    className={`footer__social-link footer__social-link--${key}`}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                      <path d={SOCIAL[key].path} fill="currentColor" fillRule={SOCIAL[key].rule} />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          <nav className="footer__col" aria-label={footer.company}>
            <h4>{footer.company}</h4>
            <LinkList links={companyLinks} />
          </nav>

          <nav className="footer__col" aria-label={footer.resources}>
            <h4>{footer.resources}</h4>
            <LinkList links={resourceLinks} />
          </nav>

          <div className="footer__col">
            <h4>{footer.contacts}</h4>
            <ul className="footer__contact">
              <li>
                {ICONS.pin}
                <span>{footer.address}</span>
              </li>
              {contact.phones.map((p) => (
                <li key={p}>
                  {ICONS.phone}
                  <a href={telHref(p)} dir="ltr">
                    {p}
                  </a>
                </li>
              ))}
              {contact.fax && (
                <li>
                  {ICONS.fax}
                  <span dir="ltr">{contact.fax}</span>
                </li>
              )}
            </ul>
          </div>

          <div className="footer__col">
            <h4>{footer.email}</h4>
            <ul className="footer__emails">
              {contact.emails.map((e) => (
                <li key={e.address}>
                  <strong>{footer.emailLabels[e.label] ?? e.label}</strong>
                  <span className="footer__email-row">
                    {ICONS.mail}
                    <a href={`mailto:${e.address}`}>{e.address}</a>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__meta">
          <span>
            © {new Date().getFullYear()} {footer.rights}
          </span>
        </div>
      </div>
    </footer>
  );
}
