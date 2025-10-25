const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const logger = require('../utils/logger');

// Generate JWT tokens
// Includes per-token jti to ensure uniqueness across rapid successive logins.
const generateTokens = (userId) => {
  const isTest = process.env.NODE_ENV === 'test';
  const accessSecret = process.env.JWT_SECRET || (isTest ? 'test-secret' : undefined);
  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || (isTest ? 'test-refresh-secret' : undefined);

  const accessPayload = { userId, jti: crypto.randomUUID() };
  const refreshPayload = { userId, jti: crypto.randomUUID(), typ: 'refresh' };

  const accessOptions = {};
  if (!isTest) {
    accessOptions.expiresIn = process.env.JWT_ACCESS_EXPIRY || process.env.JWT_EXPIRE || '15m';
  }

  const refreshOptions = {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || process.env.JWT_REFRESH_EXPIRE || '7d'
  };

  const accessToken = jwt.sign(accessPayload, accessSecret, accessOptions);
  const refreshToken = jwt.sign(refreshPayload, refreshSecret, refreshOptions);

  return { accessToken, refreshToken };
};

// Helper: parse cookies from header (no cookie-parser dependency)
const getTokenFromCookies = (req) => {
  try {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;
    const map = Object.create(null);
    for (const part of cookieHeader.split(';')) {
      const [k, ...v] = part.trim().split('=');
      if (!k) continue;
      map[decodeURIComponent(k)] = decodeURIComponent(v.join('='));
    }
    return map['accessToken'] || map['access_token'] || map['pm_access'] || null;
  } catch {
    return null;
  }
};

// Middleware to authenticate JWT tokens
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    let token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    // Fallback to httpOnly cookie if no Authorization header
    if (!token) {
      token = getTokenFromCookies(req);
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const isTest = process.env.NODE_ENV === 'test';
    const accessSecret = process.env.JWT_SECRET || (isTest ? 'test-secret' : undefined);
    const decoded = jwt.verify(token, accessSecret);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

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

    // Token invalidation check (logout-all / change-password)
    if (user.tokensInvalidatedAt) {
      const iatMs = (decoded.iat || 0) * 1000;
      if (iatMs < new Date(user.tokensInvalidatedAt).getTime()) {
        return res.status(401).json({ success: false, message: 'Token revoked', code: 'TOKEN_REVOKED' });
      }
    }

    // Per-session revocation by jti
    if (Array.isArray(user.revokedJtis) && decoded.jti && user.revokedJtis.includes(decoded.jti)) {
      logger.debug('Token revoked by jti:', { jti: decoded.jti });
      return res.status(401).json({ success: false, message: 'Token revoked', code: 'TOKEN_REVOKED' });
    }

    // Add user and token info to request object
    req.user = user;
    req.userId = user._id;
    req.jti = decoded.jti; // Store jti for logout revocation

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'TokenExpiredError',
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    logger.error('Auth middleware error:', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Middleware to check if user is premium
const requirePremium = (req, res, next) => {
  if (!req.user.premium.isActive ||
    (req.user.premium.expiresAt && req.user.premium.expiresAt < new Date())) {
    return res.status(403).json({
      success: false,
      message: 'Premium subscription required',
      code: 'PREMIUM_REQUIRED'
    });
  }
  next();
};

// Middleware to check specific premium features
const requirePremiumFeature = (feature) => {
  return (req, res, next) => {
    if (!req.user.premium.isActive ||
      !req.user.premium.features[feature]) {
      return res.status(403).json({
        success: false,
        message: `Premium feature '${feature}' required`,
        code: 'PREMIUM_FEATURE_REQUIRED',
        requiredFeature: feature
      });
    }
    next();
  };
};

// Middleware for admin-only routes
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'administrator') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Refresh token middleware
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token with refresh secret (fallback to JWT_SECRET only if explicitly configured)
    const isTest = process.env.NODE_ENV === 'test';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || (isTest ? 'test-refresh-secret' : undefined);
    const decoded = jwt.verify(refreshToken, refreshSecret);

    // Get user and check if refresh token exists
    const user = await User.findById(decoded.userId);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Invalidate refresh token if revoked
    if (user.tokensInvalidatedAt) {
      const iatMs = (decoded.iat || 0) * 1000;
      if (iatMs < new Date(user.tokensInvalidatedAt).getTime()) {
        return res.status(401).json({ success: false, message: 'Refresh token revoked', code: 'TOKEN_REVOKED' });
      }
    }

    // Generate new tokens
    const tokens = generateTokens(user._id);

    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: user.toJSON()
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    logger.error('Refresh token error:', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (token) {
      const isTest = process.env.NODE_ENV === 'test';
      const accessSecret = process.env.JWT_SECRET || (isTest ? 'test-secret' : undefined);
      const decoded = jwt.verify(token, accessSecret);
      const user = await User.findById(decoded.userId).select('-password -refreshTokens');

      if (user && user.isActive && !user.isBlocked) {
        if (user.tokensInvalidatedAt) {
          const iatMs = (decoded.iat || 0) * 1000;
          if (iatMs < new Date(user.tokensInvalidatedAt).getTime()) {
            return next();
          }
        }
        if (Array.isArray(user.revokedJtis) && decoded.jti && user.revokedJtis.includes(decoded.jti)) {
          return next();
        }
        req.user = user;
        req.userId = user._id;
      }
    }

    next();
  } catch {
    // Silently continue without authentication
    next();
  }
};

module.exports = {
  generateTokens,
  authenticateToken,
  requirePremium,
  requirePremiumFeature,
  requireAdmin,
  refreshAccessToken,
  optionalAuth
};