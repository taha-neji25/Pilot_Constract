// The company's names and address, in ONE place. Titles, headlines, descriptions, the footer, the contact page and the
// structured data all read from here: change a value below and the whole site (and the next build) follows.
// Plain JS (no JSX) because the build script imports it too.

export const BRAND = "Pilot Constract"; // trade name, as in the logo
export const FR_NAME = "Pilotage et Construction"; // the company's name in French
export const LEGAL_NAME = `Société ${FR_NAME}`;
export const AR_NAME = "القيادة و الإنشاء"; // the company's name in Arabic

// Where the workshop is. `line` is the address as written on the site, in each language.
export const ADDRESS = {
  street: "Hedi Cheker St, km 9",
  area: "Sakiet Ezzit",
  city: "Sfax",
  country: "TN",
  line: {
    fr: "Sakiet Ezzit, Hedi Cheker St, km 9, Sfax, Tunisie",
    en: "Sakiet Ezzit, Hedi Cheker St, km 9, Sfax, Tunisia",
    ar: "ساقية الزيت، شارع الهادي شاكر، الكلم 9، صفاقس، تونس",
  },
};

// Opens the place in Google Maps.
export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${BRAND}, ${ADDRESS.area}, ${ADDRESS.street}, ${ADDRESS.city}`)}`;
