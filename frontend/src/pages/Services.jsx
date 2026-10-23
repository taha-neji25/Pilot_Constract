import { Link } from "react-router-dom";
import IBeam from "../components/IBeam.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import galleryImages from "../data/galleryImages.js";
import { serviceUi } from "../i18n/serviceDetails.js";
import { servicePage } from "../seo/routes.js";
import "./Services.css";

// One isometric icon per service (Brand Guidelines, Iconography). Files are named after the service ids.
const icons = import.meta.glob("../assets/brand/icons/*.svg", { eager: true, query: "?url", import: "default" });
const iconFor = (id) => icons[`../assets/brand/icons/${id}.svg`];

export default function Services() {
  const { t, path, language } = useLanguage();
  const { services, gallery } = t;

  const countFor = (id) => galleryImages.filter((img) => img.section === id).length;

  return (
    <section className="section services">
      <div className="container">
        <p className="eyebrow">
          <IBeam />
          {services.eyebrow}
        </p>
        <h1>{services.title}</h1>
        <p className="services__lead">{services.lead}</p>

        <div className="services__grid">
          {services.items.map((service) => (
            <Link
              className="service-card"
              key={service.id}
              to={path(servicePage(service.id))}
            >
              {iconFor(service.id) ? (
                <img src={iconFor(service.id)} alt="" aria-hidden="true" className="service-card__icon" />
              ) : (
                <IBeam />
              )}
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
              <span className="service-card__link">
                {serviceUi[language].more}
                <span className="service-card__count">
                  {countFor(service.id)} {gallery.photos}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
