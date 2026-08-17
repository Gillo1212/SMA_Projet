/**
 * Provider Wave (Sénégal) — API Checkout
 * ───────────────────────────────────────
 * Docs marchand : https://docs.wave.com/business
 *
 * Variables d'environnement :
 *   WAVE_API_KEY          clé secrète du compte marchand
 *   WAVE_API_URL          par défaut https://api.wave.com/v1
 *   WAVE_WEBHOOK_SECRET   secret de signature des webhooks
 *
 * Sans WAVE_API_KEY, le provider bascule en simulation (voir simulator.js) :
 * le tunnel de commande reste testable en développement.
 */

const crypto = require('crypto');

const API_URL = process.env.WAVE_API_URL || 'https://api.wave.com/v1';

function isConfigured() {
  return Boolean(process.env.WAVE_API_KEY);
}

/**
 * Crée une session de paiement et retourne l'URL vers laquelle rediriger.
 * @param {{ reference: string, amount: number, currency: string, successUrl: string, errorUrl: string }} params
 */
async function createCheckout({ reference, amount, currency, successUrl, errorUrl }) {
  const response = await fetch(`${API_URL}/checkout/sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WAVE_API_KEY}`,
      'Content-Type': 'application/json',
      // Rejoue la même session si la requête est réémise
      'Idempotency-Key': reference,
    },
    body: JSON.stringify({
      // Wave attend le montant en chaîne, dans l'unité principale (XOF sans décimales)
      amount: String(Math.round(amount)),
      currency: currency.toLowerCase(),
      success_url: successUrl,
      error_url: errorUrl,
      client_reference: reference,
    }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = body?.message || body?.error_message || `HTTP ${response.status}`;
    throw new Error(`Wave : création de session refusée (${detail})`);
  }

  return {
    providerRef: body.id,
    checkoutUrl: body.wave_launch_url,
    raw: body,
  };
}

/**
 * Vérifie la signature d'un webhook Wave.
 * L'en-tête `Wave-Signature` porte un timestamp et un HMAC SHA-256
 * calculé sur `timestamp + corps brut`.
 *
 * @param {Buffer|string} rawBody corps brut de la requête (non parsé)
 * @param {string} signatureHeader valeur de l'en-tête Wave-Signature
 */
function verifyWebhook(rawBody, signatureHeader) {
  const secret = process.env.WAVE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('WAVE_WEBHOOK_SECRET non configuré : webhook refusé');
  }
  if (!signatureHeader) return false;

  // Format attendu : "t=1690000000,v1=abcdef..."
  const parts = Object.fromEntries(
    signatureHeader.split(',').map(p => {
      const [k, ...rest] = p.trim().split('=');
      return [k, rest.join('=')];
    })
  );

  const timestamp = parts.t;
  const provided = parts.v1;
  if (!timestamp || !provided) return false;

  const payload = `${timestamp}${rawBody.toString()}`;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(provided, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Traduit un événement Wave en résultat interne.
 * @returns {{ reference: string|null, status: 'succeeded'|'failed'|'pending', amount: number|null }}
 */
function parseWebhookEvent(event) {
  const data = event?.data ?? {};
  const reference = data.client_reference ?? null;
  const amount = data.amount != null ? Number(data.amount) : null;

  let status = 'pending';
  if (event?.type === 'checkout.session.completed') status = 'succeeded';
  else if (event?.type === 'checkout.session.payment_failed') status = 'failed';

  return { reference, status, amount, providerRef: data.id ?? null };
}

module.exports = {
  name: 'wave',
  isConfigured,
  createCheckout,
  verifyWebhook,
  parseWebhookEvent,
};
