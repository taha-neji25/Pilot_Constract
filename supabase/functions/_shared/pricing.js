// Prices used by the quote calculators. The live values live in the database table `pricing` and are edited by
// admins in the dashboard; the numbers below are only the fallback used when the table cannot be read.

export const DEFAULT_PRICES = {
  framing_price_per_kg: 6.5, // TND per kg of steel, excl. tax (industrial framing)
  calculation_rate_small: 15, // TND per m2 (etude), surface up to and including the threshold
  calculation_rate_large: 10, // TND per m2 (etude), applied to the whole surface when above the threshold
  calculation_threshold_m2: 100, // m2
};

// Reads the prices with the service-role client. Missing, invalid or unreadable values fall back to the defaults,
// so a database hiccup never blocks a quote.
export async function loadPrices(admin) {
  const prices = { ...DEFAULT_PRICES };
  const { data, error } = await admin.from("pricing").select("key, value");
  if (error || !Array.isArray(data)) return prices;
  for (const row of data) {
    const value = Number(row.value);
    if (row.key in DEFAULT_PRICES && Number.isFinite(value) && value > 0) prices[row.key] = value;
  }
  return prices;
}
