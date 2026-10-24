// What search engines read for each page and language: title, description and structured data (JSON-LD).
// Used by the build script (written into the static pages) and by the site (kept up to date while browsing).
// Titles stay under ~65 characters and descriptions under ~160, so Google shows them whole.

import contact from "../data/contact.js";
import translations from "../i18n/translations.js";
import serviceDetails, { serviceUi } from "../i18n/serviceDetails.js";
import guides, { guideUi, guidesIndexMeta } from "../i18n/guides.js";
import { SITE_URL, canonicalUrl } from "./routes.js";

const BRAND = "Pilot Constract";

const META = {
  fr: {
    home: {
      title: "Charpente métallique à Sfax, Tunisie | Pilot Constract",
      description:
        "Pilot Constract (Société Pilotage et Construction) : conception, fabrication et pose de charpentes et structures métalliques à Sfax et partout en Tunisie. Devis gratuit.",
    },
    services: {
      title: "Services de construction métallique en Tunisie | Pilot Constract",
      description:
        "Étude et calcul, fabrication en atelier, montage, charpente industrielle, passerelles et escaliers, maintenance, ferronnerie et containers sur mesure. Basés à Sfax.",
    },
    reviews: {
      title: "Avis clients | Pilot Constract, constructeur métallique à Sfax",
      description:
        "Ce que disent nos clients industriels de Pilot Constract : sérieux, respect des délais, qualité de fabrication et de pose des structures métalliques.",
    },
    faq: {
      title: "Questions fréquentes sur les structures métalliques | Pilot Constract",
      description:
        "Types d'ouvrages, délais, zone d'intervention, suivi après livraison, obtention d'un devis : les réponses de Pilot Constract, constructeur métallique à Sfax.",
    },
    gallery: {
      title: "Réalisations : charpentes et structures métalliques | Pilot Constract",
      description:
        "Photos de chantiers et de fabrication en atelier : charpentes industrielles, passerelles, escaliers, ferronnerie et containers réalisés par Pilot Constract à Sfax.",
    },
    quote: { title: "Devis gratuit | Pilot Constract", description: "Estimez votre projet de structure métallique en ligne." },
    login: { title: "Connexion | Pilot Constract", description: "Connectez-vous à votre compte Pilot Constract." },
    signup: { title: "Créer un compte | Pilot Constract", description: "Créez votre compte Pilot Constract pour demander un devis." },
    admin: { title: "Administration | Pilot Constract", description: "Espace réservé à l'administration." },
  },
  en: {
    home: {
      title: "Steel Structures & Metal Buildings in Sfax, Tunisia | Pilot Constract",
      description:
        "Pilot Constract (Société Pilotage et Construction) designs, fabricates and installs steel structures in Sfax and across Tunisia: industrial frames, warehouses. Free quote.",
    },
    services: {
      title: "Steel Construction Services in Tunisia | Pilot Constract",
      description:
        "Engineering and calculation, workshop fabrication, installation, industrial steel framing, walkways and stairs, maintenance, metalwork and custom containers. Based in Sfax.",
    },
    reviews: {
      title: "Client Reviews | Pilot Constract, Steel Contractor in Sfax",
      description:
        "What industrial clients say about Pilot Constract: reliable teams, deadlines kept, and quality fabrication and installation of steel structures.",
    },
    faq: {
      title: "Steel Construction FAQ | Pilot Constract",
      description:
        "Types of structures, lead times, where we work, after-sales support and how to get a quote: answers from Pilot Constract, steel contractor in Sfax, Tunisia.",
    },
    gallery: {
      title: "Projects: Steel Frames & Structures | Pilot Constract",
      description:
        "Photos from site and from our workshop: industrial steel frames, walkways, stairs, metalwork and containers built by Pilot Constract in Sfax, Tunisia.",
    },
    quote: { title: "Free Quote | Pilot Constract", description: "Estimate your steel structure project online." },
    login: { title: "Log in | Pilot Constract", description: "Log in to your Pilot Constract account." },
    signup: { title: "Create an account | Pilot Constract", description: "Create your Pilot Constract account to request a quote." },
    admin: { title: "Administration | Pilot Constract", description: "Administration area." },
  },
  ar: {
    home: {
      title: "Pilot Constract | هياكل معدنية وحدادة في صفاقس، تونس",
      description:
        "Pilot Constract (Société Pilotage et Construction): تصميم وتصنيع وتركيب الهياكل المعدنية في صفاقس وكامل تونس، هياكل صناعية ومستودعات وسلالم. عرض سعر مجاني.",
    },
    services: {
      title: "خدمات البناء المعدني في تونس | Pilot Constract",
      description:
        "دراسة وحساب، تصنيع في الورشة، تركيب، هياكل صناعية معدنية، ممرات وسلالم، صيانة وتدعيم، حدادة وحاويات حسب الطلب. مقرّنا في صفاقس.",
    },
    reviews: {
      title: "آراء الحرفاء | Pilot Constract، مقاول هياكل معدنية في صفاقس",
      description:
        "ماذا يقول حرفاؤنا من القطاع الصناعي عن Pilot Constract: جدّية والتزام بالآجال وجودة في تصنيع وتركيب الهياكل المعدنية.",
    },
    faq: {
      title: "أسئلة شائعة حول الهياكل المعدنية | Pilot Constract",
      description:
        "أنواع المنشآت والآجال ومناطق التدخل والمتابعة بعد التسليم وكيفية الحصول على عرض سعر: إجابات Pilot Constract من صفاقس، تونس.",
    },
    gallery: {
      title: "إنجازاتنا: هياكل ومنشآت معدنية | Pilot Constract",
      description:
        "صور من الورشة ومن المواقع: هياكل صناعية معدنية، ممرات، سلالم، حدادة وحاويات أنجزتها Pilot Constract في صفاقس، تونس.",
    },
    quote: { title: "عرض سعر مجاني | Pilot Constract", description: "قدّر تكلفة مشروعك للهياكل المعدنية عبر الإنترنت." },
    login: { title: "تسجيل الدخول | Pilot Constract", description: "سجّل الدخول إلى حسابك في Pilot Constract." },
    signup: { title: "إنشاء حساب | Pilot Constract", description: "أنشئ حسابك في Pilot Constract لطلب عرض سعر." },
    admin: { title: "الإدارة | Pilot Constract", description: "فضاء مخصص للإدارة." },
  },
};

export const notFoundMeta = (lang) => ({
  title: { fr: "Page introuvable | Pilot Constract", en: "Page not found | Pilot Constract", ar: "الصفحة غير موجودة | Pilot Constract" }[lang],
  description: META[lang].home.description,
});

const serviceIdOf = (page) => (page?.startsWith("service:") ? page.slice(8) : null);

const guideIdOf = (page) => (page?.startsWith("guide:") ? page.slice(6) : null);

export function pageMeta(page, lang) {
  if (page === "guides") return guidesIndexMeta[lang];
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
const LEGAL_NAME = "Société Pilotage et Construction";
const ALTERNATE_NAMES = ["PilotConstract", LEGAL_NAME, "Pilotage et Construction"];

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
    email: contact.emails[0]?.address,
    address: { "@type": "PostalAddress", addressLocality: "Sfax", addressCountry: "TN" },
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
