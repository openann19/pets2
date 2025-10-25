/**
 * Biometric Authentication Controller
 * Handles WebAuthn-based biometric authentication
 */

const User = require('../models/User');
const BiometricCredential = require('../models/BiometricCredential');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} = require('@simplewebauthn/server');

// WebAuthn configuration from environment
const rpName = process.env.WEBAUTHN_RP_NAME || 'PawfectMatch';
const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
const origin = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';

/**
 * Generate registration options for WebAuthn
 * @route POST /api/auth/biometric/register/options
 * @access Private
 */
const generateRegistrationOptionsHandler = async (req, res) => {
  try {
    const userId = req.userId;

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user already has biometric credentials
    const existingCredential = await BiometricCredential.findOne({ userId });
    if (existingCredential) {
      return res.status(400).json({
        success: false,
        message: 'Biometric authentication already registered'
      });
    }

    // Generate registration options
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: userId.toString(),
      userName: user.email,
      userDisplayName: user.name,
      // Timeout after 5 minutes
      timeout: 300000,
      attestationType: 'none',
      // Prefer platform authenticators (e.g., Touch ID, Face ID)
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        requireResidentKey: false,
        residentKey: 'preferred',
        userVerification: 'preferred'
      },
      // Support both algorithms
      supportedAlgorithmIDs: [-7, -257]
    });

    // Store challenge temporarily in user session or cache
    // For now, we'll store it in the user document
    user.webauthnChallenge = options.challenge;
    await user.save();

    logger.info('Registration options generated', { userId });

    res.json({
      success: true,
      options
    });

  } catch (error) {
    logger.error('Registration options generation error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to generate registration options',
      error: error.message
    });
  }
};

/**
 * Verify registration response and store credential
 * @route POST /api/auth/biometric/register/verify
 * @access Private
 */
const verifyRegistrationHandler = async (req, res) => {
  try {
    const userId = req.userId;
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Credential is required'
      });
    }

    // Get user and challenge
    const user = await User.findById(userId);
    if (!user || !user.webauthnChallenge) {
      return res.status(400).json({
        success: false,
        message: 'No registration in progress'
      });
    }

    const expectedChallenge = user.webauthnChallenge;

    // Verify the registration response
    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true
    });

    const { verified, registrationInfo } = verification;

    if (!verified || !registrationInfo) {
      return res.status(400).json({
        success: false,
        message: 'Registration verification failed'
      });
    }

    const {
      credentialPublicKey,
      credentialID,
      counter,
      aaguid,
      credentialDeviceType,
      credentialBackedUp
    } = registrationInfo;

    // Store the credential
    const biometricCredential = new BiometricCredential({
      userId,
      credentialId: Buffer.from(credentialID).toString('base64url'),
      publicKey: Buffer.from(credentialPublicKey).toString('base64url'),
      counter,
      aaguid,
      credentialDeviceType,
      credentialBackedUp,
      transports: credential.response?.transports || []
    });

    await biometricCredential.save();

    // Clear the challenge
    user.webauthnChallenge = undefined;
    await user.save();

    logger.info('Biometric credential registered', { userId });

    res.json({
      success: true,
      message: 'Biometric authentication registered successfully',
      credentialId: biometricCredential.credentialId
    });

  } catch (error) {
    logger.error('Registration verification error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to verify registration',
      error: error.message
    });
  }
};

/**
 * Generate authentication options for WebAuthn
 * @route POST /api/auth/biometric/authenticate/options
 * @access Public
 */
const generateAuthenticationOptionsHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has biometric credentials
    const biometricCredential = await BiometricCredential.findOne({ userId: user._id });
    if (!biometricCredential) {
      return res.status(404).json({
        success: false,
        message: 'No biometric credentials registered'
      });
    }

    // Generate authentication options
    const options = await generateAuthenticationOptions({
      rpID,
      timeout: 300000,
      allowCredentials: [{
        id: Buffer.from(biometricCredential.credentialId, 'base64url'),
        type: 'public-key',
        transports: biometricCredential.transports
      }],
      userVerification: 'preferred'
    });

    // Store challenge in credential document
    biometricCredential.currentChallenge = options.challenge;
    await biometricCredential.save();

    logger.info('Authentication options generated', { userId: user._id });

    res.json({
      success: true,
      options
    });

  } catch (error) {
    logger.error('Authentication options generation error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to generate authentication options',
      error: error.message
    });
  }
};

/**
 * Verify authentication response and issue tokens
 * @route POST /api/auth/biometric/authenticate/verify
 * @access Public
 */
const verifyAuthenticationHandler = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Credential is required'
      });
    }

    // Find credential by ID
    const credentialIdBase64 = Buffer.from(credential.rawId, 'base64').toString('base64url');
    const biometricCredential = await BiometricCredential.findOne({
      credentialId: credentialIdBase64
    }).populate('userId');

    if (!biometricCredential || !biometricCredential.currentChallenge) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credential or no authentication in progress'
      });
    }

    const user = biometricCredential.userId;

    // Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    if (user.isBlocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is blocked'
      });
    }

    const expectedChallenge = biometricCredential.currentChallenge;

    // Verify the authentication response
    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: Buffer.from(biometricCredential.credentialId, 'base64url'),
        credentialPublicKey: Buffer.from(biometricCredential.publicKey, 'base64url'),
        counter: biometricCredential.counter
      },
      requireUserVerification: true
    });

    const { verified, authenticationInfo } = verification;

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Authentication verification failed'
      });
    }

    // Update counter (prevents replay attacks)
    biometricCredential.counter = authenticationInfo.newCounter;
    biometricCredential.lastUsed = new Date();
    biometricCredential.currentChallenge = null;
    await biometricCredential.save();

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Update user's refresh tokens
    user.refreshTokens.push(refreshToken);
    user.analytics.lastActive = new Date();
    await user.save();

    logger.info('Biometric authentication successful', { userId: user._id });

    res.json({
      success: true,
      message: 'Biometric authentication successful',
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    logger.error('Authentication verification error', { error });
    res.status(500).json({
      success: false,
      message: 'Authentication verification failed',
      error: error.message
    });
  }
};

/**
 * Remove biometric credential
 * @route DELETE /api/auth/biometric/remove
 * @access Private
 */
const removeBiometric = async (req, res) => {
  try {
    const userId = req.userId;

    // Find and remove biometric credential
    const biometricCredential = await BiometricCredential.findOneAndDelete({ userId });

    if (!biometricCredential) {
      return res.status(404).json({
        success: false,
        message: 'No biometric credential found'
      });
    }

    logger.info('Biometric credential removed', { userId });

    res.json({
      success: true,
      message: 'Biometric authentication removed successfully'
    });

  } catch (error) {
    logger.error('Biometric removal error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to remove biometric authentication',
      error: error.message
    });
  }
};

/**
 * Get biometric status for user
 * @route GET /api/auth/biometric/status
 * @access Private
 */
const getBiometricStatus = async (req, res) => {
  try {
    const userId = req.userId;

    const biometricCredential = await BiometricCredential.findOne({ userId });

    res.json({
      success: true,
      data: {
        registered: !!biometricCredential,
        credentialId: biometricCredential?.credentialId,
        createdAt: biometricCredential?.createdAt
      }
    });

  } catch (error) {
    logger.error('Biometric status error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get biometric status',
      error: error.message
    });
  }
};

module.exports = {
  generateRegistrationOptionsHandler,
  verifyRegistrationHandler,
  generateAuthenticationOptionsHandler,
  verifyAuthenticationHandler,
  removeBiometric,
  getBiometricStatus
};
