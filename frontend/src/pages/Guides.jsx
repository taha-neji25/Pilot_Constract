import { Link } from "react-router-dom";
import IBeam from "../components/IBeam.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import guides, { guideUi } from "../i18n/guides.js";
import { GUIDE_IDS, guidePage } from "../seo/routes.js";
import "./Guides.css";

// /guides: the list of articles
export function GuidesIndex() {
  const { language, path } = useLanguage();
  const ui = guideUi[language];
  return (
    <section className="section guides">
      <div className="container">
        <p className="eyebrow">
          <IBeam />
          {ui.eyebrow}
        </p>
        <h1>{ui.title}</h1>
        <p className="guides__lead">{ui.lead}</p>
        <div className="guides__grid">
          {GUIDE_IDS.map((id) => (
            <Link key={id} to={path(guidePage(id))} className="guide-card">
              <h2>{guides[language][id].h1}</h2>
              <p>{guides[language][id].intro}</p>
              <span className="guide-card__read">{ui.read}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// /guides/<article>
export function GuidePage({ id }) {
  const { language, path } = useLanguage();
  const ui = guideUi[language];
  const g = guides[language][id];
  return (
    <section className="section guides">
      <article className="container guide">
        <nav className="guide__crumbs" aria-label="breadcrumb">
          <Link to={path("home")}>{ui.home}</Link>
          <span aria-hidden="true">/</span>
          <Link to={path("guides")}>{ui.guides}</Link>
        </nav>
        <p className="eyebrow">
          <IBeam />
          {ui.eyebrow}
        </p>
        <h1>{g.h1}</h1>
        <p className="guide__intro">{g.intro}</p>
        <p className="guide__by">{ui.published}</p>

        {g.sections.map((s) => (
          <div key={s.h} className="guide__section">
            <h2>{s.h}</h2>
            {s.p?.map((text) => (
              <p key={text}>{text}</p>
            ))}
            {s.list && (
              <ul>
                {s.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <div className="guide__cta">
          <h2>{ui.cta}</h2>
          <div className="guide__cta-actions">
            <Link to={path("quote")} className="btn btn-primary">
              {ui.ctaQuote}
            </Link>
            <Link to={path("services")} className="guide__link">
              {ui.services} →
            </Link>
          </div>
        </div>

        <h2 className="guide__more">{ui.more}</h2>
        <ul className="guide__others">
          {GUIDE_IDS.filter((other) => other !== id).map((other) => (
            <li key={other}>
              <Link to={path(guidePage(other))}>{guides[language][other].h1}</Link>
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
