const router = require('express').Router();
const c = require('../controllers/orders.controller');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate, orderCreateRules, orderUpdateStatusRules, validatePromoRules } = require('../middleware/validators');

router.get('/', authenticate, c.getAll);
router.get('/:id', authenticate, c.getById);
router.post('/', authenticate, orderCreateRules, validate, c.create);
router.patch('/:id/status', authenticate, requireAdmin, orderUpdateStatusRules, validate, c.updateStatus);
router.post('/validate-promo', validatePromoRules, validate, c.validatePromo);

module.exports = router;
