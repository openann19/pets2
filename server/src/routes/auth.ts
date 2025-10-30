import express, { type Request, type Response, Router } from 'express';
import { body } from 'express-validator';
const rateLimit = require('express-rate-limit');
import { validate } from '../middleware/validation';
import { authenticateToken, refreshAccessToken } from '../middleware/auth';
import { changePassword, logoutAll } from '../controllers/sessionController';
import {
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
} from '../controllers/authController';

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email: string;
    role?: string;
    [key: string]: unknown;
  };
}

const router: Router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test' // Skip in test environment
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
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const emailValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
];

const passwordValidation = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const twoFactorValidation = [
  body('code').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Valid 6-digit code is required')
];

// Routes with rate limiting
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/biometric-login', authLimiter, biometricLogin);
router.post('/logout', authenticateToken, logout);
router.post('/logout-all', authenticateToken, logoutAll);
router.get('/me', authenticateToken, getMe);
router.post('/refresh-token', authLimiter, refreshAccessToken);
router.post('/verify-email/:token', verifyEmail);
router.post('/forgot-password', passwordResetLimiter, emailValidation, validate, forgotPassword);
// Support both legacy param-based and body-based reset password
router.post('/reset-password/:token', passwordResetLimiter, passwordValidation, validate, resetPassword);
router.post('/reset-password', passwordResetLimiter, passwordValidation, validate, resetPassword);
router.post('/change-password', authenticateToken, changePassword);

// SMS/Email 2FA Routes
router.post('/2fa/setup-sms-email', authenticateToken, setup2FASmsEmail);
router.post('/2fa/verify-sms-email', authenticateToken, verify2FASmsEmail);
router.post('/2fa/send-code', authenticateToken, send2FACode);

// 2FA Routes
router.post('/2fa/setup', authenticateToken, setup2FA);
router.post('/2fa/verify', authenticateToken, twoFactorValidation, validate, verify2FA);
router.post('/2fa/validate', twoFactorValidation, validate, validate2FA);
router.post('/2fa/disable', authenticateToken, twoFactorValidation, validate, disable2FA);

// Biometric Routes
router.post('/biometric/setup', authenticateToken, setupBiometric);
router.post('/biometric/disable', authenticateToken, disableBiometric);
router.post('/biometric/refresh', authenticateToken, refreshBiometricToken);

export default router;
