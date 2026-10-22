import { useState } from "react";
import "./PartnersCarousel.css";

// Endless logo carousel. The list is rendered twice and the track slides by exactly one copy, so the loop is
// seamless. Pauses on hover/focus and with the pause button; with "reduce motion" it becomes a swipeable row.
export default function PartnersCarousel({ partners, pauseLabel, playLabel }) {
  const [paused, setPaused] = useState(false);

  const copy = (hidden) =>
    partners.map((p) => (
      <li className="partners__item" key={`${hidden ? "b" : "a"}-${p.name}`} aria-hidden={hidden || undefined}>
        <img src={p.image} alt={hidden ? "" : p.name} loading="lazy" draggable="false" />
      </li>
    ));

  return (
    <div className="partners">
      <div className="partners__viewport">
        <ul
          className={paused ? "partners__track partners__track--paused" : "partners__track"}
          style={{ "--duration": `${Math.max(partners.length * 5, 20)}s` }}
        >
          {copy(false)}
          {copy(true)}
        </ul>
      </div>

      <button
        type="button"
        className="partners__toggle"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={paused ? playLabel : pauseLabel}
        title={paused ? playLabel : pauseLabel}
      >
        {paused ? (
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 2.5v11l9-5.5z" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3.5 2h3.2v12H3.5zM9.3 2h3.2v12H9.3z" />
          </svg>
        )}
      </button>
    </div>
  );
}
