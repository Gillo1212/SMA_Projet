const router = require('express').Router();
const c = require('../controllers/newsletter.controller');
const { authenticate, requireAdmin, requireRole } = require('../middleware/auth');
const {
  validate, newsletterSubscribeRules, newsletterUnsubscribeRules, newsletterUpdateRules,
} = require('../middleware/validators');

// Public : pied de page du site et lien de désinscription des emails
router.post('/subscribe', newsletterSubscribeRules, validate, c.subscribe);
router.post('/unsubscribe', newsletterUnsubscribeRules, validate, c.unsubscribe);

// Back-office
router.get('/', authenticate, requireAdmin, c.getAll);
router.get('/export', authenticate, requireAdmin, c.exportCsv);
router.patch('/:id', authenticate, requireAdmin, newsletterUpdateRules, validate, c.update);
router.delete('/:id', authenticate, requireRole('super_admin', 'admin'), c.delete);

module.exports = router;
