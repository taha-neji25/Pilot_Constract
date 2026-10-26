import { Link } from "react-router-dom";
import IBeam from "../components/IBeam.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import contactText from "../i18n/contactText.js";
import contact from "../data/contact.js";
import { BRAND, FR_NAME, MAPS_URL } from "../data/company.js";
import "./Contact.css";

const telHref = (n) => `tel:${n.replace(/[^\d+]/g, "")}`;
const SOCIAL_LABELS = { facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn" };

// /contact: every way to reach the company in plain text, so people and search engines can read it
export default function Contact() {
  const { language, path } = useLanguage();
  const c = contactText[language];
  const socials = Object.entries(contact.social).filter(([key, url]) => url && SOCIAL_LABELS[key]);

  return (
    <section className="section contact-page">
      <div className="container">
        <p className="eyebrow">
          <IBeam />
          {c.eyebrow}
        </p>
        <h1>{c.title}</h1>
        <p className="contact-page__lead">{c.lead}</p>

        <address className="contact-page__grid">
          <div className="contact-page__card">
            <h2>{c.phone}</h2>
            <ul>
              {contact.phones.map((p) => (
                <li key={p}>
                  <a href={telHref(p)} dir="ltr">
                    {p}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {contact.social.whatsapp && (
            <div className="contact-page__card">
              <h2>{c.whatsapp}</h2>
              <p>
                <a href={contact.social.whatsapp} target="_blank" rel="noopener noreferrer">
                  {c.whatsappCta}
                </a>
              </p>
            </div>
          )}

          {contact.emails.length > 0 && (
            <div className="contact-page__card">
              <h2>{c.email}</h2>
              <ul>
                {contact.emails.map((e) => (
                  <li key={e.address}>
                    <a href={`mailto:${e.address}`} dir="ltr">
                      {e.address}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="contact-page__card">
            <h2>{c.address}</h2>
            <p>
              {FR_NAME} ({BRAND})
            </p>
            <p>{c.addressValue}</p>
            <p>
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                {c.mapsCta}
              </a>
            </p>
          </div>

          <div className="contact-page__card">
            <h2>{c.hours}</h2>
            <p>{c.hoursValue}</p>
          </div>

          <div className="contact-page__card">
            <h2>{c.area}</h2>
            <p>{c.areaValue}</p>
          </div>

          {socials.length > 0 && (
            <div className="contact-page__card">
              <h2>{c.social}</h2>
              <ul>
                {socials.map(([key, url]) => (
                  <li key={key}>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {SOCIAL_LABELS[key]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </address>

        <div className="contact-page__quote">
          <p>{c.quoteText}</p>
          <Link to={path("quote")} className="btn btn-primary">
            {c.quote}
          </Link>
        </div>
      </div>
    </section>
  );
}
