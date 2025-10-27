/**
 * Authentication Controller for PawfectMatch
 * Handles user registration, login, 2FA, biometric authentication
 */

import type { Request, Response } from 'express';
import * as crypto from 'crypto';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import User from '../models/User';
import { generateTokens } from '../middleware/auth';
import { sendEmail } from '../services/emailService';
import { getErrorMessage } from '../../utils/errorHandler';
const logger = require('../utils/logger');

// Type definitions
interface AuthRequest extends Request {
  userId?: string;
  jti?: string;
}

interface RegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone?: string;
  location?: {
    type: string;
    coordinates: number[];
  };
}

interface LoginBody {
  email: string;
  password: string;
}

interface LogoutBody {
  refreshToken?: string;
}

interface Setup2FASmsEmailBody {
  method: 'sms' | 'email';
  phone?: string;
  email?: string;
}

interface Verify2FASmsEmailBody {
  code: string;
}

interface Send2FACodeBody {
  method?: 'sms' | 'email';
}

interface BiometricLoginBody {
  biometricData: string;
  deviceId?: string;
}

interface SetupBiometricBody {
  publicKey: string;
  deviceId: string;
  deviceName?: string;
}

interface VerifyEmailBody {
  token: string;
}

interface ForgotPasswordBody {
  email: string;
}

interface ResetPasswordBody {
  token: string;
  password: string;
}

interface Setup2FABody {
  code: string;
}

interface Verify2FABody {
  code: string;
}

interface Validate2FABody {
  code: string;
}

interface DisableBiometricBody {
  deviceId: string;
}

interface RefreshBiometricTokenBody {
  refreshToken: string;
  deviceId: string;
}

// @desc    Setup 2FA with SMS/Email
// @route   POST /api/auth/2fa/setup-sms-email
// @access  Private
export const setup2FASmsEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { method, phone, email } = req.body as Setup2FASmsEmailBody;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate contact method
    if (method === 'sms' && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number required for SMS 2FA'
      });
    }

    if (method === 'email' && !email) {
      return res.status(400).json({
        success: false,
        message: 'Email address required for email 2FA'
      });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store code with expiry (10 minutes)
    user.twoFactorCode = code;
    user.twoFactorCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.twoFactorMethod = method;

    if (method === 'sms') {
      user.phone = phone;
      logger.info('2FA SMS setup - code sent to phone', { userId: user._id, phone });
    } else if (method === 'email') {
      user.email = email!;
      // Send email with 2FA code
      try {
        await sendEmail({
          email: user.email,
          // subject: 'Your 2FA Verification Code',
          template: 'emailVerification',
          data: {
            firstName: user.firstName,
            code: code
          }
        });
      } catch (emailError) {
        logger.error('2FA email sending error', { error: emailError });
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification code'
        });
      }
    }

    await user.save();

    res.json({
      success: true,
      message: `2FA code sent via ${method}`,
      method: method
    });

  } catch (error: unknown) {
    logger.error('2FA SMS/Email setup error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to setup 2FA'
    });
  }
};

// @desc    Verify 2FA code from SMS/Email
// @route   POST /api/auth/2fa/verify-sms-email
// @access  Private
export const verify2FASmsEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body as Verify2FASmsEmailBody;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.twoFactorCode || !user.twoFactorCodeExpiry) {
      return res.status(400).json({
        success: false,
        message: 'No verification code found'
      });
    }

    if (Date.now() > (user.twoFactorCodeExpiry?.getTime() || 0)) {
      return res.status(400).json({
        success: false,
        message: 'Verification code expired'
      });
    }

    if (user.twoFactorCode !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    user.twoFactorCode = undefined;
    user.twoFactorCodeExpiry = undefined;
    await user.save();

    res.json({
      success: true,
      message: '2FA enabled successfully'
    });

  } catch (error: unknown) {
    logger.error('2FA SMS/Email verification error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to verify 2FA code'
    });
  }
};

// @desc    Send 2FA code
// @route   POST /api/auth/2fa/send-code
// @access  Private (after initial login)
export const send2FACode = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled for this account'
      });
    }

    // Generate new code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store code with expiry (5 minutes for login)
    user.twoFactorCode = code;
    user.twoFactorCodeExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await user.save();

    // Send code based on method
    if (user.twoFactorMethod === 'sms') {
      // In production, send SMS
      logger.info('2FA SMS code sent for login', { userId: user._id, phone: user.phone });
    } else if (user.twoFactorMethod === 'email') {
      try {
        await sendEmail({
          email: user.email,
          // subject: 'Your Login Verification Code',
          template: 'emailVerification',
          data: {
            firstName: user.firstName,
            code: code
          }
        });
      } catch (emailError: unknown) {
        logger.error('2FA login email sending error', { error: emailError });
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification code'
        });
      }
    }

    res.json({
      success: true,
      message: `2FA code sent via ${user.twoFactorMethod}`,
      method: user.twoFactorMethod
    });

  } catch (error: unknown) {
    logger.error('Send 2FA code error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to send 2FA code'
    });
  }
};

// @desc    Biometric login
// @route   POST /api/auth/biometric-login
// @access  Public
export const biometricLogin = async (req: Request, res: Response) => {
  try {
    const { biometricData, deviceId } = req.body as BiometricLoginBody;

    if (!biometricData) {
      return res.status(400).json({
        success: false,
        message: 'Biometric data required'
      });
    }

    // Find user by biometric credentials
    const BiometricCredential = require('../models/BiometricCredential').default;
    const biometric = await BiometricCredential.findOne({
      publicKeyHash: crypto.createHash('sha256').update(biometricData).digest('hex')
    });

    if (!biometric || !biometric.user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid biometric credentials'
      });
    }

    const user = await User.findById(biometric.user);
    if (!user || !user.isActive || user.isBlocked) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user account'
      });
    }

    // Generate tokens
    const tokens = generateTokens(user._id.toString());

    // Store refresh token
    user.refreshTokens.push(tokens.refreshToken);
    if (user.analytics) {
      user.analytics.lastActive = new Date();
    }
    await user.save();

    res.json({
      success: true,
      message: 'Biometric login successful',
      data: {
        user: user.toJSON(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });

  } catch (error: unknown) {
    logger.error('Biometric login error', { error });
    res.status(500).json({
      success: false,
      message: 'Biometric login failed',
      error: getErrorMessage(error)
    });
  }
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      phone,
      location
    } = req.body as RegisterBody;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Calculate age from dateOfBirth
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    if (age < 18) {
      return res.status(400).json({
        success: false,
        message: 'You must be at least 18 years old to register'
      });
    }

    // Create user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      phone,
      location: location || {
        type: 'Point',
        coordinates: [0, 0]
      }
    });

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await user.save();

    // Generate JWT tokens
    const tokens = generateTokens(user._id.toString());

    // Store refresh token
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    // Send verification email
    try {
      await sendEmail({
        email: user.email,
        // subject: 'Welcome to PawfectMatch - Verify Your Email',
        template: 'emailVerification',
        data: {
          firstName: user.firstName,
          verificationUrl: `${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}`
        }
      });
    } catch (emailError) {
      logger.error('Email sending error', { error: emailError });
      // Don't fail registration if email fails
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        user: user.toJSON(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });

  } catch (error) {
    logger.error('Registration error', { error });
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: (error as Error).message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginBody;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists and get password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      });
    }

    if (user.isBlocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is blocked. Please contact support.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Generate tokens
    const tokens = generateTokens(user._id.toString());

    // Store refresh token
    user.refreshTokens.push(tokens.refreshToken);
    if (user.analytics) {
      user.analytics.lastActive = new Date();
    }
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });

  } catch (error: unknown) {
    logger.error('Login error', { error });
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: getErrorMessage(error)
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body as LogoutBody;

    logger.info('Logout attempt', { userId: req.userId, jti: req.jti, refreshToken: !!refreshToken });

    // Revoke current access token by adding its jti to revoked list
    const updateData: Record<string, unknown> = {};
    if (req.jti) {
      updateData.$push = { revokedJtis: req.jti };
    }

    if (refreshToken) {
      updateData.$pull = { refreshTokens: refreshToken };
    }

    logger.debug('Update data', { updateData });

    if (Object.keys(updateData).length > 0) {
      const result = await User.findByIdAndUpdate(req.userId, updateData);
      logger.debug('Update result', { success: !!result });
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error', { error });
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: (error as Error).message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.toJSON()
    });
  } catch (error) {
    logger.error('Get me error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body as VerifyEmailBody;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error: unknown) {
    logger.error('Email verification error', { error });
    res.status(500).json({
      success: false,
      message: 'Email verification failed',
      error: getErrorMessage(error)
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as ForgotPasswordBody;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.json({
        success: true,
        message: 'If that email exists, we sent a password reset link'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.save();

    // Send email
    try {
      await sendEmail({
        email: user.email,
        // subject: 'Password Reset Request - PawfectMatch',
        template: 'passwordReset',
        data: {
          firstName: user.firstName,
          resetUrl: `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`
        }
      });
    } catch (emailError) {
      logger.error('Email sending error', { error: emailError });
    }

    res.json({
      success: true,
      message: 'If that email exists, we sent a password reset link'
    });

  } catch (error) {
    logger.error('Forgot password error', { error });
    res.status(500).json({
      success: false,
      message: 'Password reset request failed',
      error: (error as Error).message
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body as ResetPasswordBody;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error: unknown) {
    logger.error('Reset password error', { error });
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: getErrorMessage(error)
    });
  }
};

// @desc    Setup 2FA
// @route   POST /api/auth/2fa/setup
// @access  Private
export const setup2FA = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is already enabled'
      });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `PawfectMatch (${user.email})`,
      issuer: 'PawfectMatch',
      length: 32
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Save secret temporarily (not enabled until verified)
    user.twoFactorSecret = secret.base32;
    user.twoFactorEnabled = false;
    await user.save();

    res.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes: (secret as { backup_codes?: string[] }).backup_codes || []
    });

  } catch (error) {
    logger.error('2FA setup error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to setup 2FA'
    });
  }
};

// @desc    Verify and enable 2FA
// @route   POST /api/auth/2fa/verify
// @access  Private
export const verify2FA = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body as Verify2FABody;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: 'No 2FA secret found. Please setup 2FA first'
      });
    }

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();

    res.json({
      success: true,
      message: '2FA enabled successfully'
    });

  } catch (error: unknown) {
    logger.error('2FA verify error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to verify 2FA'
    });
  }
};

// @desc    Validate 2FA code
// @route   POST /api/auth/2fa/validate
// @access  Public (after login with 2FA enabled)
export const validate2FA = async (req: Request, res: Response) => {
  try {
    const { code } = req.body as Validate2FABody;
    const { userId } = req.body as { userId: string };

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID required'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled for this account'
      });
    }

    // Check if code matches stored code (for SMS/Email 2FA)
    if (user.twoFactorCode && user.twoFactorCodeExpiry) {
      if (Date.now() > (user.twoFactorCodeExpiry?.getTime() || 0)) {
        return res.status(400).json({
          success: false,
          message: 'Verification code expired'
        });
      }

      if (user.twoFactorCode !== code) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code'
        });
      }

      // Clear code
      user.twoFactorCode = undefined;
      user.twoFactorCodeExpiry = undefined;
      await user.save();

      res.json({
        success: true,
        message: '2FA code validated'
      });
      return;
    }

    // Verify TOTP code (for authenticator app)
    if (user.twoFactorSecret) {
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code'
        });
      }

      res.json({
        success: true,
        message: '2FA code validated'
      });
      return;
    }

    return res.status(400).json({
      success: false,
      message: 'No 2FA verification method found'
    });

  } catch (error) {
    logger.error('2FA validate error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to validate 2FA code'
    });
  }
};

// @desc    Setup biometric authentication
// @route   POST /api/auth/biometric/setup
// @access  Private
export const setupBiometric = async (req: AuthRequest, res: Response) => {
  try {
    const { publicKey, deviceId, deviceName } = req.body as SetupBiometricBody;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash the public key
    const publicKeyHash = crypto.createHash('sha256').update(publicKey).digest('hex');

    const BiometricCredential = require('../models/BiometricCredential').default;

    // Check if credential already exists
    const existingCredential = await BiometricCredential.findOne({
      user: user._id,
      publicKeyHash
    });

    if (existingCredential) {
      return res.status(400).json({
        success: false,
        message: 'Biometric credential already registered'
      });
    }

    // Create new biometric credential
    const biometric = new BiometricCredential({
      user: user._id,
      publicKeyHash,
      publicKey,
      deviceId,
      deviceName: deviceName || `Device ${Date.now()}`,
      createdAt: new Date()
    });

    await biometric.save();

    // Generate refresh token for biometric
    const biometricRefreshToken = crypto.randomBytes(32).toString('hex');
    user.biometricRefreshTokens = user.biometricRefreshTokens || [];
    user.biometricRefreshTokens.push(biometricRefreshToken);
    await user.save();

    res.json({
      success: true,
      message: 'Biometric authentication setup successful',
      refreshToken: biometricRefreshToken
    });

  } catch (error: unknown) {
    logger.error('Biometric setup error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to setup biometric authentication'
    });
  }
};

// @desc    Disable biometric authentication
// @route   POST /api/auth/biometric/disable
// @access  Private
export const disableBiometric = async (req: AuthRequest, res: Response) => {
  try {
    const { deviceId } = req.body as DisableBiometricBody;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const BiometricCredential = require('../models/BiometricCredential').default;

    // Remove biometric credential
    await BiometricCredential.deleteOne({
      user: user._id,
      deviceId
    });

    res.json({
      success: true,
      message: 'Biometric authentication disabled'
    });

  } catch (error) {
    logger.error('Biometric disable error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to disable biometric authentication'
    });
  }
};

// @desc    Refresh biometric token
// @route   POST /api/auth/biometric/refresh
// @access  Public
export const refreshBiometricToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken, deviceId } = req.body as RefreshBiometricTokenBody;

    const user = await User.findOne({
      biometricRefreshTokens: refreshToken
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Check if device is still registered
    const BiometricCredential = require('../models/BiometricCredential').default;
    const biometric = await BiometricCredential.findOne({
      user: user._id,
      deviceId
    });

    if (!biometric) {
      return res.status(401).json({
        success: false,
        message: 'Device not registered for biometric authentication'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user._id.toString());

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });

  } catch (error: unknown) {
    logger.error('Biometric token refresh error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to refresh biometric token'
    });
  }
};

// @desc    Disable 2FA
// @route   POST /api/auth/2fa/disable
// @access  Private
export const disable2FA = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body as Disable2FABody;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled'
      });
    }

    // Verify the code before disabling
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.json({
      success: true,
      message: '2FA disabled successfully'
    });

  } catch (error: unknown) {
    logger.error('2FA disable error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to disable 2FA'
    });
  }
};

interface Disable2FABody {
  code: string;
}

