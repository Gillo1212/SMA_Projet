const { query, queryOne, transaction } = require('../config/database');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('../services/email.service');
const settings = require('../services/settings.service');
const adminNotifications = require('../services/adminNotifications.service');

const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `CMD-${year}-${rand}`;
};

/**
 * Remise d'un code promo sur un sous-total. Une remise fixe ne peut pas
 * dépasser le sous-total : le montant dû ne devient jamais négatif.
 */
function promoDiscount(promo, subtotal) {
  const raw = promo.type === 'percentage'
    ? subtotal * (Number(promo.value) / 100)
    : Number(promo.value);
  return Math.round(Math.min(raw, subtotal));
}

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, client_id, search, date_from, date_to } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = [];
    let params = [];

    if (req.user?.type === 'client') {
      where.push('o.client_id = ?'); params.push(req.user.id);
    } else if (client_id) {
      where.push('o.client_id = ?'); params.push(client_id);
    }

    if (status) { where.push('o.status = ?'); params.push(status); }
    if (date_from) { where.push('o.created_at >= ?'); params.push(date_from); }
    if (date_to) { where.push('o.created_at <= ?'); params.push(date_to + ' 23:59:59'); }
    if (search) { where.push('(o.order_number LIKE ? OR c.email LIKE ? OR c.company_name LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [orders, countResult] = await Promise.all([
      query(`
        SELECT o.*, c.first_name, c.last_name, c.email, c.company_name,
          -- Résumé des articles pour les listes (le détail reste dans GET /orders/:id)
          (SELECT GROUP_CONCAT(CONCAT(oi.quantity, '× ', oi.item_name) ORDER BY oi.id SEPARATOR ', ')
             FROM order_items oi WHERE oi.order_id = o.id) AS items_summary
        FROM orders o LEFT JOIN clients c ON o.client_id = c.id
        ${whereClause} ORDER BY o.created_at DESC LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), offset]),
      query(`SELECT COUNT(*) AS total FROM orders o LEFT JOIN clients c ON o.client_id = c.id ${whereClause}`, params),
    ]);

    res.json({ success: true, data: orders, pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total } });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const order = await queryOne(`
      SELECT o.*, c.first_name, c.last_name, c.email, c.company_name, c.phone
      FROM orders o LEFT JOIN clients c ON o.client_id = c.id WHERE o.id = ?
    `, [req.params.id]);
    if (!order) return res.status(404).json({ success: false, message: 'Commande introuvable' });

    if (req.user?.type === 'client' && order.client_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const [items, tracking] = await Promise.all([
      query('SELECT * FROM order_items WHERE order_id = ?', [order.id]),
      query('SELECT * FROM order_tracking WHERE order_id = ? ORDER BY created_at DESC', [order.id]),
    ]);

    res.json({ success: true, data: { ...order, items, tracking } });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const { items, shipping_address, payment_method, promo_code, notes, delivery_mode } = req.body;
    const clientId = req.user?.type === 'client' ? req.user.id : null;

    if (!items?.length) return res.status(400).json({ success: false, message: 'Aucun article dans la commande' });

    // ── 1. Recharger les prix réels depuis la DB (lecture seule, hors transaction) ──
    const resolvedItems = [];
    for (const item of items) {
      const table = item.type === 'machine' ? 'machines' : 'products';
      const dbItem = await queryOne(
        `SELECT id, name, price, stock FROM ${table} WHERE id = ? AND is_active = 1`,
        [item.id]
      );
      if (!dbItem) {
        return res.status(400).json({ success: false, message: `Article introuvable : ${item.name || item.id}` });
      }
      // Pré-vérification rapide du stock (confort utilisateur — la vérification atomique est dans la transaction)
      if (dbItem.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuffisant pour "${dbItem.name}" (disponible : ${dbItem.stock}, demandé : ${item.quantity})`,
        });
      }
      resolvedItems.push({ ...item, realPrice: dbItem.price, dbName: dbItem.name });
    }

    // ── 2. Totaux calculés côté serveur ──
    // Ni la TVA ni les frais de port ne sont repris du corps de requête :
    // sinon un client pourrait poster tax_amount = 0 et payer moins.
    // Les taux viennent des paramètres du back-office (services/settings).
    const subtotal = resolvedItems.reduce((sum, i) => sum + Number(i.realPrice) * i.quantity, 0);
    const shopConfig = await settings.getShopConfig();
    const deliveryMode = delivery_mode || 'standard';
    if (settings.deliveryFee(shopConfig, deliveryMode, subtotal) === null) {
      return res.status(400).json({ success: false, message: "Ce mode de livraison n'est pas proposé actuellement" });
    }

    // ── 3. Tout dans une transaction atomique ──
    const result = await transaction(async (conn) => {
      // ── 3a. Code promo : incrément atomique dans la transaction ──
      let discount = 0;
      if (promo_code) {
        const [promoResult] = await conn.execute(
          `UPDATE promo_codes SET uses_count = uses_count + 1
           WHERE code = ? AND is_active = 1
             AND (expires_at IS NULL OR expires_at > NOW())
             AND (max_uses IS NULL OR uses_count < max_uses)
             AND (min_order_amount IS NULL OR min_order_amount <= ?)`,
          [promo_code, subtotal]
        );
        if (promoResult.affectedRows > 0) {
          const [promoRows] = await conn.execute('SELECT * FROM promo_codes WHERE code = ?', [promo_code]);
          const promo = promoRows[0];
          if (promo) discount = promoDiscount(promo, subtotal);
        } else {
          // Code refusé (inconnu, expiré, épuisé, minimum non atteint) : on le
          // signale plutôt que de facturer sans la remise que le client attend.
          throw Object.assign(new Error('Code promo invalide ou expiré'), { statusCode: 400 });
        }
      }

      // Livraison et TVA portent sur le montant réellement dû, remise déduite
      const amountDue = subtotal - discount;
      const shipping_amount = settings.deliveryFee(shopConfig, deliveryMode, amountDue);
      const tax_amount = Math.round(amountDue * shopConfig.taxRate / 100);
      const total_amount = amountDue + shipping_amount + tax_amount;
      const orderNumber = generateOrderNumber();

      // ── 3b. Créer la commande ──
      const [orderResult] = await conn.execute(
        `INSERT INTO orders (order_number, client_id, subtotal, tax_amount, tax_rate, shipping_amount, delivery_mode, discount_amount, total_amount, payment_method, promo_code, shipping_address, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        // mysql2 refuse `undefined` : tout champ optionnel doit être explicitement null
        [orderNumber, clientId, subtotal, tax_amount, shopConfig.taxRate, shipping_amount, deliveryMode, discount, total_amount, payment_method, promo_code || null, JSON.stringify(shipping_address), notes ?? null]
      );
      const orderId = orderResult.insertId;

      // ── 3c. Articles + décrement de stock atomique avec vérification ──
      for (const item of resolvedItems) {
        await conn.execute(
          'INSERT INTO order_items (order_id, item_type, item_id, item_name, item_reference, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [orderId, item.type, item.id, item.dbName, item.reference ?? null, item.quantity, item.realPrice, item.quantity * item.realPrice]
        );

        const table = item.type === 'machine' ? 'machines' : 'products';
        const [stockResult] = await conn.execute(
          `UPDATE ${table} SET stock = stock - ? WHERE id = ? AND stock >= ?`,
          [item.quantity, item.id, item.quantity]
        );
        // Si affectedRows === 0 : stock épuisé entre la pré-vérification et la transaction → rollback
        if (stockResult.affectedRows === 0) {
          throw Object.assign(
            new Error(`Stock insuffisant pour "${item.dbName}" au moment de la validation`),
            { statusCode: 409 }
          );
        }
      }

      await conn.execute('INSERT INTO order_tracking (order_id, status, note) VALUES (?, ?, ?)', [orderId, 'pending', 'Commande reçue']);
      return orderId;
    });

    const order = await queryOne('SELECT * FROM orders WHERE id = ?', [result]);

    // Notifications équipe (non bloquantes)
    const buyer = clientId
      ? await queryOne('SELECT first_name, last_name, company_name FROM clients WHERE id = ?', [clientId])
      : null;
    adminNotifications.newOrder(order, buyer && (buyer.company_name || `${buyer.first_name} ${buyer.last_name}`));
    adminNotifications.lowStockAfterOrder(resolvedItems.map(i => ({ type: i.type, id: i.id })));

    // Email de confirmation (non bloquant, uniquement si le client est authentifié)
    if (clientId) {
      const client = await queryOne('SELECT email, first_name FROM clients WHERE id = ?', [clientId]);
      if (client) {
        const orderItems = await query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
        sendOrderConfirmation(client, { ...order, items: orderItems }).catch(err =>
          console.error('[Email] Confirmation commande non envoyée:', err.message)
        );
      }
    }

    res.status(201).json({ success: true, message: 'Commande créée', data: order });
  } catch (error) { next(error); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note, admin_notes } = req.body;
    const order = await queryOne('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ success: false, message: 'Commande introuvable' });

    const updates = { status };
    if (status === 'delivered') updates.delivered_at = new Date();
    if (status === 'cancelled') { updates.cancelled_at = new Date(); updates.cancellation_reason = note; }
    if (admin_notes) updates.admin_notes = admin_notes;

    const setClause = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    await query(`UPDATE orders SET ${setClause} WHERE id = ?`, [...Object.values(updates), req.params.id]);
    await query('INSERT INTO order_tracking (order_id, status, note, created_by) VALUES (?, ?, ?, ?)', [req.params.id, status, note || null, req.user?.id]);

    // Email de mise à jour statut (non bloquant, pour les statuts significatifs)
    const notifiableStatuses = ['confirmed', 'shipped', 'delivered', 'cancelled'];
    // Pas d'email si le statut ne change pas (clic répété sur le statut actuel)
    if (order.client_id && order.status !== status && notifiableStatuses.includes(status)) {
      const client = await queryOne('SELECT email, first_name FROM clients WHERE id = ?', [order.client_id]);
      if (client) {
        sendOrderStatusUpdate(client, order, status).catch(err =>
          console.error('[Email] Mise à jour statut commande non envoyée:', err.message)
        );
      }
    }

    res.json({ success: true, message: 'Statut mis à jour' });
  } catch (error) { next(error); }
};

exports.validatePromo = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    const promo = await queryOne(
      'SELECT * FROM promo_codes WHERE code = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW()) AND (max_uses IS NULL OR uses_count < max_uses)',
      [code]
    );
    if (!promo) return res.status(404).json({ success: false, message: 'Code promo invalide ou expiré' });
    if (promo.min_order_amount && subtotal < promo.min_order_amount) {
      return res.status(400).json({ success: false, message: `Minimum de commande requis : ${promo.min_order_amount} FCFA` });
    }
    const discount = promoDiscount(promo, Number(subtotal));
    res.json({ success: true, discount, type: promo.type, value: Number(promo.value), code: promo.code });
  } catch (error) { next(error); }
};
