/**
 * Outils communs des tests d'API.
 *
 *   const { api, resetDatabase, closeDatabase, tokens, ids } = require('./setup');
 *   beforeAll(resetDatabase);
 *   afterAll(closeDatabase);
 *   await api.get('/api/orders').set(auth('client'));
 *
 * Chaque fichier repart d'une base vidée puis remplie avec le jeu de données
 * ci-dessous (fichiers exécutés l'un après l'autre : --runInBand).
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../../app');
const { pool, query } = require('../../config/database');
const { outbox } = require('../../services/email.service');

const api = request(app);

const PASSWORD = 'Test-mdp-2026';

// Identifiants fixes : les tests s'y réfèrent directement
const ids = {
  superAdmin: 1, admin: 2, commercial: 3, inactiveAdmin: 4,
  client: 1, otherClient: 2, inactiveClient: 3,
  machineCategory: 1, emptyMachineCategory: 2,
  machine: 1, inactiveMachine: 2,
  productCategory: 1,
  product: 1, lowStockProduct: 2, inactiveProduct: 3,
  order: 1, otherClientOrder: 2, shippedOrder: 3,
  quote: 1, quotedQuote: 2, expiredQuote: 3,
  blogCategory: 1, publishedArticle: 1, draftArticle: 2,
  promo: 1,
  clientMachine: 1,
  ticket: 1,
  invoice: 1,
};

const TABLES = [
  'ticket_messages', 'support_tickets', 'invoices', 'client_machines', 'payment_transactions',
  'order_tracking', 'order_items', 'orders', 'quotes', 'blog_articles', 'blog_categories',
  'products', 'product_categories', 'machines', 'machine_categories', 'promo_codes',
  'auth_tokens', 'settings', 'contact_messages', 'newsletter_subscribers', 'clients', 'admins',
];

const json = v => JSON.stringify(v);

async function seed() {
  // Coût réduit : on teste la logique, pas la robustesse du hachage
  const hash = await bcrypt.hash(PASSWORD, 4);

  await query(
    `INSERT INTO admins (id, email, password, first_name, last_name, role, is_active) VALUES
     (1, 'super@smalim.test', ?, 'Sana', 'Super', 'super_admin', 1),
     (2, 'admin@smalim.test', ?, 'Adama', 'Admin', 'admin', 1),
     (3, 'commercial@smalim.test', ?, 'Codou', 'Commercial', 'commercial', 1),
     (4, 'ancien@smalim.test', ?, 'Ancien', 'Admin', 'admin', 0)`,
    [hash, hash, hash, hash],
  );
  await query(
    `INSERT INTO clients (id, email, password, first_name, last_name, company_name, phone, city, is_active, email_verified) VALUES
     (1, 'client@entreprise.test', ?, 'Awa', 'Diop', 'Entreprise Test', '+221770000001', 'Dakar', 1, 1),
     (2, 'autre@entreprise.test', ?, 'Moussa', 'Fall', 'Autre SARL', '+221770000002', 'Thiès', 1, 1),
     (3, 'inactif@entreprise.test', ?, 'Ines', 'Inactif', NULL, NULL, NULL, 0, 1)`,
    [hash, hash, hash],
  );

  await query(
    `INSERT INTO machine_categories (id, name, slug) VALUES
     (1, 'Machines à café', 'machines-a-cafe'), (2, 'Machines à glace', 'machines-a-glace')`,
  );
  await query(
    `INSERT INTO machines (id, category_id, name, slug, description, price, stock, brand, model_ref, delivery_delay, image_url, gallery, specifications, payment_modes, is_active, is_featured) VALUES
     (1, 1, 'Lecon Good Taste 50S', 'lecon-good-taste-50s', 'Distributeur de café instantané. Cinq boissons.', 0, 5, 'Lecon', '50S', '3-7 jours ouvrés',
      '/images/machines/lecon/1.webp', ?, ?, ?, 1, 1),
     (2, 1, 'Ancienne machine', 'ancienne-machine', 'Retirée du catalogue.', 100000, 0, 'X', NULL, NULL, NULL, '[]', '{}', '[]', 0, 0)`,
    [json(['/images/machines/lecon/1.webp']), json({ poids: '31 kg', dimensions: 'L 430 × P 490 × H 780 mm' }), json(['wave', 'orange_money', 'card', 'cash'])],
  );

  await query(`INSERT INTO product_categories (id, name, slug) VALUES (1, 'Cafés et boissons', 'cafes-et-boissons')`);
  await query(
    `INSERT INTO products (id, category_id, name, slug, description, price, stock, unit, brand, reference, image_url, gallery, specifications, is_active, is_featured) VALUES
     (1, 1, 'Café de Colombie', 'cafe-de-colombie', 'Café en grains 907 g.', 14500, 100, 'sachet', 'Craft Roasters', 'CAF-COL', '/images/products/cafe.webp', ?, '{}', 1, 1),
     (2, 1, 'Chocolat chaud', 'chocolat-chaud', 'Poudre instantanée.', 13500, 3, 'sachet', 'Kingsmill', 'CHO-01', NULL, '[]', '{}', 1, 0),
     (3, 1, 'Produit retiré', 'produit-retire', NULL, 1000, 50, 'unité', NULL, NULL, NULL, '[]', '{}', 0, 0)`,
    [json(['/images/products/cafe.webp'])],
  );

  await query(
    `INSERT INTO promo_codes (id, code, type, value, min_order_amount, max_uses, uses_count, is_active, expires_at) VALUES
     (1, 'BIENVENUE10', 'percentage', 10, NULL, NULL, 0, 1, NULL),
     (2, 'MOINS5000', 'fixed', 5000, 20000, NULL, 0, 1, NULL),
     (3, 'EXPIRE', 'percentage', 50, NULL, NULL, 0, 1, '2020-01-01 00:00:00'),
     (4, 'EPUISE', 'percentage', 50, NULL, 1, 1, 1, NULL)`,
  );

  const address = json({ line1: 'Rue 10', city: 'Dakar' });
  await query(
    `INSERT INTO orders (id, order_number, client_id, status, subtotal, tax_amount, tax_rate, shipping_amount, delivery_mode, discount_amount, total_amount, payment_method, payment_status, shipping_address) VALUES
     (1, 'CMD-TEST-00001', 1, 'pending',  29000, 5220, 18, 2500, 'standard', 0, 36720, 'wave', 'pending', ?),
     (2, 'CMD-TEST-00002', 2, 'pending',  14500, 2610, 18, 0, 'pickup', 0, 17110, 'cash', 'pending', ?),
     (3, 'CMD-TEST-00003', 1, 'shipped',  13500, 2430, 18, 2500, 'standard', 0, 18430, 'wave', 'paid', ?)`,
    [address, address, address],
  );
  await query(
    `INSERT INTO order_items (order_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
     (1, 'product', 1, 'Café de Colombie', 2, 14500, 29000),
     (2, 'product', 1, 'Café de Colombie', 1, 14500, 14500),
     (3, 'product', 2, 'Chocolat chaud', 1, 13500, 13500)`,
  );
  await query(`INSERT INTO order_tracking (order_id, status, note) VALUES (1, 'pending', 'Commande reçue'), (3, 'shipped', 'Expédiée')`);

  await query(
    `INSERT INTO quotes (id, quote_number, client_id, company_name, contact_name, contact_email, machine_type, description, quantity, status, proposed_amount, admin_response, expires_at) VALUES
     (1, 'DEV-TEST-00001', 1, 'Entreprise Test', 'Awa Diop', 'client@entreprise.test', 'Machine à café', 'Deux machines pour nos bureaux.', 2, 'pending', NULL, NULL, NULL),
     (2, 'DEV-TEST-00002', 1, 'Entreprise Test', 'Awa Diop', 'client@entreprise.test', 'Machine à café', 'Une machine en location.', 1, 'quoted', 1500000, 'Proposition jointe.', DATE_ADD(NOW(), INTERVAL 15 DAY)),
     (3, 'DEV-TEST-00003', 1, 'Entreprise Test', 'Awa Diop', 'client@entreprise.test', 'Machine à café', 'Ancienne demande.', 1, 'quoted', 900000, 'Offre passée.', DATE_SUB(NOW(), INTERVAL 1 DAY))`,
  );

  await query(`INSERT INTO blog_categories (id, name, slug) VALUES (1, 'Actualités', 'actualites')`);
  await query(
    `INSERT INTO blog_articles (id, category_id, author_id, title, slug, excerpt, content, read_time, status, published_at) VALUES
     (1, 1, 1, 'Article publié', 'article-publie', 'Résumé', '<p>Contenu</p>', 3, 'published', NOW()),
     (2, 1, 1, 'Brouillon', 'brouillon', 'Résumé', '<p>Pas encore</p>', 3, 'draft', NULL)`,
  );

  await query(
    `INSERT INTO client_machines (id, client_id, machine_id, serial_number, location, status) VALUES
     (1, 1, 1, 'SN-0001', 'Hall', 'active')`,
  );
  await query(
    `INSERT INTO support_tickets (id, ticket_number, client_id, machine_id, subject, description, category, priority, status) VALUES
     (1, 'TKT-TEST-00001', 1, 1, 'Machine bloquée', 'Le monnayeur ne répond plus.', 'panne', 'high', 'open')`,
  );
  await query(
    `INSERT INTO invoices (id, invoice_number, order_id, client_id, amount_ht, tax_rate, tax_amount, amount_ttc, status) VALUES
     (1, 'FAC-TEST-00001', 3, 1, 16000, 18, 2430, 18430, 'paid')`,
  );
}

async function resetDatabase() {
  await query('SET FOREIGN_KEY_CHECKS = 0');
  for (const table of TABLES) await query(`TRUNCATE TABLE ${table}`);
  await query('SET FOREIGN_KEY_CHECKS = 1');
  await seed();
  outbox.length = 0;
}

async function closeDatabase() {
  // Laisse finir les envois « fire and forget » (notifications) avant de fermer
  await new Promise(resolve => setTimeout(resolve, 150));
  await pool.end();
}

/** Jetons signés directement (pas de passage par /login à chaque test) */
const tokens = {
  superAdmin: () => jwt.sign({ id: ids.superAdmin, email: 'super@smalim.test', type: 'admin', role: 'super_admin' }, process.env.JWT_SECRET),
  admin: () => jwt.sign({ id: ids.admin, email: 'admin@smalim.test', type: 'admin', role: 'admin' }, process.env.JWT_SECRET),
  commercial: () => jwt.sign({ id: ids.commercial, email: 'commercial@smalim.test', type: 'admin', role: 'commercial' }, process.env.JWT_SECRET),
  client: () => jwt.sign({ id: ids.client, email: 'client@entreprise.test', type: 'client' }, process.env.JWT_SECRET),
  otherClient: () => jwt.sign({ id: ids.otherClient, email: 'autre@entreprise.test', type: 'client' }, process.env.JWT_SECRET),
  inactiveClient: () => jwt.sign({ id: ids.inactiveClient, email: 'inactif@entreprise.test', type: 'client' }, process.env.JWT_SECRET),
};

/** En-tête Authorization pour un rôle : `.set(auth('admin'))` */
const auth = role => ({ Authorization: `Bearer ${tokens[role]()}` });

/** Dernier email « envoyé » (transport en mémoire) */
const lastEmail = () => outbox[outbox.length - 1];

module.exports = { api, ids, PASSWORD, resetDatabase, closeDatabase, tokens, auth, query, outbox, lastEmail };
