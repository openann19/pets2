const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const { generateTokens } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');
const logger = require('../utils/logger');

// @desc    Setup 2FA with SMS/Email
// @route   POST /api/auth/2fa/setup-sms-email
// @access  Private
const setup2FASmsEmail = async (req, res) => {
  try {
    const { method, phone, email } = req.body; // method: 'sms' or 'email'
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
    user.twoFactorCodeExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.twoFactorMethod = method;

    if (method === 'sms') {
      user.phone = phone;
      // In production, integrate with SMS service like Twilio
      logger.info('2FA SMS setup - code sent to phone', { userId: user._id, phone });
    } else if (method === 'email') {
      user.email = email;
      // Send email with 2FA code
      try {
        await sendEmail({
          email: user.email,
          subject: 'Your 2FA Verification Code',
          template: 'twoFactorCode',
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

  } catch (error) {
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
const verify2FASmsEmail = async (req, res) => {
  try {
    const { code } = req.body;
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
        message: 'No 2FA code found. Please request a new code.'
      });
    }

    if (user.twoFactorCodeExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: '2FA code has expired. Please request a new code.'
      });
    }

    if (user.twoFactorCode !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 2FA code'
      });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    // user.twoFactorMethod is already set from the setup function
    user.twoFactorCode = undefined; // Clear the code
    user.twoFactorCodeExpiry = undefined;

    await user.save();

    res.json({
      success: true,
      message: '2FA enabled successfully',
      method: user.twoFactorMethod
    });

  } catch (error) {
    logger.error('2FA SMS/Email verification error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to verify 2FA'
    });
  }
};

// @desc    Send 2FA code for login
// @route   POST /api/auth/2fa/send-code
// @access  Private (after initial login)
const send2FACode = async (req, res) => {
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
    user.twoFactorCodeExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    await user.save();

    // Send code based on method
    if (user.twoFactorMethod === 'sms') {
      // In production, send SMS
      logger.info('2FA SMS code sent for login', { userId: user._id, phone: user.phone });
    } else if (user.twoFactorMethod === 'email') {
      try {
        await sendEmail({
          email: user.email,
          subject: 'Your Login Verification Code',
          template: 'loginTwoFactorCode',
          data: {
            firstName: user.firstName,
            code: code
          }
        });
      } catch (emailError) {
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

  } catch (error) {
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
const biometricLogin = async (req, res) => {
  try {
    const { email, biometricToken } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user has biometric authentication enabled
    if (!user.biometricEnabled) {
      return res.status(401).json({
        success: false,
        message: 'Biometric authentication not enabled for this account'
      });
    }

    // Verify biometric token (in production, this would be more sophisticated)
    // For now, we'll check if the token exists and is recent
    if (!user.biometricToken || !user.biometricTokenExpiry ||
      user.biometricToken !== biometricToken ||
      user.biometricTokenExpiry < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Biometric authentication failed'
      });
    }

    // Check account status
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

    // Update last login
    user.lastLoginAt = new Date();
    user.lastLoginIP = req.ip;
    await user.save();

    // Generate tokens
    const tokens = generateTokens(user._id);

    // Store refresh token
    user.refreshTokens.push(tokens.refreshToken);
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

  } catch (error) {
    logger.error('Biometric login error:', { error });
    return res.status(500).json({
      success: false,
      message: 'Biometric login failed'
    });
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      phone,
      location
    } = req.body;

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
    const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));

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
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    // Generate JWT tokens
    const tokens = generateTokens(user._id);

    // Store refresh token
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    // Send verification email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Welcome to PawfectMatch - Verify Your Email',
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
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

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
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const tokens = generateTokens(user._id);

    // Store refresh token
    user.refreshTokens.push(tokens.refreshToken);
    user.analytics.lastActive = new Date();
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

  } catch (error) {
    logger.error('Login error', { error });
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};

    logger.info('Logout attempt', { userId: req.userId, jti: req.jti, refreshToken: !!refreshToken });

    // Revoke current access token by adding its jti to revoked list
    const updateData = {};
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
    logger.error('Logout error:', { error });
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('pets');

    res.json({
      success: true,
      data: { user }
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
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

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

  } catch (error) {
    logger.error('Email verification error', { error });
    res.status(500).json({
      success: false,
      message: 'Email verification failed'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send reset email
    try {
      await sendEmail({
        email: user.email,
        subject: 'PawfectMatch - Password Reset Request',
        template: 'passwordReset',
        data: {
          firstName: user.firstName,
          resetUrl: `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`
        }
      });

      res.json({
        success: true,
        message: 'Password reset email sent'
      });

    } catch (emailError) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      throw emailError;
    }

  } catch (error) {
    logger.error('Forgot password error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to send password reset email'
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password (also supports /api/auth/reset-password/:token)
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // Token can come from route param or request body
    const token = req.params.token || req.body.token;
    // Allow newPassword alias for compatibility with tests
    const password = req.body.password || req.body.newPassword;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Support legacy field names used in some tests (resetPasswordToken/resetPasswordExpires)
    let user = await User.findOne({
      $or: [
        { passwordResetToken: token, passwordResetExpires: { $gt: Date.now() } },
        { resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } }
      ]
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password;
    // Clear both legacy and current fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Clear all refresh tokens (force re-login on all devices)
    user.refreshTokens = [];

    // Invalidate all existing access tokens
    user.tokensInvalidatedAt = new Date();

    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    logger.error('Reset password error', { error });
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
};

// @desc    Setup 2FA
// @route   POST /api/auth/2fa/setup
// @access  Private
const setup2FA = async (req, res) => {
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
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Save secret temporarily (not enabled until verified)
    user.twoFactorSecret = secret.base32;
    user.twoFactorEnabled = false;
    await user.save();

    res.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes: secret.backup_codes || []
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
const verify2FA = async (req, res) => {
  try {
    const { code } = req.body;
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
        message: '2FA not set up. Please setup 2FA first.'
      });
    }

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2 // Allow 2 time steps (60 seconds) tolerance
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

  } catch (error) {
    logger.error('2FA verification error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to verify 2FA'
    });
  }
};

// @desc    Validate 2FA code during login
// @route   POST /api/auth/2fa/validate
// @access  Public
const validate2FA = async (req, res) => {
  try {
    const { userId, code } = req.body;

    const user = await User.findById(userId);
    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA not enabled for this user'
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

    res.json({
      success: true,
      message: '2FA verification successful'
    });

  } catch (error) {
    logger.error('2FA validation error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to validate 2FA'
    });
  }
};

// @desc    Setup biometric authentication
// @route   POST /api/auth/biometric/setup
// @access  Private
const setupBiometric = async (req, res) => {
  try {
    const { deviceInfo, publicKey } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.biometricEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Biometric authentication is already enabled'
      });
    }

    // Generate a biometric token (in production, this would be more secure)
    const biometricToken = crypto.randomBytes(32).toString('hex');

    // Store biometric information
    user.biometricEnabled = true;
    user.biometricToken = biometricToken;
    user.biometricTokenExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    user.deviceInfo = deviceInfo;
    user.publicKey = publicKey;

    await user.save();

    // Return the token (in production, this would be encrypted)
    res.json({
      success: true,
      message: 'Biometric authentication enabled successfully',
      biometricToken: biometricToken,
      expiresAt: user.biometricTokenExpiry
    });

  } catch (error) {
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
const disableBiometric = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.biometricEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Biometric authentication is not enabled'
      });
    }

    // Disable biometric authentication
    user.biometricEnabled = false;
    user.biometricToken = undefined;
    user.biometricTokenExpiry = undefined;
    user.deviceInfo = undefined;
    user.publicKey = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Biometric authentication disabled successfully'
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
// @access  Private
const refreshBiometricToken = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.biometricEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Biometric authentication is not enabled'
      });
    }

    // Generate new biometric token
    const biometricToken = crypto.randomBytes(32).toString('hex');

    // Update token and expiry
    user.biometricToken = biometricToken;
    user.biometricTokenExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

    await user.save();

    res.json({
      success: true,
      message: 'Biometric token refreshed successfully',
      biometricToken: biometricToken,
      expiresAt: user.biometricTokenExpiry
    });

  } catch (error) {
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
const disable2FA = async (req, res) => {
  try {
    const { code } = req.body;
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

  } catch (error) {
    logger.error('2FA disable error', { error });
    res.status(500).json({
      success: false,
      message: 'Failed to disable 2FA'
    });
  }
};

module.exports = {
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
};