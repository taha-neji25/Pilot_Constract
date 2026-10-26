// What search engines read for each page and language: title, description and structured data (JSON-LD).
// Used by the build script (written into the static pages) and by the site (kept up to date while browsing).
// Titles stay under ~65 characters and descriptions under ~160, so Google shows them whole.

import contact from "../data/contact.js";
import translations from "../i18n/translations.js";
import serviceDetails, { serviceUi } from "../i18n/serviceDetails.js";
import guides, { guideUi, guidesIndexMeta } from "../i18n/guides.js";
import { contactMeta } from "../i18n/contactText.js";
import { SITE_URL, canonicalUrl } from "./routes.js";
import { ADDRESS, BRAND, FR_NAME, LEGAL_NAME } from "../data/company.js";


const META = {
  fr: {
    home: {
      title: `${FR_NAME} – ${BRAND} | Charpente métallique Sfax`,
      description:
        `${FR_NAME} (${BRAND}) à Sfax : conception, fabrication et pose de charpentes et structures métalliques partout en Tunisie. Devis gratuit.`,
    },
    services: {
      title: `Services de construction métallique | ${FR_NAME}`,
      description:
        "Étude et calcul, fabrication en atelier, montage, charpente industrielle, passerelles et escaliers, maintenance, ferronnerie et containers sur mesure. Basés à Sfax.",
    },
    reviews: {
      title: `Avis clients | ${FR_NAME} à Sfax`,
      description:
        `Ce que disent nos clients industriels de ${FR_NAME} (${BRAND}) : sérieux, respect des délais, qualité de fabrication et de pose.`,
    },
    faq: {
      title: `Questions fréquentes | ${FR_NAME} (${BRAND})`,
      description:
        `Types d'ouvrages, délais, zone d'intervention, suivi après livraison, devis : les réponses de ${FR_NAME} (${BRAND}), constructeur métallique à Sfax.`,
    },
    gallery: {
      title: `Réalisations : charpentes métalliques | ${FR_NAME}`,
      description:
        `Photos de chantiers et de fabrication en atelier : charpentes industrielles, passerelles, escaliers, ferronnerie et containers réalisés par ${FR_NAME} à Sfax.`,
    },
    quote: { title: `Devis gratuit | ${BRAND}`, description: "Estimez votre projet de structure métallique en ligne." },
    login: { title: `Connexion | ${BRAND}`, description: `Connectez-vous à votre compte ${BRAND}.` },
    signup: { title: `Créer un compte | ${BRAND}`, description: `Créez votre compte ${BRAND} pour demander un devis.` },
    admin: { title: `Administration | ${BRAND}`, description: "Espace réservé à l'administration." },
  },
  en: {
    home: {
      title: `Steel Structures & Metal Buildings in Sfax, Tunisia | ${BRAND}`,
      description:
        `${BRAND} (${LEGAL_NAME}) designs, fabricates and installs steel structures in Sfax and across Tunisia: industrial frames, warehouses. Free quote.`,
    },
    services: {
      title: `Steel Construction Services in Tunisia | ${BRAND}`,
      description:
        "Engineering and calculation, workshop fabrication, installation, industrial steel framing, walkways and stairs, maintenance, metalwork and custom containers. Based in Sfax.",
    },
    reviews: {
      title: `Client Reviews | ${BRAND}, Steel Contractor in Sfax`,
      description:
        `What industrial clients say about ${BRAND}: reliable teams, deadlines kept, and quality fabrication and installation of steel structures.`,
    },
    faq: {
      title: `Steel Construction FAQ | ${BRAND}`,
      description:
        `Types of structures, lead times, where we work, after-sales support and how to get a quote: answers from ${BRAND}, steel contractor in Sfax, Tunisia.`,
    },
    gallery: {
      title: `Projects: Steel Frames & Structures | ${BRAND}`,
      description:
        `Photos from site and from our workshop: industrial steel frames, walkways, stairs, metalwork and containers built by ${BRAND} in Sfax, Tunisia.`,
    },
    quote: { title: `Free Quote | ${BRAND}`, description: "Estimate your steel structure project online." },
    login: { title: `Log in | ${BRAND}`, description: `Log in to your ${BRAND} account.` },
    signup: { title: `Create an account | ${BRAND}`, description: `Create your ${BRAND} account to request a quote.` },
    admin: { title: `Administration | ${BRAND}`, description: "Administration area." },
  },
  ar: {
    home: {
      title: `${BRAND} | هياكل معدنية وحدادة في صفاقس، تونس`,
      description:
        `${BRAND} (${LEGAL_NAME}): تصميم وتصنيع وتركيب الهياكل المعدنية في صفاقس وكامل تونس، هياكل صناعية ومستودعات وسلالم. عرض سعر مجاني.`,
    },
    services: {
      title: `خدمات البناء المعدني في تونس | ${BRAND}`,
      description:
        "دراسة وحساب، تصنيع في الورشة، تركيب، هياكل صناعية معدنية، ممرات وسلالم، صيانة وتدعيم، حدادة وحاويات حسب الطلب. مقرّنا في صفاقس.",
    },
    reviews: {
      title: `آراء الحرفاء | ${BRAND}، مقاول هياكل معدنية في صفاقس`,
      description:
        `ماذا يقول حرفاؤنا من القطاع الصناعي عن ${BRAND}: جدّية والتزام بالآجال وجودة في تصنيع وتركيب الهياكل المعدنية.`,
    },
    faq: {
      title: `أسئلة شائعة حول الهياكل المعدنية | ${BRAND}`,
      description:
        `أنواع المنشآت والآجال ومناطق التدخل والمتابعة بعد التسليم وكيفية الحصول على عرض سعر: إجابات ${BRAND} من صفاقس، تونس.`,
    },
    gallery: {
      title: `إنجازاتنا: هياكل ومنشآت معدنية | ${BRAND}`,
      description:
        `صور من الورشة ومن المواقع: هياكل صناعية معدنية، ممرات، سلالم، حدادة وحاويات أنجزتها ${BRAND} في صفاقس، تونس.`,
    },
    quote: { title: `عرض سعر مجاني | ${BRAND}`, description: "قدّر تكلفة مشروعك للهياكل المعدنية عبر الإنترنت." },
    login: { title: `تسجيل الدخول | ${BRAND}`, description: `سجّل الدخول إلى حسابك في ${BRAND}.` },
    signup: { title: `إنشاء حساب | ${BRAND}`, description: `أنشئ حسابك في ${BRAND} لطلب عرض سعر.` },
    admin: { title: `الإدارة | ${BRAND}`, description: "فضاء مخصص للإدارة." },
  },
};

export const notFoundMeta = (lang) => ({
  title: { fr: `Page introuvable | ${BRAND}`, en: `Page not found | ${BRAND}`, ar: `الصفحة غير موجودة | ${BRAND}` }[lang],
  description: META[lang].home.description,
});

const serviceIdOf = (page) => (page?.startsWith("service:") ? page.slice(8) : null);

const guideIdOf = (page) => (page?.startsWith("guide:") ? page.slice(6) : null);

export function pageMeta(page, lang) {
  if (page === "guides") return guidesIndexMeta[lang];
  if (page === "contact") return contactMeta[lang];
  const gid = guideIdOf(page);
  if (gid) return { title: guides[lang][gid].metaTitle, description: guides[lang][gid].metaDesc };
  const id = serviceIdOf(page);
  if (id) {
    const d = serviceDetails[lang][id];
    return { title: d.metaTitle, description: d.metaDesc };
  }
  return META[lang]?.[page] ?? META.fr.home;
}

const ORG_ID = `${SITE_URL}/#organization`;

// "Constract" is the company's own spelling (not the English word "contract"): tell search engines the exact name
// and its other written forms, so the brand is recognised as a name rather than corrected as a typo.
const ALTERNATE_NAMES = [BRAND.replace(" ", ""), LEGAL_NAME, FR_NAME];

const organization = (lang) => {
  const t = translations[lang];
  return {
    "@type": "GeneralContractor",
    "@id": ORG_ID,
    name: BRAND,
    legalName: LEGAL_NAME,
    alternateName: ALTERNATE_NAMES,
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    image: `${SITE_URL}/og-image.png`,
    description: META[lang].home.description,
    telephone: contact.phones[0],
    contactPoint: contact.phones.map((telephone) => ({ "@type": "ContactPoint", telephone, contactType: "customer service", areaServed: "TN" })),
    email: contact.emails[0]?.address,
    address: { "@type": "PostalAddress", streetAddress: `${ADDRESS.street}, ${ADDRESS.area}`, addressLocality: ADDRESS.city, addressCountry: ADDRESS.country },
    areaServed: { "@type": "Country", name: "Tunisia" },
    sameAs: [contact.social.facebook, contact.social.instagram, contact.social.linkedin].filter(Boolean),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: t.services.title,
      itemListElement: t.services.items.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.title, description: s.desc, provider: { "@id": ORG_ID } },
      })),
    },
  };
};

// JSON-LD graph for a page: the company on every page, plus the questions on the FAQ page.
export function jsonLdFor(page, lang) {
  const graph = [
    organization(lang),
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: BRAND, alternateName: ALTERNATE_NAMES, inLanguage: lang, publisher: { "@id": ORG_ID } },
  ];
  if (page === "faq") {
    graph.push({
      "@type": "FAQPage",
      inLanguage: lang,
      mainEntity: translations[lang].faqs.items.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  const id = serviceIdOf(page);
  if (id) {
    const d = serviceDetails[lang][id];
    const ui = serviceUi[lang];
    graph.push(
      {
        "@type": "Service",
        name: d.h1,
        description: d.metaDesc,
        url: canonicalUrl(page, lang),
        inLanguage: lang,
        provider: { "@id": ORG_ID },
        areaServed: { "@type": "Country", name: "Tunisia" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: ui.home, item: canonicalUrl("home", lang) },
          { "@type": "ListItem", position: 2, name: ui.services, item: canonicalUrl("services", lang) },
          { "@type": "ListItem", position: 3, name: d.h1, item: canonicalUrl(page, lang) },
        ],
      },
    );
  }
  if (page === "contact") {
    graph.push({ "@type": "ContactPage", url: canonicalUrl(page, lang), name: contactMeta[lang].title, inLanguage: lang, about: { "@id": ORG_ID } });
  }
  const gid = guideIdOf(page);
  if (gid) {
    const g = guides[lang][gid];
    const ui = guideUi[lang];
    graph.push(
      {
        "@type": "Article",
        headline: g.h1,
        description: g.metaDesc,
        inLanguage: lang,
        image: `${SITE_URL}/og-image.png`,
        datePublished: "2026-10-24",
        author: { "@id": ORG_ID },
        publisher: { "@id": ORG_ID },
        mainEntityOfPage: canonicalUrl(page, lang),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: ui.home, item: canonicalUrl("home", lang) },
          { "@type": "ListItem", position: 2, name: ui.guides, item: canonicalUrl("guides", lang) },
          { "@type": "ListItem", position: 3, name: g.h1, item: canonicalUrl(page, lang) },
        ],
      },
    );
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
