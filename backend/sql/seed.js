const path = require('path');
// Chemin absolu : le script doit fonctionner quel que soit le répertoire courant
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

/** Date relative à aujourd'hui, au format MySQL DATETIME */
const daysAgo = (n) => {
  const d = new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 19).replace('T', ' ');
};

/** Idem mais au format DATE */
const dateOnly = (n) =>
  new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

/** Ancien catalogue de démo, remplacé par les produits réels SMALIM */
const LEGACY_MACHINE_SLUGS = [
  'tcn-ncf-7n-v22', 'tcn-ncf-4n-v10', 'tcn-csc-10g-h5', 'tcn-csc-6g-h5', 'tcn-csc-10c-32v',
  'tcn-csc-8c-50sp', 'tcn-60g-c4', 'tcn-cfz-510l', 'tcn-cfz-1200-v10',
];
const LEGACY_PRODUCT_SLUGS = [
  'cafe-grains-arabica-1kg', 'cafe-soluble-vending-500g', 'chocolat-poudre-1kg',
  'lait-poudre-vending-1kg', 'the-vert-dosettes-200', 'sucre-batonnets-4g-1000',
  // Consommables sans photo réelle, retirés du catalogue
  'gobelet-carton-20cl-1000', 'gobelet-plastique-18cl-2000', 'touillettes-bois-5000', 'couvercles-20cl-1000',
  'assortiment-biscuits-100', 'barres-chocolatees-50', 'chips-sachets-30g-60', 'cacahuetes-40g-60',
  'spirale-distributrice-standard', 'moteur-spirale-24v', 'groupe-brassage-cafe', 'filtre-eau-anticalcaire',
  'kit-maintenance-annuelle', 'monnayeur-electronique-mdb',
];
const LEGACY_PRODUCT_CATEGORY_SLUGS = ['gobelets-emballages', 'produits-sucres', 'pieces-detachees'];
/** Données de démo qui citaient l'ancien catalogue : supprimées puis recréées par le seed */
const LEGACY_DEMO_ROWS = {
  orders: ['CMD-2024-0001', 'CMD-2024-0002', 'CMD-2024-0003', 'CMD-2024-0004', 'CMD-2024-0005', 'CMD-2024-0006', 'CMD-2024-0007'],
  invoices: ['FAC-2024-0001', 'FAC-2024-0002', 'FAC-2024-0003', 'FAC-2024-0004'],
  quotes: ['DEV-2024-0001', 'DEV-2024-0002', 'DEV-2024-0005'],
  tickets: ['TIC-2024-0001', 'TIC-2024-0002', 'TIC-2024-0003'],
  fleet: ['SN-NCF7N-00142', 'SN-CSC10G-00311', 'SN-CSC10C-00087', 'SN-CSC6G-00205', 'SN-CFZ510-00064', 'SN-60GC4-00019'],
};

/**
 * Retire l'ancien catalogue de démo d'une base déjà initialisée.
 * Ne touche qu'aux lignes de démo listées ci-dessus : les commandes, tickets
 * ou parcs créés depuis l'application sont conservés. Une machine encore
 * rattachée à un parc client réel est désactivée plutôt que supprimée.
 */
async function removeLegacyDemoCatalog() {
  const [legacy] = await query(
    `SELECT (SELECT COUNT(*) FROM machines WHERE slug IN (?)) + (SELECT COUNT(*) FROM products WHERE slug IN (?)) AS n`,
    [LEGACY_MACHINE_SLUGS, LEGACY_PRODUCT_SLUGS]
  );
  if (!legacy.n) return;

  const { orders, invoices, quotes, tickets, fleet } = LEGACY_DEMO_ROWS;
  await query('DELETE FROM invoices WHERE invoice_number IN (?)', [invoices]);
  await query('DELETE FROM orders WHERE order_number IN (?)', [orders]);           // lignes et suivi en cascade
  await query('DELETE FROM quotes WHERE quote_number IN (?)', [quotes]);
  await query('DELETE FROM support_tickets WHERE ticket_number IN (?)', [tickets]); // messages en cascade
  await query('DELETE FROM client_machines WHERE serial_number IN (?)', [fleet]);

  await query(
    `DELETE m FROM machines m
     LEFT JOIN client_machines cm ON cm.machine_id = m.id
     WHERE m.slug IN (?) AND cm.id IS NULL`,
    [LEGACY_MACHINE_SLUGS]
  );
  await query('UPDATE machines SET is_active = 0, is_featured = 0 WHERE slug IN (?)', [LEGACY_MACHINE_SLUGS]);
  await query('DELETE FROM products WHERE slug IN (?)', [LEGACY_PRODUCT_SLUGS]);
  await query(
    `DELETE c FROM product_categories c
     LEFT JOIN products p ON p.category_id = c.id
     WHERE c.slug IN (?) AND p.id IS NULL`,
    [LEGACY_PRODUCT_CATEGORY_SLUGS]
  );

  console.log('Ancien catalogue de démo retiré (TCN, consommables sans photo)');
}

async function seed() {
  try {
    console.log('🌱 Début du seeding...');

    // ── Admin par défaut ──────────────────────────
    const adminPassword = await bcrypt.hash('Admin@2024!', 12);
    await query(`
      INSERT IGNORE INTO admins (email, password, first_name, last_name, role)
      VALUES (?, ?, 'Super', 'Admin', 'super_admin')
    `, ['admin@smalim.sn', adminPassword]);
    console.log('Admin créé : admin@smalim.sn / Admin@2024!');

    // ── Client de démo ────────────────────────────
    const clientPassword = await bcrypt.hash('client2024', 12);
    await query(`
      INSERT IGNORE INTO clients (email, password, first_name, last_name, company_name, phone, city, is_active, email_verified)
      VALUES (?, ?, 'Amadou', 'Diallo', 'Sonatel SA', '+221 77 000 00 00', 'Dakar', 1, 1)
    `, ['amadou@sonatel.sn', clientPassword]);
    console.log('Client démo créé : amadou@sonatel.sn / client2024');

    // ── Clients additionnels (pour tester les listes admin) ──
    const extraClients = [
      ['fatou.ndiaye@ucad.sn', 'Fatou', 'Ndiaye', 'Université Cheikh Anta Diop', '+221 77 111 22 33', 'Dakar'],
      ['moussa.sarr@teranga-hotel.sn', 'Moussa', 'Sarr', 'Teranga Hôtel', '+221 78 222 33 44', 'Saly'],
      ['aissatou.ba@pharmacie-plateau.sn', 'Aïssatou', 'Ba', 'Pharmacie du Plateau', '+221 76 333 44 55', 'Dakar'],
      ['ibrahima.fall@sococim.sn', 'Ibrahima', 'Fall', 'SOCOCIM Industries', '+221 77 444 55 66', 'Rufisque'],
    ];
    for (const [email, fn, ln, company, phone, city] of extraClients) {
      await query(`
        INSERT IGNORE INTO clients (email, password, first_name, last_name, company_name, phone, city, is_active, email_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1)
      `, [email, clientPassword, fn, ln, company, phone, city]);
    }
    console.log(`${extraClients.length} clients additionnels créés (mot de passe : client2024)`);

    // ── Catégories machines ───────────────────────
    const machineCategories = [
      ['Distributeurs automatiques', 'distributeurs-automatiques', 'Machines de vente automatique'],
      ['Machines à café', 'machines-cafe', 'Équipements pour café et boissons chaudes'],
      ['Machines à glace', 'machines-glace', 'Productrices de glace et boissons fraîches'],
      ['Équipements frigorifiques', 'equipements-frigorifiques', 'Réfrigérateurs et congélateurs professionnels'],
    ];
    for (const [name, slug, desc] of machineCategories) {
      await query(
        'INSERT INTO machine_categories (name, slug, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)',
        [name, slug, desc]
      );
    }
    console.log('Catégories machines créées');

    // ── Catégories produits ───────────────────────
    const productCategories = [
      ['Cafés et boissons', 'cafes-boissons', 'Cafés, chocolats et cappuccinos pour distributeurs et machines à café'],
    ];
    for (const [name, slug, desc] of productCategories) {
      await query(
        'INSERT INTO product_categories (name, slug, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)',
        [name, slug, desc]
      );
    }
    console.log('Catégories produits créées');

    // ── Catégories blog ───────────────────────────
    const blogCategories = [
      ['Actualités', 'actualites'],
      ['Conseils et maintenance', 'conseils-maintenance'],
      ['Études de cas', 'etudes-de-cas'],
      ['Innovation', 'innovation'],
    ];
    for (const [name, slug] of blogCategories) {
      await query('INSERT INTO blog_categories (name, slug) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)', [name, slug]);
    }
    console.log('Catégories blog créées');

    // ── Codes promo ───────────────────────────────
    await query(`
      INSERT IGNORE INTO promo_codes (code, type, value, min_order_amount, max_uses, is_active)
      VALUES 
        ('BIENVENUE10', 'percentage', 10, 50000, 100, 1),
        ('SMALIM2024', 'percentage', 15, 100000, 50, 1),
        ('LIVRAISON', 'fixed', 5000, 30000, NULL, 1)
    `);
    console.log('Codes promo créés : BIENVENUE10, SMALIM2024, LIVRAISON');

    // ── Retrait de l'ancien catalogue de démo ─────────────────────
    // Les premières versions du seed chargeaient des machines TCN et des
    // cafés génériques. Sur une base déjà initialisée, on retire ces lignes
    // et les données de démo qui s'y rattachent, pour qu'elles soient
    // recréées plus bas avec le catalogue réel. Sans effet sur une base neuve.
    await removeLegacyDemoCatalog();

    // ── Machines (catalogue réel SMALIM) ──────────────────────────
    // Récupérer les IDs de catégories
    const [catDistrib] = await query("SELECT id FROM machine_categories WHERE slug = 'distributeurs-automatiques'");
    const [catCafe]    = await query("SELECT id FROM machine_categories WHERE slug = 'machines-cafe'");

    const idDistrib = catDistrib?.id;
    const idCafe    = catCafe?.id;

    const paymentModes = JSON.stringify(['wave', 'orange_money', 'carte_bancaire', 'especes', 'qr_code']);

    // Les photos sont servies par le frontend (frontend/public/images),
    // numérotées 1.webp, 2.webp… : la première sert d'image principale.
    const gallery = (kind, slug, count) =>
      Array.from({ length: count }, (_, i) => `/images/${kind}/${slug}/${i + 1}.webp`);

    const machinesData = [
      // ── Machines à café de comptoir ─────────────────────────────
      {
        category_id: idCafe,
        name: 'Sapoe AVM',
        slug: 'sapoe-avm',
        model_ref: 'AVM',
        brand: 'Sapoe',
        description: 'Machine à café instantané de comptoir, compacte et facile à entretenir. Trois bacs à poudre pour proposer café, cappuccino ou chocolat chaud. Idéale pour les petits bureaux, salles de pause et commerces.',
        stock: 12,
        delivery_delay: '3-7 jours ouvrés',
        is_featured: 0,
        images: 6,
        specifications: JSON.stringify({
          type: 'Machine à café instantané de comptoir',
          conteneurs: '3 bacs à poudre',
          selection: 'Boutons de sélection et afficheur digital',
        }),
      },
      {
        category_id: idCafe,
        name: 'Lecon 4 saveurs',
        slug: 'lecon-machine-cafe-instantane',
        model_ref: null,
        brand: 'Lecon',
        description: 'Machine à café instantané de comptoir avec façade lumineuse. Quatre bacs à poudre pour varier les boissons chaudes : café, café au lait, chocolat, thé au lait. Pour bureaux, restaurants et stations-service.',
        stock: 10,
        delivery_delay: '3-7 jours ouvrés',
        is_featured: 0,
        images: 6,
        specifications: JSON.stringify({
          type: 'Machine à café instantané de comptoir',
          conteneurs: '4 bacs à poudre',
          affichage: 'Façade lumineuse publicitaire',
        }),
      },
      {
        category_id: idCafe,
        name: 'Lecon Good Taste 50S',
        slug: 'lecon-good-taste-50s',
        model_ref: '50S',
        brand: 'Lecon',
        description: 'Distributeur de café instantané entièrement automatique, 5 boissons chaudes. Boutons tactiles, affichage LED, nettoyage automatique en un bouton et verrouillage anti-brûlure. Trois modes d\'alimentation en eau : bonbonne, réservoir avec purificateur ou pompe. Logiciel programmable pour régler le goût et la taille de tasse.',
        stock: 8,
        delivery_delay: '3-7 jours ouvrés',
        is_featured: 1,
        images: 5,
        specifications: JSON.stringify({
          type: 'Distributeur automatique de café instantané',
          boissons: '5 boissons chaudes',
          conteneurs: '5 bacs à poudre de 1 500 ml',
          alimentation: '220 V / 50 Hz, 1 600 W',
          reservoir_eau: '3,0 L',
          chaudiere: '1,6 L',
          dimensions: 'L 430 × P 490 × H 780 mm',
          emballage: 'L 510 × P 585 × H 860 mm',
          poids: '31 kg net / 35 kg brut',
          ingredients: 'Toutes poudres instantanées (café 3-en-1, thé au lait, chocolat…)',
          options: 'Meuble support en acier assorti',
        }),
      },
      // ── Distributeur de café sur pied ───────────────────────────
      {
        category_id: idCafe,
        name: 'SEN Coffee',
        slug: 'sen-coffee-distributeur-cafe-grains',
        model_ref: null,
        brand: 'SMALIM',
        description: 'Distributeur automatique de café fraîchement moulu, aux couleurs SEN Coffee. Moulin à grains intégré, écran tactile de sélection, distributeur de gobelets et alimentation en eau par bonbonne. Pour halls d\'entreprise, campus, hôtels et lieux à forte affluence.',
        stock: 5,
        delivery_delay: '7-14 jours ouvrés',
        is_featured: 1,
        images: 10,
        specifications: JSON.stringify({
          type: 'Distributeur de café en grains (mouture fraîche)',
          affichage: 'Écran tactile',
          equipement: 'Moulin à café, distributeur de gobelets intégré',
          alimentation_eau: 'Bonbonne d\'eau intégrée',
        }),
      },
      // ── Distributeurs automatiques ──────────────────────────────
      {
        category_id: idDistrib,
        name: 'NEXX Snacks & Drinks',
        slug: 'nexx-distributeur-snacks-boissons',
        model_ref: null,
        brand: 'NEXX',
        description: 'Distributeur automatique de snacks et boissons fraîches avec grande vitrine vitrée et écran de commande en façade. Habillage « Healthy Snacks & Drinks » personnalisable. Pour entreprises, écoles, hôpitaux et espaces publics.',
        stock: 6,
        delivery_delay: '7-14 jours ouvrés',
        is_featured: 1,
        images: 4,
        specifications: JSON.stringify({
          type: 'Distributeur snacks & boissons',
          vitrine: 'Grande vitrine vitrée éclairée',
          affichage: 'Écran de commande en façade',
        }),
      },
    ];

    for (const m of machinesData) {
      const images = gallery('machines', m.slug, m.images);
      await query(`
        INSERT INTO machines
          (category_id, name, slug, description, price, stock, unit, brand, model_ref,
           delivery_delay, image_url, gallery, specifications, payment_modes, is_active, is_featured)
        VALUES (?, ?, ?, ?, 0.00, ?, 'unité', ?, ?, ?, ?, ?, ?, ?, 1, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name), description = VALUES(description), brand = VALUES(brand),
          model_ref = VALUES(model_ref), image_url = VALUES(image_url), gallery = VALUES(gallery),
          specifications = VALUES(specifications)
      `, [
        m.category_id, m.name, m.slug, m.description,
        m.stock, m.brand, m.model_ref, m.delivery_delay,
        images[0], JSON.stringify(images), m.specifications, paymentModes, m.is_featured
      ]);
    }
    console.log(`${machinesData.length} machines créées`);

    // ── Consommables ──────────────────────────────────────────────
    const productCats = await query('SELECT id, slug FROM product_categories');
    const catId = Object.fromEntries(productCats.map(c => [c.slug, c.id]));

    const productsData = [

      // Cafés et boissons : matières premières réelles.
      // PRIX PROVISOIRES : à confirmer puis corriger depuis l'admin.
      ['cafes-boissons', 'Café de Colombie Craft Roasters', 'craft-roasters-cafe-colombie', 'Café 100 % Colombie de la gamme Craft Roasters. Arômes ronds et équilibrés, adapté aux distributeurs à mouture fraîche comme le SEN Coffee.', 14500, 150, 'sachet', 'Craft Roasters', 'MP-CRF-COL', 1],
      ['cafes-boissons', 'Chocolat chaud crémeux Kingsmill', 'kingsmill-creamy-hot-chocolate', 'Préparation instantanée Kingsmill pour chocolat chaud crémeux. Conçue pour les distributeurs automatiques et machines à café instantané.', 13500, 120, 'sachet', 'Kingsmill', 'MP-KGM-HCH', 1],
      ['cafes-boissons', 'Chocolat blanc chaud Kingsmill', 'kingsmill-creamy-white-hot-chocolate', 'Préparation instantanée Kingsmill pour chocolat blanc chaud, texture onctueuse. Pour distributeurs automatiques et machines à café instantané.', 14000, 80, 'sachet', 'Kingsmill', 'MP-KGM-WCH', 0],
      ['cafes-boissons', 'Cappuccino vanille française Kingsmill', 'kingsmill-french-vanilla-cappuccino', 'Mélange instantané Kingsmill pour cappuccino à la vanille française. Prêt à l\'emploi dans les bacs à poudre des machines Lecon et Sapoe.', 14000, 100, 'sachet', 'Kingsmill', 'MP-KGM-FVC', 0],
      ['cafes-boissons', 'Cappuccino glacé Kingsmill', 'kingsmill-iced-cappuccino', 'Mélange Kingsmill pour cappuccino glacé, à préparer avec de l\'eau froide ou de la glace. Idéal pour élargir l\'offre de boissons fraîches.', 14500, 60, 'sachet', 'Kingsmill', 'MP-KGM-ICC', 0],


    ];

    // Nombre de photos disponibles par produit (frontend/public/images/products/<slug>/)
    const productImageCount = {
      'craft-roasters-cafe-colombie': 4,
      'kingsmill-creamy-hot-chocolate': 1,
      'kingsmill-creamy-white-hot-chocolate': 1,
      'kingsmill-french-vanilla-cappuccino': 1,
      'kingsmill-iced-cappuccino': 1,
    };

    for (const [catSlug, name, slug, desc, price, stock, unit, brand, ref, featured] of productsData) {
      const images = gallery('products', slug, productImageCount[slug] || 0);
      await query(`
        INSERT INTO products
          (category_id, name, slug, description, price, stock, unit, brand, reference,
           image_url, gallery, is_active, is_featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name), description = VALUES(description), brand = VALUES(brand),
          image_url = VALUES(image_url), gallery = VALUES(gallery)
      `, [
        catId[catSlug], name, slug, desc, price, stock, unit, brand, ref,
        images[0] || null, images.length ? JSON.stringify(images) : null, featured
      ]);
    }
    console.log(`${productsData.length} consommables créés`);

    // ── Références nécessaires aux jeux de données suivants ──────
    const allClients = await query('SELECT id, email, first_name, last_name, company_name, city FROM clients ORDER BY id');
    const allMachines = await query('SELECT id, name, slug, model_ref FROM machines ORDER BY id');
    const allProducts = await query('SELECT id, name, slug, reference, price FROM products ORDER BY id');
    const [superAdmin] = await query("SELECT id FROM admins WHERE role = 'super_admin' ORDER BY id LIMIT 1");

    const clientBy = Object.fromEntries(allClients.map(c => [c.email, c]));
    const machineBy = Object.fromEntries(allMachines.map(m => [m.slug, m]));
    const productBy = Object.fromEntries(allProducts.map(p => [p.slug, p]));

    // ── Commandes ─────────────────────────────────────────────────
    // Statuts variés pour couvrir tout le tunnel côté admin et client.
    const ordersData = [
      {
        order_number: 'CMD-2024-0001',
        client: 'amadou@sonatel.sn',
        status: 'delivered',
        payment_method: 'bank_transfer',
        payment_status: 'paid',
        created_days_ago: 45,
        delivered_days_ago: 38,
        shipping: 25000,
        items: [
          { type: 'product', slug: 'craft-roasters-cafe-colombie', qty: 20 },
          { type: 'product', slug: 'kingsmill-french-vanilla-cappuccino', qty: 4 },
        ],
      },
      {
        order_number: 'CMD-2024-0002',
        client: 'fatou.ndiaye@ucad.sn',
        status: 'delivered',
        payment_method: 'wave',
        payment_status: 'paid',
        created_days_ago: 30,
        delivered_days_ago: 24,
        shipping: 15000,
        promo_code: 'BIENVENUE10',
        discount: 12000,
        items: [
          { type: 'product', slug: 'kingsmill-creamy-hot-chocolate', qty: 6 },
          { type: 'product', slug: 'kingsmill-iced-cappuccino', qty: 4 },
        ],
      },
      {
        order_number: 'CMD-2024-0003',
        client: 'moussa.sarr@teranga-hotel.sn',
        status: 'shipped',
        payment_method: 'orange_money',
        payment_status: 'paid',
        created_days_ago: 9,
        shipping: 30000,
        items: [
          { type: 'product', slug: 'craft-roasters-cafe-colombie', qty: 10 },
          { type: 'product', slug: 'kingsmill-creamy-white-hot-chocolate', qty: 4 },
        ],
      },
      {
        order_number: 'CMD-2024-0004',
        client: 'aissatou.ba@pharmacie-plateau.sn',
        status: 'processing',
        payment_method: 'wave',
        payment_status: 'paid',
        created_days_ago: 5,
        shipping: 12000,
        items: [
          { type: 'product', slug: 'kingsmill-creamy-hot-chocolate', qty: 10 },
          { type: 'product', slug: 'kingsmill-iced-cappuccino', qty: 8 },
        ],
      },
      {
        order_number: 'CMD-2024-0005',
        client: 'ibrahima.fall@sococim.sn',
        status: 'confirmed',
        payment_method: 'bank_transfer',
        payment_status: 'pending',
        created_days_ago: 3,
        shipping: 45000,
        items: [
          { type: 'product', slug: 'craft-roasters-cafe-colombie', qty: 30 },
          { type: 'product', slug: 'kingsmill-french-vanilla-cappuccino', qty: 10 },
        ],
      },
      {
        order_number: 'CMD-2024-0006',
        client: 'amadou@sonatel.sn',
        status: 'pending',
        payment_method: 'card',
        payment_status: 'pending',
        created_days_ago: 1,
        shipping: 18000,
        items: [
          { type: 'product', slug: 'kingsmill-creamy-white-hot-chocolate', qty: 6 },
          { type: 'product', slug: 'kingsmill-french-vanilla-cappuccino', qty: 4 },
        ],
      },
      {
        order_number: 'CMD-2024-0007',
        client: 'fatou.ndiaye@ucad.sn',
        status: 'cancelled',
        payment_method: 'wave',
        payment_status: 'refunded',
        created_days_ago: 20,
        cancelled_days_ago: 18,
        shipping: 10000,
        items: [
          { type: 'product', slug: 'kingsmill-creamy-white-hot-chocolate', qty: 3 },
        ],
      },
    ];

    // Suivi cohérent avec le statut final de chaque commande
    const trackingFlow = {
      pending: ['pending'],
      confirmed: ['pending', 'confirmed'],
      processing: ['pending', 'confirmed', 'processing'],
      shipped: ['pending', 'confirmed', 'processing', 'shipped'],
      delivered: ['pending', 'confirmed', 'processing', 'shipped', 'delivered'],
      cancelled: ['pending', 'cancelled'],
    };
    const trackingNotes = {
      pending: 'Commande enregistrée, en attente de validation.',
      confirmed: 'Commande confirmée par le service commercial.',
      processing: 'Préparation de la commande en entrepôt.',
      shipped: 'Colis remis au transporteur.',
      delivered: 'Commande livrée et réceptionnée par le client.',
      cancelled: 'Commande annulée à la demande du client.',
    };

    let ordersCreated = 0;
    for (const o of ordersData) {
      const [existing] = await query('SELECT id FROM orders WHERE order_number = ?', [o.order_number]);
      if (existing) continue;

      const client = clientBy[o.client];
      if (!client) continue;

      // Calcul du total à partir des lignes réelles
      const lines = o.items.map(i => {
        const ref = i.type === 'product' ? productBy[i.slug] : machineBy[i.slug];
        const unitPrice = Number(ref.price ?? 0);
        return {
          item_type: i.type,
          item_id: ref.id,
          item_name: ref.name,
          item_reference: ref.reference || ref.model_ref || null,
          quantity: i.qty,
          unit_price: unitPrice,
          total_price: unitPrice * i.qty,
        };
      });

      const subtotal = lines.reduce((s, l) => s + l.total_price, 0);
      const discount = o.discount || 0;
      const shipping = o.shipping || 0;
      const tax = Math.round((subtotal - discount) * 0.18);
      const total = subtotal - discount + shipping + tax;

      const shippingAddress = JSON.stringify({
        first_name: client.first_name,
        last_name: client.last_name,
        company_name: client.company_name,
        address: `${client.company_name}, Zone industrielle`,
        city: client.city || 'Dakar',
        country: 'Sénégal',
      });

      const result = await query(`
        INSERT INTO orders
          (order_number, client_id, status, subtotal, tax_amount, shipping_amount, discount_amount,
           total_amount, payment_method, payment_status, promo_code, shipping_address,
           delivered_at, cancelled_at, cancellation_reason, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        o.order_number, client.id, o.status, subtotal, tax, shipping, discount,
        total, o.payment_method, o.payment_status, o.promo_code || null, shippingAddress,
        o.delivered_days_ago ? daysAgo(o.delivered_days_ago) : null,
        o.cancelled_days_ago ? daysAgo(o.cancelled_days_ago) : null,
        o.status === 'cancelled' ? 'Annulation demandée par le client' : null,
        daysAgo(o.created_days_ago),
      ]);

      const orderId = result.insertId;

      for (const l of lines) {
        await query(`
          INSERT INTO order_items
            (order_id, item_type, item_id, item_name, item_reference, quantity, unit_price, total_price)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [orderId, l.item_type, l.item_id, l.item_name, l.item_reference, l.quantity, l.unit_price, l.total_price]);
      }

      // L'historique est réparti entre la date de commande et aujourd'hui
      const flow = trackingFlow[o.status] || ['pending'];
      const span = o.created_days_ago;
      for (const [idx, status] of flow.entries()) {
        const at = daysAgo(Math.max(0, span - Math.round((span / Math.max(flow.length - 1, 1)) * idx)));
        await query(
          'INSERT INTO order_tracking (order_id, status, note, created_by, created_at) VALUES (?, ?, ?, ?, ?)',
          [orderId, status, trackingNotes[status], superAdmin?.id || null, at]
        );
      }

      ordersCreated++;
    }
    console.log(`${ordersCreated} commandes créées (avec lignes et historique de suivi)`);

    // ── Devis ─────────────────────────────────────────────────────
    const quotesData = [
      {
        quote_number: 'DEV-2024-0001',
        client: 'moussa.sarr@teranga-hotel.sn',
        machine_type: 'Distributeur Snack & Boissons',
        description: 'Équipement de 3 étages de l\'hôtel avec distributeurs snacks et boissons réfrigérées. Installation et maintenance incluses souhaitées.',
        quantity: 3,
        budget: 9000000,
        status: 'accepted',
        proposed_amount: 8700000,
        admin_response: 'Proposition pour 3 distributeurs NEXX Snacks & Boissons avec installation, formation et contrat de maintenance 1 an inclus.',
        created_days_ago: 40,
      },
      {
        quote_number: 'DEV-2024-0002',
        client: 'fatou.ndiaye@ucad.sn',
        machine_type: 'Distributeur de café en grains',
        description: 'Installation de machines à café en libre-service pour les espaces étudiants du campus. Forte fréquentation attendue.',
        quantity: 5,
        budget: 15000000,
        status: 'quoted',
        proposed_amount: 14250000,
        admin_response: 'Devis pour 5 distributeurs SEN Coffee avec tarif dégressif volume. Validité 30 jours.',
        created_days_ago: 14,
      },
      {
        quote_number: 'DEV-2024-0003',
        client: 'ibrahima.fall@sococim.sn',
        machine_type: 'Distributeur Combiné',
        description: 'Solution tout-en-un pour la cantine du site industriel : café, snacks et boissons fraîches sur un seul équipement.',
        quantity: 2,
        budget: 7000000,
        status: 'processing',
        created_days_ago: 6,
      },
      {
        quote_number: 'DEV-2024-0004',
        client: null,
        company_name: 'Clinique de la Madeleine',
        contact_name: 'Dr Mariama Sow',
        contact_email: 'contact@clinique-madeleine.sn',
        contact_phone: '+221 33 821 00 00',
        machine_type: 'Smart Fridge Réfrigérée',
        description: 'Réfrigérateur intelligent en libre-service 24h/24 pour le hall d\'accueil de la clinique.',
        quantity: 1,
        budget: 2500000,
        status: 'pending',
        created_days_ago: 2,
      },
      {
        quote_number: 'DEV-2024-0005',
        client: 'aissatou.ba@pharmacie-plateau.sn',
        machine_type: 'Distributeur Snacks & Boissons',
        description: 'Distributeur avec écran publicitaire pour la vitrine de la pharmacie. Diffusion de contenus santé souhaitée.',
        quantity: 1,
        budget: 1800000,
        status: 'refused',
        proposed_amount: 3200000,
        admin_response: 'Deux distributeurs NEXX dépassent le budget indiqué. Une machine à café Lecon Good Taste a été proposée en alternative.',
        created_days_ago: 25,
      },
    ];

    let quotesCreated = 0;
    for (const q of quotesData) {
      const [existing] = await query('SELECT id FROM quotes WHERE quote_number = ?', [q.quote_number]);
      if (existing) continue;

      const client = q.client ? clientBy[q.client] : null;
      await query(`
        INSERT INTO quotes
          (quote_number, client_id, company_name, contact_name, contact_email, contact_phone,
           machine_type, description, budget, quantity, status, proposed_amount, admin_response,
           expires_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        q.quote_number,
        client?.id || null,
        q.company_name || client?.company_name || null,
        q.contact_name || `${client.first_name} ${client.last_name}`,
        q.contact_email || client.email,
        q.contact_phone || '+221 77 000 00 00',
        q.machine_type,
        q.description,
        q.budget || null,
        q.quantity,
        q.status,
        q.proposed_amount || null,
        q.admin_response || null,
        daysAgo(q.created_days_ago - 30), // valide 30 jours après émission
        daysAgo(q.created_days_ago),
      ]);
      quotesCreated++;
    }
    console.log(`${quotesCreated} devis créés`);

    // ── Parc de machines installées ───────────────────────────────
    const fleetData = [
      ['amadou@sonatel.sn', 'sen-coffee-distributeur-cafe-grains', 'SN-SENC-00142', 200, 'Siège Sonatel, hall d\'accueil', 'active', 12480],
      ['amadou@sonatel.sn', 'nexx-distributeur-snacks-boissons', 'SN-NEXX-00311', 200, 'Siège Sonatel, cafétéria 2e étage', 'active', 8930],
      ['fatou.ndiaye@ucad.sn', 'sen-coffee-distributeur-cafe-grains', 'SN-SENC-00087', 150, 'UCAD, faculté des Sciences', 'active', 21540],
      ['fatou.ndiaye@ucad.sn', 'nexx-distributeur-snacks-boissons', 'SN-NEXX-00205', 150, 'UCAD, bibliothèque centrale', 'maintenance', 15220],
      ['moussa.sarr@teranga-hotel.sn', 'lecon-good-taste-50s', 'SN-LGT50S-00064', 90, 'Teranga Hôtel, étage 3', 'active', 4310],
      ['ibrahima.fall@sococim.sn', 'sen-coffee-distributeur-cafe-grains', 'SN-SENC-00019', 300, 'SOCOCIM, cantine principale', 'active', 33800],
      ['aissatou.ba@pharmacie-plateau.sn', 'sapoe-avm', 'SN-SAPOE-00051', 60, 'Pharmacie du Plateau, salle de pause', 'active', 2140],
      ['aissatou.ba@pharmacie-plateau.sn', 'lecon-machine-cafe-instantane', 'SN-LECON-00052', 60, 'Pharmacie du Plateau, accueil', 'active', 1870],
    ];

    let fleetCreated = 0;
    for (const [email, slug, serial, installDays, location, status, sales] of fleetData) {
      const [existing] = await query('SELECT id FROM client_machines WHERE serial_number = ?', [serial]);
      if (existing) continue;

      const client = clientBy[email];
      const machine = machineBy[slug];
      if (!client || !machine) continue;

      await query(`
        INSERT INTO client_machines
          (client_id, machine_id, serial_number, installation_date, location, status,
           last_service_date, next_service_date, sales_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        client.id, machine.id, serial, dateOnly(installDays), location, status,
        dateOnly(60), dateOnly(-120), sales,
      ]);
      fleetCreated++;
    }
    console.log(`${fleetCreated} machines installées enregistrées (parc client)`);

    // ── Factures (adossées aux commandes payées) ──────────────────
    const paidOrders = await query(
      "SELECT id, order_number, client_id, subtotal, tax_amount, total_amount, created_at FROM orders WHERE payment_status = 'paid' AND order_number LIKE 'CMD-2024-%'"
    );

    let invoicesCreated = 0;
    for (const o of paidOrders) {
      const invoiceNumber = `FAC-${o.order_number.slice(4)}`;
      const [existing] = await query('SELECT id FROM invoices WHERE invoice_number = ?', [invoiceNumber]);
      if (existing) continue;

      await query(`
        INSERT INTO invoices
          (invoice_number, order_id, client_id, type, amount_ht, tax_rate, tax_amount, amount_ttc,
           status, due_date, paid_at, created_at)
        VALUES (?, ?, ?, 'invoice', ?, 18.00, ?, ?, 'paid', ?, ?, ?)
      `, [
        invoiceNumber, o.id, o.client_id,
        o.subtotal, o.tax_amount, o.total_amount,
        dateOnly(-30), o.created_at, o.created_at,
      ]);
      invoicesCreated++;
    }

    // Une facture en retard de paiement, pour tester l'état "overdue"
    const overdueClient = clientBy['ibrahima.fall@sococim.sn'];
    if (overdueClient) {
      const [existing] = await query('SELECT id FROM invoices WHERE invoice_number = ?', ['FAC-2024-0099']);
      if (!existing) {
        await query(`
          INSERT INTO invoices
            (invoice_number, order_id, client_id, type, amount_ht, tax_rate, tax_amount, amount_ttc,
             status, due_date, created_at)
          VALUES (?, NULL, ?, 'invoice', 1250000, 18.00, 225000, 1475000, 'overdue', ?, ?)
        `, ['FAC-2024-0099', overdueClient.id, dateOnly(15), daysAgo(60)]);
        invoicesCreated++;
      }
    }
    console.log(`${invoicesCreated} factures créées`);

    // ── Tickets de support ────────────────────────────────────────
    const ticketsData = [
      {
        ticket_number: 'TIC-2024-0001',
        client: 'fatou.ndiaye@ucad.sn',
        machine: 'nexx-distributeur-snacks-boissons',
        subject: 'Distributeur bibliothèque : spirale bloquée rangée B3',
        description: 'La spirale de la rangée B3 tourne dans le vide depuis ce matin. Les produits restent coincés et les clients sont débités.',
        category: 'panne',
        priority: 'high',
        status: 'in_progress',
        created_days_ago: 4,
        messages: [
          ['client', 'Bonjour, la rangée B3 ne distribue plus. Pouvez-vous intervenir rapidement ?'],
          ['admin', 'Bonjour Mme Ndiaye, un technicien passera demain matin. Merci de mettre la rangée hors service en attendant.'],
          ['client', 'C\'est noté, rangée désactivée. Merci pour la réactivité.'],
        ],
      },
      {
        ticket_number: 'TIC-2024-0002',
        client: 'amadou@sonatel.sn',
        machine: 'sen-coffee-distributeur-cafe-grains',
        subject: 'Café trop clair depuis la dernière recharge',
        description: 'Depuis le réapprovisionnement de la semaine dernière, le café sort nettement plus clair et moins corsé qu\'avant.',
        category: 'question',
        priority: 'low',
        status: 'resolved',
        created_days_ago: 12,
        resolved_days_ago: 10,
        admin_response: 'Le réglage de mouture avait été modifié lors de l\'entretien. Recalibré à la valeur d\'origine.',
        messages: [
          ['client', 'Le café est beaucoup plus clair qu\'avant, est-ce normal ?'],
          ['admin', 'Il s\'agissait d\'un réglage de mouture. C\'est corrigé, merci de nous confirmer le résultat.'],
          ['client', 'Parfait, c\'est revenu à la normale. Merci !'],
        ],
      },
      {
        ticket_number: 'TIC-2024-0003',
        client: 'moussa.sarr@teranga-hotel.sn',
        machine: 'lecon-good-taste-50s',
        subject: 'Demande de maintenance préventive',
        description: 'Nous souhaitons planifier la maintenance préventive annuelle de la machine à café de l\'étage 3 avant la haute saison.',
        category: 'maintenance',
        priority: 'medium',
        status: 'open',
        created_days_ago: 2,
        messages: [
          ['client', 'Bonjour, quelles sont vos disponibilités pour la maintenance annuelle ?'],
        ],
      },
      {
        ticket_number: 'TIC-2024-0004',
        client: 'ibrahima.fall@sococim.sn',
        machine: null,
        subject: 'Facture FAC-2024-0099 : demande d\'échéancier',
        description: 'Nous souhaitons échelonner le règlement de la facture FAC-2024-0099 sur trois mensualités.',
        category: 'facturation',
        priority: 'medium',
        status: 'waiting_client',
        created_days_ago: 8,
        messages: [
          ['client', 'Serait-il possible d\'échelonner le paiement sur 3 mois ?'],
          ['admin', 'C\'est envisageable. Merci de nous transmettre une demande signée par la direction financière.'],
        ],
      },
      {
        ticket_number: 'TIC-2024-0005',
        client: 'aissatou.ba@pharmacie-plateau.sn',
        machine: null,
        subject: 'Retard de livraison commande CMD-2024-0004',
        description: 'La commande de consommables était annoncée pour cette semaine, nous n\'avons pas encore reçu de notification d\'expédition.',
        category: 'livraison',
        priority: 'urgent',
        status: 'open',
        created_days_ago: 1,
        messages: [
          ['client', 'Où en est ma commande ? Nous sommes bientôt en rupture de chocolat chaud.'],
        ],
      },
    ];

    let ticketsCreated = 0;
    for (const t of ticketsData) {
      const [existing] = await query('SELECT id FROM support_tickets WHERE ticket_number = ?', [t.ticket_number]);
      if (existing) continue;

      const client = clientBy[t.client];
      if (!client) continue;
      const machine = t.machine ? machineBy[t.machine] : null;

      const result = await query(`
        INSERT INTO support_tickets
          (ticket_number, client_id, machine_id, subject, description, category, priority, status,
           admin_response, resolved_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        t.ticket_number, client.id, machine?.id || null, t.subject, t.description,
        t.category, t.priority, t.status, t.admin_response || null,
        t.resolved_days_ago ? daysAgo(t.resolved_days_ago) : null,
        daysAgo(t.created_days_ago),
      ]);

      const ticketId = result.insertId;
      for (const [i, [senderType, message]] of t.messages.entries()) {
        await query(`
          INSERT INTO ticket_messages (ticket_id, sender_type, sender_id, message, created_at)
          VALUES (?, ?, ?, ?, ?)
        `, [
          ticketId,
          senderType,
          senderType === 'admin' ? (superAdmin?.id || 1) : client.id,
          message,
          daysAgo(Math.max(0, t.created_days_ago - i)),
        ]);
      }
      ticketsCreated++;
    }
    console.log(`${ticketsCreated} tickets de support créés (avec fil de messages)`);

    // ── Articles de blog ──────────────────────────────────────────
    const blogCats = await query('SELECT id, slug FROM blog_categories');
    const blogCatId = Object.fromEntries(blogCats.map(c => [c.slug, c.id]));

    const articlesData = [
      {
        category: 'actualites',
        title: 'SMALIM ouvre son showroom de Dakar',
        slug: 'smalim-ouvre-showroom-dakar',
        excerpt: 'Un espace de 300 m² à Dakar pour découvrir et tester l\'ensemble de notre gamme de distributeurs automatiques.',
        content: `# Un showroom pour tester avant d'investir

Choisir un distributeur automatique sur catalogue est un exercice difficile. Les dimensions, l'ergonomie de l'écran, le bruit du groupe froid, la capacité réelle des rangées : autant de critères qui se jugent mieux en présence de la machine.

## Ce que vous y trouverez

Notre showroom présente en fonctionnement l'essentiel de la gamme TCN :

- les distributeurs snacks et boissons, du format compact au grand écran 32" ;
- les machines à café à mouture fraîche ;
- les réfrigérateurs intelligents en libre-service.

Chaque machine est alimentée et approvisionnée : vous pouvez réaliser un achat test, du choix du produit au paiement mobile.

## Accompagnement sur place

Nos commerciaux vous aident à dimensionner votre installation en fonction du flux de passage attendu, de la surface disponible et du type de consommation visé. Un chiffrage de rentabilité vous est remis à l'issue de la visite.

**Adresse :** Zone industrielle, Dakar. Ouvert du lundi au vendredi, de 8h à 18h.`,
        read_time: 3,
        status: 'published',
        published_days_ago: 5,
        views: 342,
      },
      {
        category: 'conseils-maintenance',
        title: 'Entretien d\'une machine à café professionnelle : le guide complet',
        slug: 'entretien-machine-cafe-professionnelle',
        excerpt: 'Détartrage, nettoyage du groupe de brassage, réglage de la mouture : les gestes qui prolongent la durée de vie de votre équipement.',
        content: `# Pourquoi l'entretien conditionne la rentabilité

Une machine à café professionnelle mal entretenue perd en qualité de tasse avant de tomber en panne. Le client s'en aperçoit bien avant vous : la fréquentation baisse, puis la machine s'arrête.

## Le rythme à tenir

### Chaque jour
Videz et rincez le bac à marc, essuyez les buses et contrôlez le niveau des conteneurs. Cinq minutes suffisent.

### Chaque semaine
Nettoyez le groupe de brassage avec une pastille dégraissante adaptée. Les huiles de café rancissent et donnent un goût amer que rien d'autre ne corrige.

### Chaque trimestre
Procédez au détartrage. Au Sénégal, la dureté de l'eau varie fortement selon les zones : dans les secteurs les plus calcaires, un rythme mensuel est préférable. Un filtre anticalcaire en amont divise la fréquence par deux.

## Le réglage de mouture

Une mouture trop grossière donne un café clair et acide, trop fine elle bouche le groupe. Ajustez d'un cran à la fois, puis attendez deux ou trois cafés avant de juger : le moulin doit se purger.

## Ce qu'il faut confier à un technicien

Le remplacement des joints de la chaudière, le contrôle de la pression et la vérification électrique relèvent de l'intervention professionnelle. Un contrat de maintenance annuel couvre généralement ces points.`,
        read_time: 6,
        status: 'published',
        published_days_ago: 18,
        views: 1284,
      },
      {
        category: 'etudes-de-cas',
        title: 'UCAD : 5 distributeurs pour 30 000 étudiants',
        slug: 'etude-cas-ucad-distributeurs',
        excerpt: 'Comment l\'Université Cheikh Anta Diop a équipé son campus et absorbé les pics de fréquentation entre les cours.',
        content: `# Le contexte

Avec près de 30 000 étudiants, l'UCAD concentre sa fréquentation sur des créneaux très courts : les dix minutes d'intercours. Les points de restauration traditionnels ne peuvent pas absorber ces pics.

## La contrainte principale

Le débit. Un distributeur classique sert un client toutes les 30 à 45 secondes ; sur un intercours de dix minutes, cela plafonne à une quinzaine de transactions par machine.

## La solution retenue

Cinq machines réparties sur les points de passage plutôt qu'une zone unique :

| Emplacement | Machine | Rôle |
|---|---|---|
| Faculté des Sciences | TCN-CSC-10C (32") | Snacks + boissons, fort volume |
| Bibliothèque centrale | TCN-CSC-6G | Format compact, flux continu |
| Hall administratif | TCN-NCF-7N | Café, personnel enseignant |
| Cité universitaire | TCN-CSC-10G | Snacks, amplitude 24h |
| Faculté de Droit | TCN-CSC-6G | Format compact |

Le paiement mobile (Wave et Orange Money) a été activé sur l'ensemble du parc : il réduit le temps de transaction d'environ 40 % par rapport à l'espèce avec rendu de monnaie.

## Les résultats après six mois

- **21 540** transactions sur la seule machine de la Faculté des Sciences ;
- temps moyen de transaction ramené à **18 secondes** ;
- taux de disponibilité de **97 %**, grâce au réapprovisionnement planifié sur les données de vente.

## L'enseignement principal

Répartir plutôt que concentrer. Deux machines à deux endroits différents servent nettement plus de monde que deux machines côte à côte.`,
        read_time: 5,
        status: 'published',
        published_days_ago: 32,
        views: 876,
      },
      {
        category: 'innovation',
        title: 'Paiement mobile : Wave et Orange Money dans le vending',
        slug: 'paiement-mobile-wave-orange-money-vending',
        excerpt: 'Le paiement mobile change l\'économie du distributeur automatique au Sénégal. Analyse des gains concrets.',
        content: `# Le problème de la monnaie

Le distributeur automatique classique repose sur un monnayeur : il faut l'alimenter en pièces, gérer le rendu, collecter les espèces et supporter le risque associé. Chaque étape coûte du temps et de l'argent.

## Ce que change le paiement mobile

Au Sénégal, le taux d'équipement en portefeuilles mobiles est élevé et l'usage est ancré dans les habitudes quotidiennes. Sur une machine acceptant Wave et Orange Money :

- **plus de rupture de monnaie**, cause n°1 des transactions abandonnées ;
- **collecte supprimée** : les fonds arrivent directement sur le compte marchand ;
- **traçabilité complète** de chaque vente, sans relevé manuel du compteur.

## Le gain sur le temps de transaction

Un paiement par QR code prend environ 12 secondes contre 25 à 30 secondes pour un paiement en espèces avec rendu. Sur un site à forte affluence, cet écart détermine directement le chiffre d'affaires réalisable pendant un pic.

## Ce qu'il faut prévoir

L'intégration passe par l'interface MDB de la machine et un module de connectivité. Prévoyez une couverture réseau correcte à l'emplacement : un distributeur en sous-sol sans relais reste dépendant des espèces.

## Faut-il abandonner l'espèce ?

Non. Le mode mixte reste la bonne réponse : le paiement mobile absorbe l'essentiel du volume, l'espèce couvre les cas résiduels. Supprimer complètement le monnayeur ferme la porte à une part de clientèle encore réelle.`,
        read_time: 4,
        status: 'published',
        published_days_ago: 45,
        views: 1573,
      },
      {
        category: 'conseils-maintenance',
        title: 'Choisir l\'emplacement de son distributeur automatique',
        slug: 'choisir-emplacement-distributeur-automatique',
        excerpt: 'Flux de passage, visibilité, alimentation électrique, réseau : les critères qui décident de la rentabilité d\'une machine.',
        content: `# L'emplacement pèse plus que le modèle

Une machine performante mal placée fait moins de chiffre qu'une machine simple bien placée. L'arbitrage sur l'emplacement mérite plus d'attention que le choix du modèle.

## Les quatre critères déterminants

### 1. Le flux de passage contraint
Un couloir que l'on emprunte par obligation vaut mieux qu'un hall spacieux que l'on traverse rarement. Comptez le passage réel sur une journée type avant de décider.

### 2. Le temps d'attente disponible
Les meilleurs emplacements sont ceux où les gens patientent déjà : salles d'attente, halls d'ascenseur, abords de salles de cours. L'achat comble une attente subie.

### 3. La visibilité frontale
La machine doit être vue de face, pas de profil. Un distributeur perpendiculaire au flux perd une part importante de son potentiel.

### 4. Les contraintes techniques
Prise dédiée 220V à proximité, sol plan et stable, ventilation arrière suffisante pour le groupe froid, couverture réseau si vous activez le paiement mobile.

## Les emplacements à éviter

- Plein soleil : le groupe froid sur-consomme et s'use prématurément.
- Extérieur non abrité : l'humidité endommage l'électronique.
- Zones sans passage nocturne si vous visez une amplitude 24h.

## Tester avant de fixer

Il est souvent possible de positionner la machine à titre provisoire pendant quelques semaines. Les données de vente trancheront mieux que n'importe quelle intuition.`,
        read_time: 4,
        status: 'published',
        published_days_ago: 60,
        views: 2140,
      },
      {
        category: 'actualites',
        title: 'Nouvelle gamme de consommables SMALIM',
        slug: 'nouvelle-gamme-consommables-smalim',
        excerpt: 'Gobelets, cafés, snacks : une gamme de consommables pensée pour les distributeurs, disponible en commande directe.',
        content: `# Une gamme dédiée au vending

Les consommables génériques ne conviennent pas toujours aux distributeurs : diamètre de gobelet inadapté, café soluble qui se dissout mal, formats de snacks incompatibles avec les spirales.

Notre nouvelle gamme est sélectionnée sur ce seul critère : la compatibilité machine.

## Les quatre familles

- **Gobelets et emballages** : formats 18 et 20 cl calibrés pour les distributeurs, couvercles et touillettes.
- **Cafés et boissons** : grains Arabica, solubles à dissolution rapide, chocolat, lait en poudre, thé en dosettes.
- **Produits sucrés** : biscuits, barres chocolatées, chips et cacahuètes en formats vending.
- **Pièces détachées** : spirales, moteurs, filtres et kits de maintenance d'origine.

## Commande et livraison

L'ensemble de la gamme est commandable depuis votre espace client. Livraison sous 48 à 72 heures sur Dakar, sous une semaine dans les autres régions.`,
        read_time: 2,
        status: 'published',
        published_days_ago: 10,
        views: 512,
      },
      {
        category: 'innovation',
        title: 'Réfrigérateurs intelligents : le libre-service 24h/24',
        slug: 'refrigerateurs-intelligents-libre-service',
        excerpt: 'Brouillon : comment les smart fridges à reconnaissance de produits transforment le commerce de proximité.',
        content: `# Le principe

Le réfrigérateur intelligent supprime l'étape de sélection : le client ouvre la porte, prend ce qu'il veut, referme. Le débit est facturé automatiquement.

*(Article en cours de rédaction. Sections à compléter : technologies de détection, retours d'expérience terrain, modèle économique.)*`,
        read_time: 3,
        status: 'draft',
        published_days_ago: null,
        views: 0,
      },
    ];

    let articlesCreated = 0;
    for (const a of articlesData) {
      const [existing] = await query('SELECT id FROM blog_articles WHERE slug = ?', [a.slug]);
      if (existing) continue;

      await query(`
        INSERT INTO blog_articles
          (category_id, author_id, title, slug, excerpt, content, read_time, status, views_count, published_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        blogCatId[a.category], superAdmin?.id || 1, a.title, a.slug, a.excerpt, a.content,
        a.read_time, a.status, a.views,
        a.published_days_ago !== null ? daysAgo(a.published_days_ago) : null,
        daysAgo(a.published_days_ago !== null ? a.published_days_ago + 1 : 3),
      ]);
      articlesCreated++;
    }
    console.log(`${articlesCreated} articles de blog créés`);

    // Illustrations tirées de la banque d'images : ne remplit que les articles
    // sans image, pour respecter un visuel choisi depuis l'admin.
    const blogImages = {
      'smalim-ouvre-showroom-dakar': '/images/machines/sapoe-avm/6.webp',
      'entretien-machine-cafe-professionnelle': '/images/machines/lecon-machine-cafe-instantane/5.webp',
      'etude-cas-ucad-distributeurs': '/images/machines/nexx-distributeur-snacks-boissons/4.webp',
      'paiement-mobile-wave-orange-money-vending': '/images/machines/sen-coffee-distributeur-cafe-grains/10.webp',
      'choisir-emplacement-distributeur-automatique': '/images/machines/sen-coffee-distributeur-cafe-grains/9.webp',
      'nouvelle-gamme-consommables-smalim': '/images/products/kingsmill-french-vanilla-cappuccino/1.webp',
      'refrigerateurs-intelligents-libre-service': '/images/machines/nexx-distributeur-snacks-boissons/2.webp',
    };
    for (const [slug, image] of Object.entries(blogImages)) {
      await query("UPDATE blog_articles SET image_url = ? WHERE slug = ? AND (image_url IS NULL OR image_url = '')", [image, slug]);
    }

    console.log('\n🎉 Seeding terminé avec succès !');
    process.exit(0);
  } catch (error) {
    console.error(' Erreur de seeding:', error.message);
    process.exit(1);
  }
}

seed();
