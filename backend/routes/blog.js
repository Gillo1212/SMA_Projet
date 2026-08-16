const router = require('express').Router();
const c = require('../controllers/blog.controller');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validate, blogCreateRules, blogUpdateRules } = require('../middleware/validators');

router.get('/', optionalAuth, c.getAll);
router.get('/categories', c.getCategories);
router.get('/:slug', optionalAuth, c.getBySlug);
router.post('/', authenticate, requireAdmin, blogCreateRules, validate, c.create);
router.put('/:id', authenticate, requireAdmin, blogUpdateRules, validate, c.update);
router.delete('/:id', authenticate, requireAdmin, c.delete);

module.exports = router;
