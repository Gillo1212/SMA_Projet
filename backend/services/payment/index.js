/**
 * Sélection du prestataire de paiement
 * ─────────────────────────────────────
 *   const provider = getProvider('wave');
 *   const session  = await provider.createCheckout({ ... });
 *
 * Si le prestataire demandé n'a pas d'identifiants configurés, on retombe sur
 * le simulateur — qui refuse de fonctionner en production. Le tunnel reste
 * ainsi parcourable en développement sans compte marchand.
 */

const wave = require('./wave.provider');
const orangeMoney = require('./orangeMoney.provider');
const simulator = require('./simulator.provider');

/** Modes de paiement qui passent par un prestataire en ligne */
const ONLINE_METHODS = ['wave', 'orange_money'];

/** Modes réglés hors ligne : pas de redirection, la commande reste à confirmer */
const OFFLINE_METHODS = ['bank_transfer', 'cash'];

const providers = {
  wave,
  orange_money: orangeMoney,
};

/**
 * @param {string} method valeur de `orders.payment_method`
 * @returns {{ provider: object, simulated: boolean }}
 */
function getProvider(method) {
  const provider = providers[method];
  if (!provider) {
    throw new Error(`Mode de paiement en ligne non pris en charge : ${method}`);
  }
  if (!provider.isConfigured()) {
    return { provider: simulator, simulated: true };
  }
  return { provider, simulated: false };
}

/** Prestataire à utiliser pour vérifier un webhook entrant */
function getProviderForWebhook(name) {
  const provider = providers[name];
  if (!provider) return null;
  return provider.isConfigured() ? provider : simulator;
}

function isOnlineMethod(method) {
  return ONLINE_METHODS.includes(method);
}

function isOfflineMethod(method) {
  return OFFLINE_METHODS.includes(method);
}

/** Récapitulatif de configuration, exposé aux admins pour diagnostic */
function configurationStatus() {
  return {
    wave: wave.isConfigured(),
    orange_money: orangeMoney.isConfigured(),
    simulation_active: !wave.isConfigured() || !orangeMoney.isConfigured(),
    environment: process.env.NODE_ENV || 'development',
  };
}

module.exports = {
  getProvider,
  getProviderForWebhook,
  isOnlineMethod,
  isOfflineMethod,
  configurationStatus,
  ONLINE_METHODS,
  OFFLINE_METHODS,
};
