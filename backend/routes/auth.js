const router = require('express').Router();
const c = require('../controllers/auth.controller');
const { authenticate, requireSuperAdmin } = require('../middleware/auth');
const {
  validate,
  adminLoginRules,
  adminRegisterRules,
  clientLoginRules,
  clientRegisterRules,
  changePasswordRules,
} = require('../middleware/validators');

router.post('/admin/login', adminLoginRules, validate, c.adminLogin);
router.post('/admin/register', authenticate, requireSuperAdmin, adminRegisterRules, validate, c.adminRegister);
router.post('/client/login', clientLoginRules, validate, c.clientLogin);
router.post('/client/register', clientRegisterRules, validate, c.clientRegister);
router.post('/refresh', c.refreshToken);
router.get('/me', authenticate, c.getMe);
router.patch('/change-password', authenticate, changePasswordRules, validate, c.changePassword);

module.exports = router;
