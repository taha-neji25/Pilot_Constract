// "Étude" (design study, service id "calculation") quote: priced per m² of surface, no taxes added.
//
//   surface up to and including 100 m²  ->  15 TND per m²
//   surface above 100 m²                ->  10 TND per m², applied to the WHOLE surface
//
// Customer input: surface in m². The result carries no `tax` field on purpose: the page then shows the total as
// "excl. tax". The rate per m² is NOT returned either (owner's decision: customers only see the total).
// Rates were given by the owner (2026-10-22).

export const INPUT_LIMITS = { surface: { min: 1, max: 50000 } };

const RATE_UP_TO_100_M2 = 15; // TND per m²
const RATE_ABOVE_100_M2 = 10; // TND per m²
const THRESHOLD_M2 = 100;

const round = (n) => Math.round(n * 100) / 100;

export const ratePerM2 = (surface) => (surface <= THRESHOLD_M2 ? RATE_UP_TO_100_M2 : RATE_ABOVE_100_M2);

export function validate(body) {
  const { min, max } = INPUT_LIMITS.surface;
  const surface = Number(body?.surface);
  if (!Number.isFinite(surface) || surface < min || surface > max) return { error: `surface must be between ${min} and ${max}` };
  return { input: { surface } };
}

export function calculate({ surface }) {
  const rate = ratePerM2(surface);
  const total = round(surface * rate);
  return { currency: "TND", surface, subtotal: total, total };
}
