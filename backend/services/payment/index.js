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

/**
 * Modes de paiement en ligne proposés aux clients.
 * Orange Money est codé (orangeMoney.provider.js) mais pas proposé pour le
 * moment : pour le réactiver, l'ajouter ici et remettre son choix au checkout
 * (frontend/src/pages/checkout/page.tsx). Ses webhooks restent acceptés, pour
 * les paiements déjà lancés.
 */
const ONLINE_METHODS = ['wave'];

/** Mode utilisé quand une commande n'a pas de mode en ligne proposé (ancien « card », Orange Money désactivé) */
const DEFAULT_ONLINE_METHOD = 'wave';

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

/** Prestataire réel s'il a ses identifiants, sinon null (jamais le simulateur) */
function getConfiguredProvider(name) {
  const provider = providers[name];
  return provider?.isConfigured() ? provider : null;
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
    enabled_methods: ONLINE_METHODS,
    simulation_active: ONLINE_METHODS.some(m => !providers[m].isConfigured()),
    environment: process.env.NODE_ENV || 'development',
    warnings: configurationWarnings(),
  };
}

/** Réglages incomplets qui feraient échouer de vrais paiements Wave */
function configurationWarnings() {
  if (!wave.isConfigured()) return [];
  const warnings = [];
  if (!process.env.WAVE_WEBHOOK_SECRET) {
    warnings.push('WAVE_WEBHOOK_SECRET manquant : les notifications Wave sont refusées (seule la vérification au retour du client confirme les paiements)');
  }
  if (!(process.env.FRONTEND_URL || '').startsWith('https://')) {
    warnings.push('FRONTEND_URL n’est pas en https:// : Wave refusera de créer les sessions de paiement');
  }
  if (!(process.env.BACKEND_URL || '').startsWith('https://')) {
    warnings.push('BACKEND_URL n’est pas en https:// : le webhook à déclarer chez Wave doit être une adresse https publique');
  }
  return warnings;
}

/** Résumé au démarrage du serveur */
function logPaymentConfig() {
  const status = configurationStatus();
  const mode = status.wave ? 'clé configurée (paiements réels)' : 'simulateur (WAVE_API_KEY vide)';
  console.log(` Paiement : Wave, ${mode}`);
  if (status.wave) {
    console.log(`   Webhook à déclarer chez Wave : ${(process.env.BACKEND_URL || '').replace(/\/+$/, '')}/api/payments/webhook/wave`);
  }
  const log = status.environment === 'production' ? console.error : console.warn;
  for (const warning of status.warnings) log(`   ⚠ ${warning}`);
}

module.exports = {
  getProvider,
  getProviderForWebhook,
  getConfiguredProvider,
  isOnlineMethod,
  isOfflineMethod,
  configurationStatus,
  logPaymentConfig,
  ONLINE_METHODS,
  OFFLINE_METHODS,
  DEFAULT_ONLINE_METHOD,
};
