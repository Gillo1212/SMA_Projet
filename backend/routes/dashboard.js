const router = require('express').Router();
const c = require('../controllers/dashboard.controller');
const { authenticate, requireAdmin, requireClient } = require('../middleware/auth');

router.get('/admin', authenticate, requireAdmin, c.getStats);
// Pastilles du menu et cloche : interrogé régulièrement, requêtes légères
router.get('/counters', authenticate, requireAdmin, c.getCounters);
router.get('/client', authenticate, requireClient, c.getClientDashboard);

module.exports = router;
