// "Etude" (design study, service id "calculation") quote: priced per m2 of surface, no taxes added.
//
//   surface up to and including the threshold (100 m2 at first)  ->  the small rate (15 TND per m2 at first)
//   surface above the threshold                                  ->  the large rate (10 TND per m2 at first), on the WHOLE surface
//
// The rates and the threshold are `prices.calculation_*`, edited by admins in the dashboard (fallbacks in ../pricing.js).
// Customer input: surface in m2. The result carries no `tax` field on purpose: the page then shows the total as
// "excl. tax". The rate per m2 is NOT returned either (owner's decision: customers only see the total).

import { DEFAULT_PRICES } from "../pricing.js";

export const INPUT_LIMITS = { surface: { min: 1, max: 50000 } };

const round = (n) => Math.round(n * 100) / 100;

export const ratePerM2 = (surface, prices = DEFAULT_PRICES) =>
  surface <= prices.calculation_threshold_m2 ? prices.calculation_rate_small : prices.calculation_rate_large;

export function validate(body) {
  const { min, max } = INPUT_LIMITS.surface;
  const surface = Number(body?.surface);
  if (!Number.isFinite(surface) || surface < min || surface > max) return { error: `surface must be between ${min} and ${max}` };
  return { input: { surface } };
}

export function calculate({ surface }, prices = DEFAULT_PRICES) {
  const total = round(surface * ratePerM2(surface, prices));
  return { currency: "TND", surface, subtotal: total, total };
}
