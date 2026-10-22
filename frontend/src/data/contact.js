// Company contact details shown in the footer.
// Anything left empty ("" or []) is simply not rendered, so fill these in when you have them.
const contact = {
  // Phone numbers, e.g. "+216 74 123 456". Add one entry per line to show.
  phones: ["+216 28 831 103", "+216 25 778 739", "+216 21 262 771"],
  // Fax / landline shown with the printer icon (optional)
  fax: "",
  // `label` is a key under t.footer.emailLabels in src/i18n/translations.js
  emails: [{ label: "general", address: "pilotconstract@gmail.com" }],
  // Full URLs. WhatsApp: "https://wa.me/<number without + or spaces>"
  social: {
    facebook: "https://www.facebook.com/Pilot.Constract",
    instagram: "https://www.instagram.com/pilotconstract/",
    linkedin: "",
    whatsapp: "https://wa.me/21628831103",
  },
};

export default contact;
