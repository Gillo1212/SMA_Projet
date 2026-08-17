/**
 * Provider Orange Money (Sénégal) — WebPay
 * ─────────────────────────────────────────
 * Docs développeur : https://developer.orange.com/apis/om-webpay
 *
 * Le flux se fait en deux temps :
 *   1. obtention d'un jeton OAuth (Basic auth avec le couple client id/secret) ;
 *   2. création d'une transaction WebPay, qui renvoie une `payment_url`.
 *
 * Variables d'environnement :
 *   ORANGE_MONEY_CLIENT_ID
 *   ORANGE_MONEY_CLIENT_SECRET
 *   ORANGE_MONEY_MERCHANT_KEY
 *   ORANGE_MONEY_AUTH_URL     défaut https://api.orange.com/oauth/v3/token
 *   ORANGE_MONEY_API_URL      défaut https://api.orange.com/orange-money-webpay/dev/v1
 *
 * Sans identifiants, le provider bascule en simulation.
 */

const AUTH_URL = process.env.ORANGE_MONEY_AUTH_URL || 'https://api.orange.com/oauth/v3/token';
const API_URL =
  process.env.ORANGE_MONEY_API_URL || 'https://api.orange.com/orange-money-webpay/dev/v1';

function isConfigured() {
  return Boolean(
    process.env.ORANGE_MONEY_CLIENT_ID &&
    process.env.ORANGE_MONEY_CLIENT_SECRET &&
    process.env.ORANGE_MONEY_MERCHANT_KEY
  );
}

// Le jeton est valable ~1h : on le garde en mémoire pour éviter un appel par transaction.
let cachedToken = null;

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const basic = Buffer.from(
    `${process.env.ORANGE_MONEY_CLIENT_ID}:${process.env.ORANGE_MONEY_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(AUTH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: 'grant_type=client_credentials',
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) {
    throw new Error(
      `Orange Money : authentification refusée (${body?.error_description || `HTTP ${response.status}`})`
    );
  }

  cachedToken = {
    value: body.access_token,
    expiresAt: Date.now() + (Number(body.expires_in || 3600) * 1000),
  };
  return cachedToken.value;
}

/**
 * Crée une transaction WebPay et retourne l'URL de paiement.
 * `notifUrl` reçoit la notification serveur à serveur de fin de paiement.
 */
async function createCheckout({ reference, amount, currency, successUrl, errorUrl, notifUrl }) {
  const token = await getAccessToken();

  const response = await fetch(`${API_URL}/webpayment`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      merchant_key: process.env.ORANGE_MONEY_MERCHANT_KEY,
      currency,
      order_id: reference,
      amount: Math.round(amount),
      return_url: successUrl,
      cancel_url: errorUrl,
      notif_url: notifUrl,
      lang: 'fr',
      reference: 'SMALIM',
    }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok || !body.payment_url) {
    const detail = body?.message || body?.description || `HTTP ${response.status}`;
    throw new Error(`Orange Money : création de transaction refusée (${detail})`);
  }

  return {
    providerRef: body.pay_token,
    checkoutUrl: body.payment_url,
    // notif_token authentifie la notification de retour : il faut le conserver
    raw: body,
  };
}

/**
 * Orange Money ne signe pas ses notifications : il renvoie le `notif_token`
 * émis à la création. On le compare à celui stocké pour la transaction.
 *
 * La vérification a donc lieu dans le contrôleur, qui a accès à la ligne
 * `payment_transactions` ; cette fonction se limite à la forme du message.
 */
function verifyWebhook() {
  return true;
}

/** @returns {{ reference: string|null, status: string, amount: number|null }} */
function parseWebhookEvent(event) {
  const reference = event?.order_id ?? null;
  const amount = event?.amount != null ? Number(event.amount) : null;

  const raw = String(event?.status ?? '').toUpperCase();
  let status = 'pending';
  if (raw === 'SUCCESS' || raw === 'SUCCESSFUL') status = 'succeeded';
  else if (raw === 'FAILED' || raw === 'FAILURE') status = 'failed';
  else if (raw === 'CANCELLED' || raw === 'CANCELED') status = 'cancelled';
  else if (raw === 'EXPIRED') status = 'expired';

  return { reference, status, amount, providerRef: event?.txnid ?? event?.pay_token ?? null };
}

module.exports = {
  name: 'orange_money',
  isConfigured,
  createCheckout,
  verifyWebhook,
  parseWebhookEvent,
};
