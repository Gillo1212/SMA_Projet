const router = require('express').Router();
const c = require('../controllers/dashboard.controller');
const { authenticate, requireAdmin, requireClient } = require('../middleware/auth');

router.get('/admin', authenticate, requireAdmin, c.getStats);
router.get('/client', authenticate, requireClient, c.getClientDashboard);

module.exports = router;
