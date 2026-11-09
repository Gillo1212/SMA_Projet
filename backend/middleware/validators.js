const { body, param, validationResult } = require('express-validator');
const { ONLINE_METHODS, OFFLINE_METHODS } = require('../services/payment');

/**
 * Middleware qui lit les résultats de validation et retourne 400 si des erreurs existent.
 * À placer en dernier dans la chaîne de validators d'une route.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Auth ──────────────────────────────────────────────────────

const adminLoginRules = [
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('password').notEmpty().withMessage('Mot de passe requis'),
];

const adminRegisterRules = [
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Mot de passe : 8 caractères minimum')
    .matches(/[A-Z]/).withMessage('Mot de passe : au moins une majuscule')
    .matches(/[0-9]/).withMessage('Mot de passe : au moins un chiffre'),
  body('first_name').trim().notEmpty().withMessage('Prénom requis'),
  body('last_name').trim().notEmpty().withMessage('Nom requis'),
  body('role')
    .optional()
    .isIn(['super_admin', 'admin', 'commercial'])
    .withMessage('Rôle invalide'),
];

const adminUpdateRules = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  body('first_name').optional().trim().notEmpty().withMessage('Prénom requis'),
  body('last_name').optional().trim().notEmpty().withMessage('Nom requis'),
  body('role').optional().isIn(['super_admin', 'admin', 'commercial']).withMessage('Rôle invalide'),
];

const clientLoginRules = [
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('password').notEmpty().withMessage('Mot de passe requis'),
];

const clientRegisterRules = [
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Mot de passe : 8 caractères minimum'),
  body('first_name').trim().notEmpty().withMessage('Prénom requis'),
  body('last_name').trim().notEmpty().withMessage('Nom requis'),
  // isMobilePhone() n'a pas de locale sénégalaise et rejette +221 77 123 45 67 :
  // on accepte 9 à 15 chiffres, préfixe international et séparateurs compris.
  body('phone').optional({ values: 'falsy' }).trim()
    .custom(v => /^(\+|00)?\d{9,15}$/.test(v.replace(/[\s.\-()]/g, '')))
    .withMessage('Numéro de téléphone invalide'),
];

const changePasswordRules = [
  body('current_password').notEmpty().withMessage('Mot de passe actuel requis'),
  body('new_password')
    .isLength({ min: 8 }).withMessage('Nouveau mot de passe : 8 caractères minimum')
    .matches(/[A-Z]/).withMessage('Nouveau mot de passe : au moins une majuscule')
    .matches(/[0-9]/).withMessage('Nouveau mot de passe : au moins un chiffre'),
];

const forgotPasswordRules = [
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('type').optional().isIn(['admin', 'client']).withMessage('Type de compte invalide'),
];

const resetPasswordRules = [
  body('token').trim().notEmpty().withMessage('Token requis'),
  body('password')
    .isLength({ min: 8 }).withMessage('Mot de passe : 8 caractères minimum')
    .matches(/[A-Z]/).withMessage('Mot de passe : au moins une majuscule')
    .matches(/[0-9]/).withMessage('Mot de passe : au moins un chiffre'),
];

const verifyEmailRules = [
  body('token').trim().notEmpty().withMessage('Token requis'),
];

const resendVerificationRules = [
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
];

// ── Paiements ─────────────────────────────────────────────────

const paymentInitiateRules = [
  body('order_id').isInt({ min: 1 }).withMessage('ID de commande invalide'),
];

const paymentSimulateRules = [
  body('reference').trim().notEmpty().withMessage('Référence requise'),
  body('status')
    .optional()
    .isIn(['succeeded', 'failed', 'cancelled', 'expired'])
    .withMessage('Statut de simulation invalide'),
];

// ── Machines ──────────────────────────────────────────────────

const machineCreateRules = [
  body('name').trim().notEmpty().withMessage('Nom requis'),
  body('category_id').isInt({ min: 1 }).withMessage('Catégorie invalide'),
  body('price').isFloat({ min: 0 }).withMessage('Prix invalide'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock invalide'),
  body('brand').optional().trim(),
  body('model_ref').optional().trim(),
  body('gallery').optional().isArray().withMessage('Gallery doit être un tableau'),
  body('specifications').optional().isObject().withMessage('Spécifications doit être un objet'),
  body('payment_modes').optional().isArray().withMessage('Modes de paiement doit être un tableau'),
  body('is_active').optional().isBoolean().withMessage('is_active doit être un booléen'),
  body('is_featured').optional().isBoolean().withMessage('is_featured doit être un booléen'),
];

const machineUpdateRules = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  ...machineCreateRules,
];

// ── Products ──────────────────────────────────────────────────

const productCreateRules = [
  body('name').trim().notEmpty().withMessage('Nom requis'),
  body('category_id').isInt({ min: 1 }).withMessage('Catégorie invalide'),
  body('price').isFloat({ min: 0 }).withMessage('Prix invalide'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock invalide'),
  body('brand').optional().trim(),
  body('reference').optional().trim(),
  body('gallery').optional().isArray().withMessage('Gallery doit être un tableau'),
  body('specifications').optional().isObject().withMessage('Spécifications doit être un objet'),
  body('is_active').optional().isBoolean().withMessage('is_active doit être un booléen'),
  body('is_featured').optional().isBoolean().withMessage('is_featured doit être un booléen'),
];

const productUpdateRules = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  ...productCreateRules,
];

// ── Orders ────────────────────────────────────────────────────

const orderCreateRules = [
  body('items')
    .isArray({ min: 1 }).withMessage('La commande doit contenir au moins un article'),
  body('items.*.id')
    .isInt({ min: 1 }).withMessage('ID article invalide'),
  body('items.*.type')
    .isIn(['machine', 'product']).withMessage('Type article invalide (machine | product)'),
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantité invalide (minimum 1)'),
  body('payment_method')
    // Modes proposés uniquement (pas de carte ; Orange Money désactivé pour le moment)
    .isIn([...ONLINE_METHODS, ...OFFLINE_METHODS])
    .withMessage('Mode de paiement invalide'),
  body('shipping_address').notEmpty().withMessage('Adresse de livraison requise'),
  // La TVA et les frais de port sont calculés par le serveur : le client
  // indique seulement le mode de livraison souhaité.
  body('delivery_mode')
    .optional()
    .isIn(['pickup', 'standard', 'express'])
    .withMessage('Mode de livraison invalide'),
  body('promo_code').optional().trim(),
];

const orderUpdateStatusRules = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Statut invalide'),
];

const validatePromoRules = [
  body('code').trim().notEmpty().withMessage('Code promo requis'),
  body('subtotal').isFloat({ min: 0 }).withMessage('Sous-total invalide'),
];

// ── Codes promo (back-office) ──────────────────────────────────

/** Règles communes ; `optional` rend chaque champ facultatif (mise à jour partielle) */
const promoFieldRules = (optional) => {
  const f = (name) => (optional ? body(name).optional() : body(name));
  return [
    f('code').trim().toUpperCase()
      .matches(/^[A-Z0-9_-]{3,50}$/).withMessage('Code : 3 à 50 caractères (lettres, chiffres, - ou _)'),
    f('type').isIn(['percentage', 'fixed']).withMessage('Type invalide (percentage | fixed)'),
    f('value').isFloat({ gt: 0 }).withMessage('Valeur : nombre strictement positif')
      .custom((v, { req }) => req.body.type !== 'percentage' || Number(v) <= 100)
      .withMessage('Un pourcentage ne peut pas dépasser 100'),
    body('min_order_amount').optional({ values: 'null' }).isFloat({ min: 0 }).withMessage('Montant minimum invalide'),
    body('max_uses').optional({ values: 'null' }).isInt({ min: 1 }).withMessage("Nombre d'utilisations : entier ≥ 1"),
    body('expires_at').optional({ values: 'null' }).isISO8601().withMessage("Date d'expiration invalide"),
    body('is_active').optional().isBoolean().withMessage('is_active doit être un booléen'),
  ];
};

const promoCreateRules = promoFieldRules(false);
const promoUpdateRules = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  ...promoFieldRules(true),
];

// ── Quotes ────────────────────────────────────────────────────

const quoteCreateRules = [
  body('contact_name').trim().notEmpty().withMessage('Nom de contact requis'),
  body('contact_email').isEmail().withMessage('Email de contact invalide').normalizeEmail(),
  body('machine_type').trim().notEmpty().withMessage('Type de machine requis'),
  body('description').trim().notEmpty().withMessage('Description requise'),
  body('contact_phone').optional().trim(),
  body('company_name').optional().trim(),
  body('budget').optional().isFloat({ min: 0 }).withMessage('Budget invalide'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantité invalide'),
];

const quoteUpdateStatusRules = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  body('status')
    .isIn(['pending', 'processing', 'quoted', 'accepted', 'refused', 'expired'])
    .withMessage('Statut invalide'),
  body('proposed_amount').optional().isFloat({ min: 0 }).withMessage('Montant proposé invalide'),
];

// ── Clients ───────────────────────────────────────────────────

const clientUpdateRules = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  body('first_name').trim().notEmpty().withMessage('Prénom requis'),
  body('last_name').trim().notEmpty().withMessage('Nom requis'),
  body('phone').optional().trim(),
  body('company_name').optional().trim(),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('country').optional().trim(),
];

const addClientMachineRules = [
  param('id').isInt({ min: 1 }).withMessage('ID client invalide'),
  body('machine_id').isInt({ min: 1 }).withMessage('ID machine invalide'),
  body('serial_number').optional().trim(),
  body('installation_date').optional().isISO8601().withMessage('Date d\'installation invalide'),
  body('location').optional().trim(),
];

const createTicketRules = [
  body('subject').trim().notEmpty().withMessage('Sujet requis'),
  body('description').trim().notEmpty().withMessage('Description requise'),
  body('category')
    .optional()
    .isIn(['panne', 'maintenance', 'question', 'livraison', 'facturation', 'autre'])
    .withMessage('Catégorie invalide'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priorité invalide'),
  body('machine_id').optional().isInt({ min: 1 }).withMessage('ID machine invalide'),
];

// ── Blog ──────────────────────────────────────────────────────

const blogCreateRules = [
  body('title').trim().notEmpty().withMessage('Titre requis'),
  body('content').trim().notEmpty().withMessage('Contenu requis'),
  body('category_id').isInt({ min: 1 }).withMessage('Catégorie invalide'),
  body('excerpt').optional().trim(),
  // Adresse complète (http/https) ou chemin du site : /uploads/… (envoi depuis
  // l'admin) ou /images/… (dossier public du frontend)
  body('image_url').optional({ values: 'falsy' }).trim()
    .custom(v => /^\/(uploads|images)\/[\w./-]+$/.test(v) || /^https?:\/\/[^\s"'<>]+$/i.test(v))
    .withMessage('URL image invalide'),
  body('read_time').optional().isInt({ min: 1 }).withMessage('Temps de lecture invalide'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Statut invalide'),
];

const blogUpdateRules = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  ...blogCreateRules,
];

// ── Contact et newsletter ─────────────────────────────────────

const contactCreateRules = [
  body('name').trim().notEmpty().withMessage('Nom requis')
    .isLength({ max: 150 }).withMessage('Nom trop long (150 caractères maximum)'),
  body('email').trim().isEmail().withMessage('Email invalide').normalizeEmail({ gmail_remove_dots: false }),
  body('phone').optional({ values: 'falsy' }).trim()
    .matches(/^[+0-9 ().-]{6,30}$/).withMessage('Téléphone invalide'),
  body('subject').optional({ values: 'falsy' }).trim()
    .isLength({ max: 200 }).withMessage('Sujet trop long (200 caractères maximum)'),
  body('message').trim().notEmpty().withMessage('Message requis')
    .isLength({ max: 5000 }).withMessage('Message trop long (5000 caractères maximum)'),
];

const contactUpdateRules = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  body('status').optional().isIn(['new', 'read', 'replied', 'archived']).withMessage('Statut invalide'),
  body('admin_note').optional({ values: 'null' }).isString().isLength({ max: 2000 }).withMessage('Note trop longue (2000 caractères maximum)'),
];

const newsletterSubscribeRules = [
  body('email').trim().isEmail().withMessage('Email invalide')
    .isLength({ max: 255 }).normalizeEmail({ gmail_remove_dots: false }),
  body('source').optional().trim().isLength({ max: 50 }),
  body('locale').optional().isIn(['fr', 'en']),
];

const newsletterUnsubscribeRules = [
  body('token').isString().matches(/^[0-9a-f]{64}$/).withMessage('Lien de désinscription invalide'),
];

const newsletterUpdateRules = [
  param('id').isInt({ min: 1 }).withMessage('ID invalide'),
  body('status').isIn(['subscribed', 'unsubscribed']).withMessage('Statut invalide'),
];

module.exports = {
  validate,
  // Contact et newsletter
  contactCreateRules,
  contactUpdateRules,
  newsletterSubscribeRules,
  newsletterUnsubscribeRules,
  newsletterUpdateRules,
  // Auth
  adminLoginRules,
  adminRegisterRules,
  adminUpdateRules,
  clientLoginRules,
  clientRegisterRules,
  changePasswordRules,
  forgotPasswordRules,
  resetPasswordRules,
  verifyEmailRules,
  resendVerificationRules,
  // Paiements
  paymentInitiateRules,
  paymentSimulateRules,
  // Machines
  machineCreateRules,
  machineUpdateRules,
  // Products
  productCreateRules,
  productUpdateRules,
  // Orders
  orderCreateRules,
  orderUpdateStatusRules,
  validatePromoRules,
  promoCreateRules,
  promoUpdateRules,
  // Quotes
  quoteCreateRules,
  quoteUpdateStatusRules,
  // Clients
  clientUpdateRules,
  addClientMachineRules,
  createTicketRules,
  // Blog
  blogCreateRules,
  blogUpdateRules,
};
