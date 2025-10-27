/**
 * Biometric Authentication Routes
 * Handles WebAuthn-based biometric authentication endpoints
 */

import express, { type Request, type Response, Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import {
  generateRegistrationOptionsHandler,
  verifyRegistrationHandler,
  generateAuthenticationOptionsHandler,
  verifyAuthenticationHandler,
  removeBiometric,
  getBiometricStatus
} from '../controllers/biometricController';

interface AuthenticatedRequest extends Request {
  userId: string; // Required - set by authenticateToken middleware
  user?: {
    _id: string;
    email: string;
    [key: string]: any;
  };
}

const router: Router = express.Router();

// Validation rules
const verifyRegistrationValidation = [
  body('credential').isObject().withMessage('Credential is required')
];

const verifyAuthenticationValidation = [
  body('credential').isObject().withMessage('Credential is required')
];

const authenticationOptionsValidation = [
  body('email').isEmail().withMessage('Valid email is required')
];

/**
 * @route   POST /api/auth/biometric/register/options
 * @desc    Generate registration options for WebAuthn
 * @access  Private
 */
router.post('/register/options', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    await generateRegistrationOptionsHandler(req as AuthenticatedRequest, res);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate registration options',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/biometric/register/verify
 * @desc    Verify registration response and store credential
 * @access  Private
 */
router.post('/register/verify', authenticateToken, verifyRegistrationValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    await verifyRegistrationHandler(req as AuthenticatedRequest, res);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Registration verification failed',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/biometric/authenticate/options
 * @desc    Generate authentication options for WebAuthn
 * @access  Public
 */
router.post('/authenticate/options', authenticationOptionsValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    await generateAuthenticationOptionsHandler(req, res);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate authentication options',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/biometric/authenticate/verify
 * @desc    Verify authentication response and issue tokens
 * @access  Public
 */
router.post('/authenticate/verify', verifyAuthenticationValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    await verifyAuthenticationHandler(req, res);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Authentication verification failed',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/auth/biometric/remove
 * @desc    Remove biometric credential
 * @access  Private
 */
router.delete('/remove', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    await removeBiometric(req as AuthenticatedRequest, res);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Removal failed',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/auth/biometric/status
 * @desc    Get biometric status for user
 * @access  Private
 */
router.get('/status', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    await getBiometricStatus(req as AuthenticatedRequest, res);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get status',
      error: error.message
    });
  }
});

export default router;
