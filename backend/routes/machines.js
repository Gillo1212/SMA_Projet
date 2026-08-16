const router = require('express').Router();
const c = require('../controllers/machines.controller');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validate, machineCreateRules, machineUpdateRules } = require('../middleware/validators');

router.get('/', optionalAuth, c.getAll);
router.get('/categories', c.getCategories);
router.get('/slug/:slug', c.getBySlug);
router.get('/:id', c.getById);
router.post('/', authenticate, requireAdmin, machineCreateRules, validate, c.create);
router.put('/:id', authenticate, requireAdmin, machineUpdateRules, validate, c.update);
router.delete('/:id', authenticate, requireAdmin, c.delete);

module.exports = router;
