const crypto = require('crypto');
const { query, queryOne, transaction } = require('../config/database');
const payment = require('../services/payment');
const { sendOrderConfirmation } = require('../services/email.service');

/** Référence interne transmise au prestataire — unique par tentative */
function generateReference(orderNumber) {
  return `${orderNumber}-${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * POST /api/payments/initiate
 * Body : { order_id }
 *
 * Crée une transaction et renvoie l'URL de redirection du prestataire.
 * Le montant vient toujours de la commande en base, jamais du client.
 */
exports.initiate = async (req, res, next) => {
  try {
    const { order_id } = req.body;

    const order = await queryOne('SELECT * FROM orders WHERE id = ?', [order_id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande introuvable' });
    }

    // Un client ne peut payer que ses propres commandes
    if (req.user?.type === 'client' && order.client_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    if (order.payment_status === 'paid') {
      return res.status(409).json({ success: false, message: 'Cette commande est déjà payée' });
    }

    if (payment.isOfflineMethod(order.payment_method)) {
      return res.status(400).json({
        success: false,
        message: 'Ce mode de règlement ne passe pas par un paiement en ligne',
      });
    }

    const { provider, simulated } = payment.getProvider(order.payment_method);

    const reference = generateReference(order.order_number);
    const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
    const backend = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

    // La transaction est enregistrée avant l'appel : si le prestataire répond
    // mais que l'on plante ensuite, la trace existe déjà.
    const inserted = await query(
      `INSERT INTO payment_transactions (order_id, provider, status, amount, currency, reference)
       VALUES (?, ?, 'pending', ?, ?, ?)`,
      [order.id, order.payment_method, order.total_amount, order.currency || 'XOF', reference]
    );

    let session;
    try {
      session = await provider.createCheckout({
        reference,
        amount: Number(order.total_amount),
        currency: order.currency || 'XOF',
        successUrl: `${frontend}/paiement/retour?reference=${reference}`,
        errorUrl: `${frontend}/paiement/retour?reference=${reference}&echec=1`,
        notifUrl: `${backend}/api/payments/webhook/${order.payment_method}`,
      });
    } catch (err) {
      await query(
        `UPDATE payment_transactions SET status = 'failed', failure_reason = ? WHERE id = ?`,
        [err.message, inserted.insertId]
      );
      return res.status(502).json({ success: false, message: err.message });
    }

    await query(
      `UPDATE payment_transactions
       SET status = 'processing', provider_ref = ?, checkout_url = ?, raw_payload = ?
       WHERE id = ?`,
      [session.providerRef, session.checkoutUrl, JSON.stringify(session.raw ?? {}), inserted.insertId]
    );

    res.json({
      success: true,
      data: {
        reference,
        checkout_url: session.checkoutUrl,
        provider: order.payment_method,
        simulated,
      },
    });
  } catch (error) { next(error); }
};

/**
 * Applique le résultat d'un paiement de façon idempotente : un même événement
 * reçu deux fois ne doit pas repasser la commande ni réenvoyer l'email.
 *
 * @returns {Promise<{ applied: boolean, reason?: string }>}
 */
async function applyPaymentResult({ reference, status, amount, providerRef, rawEvent }) {
  const tx = await queryOne('SELECT * FROM payment_transactions WHERE reference = ?', [reference]);
  if (!tx) return { applied: false, reason: 'transaction inconnue' };

  // Déjà traitée : on ne rejoue rien
  if (tx.status === 'succeeded') return { applied: false, reason: 'déjà confirmée' };

  // Le montant annoncé doit correspondre à ce que l'on attend
  if (status === 'succeeded' && amount != null && Math.round(Number(tx.amount)) !== Math.round(amount)) {
    await query(
      `UPDATE payment_transactions
       SET status = 'failed', failure_reason = ?, raw_payload = ?
       WHERE id = ?`,
      [
        `Montant incohérent : attendu ${tx.amount}, reçu ${amount}`,
        JSON.stringify(rawEvent ?? {}),
        tx.id,
      ]
    );
    return { applied: false, reason: 'montant incohérent' };
  }

  if (status !== 'succeeded') {
    await query(
      `UPDATE payment_transactions SET status = ?, provider_ref = COALESCE(?, provider_ref), raw_payload = ? WHERE id = ?`,
      [status, providerRef, JSON.stringify(rawEvent ?? {}), tx.id]
    );
    return { applied: true };
  }

  // Succès : transaction + commande + suivi, en une seule unité
  await transaction(async (conn) => {
    await conn.execute(
      `UPDATE payment_transactions
       SET status = 'succeeded', paid_at = NOW(), provider_ref = COALESCE(?, provider_ref), raw_payload = ?
       WHERE id = ?`,
      [providerRef, JSON.stringify(rawEvent ?? {}), tx.id]
    );

    await conn.execute(
      `UPDATE orders
       SET payment_status = 'paid',
           payment_reference = ?,
           status = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END
       WHERE id = ?`,
      [reference, tx.order_id]
    );

    await conn.execute(
      'INSERT INTO order_tracking (order_id, status, note) VALUES (?, ?, ?)',
      [tx.order_id, 'confirmed', 'Paiement confirmé']
    );
  });

  // Email de confirmation, non bloquant
  const order = await queryOne('SELECT * FROM orders WHERE id = ?', [tx.order_id]);
  if (order?.client_id) {
    const client = await queryOne('SELECT email, first_name FROM clients WHERE id = ?', [order.client_id]);
    if (client) {
      const items = await query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      sendOrderConfirmation(client, { ...order, items }).catch(err =>
        console.error('[Email] Confirmation commande non envoyée:', err.message)
      );
    }
  }

  return { applied: true };
}

/**
 * POST /api/payments/webhook/:provider
 * Route publique appelée par le prestataire — jamais par le navigateur.
 */
exports.webhook = async (req, res, next) => {
  try {
    const providerName = req.params.provider;
    const provider = payment.getProviderForWebhook(providerName);

    if (!provider) {
      return res.status(404).json({ success: false, message: 'Prestataire inconnu' });
    }

    // `req.rawBody` est capté par le body-parser (voir server.js) : la
    // signature se calcule sur les octets reçus, pas sur le JSON re-sérialisé.
    if (provider.name === 'wave') {
      const valid = provider.verifyWebhook(req.rawBody ?? '', req.get('Wave-Signature'));
      if (!valid) {
        return res.status(401).json({ success: false, message: 'Signature invalide' });
      }
    }

    const parsed = provider.parseWebhookEvent(req.body);
    if (!parsed.reference) {
      return res.status(400).json({ success: false, message: 'Référence absente' });
    }

    // Orange Money ne signe pas : on compare le notif_token à celui émis
    if (provider.name === 'orange_money') {
      const tx = await queryOne(
        'SELECT raw_payload FROM payment_transactions WHERE reference = ?',
        [parsed.reference]
      );
      const expected = tx?.raw_payload?.notif_token;
      if (!expected || req.body?.notif_token !== expected) {
        return res.status(401).json({ success: false, message: 'Jeton de notification invalide' });
      }
    }

    const result = await applyPaymentResult({ ...parsed, rawEvent: req.body });

    // On répond 200 même si l'événement est ignoré : sinon le prestataire
    // rejoue indéfiniment une notification déjà traitée.
    res.json({ success: true, applied: result.applied, reason: result.reason });
  } catch (error) { next(error); }
};

/**
 * GET /api/payments/status/:reference
 * Le frontend interroge cette route au retour du prestataire, le temps que
 * le webhook arrive.
 */
exports.getStatus = async (req, res, next) => {
  try {
    const tx = await queryOne(
      `SELECT pt.reference, pt.status, pt.provider, pt.amount, pt.currency, pt.failure_reason,
              o.id AS order_id, o.order_number, o.payment_status, o.status AS order_status, o.client_id
       FROM payment_transactions pt
       JOIN orders o ON o.id = pt.order_id
       WHERE pt.reference = ?`,
      [req.params.reference]
    );

    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction introuvable' });
    }

    if (req.user?.type === 'client' && tx.client_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const { client_id: _clientId, ...data } = tx;
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

/**
 * POST /api/payments/simulate
 * Réservé au développement : rejoue l'issue d'un paiement sans prestataire.
 */
exports.simulate = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ success: false, message: 'Route indisponible' });
    }

    const { reference, status = 'succeeded' } = req.body;
    if (!reference) {
      return res.status(400).json({ success: false, message: 'Référence requise' });
    }

    const tx = await queryOne('SELECT amount FROM payment_transactions WHERE reference = ?', [reference]);
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction introuvable' });
    }

    const result = await applyPaymentResult({
      reference,
      status,
      amount: Number(tx.amount),
      providerRef: `sim_${reference}`,
      rawEvent: { simulated: true, status },
    });

    res.json({ success: true, applied: result.applied, reason: result.reason });
  } catch (error) { next(error); }
};

/** GET /api/payments/config — diagnostic admin */
exports.getConfiguration = async (req, res, next) => {
  try {
    res.json({ success: true, data: payment.configurationStatus() });
  } catch (error) { next(error); }
};
