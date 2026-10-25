const router = require('express').Router();
const c = require('../controllers/settings.controller');
const { authenticate, requireAdmin, requireRole } = require('../middleware/auth');

router.get('/public', c.getPublic);
router.get('/', authenticate, requireAdmin, c.getAll);
// Les commerciaux consultent les paramètres mais ne modifient ni la TVA ni les tarifs
router.put('/', authenticate, requireRole('super_admin', 'admin'), c.update);

module.exports = router;
