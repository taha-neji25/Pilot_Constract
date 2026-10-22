// Industrial framing (portal-frame hall) quote: a port of the "FG" tab of the Devis Client sheet.
//
// Customer inputs: length, width (span), eaves height and bay spacing ("interportique"), all in metres, plus the
// steel profile for each position (columns, rafters, purlins...), chosen from that position's own dropdown list.
// Profiles are not derived from the span, so the result is an indicative estimate that the workshop confirms
// after a proper design; the dimension ranges below keep requests in a sensible band.

import { profileWeight } from "./profiles.js";
import { DEFAULT_PRICES } from "../pricing.js";

export const INPUT_LIMITS = {
  length: { min: 6, max: 150 },
  width: { min: 6, max: 40 },
  height: { min: 3, max: 15 },
  baySpacing: { min: 3, max: 10 },
};

// The profile dropdown of each position, exactly as set up in the sheet (FG tab, column C data validation).
// "_" means "none": the position is left out and weighs 0. Every position starts on none (owner's decision,
// 2026-10-22), so the customer picks the profiles; the sheet's old pre-selections are noted in the tests.
const IPE = [
  "IPE 80", "IPE 100", "IPE 120", "IPE 140", "IPE 160", "IPE 180", "IPE 200", "IPE 220", "IPE 240",
  "IPE 270", "IPE 300", "IPE 330", "IPE 360", "IPE 400", "IPE 450", "IPE 500", "IPE 550", "IPE 600",
];
const PANE_C = [
  "Pane C 100/2.0", "Pane C 100/2.5", "Pane C 100/3.0", "Pane C 120/2.0", "Pane C 120/2.5", "Pane C 120/3.0",
  "Pane C 140/2.0", "Pane C 140/2.5", "Pane C 140/3.0", "Pane C 160/2.0", "Pane C 160/2.5", "Pane C 160/3.0",
  "Pane C 180/2.0", "Pane C 180/2.5", "Pane C 180/3.0", "Pane C 200/2.0", "Pane C 200/2.5", "Pane C 200/3.0",
];
export const NONE = "_";

// Order = order of the sheet rows. Every position can be left on "none".
export const POSITIONS = [
  { id: "posts", default: NONE, options: IPE },
  { id: "rafters", default: NONE, options: IPE },
  { id: "gablePosts", default: NONE, options: IPE.slice(2, 11) }, // IPE 120 .. IPE 300
  {
    id: "purlins",
    default: NONE,
    options: ["IPE 80", "IPE 80 A", "IPE 80 AA", "IPE 80 AAA", "IPE 80 AAAA", "IPE 100", "IPE 100 A", "IPE 100 AA",
      "IPE 100 AAA", "IPE 100 AAAA", "IPE 120", "IPE 140", "IPE 160", "IPE 180", ...PANE_C],
  },
  {
    id: "struts",
    default: NONE,
    options: ["HEA 100", "HEA 120", "HEA 140", "HEA 160", "Tube 100/100/3", "Pane C 120/2.5", "IPE 300"],
  },
  { id: "bracing", default: NONE, options: ["CE 40", "CE 45", "CE 50", "CE 60", "CE 70", "CE 80"] },
  { id: "anchorRods", default: NONE, options: ["Rond 16", "Rond 18", "Rond 20", "Rond 25", "Rond 30", "Rond 35"] },
  {
    id: "parapetBayonets",
    default: NONE,
    options: ["IPE 100", "IPE 120", "IPE 140", "IPE 160", "IPE 180", "IPE 200", "HEA 100", "HEA 120", "HEA 140", "HEA 160"],
  },
  { id: "rails", default: NONE, options: ["UPN 80", "UPN 100", "UPN 120", "UPN 140", "UPN 160", ...PANE_C] },
  { id: "basePlates", default: NONE, options: ["tole 8", "tole 10", "tole 12", "tole 15", "tole 20", "tole 25", "tole 30"] },
  { id: "cleats", default: NONE, options: ["tole 5", "tole 6", "tole 8"] },
  { id: "underPlates", default: NONE, options: ["tole 3", "tole 4", "tole 5", "tole 6"] },
  { id: "parapetPlates", default: NONE, options: ["tole 8", "tole 10", "tole 12", "tole 15"] },
  { id: "parapetGussets", default: NONE, options: ["tole 6", "tole 8"] },
].map((p) => ({ ...p, options: [NONE, ...p.options] }));

// What the quote form needs to render the dropdowns (served by the `quote` Edge Function, action "forms").
export const form = {
  profiles: POSITIONS.map(({ id, default: def, options }) => ({ id, default: def, options })),
};

const RAFTER_HAUNCH_M = 3.5; // "Jarret": extra rafter length per frame, J3
const PURLIN_SPACING_M = 1.75; // purlin lines every 1.75 m along the rafter, row 5
const STRUTS_PER_BAY = 4; // J6
// IPE 270 -> 0.27 m. The sheet's plate formulas read this from the column/rafter profile (and error out on "_");
// with no column or rafter the section counts as 0, so only the terms that do not depend on it remain.
const sectionHeightM = (profile) => (profile === NONE ? 0 : Number(profile.match(/\d+/)[0]) / 1000);

// Selling price per kg of steel, excl. tax: `prices.framing_price_per_kg`, edited by admins in the dashboard
// (fallback 6.5 in ../pricing.js). It replaced the sheet's cost build-up (cost 6.929 TND/kg + 20% margin = 8.31).
const FODEC_RATE = 0.01;
const TVA_RATE = 0.19;

const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
export const sellingPricePerKg = (prices = DEFAULT_PRICES) => prices.framing_price_per_kg;

export function validate(body) {
  const input = {};
  for (const [key, { min, max }] of Object.entries(INPUT_LIMITS)) {
    const v = Number(body?.[key]);
    if (!Number.isFinite(v) || v < min || v > max) return { error: `${key} must be between ${min} and ${max}` };
    input[key] = v;
  }
  if (input.baySpacing > input.length) return { error: "baySpacing cannot exceed length" };

  // Each position accepts only its own dropdown values; a missing one counts as none.
  input.profiles = {};
  for (const { id, default: def, options } of POSITIONS) {
    const v = body?.profiles?.[id] ?? def;
    if (typeof v !== "string" || !options.includes(v)) return { error: `profiles.${id} is not an allowed profile` };
    input.profiles[id] = v;
  }
  if (Object.values(input.profiles).every((v) => v === NONE)) return { error: "Select at least one steel profile" };
  return { input };
}

// Each line is a linear length (m) or an area (m²) times the profile weight, as in columns K/L/D/M.
export function takeOff({ length: F, width: H, height: G, baySpacing: E, profiles: P }) {
  const I = Math.ceil(F / E) + 1; // number of portal frames; the sheet uses F/E + 1 (same when F divides by E)
  const S2 = sectionHeightM(P.posts);
  const S3 = sectionHeightM(P.rafters);

  const purlinM = (H / PURLIN_SPACING_M + 2) * F;
  const bracingM = Math.max(E, G) * 2 * 6;
  const bayonetM = I * 2 + 10;

  // [position id, unit, quantity]; the profile comes from the customer's choice for that position.
  const quantities = {
    posts: ["m", I * G * 2],
    rafters: ["m", I * H + RAFTER_HAUNCH_M],
    gablePosts: ["m", 4 * G],
    purlins: ["m", purlinM],
    struts: ["m", E * STRUTS_PER_BAY],
    bracing: ["m", bracingM],
    anchorRods: ["m", 6 * I * 2],
    parapetBayonets: ["m", bayonetM],
    rails: ["m", (F + H + 1) * 6],
    basePlates: ["m2", 4.2 * S2 * S2 * I + 0.92 * S2 * I + 4 * S3 * S3 * I + 0.08 * I],
    cleats: ["m2", (S3 / 2 + 0.08) * 0.2 * (purlinM / E) + (0.25 * bracingM) / Math.max(E, G) / 2],
    underPlates: ["m2", (S2 + 0.2) * (S2 / 2 + 0.2) * I * 2],
    parapetPlates: ["m2", (bayonetM / 1.5) * 0.2 * 0.2],
    parapetGussets: ["m2", ((I * 2) / 1.5 + 4) * 0.17],
  };

  const lines = POSITIONS.filter(({ id }) => P[id] !== NONE).map(({ id }) => {
    const [unit, quantity] = quantities[id];
    return { id, profile: P[id], unit, quantity, rawKg: quantity * profileWeight(P[id]) };
  });

  return {
    frames: I,
    lines: lines.map(({ rawKg, quantity, ...l }) => ({ ...l, quantity: round(quantity, 2), kg: round(rawKg, 1) })),
    // Exact (unrounded) weight, so totals match the sheet to the gram.
    steelKg: lines.reduce((acc, l) => acc + l.rawKg, 0),
  };
}

export function calculate(input, prices = DEFAULT_PRICES) {
  const { frames, lines, steelKg } = takeOff(input);
  const billableKg = Math.round(steelKg); // the offer bills whole kilos
  const pricePerKg = sellingPricePerKg(prices);
  const subtotal = round(billableKg * pricePerKg);
  const fodec = round(subtotal * FODEC_RATE);
  const tax = round((subtotal + fodec) * TVA_RATE); // the offer applies VAT on HT + FODEC
  return {
    currency: "TND",
    frames,
    steelKg: billableKg,
    pricePerKg,
    lines,
    subtotal,
    fodec,
    tax,
    total: round(subtotal + fodec + tax),
  };
}
