import IBeam from "../components/IBeam.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import "./Reviews.css";

export default function Reviews() {
  const { t } = useLanguage();
  const { reviews } = t;

  return (
    <section className="section reviews">
      <div className="container">
        <p className="eyebrow">
          <IBeam />
          {reviews.eyebrow}
        </p>
        <h1>{reviews.title}</h1>

        <div className="reviews__grid">
          {reviews.items.map((review) => (
            <figure className="review-card" key={review.name}>
              <IBeam />
              <blockquote>{review.quote}</blockquote>
              <figcaption>
                <span className="review-card__name">{review.name}</span>
                <span className="review-card__role">{review.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
