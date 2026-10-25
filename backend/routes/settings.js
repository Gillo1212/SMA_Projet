const router = require('express').Router();
const c = require('../controllers/settings.controller');
const admins = require('../controllers/admins.controller');
const { authenticate, requireAdmin, requireRole, requireSuperAdmin } = require('../middleware/auth');
const { validate, adminRegisterRules, adminUpdateRules } = require('../middleware/validators');

const canEdit = requireRole('super_admin', 'admin');

router.get('/public', c.getPublic);
router.get('/', authenticate, requireAdmin, c.getAll);
// Les commerciaux consultent les paramètres mais ne modifient ni la TVA ni les tarifs
router.put('/', authenticate, canEdit, c.update);
router.post('/smtp/test', authenticate, canEdit, c.testSmtp);

// Comptes du back-office : gestion réservée au super administrateur
router.get('/admins', authenticate, requireAdmin, admins.getAll);
router.post('/admins', authenticate, requireSuperAdmin, adminRegisterRules, validate, admins.create);
router.put('/admins/:id', authenticate, requireSuperAdmin, adminUpdateRules, validate, admins.update);
router.patch('/admins/:id/toggle', authenticate, requireSuperAdmin, admins.toggle);
router.delete('/admins/:id', authenticate, requireSuperAdmin, admins.remove);

module.exports = router;
