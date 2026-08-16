const router = require('express').Router();
const c = require('../controllers/quotes.controller');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validate, quoteCreateRules, quoteUpdateStatusRules } = require('../middleware/validators');

router.get('/', authenticate, c.getAll);
router.get('/:id', authenticate, c.getById);
router.post('/', optionalAuth, quoteCreateRules, validate, c.create);
router.patch('/:id/status', authenticate, quoteUpdateStatusRules, validate, c.updateStatus);
router.delete('/:id', authenticate, requireAdmin, c.delete);

module.exports = router;
