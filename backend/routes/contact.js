const router = require('express').Router();
const c = require('../controllers/contact.controller');
const { authenticate, requireAdmin, requireRole } = require('../middleware/auth');
const { validate, contactCreateRules, contactUpdateRules } = require('../middleware/validators');

// Public : formulaire de la page Contact (limite de débit dédiée, voir app.js)
router.post('/', contactCreateRules, validate, c.create);

// Back-office : toute l'équipe lit et traite ; la suppression est réservée aux administrateurs
router.get('/', authenticate, requireAdmin, c.getAll);
router.patch('/:id', authenticate, requireAdmin, contactUpdateRules, validate, c.update);
router.delete('/:id', authenticate, requireRole('super_admin', 'admin'), c.delete);

module.exports = router;
