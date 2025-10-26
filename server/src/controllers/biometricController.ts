/**
 * Biometric Authentication Controller
 * Handles WebAuthn-based biometric authentication
 */

import { Request, Response } from 'express';
import User from '../models/User';
import BiometricCredential from '../models/BiometricCredential';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  GenerateRegistrationOptionsOpts,
  GenerateAuthenticationOptionsOpts
} from '@simplewebauthn/server';

// WebAuthn configuration from environment
const rpName = process.env.WEBAUTHN_RP_NAME || 'PawfectMatch';
const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
const origin = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';

/**
 * Request interfaces
 */
interface AuthenticatedRequest extends Request {
  userId: string;
}

interface GenerateRegistrationRequest extends AuthenticatedRequest {}

interface VerifyRegistrationRequest extends AuthenticatedRequest {
  body: {
    credential: any;
  };
}

interface GenerateAuthRequest extends Request {
  body: {
    email: string;
  };
}

interface VerifyAuthRequest extends Request {
  body: {
    credential: any;
  };
}

interface GetStatusRequest extends AuthenticatedRequest {}

/**
 * Generate registration options for WebAuthn
 * @route POST /api/auth/biometric/register/options
 * @access Private
 */
export const generateRegistrationOptionsHandler = async (
  req: GenerateRegistrationRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;

    // Get user from database
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if user already has biometric credentials
    const existingCredential = await BiometricCredential.findOne({ userId });
    if (existingCredential) {
      res.status(400).json({
        success: false,
        message: 'Biometric authentication already registered'
      });
      return;
    }

    // Generate registration options
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: userId.toString(),
      userName: user.email,
      userDisplayName: user.firstName + ' ' + user.lastName,
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
    (user as any).webauthnChallenge = options.challenge;
    await user.save();

    logger.info('Registration options generated', { userId });

    res.json({
      success: true,
      options
    });
  } catch (error: any) {
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
export const verifyRegistrationHandler = async (
  req: VerifyRegistrationRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({
        success: false,
        message: 'Credential is required'
      });
      return;
    }

    // Get user and challenge
    const user = await User.findById(userId);
    if (!user || !(user as any).webauthnChallenge) {
      res.status(400).json({
        success: false,
        message: 'No registration in progress'
      });
      return;
    }

    const expectedChallenge = (user as any).webauthnChallenge;

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
      res.status(400).json({
        success: false,
        message: 'Registration verification failed'
      });
      return;
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
    (user as any).webauthnChallenge = undefined;
    await user.save();

    logger.info('Biometric credential registered', { userId });

    res.json({
      success: true,
      message: 'Biometric authentication registered successfully',
      credentialId: biometricCredential.credentialId
    });
  } catch (error: any) {
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
export const generateAuthenticationOptionsHandler = async (
  req: GenerateAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email is required'
      });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if user has biometric credentials
    const biometricCredential = await BiometricCredential.findOne({ userId: user._id });
    if (!biometricCredential) {
      res.status(404).json({
        success: false,
        message: 'No biometric credentials registered'
      });
      return;
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
    (biometricCredential as any).currentChallenge = options.challenge;
    await biometricCredential.save();

    logger.info('Authentication options generated', { userId: user._id });

    res.json({
      success: true,
      options
    });
  } catch (error: any) {
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
export const verifyAuthenticationHandler = async (
  req: VerifyAuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({
        success: false,
        message: 'Credential is required'
      });
      return;
    }

    // Find credential by ID
    const credentialIdBase64 = Buffer.from(credential.rawId, 'base64').toString('base64url');
    const biometricCredential = await BiometricCredential.findOne({
      credentialId: credentialIdBase64
    }).populate('userId');

    if (!biometricCredential || !(biometricCredential as any).currentChallenge) {
      res.status(401).json({
        success: false,
        message: 'Invalid credential or no authentication in progress'
      });
      return;
    }

    const user: any = biometricCredential.userId;

    // Check if user account is active
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
      return;
    }

    if (user.isBlocked) {
      res.status(401).json({
        success: false,
        message: 'Account is blocked'
      });
      return;
    }

    const expectedChallenge = (biometricCredential as any).currentChallenge;

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
      res.status(401).json({
        success: false,
        message: 'Authentication verification failed'
      });
      return;
    }

    // Update counter (prevents replay attacks)
    biometricCredential.counter = authenticationInfo.newCounter;
    (biometricCredential as any).lastUsed = new Date();
    (biometricCredential as any).currentChallenge = null;
    await biometricCredential.save();

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
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
  } catch (error: any) {
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
export const removeBiometric = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;

    // Find and remove biometric credential
    const biometricCredential = await BiometricCredential.findOneAndDelete({ userId });

    if (!biometricCredential) {
      res.status(404).json({
        success: false,
        message: 'No biometric credential found'
      });
      return;
    }

    logger.info('Biometric credential removed', { userId });

    res.json({
      success: true,
      message: 'Biometric authentication removed successfully'
    });
  } catch (error: any) {
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
export const getBiometricStatus = async (
  req: GetStatusRequest,
  res: Response
): Promise<void> => {
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
  } catch (error: any) {
    logger.error('Biometric status error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get biometric status',
      error: error.message
    });
  }
};

