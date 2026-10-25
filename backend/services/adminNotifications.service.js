/**
 * Notifications email à l'équipe
 * ──────────────────────────────
 * Réglées dans Paramètres → Notifications : chaque type s'active
 * séparément et part vers `notif_admin_email`. Les envois ne bloquent jamais
 * l'action qui les déclenche (commande, inscription…) : une erreur SMTP est
 * journalisée, pas renvoyée au client.
 */
const { query } = require('../config/database');
const settings = require('./settings.service');
const { sendAdminNotification } = require('./email.service');

const fcfa = n => `${Number(n).toLocaleString('fr-FR')} FCFA`;

async function recipientFor(settingKey) {
  const s = await settings.getAll();
  if (s[settingKey] !== '1' || !s.notif_admin_email) return null;
  return s.notif_admin_email;
}

function fireAndForget(label, promise) {
  promise.catch(err => console.error(`[Notification] ${label} non envoyée :`, err.message));
}

/** Nouvelle commande (à sa création, paiement en attente) */
function newOrder(order, clientName) {
  fireAndForget('nouvelle commande', (async () => {
    const to = await recipientFor('notif_new_order');
    if (!to) return;
    await sendAdminNotification(to, {
      subject: `Nouvelle commande ${order.order_number}`,
      title: `Nouvelle commande ${order.order_number}`,
      intro: `${clientName || 'Un client'} vient de passer commande. Le paiement est en attente de confirmation.`,
      lines: [
        ['Montant TTC', fcfa(order.total_amount)],
        ['Livraison', { pickup: 'Retrait en magasin', standard: 'Standard', express: 'Express' }[order.delivery_mode] ?? '-'],
        ['Paiement', order.payment_method === 'orange_money' ? 'Orange Money' : 'Wave'],
        ...(order.promo_code ? [['Code promo', order.promo_code]] : []),
      ],
      linkPath: '/admin/commandes',
      linkLabel: 'Voir les commandes',
    });
  })());
}

/**
 * Stock faible après une commande : une seule alerte regroupe les articles
 * passés au seuil ou en dessous.
 * @param {{ type: 'product'|'machine', id: number }[]} items
 */
function lowStockAfterOrder(items) {
  fireAndForget('stock faible', (async () => {
    const to = await recipientFor('notif_low_stock');
    if (!to) return;
    const threshold = Number((await settings.getAll()).notif_low_stock_threshold);
    const low = [];
    for (const item of items) {
      const table = item.type === 'machine' ? 'machines' : 'products';
      const [row] = await query(`SELECT name, stock FROM ${table} WHERE id = ?`, [item.id]);
      if (row && Number(row.stock) <= threshold) low.push([row.name, `${row.stock} en stock`]);
    }
    if (!low.length) return;
    await sendAdminNotification(to, {
      subject: `Stock faible : ${low.length} article(s)`,
      title: 'Stock faible',
      intro: `Ces articles sont à ${threshold} unité(s) ou moins après la dernière commande.`,
      lines: low,
      linkPath: '/admin/produits',
      linkLabel: 'Gérer les stocks',
    });
  })());
}

/** Nouvelle demande de devis */
function newQuote(quote) {
  fireAndForget('nouveau devis', (async () => {
    const to = await recipientFor('notif_new_quote');
    if (!to) return;
    await sendAdminNotification(to, {
      subject: `Nouvelle demande de devis ${quote.quote_number ?? ''}`.trim(),
      title: 'Nouvelle demande de devis',
      intro: `${quote.contact_name || 'Un prospect'}${quote.company_name ? ` (${quote.company_name})` : ''} demande un devis.`,
      lines: [
        ['Machine(s)', quote.machine_type || '-'],
        ['Quantité', quote.quantity ?? '-'],
        ['Email', quote.contact_email || '-'],
        ['Téléphone', quote.contact_phone || '-'],
      ],
      linkPath: '/admin/devis',
      linkLabel: 'Voir les devis',
    });
  })());
}

/** Nouveau compte client */
function newClient(client) {
  fireAndForget('nouveau client', (async () => {
    const to = await recipientFor('notif_new_client');
    if (!to) return;
    await sendAdminNotification(to, {
      subject: `Nouveau client : ${client.first_name} ${client.last_name}`,
      title: 'Nouveau compte client',
      intro: 'Un client vient de créer son compte sur le site.',
      lines: [
        ['Nom', `${client.first_name} ${client.last_name}`],
        ['Entreprise', client.company_name || '-'],
        ['Email', client.email],
        ['Téléphone', client.phone || '-'],
      ],
      linkPath: '/admin/clients',
      linkLabel: 'Voir les clients',
    });
  })());
}

module.exports = { newOrder, lowStockAfterOrder, newQuote, newClient };
