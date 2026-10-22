import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import IBeam from "../components/IBeam.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import galleryImages from "../data/galleryImages.js";
import "./Gallery.css";

// Target row height (px) for the justified layout, smaller on narrow screens
// so a row still holds several photos.
function rowHeightFor(width) {
  if (width < 600) return 120;
  if (width < 1000) return 170;
  return 220;
}

function useRowHeight() {
  const [height, setHeight] = useState(() => rowHeightFor(window.innerWidth));
  useEffect(() => {
    const onResize = () => setHeight(rowHeightFor(window.innerWidth));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return height;
}

export default function Gallery() {
  const { t } = useLanguage();
  const { gallery } = t;
  const [params, setParams] = useSearchParams();
  const [openIndex, setOpenIndex] = useState(null);
  const rowHeight = useRowHeight();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validIds = gallery.categories.map((c) => c.id);
  const requested = params.get("section");
  const filter = validIds.includes(requested) ? requested : "all";

  const filtered =
    filter === "all" ? galleryImages : galleryImages.filter((img) => img.section === filter);

  const categoryLabel = (id) => gallery.categories.find((c) => c.id === id)?.label ?? id;
  const countFor = (id) => galleryImages.filter((img) => img.section === id).length;

  const selectFilter = (id) => {
    setOpenIndex(null);
    setParams(id === "all" ? {} : { section: id });
  };

  // Keep the selected chip visible in the swipeable filter row on small screens.
  useEffect(() => {
    document
      .querySelector(".gallery__filter--active")
      ?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [filter]);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") setOpenIndex((i) => (i + 1) % filtered.length);
      if (e.key === "ArrowLeft") setOpenIndex((i) => (i - 1 + filtered.length) % filtered.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openIndex, filtered.length]);

  const current = openIndex === null ? null : filtered[openIndex];

  return (
    <section className="section gallery">
      <div className="container">
        <p className="eyebrow">
          <IBeam />
          {gallery.eyebrow}
        </p>
        <h1>{gallery.title}</h1>

        <div className="gallery__filters">
          <button
            className={filter === "all" ? "gallery__filter gallery__filter--active" : "gallery__filter"}
            onClick={() => selectFilter("all")}
          >
            {gallery.all} ({galleryImages.length})
          </button>
          {gallery.categories.map((cat) => (
            <button
              key={cat.id}
              className={
                cat.id === filter ? "gallery__filter gallery__filter--active" : "gallery__filter"
              }
              onClick={() => selectFilter(cat.id)}
            >
              {cat.label} ({countFor(cat.id)})
            </button>
          ))}
        </div>

        <div className="gallery__grid">
          {filtered.map((img, i) => (
            <figure
              className="gallery-card"
              key={img.id}
              style={{ flexGrow: (img.w / img.h) * 100, flexBasis: `${(img.w / img.h) * rowHeight}px` }}
            >
              <button
                type="button"
                className="gallery-card__image"
                style={{ aspectRatio: `${img.w} / ${img.h}` }}
                onClick={() => setOpenIndex(i)}
                aria-label={categoryLabel(img.section)}
              >
                <img
                  src={`/gallery/thumb/${img.id}.webp`}
                  alt={categoryLabel(img.section)}
                  loading="lazy"
                  decoding="async"
                />
              </button>
            </figure>
          ))}
          <span className="gallery__spacer" />
        </div>
      </div>

      {current && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpenIndex(null)}
        >
          <button
            className="lightbox__btn lightbox__close"
            aria-label={gallery.close}
            onClick={() => setOpenIndex(null)}
          >
            ×
          </button>
          <button
            className="lightbox__btn lightbox__prev"
            aria-label={gallery.prev}
            onClick={(e) => {
              e.stopPropagation();
              setOpenIndex((openIndex - 1 + filtered.length) % filtered.length);
            }}
          >
            ‹
          </button>
          <img
            className="lightbox__img"
            src={`/gallery/${current.id}.webp`}
            alt={categoryLabel(current.section)}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="lightbox__btn lightbox__next"
            aria-label={gallery.next}
            onClick={(e) => {
              e.stopPropagation();
              setOpenIndex((openIndex + 1) % filtered.length);
            }}
          >
            ›
          </button>
          <p className="lightbox__caption">
            {categoryLabel(current.section)} — {openIndex + 1} / {filtered.length}
          </p>
        </div>
      )}
    </section>
  );
}
