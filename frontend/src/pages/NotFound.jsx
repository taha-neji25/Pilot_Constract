import { Link } from "react-router-dom";
import IBeam from "../components/IBeam.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import "./NotFound.css";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <section className="section not-found">
      <div className="container">
        <IBeam className="not-found__icon" />
        <h1>{t.notFound.title}</h1>
        <p>{t.notFound.text}</p>
        <Link to="/" className="btn btn-primary">{t.notFound.cta}</Link>
      </div>
    </section>
  );
}
