// Which inputs each service's quote form asks for. A service listed here can be quoted online; every other
// service is "pending" (no calculation yet) and shows a notice instead of a form.
// `key` is the field name sent to POST /api/quotes and the label key under translations `quote.fields`.
// Ranges mirror backend/calculators/<service>.js (the server is the source of truth and re-validates).

export const quoteForms = {
  framing: [
    { key: "length", unit: "m", min: 6, max: 150, step: "any" },
    { key: "width", unit: "m", min: 6, max: 40, step: "any" },
    { key: "height", unit: "m", min: 3, max: 15, step: "any" },
    { key: "baySpacing", unit: "m", min: 3, max: 10, step: "any" },
  ],
};

export const isAvailable = (serviceId) => serviceId in quoteForms;

export const formFor = (serviceId) => quoteForms[serviceId] ?? [];
