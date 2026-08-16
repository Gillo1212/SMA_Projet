require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

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

    // ── Catégories machines ───────────────────────
    const machineCategories = [
      ['Distributeurs Automatiques', 'distributeurs-automatiques', 'Machines de vente automatique'],
      ['Machines à Café', 'machines-cafe', 'Équipements pour café et boissons chaudes'],
      ['Machines à Glace', 'machines-glace', 'Productrices de glace et boissons fraîches'],
      ['Équipements Frigorifiques', 'equipements-frigorifiques', 'Réfrigérateurs et congélateurs professionnels'],
    ];
    for (const [name, slug, desc] of machineCategories) {
      await query('INSERT IGNORE INTO machine_categories (name, slug, description) VALUES (?, ?, ?)', [name, slug, desc]);
    }
    console.log('Catégories machines créées');

    // ── Catégories produits ───────────────────────
    const productCategories = [
      ['Gobelets & Emballages', 'gobelets-emballages', 'Consommables de packaging'],
      ['Cafés & Boissons', 'cafes-boissons', 'Café, chocolat, thé en dosettes'],
      ['Produits Sucrés', 'produits-sucres', 'Snacks et confiseries'],
      ['Pièces Détachées', 'pieces-detachees', 'Pièces de rechange et maintenance'],
    ];
    for (const [name, slug, desc] of productCategories) {
      await query('INSERT IGNORE INTO product_categories (name, slug, description) VALUES (?, ?, ?)', [name, slug, desc]);
    }
    console.log('Catégories produits créées');

    // ── Catégories blog ───────────────────────────
    const blogCategories = [
      ['Actualités', 'actualites'],
      ['Conseils & Maintenance', 'conseils-maintenance'],
      ['Études de cas', 'etudes-de-cas'],
      ['Innovation', 'innovation'],
    ];
    for (const [name, slug] of blogCategories) {
      await query('INSERT IGNORE INTO blog_categories (name, slug) VALUES (?, ?)', [name, slug]);
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

    // ── Machines TCN ──────────────────────────────────────────────
    // Récupérer les IDs de catégories
    const [catDistrib] = await query("SELECT id FROM machine_categories WHERE slug = 'distributeurs-automatiques'");
    const [catCafe]    = await query("SELECT id FROM machine_categories WHERE slug = 'machines-cafe'");
    const [catFrigo]   = await query("SELECT id FROM machine_categories WHERE slug = 'equipements-frigorifiques'");

    const idDistrib = catDistrib?.id;
    const idCafe    = catCafe?.id;
    const idFrigo   = catFrigo?.id;

    const paymentModes = JSON.stringify(['wave', 'orange_money', 'carte_bancaire', 'especes', 'qr_code']);

    const machinesData = [
      // ── Machines à Café ─────────────────────────────────────────
      {
        category_id: idCafe,
        name: 'TCN Machine à Café Commerciale',
        slug: 'tcn-ncf-7n-v22',
        model_ref: 'TCN-NCF-7N(V22)',
        brand: 'TCN',
        description: 'Machine à café professionnelle haute capacité. 20 variétés de boissons chaudes, mouture fraîche intégrée, chaudière haute pression 92°C. Idéale pour les grandes entreprises, hôtels et centres commerciaux.',
        stock: 5,
        delivery_delay: '7-14 jours ouvrés',
        is_featured: 1,
        specifications: JSON.stringify({
          dimensions: 'H: 194 cm × L: 73,5 cm × P: 79 cm',
          poids: '220 kg',
          temperature: '92°C',
          capacite_gobelets: '160 gobelets',
          boissons: '20 boissons chaudes',
          affichage: 'Écran tactile couleur',
          certifications: 'CE, CB, ISO9001, SGS',
          interface: 'MDB/DEX'
        }),
      },
      {
        category_id: idCafe,
        name: 'TCN Mini Machine à Café',
        slug: 'tcn-ncf-4n-v10',
        model_ref: 'TCN-NCF-4N(V10.1)',
        brand: 'TCN',
        description: 'Machine à café compacte avec mouture fraîche. Format ultra-compact, 4 conteneurs d\'ingrédients, chauffe rapide 3000W, température de brassage 92°C. Parfaite pour les PME et espaces réduits.',
        stock: 8,
        delivery_delay: '5-10 jours ouvrés',
        is_featured: 0,
        specifications: JSON.stringify({
          dimensions: 'H: 81 cm × L: 50 cm × P: 45 cm',
          temperature: '92°C',
          puissance: '3000W (pointe)',
          conteneurs: '4 conteneurs d\'ingrédients',
          affichage: 'Écran 10" couleur',
          certifications: 'CE, CB, ISO9001'
        }),
      },
      // ── Distributeurs Automatiques ──────────────────────────────
      {
        category_id: idDistrib,
        name: 'TCN Distributeur Snack & Boissons Standard',
        slug: 'tcn-csc-10g-h5',
        model_ref: 'TCN-CSC-10G(H5)',
        brand: 'TCN',
        description: 'Distributeur automatique polyvalent. 60 emplacements snacks + 300 boissons réfrigérées. Température 2–25°C, écran LED 5", puissance réfrigération 422W. Certifié CE, CB, ISO9001.',
        stock: 10,
        delivery_delay: '7-14 jours ouvrés',
        is_featured: 1,
        specifications: JSON.stringify({
          dimensions: 'H: 194 cm × L: 103,6 cm × P: 79 cm',
          poids: '261 kg',
          capacite_snacks: '60 emplacements spirales',
          capacite_boissons: '300 bouteilles / canettes',
          affichage: 'Écran LED 5"',
          puissance: '422W (réfrigération)',
          temperature: '2°C à 25°C',
          certifications: 'CE, CB, ISO9001, SGS'
        }),
      },
      {
        category_id: idDistrib,
        name: 'TCN Distributeur Snack & Boissons Compact',
        slug: 'tcn-csc-6g-h5',
        model_ref: 'TCN-CSC-6G(H5)',
        brand: 'TCN',
        description: 'Distributeur slim pour espaces contraints. 36 emplacements snacks + 180 boissons réfrigérées. Même technologie que le modèle standard dans un format plus étroit.',
        stock: 8,
        delivery_delay: '7-14 jours ouvrés',
        is_featured: 0,
        specifications: JSON.stringify({
          dimensions: 'H: 194 cm × L: 73,2 cm × P: 79 cm',
          poids: '261 kg',
          capacite_snacks: '36 emplacements spirales',
          capacite_boissons: '180 bouteilles / canettes',
          affichage: 'Écran LED 5"',
          puissance: '422W (réfrigération)',
          temperature: '2°C à 25°C',
          certifications: 'CE, CB, ISO9001'
        }),
      },
      {
        category_id: idDistrib,
        name: 'TCN Distributeur Grand Écran 32"',
        slug: 'tcn-csc-10c-32v',
        model_ref: 'TCN-CSC-10C(32V)',
        brand: 'TCN',
        description: 'Distributeur avec grand écran 32" pour une expérience premium. 60 emplacements snacks + 300 boissons réfrigérées. Affichage publicitaire et catalogue produit visuel.',
        stock: 5,
        delivery_delay: '7-14 jours ouvrés',
        is_featured: 1,
        specifications: JSON.stringify({
          dimensions: 'H: 194,5 cm × L: 143 cm × P: 79 cm',
          poids: '300 kg',
          capacite_snacks: '60 emplacements spirales',
          capacite_boissons: '300 bouteilles / canettes',
          affichage: 'Écran 32"',
          puissance: '422W (réfrigération)',
          temperature: '2°C à 25°C',
          certifications: 'CE, CB, ISO9001, SGS'
        }),
      },
      {
        category_id: idDistrib,
        name: 'TCN Distributeur Tactile Publicitaire 49"',
        slug: 'tcn-csc-8c-50sp',
        model_ref: 'TCN-CSC-8C(50SP)',
        brand: 'TCN',
        description: 'Distributeur premium avec écran tactile 49". 48 emplacements snacks + 240 boissons réfrigérées. Diffusion HD de publicités, interface tactile immersive. Solution marketing autant que distributeur.',
        stock: 3,
        delivery_delay: '10-14 jours ouvrés',
        is_featured: 1,
        specifications: JSON.stringify({
          dimensions: 'H: 196 cm × L: 104,2 cm × P: 89 cm',
          poids: '320 kg',
          capacite_snacks: '48 emplacements spirales',
          capacite_boissons: '240 bouteilles / canettes',
          affichage: 'Écran tactile 49"',
          puissance: '458W (réfrigération)',
          temperature: '4°C à 25°C',
          certifications: 'CE, CB, ISO9001, SGS'
        }),
      },
      {
        category_id: idDistrib,
        name: 'TCN Distributeur Combiné Snack + Boissons + Café',
        slug: 'tcn-60g-c4',
        model_ref: 'TCN-60G-C4',
        brand: 'TCN',
        description: 'Solution tout-en-un : café fraîchement moulu (130 gobelets) + 60 emplacements snacks + boissons réfrigérées. Une seule machine pour tous les besoins. Puissance 1800W chauffe / 505W réfrigération.',
        stock: 3,
        delivery_delay: '10-14 jours ouvrés',
        is_featured: 1,
        specifications: JSON.stringify({
          dimensions: 'H: 194 cm × L: 140 cm × P: 79 cm',
          poids: '920 kg',
          capacite_snacks: '60 emplacements spirales',
          capacite_cafe: '130 gobelets',
          puissance_chauffe: '1800W',
          puissance_froid: '505W',
          certifications: 'CE, CB, ISO9001, SGS'
        }),
      },
      // ── Équipements Frigorifiques ────────────────────────────────
      {
        category_id: idFrigo,
        name: 'TCN Smart Fridge Réfrigérée 24h',
        slug: 'tcn-cfz-510l',
        model_ref: 'TCN-CFZ-510L',
        brand: 'TCN',
        description: 'Réfrigérateur intelligent connecté 510L en libre-service 24h/24. Température 0–10°C, ~200 bouteilles, format slim. Paiement mobile intégré. Idéal pour hôtels, commerces de proximité et pharmacies.',
        stock: 6,
        delivery_delay: '7-14 jours ouvrés',
        is_featured: 0,
        specifications: JSON.stringify({
          dimensions: 'H: 210 cm × L: 65 cm × P: 69 cm',
          poids: '140 kg',
          capacite: '510 L / ~200 bouteilles',
          temperature: '0°C à 10°C',
          acces: 'Libre-service 24h/24',
          certifications: 'CE, CB, ISO9001'
        }),
      },
      {
        category_id: idFrigo,
        name: 'TCN Smart Cooler Grande Capacité',
        slug: 'tcn-cfz-1200-v10',
        model_ref: 'TCN-CFZ-1200(V10)',
        brand: 'TCN',
        description: 'Réfrigérateur intelligent grande capacité. 5 étagères de 30 plateaux, température 0–10°C, consommation optimisée 3 kWh/jour. Système IA multi-capteurs. Pour grandes surfaces et volumes importants.',
        stock: 4,
        delivery_delay: '10-14 jours ouvrés',
        is_featured: 0,
        specifications: JSON.stringify({
          dimensions: 'H: 212 cm × L: 126,5 cm × P: 71,5 cm',
          poids: '180 kg',
          capacite: '5 étagères / 30 plateaux',
          temperature: '0°C à 10°C',
          consommation: '3,0 kWh/jour',
          certifications: 'CE, CB, ISO9001'
        }),
      },
    ];

    for (const m of machinesData) {
      await query(`
        INSERT IGNORE INTO machines
          (category_id, name, slug, description, price, stock, unit, brand, model_ref,
           delivery_delay, specifications, payment_modes, is_active, is_featured)
        VALUES (?, ?, ?, ?, 0.00, ?, 'unité', ?, ?, ?, ?, ?, 1, ?)
      `, [
        m.category_id, m.name, m.slug, m.description,
        m.stock, m.brand, m.model_ref, m.delivery_delay,
        m.specifications, paymentModes, m.is_featured
      ]);
    }
    console.log(`${machinesData.length} machines TCN créées`);

    console.log('\n🎉 Seeding terminé avec succès !');
    process.exit(0);
  } catch (error) {
    console.error(' Erreur de seeding:', error.message);
    process.exit(1);
  }
}

seed();
