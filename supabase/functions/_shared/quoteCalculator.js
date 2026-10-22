// Quote calculation, one calculator per service.
//
// Only services listed in CALCULATORS can be quoted online; the others are "pending" (no calculation yet) and
// the quote function refuses them. To add one: create supabase/functions/_shared/calculators/<service>.js exporting `validate(body)` ->
// { input } | { error } and `calculate(input)` -> { currency, subtotal, tax, total, ... }, register it below,
// and add its form to frontend/src/pages/quoteForms.js (that is also what marks the service as available in the UI).

import * as calculation from "./calculators/calculation.js";
import * as framing from "./calculators/framing.js";

export const SERVICE_IDS = [
  "calculation",
  "fabrication",
  "assembly",
  "framing",
  "walkways",
  "maintenance",
  "metalwork",
  "containers",
];

const CALCULATORS = {
  calculation,
  framing,
};

// Form descriptors (e.g. the allowed profiles per position) for services whose calculator defines one.
export const getForms = () =>
  Object.fromEntries(Object.entries(CALCULATORS).filter(([, c]) => c.form).map(([id, c]) => [id, c.form]));

export function validateQuoteInput(body) {
  const service = String(body?.service ?? "");
  if (!SERVICE_IDS.includes(service)) return { error: "Unknown service" };
  const calculator = CALCULATORS[service];
  if (!calculator) return { error: "Online quote not available yet for this service" };
  const { input, error } = calculator.validate(body);
  if (error) return { error };
  return { input: { service, ...input } };
}

export function calculateQuote(input, prices) {
  return CALCULATORS[input.service].calculate(input, prices);
}
