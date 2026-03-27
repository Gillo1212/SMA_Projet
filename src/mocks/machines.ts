export const machineTypes = [
  { id: 'all', name: 'Tous les types' },
  { id: 'cafe', name: 'Distributeurs de Café' },
  { id: 'snacks', name: 'Distributeurs de Snacks' },
  { id: 'boissons', name: 'Distributeurs de Boissons' },
  { id: 'combine', name: 'Distributeurs Combinés' }
];

export const paymentMethods = [
  { id: 'all', name: 'Tous les paiements' },
  { id: 'wave', name: 'Wave' },
  { id: 'orange', name: 'Orange Money' },
  { id: 'carte', name: 'Carte Bancaire' },
  { id: 'especes', name: 'Espèces' }
];

export const capacityFilters = [
  { id: 'all', name: 'Toutes capacités' },
  { id: 'small', name: 'Petite (0-100 produits)' },
  { id: 'medium', name: 'Moyenne (100-300 produits)' },
  { id: 'large', name: 'Grande (300+ produits)' }
];

export const machines = [
  {
    id: 'sma-cafe-pro-200',
    name: 'SMA Café Pro 200',
    slug: 'sma-cafe-pro-200',
    type: 'cafe',
    category: 'Distributeur de Café',
    price: 2850000,
    priceDisplay: '2 850 000 FCFA',
    badge: 'Populaire',
    shortDescription: 'Distributeur de café professionnel haute capacité pour entreprises',
    description: 'Le SMA Café Pro 200 est notre distributeur de café haut de gamme, conçu pour les environnements professionnels exigeants. Avec sa capacité de 200 gobelets et ses 12 sélections de boissons chaudes, il satisfait tous les goûts. Son système de paiement multimodal accepte Wave, Orange Money, cartes bancaires et espèces.',
    image: 'https://readdy.ai/api/search-image?query=modern%20professional%20coffee%20vending%20machine%2C%20sleek%20black%20design%20with%20digital%20touchscreen%20display%2C%20premium%20quality%2C%20corporate%20environment%2C%20contemporary%20style%2C%20standing%20unit%20with%20elegant%20interface&width=600&height=800&seq=machine-cafe-001&orientation=portrait',
    gallery: [
      'https://readdy.ai/api/search-image?query=modern%20professional%20coffee%20vending%20machine%2C%20sleek%20black%20design%20with%20digital%20touchscreen%20display%2C%20premium%20quality%2C%20corporate%20environment%2C%20contemporary%20style%2C%20standing%20unit%20with%20elegant%20interface&width=600&height=800&seq=machine-cafe-001&orientation=portrait',
      'https://readdy.ai/api/search-image?query=coffee%20vending%20machine%20touch%20screen%20interface%20close-up%2C%20modern%20UI%20with%20payment%20options%2C%20digital%20display%20showing%20coffee%20selections%2C%20professional%20design&width=600&height=800&seq=machine-cafe-002&orientation=portrait',
      'https://readdy.ai/api/search-image?query=coffee%20vending%20machine%20internal%20components%2C%20organized%20storage%20compartments%2C%20coffee%20beans%20containers%2C%20clean%20technical%20interior%2C%20professional%20equipment&width=600&height=800&seq=machine-cafe-003&orientation=portrait',
      'https://readdy.ai/api/search-image?query=person%20using%20coffee%20vending%20machine%20in%20modern%20office%2C%20dispensing%20hot%20beverage%2C%20professional%20workplace%2C%20contemporary%20setting&width=600&height=800&seq=machine-cafe-004&orientation=portrait'
    ],
    capacity: {
      cups: 200,
      waterTank: '8 litres',
      beanContainer: '2 kg',
      wasteContainer: '100 dosettes'
    },
    specifications: {
      dimensions: 'H: 183 cm × L: 70 cm × P: 80 cm',
      weight: '145 kg',
      power: '2400W - 220V',
      waterConnection: 'Raccordement eau ou réservoir autonome',
      drinksPerMinute: '8-12 boissons/minute',
      selections: '12 boissons chaudes'
    },
    features: [
      'Écran tactile 10 pouces couleur',
      'Système de paiement Wave & Orange Money intégré',
      'Accepte cartes bancaires et espèces',
      'Système de refroidissement pour lait frais',
      'Moulin à café intégré avec 3 niveaux de mouture',
      'Nettoyage automatique programmable',
      'Connexion Wi-Fi pour télégestion',
      'Éclairage LED basse consommation',
      'Détection automatique de gobelet',
      'Garantie 2 ans pièces et main d\'œuvre'
    ],
    paymentMethods: ['wave', 'orange', 'carte', 'especes'],
    idealFor: ['Entreprises 50-200 employés', 'Centres commerciaux', 'Hôpitaux', 'Universités'],
    maintenanceIncluded: true,
    deliveryTime: '5-7 jours ouvrés',
    stock: 'En stock'
  },
  {
    id: 'sma-snack-master-300',
    name: 'SMA Snack Master 300',
    slug: 'sma-snack-master-300',
    type: 'snacks',
    category: 'Distributeur de Snacks',
    price: 3200000,
    priceDisplay: '3 200 000 FCFA',
    badge: 'Nouveau',
    shortDescription: 'Distributeur de snacks grande capacité avec spirales ajustables',
    description: 'Le SMA Snack Master 300 est le choix idéal pour offrir une large gamme de snacks à vos employés ou clients. Avec ses 40 spirales réglables, il peut accueillir des produits de toutes tailles, des chips aux sandwichs. Son système de double vitrage garantit une visibilité parfaite des produits.',
    image: 'https://readdy.ai/api/search-image?query=modern%20snack%20vending%20machine%20with%20glass%20front%2C%20illuminated%20interior%20displaying%20variety%20of%20snacks%20and%20food%20items%2C%20sleek%20contemporary%20design%2C%20professional%20quality%2C%20standing%20unit&width=600&height=800&seq=machine-snack-001&orientation=portrait',
    gallery: [
      'https://readdy.ai/api/search-image?query=modern%20snack%20vending%20machine%20with%20glass%20front%2C%20illuminated%20interior%20displaying%20variety%20of%20snacks%20and%20food%20items%2C%20sleek%20contemporary%20design%2C%20professional%20quality%2C%20standing%20unit&width=600&height=800&seq=machine-snack-001&orientation=portrait',
      'https://readdy.ai/api/search-image?query=snack%20vending%20machine%20interior%20view%20through%20glass%2C%20organized%20spiral%20shelves%20with%20diverse%20food%20products%2C%20well-lit%20display%2C%20professional%20arrangement&width=600&height=800&seq=machine-snack-002&orientation=portrait',
      'https://readdy.ai/api/search-image?query=snack%20vending%20machine%20payment%20panel%20with%20digital%20screen%2C%20modern%20interface%20with%20mobile%20payment%20options%2C%20professional%20design&width=600&height=800&seq=machine-snack-003&orientation=portrait',
      'https://readdy.ai/api/search-image?query=person%20selecting%20snack%20from%20modern%20vending%20machine%2C%20retrieving%20product%20from%20dispenser%2C%20contemporary%20office%20environment&width=600&height=800&seq=machine-snack-004&orientation=portrait'
    ],
    capacity: {
      spirals: 40,
      totalProducts: '300-350 produits',
      compartments: '10 plateaux de 4 spirales',
      maxProductHeight: '18 cm'
    },
    specifications: {
      dimensions: 'H: 185 cm × L: 95 cm × P: 85 cm',
      weight: '280 kg',
      power: '350W - 220V',
      temperature: 'Température ambiante (version réfrigérée disponible)',
      glass: 'Double vitrage anti-effraction',
      lighting: 'LED haute efficacité'
    },
    features: [
      'Écran tactile 12 pouces haute définition',
      'Paiement Wave, Orange Money, carte et espèces',
      'Spirales ajustables pour tous formats de produits',
      'Système anti-vol par détection infrarouge',
      'Distributeur de tickets de caisse',
      'Éclairage LED adaptatif selon luminosité ambiante',
      'Gestion des stocks en temps réel',
      'Alertes de niveau bas automatiques',
      'Serrure électronique sécurisée',
      'Garantie 3 ans avec maintenance incluse'
    ],
    paymentMethods: ['wave', 'orange', 'carte', 'especes'],
    idealFor: ['Entreprises de toutes tailles', 'Écoles et universités', 'Gares et aéroports', 'Centres sportifs'],
    maintenanceIncluded: true,
    deliveryTime: '7-10 jours ouvrés',
    stock: 'En stock'
  },
  {
    id: 'sma-fresh-drink-250',
    name: 'SMA Fresh Drink 250',
    slug: 'sma-fresh-drink-250',
    type: 'boissons',
    category: 'Distributeur de Boissons',
    price: 2950000,
    priceDisplay: '2 950 000 FCFA',
    badge: '',
    shortDescription: 'Distributeur de boissons réfrigérées avec système éco-énergétique',
    description: 'Le SMA Fresh Drink 250 maintient vos boissons à la température idéale grâce à son système de réfrigération nouvelle génération. Avec une capacité de 250 canettes et bouteilles, il répond aux besoins des environnements à fort trafic. Son compresseur écologique réduit la consommation électrique de 40%.',
    image: 'https://readdy.ai/api/search-image?query=modern%20refrigerated%20beverage%20vending%20machine%20with%20glass%20door%2C%20illuminated%20interior%20showing%20cold%20drinks%20and%20bottles%2C%20sleek%20professional%20design%2C%20contemporary%20style%2C%20energy%20efficient&width=600&height=800&seq=machine-drink-001&orientation=portrait',
    gallery: [
      'https://readdy.ai/api/search-image?query=modern%20refrigerated%20beverage%20vending%20machine%20with%20glass%20door%2C%20illuminated%20interior%20showing%20cold%20drinks%20and%20bottles%2C%20sleek%20professional%20design%2C%20contemporary%20style%2C%20energy%20efficient&width=600&height=800&seq=machine-drink-001&orientation=portrait',
      'https://readdy.ai/api/search-image?query=beverage%20vending%20machine%20interior%20view%2C%20organized%20shelves%20with%20variety%20of%20cold%20drinks%20cans%20and%20bottles%2C%20well-lit%20refrigerated%20display&width=600&height=800&seq=machine-drink-002&orientation=portrait',
      'https://readdy.ai/api/search-image?query=beverage%20vending%20machine%20digital%20payment%20interface%2C%20touchscreen%20with%20temperature%20display%2C%20modern%20UI%20design&width=600&height=800&seq=machine-drink-003&orientation=portrait',
      'https://readdy.ai/api/search-image?query=person%20taking%20cold%20drink%20from%20modern%20vending%20machine%2C%20professional%20workplace%20setting%2C%20contemporary%20office%20environment&width=600&height=800&seq=machine-drink-004&orientation=portrait'
    ],
    capacity: {
      cans: '180 canettes (33cl)',
      bottles: '70 bouteilles (50cl)',
      total: '250 unités',
      shelves: '8 niveaux réglables'
    },
    specifications: {
      dimensions: 'H: 183 cm × L: 90 cm × P: 88 cm',
      weight: '315 kg',
      power: '450W - 220V (mode éco: 180W)',
      cooling: 'Compresseur écologique R600a',
      temperature: '2°C à 8°C réglable',
      efficiency: 'Classe énergétique A++'
    },
    features: [
      'Système de réfrigération éco-énergétique',
      'Écran tactile 10 pouces avec indicateur de température',
      'Paiement Wave, Orange Money, carte bancaire et espèces',
      'Double vitrage isolant pour économie d\'énergie',
      'Éclairage LED automatique avec détecteur de présence',
      'Mode veille intelligent hors heures de bureau',
      'Système de dégivrage automatique',
      'Alarme de température haute',
      'Connexion cloud pour monitoring',
      'Garantie 2 ans avec maintenance préventive'
    ],
    paymentMethods: ['wave', 'orange', 'carte', 'especes'],
    idealFor: ['Bureaux et espaces de coworking', 'Salles de sport', 'Cliniques', 'Ateliers et usines'],
    maintenanceIncluded: true,
    deliveryTime: '5-7 jours ouvrés',
    stock: 'En stock'
  },
  {
    id: 'sma-combo-pro-500',
    name: 'SMA Combo Pro 500',
    slug: 'sma-combo-pro-500',
    type: 'combine',
    category: 'Distributeur Combiné',
    price: 5200000,
    priceDisplay: '5 200 000 FCFA',
    badge: 'Populaire',
    shortDescription: 'Solution tout-en-un : café, snacks et boissons dans une seule machine',
    description: 'Le SMA Combo Pro 500 est notre solution premium qui combine café, snacks et boissons réfrigérées dans une seule machine élégante. Idéal pour optimiser l\'espace tout en offrant une gamme complète de produits. Avec sa capacité totale de 500 articles et ses systèmes de paiement intégrés, c\'est le choix des grandes entreprises.',
    image: 'https://readdy.ai/api/search-image?query=large%20premium%20combination%20vending%20machine%2C%20modern%20design%20with%20multiple%20sections%20for%20coffee%20snacks%20and%20cold%20drinks%2C%20professional%20quality%2C%20sophisticated%20appearance%2C%20corporate%20environment&width=600&height=800&seq=machine-combo-001&orientation=portrait',
    gallery: [
      'https://readdy.ai/api/search-image?query=large%20premium%20combination%20vending%20machine%2C%20modern%20design%20with%20multiple%20sections%20for%20coffee%20snacks%20and%20cold%20drinks%2C%20professional%20quality%2C%20sophisticated%20appearance%2C%20corporate%20environment&width=600&height=800&seq=machine-combo-001&orientation=portrait',
      'https://readdy.ai/api/search-image?query=combination%20vending%20machine%20coffee%20section%2C%20professional%20coffee%20dispenser%20with%20digital%20interface%2C%20integrated%20in%20multi-function%20machine&width=600&height=800&seq=machine-combo-002&orientation=portrait',
      'https://readdy.ai/api/search-image?query=combination%20vending%20machine%20snacks%20section%2C%20glass%20display%20with%20illuminated%20shelves%20showing%20food%20products&width=600&height=800&seq=machine-combo-003&orientation=portrait',
      'https://readdy.ai/api/search-image?query=combination%20vending%20machine%20cold%20drinks%20section%2C%20refrigerated%20compartment%20with%20beverages%2C%20modern%20display&width=600&height=800&seq=machine-combo-004&orientation=portrait'
    ],
    capacity: {
      coffee: '150 gobelets + 2kg café',
      snacks: '200 produits sur 30 spirales',
      drinks: '150 canettes/bouteilles',
      total: '500+ produits'
    },
    specifications: {
      dimensions: 'H: 190 cm × L: 150 cm × P: 90 cm',
      weight: '520 kg',
      power: '3200W - 220V (pic) / 800W (moyen)',
      cooling: 'Zone réfrigérée 2-8°C',
      heating: 'Chaudière 8L pour café',
      zones: '3 zones indépendantes'
    },
    features: [
      'Écran tactile central 15 pouces haute résolution',
      'Système de paiement unifié Wave & Orange Money',
      'Accepte tous modes de paiement (mobile, carte, espèces)',
      'Zone café avec moulin intégré et 15 recettes',
      'Zone snacks avec 30 spirales ajustables',
      'Zone boissons réfrigérées avec compresseur silencieux',
      'Gestion centralisée des trois zones',
      'Télémétrie cloud pour suivi des ventes',
      'Maintenance prédictive par IA',
      'Design élégant avec finitions premium',
      'Garantie 3 ans toutes zones',
      'Installation et formation incluses'
    ],
    paymentMethods: ['wave', 'orange', 'carte', 'especes'],
    idealFor: ['Grandes entreprises 200+ employés', 'Centres commerciaux', 'Hôpitaux et cliniques', 'Universités et campus'],
    maintenanceIncluded: true,
    deliveryTime: '10-14 jours ouvrés',
    stock: 'Stock limité'
  },
  {
    id: 'sma-cafe-compact-80',
    name: 'SMA Café Compact 80',
    slug: 'sma-cafe-compact-80',
    type: 'cafe',
    category: 'Distributeur de Café',
    price: 1850000,
    priceDisplay: '1 850 000 FCFA',
    badge: '',
    shortDescription: 'Distributeur de café compact idéal pour petits espaces et PME',
    description: 'Le SMA Café Compact 80 offre toute la qualité d\'un café professionnel dans un format réduit. Parfait pour les PME, petits bureaux et commerces, il propose 8 boissons chaudes différentes et accepte tous les modes de paiement modernes malgré sa taille compacte.',
    image: 'https://readdy.ai/api/search-image?query=compact%20modern%20coffee%20vending%20machine%2C%20small%20footprint%20design%2C%20professional%20quality%2C%20sleek%20contemporary%20appearance%2C%20space-saving%20unit%2C%20digital%20interface&width=600&height=800&seq=machine-compact-001&orientation=portrait',
    gallery: [
      'https://readdy.ai/api/search-image?query=compact%20modern%20coffee%20vending%20machine%2C%20small%20footprint%20design%2C%20professional%20quality%2C%20sleek%20contemporary%20appearance%2C%20space-saving%20unit%2C%20digital%20interface&width=600&height=800&seq=machine-compact-001&orientation=portrait',
      'https://readdy.ai/api/search-image?query=compact%20coffee%20machine%20digital%20interface%20close-up%2C%20modern%20touchscreen%20with%20beverage%20options%2C%20small%20machine%20control%20panel&width=600&height=800&seq=machine-compact-002&orientation=portrait',
      'https://readdy.ai/api/search-image?query=compact%20coffee%20vending%20machine%20in%20small%20office%20space%2C%20fitting%20perfectly%20in%20corner%2C%20professional%20workplace%20setting&width=600&height=800&seq=machine-compact-003&orientation=portrait',
      'https://readdy.ai/api/search-image?query=person%20using%20small%20coffee%20vending%20machine%2C%20dispensing%20hot%20beverage%20in%20compact%20office%20environment&width=600&height=800&seq=machine-compact-004&orientation=portrait'
    ],
    capacity: {
      cups: 80,
      waterTank: '4 litres',
      beanContainer: '1 kg',
      wasteContainer: '40 dosettes'
    },
    specifications: {
      dimensions: 'H: 150 cm × L: 50 cm × P: 60 cm',
      weight: '75 kg',
      power: '1800W - 220V',
      waterConnection: 'Réservoir autonome uniquement',
      drinksPerMinute: '6-8 boissons/minute',
      selections: '8 boissons chaudes'
    },
    features: [
      'Écran tactile 7 pouces',
      'Paiement Wave & Orange Money',
      'Accepte cartes et espèces',
      'Moulin à café céramique silencieux',
      'Nettoyage automatique quotidien',
      'Design compact gain de place',
      'Consommation électrique réduite',
      'Installation sans travaux',
      'Garantie 2 ans',
      'Idéal pour 10-50 personnes'
    ],
    paymentMethods: ['wave', 'orange', 'carte', 'especes'],
    idealFor: ['PME 10-50 employés', 'Petits commerces', 'Cabinets professionnels', 'Startups'],
    maintenanceIncluded: true,
    deliveryTime: '3-5 jours ouvrés',
    stock: 'En stock'
  },
  {
    id: 'sma-snack-eco-150',
    name: 'SMA Snack Eco 150',
    slug: 'sma-snack-eco-150',
    type: 'snacks',
    category: 'Distributeur de Snacks',
    price: 1950000,
    priceDisplay: '1 950 000 FCFA',
    badge: '',
    shortDescription: 'Distributeur de snacks entrée de gamme au meilleur rapport qualité-prix',
    description: 'Le SMA Snack Eco 150 est notre solution économique sans compromis sur la qualité. Avec ses 24 spirales et sa capacité de 150 produits, il convient parfaitement aux petites et moyennes structures. Son système de paiement mobile intégré le rend accessible à tous.',
    image: 'https://readdy.ai/api/search-image?query=economical%20snack%20vending%20machine%20with%20glass%20front%2C%20affordable%20professional%20design%2C%20compact%20size%2C%20modern%20appearance%2C%20illuminated%20interior%20with%20snacks%20display&width=600&height=800&seq=machine-eco-001&orientation=portrait',
    gallery: [
      'https://readdy.ai/api/search-image?query=economical%20snack%20vending%20machine%20with%20glass%20front%2C%20affordable%20professional%20design%2C%20compact%20size%2C%20modern%20appearance%2C%20illuminated%20interior%20with%20snacks%20display&width=600&height=800&seq=machine-eco-001&orientation=portrait',
      'https://readdy.ai/api/search-image?query=economical%20snack%20machine%20interior%2C%20organized%20spiral%20shelves%20with%20food%20products%2C%20simple%20but%20effective%20display&width=600&height=800&seq=machine-eco-002&orientation=portrait',
      'https://readdy.ai/api/search-image?query=economical%20vending%20machine%20payment%20panel%2C%20basic%20digital%20interface%20with%20mobile%20payment%20support&width=600&height=800&seq=machine-eco-003&orientation=portrait',
      'https://readdy.ai/api/search-image?query=person%20using%20economical%20snack%20vending%20machine%20in%20small%20office%2C%20affordable%20solution%20for%20workplace&width=600&height=800&seq=machine-eco-004&orientation=portrait'
    ],
    capacity: {
      spirals: 24,
      totalProducts: '120-150 produits',
      compartments: '6 plateaux de 4 spirales',
      maxProductHeight: '16 cm'
    },
    specifications: {
      dimensions: 'H: 175 cm × L: 75 cm × P: 75 cm',
      weight: '180 kg',
      power: '250W - 220V',
      temperature: 'Température ambiante',
      glass: 'Simple vitrage trempé',
      lighting: 'LED économique'
    },
    features: [
      'Écran LCD 7 pouces',
      'Paiement Wave et Orange Money',
      'Accepte espèces et cartes',
      'Spirales réglables',
      'Détection de distribution',
      'Consommation basse',
      'Installation rapide',
      'Maintenance simplifiée',
      'Garantie 1 an',
      'Excellent rapport qualité-prix'
    ],
    paymentMethods: ['wave', 'orange', 'carte', 'especes'],
    idealFor: ['Petites entreprises', 'Écoles', 'Associations', 'Petits commerces'],
    maintenanceIncluded: false,
    deliveryTime: '3-5 jours ouvrés',
    stock: 'En stock'
  }
];