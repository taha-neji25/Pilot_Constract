import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import IBeam from "./IBeam.jsx";
import Reveal from "./Reveal.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import "./Story.css";

// One real project photo per chapter (public/gallery/<id>.webp) and the gallery section it links to.
const CHAPTERS = [
  { image: "p161", section: "calculation" },
  { image: "p023", section: "fabrication" },
  { image: "p001", section: "assembly" },
  { image: "p112", section: "framing" },
];

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export default function Story() {
  const { t, path } = useLanguage();
  const { story } = t.home;
  const { nav } = t;

  const [active, setActive] = useState(0);
  const sectionRef = useRef(null);
  const stepRefs = useRef([]);

  // On scroll: progress through the chapters (0..1) drives the rail fill,
  // and the chapter whose centre is closest to mid-screen becomes the active one.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = clamp((window.innerHeight * 0.5 - r.top) / r.height, 0, 1);
      el.style.setProperty("--story-p", p.toFixed(3));

      const mid = window.innerHeight * 0.5;
      let best = 0;
      let bestDist = Infinity;
      stepRefs.current.forEach((step, i) => {
        if (!step) return;
        const b = step.getBoundingClientRect();
        const d = Math.abs(b.top + b.height / 2 - mid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setActive(best);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const pad = (n) => String(n + 1).padStart(2, "0");

  return (
    <section className="story" id="story">
      <div className="container">
        <Reveal className="story__header">
          <p className="eyebrow">
            <IBeam />
            {story.eyebrow}
          </p>
          <h2>{story.title}</h2>
          <p>{story.lead}</p>
        </Reveal>

        <div className="story__layout">
          {/* Pinned visual: photos cross-fade as the chapters scroll past */}
          <div className="story__visual" aria-hidden="true">
            <div className="story__frame">
              {CHAPTERS.map((c, i) => (
                <img
                  key={c.image}
                  src={`/gallery/${c.image}.webp`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className={i === active ? "story__photo story__photo--on" : "story__photo"}
                />
              ))}
              <span className="story__num">{pad(active)}</span>
            </div>
            <ol className="story__dots">
              {CHAPTERS.map((c, i) => (
                <li key={c.section} className={i <= active ? "is-done" : ""} />
              ))}
            </ol>
          </div>

          <div className="story__steps" ref={sectionRef}>
            <span className="story__rail" aria-hidden="true">
              <span className="story__rail-fill" />
            </span>
            {story.steps.map((step, i) => (
              <article
                className={i === active ? "story-step story-step--active" : "story-step"}
                key={step.title}
                data-index={i}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
              >
                <img
                  className="story-step__photo"
                  src={`/gallery/${CHAPTERS[i].image}.webp`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <p className="story-step__kicker">
                  {story.step} {pad(i)}
                </p>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                <Link className="story-step__link" to={path("gallery", `section=${CHAPTERS[i].section}`)}>
                  {story.seePhotos} →
                </Link>
              </article>
            ))}

            <Reveal className="story__final">
              <h3>{story.finalTitle}</h3>
              <div className="story__final-actions">
                <Link to={path("quote")} className="btn btn-primary">
                  {story.finalCta}
                </Link>
                <Link to={path("faq")} className="story__faq">
                  {t.home.introLink}
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
