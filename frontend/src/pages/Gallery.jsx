import { useEffect, useRef, useState } from "react";
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
  const [height, setHeight] = useState(() => rowHeightFor(typeof window === "undefined" ? 1200 : window.innerWidth));
  useEffect(() => {
    const onResize = () => setHeight(rowHeightFor(window.innerWidth));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return height;
}

export default function Gallery() {
  const { t, language } = useLanguage();
  const { gallery } = t;
  const [params, setParams] = useSearchParams();
  const [openIndex, setOpenIndex] = useState(null);
  const rowHeight = useRowHeight();
  const openerRef = useRef(null); // the photo that opened the viewer: it gets focus back when the viewer closes
  const dialogRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validIds = gallery.categories.map((c) => c.id);
  const requested = params.get("section");
  const filter = validIds.includes(requested) ? requested : "all";

  const filtered =
    filter === "all" ? galleryImages : galleryImages.filter((img) => img.section === filter);

  const categoryLabel = (id) => gallery.categories.find((c) => c.id === id)?.label ?? id;
  const photoWord = { fr: "photo", en: "photo", ar: "صورة" }[language];
  // each photo has its own text (category + number): identical text on 146 images tells a screen-reader user nothing
  const altFor = (img, n) => `${categoryLabel(img.section)} — Sfax, ${photoWord} ${n}`;
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

  // viewer opens: focus moves into it; it closes: focus goes back to the photo that was opened
  const viewerOpen = openIndex !== null;
  useEffect(() => {
    if (!viewerOpen) return undefined;
    dialogRef.current?.querySelector("button")?.focus();
    const opener = openerRef.current;
    return () => opener?.focus();
  }, [viewerOpen]);

  useEffect(() => {
    if (openIndex === null) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") setOpenIndex((i) => (i + 1) % filtered.length);
      if (e.key === "ArrowLeft") setOpenIndex((i) => (i - 1 + filtered.length) % filtered.length);
      if (e.key === "Tab" && dialogRef.current) {
        // keep Tab inside the viewer while it is open
        const buttons = [...dialogRef.current.querySelectorAll("button")];
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
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
                onClick={(e) => {
                  openerRef.current = e.currentTarget;
                  setOpenIndex(i);
                }}
                aria-haspopup="dialog"
              >
                <img
                  src={`/gallery/thumb/${img.id}.webp`}
                  alt={altFor(img, i + 1)}
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
          aria-label={gallery.title}
          ref={dialogRef}
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
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
            alt={altFor(current, openIndex + 1)}
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
