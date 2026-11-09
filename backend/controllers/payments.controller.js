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

    // Mode qui n'est plus proposé (ancienne commande « carte » ou Orange Money) : réglée par Wave
    if (!payment.isOnlineMethod(order.payment_method)) {
      order.payment_method = payment.DEFAULT_ONLINE_METHOD;
      await query('UPDATE orders SET payment_method = ? WHERE id = ?', [order.payment_method, order.id]);
    }

    // Nouvelle tentative (paiement échoué, abandonné, expiré…) : les sessions
    // précédentes encore ouvertes sont relues puis fermées, pour que le client
    // ne puisse pas payer deux fois la même commande.
    const previous = await query(
      `SELECT * FROM payment_transactions WHERE order_id = ? AND status IN ('pending', 'processing') ORDER BY id`,
      [order.id]
    );
    for (const tx of previous) {
      const outcome = await closePreviousAttempt(tx);
      if (outcome === 'paid') {
        return res.status(409).json({ success: false, message: 'Cette commande vient d’être payée' });
      }
      if (outcome === 'unknown') {
        return res.status(502).json({
          success: false,
          message: 'Impossible de vérifier le paiement précédent auprès de Wave : réessayez dans un instant',
        });
      }
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
 * Ferme une tentative de paiement restée ouverte avant d'en ouvrir une autre.
 * Si elle a été payée entre-temps (webhook pas encore arrivé), le paiement est
 * appliqué et aucune nouvelle session ne doit être ouverte.
 * @returns {Promise<'paid'|'closed'|'unknown'>} 'unknown' : état chez le
 *   prestataire impossible à établir — mieux vaut refuser une nouvelle session
 */
async function closePreviousAttempt(tx) {
  const provider = payment.getConfiguredProvider(tx.provider);
  const canRead = tx.provider_ref && typeof provider?.fetchPayment === 'function';

  if (canRead) {
    try {
      let result = await provider.fetchPayment(tx.provider_ref);
      if (result.status === 'pending' && typeof provider.expireCheckout === 'function') {
        const expired = await provider.expireCheckout(tx.provider_ref);
        // Pas expirée : elle vient d'être payée ou d'expirer, on relit
        if (!expired) result = await provider.fetchPayment(tx.provider_ref);
      }
      if (result.status !== 'pending') {
        await applyPaymentResult({
          reference: tx.reference,
          status: result.status,
          amount: result.amount,
          providerRef: result.providerRef,
          rawEvent: { reconciled: true, session: result.raw },
          expectedProvider: tx.provider,
        });
        const order = await queryOne('SELECT payment_status FROM orders WHERE id = ?', [tx.order_id]);
        if (order?.payment_status === 'paid') return 'paid';
      }
    } catch (err) {
      console.warn(`[Paiement] ${tx.provider} : tentative ${tx.reference} impossible à vérifier :`, err.message);
      return 'unknown';
    }
  }

  await query(
    `UPDATE payment_transactions
     SET status = 'cancelled', failure_reason = COALESCE(failure_reason, ?)
     WHERE id = ? AND status IN ('pending', 'processing')`,
    ['Remplacée par une nouvelle tentative de paiement', tx.id]
  );
  return 'closed';
}

/**
 * Applique le résultat d'un paiement de façon idempotente : un même événement
 * reçu deux fois ne doit pas repasser la commande ni réenvoyer l'email.
 *
 * @param {string} [expectedProvider] prestataire dont vient l'événement : il
 *   doit être celui de la transaction (une notification Orange Money ne peut
 *   pas confirmer un paiement Wave). Absent pour la simulation de développement.
 * @returns {Promise<{ applied: boolean, reason?: string }>}
 */
async function applyPaymentResult({ reference, status, amount, providerRef, rawEvent, expectedProvider }) {
  const tx = await queryOne('SELECT * FROM payment_transactions WHERE reference = ?', [reference]);
  if (!tx) return { applied: false, reason: 'transaction inconnue' };

  if (expectedProvider && tx.provider !== expectedProvider) {
    return { applied: false, reason: 'prestataire différent de celui de la transaction' };
  }

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

  // Commande déjà réglée par une autre tentative (deux sessions payées) : on
  // garde la trace de l'encaissement, signalé à rembourser, sans reconfirmer.
  const current = await queryOne('SELECT payment_status, payment_reference FROM orders WHERE id = ?', [tx.order_id]);
  if (current?.payment_status === 'paid' && current.payment_reference && current.payment_reference !== reference) {
    await query(
      `UPDATE payment_transactions
       SET status = 'succeeded', paid_at = NOW(), provider_ref = COALESCE(?, provider_ref), raw_payload = ?, failure_reason = ?
       WHERE id = ?`,
      [
        providerRef,
        JSON.stringify(rawEvent ?? {}),
        `Second paiement : la commande était déjà payée (${current.payment_reference}). À rembourser.`,
        tx.id,
      ]
    );
    console.error(`[Paiement] DOUBLE PAIEMENT commande ${tx.order_id} : ${reference} encaissé alors que ${current.payment_reference} l'avait déjà réglée — à rembourser`);
    return { applied: false, reason: 'commande déjà payée par une autre transaction (à rembourser)' };
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

    // Prestataire sans identifiants : le simulateur prend le relais en
    // développement, mais il ne vérifie rien. En production, une notification
    // non vérifiable est refusée (sinon n'importe qui pourrait déclarer payée
    // une commande dont il connaît la référence).
    if (provider.name === 'simulator' && process.env.NODE_ENV === 'production') {
      return res.status(404).json({ success: false, message: 'Prestataire non configuré' });
    }

    // `req.rawBody` est capté par le body-parser (voir server.js) : la
    // signature se calcule sur les octets reçus, pas sur le JSON re-sérialisé.
    if (provider.name === 'wave') {
      const valid = provider.verifyWebhook(req.rawBody ?? '', {
        signature: req.get('Wave-Signature'),
        authorization: req.get('Authorization'),
      });
      if (!valid) {
        console.warn(
          '[Paiement] wave : notification refusée, authentification invalide '
          + `(en-tête ${req.get('Wave-Signature') ? 'Wave-Signature' : req.get('Authorization') ? 'Authorization' : 'absent'}) : `
          + 'vérifier que WAVE_WEBHOOK_SECRET est celui du webhook déclaré chez Wave'
        );
        return res.status(401).json({ success: false, message: 'Signature invalide' });
      }
    }

    let parsed = provider.parseWebhookEvent(req.body);
    if (!parsed.reference) {
      // Événement authentifié mais sans commande (test du portail, b2b.*…) :
      // 200 pour que le prestataire ne le rejoue pas pendant des jours
      console.log(`[Paiement] ${providerName} : événement « ${req.body?.type ?? 'inconnu'} » sans référence de commande, ignoré`);
      return res.json({ success: true, applied: false, reason: 'événement sans référence de commande' });
    }
    let rawEvent = req.body;

    // Contre-vérification : la notification n'est pas crue sur parole, on relit
    // la session chez le prestataire (statut et montant font foi).
    if (typeof provider.fetchPayment === 'function' && parsed.providerRef) {
      let confirmed;
      try {
        confirmed = await provider.fetchPayment(parsed.providerRef);
      } catch (err) {
        console.error(`[Paiement] ${providerName} : vérification de ${parsed.providerRef} impossible :`, err.message);
        // Réponse non 2xx : le prestataire rejouera la notification
        return res.status(502).json({ success: false, message: 'Vérification auprès du prestataire impossible' });
      }
      if (confirmed.reference !== parsed.reference) {
        return res.status(400).json({ success: false, message: 'La session ne correspond pas à la référence annoncée' });
      }
      if (confirmed.status === 'pending') {
        console.log(`[Paiement] ${providerName} : « ${req.body?.type} » pour ${parsed.reference}, session encore en cours chez le prestataire : rien d'appliqué`);
        return res.json({ success: true, applied: false, reason: 'paiement encore en cours' });
      }
      parsed = confirmed;
      rawEvent = { event: req.body, session: confirmed.raw };
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

    const result = await applyPaymentResult({
      reference: parsed.reference,
      status: parsed.status,
      amount: parsed.amount,
      providerRef: parsed.providerRef,
      rawEvent,
      expectedProvider: providerName,
    });

    console.log(
      `[Paiement] ${providerName} : « ${req.body?.type ?? parsed.status} » pour ${parsed.reference} → ${parsed.status}, `
      + (result.applied ? 'appliqué' : `ignoré (${result.reason})`)
    );

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
const STATUS_SQL = `
  SELECT pt.reference, pt.status, pt.provider, pt.provider_ref, pt.amount, pt.currency, pt.failure_reason,
         o.id AS order_id, o.order_number, o.payment_status, o.status AS order_status, o.client_id
  FROM payment_transactions pt
  JOIN orders o ON o.id = pt.order_id
  WHERE pt.reference = ?`;

/**
 * Rattrapage : si la transaction attend encore, on demande directement son
 * état au prestataire. Couvre le webhook perdu, retardé ou impossible
 * (serveur de développement injoignable depuis Internet).
 * @returns {Promise<boolean>} true si un résultat a été appliqué
 */
async function reconcileWithProvider(tx) {
  if (!['pending', 'processing'].includes(tx.status) || !tx.provider_ref) return false;
  const provider = payment.getConfiguredProvider(tx.provider);
  if (typeof provider?.fetchPayment !== 'function') return false;

  try {
    const result = await provider.fetchPayment(tx.provider_ref);
    if (result.status === 'pending' || result.reference !== tx.reference) return false;
    const applied = await applyPaymentResult({
      reference: tx.reference,
      status: result.status,
      amount: result.amount,
      providerRef: result.providerRef,
      rawEvent: { reconciled: true, session: result.raw },
      expectedProvider: tx.provider,
    });
    return applied.applied;
  } catch (err) {
    // Le webhook reste la voie normale : une lecture ratée n'est pas bloquante
    console.warn(`[Paiement] ${tx.provider} : lecture de ${tx.provider_ref} impossible :`, err.message);
    return false;
  }
}

exports.getStatus = async (req, res, next) => {
  try {
    let tx = await queryOne(STATUS_SQL, [req.params.reference]);

    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction introuvable' });
    }

    if (req.user?.type === 'client' && tx.client_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    if (await reconcileWithProvider(tx)) {
      tx = await queryOne(STATUS_SQL, [req.params.reference]);
    }

    // Visiteur non connecté (retour de Wave dans un autre navigateur) : statut
    // seulement, aucune donnée de compte
    if (!req.user) {
      const { reference, status, amount, currency, order_number, payment_status, order_status } = tx;
      return res.json({ success: true, data: { reference, status, amount, currency, order_number, payment_status, order_status } });
    }

    const { client_id: _clientId, provider_ref: _providerRef, ...data } = tx;
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

// Exposé pour les tests
exports._applyPaymentResult = applyPaymentResult;
exports._reconcileWithProvider = reconcileWithProvider;
exports._closePreviousAttempt = closePreviousAttempt;
