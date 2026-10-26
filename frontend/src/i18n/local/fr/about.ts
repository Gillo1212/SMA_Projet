/**
 * Traductions françaises — page « Qui sommes-nous » et page 404.
 * Toute clé ajoutée ici doit l'être aussi dans `../en/about.ts`.
 * Les listes (tags, engagements) se lisent avec `returnObjects: true`.
 */
export default {
  aboutPage: {
    eyebrow: 'Qui sommes-nous',
    title: 'Agrobusiness, distribution automatisée et',
    titleAccent: 'technologies numériques',
    subtitle: 'SenMartALIM modernise la chaîne de valeur alimentaire en Afrique et au Canada, de la production agricole à la distribution intelligente.',

    missionEyebrow: 'Notre mission',
    missionQuote: "« Mettre la technologie au service d'une alimentation saine, accessible et traçable. »",
    missionText1: "SMA développe un écosystème intégré allant de la production agricole à la distribution intelligente, avec une forte orientation vers la qualité, la traçabilité et l'impact social.",
    missionText2: "Nous croyons que l'avenir de l'agroalimentaire passe par l'innovation locale : créer un pont entre les producteurs agricoles africains et les consommateurs urbains, grâce à la transformation locale, à une logistique optimisée et à des circuits de distribution modernes.",
    missionImageAlt: 'Distributeur SEN Coffee installé dans un espace de travail',

    activitiesEyebrow: 'Nos activités',
    activitiesTitle: 'Toute la chaîne de valeur',
    activitiesTitleAccent: 'alimentaire',
    activities: {
      distribution: {
        title: 'Distribution automatique et vente connectée',
        text: 'Automates de boissons chaudes et froides, snacks et produits santé sous la marque SenMartALIM. Intégration IoT, paiement digital (Wave, Orange Money, PayPal), gestion centralisée via plateforme cloud et traçabilité des ventes en temps réel.',
        tags: ['Café et boissons', 'Snacks santé', 'IoT et cloud', 'Paiement digital'],
      },
      agrifood: {
        title: 'Transformation agroalimentaire',
        text: 'Approvisionnement auprès de coopératives agricoles et producteurs locaux. Valorisation des produits africains : café, cacao, céréales, fruits tropicaux. Poudres premium, boissons santé, snacks à base de fruits séchés, noix et céréales locales.',
        tags: ['Café et cacao', 'Céréales locales', 'Fruits séchés', 'Circuits courts'],
      },
      tech: {
        title: 'Technologies et données',
        text: "Infrastructure Microsoft Azure pour piloter l'ensemble du numérique : API de paiement, suivi des transactions, Data Lake Azure Synapse, tableaux de bord Power BI. Des décisions fondées sur les données pour optimiser la performance commerciale et logistique.",
        tags: ['Microsoft Azure', 'Power BI', 'Data Lake', 'API de paiement'],
      },
      partnerships: {
        title: 'Partenariats et déploiements',
        text: 'Déploiement dans des sites à fort trafic : hôpitaux (CHUP de Pikine), écoles, universités, espaces publics et entreprises privées. Deux modèles : vente directe ou mise à disposition avec partage des revenus.',
        tags: ['Hôpitaux', 'Universités', 'Entreprises', 'Espaces publics'],
      },
    },

    missionShort: "Mettre la technologie au service d'une alimentation saine, accessible et traçable, en créant de la valeur ajoutée sur le territoire tout en soutenant une économie circulaire.",
    visionEyebrow: 'Notre vision',
    visionText: "Étendre le parc de distributeurs connectés au Canada et en Afrique de l'Ouest, et développer l'application mobile SMA Connect pour la commande, le paiement et la fidélité.",
    commitmentsEyebrow: 'Nos engagements',
    commitments: [
      'Qualité et traçabilité des matières premières',
      'Soutien aux producteurs locaux',
      'Innovation continue en distribution',
      'Responsabilité sociale et environnementale',
    ],

    innovationEyebrow: 'Innovation et impact',
    innovationTitle: "Nos axes d'innovation pour un",
    innovationTitleAccent: 'impact durable',
    impactLabel: 'Impact : {{impact}}',
    innovations: {
      digital: { axis: 'Digitalisation de la distribution', desc: 'Automates connectés, paiements dématérialisés', impact: 'Accessibilité 24/7' },
      local: { axis: 'Valorisation des produits locaux', desc: 'Filière café, cacao, céréales africaines', impact: 'Revenus agricoles accrus' },
      traceability: { axis: 'Traçabilité et données', desc: 'Suivi des ventes, qualité, maintenance prédictive', impact: 'Transparence et efficacité' },
      sustainability: { axis: 'Durabilité', desc: 'Réduction du gaspillage, packaging écoresponsable', impact: 'Empreinte carbone réduite' },
    },

    roadmapEyebrow: 'Perspectives',
    roadmapTitle: 'Notre feuille de route',
    roadmapTitleAccent: 'pour les prochaines années',
    roadmap: {
      international: { title: 'Expansion internationale', desc: "Extension du parc de distributeurs connectés au Canada et en Afrique de l'Ouest." },
      app: { title: 'Application SMA Connect', desc: 'Application mobile pour la commande, le paiement et la fidélité client.' },
      supplyChain: { title: 'Chaîne agro intégrée', desc: "Partenariats agricoles et logistiques pour une chaîne d'approvisionnement complète." },
      ownBrand: { title: 'Marque propre', desc: "Lancement d'une gamme de boissons et snacks sains issus de produits locaux." },
    },

    ctaBadge: 'Parlons de votre projet',
    ctaTitle: 'Prêt à équiper vos espaces ?',
    ctaSubtitle: 'Contactez nos experts pour une étude personnalisée et un devis gratuit sous 24h.',
    ctaQuote: 'Demander un devis',
    ctaCall: 'Nous appeler',
  },

  notFound: {
    title: 'Page introuvable',
    hint: "La page que vous cherchez n'existe pas ou a été déplacée.",
    home: "Retour à l'accueil",
    catalog: 'Voir les machines',
  },
};
