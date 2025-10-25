import express, { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validation';
import { authenticateToken, refreshAccessToken } from '../middleware/auth';

// Import controllers from CommonJS modules
const authController = require('../controllers/authController');
const sessionController = require('../controllers/sessionController');

const {
  setup2FASmsEmail,
  verify2FASmsEmail,
  send2FACode,
  biometricLogin,
  setupBiometric,
  disableBiometric,
  refreshBiometricToken,
  register,
  login,
  logout,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
  setup2FA,
  verify2FA,
  validate2FA,
  disable2FA
} = authController;

const { changePassword, logoutAll } = sessionController;

const router: Router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env['NODE_ENV'] === 'test' // Skip in test environment
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: 'Too many password reset attempts, please try again later'
});

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

const twoFactorValidation = [
  body('code').isLength({ min: 6, max: 6 }).withMessage('2FA code must be 6 digits'),
];

const biometricValidation = [
  body('biometricToken').notEmpty().withMessage('Biometric token is required'),
];

// Public routes (no authentication required)
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/forgot-password', passwordResetLimiter, forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPasswordValidation, validate, resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/refresh-token', refreshAccessToken);

// Biometric authentication routes
router.post('/biometric/login', authLimiter, biometricValidation, validate, biometricLogin as any);
router.post('/biometric/setup', authenticateToken as any, setupBiometric);
router.post('/biometric/disable', authenticateToken as any, disableBiometric);
router.post('/biometric/refresh', authenticateToken as any, refreshBiometricToken);

// 2FA routes
router.post('/2fa/setup', authenticateToken, setup2FA);
router.post('/2fa/verify', authenticateToken, twoFactorValidation, validate, verify2FA);
router.post('/2fa/validate', authenticateToken, twoFactorValidation, validate, validate2FA);
router.post('/2fa/disable', authenticateToken, disable2FA);

// SMS/Email 2FA routes
router.post('/2fa/sms-email/setup', authenticateToken, setup2FASmsEmail);
router.post('/2fa/sms-email/verify', authenticateToken, twoFactorValidation, validate, verify2FASmsEmail);
router.post('/2fa/sms-email/send-code', authenticateToken, send2FACode);

// Protected routes (authentication required)
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);
router.post('/logout-all', authenticateToken, logoutAll);
router.post('/change-password', authenticateToken, changePasswordValidation, validate, changePassword);

export default router;
