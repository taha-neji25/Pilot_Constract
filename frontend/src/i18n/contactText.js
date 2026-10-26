// Text of the /contact page (numbers, e-mail and links come from data/contact.js).

import { BRAND, FR_NAME, HOURS } from "../data/company.js";
import contact from "../data/contact.js";

export const contactMeta = {
  fr: {
    title: `Contact | ${FR_NAME} (${BRAND}), Sfax`,
    description: `Contactez ${FR_NAME} (${BRAND}) à Sfax : téléphone ${contact.phones[0]}, WhatsApp, e-mail. Devis gratuit pour votre charpente métallique.`,
  },
  en: {
    title: `Contact Us | ${FR_NAME} (${BRAND}), Sfax`,
    description: `Contact ${FR_NAME} (${BRAND}) in Sfax, Tunisia: phone ${contact.phones[0]}, WhatsApp, e-mail. Free quote for your steel structure.`,
  },
  ar: {
    title: `اتصل بنا | ${FR_NAME} (${BRAND})، صفاقس`,
    description: `اتصل بـ ${FR_NAME} (${BRAND}) في صفاقس، تونس: الهاتف ${contact.phones[0]} وواتساب والبريد الإلكتروني. عرض سعر مجاني لهيكلك المعدني.`,
  },
};

const contactText = {
  fr: {
    nav: "Contact",
    eyebrow: "Contact",
    title: "Contactez-nous",
    lead: `${FR_NAME} (${BRAND}) est à votre écoute pour votre projet de charpente métallique ou de construction métallique, à Sfax et partout en Tunisie. Nous revenons vers vous sous 48 h avec une première estimation.`,
    phone: "Téléphone",
    whatsapp: "WhatsApp",
    whatsappCta: "Écrire sur WhatsApp",
    email: "E-mail",
    office: "Administration",
    factory: "Usine (atelier de fabrication)",
    area: "Zone d'intervention",
    mapsCta: "Voir sur Google Maps",
    hours: "Horaires d'ouverture",
    hoursValue: HOURS.line.fr,
    areaValue: "Toute la Tunisie",
    social: "Réseaux sociaux",
    quote: "Demander un devis gratuit",
    quoteText: "Pour une estimation en ligne, créez un compte gratuit et utilisez le calculateur de devis, ou envoyez-nous vos plans par e-mail.",
  },
  en: {
    nav: "Contact",
    eyebrow: "Contact",
    title: "Get in touch",
    lead: `${FR_NAME} (${BRAND}) is here for your steel frame or metal construction project in Sfax and across Tunisia. We get back to you within 48 h with an initial estimate.`,
    phone: "Phone",
    whatsapp: "WhatsApp",
    whatsappCta: "Message us on WhatsApp",
    email: "E-mail",
    office: "Head office (administration)",
    factory: "Factory (fabrication workshop)",
    area: "Where we work",
    mapsCta: "View on Google Maps",
    hours: "Opening hours",
    hoursValue: HOURS.line.en,
    areaValue: "All across Tunisia",
    social: "Social networks",
    quote: "Request a free quote",
    quoteText: "For an online estimate, create a free account and use the quote calculator, or email us your drawings.",
  },
  ar: {
    nav: "اتصل بنا",
    eyebrow: "اتصل بنا",
    title: "تواصل معنا",
    lead: `${FR_NAME} (${BRAND}) في خدمتك لمشروعك للهياكل المعدنية أو البناء المعدني في صفاقس وكامل تونس. نعود إليك في أجل 48 ساعة مع تقدير أولي.`,
    phone: "الهاتف",
    whatsapp: "واتساب",
    whatsappCta: "راسلنا عبر واتساب",
    email: "البريد الإلكتروني",
    office: "الإدارة",
    factory: "المصنع (ورشة التصنيع)",
    area: "مناطق التدخل",
    mapsCta: "عرض على خرائط Google",
    hours: "ساعات العمل",
    hoursValue: HOURS.line.ar,
    areaValue: "كامل تونس",
    social: "شبكات التواصل",
    quote: "اطلب عرض سعر مجاني",
    quoteText: "للحصول على تقدير عبر الإنترنت، أنشئ حسابًا مجانيًا واستعمل حاسبة عرض السعر، أو أرسل لنا مخططاتك عبر البريد الإلكتروني.",
  },
};

export default contactText;
