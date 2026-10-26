export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'Café & Poudres' | 'Snacks' | 'Boissons';
  brand: string;
  price: number;
  format: string;
  taste?: string;
  compatibility: string[];
  stock: number;
  isAvailable: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  images: string[];
  description: string;
  ingredients: string;
  allergens: string;
  volumeDiscounts: {
    quantity: number;
    discount: number;
  }[];
  relatedProducts: string[];
  weight?: string;
}

export const products: Product[] = [
  // Café & Poudres
  {
    id: 'cafe-arabica-premium',
    sku: 'CAF-001',
    name: 'Café Arabica Premium',
    category: 'Café & Poudres',
    brand: 'Nescafé',
    price: 12500,
    format: 'Sachet 500g',
    taste: 'Corsé',
    compatibility: ['Smart Café Pro', 'Espresso Master 3000'],
    stock: 150,
    isAvailable: true,
    isPopular: true,
    images: [
      'https://readdy.ai/api/search-image?query=Premium%20arabica%20coffee%20powder%20bag%20on%20clean%20white%20surface%20with%20coffee%20beans%20scattered%20around%2C%20professional%20product%20photography%2C%20bright%20lighting%2C%20high%20quality%20packaging%20design%2C%20modern%20minimalist%20aesthetic%2C%20commercial%20product%20shot&width=800&height=800&seq=001&orientation=squarish',
      'https://readdy.ai/api/search-image?query=Close%20up%20of%20rich%20dark%20brown%20arabica%20coffee%20powder%20texture%20in%20white%20ceramic%20bowl%2C%20macro%20photography%2C%20studio%20lighting%2C%20premium%20quality%20coffee%20grounds&width=800&height=800&seq=002&orientation=squarish'
    ],
    description: 'Notre café Arabica Premium est soigneusement sélectionné dans les meilleures plantations d\'Amérique du Sud. Son arôme intense et son goût corsé en font le choix parfait pour les amateurs de café authentique. Torréfaction artisanale pour préserver tous les arômes.',
    ingredients: '100% café Arabica pur',
    allergens: 'Aucun',
    volumeDiscounts: [
      { quantity: 10, discount: 10 },
      { quantity: 20, discount: 15 },
      { quantity: 50, discount: 20 }
    ],
    relatedProducts: ['cafe-robusta-intense', 'chocolat-chaud-premium'],
    weight: '500g'
  },
  {
    id: 'cafe-robusta-intense',
    sku: 'CAF-002',
    name: 'Café Robusta Intense',
    category: 'Café & Poudres',
    brand: 'Lavazza',
    price: 11000,
    format: 'Sachet 500g',
    taste: 'Intense',
    compatibility: ['Smart Café Pro', 'Espresso Master 3000', 'Compact Snack Plus'],
    stock: 200,
    isAvailable: true,
    isNew: true,
    images: [
      'https://readdy.ai/api/search-image?query=Premium%20robusta%20coffee%20powder%20package%20on%20white%20background%2C%20intense%20dark%20roast%2C%20professional%20product%20photography%2C%20modern%20packaging%20design%2C%20studio%20lighting%2C%20commercial%20quality&width=800&height=800&seq=003&orientation=squarish'
    ],
    description: 'Un café robusta au caractère bien trempé, idéal pour ceux qui recherchent un expresso puissant et énergisant. Cultivé en Afrique et en Asie, ce café offre une crème onctueuse et une amertume équilibrée.',
    ingredients: '100% café Robusta',
    allergens: 'Aucun',
    volumeDiscounts: [
      { quantity: 10, discount: 10 },
      { quantity: 25, discount: 15 }
    ],
    relatedProducts: ['cafe-arabica-premium', 'cappuccino-vanille'],
    weight: '500g'
  },
  {
    id: 'chocolat-chaud-premium',
    sku: 'POW-001',
    name: 'Chocolat Chaud Premium',
    category: 'Café & Poudres',
    brand: 'Nestlé',
    price: 9500,
    format: 'Boîte 1kg',
    taste: 'Chocolat',
    compatibility: ['Smart Café Pro', 'Compact Snack Plus'],
    stock: 120,
    isAvailable: true,
    images: [
      'https://readdy.ai/api/search-image?query=Premium%20hot%20chocolate%20powder%20tin%20container%20on%20white%20surface%2C%20rich%20chocolate%20color%2C%20professional%20product%20photography%2C%20modern%20packaging%2C%20studio%20lighting%2C%20commercial%20shot&width=800&height=800&seq=004&orientation=squarish'
    ],
    description: 'Une poudre de chocolat chaud onctueuse et gourmande, parfaite pour les pauses réconfortantes. Fabriquée avec du cacao de qualité supérieure, elle se dissout facilement et offre une texture veloutée.',
    ingredients: 'Sucre, cacao en poudre (25%), lait écrémé en poudre, émulsifiant (lécithine de soja)',
    allergens: 'Lait, soja. Peut contenir des traces de fruits à coque',
    volumeDiscounts: [
      { quantity: 12, discount: 12 },
      { quantity: 24, discount: 18 }
    ],
    relatedProducts: ['cappuccino-vanille', 'cafe-arabica-premium'],
    weight: '1kg'
  },
  {
    id: 'cappuccino-vanille',
    sku: 'POW-002',
    name: 'Cappuccino Vanille',
    category: 'Café & Poudres',
    brand: 'Carte Noire',
    price: 13000,
    format: 'Sachet 750g',
    taste: 'Vanille',
    compatibility: ['Smart Café Pro', 'Espresso Master 3000'],
    stock: 80,
    isAvailable: true,
    isPopular: true,
    images: [
      'https://readdy.ai/api/search-image?query=Vanilla%20cappuccino%20powder%20package%20on%20clean%20white%20background%2C%20creamy%20color%20packaging%2C%20professional%20product%20photography%2C%20modern%20design%2C%20studio%20lighting%2C%20commercial%20quality%20shot&width=800&height=800&seq=005&orientation=squarish'
    ],
    description: 'Un cappuccino onctueux aux notes délicates de vanille naturelle. Le mélange parfait de café, de lait et de vanille pour une pause gourmande et raffinée. Mousse légère garantie.',
    ingredients: 'Sucre, lait écrémé en poudre, café soluble (15%), arôme naturel de vanille, stabilisant',
    allergens: 'Lait. Peut contenir des traces de soja',
    volumeDiscounts: [
      { quantity: 8, discount: 10 },
      { quantity: 16, discount: 15 }
    ],
    relatedProducts: ['chocolat-chaud-premium', 'cafe-arabica-premium'],
    weight: '750g'
  },

  // Snacks
  {
    id: 'chips-sel-marin',
    sku: 'SNA-001',
    name: 'Chips Sel de Mer',
    category: 'Snacks',
    brand: 'Lay\'s',
    price: 1500,
    format: 'Sachet 45g',
    compatibility: ['Compact Snack Plus', 'Distributeur Universal XL'],
    stock: 350,
    isAvailable: true,
    isPopular: true,
    images: [
      'https://readdy.ai/api/search-image?query=Premium%20sea%20salt%20potato%20chips%20bag%20on%20white%20background%2C%20golden%20crispy%20chips%2C%20professional%20product%20photography%2C%20modern%20packaging%20design%2C%20studio%20lighting%2C%20commercial%20quality&width=800&height=800&seq=006&orientation=squarish'
    ],
    description: 'Des chips croustillantes parfaitement salées au sel de mer. Pommes de terre sélectionnées et frites à la perfection pour un goût authentique et irrésistible.',
    ingredients: 'Pommes de terre, huile de tournesol, sel de mer (1,5%)',
    allergens: 'Aucun',
    volumeDiscounts: [
      { quantity: 24, discount: 8 },
      { quantity: 48, discount: 12 },
      { quantity: 100, discount: 18 }
    ],
    relatedProducts: ['chips-paprika', 'biscuits-chocolat'],
    weight: '45g'
  },
  {
    id: 'chips-paprika',
    sku: 'SNA-002',
    name: 'Chips Paprika',
    category: 'Snacks',
    brand: 'Pringles',
    price: 2000,
    format: 'Tube 165g',
    compatibility: ['Compact Snack Plus', 'Distributeur Universal XL'],
    stock: 180,
    isAvailable: true,
    images: [
      'https://readdy.ai/api/search-image?query=Paprika%20flavored%20potato%20chips%20tube%20on%20white%20background%2C%20red%20colored%20packaging%2C%20professional%20product%20photography%2C%20modern%20design%2C%20studio%20lighting%2C%20commercial%20shot&width=800&height=800&seq=007&orientation=squarish'
    ],
    description: 'Des chips empilables au délicieux goût de paprika fumé. Forme parfaite et croquant incomparable pour des moments de partage savoureux.',
    ingredients: 'Pommes de terre déshydratées, huiles végétales, farine de blé, fécule de maïs, arôme paprika, sel',
    allergens: 'Gluten',
    volumeDiscounts: [
      { quantity: 12, discount: 10 },
      { quantity: 24, discount: 15 }
    ],
    relatedProducts: ['chips-sel-marin', 'barres-cereales-chocolat'],
    weight: '165g'
  },
  {
    id: 'biscuits-chocolat',
    sku: 'SNA-003',
    name: 'Biscuits Chocolat',
    category: 'Snacks',
    brand: 'Oreo',
    price: 1800,
    format: 'Pack 154g',
    compatibility: ['Compact Snack Plus', 'Distributeur Universal XL'],
    stock: 220,
    isAvailable: true,
    isNew: true,
    images: [
      'https://readdy.ai/api/search-image?query=Premium%20chocolate%20sandwich%20cookies%20package%20on%20white%20background%2C%20dark%20cookies%20with%20cream%20filling%2C%20professional%20product%20photography%2C%20modern%20packaging%2C%20studio%20lighting%2C%20commercial%20quality&width=800&height=800&seq=008&orientation=squarish'
    ],
    description: 'Les biscuits sandwich au chocolat les plus célèbres au monde. Deux biscuits croquants au cacao enrobent une délicieuse crème vanillée.',
    ingredients: 'Farine de blé, sucre, huiles végétales, cacao maigre en poudre (4,6%), sirop de glucose-fructose, arômes',
    allergens: 'Gluten, lait. Peut contenir des traces de soja et fruits à coque',
    volumeDiscounts: [
      { quantity: 20, discount: 10 },
      { quantity: 40, discount: 15 }
    ],
    relatedProducts: ['barres-cereales-chocolat', 'chips-sel-marin'],
    weight: '154g'
  },
  {
    id: 'barres-cereales-chocolat',
    sku: 'SNA-004',
    name: 'Barres Céréales Chocolat',
    category: 'Snacks',
    brand: 'Special K',
    price: 2200,
    format: 'Pack 6x21g',
    compatibility: ['Compact Snack Plus', 'Distributeur Universal XL'],
    stock: 140,
    isAvailable: true,
    images: [
      'https://readdy.ai/api/search-image?query=Chocolate%20cereal%20bars%20multipack%20on%20white%20background%2C%20healthy%20snack%20bars%20with%20chocolate%20coating%2C%20professional%20product%20photography%2C%20modern%20packaging%2C%20studio%20lighting%2C%20commercial%20shot&width=800&height=800&seq=009&orientation=squarish'
    ],
    description: 'Des barres de céréales enrobées de chocolat noir, parfaites pour une pause énergétique. Source de fibres et de vitamines, elles allient plaisir et équilibre.',
    ingredients: 'Céréales (riz, blé complet), chocolat noir (25%), sirop de glucose, sucre, huile de tournesol, vitamines',
    allergens: 'Gluten, lait. Peut contenir des traces de fruits à coque et soja',
    volumeDiscounts: [
      { quantity: 15, discount: 12 },
      { quantity: 30, discount: 18 }
    ],
    relatedProducts: ['biscuits-chocolat', 'chips-paprika'],
    weight: '126g (6x21g)'
  },

  // Boissons
  {
    id: 'coca-cola-classic',
    sku: 'BEV-001',
    name: 'Coca-Cola Classic',
    category: 'Boissons',
    brand: 'Coca-Cola',
    price: 800,
    format: 'Canette 33cl',
    compatibility: ['Distributeur Universal XL', 'Compact Snack Plus'],
    stock: 500,
    isAvailable: true,
    isPopular: true,
    images: [
      'https://readdy.ai/api/search-image?query=Classic%20red%20Coca%20Cola%20can%20on%20white%20background%2C%20condensation%20droplets%2C%20professional%20product%20photography%2C%20studio%20lighting%2C%20commercial%20quality%20shot%2C%20iconic%20red%20can&width=800&height=800&seq=010&orientation=squarish'
    ],
    description: 'La boisson gazeuse iconique au goût unique et rafraîchissant. Depuis plus d\'un siècle, Coca-Cola accompagne vos moments de plaisir et de partage.',
    ingredients: 'Eau gazéifiée, sucre, colorant E150d, acidifiant acide phosphorique, arômes naturels, caféine',
    allergens: 'Aucun',
    volumeDiscounts: [
      { quantity: 24, discount: 8 },
      { quantity: 48, discount: 12 },
      { quantity: 100, discount: 15 }
    ],
    relatedProducts: ['sprite-citron', 'fanta-orange'],
    weight: '33cl'
  },
  {
    id: 'sprite-citron',
    sku: 'BEV-002',
    name: 'Sprite Citron',
    category: 'Boissons',
    brand: 'Coca-Cola',
    price: 800,
    format: 'Canette 33cl',
    compatibility: ['Distributeur Universal XL', 'Compact Snack Plus'],
    stock: 450,
    isAvailable: true,
    images: [
      'https://readdy.ai/api/search-image?query=Green%20Sprite%20lemon%20soda%20can%20on%20white%20background%2C%20fresh%20condensation%20droplets%2C%20professional%20product%20photography%2C%20studio%20lighting%2C%20commercial%20quality%2C%20refreshing%20appearance&width=800&height=800&seq=011&orientation=squarish'
    ],
    description: 'Une limonade pétillante au goût citron authentique. Sans colorants artificiels, Sprite est la boisson rafraîchissante idéale pour étancher votre soif.',
    ingredients: 'Eau gazéifiée, sucre, acidifiant acide citrique, arômes naturels de citron et citron vert',
    allergens: 'Aucun',
    volumeDiscounts: [
      { quantity: 24, discount: 8 },
      { quantity: 48, discount: 12 }
    ],
    relatedProducts: ['coca-cola-classic', 'fanta-orange'],
    weight: '33cl'
  },
  {
    id: 'fanta-orange',
    sku: 'BEV-003',
    name: 'Fanta Orange',
    category: 'Boissons',
    brand: 'Coca-Cola',
    price: 800,
    format: 'Canette 33cl',
    compatibility: ['Distributeur Universal XL', 'Compact Snack Plus'],
    stock: 400,
    isAvailable: true,
    images: [
      'https://readdy.ai/api/search-image?query=Orange%20Fanta%20can%20on%20white%20background%2C%20bright%20orange%20colored%20soda%2C%20condensation%20droplets%2C%20professional%20product%20photography%2C%20studio%20lighting%2C%20commercial%20quality%20shot&width=800&height=800&seq=012&orientation=squarish'
    ],
    description: 'Le goût fruité et pétillant de l\'orange dans une boisson désaltérante. Fanta Orange apporte une touche de fun et de fraîcheur à vos journées.',
    ingredients: 'Eau gazéifiée, sucre, jus d\'orange à base de concentré (4%), acidifiant acide citrique, arômes naturels, colorant bêta-carotène',
    allergens: 'Aucun',
    volumeDiscounts: [
      { quantity: 24, discount: 8 },
      { quantity: 48, discount: 12 }
    ],
    relatedProducts: ['coca-cola-classic', 'sprite-citron'],
    weight: '33cl'
  },
  {
    id: 'eau-minerale-evian',
    sku: 'BEV-004',
    name: 'Eau Minérale Evian',
    category: 'Boissons',
    brand: 'Evian',
    price: 600,
    format: 'Bouteille 50cl',
    compatibility: ['Distributeur Universal XL', 'Compact Snack Plus'],
    stock: 600,
    isAvailable: true,
    isNew: true,
    images: [
      'https://readdy.ai/api/search-image?query=Premium%20Evian%20mineral%20water%20bottle%20on%20white%20background%2C%20clear%20plastic%20bottle%20with%20blue%20label%2C%20professional%20product%20photography%2C%20studio%20lighting%2C%20commercial%20quality%2C%20pure%20and%20clean%20aesthetic&width=800&height=800&seq=013&orientation=squarish'
    ],
    description: 'Une eau minérale naturelle pure, provenant des Alpes françaises. Équilibrée en minéraux, Evian est l\'eau idéale pour une hydratation quotidienne optimale.',
    ingredients: 'Eau minérale naturelle',
    allergens: 'Aucun',
    volumeDiscounts: [
      { quantity: 30, discount: 10 },
      { quantity: 60, discount: 15 },
      { quantity: 120, discount: 20 }
    ],
    relatedProducts: ['coca-cola-classic', 'sprite-citron'],
    weight: '50cl'
  }
];