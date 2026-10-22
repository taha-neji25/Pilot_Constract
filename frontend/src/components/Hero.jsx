import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import IBeam from "./IBeam.jsx";
import { useLanguage } from "../i18n/LanguageContext.jsx";
import { prefersReducedMotion } from "../hooks/useInView.js";
import "./Hero.css";

/* ------------------------------------------------------------------ *
 * A steel portal frame (3 frames, 2 bays) drawn in isometric view.
 * Scrolling the pinned hero erects it in this order (labels in
 * translations.js -> home.build.steps follow the same order):
 *
 *   0 tiges d'ancrage            9 attaches pannes & goussets
 *   1 sous-platines             10 pannes
 *   2 platines tôle             11 contreventement toiture
 *   3 poteaux                   12 compression
 *   4 contreventement           13 bayonnettes d'acrotère
 *   5 poutrelles                14 goussets d'acrotère
 *   6 traverse gauche           15 platines d'acrotère
 *   7 traverse droite           16 couverture en tôle (roof sheets)
 *   8 lisses                    17 bardage en tôle (wall sheets)
 * ------------------------------------------------------------------ */

const S = 42; // px per metre in the drawing
const W = 6; // span (x)
const H = 3; // eave height
const R = 1.2; // rise to the ridge
const ZS = [0, 3, 6]; // frame positions along the building (z)
const D = 6; // building length
const BAYS = [
  [0, 3],
  [3, 6],
];
const FLOOR = 1.5; // joist (mezzanine) level
const GIRTS = [1.0, 2.2]; // wall girt heights
const PURLIN_X = [0, W / 4, W / 2, (3 * W) / 4, W];

const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);
// 3D (x across, y up, z along) -> isometric screen
const P = (x, y, z) => [(x - z) * COS * S, ((x + z) * SIN - y) * S];

// The model turns around the vertical axis through the middle of the building (yaw angle `a`, radians)
const CX = W / 2;
const CZ = D / 2;
const project = (x, y, z, a) => {
  const dx = x - CX;
  const dz = z - CZ;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return P(CX + dx * c - dz * s, y, CZ + dx * s + dz * c);
};

const slopeY = (x) => H + R * (1 - Math.abs(x - W / 2) / (W / 2));

const STEP_COUNT = 18;

// Sheet metal is translucent so the frame stays readable underneath
const ALPHA = { roof: 0.55, wall: 0.5 };

function members() {
  const steps = Array.from({ length: STEP_COUNT }, () => []);
  // line / polyline member through 3D points (projected at draw time, so the model can be rotated)
  const line = (step, kind, ...pts) => steps[step].push({ kind, pts });
  // closed plate through 3D points
  const plate = (step, kind, ...pts) => steps[step].push({ kind, pts, plate: true });
  // flat square plate in the x/z plane at height y
  const flat = (step, kind, x, y, z, a) =>
    plate(step, kind, [x - a, y, z - a], [x + a, y, z - a], [x + a, y, z + a], [x - a, y, z + a]);

  const feet = [];
  ZS.forEach((z) => [0, W].forEach((x) => feet.push([x, z])));

  // 0 anchor rods: four per column foot, cast into the slab, nuts above the plate
  feet.forEach(([x, z]) =>
    [
      [-0.22, -0.22],
      [0.22, -0.22],
      [0.22, 0.22],
      [-0.22, 0.22],
    ].forEach(([dx, dz]) => line(0, "rod", [x + dx, -0.7, z + dz], [x + dx, 0.32, z + dz]))
  );

  // 1 under plates (levelling / grout plates), 2 base plates
  feet.forEach(([x, z]) => flat(1, "under", x, 0, z, 0.52));
  feet.forEach(([x, z]) => flat(2, "base", x, 0.07, z, 0.36));

  // 3 columns
  feet.forEach(([x, z]) => line(3, "col", [x, 0.07, z], [x, H, z]));

  // 4 wall bracing (X in each side-wall bay)
  [0, W].forEach((x) =>
    BAYS.forEach(([za, zb]) => {
      line(4, "brace", [x, 0.07, za], [x, H, zb]);
      line(4, "brace", [x, 0.07, zb], [x, H, za]);
    })
  );

  // 5 joists (poutrelles): two long beams on the wall columns, five joists across
  [0, W].forEach((x) => line(5, "joist", [x, FLOOR, 0], [x, FLOOR, D]));
  [0, 1.5, 3, 4.5, 6].forEach((z) => line(5, "joist", [0, FLOOR, z], [W, FLOOR, z]));

  // 6 / 7 rafters (traverses)
  ZS.forEach((z) => line(6, "raft", [0, H, z], [W / 2, H + R, z]));
  ZS.forEach((z) => line(7, "raft", [W, H, z], [W / 2, H + R, z]));

  // 8 girts (lisses): side walls and gable ends
  GIRTS.forEach((y) => {
    [0, W].forEach((x) => line(8, "girt", [x, y, 0], [x, y, D]));
    [0, D].forEach((z) => line(8, "girt", [0, y, z], [W, y, z]));
  });

  // 9 purlin cleats and gusset plates at every purlin / rafter node
  ZS.forEach((z) =>
    PURLIN_X.forEach((x) => {
      const y = slopeY(x);
      plate(9, "cleat", [x - 0.2, y - 0.04, z], [x + 0.2, y - 0.04, z], [x, y - 0.36, z]);
    })
  );

  // 10 purlins, running along the building
  PURLIN_X.forEach((x) => line(10, "purlin", [x, slopeY(x), 0], [x, slopeY(x), D]));

  // 11 roof bracing (X in each roof bay, both slopes)
  [
    [0, W / 2],
    [W, W / 2],
  ].forEach(([xe, xr]) =>
    BAYS.forEach(([za, zb]) => {
      line(11, "brace", [xe, H, za], [xr, H + R, zb]);
      line(11, "brace", [xe, H, zb], [xr, H + R, za]);
    })
  );

  // 12 compression struts across the span, mid-bay
  [1.5, 4.5].forEach((z) => {
    line(12, "strut", [0, H, z], [W, H, z]);
    line(12, "strut", [W / 4, slopeY(W / 4), z], [(3 * W) / 4, slopeY((3 * W) / 4), z]);
  });

  // 13 parapet (acrotère) bayonets: an offset post above each eave
  const sides = [
    [0, -0.2],
    [W, 0.2],
  ];
  ZS.forEach((z) =>
    sides.forEach(([x, d]) =>
      line(13, "bay", [x, H, z], [x, H + 0.3, z], [x + d, H + 0.46, z], [x + d, H + 0.9, z])
    )
  );

  // 14 parapet gussets at the foot of each bayonet
  ZS.forEach((z) =>
    sides.forEach(([x, d]) =>
      plate(14, "gusset", [x, H + 0.04, z], [x, H + 0.36, z], [x + d * 1.9, H + 0.04, z])
    )
  );

  // 15 parapet plates on top of each bayonet
  ZS.forEach((z) => sides.forEach(([x, d]) => flat(15, "acrplate", x + d, H + 0.9, z, 0.2)));

  // 12 roof sheets: 6 per slope, running eave -> ridge, side by side along the building
  const SHEETS = 6;
  const sz = D / SHEETS;
  [
    [0, W / 2],
    [W, W / 2],
  ].forEach(([xe, xr]) => {
    for (let i = 0; i < SHEETS; i += 1) {
      const z0 = i * sz;
      const z1 = z0 + sz;
      plate(16, "roof", [xe, H, z0], [xr, H + R, z0], [xr, H + R, z1], [xe, H, z1]);
    }
  });

  // 17 wall cladding: back walls first so the near walls paint over them
  for (let i = 0; i < SHEETS; i += 1) {
    const z0 = i * sz;
    const z1 = z0 + sz;
    plate(17, "wall", [0, 0.07, z0], [0, H, z0], [0, H, z1], [0, 0.07, z1]);
  }
  for (let i = 0; i < SHEETS; i += 1) {
    const x0 = i * (W / SHEETS);
    const x1 = x0 + W / SHEETS;
    plate(17, "wall", [x0, 0.07, 0], [x0, slopeY(x0), 0], [x1, slopeY(x1), 0], [x1, 0.07, 0]);
  }
  for (let i = 0; i < SHEETS; i += 1) {
    const x0 = i * (W / SHEETS);
    const x1 = x0 + W / SHEETS;
    plate(17, "wall", [x0, 0.07, D], [x0, slopeY(x0), D], [x1, slopeY(x1), D], [x1, 0.07, D]);
  }
  for (let i = 0; i < SHEETS; i += 1) {
    const z0 = i * sz;
    const z1 = z0 + sz;
    plate(17, "wall", [W, 0.07, z0], [W, H, z0], [W, H, z1], [W, 0.07, z1]);
  }

  return steps;
}

const START = 0.02;
const END = 0.97;
const SPAN = (END - START) / STEP_COUNT;

function timeline() {
  const out = [];
  members().forEach((list, step) => {
    const stepStart = START + step * SPAN;
    const dur = SPAN * 0.6;
    const gap = list.length > 1 ? (SPAN - dur) / (list.length - 1) : 0;
    list.forEach((m, i) => {
      const start = stepStart + gap * i;
      out.push({ ...m, step, start, end: start + dur });
    });
  });
  return out;
}

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const NAV_H = 75; // sticky navbar height (72 + 3px rule)

const pathData = (m, a) =>
  m.pts
    .map(([x, y, z], i) => {
      const [px, py] = project(x, y, z, a);
      return `${i ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`;
    })
    .join("") + (m.plate ? "Z" : "");

// ground slab corners (a little larger than the building)
const GROUND = [
  [-0.7, 0, -0.7],
  [W + 0.7, 0, -0.7],
  [W + 0.7, 0, D + 0.7],
  [-0.7, 0, D + 0.7],
];
const groundPoints = (a) => GROUND.map(([x, y, z]) => project(x, y, z, a).map((n) => n.toFixed(1)).join(",")).join(" ");

// How far a drag turns the model (radians per pixel), and the keyboard step
const TURN_PER_PX = 0.012;
const TURN_KEY = 0.2;
const MAX_COAST = 0.08; // fastest glide after releasing a drag (radians per frame)

export default function Hero() {
  const { t } = useLanguage();
  const { home } = t;

  const elements = useMemo(timeline, []);
  const reduced = useMemo(() => prefersReducedMotion(), []);

  const wrapRef = useRef(null);
  const buildRef = useRef(null);
  const groundRef = useRef(null);
  const angleRef = useRef(0);
  const lineRefs = useRef([]);
  const [touched, setTouched] = useState(false);
  const [step, setStep] = useState(reduced ? STEP_COUNT - 1 : 0);
  const [done, setDone] = useState(reduced);

  // view box around the whole building, padded (includes the anchor rods and the parapet)
  const box = useMemo(() => {
    // union over every viewing angle, so the drawing never gets clipped while it turns
    const corners = [
      [-0.7, -0.7, -0.7],
      [W + 0.7, -0.7, -0.7],
      [W + 0.7, -0.7, D + 0.7],
      [-0.7, -0.7, D + 0.7],
      [0, H + 0.9, 0],
      [W, H + 0.9, 0],
      [0, H + 0.9, D],
      [W, H + 0.9, D],
      [W / 2, H + R, 0],
      [W / 2, H + R, D],
    ];
    const pts = [];
    for (let deg = 0; deg < 360; deg += 5) corners.forEach(([x, y, z]) => pts.push(project(x, y, z, (deg * Math.PI) / 180)));
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const pad = 22;
    const x0 = Math.min(...xs) - pad;
    const y0 = Math.min(...ys) - pad;
    return { x0, y0, w: Math.max(...xs) + pad - x0, h: Math.max(...ys) + pad - y0 };
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;

    const apply = (p) => {
      elements.forEach((m, i) => {
        const el = lineRefs.current[i];
        if (!el) return;
        const t01 = clamp((p - m.start) / (m.end - m.start), 0, 1);
        el.style.strokeDashoffset = String(1 - t01);
        if (m.plate) el.style.fillOpacity = String(t01 * (ALPHA[m.kind] ?? 0.85));
      });
      setStep(clamp(Math.floor((p - START) / SPAN), 0, STEP_COUNT - 1));
      setDone(p >= END - 0.005);
    };

    if (reduced) {
      apply(1);
      return undefined;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const sticky = wrap.firstElementChild;
      const run = wrap.offsetHeight - sticky.offsetHeight;
      const p = run > 0 ? clamp((NAV_H - wrap.getBoundingClientRect().top) / run, 0, 1) : 1;
      apply(p);
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
  }, [elements, reduced]);

  // Drag (mouse or finger) or arrow keys turn the model; double-click or Home resets the view
  useEffect(() => {
    const area = buildRef.current;
    if (!area) return undefined;
    let draw = 0;
    let glide = 0;
    let dragging = false;
    let lastX = 0;
    let vel = 0;
    let announced = false;

    const paint = () => {
      draw = 0;
      const a = angleRef.current;
      elements.forEach((m, i) => lineRefs.current[i]?.setAttribute("d", pathData(m, a)));
      groundRef.current?.setAttribute("points", groundPoints(a));
    };
    const turn = (da) => {
      angleRef.current += da;
      if (!draw) draw = requestAnimationFrame(paint);
      if (!announced) {
        announced = true;
        setTouched(true);
      }
    };
    const coast = () => {
      glide = 0;
      if (dragging || Math.abs(vel) < 0.0004) return;
      turn(vel);
      vel *= 0.93;
      glide = requestAnimationFrame(coast);
    };
    const down = (e) => {
      if (e.button) return;
      dragging = true;
      lastX = e.clientX;
      vel = 0;
      cancelAnimationFrame(glide);
      try {
        area.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already gone: dragging still works without capture */
      }
      area.classList.add("is-dragging");
    };
    const move = (e) => {
      if (!dragging) return;
      vel = (e.clientX - lastX) * TURN_PER_PX;
      lastX = e.clientX;
      turn(vel);
    };
    const up = (e) => {
      if (!dragging) return;
      dragging = false;
      area.classList.remove("is-dragging");
      try {
        area.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      vel = Math.max(-MAX_COAST, Math.min(MAX_COAST, vel)); // a hard flick still glides only about a quarter turn
      if (!reduced) glide = requestAnimationFrame(coast);
    };
    const reset = () => {
      angleRef.current = 0;
      vel = 0;
      if (!draw) draw = requestAnimationFrame(paint);
    };
    const key = (e) => {
      if (e.key === "ArrowLeft") turn(-TURN_KEY);
      else if (e.key === "ArrowRight") turn(TURN_KEY);
      else if (e.key === "Home") reset();
      else return;
      e.preventDefault();
    };

    area.addEventListener("pointerdown", down);
    area.addEventListener("pointermove", move);
    area.addEventListener("pointerup", up);
    area.addEventListener("pointercancel", up);
    area.addEventListener("dblclick", reset);
    area.addEventListener("keydown", key);
    return () => {
      area.removeEventListener("pointerdown", down);
      area.removeEventListener("pointermove", move);
      area.removeEventListener("pointerup", up);
      area.removeEventListener("pointercancel", up);
      area.removeEventListener("dblclick", reset);
      area.removeEventListener("keydown", key);
      cancelAnimationFrame(draw);
      cancelAnimationFrame(glide);
    };
  }, [elements, reduced]);

  const labels = home.build.steps;
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className={reduced ? "hero-scroll hero-scroll--static" : "hero-scroll"} ref={wrapRef}>
      <section className="hero pc-bracket">
        <div className="container hero__layout">
          <div className="hero__inner">
            <p className="eyebrow">
              <IBeam />
              {home.eyebrow}
            </p>
            <h1 className="hero__title">{home.title}</h1>
            <p className="hero__lead">{home.lead}</p>
            <div className="hero__actions">
              <Link to="/devis" className="btn btn-primary">
                {home.ctaPrimary}
              </Link>
              <Link to="/galerie" className="btn btn-outline">
                {home.ctaSecondary}
              </Link>
            </div>
          </div>

          <div
            className="hero__build"
            ref={buildRef}
            role="group"
            tabIndex={0}
            aria-label={`${home.build.label}: ${labels.join(", ")}. ${home.build.rotateHint}`}
          >
            <svg
              viewBox={`${box.x0} ${box.y0} ${box.w} ${box.h}`}
              className="build"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              {/* ground slab */}
              <polygon className="build__ground" ref={groundRef} points={groundPoints(angleRef.current)} />
              {elements.map((m, i) => (
                <path
                  key={i}
                  ref={(el) => {
                    lineRefs.current[i] = el;
                  }}
                  d={pathData(m, angleRef.current)}
                  pathLength="1"
                  className={`build__m build__m--${m.kind}`}
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: reduced ? 0 : 1,
                    fillOpacity: m.plate ? (reduced ? (ALPHA[m.kind] ?? 0.85) : 0) : undefined,
                  }}
                />
              ))}
            </svg>

            <p className={touched ? "build__hint is-hidden" : "build__hint"} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path
                  d="M20 12a8 8 0 11-2.7-6M20 4v4.5h-4.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {home.build.rotateHint}
            </p>

            <div className="build__steps" aria-hidden="true">
              <p className="build__label">
                <em>{home.build.label}</em>
                <span>
                  {pad(Math.min(step + 1, STEP_COUNT))} / {pad(STEP_COUNT)}
                </span>
              </p>
              <p className="build__now">{labels[step]}</p>
              <ol style={{ gridTemplateColumns: `repeat(${STEP_COUNT}, minmax(0, 1fr))` }}>
                {labels.map((label, i) => (
                  <li
                    key={label + i}
                    className={
                      i < step || (done && i === step) ? "is-done" : i === step ? "is-active" : ""
                    }
                  />
                ))}
              </ol>
            </div>
          </div>
        </div>

        <a href="#story" className="hero__scroll" aria-label={home.scroll}>
          <span>{home.scroll}</span>
          <i aria-hidden="true" />
        </a>
      </section>
    </div>
  );
}
