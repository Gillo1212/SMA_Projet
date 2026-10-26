const settings = require('../services/settings.service');
const { testSmtp } = require('../services/email.service');

/** GET /api/settings — tous les paramètres, secrets masqués (admin) */
exports.getAll = async (req, res, next) => {
  try {
    res.json({ success: true, settings: await settings.getAllForAdmin() });
  } catch (error) { next(error); }
};

/** PUT /api/settings — mise à jour partielle (super_admin, admin) */
exports.update = async (req, res, next) => {
  try {
    const updated = await settings.update(req.body, req.user.id);
    res.json({ success: true, message: 'Paramètres enregistrés', settings: updated });
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({ success: false, message: error.message, errors: error.errors });
    }
    next(error);
  }
};

/**
 * GET /api/settings/public — règles de calcul d'une commande et coordonnées
 * de l'entreprise (public). Le panier, le checkout et les pages de contact
 * s'en servent.
 */
exports.getPublic = async (req, res, next) => {
  try {
    const [shop, company] = await Promise.all([settings.getShopConfig(), settings.getCompany()]);
    res.json({ success: true, data: { ...shop, company } });
  } catch (error) { next(error); }
};

/**
 * POST /api/settings/smtp/test — connexion au serveur SMTP enregistré puis
 * envoi d'un email de test à l'adresse donnée (par défaut, celle de l'admin).
 */
exports.testSmtp = async (req, res, next) => {
  try {
    const to = (req.body?.to || req.user.email || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return res.status(400).json({ success: false, message: 'Adresse de test invalide' });
    }
    const result = await testSmtp(to);
    res.status(result.success ? 200 : 502).json({
      success: result.success,
      message: result.success ? `Email de test envoyé à ${to}` : result.error,
      step: result.step,
      source: result.source,
      provider: result.provider,
    });
  } catch (error) { next(error); }
};
