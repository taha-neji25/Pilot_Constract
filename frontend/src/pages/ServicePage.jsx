import { Link } from "react-router-dom";
import IBeam from "../components/IBeam.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import serviceDetails, { serviceUi } from "../i18n/serviceDetails.js";
import galleryImages from "../data/galleryImages.js";
import guides, { guideUi } from "../i18n/guides.js";
import { GUIDE_IDS, guidePage, servicePage } from "../seo/routes.js";
import "./ServicePage.css";

// One page per service (address in seo/routes.js, text in i18n/serviceDetails.js): what we do, photos, other services.
export default function ServicePage({ id }) {
  const { t, language, path } = useLanguage();
  const ui = serviceUi[language];
  const d = serviceDetails[language][id];
  const photos = galleryImages.filter((img) => img.section === id).slice(0, 6);
  const others = t.services.items.filter((s) => s.id !== id);

  return (
    <section className="section service-page">
      <div className="container">
        <nav className="service-page__crumbs" aria-label="breadcrumb">
          <Link to={path("home")}>{ui.home}</Link>
          <span aria-hidden="true">/</span>
          <Link to={path("services")}>{ui.services}</Link>
        </nav>

        <p className="eyebrow">
          <IBeam />
          {t.services.items.find((s) => s.id === id)?.title}
        </p>
        <h1>{d.h1}</h1>
        <p className="service-page__intro">{d.intro}</p>

        <div className="service-page__cols">
          <div>
            <h2>{ui.what}</h2>
            <ul className="service-page__points">
              {d.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="service-page__area">{ui.area}</p>
            <div className="service-page__actions">
              <Link to={path("quote")} className="btn btn-primary">
                {ui.quote}
              </Link>
              <Link to={path("faq")} className="service-page__faq">
                {ui.faq}
              </Link>
            </div>
          </div>

          <div>
            <h2>{ui.why}</h2>
            <p>{t.home.about.expertise.text}</p>
            <p>{t.home.about.quality.text}</p>
          </div>
        </div>

        {photos.length > 0 && (
          <>
            <h2 className="service-page__work">{ui.work}</h2>
            <div className="service-page__photos">
              {photos.map((img, i) => (
                <img
                  key={img.id}
                  src={`/gallery/thumb/${img.id}.webp`}
                  alt={`${d.h1} — ${ui.photoOf} ${i + 1}`}
                  width={img.w}
                  height={img.h}
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
            <Link className="service-page__all" to={path("gallery", `section=${id}`)}>
              {ui.allPhotos}
            </Link>
          </>
        )}

        <h2 className="service-page__work">{guideUi[language].guides}</h2>
        <ul className="service-page__others">
          {GUIDE_IDS.map((gid) => (
            <li key={gid}>
              <Link to={path(guidePage(gid))}>{guides[language][gid].h1}</Link>
            </li>
          ))}
        </ul>

        <h2 className="service-page__work">{ui.others}</h2>
        <ul className="service-page__others">
          {others.map((s) => (
            <li key={s.id}>
              <Link to={path(servicePage(s.id))}>{s.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
