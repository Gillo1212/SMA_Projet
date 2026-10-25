const settings = require('../services/settings.service');

/** GET /api/settings — tous les paramètres (admin) */
exports.getAll = async (req, res, next) => {
  try {
    res.json({ success: true, settings: await settings.getAll() });
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
 * GET /api/settings/public — règles de calcul d'une commande (public).
 * Le panier et le checkout s'en servent pour afficher le montant facturé.
 */
exports.getPublic = async (req, res, next) => {
  try {
    res.json({ success: true, data: await settings.getShopConfig() });
  } catch (error) { next(error); }
};
