/**
 * Paramètres de la plateforme
 * ───────────────────────────
 * Stockés en clé → valeur dans la table `settings`, édités depuis le
 * back-office. Seules les clés déclarées ici sont acceptées : chacune a une
 * valeur par défaut et une règle de validation.
 *
 * `getShopConfig()` expose les règles de calcul d'une commande (TVA, frais de
 * livraison). Le panier et le checkout appliquent les mêmes, via
 * GET /api/settings/public, pour afficher exactement le montant facturé.
 */
const { query } = require('../config/database');

const DELIVERY_MODES = ['pickup', 'standard', 'express'];

// ── Validateurs ────────────────────────────────────────────────────────────
// Chacun renvoie la valeur normalisée, ou lève une erreur au message lisible.

const bool = v => {
  if (['1', 'true', true, 1].includes(v)) return '1';
  if (['0', 'false', false, 0].includes(v)) return '0';
  throw new Error('doit valoir 0 ou 1');
};

const amount = v => {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 100_000_000) throw new Error('doit être un montant positif');
  return String(Math.round(n));
};

const percent = v => {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 100) throw new Error('doit être compris entre 0 et 100');
  return String(Math.round(n * 100) / 100);
};

const text = max => v => {
  const s = String(v ?? '').trim();
  if (s.length > max) throw new Error(`${max} caractères maximum`);
  return s;
};

const email = v => {
  const s = String(v ?? '').trim();
  if (s && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) throw new Error('adresse email invalide');
  return s;
};

const oneOf = values => v => {
  if (!values.includes(v)) throw new Error(`valeur attendue : ${values.join(', ')}`);
  return v;
};

// ── Clés acceptées ─────────────────────────────────────────────────────────

const DEFINITIONS = {
  // Commerce : utilisé par le calcul des commandes
  tva_rate:                  { default: '18',   validate: percent },
  delivery_pickup_enabled:   { default: '1',    validate: bool },
  delivery_pickup_fee:       { default: '0',    validate: amount },
  delivery_standard_enabled: { default: '1',    validate: bool },
  delivery_standard_fee:     { default: '2500', validate: amount },
  delivery_express_enabled:  { default: '1',    validate: bool },
  delivery_express_fee:      { default: '5000', validate: amount },
  /** Livraison standard offerte dès ce montant (remise déduite, hors TVA). 0 = désactivé */
  free_shipping_threshold:   { default: '0',    validate: amount },

  // Entreprise : informations affichées
  app_name:        { default: 'SMALIM', validate: text(100) },
  app_email:       { default: '',       validate: email },
  app_phone:       { default: '',       validate: text(50) },
  app_address:     { default: '',       validate: text(255) },
  app_city:        { default: '',       validate: text(100) },
  app_country:     { default: 'Sénégal', validate: text(100) },
  app_website:     { default: '',       validate: text(255) },
  app_description: { default: '',       validate: text(500) },
  currency:        { default: 'XOF',    validate: oneOf(['XOF']) },
  timezone:        { default: 'Africa/Dakar', validate: oneOf(['Africa/Dakar', 'Africa/Abidjan', 'Africa/Lagos', 'Europe/Paris']) },

  // Notifications admin
  notif_new_order:   { default: '1', validate: bool },
  notif_new_quote:   { default: '1', validate: bool },
  notif_new_client:  { default: '0', validate: bool },
  notif_low_stock:   { default: '1', validate: bool },
  notif_admin_email: { default: '',  validate: email },
};

// ── Lecture (avec cache) ───────────────────────────────────────────────────
// Le calcul de chaque commande lit les paramètres : on garde la dernière
// lecture en mémoire, invalidée à chaque mise à jour.

let cache = null;

async function getAll() {
  if (cache) return cache;
  const rows = await query('SELECT setting_key, setting_value FROM settings');
  const stored = Object.fromEntries(rows.map(r => [r.setting_key, r.setting_value]));
  cache = Object.fromEntries(
    Object.entries(DEFINITIONS).map(([key, def]) => [key, stored[key] ?? def.default])
  );
  return cache;
}

/**
 * Valide puis enregistre un lot de paramètres.
 * Tout ou rien : la première valeur invalide rejette le lot entier.
 * @returns {Promise<object>} l'ensemble des paramètres après mise à jour
 */
async function update(changes, adminId) {
  const errors = [];
  const normalized = {};
  for (const [key, value] of Object.entries(changes ?? {})) {
    const def = DEFINITIONS[key];
    if (!def) { errors.push({ field: key, message: 'Paramètre inconnu' }); continue; }
    try { normalized[key] = def.validate(value); }
    catch (e) { errors.push({ field: key, message: e.message }); }
  }

  // Au moins un mode de livraison doit rester proposé
  const merged = { ...(await getAll()), ...normalized };
  if (DELIVERY_MODES.every(m => merged[`delivery_${m}_enabled`] !== '1')) {
    errors.push({ field: 'delivery_standard_enabled', message: 'Au moins un mode de livraison doit rester actif' });
  }

  if (errors.length) {
    const err = new Error('Paramètres invalides');
    err.status = 400;
    err.errors = errors;
    throw err;
  }

  for (const [key, value] of Object.entries(normalized)) {
    await query(
      `INSERT INTO settings (setting_key, setting_value, updated_by) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by)`,
      [key, value, adminId ?? null]
    );
  }
  cache = null;
  return getAll();
}

/** Règles de calcul d'une commande, sous forme typée */
async function getShopConfig() {
  const s = await getAll();
  const delivery = Object.fromEntries(DELIVERY_MODES.map(mode => [mode, {
    enabled: s[`delivery_${mode}_enabled`] === '1',
    fee: Number(s[`delivery_${mode}_fee`]),
  }]));
  return {
    taxRate: Number(s.tva_rate),               // en %, ex. 18
    currency: s.currency,
    delivery,
    freeShippingThreshold: Number(s.free_shipping_threshold),
  };
}

/**
 * Frais de livraison d'un mode, pour un montant (remise déduite, hors TVA).
 * Renvoie null si le mode n'existe pas ou n'est pas proposé.
 * La gratuité au-delà du seuil ne concerne que la livraison standard.
 */
function deliveryFee(config, mode, amountAfterDiscount) {
  const option = config.delivery[mode];
  if (!option || !option.enabled) return null;
  if (mode === 'standard' && config.freeShippingThreshold > 0 && amountAfterDiscount >= config.freeShippingThreshold) {
    return 0;
  }
  return option.fee;
}

module.exports = { DELIVERY_MODES, getAll, update, getShopConfig, deliveryFee };
