export {};// Added to mark file as a module
/**
 * Biometric Authentication Routes
 * Handles WebAuthn-based biometric authentication endpoints
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const {
  generateRegistrationOptionsHandler,
  verifyRegistrationHandler,
  generateAuthenticationOptionsHandler,
  verifyAuthenticationHandler,
  removeBiometric,
  getBiometricStatus
} = require('../controllers/biometricController');

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
router.post('/register/options', authenticateToken, async (req, res) => {
  try {
    await generateRegistrationOptionsHandler(req, res);
  } catch (error) {
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
router.post('/register/verify', authenticateToken, verifyRegistrationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    await verifyRegistrationHandler(req, res);
  } catch (error) {
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
router.post('/authenticate/options', authenticationOptionsValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    await generateAuthenticationOptionsHandler(req, res);
  } catch (error) {
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
router.post('/authenticate/verify', verifyAuthenticationValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    await verifyAuthenticationHandler(req, res);
  } catch (error) {
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
router.delete('/remove', authenticateToken, async (req, res) => {
  try {
    await removeBiometric(req, res);
  } catch (error) {
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
router.get('/status', authenticateToken, async (req, res) => {
  try {
    await getBiometricStatus(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get status',
      error: error.message
    });
  }
});

export default router;
