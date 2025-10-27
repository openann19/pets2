/**
 * Biometric Authentication Controller
 * Handles WebAuthn-based biometric authentication
 */

import type { Request, Response } from 'express';
import User from '../models/User';
import BiometricCredential from '../models/BiometricCredential';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from '@simplewebauthn/server';
import { getErrorMessage } from '../../utils/errorHandler';
import type {
  GenerateRegistrationOptionsOpts,
  GenerateAuthenticationOptionsOpts,
  AuthenticatorTransportFuture
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
    credential: {
      id: string;
      rawId: string;
      response: {
        clientDataJSON: string;
        attestationObject: string;
      };
      type: 'public-key';
    };
  };
}

interface GenerateAuthRequest extends Request {
  body: {
    email: string;
  };
}

interface VerifyAuthRequest extends Request {
  body: {
    credential: {
      id: string;
      rawId: string;
      response: {
        clientDataJSON: string;
        authenticatorData: string;
        signature: string;
        userHandle?: string;
      };
      type: 'public-key';
    };
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
    const userIDBuffer = Buffer.from(userId.toString());
    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new Uint8Array(userIDBuffer),
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
    user.webauthnChallenge = options.challenge;
    await user.save();

    logger.info('Registration options generated', { userId });

    res.json({
      success: true,
      options
    });
  } catch (error: unknown) {
    logger.error('Registration options generation error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to generate registration options',
      error: getErrorMessage(error)
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
    if (!user || !user.webauthnChallenge) {
      res.status(400).json({
        success: false,
        message: 'No registration in progress'
      });
      return;
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
      res.status(400).json({
        success: false,
        message: 'Registration verification failed'
      });
      return;
    }

    const {
      aaguid,
      credentialDeviceType,
      credentialBackedUp
    } = registrationInfo;
    
    const credentialPublicKey = registrationInfo.credential?.publicKey;
    const credentialID = registrationInfo.credential?.id;
    const counter = registrationInfo.credential?.counter || 0;

    if (!credentialPublicKey || !credentialID) {
      throw new Error('Invalid registration information');
    }

    // Store the credential
    const biometricCredential = new BiometricCredential({
      userId,
      credentialId: Buffer.from(credentialID).toString('base64url'),
      publicKey: Buffer.from(credentialPublicKey).toString('base64url'),
      counter,
      aaguid,
      credentialDeviceType,
      credentialBackedUp,
      transports: (credential.response?.transports as string[]) || []
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
    if (error instanceof Error) {
      logger.error('Biometric registration verification error', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to verify biometric registration',
        error: getErrorMessage(error)
      });
    } else {
      logger.error('Unknown error during biometric registration verification', { error });
      res.status(500).json({
        success: false,
        message: 'Failed to verify biometric registration',
        error: 'Unknown error'
      });
    }
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
    const credentialIdBuffer = Buffer.from(biometricCredential.credentialId, 'base64url');
    const options = await generateAuthenticationOptions({
      rpID,
      timeout: 300000,
      allowCredentials: [{
        id: credentialIdBuffer,
        transports: biometricCredential.transports || []
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
  } catch (error: unknown) {
    logger.error('Authentication options generation error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to generate authentication options',
      error: getErrorMessage(error)
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

    if (!biometricCredential || !(biometricCredential as { currentChallenge?: string }).currentChallenge) {
      res.status(401).json({
        success: false,
        message: 'Invalid credential or no authentication in progress'
      });
      return;
    }

    const user = biometricCredential.userId as { isActive: boolean };

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

    const expectedChallenge = (biometricCredential as { currentChallenge?: string }).currentChallenge;

    // Verify the authentication response
    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true
    } as Parameters<typeof verifyAuthenticationResponse>[0]);

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
    (biometricCredential as { lastUsed?: Date }).lastUsed = new Date();
    (biometricCredential as { currentChallenge?: string | null }).currentChallenge = null;
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
  } catch (error: unknown) {
    logger.error('Authentication verification error', { error });
    res.status(500).json({
      success: false,
      message: 'Authentication verification failed',
      error: getErrorMessage(error)
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
  } catch (error: unknown) {
    logger.error('Biometric removal error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to remove biometric authentication',
      error: getErrorMessage(error)
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
  } catch (error: unknown) {
    logger.error('Biometric status error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get biometric status',
      error: getErrorMessage(error)
    });
  }
};

