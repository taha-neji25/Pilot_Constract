// Guides: articles that answer what clients search for before they call (/guides and /guides/<address>).
// General, practical advice; where figures appear (6 to 16 weeks, 19 % VAT, 1 % FODEC) they are the ones already used
// on the site and in the quote calculator. Addresses: seo/routes.js. Titles/descriptions here feed seo/meta.js.

import { BRAND, FR_NAME } from "../data/company.js";
export const guideUi = {
  fr: {
    home: "Accueil",
    guides: "Guides",
    eyebrow: "Conseils",
    title: "Guides pour construire en charpente métallique",
    lead: "Des réponses pratiques aux questions que l'on se pose avant de lancer un hall, un entrepôt ou un atelier métallique.",
    read: "Lire le guide →",
    cta: "Parlons de votre projet",
    ctaQuote: "Demander un devis gratuit",
    more: "À lire aussi",
    services: "Nos services",
    published: `Par ${FR_NAME} (${BRAND}), Sfax`,
  },
  en: {
    home: "Home",
    guides: "Guides",
    eyebrow: "Advice",
    title: "Guides to building with a steel frame",
    lead: "Practical answers to the questions people ask before starting a steel hall, warehouse or workshop.",
    read: "Read the guide →",
    cta: "Let's talk about your project",
    ctaQuote: "Request a free quote",
    more: "Also worth reading",
    services: "Our services",
    published: `By ${BRAND}, Sfax`,
  },
  ar: {
    home: "الرئيسية",
    guides: "الأدلة",
    eyebrow: "نصائح",
    title: "أدلة للبناء بالهياكل المعدنية",
    lead: "إجابات عملية عن الأسئلة التي تُطرح قبل إطلاق مشروع قاعة أو مستودع أو ورشة معدنية.",
    read: "اقرأ الدليل ←",
    cta: "لنتحدث عن مشروعك",
    ctaQuote: "اطلب عرض سعر مجاني",
    more: "اقرأ أيضًا",
    services: "خدماتنا",
    published: `من ${BRAND}، صفاقس`,
  },
};

export const guidesIndexMeta = {
  fr: { title: `Guides : construire en charpente métallique | ${FR_NAME}`, description: `Conseils de ${BRAND} pour préparer un projet de charpente métallique, de hangar ou d'entrepôt : étapes, choix de la structure, devis.` },
  en: { title: `Guides: Building with a Steel Frame | ${BRAND}`, description: `${BRAND}'s advice for preparing a steel frame, hangar or warehouse project: steps, choosing the structure, and quotes.` },
  ar: { title: `أدلة: البناء بالهياكل المعدنية | ${BRAND}`, description: `نصائح ${BRAND} لإعداد مشروع هيكل معدني أو هنقار أو مستودع: المراحل واختيار الهيكل وعرض السعر.` },
};

// Each article: metaTitle/metaDesc (search results), h1, intro, sections [{ h, p: [...], list: [...] }]
const guides = {
  fr: {
    steps: {
      metaTitle: `Étapes d'un projet de charpente métallique | ${FR_NAME}`,
      metaDesc: "De l'étude et la note de calcul à la fabrication, la pose et la réception : les étapes d'un projet de hall ou d'entrepôt métallique, avec les délais indicatifs.",
      h1: "Les étapes d'un projet de charpente métallique, de l'étude à la réception",
      intro: "Un hall, un entrepôt ou un atelier métallique se réalise en quatre grandes étapes. Les connaître aide à préparer son projet, à comparer les offres et à tenir son planning.",
      sections: [
        { h: "1. L'étude et la note de calcul", p: ["Tout commence par vos besoins : dimensions du bâtiment (longueur, largeur, hauteur), usage, charges à porter et conditions du site. Le bureau d'études en déduit la note de calcul, les plans d'exécution et, si besoin, un modèle 3D.", "C'est cette étape qui détermine les profilés retenus, donc le poids d'acier et le prix."] },
        { h: "2. La fabrication en atelier", p: ["Poteaux, traverses, pannes et platines sont découpés, soudés, puis protégés contre la corrosion en atelier, dans des conditions mieux maîtrisées que sur chantier.", "Chaque ensemble est contrôlé avant de partir sur site."] },
        { h: "3. La pose sur site", p: ["Les fondations en béton doivent être prêtes, avec les tiges d'ancrage placées selon les plans. Les équipes de pose lèvent alors les portiques, installent les pannes et le contreventement, puis la couverture et le bardage en tôle."] },
        { h: "4. Le contrôle et la réception", p: ["Le chantier se termine par un contrôle qualité sur site et la réception de l'ouvrage. Un suivi et une maintenance préventive peuvent ensuite être prévus."] },
        { h: "Quels délais ?", p: [`Selon la taille de l'ouvrage, comptez en général entre 6 et 16 semaines entre la validation des plans et la réception : c'est le délai indicatif annoncé par ${BRAND}.`] },
        { h: "Pour demander un devis, préparez", list: ["vos plans ou une description du projet", "les dimensions souhaitées et l'usage du bâtiment", "le lieu du chantier", "votre choix de couverture et de bardage, avec ou sans isolation"] },
      ],
    },
    "steel-or-concrete": {
      metaTitle: `Hangar métallique ou béton ? | ${FR_NAME}`,
      metaDesc: "Rapidité, portées, évolutivité, entretien, budget : les critères pour choisir entre une charpente métallique et une construction en béton pour un hall ou un entrepôt.",
      h1: "Hangar métallique ou construction en béton : comment choisir ?",
      intro: "Pour un entrepôt, un atelier ou un hall industriel, la charpente métallique est souvent comparée à la construction en béton. Voici les critères qui comptent vraiment.",
      sections: [
        { h: "La rapidité", p: ["La structure métallique est fabriquée en atelier pendant que les fondations sont réalisées sur site. Les deux avancent en parallèle, ce qui raccourcit généralement le chantier."] },
        { h: "Les grandes portées", p: ["L'acier permet de couvrir de grandes largeurs avec peu ou pas de poteaux intermédiaires, un avantage pour la circulation des engins et l'organisation du stockage."] },
        { h: "L'évolutivité", p: ["Une structure métallique se prolonge ou se modifie plus facilement : ajout d'une travée, d'une extension, d'une passerelle ou d'une mezzanine."] },
        { h: "L'entretien", p: ["L'acier doit être protégé contre la corrosion, surtout près de la mer. Le traitement anticorrosion en atelier, puis un entretien préventif, assurent la durée de vie de la structure."] },
        { h: "Le budget", p: ["Le coût dépend de la portée, des charges, de l'isolation, du bardage et du site. Seule une étude permet de le chiffrer : pour comparer deux offres, vérifiez qu'elles reposent sur les mêmes dimensions et les mêmes hypothèses."] },
        { h: "Quand privilégier le béton ?", p: ["Certaines exigences, comme la résistance au feu ou des charges très lourdes, peuvent demander une protection supplémentaire de l'acier ou une autre solution. Cela se décide au cas par cas, après étude."] },
        { h: "Souvent, un mélange des deux", p: ["Dans beaucoup de projets industriels, les fondations et le soubassement sont en béton et la structure est en acier."] },
      ],
    },
    quote: {
      metaTitle: `Devis de charpente métallique | ${FR_NAME}`,
      metaDesc: "Poids d'acier, dimensions, profilés, couverture, taxes : ce que comprend le devis d'une charpente métallique et comment estimer son projet en ligne.",
      h1: "Devis de charpente métallique : ce qui fait le prix",
      intro: "Le prix d'une charpente métallique n'est pas un forfait : il découle d'un calcul. Voici ce que contient un devis et ce qui le fait varier.",
      sections: [
        { h: "Le poids d'acier, première base", p: ["Le prix repose d'abord sur le poids d'acier de la structure, multiplié par un prix au kilogramme. Ce poids est la somme des poteaux, traverses, pannes, contreventements, compressions, platines, tiges d'ancrage, attaches et goussets."] },
        { h: "Les dimensions de l'ouvrage", p: ["Longueur, largeur (portée), hauteur sous sablière et distance entre portiques déterminent le nombre d'éléments et leur taille : plus le bâtiment est grand, ou plus les portiques sont espacés, plus les profilés sont forts."] },
        { h: "Les profilés choisis", p: ["Chaque position de la structure (poteaux, traverses, pannes…) reçoit un profilé adapté aux charges : c'est le travail du bureau d'études. Un profilé plus fort pèse plus et coûte plus."] },
        { h: "Couverture, bardage, isolation", p: ["La couverture et le bardage en tôle, avec ou sans isolation, s'ajoutent à la structure selon votre projet."] },
        { h: "Hors taxes, puis taxes", p: ["Les prix sont présentés hors taxes. S'ajoutent ensuite la TVA (19 %) et, selon le cas, le FODEC (1 %)."] },
        { h: "Estimer en ligne, confirmer après étude", p: [`Le calculateur de devis de ${BRAND} donne une estimation de charpente industrielle selon vos dimensions et vos profilés. Le prix final est confirmé après étude.`] },
      ],
    },
  },

  en: {
    steps: {
      metaTitle: `Steps of a Steel Frame Project, Study to Handover | ${BRAND}`,
      metaDesc: "From the calculation note to fabrication, installation and handover: the steps of a steel hall or warehouse project, with indicative lead times.",
      h1: "The steps of a steel frame project, from study to handover",
      intro: "A steel hall, warehouse or workshop comes together in four main steps. Knowing them helps you prepare your project, compare offers and keep to your schedule.",
      sections: [
        { h: "1. The study and the calculation note", p: ["It all starts with your needs: the building's dimensions (length, width, height), its use, the loads it must carry and the site conditions. The engineering office draws up the calculation note, the execution drawings and, if needed, a 3D model.", "This step decides the sections used, and therefore the steel weight and the price."] },
        { h: "2. Fabrication in the workshop", p: ["Columns, rafters, purlins and base plates are cut, welded and protected against corrosion in the workshop, in better-controlled conditions than on site.", "Each assembly is checked before it leaves for site."] },
        { h: "3. Installation on site", p: ["The concrete foundations must be ready, with the anchor rods set according to the drawings. The installation crews then lift the portal frames, fit the purlins and bracing, then the sheet roofing and cladding."] },
        { h: "4. Inspection and handover", p: ["The project ends with a quality check on site and the handover of the structure. Follow-up and preventive maintenance can then be arranged."] },
        { h: "How long does it take?", p: [`Depending on the size of the structure, expect roughly 6 to 16 weeks between drawing approval and handover: this is ${BRAND}'s indicative lead time.`] },
        { h: "To request a quote, prepare", list: ["your drawings or a description of the project", "the dimensions you want and the building's use", "the site location", "your choice of roofing and cladding, with or without insulation"] },
      ],
    },
    "steel-or-concrete": {
      metaTitle: `Steel or Concrete Building: How to Choose? | ${BRAND}`,
      metaDesc: "Speed, spans, flexibility, maintenance, budget: the criteria for choosing between a steel frame and a concrete building for a hall or warehouse.",
      h1: "Steel hangar or concrete building: how to choose?",
      intro: "For a warehouse, workshop or industrial hall, a steel frame is often compared with concrete construction. Here are the criteria that really matter.",
      sections: [
        { h: "Speed", p: ["The steel structure is fabricated in the workshop while the foundations are built on site. The two run in parallel, which generally shortens the project."] },
        { h: "Large spans", p: ["Steel can cover wide widths with few or no intermediate columns, an advantage for moving vehicles and organising storage."] },
        { h: "Flexibility", p: ["A steel structure is easier to extend or change: adding a bay, an extension, a walkway or a mezzanine."] },
        { h: "Maintenance", p: ["Steel must be protected against corrosion, especially near the sea. Anti-corrosion treatment in the workshop, then preventive maintenance, keep the structure in good condition."] },
        { h: "Budget", p: ["The cost depends on the span, the loads, insulation, cladding and the site. Only a study can put a figure on it: to compare two offers, check that they rely on the same dimensions and assumptions."] },
        { h: "When is concrete the better choice?", p: ["Some requirements, such as fire resistance or very heavy loads, may call for extra protection of the steel or a different solution. This is decided case by case, after a study."] },
        { h: "Often, a mix of both", p: ["In many industrial projects the foundations and base are in concrete and the structure is in steel."] },
      ],
    },
    quote: {
      metaTitle: `Steel Frame Quote: What Drives the Price | ${BRAND}`,
      metaDesc: "Steel weight, dimensions, sections, roofing, taxes: what a steel frame quote includes and how to estimate your project online.",
      h1: "Steel frame quote: what drives the price",
      intro: "The price of a steel frame is not a flat fee: it comes from a calculation. Here is what a quote contains and what makes it vary.",
      sections: [
        { h: "Steel weight, the first basis", p: ["The price first rests on the weight of steel in the structure, multiplied by a price per kilogram. That weight is the sum of the columns, rafters, purlins, bracing, struts, base plates, anchor rods, cleats and gussets."] },
        { h: "The dimensions of the building", p: ["Length, width (span), eaves height and the distance between frames set the number of elements and their size: the larger the building, or the wider the frame spacing, the heavier the sections."] },
        { h: "The sections chosen", p: ["Each position in the structure (columns, rafters, purlins...) receives a section suited to the loads: this is the engineering office's work. A heavier section weighs more and costs more."] },
        { h: "Roofing, cladding, insulation", p: ["Sheet roofing and cladding, with or without insulation, are added to the structure according to your project."] },
        { h: "Excluding tax, then taxes", p: ["Prices are shown excluding tax. VAT (19 %) and, depending on the case, FODEC (1 %) are then added."] },
        { h: "Estimate online, confirm after the study", p: [`${BRAND}'s quote calculator gives an industrial steel framing estimate from your dimensions and your sections. The final price is confirmed after the study.`] },
      ],
    },
  },

  ar: {
    steps: {
      metaTitle: `مراحل مشروع هيكل معدني من الدراسة إلى الاستلام | ${BRAND}`,
      metaDesc: "من المذكرة الحسابية إلى التصنيع والتركيب والاستلام: مراحل مشروع قاعة أو مستودع معدني مع الآجال التقديرية.",
      h1: "مراحل مشروع هيكل معدني، من الدراسة إلى الاستلام",
      intro: "تنجز القاعة أو المستودع أو الورشة المعدنية على أربع مراحل رئيسية. معرفتها تساعدك على إعداد مشروعك ومقارنة العروض واحترام برنامج أشغالك.",
      sections: [
        { h: "1. الدراسة والمذكرة الحسابية", p: ["كل شيء يبدأ من حاجياتك: أبعاد المبنى (الطول والعرض والارتفاع) والاستعمال والأحمال المطلوب تحملها وظروف الموقع. ويستخلص مكتب الدراسات من ذلك المذكرة الحسابية والمخططات التنفيذية ونموذجًا ثلاثي الأبعاد عند الحاجة.", "وهذه المرحلة هي التي تحدد المقاطع المعتمدة، وبالتالي وزن الحديد والسعر."] },
        { h: "2. التصنيع في الورشة", p: ["يتم قصّ الأعمدة والعوارض والصفائح ولحامها ثم حمايتها من التآكل في الورشة، في ظروف أكثر تحكمًا منها في الموقع.", "وتُراقب كل قطعة قبل مغادرتها إلى الموقع."] },
        { h: "3. التركيب في الموقع", p: ["يجب أن تكون الأسس الخرسانية جاهزة مع قضبان التثبيت الموضوعة وفق المخططات. بعدها ترفع فرق التركيب الأُطُر وتركّب عوارض السقف وأنظمة التثبيت، ثم التغطية والتكسية بالصفائح المعدنية."] },
        { h: "4. المراقبة والاستلام", p: ["تنتهي الأشغال بمراقبة الجودة في الموقع واستلام المنشأ. ويمكن بعد ذلك برمجة متابعة وصيانة وقائية."] },
        { h: "ما هي الآجال؟", p: [`حسب حجم المنشأ، تتراوح المدة عادة بين 6 و16 أسبوعًا من المصادقة على المخططات إلى الاستلام، وهي المدة التقديرية التي تعلنها ${BRAND}.`] },
        { h: "لطلب عرض سعر، جهّز", list: ["مخططاتك أو وصفًا للمشروع", "الأبعاد المرغوبة واستعمال المبنى", "موقع الأشغال", "اختيارك للتغطية والتكسية، مع عزل أو دونه"] },
      ],
    },
    "steel-or-concrete": {
      metaTitle: `هيكل معدني أم بناء بالخرسانة: كيف تختار؟ | ${BRAND}`,
      metaDesc: "السرعة والامتدادات والمرونة والصيانة والميزانية: معايير الاختيار بين الهيكل المعدني والبناء بالخرسانة لقاعة أو مستودع.",
      h1: "هيكل معدني أم بناء بالخرسانة: كيف تختار؟",
      intro: "بالنسبة لمستودع أو ورشة أو قاعة صناعية، تُقارن الهياكل المعدنية غالبًا بالبناء بالخرسانة. إليك المعايير التي تهمّ فعلًا.",
      sections: [
        { h: "السرعة", p: ["يُصنع الهيكل المعدني في الورشة بينما تنجز الأسس في الموقع. ويتقدم العملان بالتوازي، ما يقصّر مدة الأشغال عادة."] },
        { h: "الامتدادات الكبيرة", p: ["يتيح الحديد تغطية عروض كبيرة بأعمدة وسطية قليلة أو دونها، وهو ما يفيد حركة الآليات وتنظيم التخزين."] },
        { h: "سهولة التوسعة", p: ["يسهل تمديد الهيكل المعدني أو تعديله: إضافة امتداد أو ممر أو طابق وسيط."] },
        { h: "الصيانة", p: ["يجب حماية الحديد من التآكل، خاصة قرب البحر. وتضمن المعالجة ضد التآكل في الورشة ثم الصيانة الوقائية عمر الهيكل."] },
        { h: "الميزانية", p: ["تتوقف الكلفة على الامتداد والأحمال والعزل والتكسية والموقع. ولا تحدّدها إلا دراسة: ولمقارنة عرضين تأكد أنهما مبنيان على نفس الأبعاد ونفس الفرضيات."] },
        { h: "متى نفضّل الخرسانة؟", p: ["بعض المتطلبات، مثل مقاومة الحريق أو الأحمال الثقيلة جدًا، قد تستدعي حماية إضافية للحديد أو حلًا آخر. ويُحسم ذلك حالة بحالة بعد الدراسة."] },
        { h: "غالبًا مزيج من الاثنين", p: ["في كثير من المشاريع الصناعية تكون الأسس والقاعدة من الخرسانة والهيكل من الحديد."] },
      ],
    },
    quote: {
      metaTitle: `عرض سعر هيكل معدني: ما الذي يحدد الثمن | ${BRAND}`,
      metaDesc: "وزن الحديد والأبعاد والمقاطع والتغطية والأداءات: ما يتضمنه عرض سعر الهيكل المعدني وكيف تقدّر مشروعك عبر الإنترنت.",
      h1: "عرض سعر هيكل معدني: ما الذي يحدد الثمن",
      intro: "ثمن الهيكل المعدني ليس مبلغًا جزافيًا بل نتيجة حساب. إليك ما يتضمنه عرض السعر وما يجعله يتغير.",
      sections: [
        { h: "وزن الحديد، الأساس الأول", p: ["يعتمد الثمن أولًا على وزن حديد الهيكل مضروبًا في سعر الكيلوغرام. ويمثل هذا الوزن مجموع الأعمدة والعوارض وعوارض السقف وأنظمة التثبيت والصفائح وقضبان التثبيت والوصلات."] },
        { h: "أبعاد المنشأ", p: ["يحدد الطول والعرض (الامتداد) والارتفاع والمسافة بين الأُطُر عدد العناصر وحجمها: كلما كبر المبنى أو تباعدت الأُطُر قويت المقاطع."] },
        { h: "المقاطع المختارة", p: ["يُخصص لكل موضع من الهيكل (أعمدة، عوارض، عوارض سقف...) مقطع يناسب الأحمال: وهذا عمل مكتب الدراسات. والمقطع الأقوى أثقل وأغلى."] },
        { h: "التغطية والتكسية والعزل", p: ["تُضاف التغطية والتكسية بالصفائح، مع عزل أو دونه، إلى الهيكل حسب مشروعك."] },
        { h: "قبل الأداءات وبعدها", p: ["تعرض الأسعار دون أداءات. ثم يُضاف الأداء على القيمة المضافة (19٪) وحسب الحالة FODEC (1٪)."] },
        { h: "قدّر عبر الإنترنت وأكّد بعد الدراسة", p: [`تمنحك حاسبة عرض السعر من ${BRAND} تقديرًا لهيكل صناعي حسب أبعادك ومقاطعك. ويؤكد السعر النهائي بعد الدراسة.`] },
      ],
    },
  },
};

export default guides;
