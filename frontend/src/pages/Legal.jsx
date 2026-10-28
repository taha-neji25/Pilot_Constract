import { Link } from "react-router-dom";
import IBeam from "../components/IBeam.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import docs, { LEGAL_DOCS, legalUi } from "../i18n/legalText.js";
import { LEGAL_UPDATED } from "../data/company.js";
import "./Legal.css";

// One of the legal pages: privacy, terms, cookies, refunds, legal notice (texts in i18n/legal*.js)
export default function LegalPage({ doc }) {
  const { language, path } = useLanguage();
  const ui = legalUi[language];
  const d = docs[language][doc];
  const updated = new Date(`${LEGAL_UPDATED}T12:00:00Z`).toLocaleDateString(language === "ar" ? "ar-TN" : language, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <section className="section legal">
      <article className="container legal__doc">
        <p className="eyebrow">
          <IBeam />
          {ui.nav}
        </p>
        <h1>{d.h1}</h1>
        <p className="legal__updated">
          {ui.updated} : <time dateTime={LEGAL_UPDATED}>{updated}</time>
        </p>
        <p className="legal__intro">{d.intro}</p>

        {d.sections.map((s) => (
          <div key={s.h} className="legal__section">
            <h2>{s.h}</h2>
            {s.list && (
              <ul>
                {s.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {s.p?.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
        ))}

        <h2 className="legal__more">{ui.seeAlso}</h2>
        <ul className="legal__others">
          {LEGAL_DOCS.filter((other) => other !== doc).map((other) => (
            <li key={other}>
              <Link to={path(other)}>{docs[language][other].h1}</Link>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
