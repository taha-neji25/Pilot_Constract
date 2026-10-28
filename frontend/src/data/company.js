// The company's names and address, in ONE place. Titles, headlines, descriptions, the footer, the contact page and the
// structured data all read from here: change a value below and the whole site (and the next build) follows.
// Plain JS (no JSX) because the build script imports it too.

export const BRAND = "Pilot Constract"; // trade name, as in the logo
export const FR_NAME = "Pilotage et Construction"; // the company's name in French
export const LEGAL_NAME = `Société ${FR_NAME}`;
export const AR_NAME = "القيادة و الإنشاء"; // the company's name in Arabic

// The two places. `line` is the address as written on the site, in each language.
export const PLACES = {
  // Administration: the company's main address
  office: {
    street: "Hedi Cheker St, km 9",
    area: "Sakiet Ezzit",
    city: "Sfax",
    country: "TN",
    line: {
      fr: "Sakiet Ezzit, Hedi Cheker St, km 9, Sfax, Tunisie",
      en: "Sakiet Ezzit, Hedi Cheker St, km 9, Sfax, Tunisia",
      ar: "ساقية الزيت، شارع الهادي شاكر، الكلم 9، صفاقس، تونس",
    },
  },
  // Factory (fabrication workshop)
  factory: {
    street: "km 10, Route Saltnia",
    area: "",
    city: "Sfax",
    postalCode: "3000",
    country: "TN",
    line: {
      fr: "Km 10, route Saltnia, Sfax 3000, Tunisie",
      en: "Km 10, Route Saltnia, Sfax 3000, Tunisia",
      ar: "الكلم 10، طريق السلطنية، صفاقس 3000، تونس",
    },
  },
};
export const ADDRESS = PLACES.office; // main address (administration)

// Opening hours (24-hour times). `line` is how they are written on the site, in each language.
export const HOURS = {
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  opens: "08:00",
  closes: "17:00",
  line: {
    fr: "Du lundi au samedi, de 8 h à 17 h",
    en: "Monday to Saturday, 8:00 am to 5:00 pm",
    ar: "من الاثنين إلى السبت، من 8:00 إلى 17:00",
  },
};

// Legal identity, printed on the Legal notice page. Anything left "" is simply not shown: fill these in when you have them
// (they are normally on your registration papers and invoices).
export const LEGAL = {
  form: "", // legal form, e.g. SARL
  capital: "", // share capital, e.g. 10 000 DT
  registryNumber: "", // trade register / RNE number
  taxId: "", // matricule fiscal
  director: "", // name of the person responsible for the publication of the site
};

// Date shown on the legal pages ("last updated") and version of the texts accepted at signup (see CONSENT_VERSION in
// supabase/functions/_shared/signup.js: keep both the same when the Terms or the Privacy Policy change).
export const LEGAL_UPDATED = "2026-10-28";

// Opens a place in Google Maps.
export const mapsUrl = (place) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([BRAND, place.area, place.street, place.city].filter(Boolean).join(", "))}`;
export const MAPS_URL = mapsUrl(PLACES.office);
