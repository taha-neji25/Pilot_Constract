// Legal pages, English (translation of the French reference version, which prevails if they differ).
import { BRAND, HOURS, LEGAL, LEGAL_NAME, PLACES } from "../data/company.js";
import contact from "../data/contact.js";

const email = contact.emails[0].address;
const phone = contact.phones[0];
const office = PLACES.office.line.en;
const factory = PLACES.factory.line.en;
const who = `${LEGAL_NAME} (${BRAND}), ${office}`;

const en = {
  privacy: {
    h1: "Privacy Policy",
    intro: `This policy explains which personal data ${LEGAL_NAME} (${BRAND}) collects on pilotconstract.com, why, how long it is kept and what your rights are.`,
    sections: [
      { h: "1. Who is responsible for your data?", p: [`${who}.`, `Contact: ${email}, ${phone}.`] },
      {
        h: "2. What data do we collect?",
        list: [
          "When you browse: we collect no personal data. The site uses no audience analytics, no advertising and no tracking cookies. The company hosting the site does receive your device's IP address to send you the pages (see section 6).",
          "When you create an account: first name, last name, e-mail address, phone number and its country, account type (individual or company) and password. The password is stored in an irreversible encrypted form: we cannot read it.",
          "When you tick the acceptance box: the date and version of the texts you accepted.",
          "When you use the quote calculator: the service chosen, the dimensions and sections entered, the result and the date, linked to your account.",
          "For your security: your IP address is recorded for 24 hours at most, to limit abusive sign-up or code attempts.",
          "When you write or call us: the information you give us (e-mail, WhatsApp, phone, messages).",
        ],
        p: ["We do not ask for: postal address, date of birth, gender, ID documents, bank details or location."],
      },
      {
        h: "3. Why do we use this data?",
        list: [
          "To create and secure your account, including verifying your e-mail address with a code (based on your consent and your request).",
          "To give you access to the quote calculator and keep the history of your estimates.",
          "To answer you and prepare an offer for your project.",
          "To protect the site against abuse.",
          "To meet our legal obligations.",
        ],
        p: ["We send no newsletters and no advertising. Your e-mail address is used only to send the verification code and to answer your requests."],
      },
      {
        h: "4. How long do we keep your data?",
        list: [
          "Account data and estimate history: as long as your account exists. You can ask for it to be deleted at any time.",
          "An account whose e-mail address was never verified: deleted automatically after 2 days.",
          "Security IP address: 24 hours at most.",
          "Exchanges and documents linked to a signed project: kept for the periods the law requires for commercial and accounting documents.",
        ],
      },
      {
        h: "5. Who receives your data?",
        p: [
          "Only authorised people at our company (site administrators) can view accounts and estimates.",
          "We do not sell or rent your data. It is passed only to the technical providers listed below, and to authorities when the law requires it.",
        ],
      },
      {
        h: "6. Our providers and transfers outside Tunisia",
        list: [
          "Supabase (database, accounts, functions): your data is hosted in Germany (Frankfurt, European Union).",
          "GitHub Pages (GitHub, Inc., United States): hosts the site's pages and receives visitors' IP addresses in its technical logs.",
          "Resend (Resend, Inc., United States): sends the verification code; receives your e-mail address and the code.",
          "Google Maps, WhatsApp, Facebook, Instagram and LinkedIn: only if you click their links. They apply their own policies.",
        ],
        p: ["These providers are located outside Tunisia. We pass them only the data they need for their task."],
      },
      {
        h: "7. Security",
        p: ["The site is served over HTTPS, passwords are encrypted, and access to data is limited by database security rules: a logged-in visitor can only see their own account and estimates. No system is infallible; we take the measures needed to protect your data."],
      },
      {
        h: "8. Your rights",
        p: [
          `You can ask for access to your data, its correction or deletion, object to its processing or withdraw your consent at any time, free of charge, by writing to ${email} from your account's e-mail address. We may ask you to confirm your identity.`,
          "We reply within one month at most.",
          "You can also contact the National Authority for the Protection of Personal Data (INPDP): www.inpdp.nat.tn.",
        ],
      },
      { h: "9. Minors", p: ["The site is intended for adults and professionals. It is not intended for people under 18."] },
      { h: "10. Changes", p: ["We may change this policy. The date of the last update is shown at the top of the page. For an important change, we will ask you to accept it again."] },
    ],
  },

  terms: {
    h1: "Terms and Conditions",
    intro: `These terms govern the use of pilotconstract.com, published by ${LEGAL_NAME} (${BRAND}). By creating an account or using the quote calculator, you accept them.`,
    sections: [
      { h: "1. The publisher", p: [`${who}. Contact: ${email}, ${phone}. See also the Legal Notice.`] },
      { h: "2. Information and guides", p: ["The texts, guides and photos on the site are general information. They do not replace a technical study or an engineer's advice: the design of a structure must always be studied for the specific project and site."] },
      {
        h: "3. Your account",
        list: [
          "You must be an adult (or act on behalf of a company) and give accurate information.",
          "You keep your password safe and are responsible for the use of your account.",
          "Your e-mail address is verified with a code. An unverified account is deleted after 2 days.",
          "We may suspend an account in case of abuse or false information.",
          "You can ask for your account to be deleted at any time (see the Privacy Policy).",
        ],
      },
      {
        h: "4. Online estimates and quotes",
        list: [
          "The calculator gives an indicative estimate from the information you enter. It is not a firm offer, a contractual quote or a commitment on our part.",
          "Amounts are calculated with the rates in force at the time of the calculation, which may change. VAT and FODEC, where shown, are shown for calculation purposes.",
          "The final price is confirmed after a study, in a written quote that you accept.",
        ],
      },
      { h: "5. Orders and contracts", p: ["A project is concluded only by a written quote or contract accepted by both parties. Payment, lead time, cancellation and refund terms are those of that document (see the Refund Policy). The site does not allow any online payment."] },
      {
        h: "6. Intellectual property",
        p: [
          `The texts, drawings, photos, logos, icons, 3D model and structure of the site are the property of ${LEGAL_NAME} or used with their owners' permission. Any reproduction or reuse without our written consent is forbidden.`,
          "The names and logos of our partners belong to their owners and are shown with their permission.",
        ],
      },
      {
        h: "7. Acceptable use",
        list: [
          "Do not disrupt the site or try to access data that is not yours.",
          "Do not use robots to create accounts or enter codes.",
          "Do not provide false information or impersonate anyone.",
        ],
      },
      { h: "8. Availability and liability", p: ["The site is provided as is. It may be interrupted for maintenance or in case of failure, with no guarantee of permanent availability. Within the limits allowed by law, we are not liable for indirect damage linked to the use of the site or to treating an estimate as if it were a firm offer. Nothing in these terms excludes a liability that the law does not allow to be excluded."] },
      { h: "9. External links", p: ["The site contains links to other sites (Google Maps, WhatsApp, social networks). We do not control their content and are not responsible for their practices."] },
      { h: "10. Personal data", p: ["How your data is processed is described in the Privacy Policy and the Cookie Policy."] },
      { h: "11. Changes to these terms", p: ["We may change these terms. The update date is shown at the top of the page. Using the site after a change means you accept it."] },
      { h: "12. Governing law and disputes", p: ["These terms are governed by Tunisian law. In case of a dispute, we first look for an amicable solution. Failing that, the competent courts of Sfax have jurisdiction, without prejudice to the mandatory jurisdiction rules that apply to consumers."] },
      { h: "13. Languages", p: ["These terms exist in French, English and Arabic. If they differ, the French version prevails."] },
    ],
  },

  cookies: {
    h1: "Cookie Policy",
    intro: "This site sets no cookies and does not track you. This page explains what it stores in your browser, and why no consent banner is needed.",
    sections: [
      { h: "1. In short", list: ["No cookies.", "No audience analytics, no advertising, no trackers.", "No external content loaded automatically (fonts are hosted on the site).", "At most two items stored in your browser, described below."] },
      {
        h: "2. What the site stores in your browser",
        list: [
          "pilot-constract-lang: your language choice. Stored only if you change the language with the selector; it is used to offer you that language when you come back. It does not expire by itself; you can clear it at any time.",
          "Login session (a key starting with “sb-” and ending with “-auth-token”): stored only if you log in, to keep your session open. It is removed when you log out. It is strictly necessary for your account to work.",
        ],
        p: ["These items are stored locally in your browser (“localStorage”); they are not cookies. They are never used to track or profile you."],
      },
      { h: "3. Why is there no consent banner?", p: ["A banner is only needed for non-essential trackers (audience measurement, advertising, embedded social networks). Here, only items you ask for yourself (language, login) are stored. If we ever add an analytics tool or external content, we will ask for your consent before turning it on and update this page."] },
      { h: "4. External content and sites", p: ["No external content is loaded automatically. If you click a link to Google Maps, WhatsApp, Facebook, Instagram or LinkedIn, you leave this site: those services apply their own policies."] },
      { h: "5. How to clear this information", p: ["You can delete it in your browser settings (site data / local storage), or by logging out for the login session."] },
      { h: "6. Contact", p: [`For any question: ${email}.`] },
    ],
  },

  refunds: {
    h1: "Refund Policy",
    intro: `This page explains what is paid, what is not, and how refunds are handled with ${LEGAL_NAME} (${BRAND}).`,
    sections: [
      { h: "1. In short", list: ["The site, the account and the quote calculator are free.", "No payment is requested on the site, so there is nothing to refund online."] },
      { h: "2. Payment and refund for works", p: ["Works (engineering, fabrication, installation, metalwork, etc.) are ordered through a written quote or contract that you accept. The payment terms (deposit, schedule), cancellation and refund terms for each project are those of that document. Nothing is due before your written acceptance."] },
      { h: "3. Made-to-measure structures", p: ["Our structures are made to measure from your drawings and dimensions. The consequences of cancelling after fabrication has started are set out in the quote or contract, before any payment."] },
      { h: "4. Your legal rights", p: ["This policy does not reduce the rights the law gives you, in particular those of consumers (guarantees, right of withdrawal where it applies)."] },
      { h: "5. Complaint or refund request", p: [`Write to ${email} or call ${phone} (${HOURS.line.en}) giving your name, the quote reference and the subject of your request. We reply in writing.`] },
    ],
  },

  legal: {
    h1: "Legal Notice",
    intro: "Information about the publisher and hosting of pilotconstract.com.",
    sections: [
      {
        h: "1. Site publisher",
        list: [
          `${LEGAL_NAME} (${BRAND})`,
          LEGAL.form && `Legal form: ${LEGAL.form}`,
          LEGAL.capital && `Share capital: ${LEGAL.capital}`,
          LEGAL.registryNumber && `Trade register / RNE: ${LEGAL.registryNumber}`,
          LEGAL.taxId && `Tax identification number: ${LEGAL.taxId}`,
          `Head office (administration): ${office}`,
          `Factory: ${factory}`,
          `Phone: ${contact.phones.join(" / ")}`,
          `E-mail: ${email}`,
          `Opening hours: ${HOURS.line.en}`,
          LEGAL.director && `Publication director: ${LEGAL.director}`,
        ].filter(Boolean),
      },
      {
        h: "2. Hosting",
        list: [
          "Site pages: GitHub Pages, GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, United States.",
          "Accounts and database: Supabase (data hosted in Germany, European Union).",
          "Domain name: registered with Porkbun LLC.",
        ],
      },
      { h: "3. Intellectual property", p: [`The site's content (texts, drawings, photos, logos, icons, 3D model) is the property of ${LEGAL_NAME} or used with their owners' permission. Any reproduction without written consent is forbidden.`, "The names and logos of our partners belong to their owners and are shown with their permission."] },
      { h: "4. Fonts", p: ["Barlow Condensed, Source Sans 3, Cairo and Tajawal are distributed under the SIL Open Font License."] },
      { h: "5. Reporting content", p: [`To report content you believe is unlawful, or to ask for a photo showing you to be removed: ${email}.`] },
      { h: "6. Personal data", p: ["See the Privacy Policy and the Cookie Policy."] },
    ],
  },
};

export default en;
