const router = require('express').Router();
const c = require('../controllers/promoCodes.controller');
const { authenticate, requireAdmin, requireRole } = require('../middleware/auth');
const { validate, promoCreateRules, promoUpdateRules } = require('../middleware/validators');

const canEdit = requireRole('super_admin', 'admin');

router.get('/', authenticate, requireAdmin, c.getAll);
router.post('/', authenticate, canEdit, promoCreateRules, validate, c.create);
router.patch('/:id', authenticate, canEdit, promoUpdateRules, validate, c.update);
router.delete('/:id', authenticate, canEdit, c.remove);

module.exports = router;
