// The five legal pages (privacy, terms, cookies, refunds, legal notice): texts per language, footer labels, search titles.
// The texts are in legalFr.js / legalEn.js / legalAr.js; names, addresses and legal identity come from data/company.js.
import fr from "./legalFr.js";
import en from "./legalEn.js";
import ar from "./legalAr.js";
import { BRAND, FR_NAME } from "../data/company.js";

export const LEGAL_DOCS = ["privacy", "terms", "cookies", "refunds", "legal"];

const docs = { fr, en, ar };
export default docs;

export const legalUi = {
  fr: {
    updated: "Dernière mise à jour",
    seeAlso: "Voir aussi",
    nav: "Informations légales",
    labels: { privacy: "Confidentialité", terms: "Conditions générales", cookies: "Cookies", refunds: "Remboursement", legal: "Mentions légales" },
  },
  en: {
    updated: "Last updated",
    seeAlso: "See also",
    nav: "Legal information",
    labels: { privacy: "Privacy", terms: "Terms", cookies: "Cookies", refunds: "Refunds", legal: "Legal notice" },
  },
  ar: {
    updated: "آخر تحديث",
    seeAlso: "انظر أيضًا",
    nav: "معلومات قانونية",
    labels: { privacy: "الخصوصية", terms: "الشروط العامة", cookies: "ملفات تعريف الارتباط", refunds: "الاسترجاع", legal: "الإشعار القانوني" },
  },
};

export const legalMeta = {
  fr: {
    privacy: { title: `Politique de confidentialité | ${FR_NAME}`, description: `Quelles données ${FR_NAME} (${BRAND}) collecte, pourquoi, combien de temps, et vos droits d'accès, de correction et de suppression.` },
    terms: { title: `Conditions générales | ${FR_NAME}`, description: `Conditions d'utilisation du site de ${FR_NAME} (${BRAND}) : compte, estimations indicatives, propriété intellectuelle, responsabilité, droit applicable.` },
    cookies: { title: `Politique de cookies | ${FR_NAME}`, description: `${FR_NAME} (${BRAND}) ne dépose aucun cookie et n'utilise aucun traceur. Ce que le site enregistre dans votre navigateur et pourquoi.` },
    refunds: { title: `Politique de remboursement | ${FR_NAME}`, description: `Site gratuit, sans paiement en ligne. Comment paiements et remboursements des travaux sont réglés avec ${FR_NAME} (${BRAND}) : devis ou contrat écrit.` },
    legal: { title: `Mentions légales | ${FR_NAME}`, description: `Mentions légales de ${FR_NAME} (${BRAND}) : éditeur, adresses de l'administration et de l'usine, contact, hébergement, propriété intellectuelle.` },
  },
  en: {
    privacy: { title: `Privacy Policy | ${BRAND}`, description: `What personal data ${BRAND} (${FR_NAME}) collects, why, for how long, and your rights to access, correct and delete it.` },
    terms: { title: `Terms and Conditions | ${BRAND}`, description: `Terms of use of the ${BRAND} (${FR_NAME}) website: account, indicative estimates, intellectual property, liability, governing law.` },
    cookies: { title: `Cookie Policy | ${BRAND}`, description: `${BRAND} (${FR_NAME}) sets no cookies and uses no trackers. What the site stores in your browser and why no consent banner is needed.` },
    refunds: { title: `Refund Policy | ${BRAND}`, description: `A free site with no online payment. How payments and refunds for works are handled with ${BRAND} (${FR_NAME}): a written quote or contract.` },
    legal: { title: `Legal Notice | ${BRAND}`, description: `Legal notice of ${BRAND} (${FR_NAME}): publisher, administration and factory addresses, contact, hosting, intellectual property.` },
  },
  ar: {
    privacy: { title: `سياسة الخصوصية | ${BRAND}`, description: `ما هي المعطيات التي تجمعها ${BRAND} (${FR_NAME}) ولماذا ولمدة كم، وحقوقك في الاطلاع والتصحيح والحذف.` },
    terms: { title: `الشروط العامة | ${BRAND}`, description: `شروط استعمال موقع ${BRAND} (${FR_NAME}): الحساب والتقديرات الإرشادية والملكية الفكرية والمسؤولية والقانون الواجب التطبيق.` },
    cookies: { title: `سياسة ملفات تعريف الارتباط | ${BRAND}`, description: `لا تضع ${BRAND} (${FR_NAME}) أي ملف تعريف ارتباط ولا تستعمل أدوات تتبع. ما يحفظه الموقع في متصفحك ولماذا لا حاجة إلى شريط موافقة.` },
    refunds: { title: `سياسة الاسترجاع | ${BRAND}`, description: `موقع مجاني دون دفع عبر الإنترنت. كيف تُعالج مدفوعات الأشغال واستردادها مع ${BRAND} (${FR_NAME}): عرض سعر أو عقد مكتوب.` },
    legal: { title: `الإشعار القانوني | ${BRAND}`, description: `الإشعار القانوني لـ ${BRAND} (${FR_NAME}): الناشر وعنوانا الإدارة والمصنع والاتصال والاستضافة والملكية الفكرية.` },
  },
};
