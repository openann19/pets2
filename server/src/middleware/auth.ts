import jwt, { JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';
import { Response, NextFunction } from 'express';
import logger from '../utils/logger';
import type { AuthenticatedRequest, User as UserType } from '../types';

// Import User model - it's a CommonJS module
const User = require('../models/User');

// Token payload interfaces
interface AccessTokenPayload extends JwtPayload {
  userId: string;
  jti: string;
  iat?: number;
}

interface RefreshTokenPayload extends JwtPayload {
  userId: string;
  jti: string;
  typ: 'refresh';
  iat?: number;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// Generate JWT tokens
// Includes per-token jti to ensure uniqueness across rapid successive logins.
export const generateTokens = (userId: string): TokenPair => {
  const isTest = process.env['NODE_ENV'] === 'test';
  const accessSecret = process.env['JWT_SECRET'] || (isTest ? 'test-secret' : undefined);
  const refreshSecret = process.env['JWT_REFRESH_SECRET'] || process.env['JWT_SECRET'] || (isTest ? 'test-refresh-secret' : undefined);

  if (!accessSecret || !refreshSecret) {
    throw new Error('JWT secrets not configured');
  }

  const accessPayload: AccessTokenPayload = { 
    userId, 
    jti: crypto.randomUUID(),
    iat: Math.floor(Date.now() / 1000)
  };
  const refreshPayload: RefreshTokenPayload = { 
    userId, 
    jti: crypto.randomUUID(), 
    typ: 'refresh',
    iat: Math.floor(Date.now() / 1000)
  };

  const accessOptions: jwt.SignOptions = {};
  if (!isTest) {
    accessOptions.expiresIn = process.env['JWT_ACCESS_EXPIRY'] || process.env['JWT_EXPIRE'] || '15m';
  }

  const refreshOptions: jwt.SignOptions = {
    expiresIn: process.env['JWT_REFRESH_EXPIRY'] || process.env['JWT_REFRESH_EXPIRE'] || '7d'
  };

  const accessToken = jwt.sign(accessPayload, accessSecret, accessOptions);
  const refreshToken = jwt.sign(refreshPayload, refreshSecret, refreshOptions);

  return { accessToken, refreshToken };
};

// Helper: parse cookies from header (no cookie-parser dependency)
const getTokenFromCookies = (req: AuthenticatedRequest): string | null => {
  try {
    const cookieHeader = req.headers?.['cookie'];
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
): Promise<void> => {
  try {
    const authHeader = req.headers?.['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    const cookieToken = getTokenFromCookies(req);
    
    const accessToken = token || cookieToken;
    
    if (!accessToken) {
      res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
      return;
    }

    const isTest = process.env['NODE_ENV'] === 'test';
    const accessSecret = process.env['JWT_SECRET'] || (isTest ? 'test-secret' : undefined);
    
    if (!accessSecret) {
      throw new Error('JWT secret not configured');
    }

    const decoded = jwt.verify(accessToken, accessSecret) as AccessTokenPayload;
    
    if (!decoded.userId) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid token payload' 
      });
      return;
    }

    // Optional: Verify user still exists and is active
    try {
      const user = await User.findById(decoded.userId).select('-password');
      if (!user || !user.isActive) {
        res.status(401).json({ 
          success: false, 
          message: 'User not found or inactive' 
        });
        return;
      }
      
      req.userId = decoded.userId;
      req.user = user as UserType;
    } catch (userError) {
      logger.error('User lookup failed during auth', { 
        userId: decoded.userId, 
        error: userError 
      });
      res.status(401).json({ 
        success: false, 
        message: 'User verification failed' 
      });
      return;
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
      return;
    }
    
    logger.error('Authentication error', { error });
    res.status(500).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};

// Middleware to require admin role
export const requireAdmin = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
      return;
    }

    // Check if user has admin role
    // Assuming User model has a role field
    if ((req.user as UserType & { role?: string }).role !== 'admin') {
      res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Admin check error', { error });
    res.status(500).json({ 
      success: false, 
      message: 'Authorization check failed' 
    });
  }
};

// Refresh token validation
export const validateRefreshToken = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    
    if (!refreshToken) {
      res.status(400).json({ 
        success: false, 
        message: 'Refresh token required' 
      });
      return;
    }

    const isTest = process.env['NODE_ENV'] === 'test';
    const refreshSecret = process.env['JWT_REFRESH_SECRET'] || process.env['JWT_SECRET'] || (isTest ? 'test-refresh-secret' : undefined);
    
    if (!refreshSecret) {
      throw new Error('JWT refresh secret not configured');
    }

    const decoded = jwt.verify(refreshToken, refreshSecret) as RefreshTokenPayload;
    
    if (!decoded.userId || decoded.typ !== 'refresh') {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid refresh token' 
      });
      return;
    }

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive) {
      res.status(401).json({ 
        success: false, 
        message: 'User not found or inactive' 
      });
      return;
    }

    req.userId = decoded.userId;
    req.user = user as UserType;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired refresh token' 
      });
      return;
    }
    
    logger.error('Refresh token validation error', { error });
    res.status(500).json({ 
      success: false, 
      message: 'Token validation failed' 
    });
  }
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (
  req: AuthenticatedRequest, 
  _res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers?.['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const cookieToken = getTokenFromCookies(req);
    
    const accessToken = token || cookieToken;
    
    if (!accessToken) {
      // No token provided, continue without authentication
      next();
      return;
    }

    const isTest = process.env['NODE_ENV'] === 'test';
    const accessSecret = process.env['JWT_SECRET'] || (isTest ? 'test-secret' : undefined);
    
    if (!accessSecret) {
      next();
      return;
    }

    const decoded = jwt.verify(accessToken, accessSecret) as AccessTokenPayload;
    
    if (decoded.userId) {
      try {
        const user = await User.findById(decoded.userId).select('-password');
        if (user && user.isActive) {
          req.userId = decoded.userId;
          req.user = user as UserType;
        }
      } catch (userError) {
        logger.warn('Optional auth user lookup failed', { 
          userId: decoded.userId, 
          error: userError 
        });
      }
    }

    next();
  } catch (error) {
    // Token is invalid, but we continue without authentication
    logger.warn('Optional auth token validation failed', { error });
    next();
  }
};

// Middleware to check specific premium features
export const requirePremiumFeature = (feature: string) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const userWithPremium = req.user as UserType & { premium?: { isActive?: boolean; features?: Record<string, boolean> } };
      const isPremiumActive = userWithPremium.premium?.isActive;
      const hasFeature = userWithPremium.premium?.features?.[feature];

      if (!isPremiumActive || !hasFeature) {
        res.status(403).json({
          success: false,
          message: `Premium feature '${feature}' required`,
          code: 'PREMIUM_FEATURE_REQUIRED',
          requiredFeature: feature
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Premium feature check error', { error, feature });
      res.status(500).json({
        success: false,
        message: 'Feature check failed'
      });
    }
  };
};

// Refresh token middleware
export const refreshAccessToken = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
      return;
    }

    // Verify refresh token with refresh secret
    const isTest = process.env['NODE_ENV'] === 'test';
    const refreshSecret = process.env['JWT_REFRESH_SECRET'] || process.env['JWT_SECRET'] || (isTest ? 'test-refresh-secret' : undefined);

    if (!refreshSecret) {
      throw new Error('JWT refresh secret not configured');
    }

    const decoded = jwt.verify(refreshToken, refreshSecret) as RefreshTokenPayload;

    if (!decoded.userId || decoded.typ !== 'refresh') {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
      return;
    }

    // Get user and check if refresh token exists
    const user = await User.findById(decoded.userId);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
      return;
    }

    // Invalidate refresh token if revoked
    if (user.tokensInvalidatedAt) {
      const iatMs = (decoded.iat || 0) * 1000;
      if (iatMs < new Date(user.tokensInvalidatedAt).getTime()) {
        res.status(401).json({
          success: false,
          message: 'Refresh token revoked',
          code: 'TOKEN_REVOKED'
        });
        return;
      }
    }

    // Generate new tokens
    const tokens = generateTokens(user._id.toString());

    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens.filter((token: string) => token !== refreshToken);
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
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
      return;
    }

    logger.error('Refresh token error', { error });
    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

export default {
  generateTokens,
  authenticateToken,
  requireAdmin,
  requirePremiumFeature,
  validateRefreshToken,
  refreshAccessToken,
  optionalAuth,
};
