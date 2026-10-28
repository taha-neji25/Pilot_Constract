// Legal pages, French. Facts come from data/company.js and data/contact.js; what the site does (data collected,
// service providers, storage) matches the code in this repository. See COMPLIANCE.md for what the owner must still do.
import { BRAND, FR_NAME, HOURS, LEGAL, LEGAL_NAME, PLACES } from "../data/company.js";
import contact from "../data/contact.js";

const email = contact.emails[0].address;
const phone = contact.phones[0];
const office = PLACES.office.line.fr;
const factory = PLACES.factory.line.fr;
const who = `${LEGAL_NAME} (${BRAND}), ${office}`;

const fr = {
  privacy: {
    h1: "Politique de confidentialité",
    intro: `Cette politique explique quelles données personnelles ${LEGAL_NAME} (${BRAND}) collecte sur le site pilotconstract.com, pourquoi, combien de temps elles sont conservées et quels sont vos droits.`,
    sections: [
      { h: "1. Qui est responsable de vos données ?", p: [`${who}.`, `Contact : ${email}, ${phone}.`] },
      {
        h: "2. Quelles données collectons-nous ?",
        list: [
          "Quand vous naviguez : aucune donnée personnelle n'est collectée par nous. Le site n'utilise ni outil d'analyse d'audience, ni publicité, ni cookie de suivi. L'hébergeur du site reçoit toutefois l'adresse IP de votre appareil pour vous envoyer les pages (voir la section 6).",
          "Quand vous créez un compte : prénom, nom, adresse e-mail, numéro de téléphone et son pays, type de compte (particulier ou entreprise) et mot de passe. Le mot de passe est conservé sous une forme chiffrée irréversible : nous ne pouvons pas le lire.",
          "Quand vous cochez la case d'acceptation : la date et la version des textes que vous avez acceptés.",
          "Quand vous utilisez le calculateur de devis : le service choisi, les dimensions et profilés saisis, le résultat et la date, rattachés à votre compte.",
          "Pour votre sécurité : votre adresse IP est enregistrée au maximum 24 heures, afin de limiter les tentatives abusives d'inscription ou de saisie de code.",
          "Quand vous nous écrivez ou nous appelez : les informations que vous nous donnez (e-mail, WhatsApp, téléphone, messages).",
        ],
        p: ["Nous ne demandons pas : adresse postale, date de naissance, sexe, pièce d'identité, données bancaires ni localisation."],
      },
      {
        h: "3. Pourquoi utilisons-nous ces données ?",
        list: [
          "Créer et sécuriser votre compte, y compris la vérification de votre adresse e-mail par un code (sur la base de votre consentement et de votre demande).",
          "Vous donner accès au calculateur de devis et conserver l'historique de vos estimations.",
          "Vous répondre et préparer une offre pour votre projet.",
          "Protéger le site contre les abus.",
          "Respecter nos obligations légales.",
        ],
        p: ["Nous n'envoyons ni newsletter ni publicité. Votre adresse e-mail sert uniquement à vous envoyer le code de vérification et à répondre à vos demandes."],
      },
      {
        h: "4. Combien de temps conservons-nous vos données ?",
        list: [
          "Données du compte et historique des estimations : tant que votre compte existe. Vous pouvez demander sa suppression à tout moment.",
          "Compte dont l'adresse e-mail n'a jamais été vérifiée : supprimé automatiquement après 2 jours.",
          "Adresse IP de sécurité : 24 heures au maximum.",
          "Échanges et documents liés à un projet signé : conservés selon les durées exigées par la loi pour les documents commerciaux et comptables.",
        ],
      },
      {
        h: "5. Qui reçoit vos données ?",
        p: [
          "Seules les personnes autorisées de notre entreprise (administrateurs du site) peuvent consulter les comptes et les estimations.",
          "Nous ne vendons ni ne louons vos données. Elles ne sont transmises qu'aux prestataires techniques listés ci-dessous, et aux autorités lorsque la loi l'exige.",
        ],
      },
      {
        h: "6. Nos prestataires et les transferts hors de Tunisie",
        list: [
          "Supabase (base de données, comptes, fonctions) : vos données sont hébergées en Allemagne (Francfort, Union européenne).",
          "GitHub Pages (GitHub, Inc., États-Unis) : héberge les pages du site et reçoit, dans ses journaux techniques, l'adresse IP des visiteurs.",
          "Resend (Resend, Inc., États-Unis) : envoie le code de vérification ; reçoit votre adresse e-mail et le code.",
          "Google Maps, WhatsApp, Facebook, Instagram et LinkedIn : uniquement si vous cliquez sur leurs liens. Ils appliquent leurs propres politiques.",
        ],
        p: ["Ces prestataires sont situés hors de Tunisie. Nous ne leur transmettons que les données nécessaires à leur mission."],
      },
      {
        h: "7. Sécurité",
        p: ["Le site est servi en HTTPS, les mots de passe sont chiffrés, et l'accès aux données est limité par des règles de sécurité de la base de données : un visiteur connecté ne peut voir que son propre compte et ses propres estimations. Aucun système n'est infaillible ; nous prenons les mesures nécessaires pour protéger vos données."],
      },
      {
        h: "8. Vos droits",
        p: [
          "Vous pouvez demander l'accès à vos données, leur correction, leur suppression, vous opposer à leur traitement ou retirer votre consentement à tout moment, sans frais, en écrivant à " + email + " depuis l'adresse e-mail de votre compte. Nous pouvons vous demander de confirmer votre identité.",
          "Nous répondons dans un délai maximum d'un mois.",
          "Vous pouvez aussi saisir l'Instance nationale de protection des données personnelles (INPDP) : www.inpdp.nat.tn.",
        ],
      },
      { h: "9. Mineurs", p: ["Le site s'adresse aux adultes et aux professionnels. Il n'est pas destiné aux personnes de moins de 18 ans."] },
      { h: "10. Modifications", p: ["Nous pouvons modifier cette politique. La date de dernière mise à jour figure en haut de la page. En cas de changement important, nous vous demanderons de l'accepter de nouveau."] },
    ],
  },

  terms: {
    h1: "Conditions générales d'utilisation",
    intro: `Ces conditions encadrent l'utilisation du site pilotconstract.com, édité par ${LEGAL_NAME} (${BRAND}). En créant un compte ou en utilisant le calculateur de devis, vous les acceptez.`,
    sections: [
      { h: "1. L'éditeur", p: [`${who}. Contact : ${email}, ${phone}. Voir aussi les Mentions légales.`] },
      { h: "2. Informations et guides", p: ["Les textes, les guides et les photos du site sont donnés à titre d'information générale. Ils ne remplacent ni une étude technique ni l'avis d'un ingénieur : la conception d'une structure doit toujours faire l'objet d'une étude propre au projet et au site."] },
      {
        h: "3. Votre compte",
        list: [
          "Vous devez être majeur (ou agir pour le compte d'une entreprise) et donner des informations exactes.",
          "Vous protégez votre mot de passe et vous êtes responsable de l'usage de votre compte.",
          "Votre adresse e-mail est vérifiée par un code. Un compte non vérifié est supprimé après 2 jours.",
          "Nous pouvons suspendre un compte en cas d'abus ou de fausses informations.",
          "Vous pouvez demander la suppression de votre compte à tout moment (voir la Politique de confidentialité).",
        ],
      },
      {
        h: "4. Estimations et devis en ligne",
        list: [
          "Le calculateur donne une estimation indicative à partir des informations que vous saisissez. Ce n'est ni une offre ferme, ni un devis contractuel, ni un engagement de notre part.",
          "Les montants sont calculés avec les tarifs en vigueur au moment du calcul, qui peuvent changer. La TVA et le FODEC éventuellement indiqués le sont à titre de calcul.",
          "Le prix définitif est confirmé après étude, par un devis écrit que vous acceptez.",
        ],
      },
      { h: "5. Commande et contrat", p: ["Un projet n'est conclu que par un devis ou un contrat écrit, accepté par les deux parties. Les conditions de paiement, de délai, d'annulation et de remboursement sont celles de ce document (voir la Politique de remboursement). Le site ne permet aucun paiement en ligne."] },
      {
        h: "6. Propriété intellectuelle",
        p: [
          `Les textes, plans, photos, logos, icônes, modèle 3D et la structure du site sont la propriété de ${LEGAL_NAME} ou utilisés avec l'autorisation de leurs titulaires. Toute reproduction ou réutilisation sans notre accord écrit est interdite.`,
          "Les noms et logos de nos partenaires appartiennent à leurs propriétaires et sont affichés avec leur accord.",
        ],
      },
      {
        h: "7. Utilisation acceptable",
        list: [
          "Ne pas perturber le site, ni tenter d'accéder à des données qui ne sont pas les vôtres.",
          "Ne pas utiliser de robots pour créer des comptes ou saisir des codes.",
          "Ne pas fournir de fausses informations ni usurper l'identité d'un tiers.",
        ],
      },
      { h: "8. Disponibilité et responsabilité", p: ["Le site est fourni en l'état. Il peut être interrompu pour maintenance ou en cas de panne, sans garantie de disponibilité permanente. Dans les limites permises par la loi, nous ne sommes pas responsables des dommages indirects liés à l'utilisation du site, ni de l'usage d'une estimation comme s'il s'agissait d'une offre ferme. Aucune clause du présent texte n'exclut une responsabilité que la loi ne permet pas d'exclure."] },
      { h: "9. Liens externes", p: ["Le site contient des liens vers d'autres sites (Google Maps, WhatsApp, réseaux sociaux). Nous ne contrôlons pas leur contenu et ne sommes pas responsables de leurs pratiques."] },
      { h: "10. Données personnelles", p: ["Le traitement de vos données est décrit dans la Politique de confidentialité et la Politique de cookies."] },
      { h: "11. Modification des conditions", p: ["Nous pouvons modifier ces conditions. La date de mise à jour figure en haut de la page. L'utilisation du site après modification vaut acceptation."] },
      { h: "12. Droit applicable et litiges", p: ["Ces conditions sont soumises au droit tunisien. En cas de litige, nous cherchons d'abord une solution amiable. À défaut, les tribunaux compétents de Sfax sont saisis, sans préjudice des règles impératives de compétence applicables aux consommateurs."] },
      { h: "13. Langues", p: ["Ces conditions existent en français, en anglais et en arabe. En cas de divergence, la version française prévaut."] },
    ],
  },

  cookies: {
    h1: "Politique de cookies",
    intro: `Ce site ne dépose aucun cookie et ne vous suit pas. Cette page explique ce qu'il enregistre dans votre navigateur, et pourquoi aucun bandeau de consentement n'est nécessaire.`,
    sections: [
      { h: "1. En résumé", list: ["Aucun cookie.", "Aucun outil d'analyse d'audience, aucune publicité, aucun traceur.", "Aucun contenu externe chargé automatiquement (les polices sont hébergées sur le site).", "Deux informations au plus enregistrées dans votre navigateur, décrites ci-dessous."] },
      {
        h: "2. Ce que le site enregistre dans votre navigateur",
        list: [
          "pilot-constract-lang : votre choix de langue. Enregistré uniquement si vous changez la langue avec le sélecteur ; il sert à vous proposer cette langue à votre retour. Il n'expire pas tout seul ; vous pouvez l'effacer à tout moment.",
          "Session de connexion (clé commençant par « sb- » et se terminant par « -auth-token ») : enregistrée uniquement si vous vous connectez, pour garder votre session ouverte. Elle est supprimée quand vous vous déconnectez. Elle est strictement nécessaire au fonctionnement de votre compte.",
        ],
        p: ["Ces éléments sont stockés localement dans votre navigateur (« localStorage ») ; ce ne sont pas des cookies. Ils ne servent jamais à vous suivre ni à vous profiler."],
      },
      { h: "3. Pourquoi aucun bandeau de consentement ?", p: ["Un bandeau n'est nécessaire que pour les traceurs qui ne sont pas indispensables (mesure d'audience, publicité, réseaux sociaux intégrés). Ici, seuls des éléments que vous demandez vous-même (langue, connexion) sont enregistrés. Si nous ajoutons un jour un outil d'analyse ou un contenu externe, nous vous demanderons votre accord avant de l'activer et nous mettrons cette page à jour."] },
      { h: "4. Contenus et sites externes", p: ["Aucun contenu externe n'est chargé automatiquement. Si vous cliquez sur un lien vers Google Maps, WhatsApp, Facebook, Instagram ou LinkedIn, vous quittez ce site : ces services appliquent leurs propres politiques."] },
      { h: "5. Comment effacer ces informations", p: ["Vous pouvez les supprimer dans les réglages de votre navigateur (données de site / stockage local), ou en vous déconnectant pour la session de connexion."] },
      { h: "6. Contact", p: [`Pour toute question : ${email}.`] },
    ],
  },

  refunds: {
    h1: "Politique de remboursement",
    intro: `Cette page explique ce qui est payant, ce qui ne l'est pas, et comment les remboursements sont traités avec ${LEGAL_NAME} (${BRAND}).`,
    sections: [
      { h: "1. En résumé", list: ["Le site, le compte et le calculateur de devis sont gratuits.", "Aucun paiement n'est demandé sur le site : il n'y a donc rien à rembourser en ligne."] },
      { h: "2. Paiement et remboursement des travaux", p: ["Les travaux (étude, fabrication, montage, ferronnerie, etc.) sont commandés par un devis ou un contrat écrit que vous acceptez. Les conditions de paiement (acompte, échéancier), d'annulation et de remboursement de chaque projet sont celles de ce document. Rien n'est dû avant votre acceptation écrite."] },
      { h: "3. Ouvrages sur mesure", p: ["Nos ouvrages sont fabriqués sur mesure d'après vos plans et dimensions. Les conséquences d'une annulation après le lancement de la fabrication sont précisées dans le devis ou le contrat, avant tout paiement."] },
      { h: "4. Vos droits légaux", p: ["Cette politique ne réduit pas les droits que la loi vous reconnaît, notamment ceux des consommateurs (garanties, droit de rétractation lorsqu'il s'applique)."] },
      { h: "5. Réclamation ou demande de remboursement", p: [`Écrivez-nous à ${email} ou appelez le ${phone} (${HOURS.line.fr}) en indiquant votre nom, la référence du devis et l'objet de votre demande. Nous vous répondons par écrit.`] },
    ],
  },

  legal: {
    h1: "Mentions légales",
    intro: "Informations sur l'éditeur et l'hébergement du site pilotconstract.com.",
    sections: [
      {
        h: "1. Éditeur du site",
        list: [
          `${LEGAL_NAME} (${BRAND})`,
          LEGAL.form && `Forme juridique : ${LEGAL.form}`,
          LEGAL.capital && `Capital : ${LEGAL.capital}`,
          LEGAL.registryNumber && `Registre du commerce / RNE : ${LEGAL.registryNumber}`,
          LEGAL.taxId && `Matricule fiscal : ${LEGAL.taxId}`,
          `Siège administratif : ${office}`,
          `Usine : ${factory}`,
          `Téléphone : ${contact.phones.join(" / ")}`,
          `E-mail : ${email}`,
          `Horaires : ${HOURS.line.fr}`,
          LEGAL.director && `Directeur de la publication : ${LEGAL.director}`,
        ].filter(Boolean),
      },
      {
        h: "2. Hébergement",
        list: [
          "Pages du site : GitHub Pages, GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.",
          "Comptes et base de données : Supabase (données hébergées en Allemagne, Union européenne).",
          "Nom de domaine : enregistré chez Porkbun LLC.",
        ],
      },
      { h: "3. Propriété intellectuelle", p: [`Les contenus du site (textes, plans, photos, logos, icônes, modèle 3D) sont la propriété de ${LEGAL_NAME} ou utilisés avec l'autorisation de leurs titulaires. Toute reproduction sans accord écrit est interdite.`, "Les noms et logos de nos partenaires appartiennent à leurs propriétaires et sont affichés avec leur accord."] },
      { h: "4. Polices", p: ["Barlow Condensed, Source Sans 3, Cairo et Tajawal sont distribuées sous la licence SIL Open Font License."] },
      { h: "5. Signaler un contenu", p: [`Pour signaler un contenu que vous pensez illicite, ou demander le retrait d'une photo vous représentant : ${email}.`] },
      { h: "6. Données personnelles", p: ["Voir la Politique de confidentialité et la Politique de cookies."] },
    ],
  },
};

export default fr;
