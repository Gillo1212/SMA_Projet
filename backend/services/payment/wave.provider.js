/**
 * Provider Wave (Sénégal) — API Checkout
 * ───────────────────────────────────────
 * Docs marchand : https://docs.wave.com/business (pas d'environnement de test :
 * la clé est liée au vrai portefeuille Wave Business).
 *
 * Variables d'environnement :
 *   WAVE_API_KEY             clé API (portail Wave Business → Développeurs → API KEYS),
 *                            avec l'accès « Checkout API »
 *   WAVE_WEBHOOK_SECRET      secret du webhook (Développeurs → WEBHOOKS), différent de la clé API
 *   WAVE_API_SIGNING_SECRET  seulement si la clé a été créée avec « Activer la signature
 *                            des requêtes » (secret wave_sn_AKS_…, affiché une seule fois)
 *   WAVE_API_URL             par défaut https://api.wave.com/v1
 *
 * Sans WAVE_API_KEY, le paiement bascule sur le simulateur (hors production).
 *
 * Flux : createCheckout() ouvre une session (valable 30 min) → le client paie
 * dans Wave → Wave notifie le webhook (checkout.session.completed /
 * checkout.session.payment_failed). Chaque notification est contre-vérifiée par
 * fetchPayment() ; la même lecture sert de rattrapage si le webhook n'arrive pas.
 */

const crypto = require('crypto');

/** Ancienneté maximale d'une signature de webhook (anti-rejeu), en secondes */
const SIGNATURE_TOLERANCE_S = 300;
const REQUEST_TIMEOUT_MS = 10_000;
/** Lecture d'une session pendant un webhook : Wave attend une réponse en moins de 5 s */
const VERIFY_TIMEOUT_MS = 4_000;

const apiUrl = () => (process.env.WAVE_API_URL || 'https://api.wave.com/v1').replace(/\/+$/, '');

function isConfigured() {
  return Boolean(process.env.WAVE_API_KEY);
}

const hmacHex = (secret, payload) => crypto.createHmac('sha256', secret).update(payload).digest('hex');

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/** En-têtes d'un appel ; signature des requêtes si la clé l'exige */
function requestHeaders(body) {
  const headers = { Authorization: `Bearer ${process.env.WAVE_API_KEY}` };
  if (body) headers['Content-Type'] = 'application/json';

  const signingSecret = process.env.WAVE_API_SIGNING_SECRET;
  if (signingSecret) {
    const timestamp = Math.floor(Date.now() / 1000);
    headers['Wave-Signature'] = `t=${timestamp},v1=${hmacHex(signingSecret, `${timestamp}${body ?? ''}`)}`;
  }
  return headers;
}

/** Erreurs Wave traduites en consignes de configuration */
const KNOWN_ERRORS = {
  'missing-signature': 'cette clé API exige des requêtes signées : renseigner WAVE_API_SIGNING_SECRET',
  'invalid-signature': 'signature des requêtes refusée : vérifier WAVE_API_SIGNING_SECRET',
  'expired-signature-timestamp': "signature des requêtes expirée : vérifier l'heure du serveur",
  'ip-not-allowed': "l'adresse IP du serveur n'est pas autorisée dans le portail Wave Business",
};

function describeError(data, status) {
  if (KNOWN_ERRORS[data?.code]) return KNOWN_ERRORS[data.code];
  const details = Array.isArray(data?.details)
    ? data.details.map(d => `${d.loc}: ${d.msg}`).join(' ; ')
    : '';
  return [data?.message || data?.code || `HTTP ${status}`, details].filter(Boolean).join(' — ');
}

async function callWave(method, path, payload, timeoutMs = REQUEST_TIMEOUT_MS) {
  const body = payload ? JSON.stringify(payload) : undefined;
  let response;
  try {
    response = await fetch(`${apiUrl()}${path}`, {
      method,
      headers: requestHeaders(body),
      body,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    throw new Error(`Wave injoignable (${err.name === 'TimeoutError' ? 'délai dépassé' : err.message})`);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(`Wave : ${describeError(data, response.status)}`);
    error.status = response.status;
    error.code = data?.code;
    throw error;
  }
  return data;
}

/**
 * Crée une session de paiement et retourne l'URL vers laquelle rediriger.
 * @param {{ reference: string, amount: number, currency: string, successUrl: string, errorUrl: string }} params
 */
async function createCheckout({ reference, amount, currency, successUrl, errorUrl }) {
  // Wave refuse les adresses de retour qui ne sont pas en HTTPS
  if (![successUrl, errorUrl].every(url => url.startsWith('https://'))) {
    throw new Error(
      'Wave exige des adresses de retour en HTTPS : FRONTEND_URL doit commencer par https:// '
      + '(en développement, passer par un tunnel HTTPS)'
    );
  }

  const session = await callWave('POST', '/checkout/sessions', {
    // Chaîne, unité principale ; le franc CFA n'a pas de décimales
    amount: String(Math.round(amount)),
    currency: currency.toUpperCase(),
    success_url: successUrl,
    error_url: errorUrl,
    client_reference: reference,
  });

  return {
    providerRef: session.id,
    checkoutUrl: session.wave_launch_url,
    raw: session,
  };
}

/**
 * Traduit une session Wave en résultat interne.
 * Payé seulement si checkout_status = complete ET payment_status = succeeded.
 * @returns {{ reference: string|null, status: 'succeeded'|'failed'|'expired'|'pending', amount: number|null, providerRef: string|null, raw: object }}
 */
function parseSession(session = {}) {
  let status = 'pending';
  if (session.checkout_status === 'complete' && session.payment_status === 'succeeded') status = 'succeeded';
  else if (session.checkout_status === 'expired') status = 'expired';
  else if (session.checkout_status === 'failed' || session.payment_status === 'cancelled') status = 'failed';

  return {
    reference: session.client_reference ?? null,
    status,
    amount: session.amount != null ? Number(session.amount) : null,
    providerRef: session.id ?? null,
    raw: session,
  };
}

/** Relit une session chez Wave : contre-vérification des webhooks et rattrapage */
async function fetchPayment(providerRef) {
  const session = await callWave('GET', `/checkout/sessions/${encodeURIComponent(providerRef)}`, null, VERIFY_TIMEOUT_MS);
  return parseSession(session);
}

/**
 * Ferme une session encore ouverte (nouvelle tentative de paiement) : elle ne
 * pourra plus être payée. Wave répond 409 si elle est déjà payée ou expirée,
 * 404 si elle n'existe pas : dans ces cas, rien n'a été fermé ici.
 * @returns {Promise<boolean>} true si la session vient d'être expirée
 */
async function expireCheckout(providerRef) {
  try {
    await callWave('POST', `/checkout/sessions/${encodeURIComponent(providerRef)}/expire`, null, VERIFY_TIMEOUT_MS);
    return true;
  } catch (err) {
    if (err.status === 409 || err.status === 404) return false;
    throw err;
  }
}

/**
 * Authentifie un webhook Wave, selon le mode choisi à sa création :
 *  - SIGNING_SECRET (recommandé) : en-tête `Wave-Signature: t=<ts>,v1=<hex>[,v1=…]`,
 *    HMAC-SHA256 de `timestamp + corps brut` ;
 *  - SHARED_SECRET : `Authorization: Bearer <secret>`.
 *
 * @param {Buffer|string} rawBody corps brut de la requête (non parsé)
 * @param {{ signature?: string, authorization?: string }} headers
 */
function verifyWebhook(rawBody, { signature, authorization } = {}) {
  const secret = process.env.WAVE_WEBHOOK_SECRET;
  if (!secret) {
    // Erreur 500 : Wave rejouera la notification une fois le secret configuré
    throw new Error('WAVE_WEBHOOK_SECRET non configuré : webhook refusé');
  }

  const body = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody ?? '');
  if (signature) return verifySignature(body, signature, secret);
  if (authorization) return safeEqual(authorization, `Bearer ${secret}`);
  return false;
}

function verifySignature(body, header, secret) {
  let timestamp;
  const signatures = [];
  for (const part of header.split(',')) {
    const i = part.indexOf('=');
    if (i === -1) continue;
    const key = part.slice(0, i).trim();
    const value = part.slice(i + 1).trim();
    if (key === 't') timestamp = value;
    else if (key === 'v1') signatures.push(value); // plusieurs v1 possibles pendant un changement de secret
  }

  if (!timestamp || !/^\d+$/.test(timestamp) || signatures.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > SIGNATURE_TOLERANCE_S) return false;

  const expected = hmacHex(secret, `${timestamp}${body}`);
  return signatures.some(sig => safeEqual(sig, expected));
}

/**
 * Traduit un événement Wave en résultat interne (avant contre-vérification).
 * @returns {{ reference: string|null, status: 'succeeded'|'failed'|'pending', amount: number|null, providerRef: string|null, eventId: string|null }}
 */
function parseWebhookEvent(event) {
  const session = parseSession(event?.data);

  let status = 'pending';
  if (event?.type === 'checkout.session.completed') status = 'succeeded';
  else if (event?.type === 'checkout.session.payment_failed') status = 'failed';

  return {
    reference: session.reference,
    status,
    amount: session.amount,
    providerRef: session.providerRef,
    eventId: event?.id ?? null,
  };
}

module.exports = {
  name: 'wave',
  isConfigured,
  createCheckout,
  fetchPayment,
  expireCheckout,
  parseSession,
  verifyWebhook,
  parseWebhookEvent,
};
