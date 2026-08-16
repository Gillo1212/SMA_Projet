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
  forgotPasswordRules,
  resetPasswordRules,
  verifyEmailRules,
  resendVerificationRules,
} = require('../middleware/validators');

router.post('/admin/login', adminLoginRules, validate, c.adminLogin);
router.post('/admin/register', authenticate, requireSuperAdmin, adminRegisterRules, validate, c.adminRegister);
router.post('/client/login', clientLoginRules, validate, c.clientLogin);
router.post('/client/register', clientRegisterRules, validate, c.clientRegister);
router.post('/refresh', c.refreshToken);
router.get('/me', authenticate, c.getMe);
router.patch('/change-password', authenticate, changePasswordRules, validate, c.changePassword);

// Récupération de compte / confirmation d'email (routes publiques)
router.post('/forgot-password', forgotPasswordRules, validate, c.forgotPassword);
router.post('/reset-password', resetPasswordRules, validate, c.resetPassword);
router.post('/verify-email', verifyEmailRules, validate, c.verifyEmail);
router.post('/resend-verification', resendVerificationRules, validate, c.resendVerification);

module.exports = router;
