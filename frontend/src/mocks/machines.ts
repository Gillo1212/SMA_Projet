export const machineTypes = [
  { id: 'all', name: 'Tous les types' },
  { id: 'distributeur', name: 'Distributeurs Automatiques' },
  { id: 'cafe', name: 'Machines à Café' },
  { id: 'combine', name: 'Distributeurs Combinés' },
  { id: 'frigo', name: 'Équipements Frigorifiques' }
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
  // ── Machines à Café ───────────────────────────────────────────
  {
    id: 'tcn-ncf-7n-v22',
    name: 'TCN Machine à Café Commerciale',
    slug: 'tcn-ncf-7n-v22',
    type: 'cafe',
    category: 'Machine à Café',
    brand: 'TCN',
    modelRef: 'TCN-NCF-7N(V22)',
    badge: 'Populaire',
    shortDescription: 'Machine à café professionnelle haute capacité – 20 boissons, 160 gobelets',
    description: 'La TCN-NCF-7N(V22) est une machine à café commerciale conçue pour les environnements à fort trafic. Elle propose 20 variétés de boissons chaudes avec un système de mouture fraîche intégré. Sa chaudière haute performance maintient une température constante de 92°C pour un café d\'exception. Idéale pour les grandes entreprises, hôtels et centres commerciaux.',
    image: '/images/machines/sen-coffee-distributeur-cafe-grains/1.webp',
    gallery: [
      '/images/machines/sen-coffee-distributeur-cafe-grains/1.webp',
      '/images/machines/sen-coffee-distributeur-cafe-grains/2.webp',
      '/images/machines/sen-coffee-distributeur-cafe-grains/3.webp',
      '/images/machines/sen-coffee-distributeur-cafe-grains/4.webp'
    ],
    specifications: {
      dimensions: 'H: 194 cm × L: 73,5 cm × P: 79 cm',
      weight: '220 kg',
      temperature: '92°C',
      capacity: '160 gobelets',
      beverages: '20 boissons chaudes',
      display: 'Écran tactile couleur'
    },
    features: [
      'Mouture fraîche de grains à chaque café',
      '20 variétés de boissons chaudes',
      'Chaudière haute pression 92°C',
      '160 gobelets – grande autonomie',
      'Paiement Wave, Orange Money, carte et espèces',
      'Écran tactile couleur',
      'Connexion télémétrie à distance',
      'Nettoyage automatique programmable',
      'Certifications CE, CB, ISO9001',
      'Compatible MDB/DEX'
    ],
    paymentMethods: ['wave', 'orange', 'carte', 'especes'],
    idealFor: ['Grandes entreprises 200+ employés', 'Hôtels & Restaurants', 'Centres commerciaux', 'Hôpitaux & Cliniques'],
    maintenanceIncluded: true,
    deliveryTime: '7-14 jours ouvrés',
    stock: 'Sur commande'
  },
  {
    id: 'tcn-ncf-4n-v10',
    name: 'TCN Mini Machine à Café',
    slug: 'tcn-ncf-4n-v10',
    type: 'cafe',
    category: 'Machine à Café',
    brand: 'TCN',
    modelRef: 'TCN-NCF-4N(V10.1)',
    badge: 'Compact',
    shortDescription: 'Machine à café compacte avec mouture fraîche – idéale pour PME',
    description: 'La TCN-NCF-4N(V10.1) est la solution idéale pour les espaces réduits sans compromis sur la qualité. Malgré son format compact, elle intègre un système de mouture fraîche et 4 conteneurs d\'ingrédients pour une diversité de boissons chaudes. Puissance de pointe 3000W pour une chauffe rapide.',
    image: '/images/machines/lecon-machine-cafe-instantane/1.webp',
    gallery: [
      '/images/machines/lecon-machine-cafe-instantane/1.webp',
      '/images/machines/lecon-machine-cafe-instantane/2.webp',
      '/images/machines/lecon-machine-cafe-instantane/3.webp',
      '/images/machines/lecon-machine-cafe-instantane/4.webp'
    ],
    specifications: {
      dimensions: 'H: 81 cm × L: 50 cm × P: 45 cm',
      temperature: '92°C',
      power: '3000W (pointe)',
      containers: '4 conteneurs d\'ingrédients',
      display: 'Écran 10" couleur',
      installation: 'Sans travaux – pose libre'
    },
    features: [
      'Format ultra-compact gain de place',
      'Mouture fraîche de grains intégrée',
      '4 conteneurs d\'ingrédients',
      'Chauffe rapide 3000W',
      'Température de brassage 92°C',
      'Paiement Wave, Orange Money, carte et espèces',
      'Installation sans travaux',
      'Nettoyage simplifié',
      'Certifications CE, CB, ISO9001'
    ],
    paymentMethods: ['wave', 'orange', 'carte', 'especes'],
    idealFor: ['PME 10-50 employés', 'Cabinets professionnels', 'Startups', 'Petits commerces'],
    maintenanceIncluded: true,
    deliveryTime: '5-10 jours ouvrés',
    stock: 'Sur commande'
  },

  // ── Distributeurs Automatiques ────────────────────────────────
  {
    id: 'tcn-csc-10g-h5',
    name: 'TCN Distributeur Snack & Boissons Standard',
    slug: 'tcn-csc-10g-h5',
    type: 'distributeur',
    category: 'Distributeur Automatique',
    brand: 'TCN',
    modelRef: 'TCN-CSC-10G(H5)',
    badge: 'Best-seller',
    shortDescription: 'Distributeur snack & boissons 60 spirales / 300 bouteilles – réfrigéré 2-25°C',
    description: 'Le TCN-CSC-10G(H5) est le distributeur automatique polyvalent par excellence. Il combine 60 emplacements snacks avec un compartiment boissons de 300 bouteilles, le tout maintenu à une température idéale entre 2 et 25°C. Son écran LED 5 pouces et sa puissance de réfrigération de 422W en font le choix numéro un pour les entreprises et lieux publics.',
    image: '/images/machines/nexx-distributeur-snacks-boissons/1.webp',
    gallery: [
      '/images/machines/nexx-distributeur-snacks-boissons/1.webp',
      '/images/machines/nexx-distributeur-snacks-boissons/2.webp',
      '/images/machines/nexx-distributeur-snacks-boissons/3.webp',
      '/images/machines/nexx-distributeur-snacks-boissons/4.webp'
    ],
    specifications: {
      dimensions: 'H: 194 cm × L: 103,6 cm × P: 79 cm',
      weight: '261 kg',
      capacitySnack: '60 emplacements spirales',
      capacityDrink: '300 bouteilles / canettes',
      display: 'Écran LED 5"',
      power: '422W (réfrigération)',
      temperature: '2°C à 25°C réglable',
      certifications: 'CE, CB, ISO9001'
    },
    features: [
      '60 emplacements snacks + 300 boissons',
      'Réfrigération intégrée 2–25°C',
      'Écran LED 5 pouces',
      'Paiement Wave, Orange Money, carte, espèces et QR code',
      'Spirales ajustables pour tous formats',
      'Éclairage LED haute efficacité',
      'Télémétrie cloud et gestion des stocks',
      'Certificats CE, CB, ISO9001, SGS',
      'Interface MDB/DEX standard',
      'Garantie constructeur'
    ],
    paymentMethods: ['wave', 'orange', 'carte', 'especes'],
    idealFor: ['Entreprises 50-200 employés', 'Centres commerciaux', 'Gares & Aéroports', 'Hôpitaux'],
    maintenanceIncluded: true,
    deliveryTime: '7-14 jours ouvrés',
    stock: 'Sur commande'
  },
  {
    id: 'tcn-csc-6g-h5',
    name: 'TCN Distributeur Snack & Boissons Compact',
    slug: 'tcn-csc-6g-h5',
    type: 'distributeur',
    category: 'Distributeur Automatique',
    brand: 'TCN',
    modelRef: 'TCN-CSC-6G(H5)',
    badge: '',
    shortDescription: 'Distributeur snack & boissons format slim – 36 spirales / 180 bouteilles',
    description: 'Le TCN-CSC-6G(H5) offre la même technologie que son grand frère dans un format plus étroit, idéal pour les espaces contraints. Avec 36 emplacements snacks et 180 boissons réfrigérées, il convient parfaitement aux PME, salles d\'attente et petits espaces communs.',
    image: '/images/machines/sapoe-avm/1.webp',
    gallery: [
      '/images/machines/sapoe-avm/1.webp',
      '/images/machines/sapoe-avm/2.webp',
      '/images/machines/sapoe-avm/3.webp',
      '/images/machines/sapoe-avm/4.webp'
    ],
    specifications: {
      dimensions: 'H: 194 cm × L: 73,2 cm × P: 79 cm',
      weight: '261 kg',
      capacitySnack: '36 emplacements spirales',
      capacityDrink: '180 bouteilles / canettes',
      display: 'Écran LED 5"',
      power: '422W (réfrigération)',
      temperature: '2°C à 25°C réglable',
      certifications: 'CE, CB, ISO9001'
    },
    features: [
      'Format slim – faible encombrement',
      '36 emplacements snacks + 180 boissons',
      'Réfrigération intégrée 2–25°C',
      'Écran LED 5 pouces',
      'Paiement Wave, Orange Money, carte et espèces',
      'Spirales ajustables multi-formats',
      'Éclairage LED économique',
      'Gestion des stocks en temps réel',
      'Certifications CE, CB, ISO9001'
    ],
    paymentMethods: ['wave', 'orange', 'carte', 'especes'],
    idealFor: ['PME 20-100 employés', 'Salles d\'attente', 'Cliniques', 'Petits centres commerciaux'],
    maintenanceIncluded: true,
    deliveryTime: '7-14 jours ouvrés',
    stock: 'Sur commande'
  },
  {
    id: 'tcn-csc-10c-32v',
    name: 'TCN Distributeur Grand Écran 32"',
    slug: 'tcn-csc-10c-32v',
    type: 'distributeur',
    category: 'Distributeur Automatique',
    brand: 'TCN',
    modelRef: 'TCN-CSC-10C(32V)',
    badge: 'Nouveau',
    shortDescription: 'Distributeur snack & boissons avec grand écran 32" – expérience premium',
    description: 'Le TCN-CSC-10C(32V) redéfinit l\'expérience distributeur grâce à son imposant écran de 32 pouces. Interface intuitive, catalogue produit visuel et publicités en temps réel font de cette machine un outil marketing autant qu\'un distributeur. Capacité identique au modèle standard : 60 spirales et 300 boissons réfrigérées.',
    image: '/images/machines/lecon-good-taste-50s/1.webp',
    gallery: [
      '/images/machines/lecon-good-taste-50s/1.webp',
      '/images/machines/lecon-good-taste-50s/2.webp',
      '/images/machines/lecon-good-taste-50s/3.webp',
      '/images/machines/lecon-good-taste-50s/4.webp'
    ],
    specifications: {
      dimensions: 'H: 194,5 cm × L: 143 cm × P: 79 cm',
      weight: '300 kg',
      capacitySnack: '60 emplacements spirales',
      capacityDrink: '300 bouteilles / canettes',
      display: 'Écran 32"',
      power: '422W (réfrigération)',
      temperature: '2°C à 25°C réglable',
      certifications: 'CE, CB, ISO9001'
    },
    features: [
      'Grand écran 32" – interface visuelle immersive',
      '60 emplacements snacks + 300 boissons',
      'Réfrigération intégrée 2–25°C',
      'Affichage publicitaire et promotionnel',
      'Paiement Wave, Orange Money, carte et espèces',
      'Navigation par catalogue produit',
      'Gestion de contenu à distance',
      'Certifications CE, CB, ISO9001, SGS',
      'Interface MDB/DEX standard'
    ],
    paymentMethods: ['wave', 'orange', 'carte', 'especes'],
    idealFor: ['Centres commerciaux', 'Aéroports & Gares', 'Hôtels & Lobbies', 'Grandes entreprises'],
    maintenanceIncluded: true,
    deliveryTime: '7-14 jours ouvrés',
    stock: 'Sur commande'
  },
  {
    id: 'tcn-csc-8c-50sp',
    name: 'TCN Distributeur Tactile Publicitaire 49"',
    slug: 'tcn-csc-8c-50sp',
    type: 'distributeur',
    category: 'Distributeur Automatique',
    brand: 'TCN',
    modelRef: 'TCN-CSC-8C(50SP)',
    badge: 'Premium',
    shortDescription: 'Distributeur snack & boissons avec écran tactile 49" et affichage publicitaire',
    description: 'Le TCN-CSC-8C(50SP) est le fleuron de la gamme distributeurs publicitaires. Son imposant écran tactile de 49 pouces transforme chaque interaction en expérience de marque. Interface de commande intuitive, diffusion de contenus publicitaires HD, et technologie de vente avancée – tout en assurant la distribution de 48 snacks et 240 boissons réfrigérées.',
    image: '/images/machines/sen-coffee-distributeur-cafe-grains/1.webp',
    gallery: [
      '/images/machines/sen-coffee-distributeur-cafe-grains/1.webp',
      '/images/machines/sen-coffee-distributeur-cafe-grains/2.webp',
      '/images/machines/sen-coffee-distributeur-cafe-grains/3.webp',
      '/images/machines/sen-coffee-distributeur-cafe-grains/4.webp'
    ],
    specifications: {
      dimensions: 'H: 196 cm × L: 104,2 cm × P: 89 cm',
      weight: '320 kg',
      capacitySnack: '48 emplacements spirales',
      capacityDrink: '240 bouteilles / canettes',
      display: 'Écran tactile 49"',
      power: '458W (réfrigération)',
      temperature: '4°C à 25°C réglable',
      certifications: 'CE, CB, ISO9001'
    },
    features: [
      'Écran tactile 49" – expérience premium',
      '48 emplacements snacks + 240 boissons',
      'Réfrigération intégrée 4–25°C',
      'Diffusion de publicités et promotions HD',
      'Interface tactile intuitive',
      'Paiement Wave, Orange Money, NFC, carte et espèces',
      'Gestion de contenu publicitaire à distance',
      'Analyse comportementale des achats',
      'Certifications CE, CB, ISO9001, SGS'
    ],
    paymentMethods: ['wave', 'orange', 'carte', 'especes'],
    idealFor: ['Centres commerciaux premium', 'Aéroports internationaux', 'Hôtels 4-5 étoiles', 'Grandes surfaces'],
    maintenanceIncluded: true,
    deliveryTime: '10-14 jours ouvrés',
    stock: 'Sur commande'
  },

  // ── Distributeur Combiné ──────────────────────────────────────
  {
    id: 'tcn-60g-c4',
    name: 'TCN Distributeur Combiné Snack + Boissons + Café',
    slug: 'tcn-60g-c4',
    type: 'combine',
    category: 'Distributeur Combiné',
    brand: 'TCN',
    modelRef: 'TCN-60G-C4',
    badge: 'Tout-en-un',
    shortDescription: 'Solution 3-en-1 : café fraîchement moulu + snacks + boissons réfrigérées',
    description: 'Le TCN-60G-C4 est la solution tout-en-un ultime. Cette machine combine en un seul appareil un système de café fraîchement moulu (130 gobelets), 60 emplacements snacks et un compartiment boissons réfrigérées. Une seule machine pour couvrir tous les besoins, optimisant l\'espace et l\'investissement.',
    image: '/images/machines/lecon-machine-cafe-instantane/1.webp',
    gallery: [
      '/images/machines/lecon-machine-cafe-instantane/1.webp',
      '/images/machines/lecon-machine-cafe-instantane/2.webp',
      '/images/machines/lecon-machine-cafe-instantane/3.webp',
      '/images/machines/lecon-machine-cafe-instantane/4.webp'
    ],
    specifications: {
      dimensions: 'H: 194 cm × L: 140 cm × P: 79 cm',
      weight: '920 kg',
      capacitySnack: '60 emplacements spirales',
      capacityCoffee: '130 gobelets café',
      powerHeating: '1800W (chauffe café)',
      powerCooling: '505W (réfrigération)',
      certifications: 'CE, CB, ISO9001'
    },
    features: [
      'Café fraîchement moulu – 130 gobelets',
      '60 emplacements snacks toutes catégories',
      'Compartiment boissons réfrigérées intégré',
      'Paiement unifié Wave, Orange Money, carte et espèces',
      'Gestion centralisée des 3 zones',
      'Télémétrie et suivi des ventes en temps réel',
      'Économie d\'espace maximale',
      'Certifications CE, CB, ISO9001, SGS',
      'Interface MDB/DEX standard'
    ],
    paymentMethods: ['wave', 'orange', 'carte', 'especes'],
    idealFor: ['Grandes entreprises 200+ employés', 'Campus universitaires', 'Centres commerciaux', 'Espaces publics polyvalents'],
    maintenanceIncluded: true,
    deliveryTime: '10-14 jours ouvrés',
    stock: 'Sur commande'
  },

  // ── Équipements Frigorifiques ─────────────────────────────────
  {
    id: 'tcn-cfz-510l',
    name: 'TCN Smart Fridge Réfrigérée 24h',
    slug: 'tcn-cfz-510l',
    type: 'frigo',
    category: 'Équipement Frigorifique',
    brand: 'TCN',
    modelRef: 'TCN-CFZ-510L',
    badge: '24h/24',
    shortDescription: 'Réfrigérateur intelligent 510L en libre-service 24h/24 – jusqu\'à 200 bouteilles',
    description: 'Le TCN-CFZ-510L est un réfrigérateur intelligent connecté accessible 24h/24. Avec sa capacité de 510 litres et sa plage de température 0–10°C, il maintient vos boissons à la fraîcheur optimale. Son système de paiement intégré et sa gestion à distance en font le choix idéal pour les commerces de proximité, hôtels et espaces connectés.',
    image: '/images/machines/nexx-distributeur-snacks-boissons/1.webp',
    gallery: [
      '/images/machines/nexx-distributeur-snacks-boissons/1.webp',
      '/images/machines/nexx-distributeur-snacks-boissons/2.webp',
      '/images/machines/nexx-distributeur-snacks-boissons/3.webp',
      '/images/machines/nexx-distributeur-snacks-boissons/4.webp'
    ],
    specifications: {
      dimensions: 'H: 210 cm × L: 65 cm × P: 69 cm',
      weight: '140 kg',
      capacity: '510 L / ~200 bouteilles',
      temperature: '0°C à 10°C',
      access: 'Libre-service 24h/24',
      certifications: 'CE, CB, ISO9001'
    },
    features: [
      '510 litres – grande capacité de stockage',
      'Température 0–10°C constante',
      'Accès libre-service 24h/24',
      'Paiement Wave, Orange Money, NFC et carte',
      'Porte vitrée illuminée – visibilité produits',
      'Gestion et monitoring à distance',
      'Alerte température et niveau de stock',
      'Format slim – faible encombrement',
      'Certifications CE, CB, ISO9001'
    ],
    paymentMethods: ['wave', 'orange', 'carte', 'especes'],
    idealFor: ['Hôtels & Résidences', 'Commerces de proximité', 'Pharmacies', 'Salles de sport'],
    maintenanceIncluded: true,
    deliveryTime: '7-14 jours ouvrés',
    stock: 'Sur commande'
  },
  {
    id: 'tcn-cfz-1200-v10',
    name: 'TCN Smart Cooler Grande Capacité',
    slug: 'tcn-cfz-1200-v10',
    type: 'frigo',
    category: 'Équipement Frigorifique',
    brand: 'TCN',
    modelRef: 'TCN-CFZ-1200(V10)',
    badge: '',
    shortDescription: 'Réfrigérateur intelligent grande capacité – 5 étagères, 3 kWh/j, 0-10°C',
    description: 'Le TCN-CFZ-1200(V10) est le réfrigérateur intelligent pour les volumes importants. Avec ses 5 étagères de 30 plateaux chacune, il offre une capacité exceptionnelle pour les grandes surfaces et supermarchés. Sa consommation optimisée de 3 kWh/jour et son système de gestion multi-systèmes IA en font une solution économique et performante.',
    image: '/images/machines/sapoe-avm/1.webp',
    gallery: [
      '/images/machines/sapoe-avm/1.webp',
      '/images/machines/sapoe-avm/2.webp',
      '/images/machines/sapoe-avm/3.webp',
      '/images/machines/sapoe-avm/4.webp'
    ],
    specifications: {
      dimensions: 'H: 212 cm × L: 126,5 cm × P: 71,5 cm',
      weight: '180 kg',
      capacity: '5 étagères / 30 plateaux',
      temperature: '0°C à 10°C',
      consumption: '3,0 kWh/jour',
      certifications: 'CE, CB, ISO9001'
    },
    features: [
      '5 étagères – 30 plateaux de grande capacité',
      'Température 0–10°C maintenue',
      'Consommation optimisée 3 kWh/jour',
      'Système IA multi-capteurs',
      'Paiement Wave, Orange Money, NFC et carte',
      'Monitoring et gestion à distance',
      'Alertes stock et maintenance prédictive',
      'Éclairage LED basse consommation',
      'Certifications CE, CB, ISO9001'
    ],
    paymentMethods: ['wave', 'orange', 'carte', 'especes'],
    idealFor: ['Grandes surfaces & Supermarchés', 'Centres commerciaux', 'Hôtels grande capacité', 'Cantines & Restaurants'],
    maintenanceIncluded: true,
    deliveryTime: '10-14 jours ouvrés',
    stock: 'Sur commande'
  }
];
