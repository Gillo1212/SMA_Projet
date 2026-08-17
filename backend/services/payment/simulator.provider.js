/**
 * Provider de simulation
 * ───────────────────────
 * Utilisé quand aucune clé marchand n'est configurée, pour que le tunnel de
 * commande reste parcourable en développement.
 *
 * Il ne contacte aucun service externe : il renvoie une URL interne
 * (`/paiement/simulation`) où le développeur choisit l'issue du paiement.
 *
 * Il est refusé en production : voir `assertUsable()`.
 */

function isConfigured() {
  return true;
}

/** Empêche toute utilisation hors développement */
function assertUsable() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Aucun prestataire de paiement configuré. ' +
      'Renseignez WAVE_API_KEY ou les identifiants ORANGE_MONEY_* avant de passer en production.'
    );
  }
}

async function createCheckout({ reference, amount, currency, successUrl, errorUrl }) {
  assertUsable();

  const params = new URLSearchParams({
    reference,
    amount: String(Math.round(amount)),
    currency,
    success_url: successUrl,
    error_url: errorUrl,
  });

  const base = process.env.FRONTEND_URL || 'http://localhost:5173';

  return {
    providerRef: `sim_${reference}`,
    checkoutUrl: `${base}/paiement/simulation?${params.toString()}`,
    raw: { simulated: true },
  };
}

function verifyWebhook() {
  assertUsable();
  return true;
}

function parseWebhookEvent(event) {
  return {
    reference: event?.reference ?? null,
    status: event?.status ?? 'pending',
    amount: event?.amount != null ? Number(event.amount) : null,
    providerRef: event?.reference ? `sim_${event.reference}` : null,
  };
}

module.exports = {
  name: 'simulator',
  isConfigured,
  assertUsable,
  createCheckout,
  verifyWebhook,
  parseWebhookEvent,
};
