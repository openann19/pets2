import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import User from '../models/User';
import { logger } from '../utils/logger';
import { AuthenticatedRequest, User as AppUser } from '../types';

interface TokenPayload extends JwtPayload {
  userId: string;
  jti: string;
  typ?: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const getRequiredSecret = (value: string | undefined, fallback: string | undefined, fallbackLabel: string): string => {
  if (value) return value;
  if (fallback) return fallback;

  throw new Error(`Missing JWT secret (expected ${fallbackLabel})`);
};

// Generate JWT tokens
// Includes per-token jti to ensure uniqueness across rapid successive logins.
export const generateTokens = (userId: string): TokenPair => {
  const isTest = process.env['NODE_ENV'] === 'test';
  const accessSecret = getRequiredSecret(
    process.env['JWT_SECRET'],
    isTest ? 'test-secret' : undefined,
    'JWT_SECRET'
  );
  const refreshSecret = getRequiredSecret(
    process.env['JWT_REFRESH_SECRET'],
    process.env['JWT_SECRET'] || (isTest ? 'test-refresh-secret' : undefined),
    'JWT_REFRESH_SECRET'
  );

  const accessPayload: TokenPayload = { userId, jti: crypto.randomUUID() };
  const refreshPayload: TokenPayload = { userId, jti: crypto.randomUUID(), typ: 'refresh' };

  const accessOptions: jwt.SignOptions = {
    expiresIn: isTest ? undefined : process.env['JWT_ACCESS_EXPIRY'] || process.env['JWT_EXPIRE'] || '15m'
  };

  const refreshOptions: jwt.SignOptions = {
    expiresIn: process.env['JWT_REFRESH_EXPIRY'] || process.env['JWT_REFRESH_EXPIRE'] || '7d'
  };

  const accessToken = jwt.sign(accessPayload, accessSecret, accessOptions);
  const refreshToken = jwt.sign(refreshPayload, refreshSecret, refreshOptions);

  return { accessToken, refreshToken };
};

// Helper: parse cookies from header (no cookie-parser dependency)
const getTokenFromCookies = (req: Request): string | null => {
  try {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;
    const map: Record<string, string> = Object.create(null);
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
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
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
    const accessSecret = getRequiredSecret(
      process.env.JWT_SECRET,
      isTest ? 'test-secret' : undefined,
      'JWT_SECRET'
    );
    const decoded = jwt.verify(token, accessSecret) as TokenPayload;

    // Get user from database
    const userDoc = await User.findById(decoded.userId).select('-password -refreshTokens');

    if (!userDoc) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!userDoc.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    if (userDoc.isBlocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is blocked'
      });
    }

    // Token invalidation check (logout-all / change-password)
    if (userDoc.tokensInvalidatedAt) {
      const iatMs = (decoded.iat || 0) * 1000;
      if (iatMs < new Date(userDoc.tokensInvalidatedAt).getTime()) {
        return res.status(401).json({ success: false, message: 'Token revoked', code: 'TOKEN_REVOKED' });
      }
    }

    // Per-session revocation by jti
    if (Array.isArray(userDoc.revokedJtis) && decoded.jti && userDoc.revokedJtis.includes(decoded.jti)) {
      logger.debug('Token revoked by jti:', { jti: decoded.jti });
      return res.status(401).json({ success: false, message: 'Token revoked', code: 'TOKEN_REVOKED' });
    }

    // Add user and token info to request object
    req.user = userDoc.toObject() as AppUser;
    req.userId = userDoc._id.toString();
    req.jti = decoded.jti; // Store jti for logout revocation

    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'TokenExpiredError',
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Auth middleware error:', { error: message });
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Middleware to check if user is premium
const requirePremium = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  if (!req.user?.premium?.isActive ||
    (req.user.premium.expiresAt && req.user.premium.expiresAt < new Date())) {
    return res.status(403).json({
      success: false,
      message: 'Premium subscription required',
      code: 'PREMIUM_REQUIRED'
    });
  }
  return next();
};

// Middleware to check specific premium features
const requirePremiumFeature = (feature: keyof AppUser['premium']['features']) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Response | void => {
    if (!req.user?.premium?.isActive ||
      !req.user.premium.features[feature]) {
      return res.status(403).json({
        success: false,
        message: `Premium feature '${feature}' required`,
        code: 'PREMIUM_FEATURE_REQUIRED',
        requiredFeature: feature
      });
    }
    return next();
  };
};

// Middleware for admin-only routes
const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Response | void => {
  if (req.user?.role !== 'administrator') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  return next();
};

// Refresh token middleware
const refreshAccessToken = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
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
    const refreshSecret = getRequiredSecret(
      process.env.JWT_REFRESH_SECRET,
      process.env.JWT_SECRET || (isTest ? 'test-refresh-secret' : undefined),
      'JWT_REFRESH_SECRET'
    );
    const decoded = jwt.verify(refreshToken, refreshSecret) as TokenPayload;

    // Get user and check if refresh token exists
    const userDoc = await User.findById(decoded.userId);

    if (!userDoc || !userDoc.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Invalidate refresh token if revoked
    if (userDoc.tokensInvalidatedAt) {
      const iatMs = (decoded.iat || 0) * 1000;
      if (iatMs < new Date(userDoc.tokensInvalidatedAt).getTime()) {
        return res.status(401).json({ success: false, message: 'Refresh token revoked', code: 'TOKEN_REVOKED' });
      }
    }

    // Generate new tokens
    const tokens = generateTokens(userDoc._id.toString());

    // Replace old refresh token with new one
    userDoc.refreshTokens = userDoc.refreshTokens.filter((token) => token !== refreshToken);
    userDoc.refreshTokens.push(tokens.refreshToken);
    await userDoc.save();

    res.json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: userDoc.toJSON()
      }
    });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Refresh token error:', { error: message });
    return res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (token) {
      const isTest = process.env.NODE_ENV === 'test';
      const accessSecret = getRequiredSecret(
        process.env.JWT_SECRET,
        isTest ? 'test-secret' : undefined,
        'JWT_SECRET'
      );
      const decoded = jwt.verify(token, accessSecret) as TokenPayload;
      const userDoc = await User.findById(decoded.userId).select('-password -refreshTokens');

      if (userDoc && userDoc.isActive && !userDoc.isBlocked) {
        if (userDoc.tokensInvalidatedAt) {
          const iatMs = (decoded.iat || 0) * 1000;
          if (iatMs < new Date(userDoc.tokensInvalidatedAt).getTime()) {
            return next();
          }
        }
        if (Array.isArray(userDoc.revokedJtis) && decoded.jti && userDoc.revokedJtis.includes(decoded.jti)) {
          return next();
        }
        req.user = userDoc.toObject() as AppUser;
        req.userId = userDoc._id.toString();
      }
    }

    next();
  } catch {
    // Silently continue without authentication
    next();
  }
};

export {
  generateTokens,
  authenticateToken,
  requirePremium,
  requirePremiumFeature,
  requireAdmin,
  refreshAccessToken,
  optionalAuth
};