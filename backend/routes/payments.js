const router = require('express').Router();
const c = require('../controllers/payments.controller');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate, paymentInitiateRules, paymentSimulateRules } = require('../middleware/validators');

// Les webhooks sont appelés par le prestataire : pas de JWT, la légitimité
// est établie par la signature (Wave) ou le notif_token (Orange Money).
router.post('/webhook/:provider', c.webhook);

router.post('/initiate', authenticate, paymentInitiateRules, validate, c.initiate);
router.get('/status/:reference', authenticate, c.getStatus);
router.get('/config', authenticate, requireAdmin, c.getConfiguration);

// Développement uniquement — le contrôleur refuse la route en production
router.post('/simulate', paymentSimulateRules, validate, c.simulate);

module.exports = router;
