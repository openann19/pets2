import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import logger from '../utils/logger';
import type { AuthRequest } from '../types/express';

/**
 * JWT token pair
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * JWT payload structure
 */
interface JWTPayload {
  userId: string;
  jti: string;
  iat?: number;
  typ?: 'refresh';
}

/**
 * Cookie header parser result
 */
interface CookieMap {
  [key: string]: string;
}

/**
 * Generate JWT token pair with unique jti per token
 * Ensures uniqueness across rapid successive logins
 */
export const generateTokens = (userId: string): TokenPair => {
  const isTest = process.env.NODE_ENV === 'test';
  const accessSecret = process.env.JWT_SECRET || (isTest ? 'test-secret' : undefined);
  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || (isTest ? 'test-refresh-secret' : undefined);

  const accessPayload: JWTPayload = { userId, jti: randomUUID() };
  const refreshPayload: JWTPayload = { userId, jti: randomUUID(), typ: 'refresh' };

  const accessOptions: jwt.SignOptions = {};
  if (!isTest && accessSecret) {
    accessOptions.expiresIn = process.env.JWT_ACCESS_EXPIRY || process.env.JWT_EXPIRE || '15m';
  }

  const refreshOptions: jwt.SignOptions = {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || process.env.JWT_REFRESH_EXPIRE || '7d'
  };

  if (!accessSecret || !refreshSecret) {
    throw new Error('JWT secrets not configured');
  }

  const accessToken = jwt.sign(accessPayload, accessSecret, accessOptions);
  const refreshToken = jwt.sign(refreshPayload, refreshSecret, refreshOptions);

  return { accessToken, refreshToken };
};

/**
 * Parse cookies from header (no cookie-parser dependency)
 */
const getTokenFromCookies = (req: Request): string | null => {
  try {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;
    
    const map: CookieMap = Object.create(null);
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

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    // Verify token
    const isTest = process.env.NODE_ENV === 'test';
    const accessSecret = process.env.JWT_SECRET || (isTest ? 'test-secret' : undefined);
    
    if (!accessSecret) {
      throw new Error('JWT secret not configured');
    }

    const decoded = jwt.verify(token, accessSecret) as JWTPayload;

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

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

    // Token invalidation check (logout-all / change-password)
    if (user.tokensInvalidatedAt) {
      const iatMs = (decoded.iat || 0) * 1000;
      if (iatMs < new Date(user.tokensInvalidatedAt).getTime()) {
        res.status(401).json({ success: false, message: 'Token revoked', code: 'TOKEN_REVOKED' });
        return;
      }
    }

    // Per-session revocation by jti
    if (Array.isArray(user.revokedJtis) && decoded.jti && user.revokedJtis.includes(decoded.jti)) {
      logger.debug('Token revoked by jti:', { jti: decoded.jti });
      res.status(401).json({ success: false, message: 'Token revoked', code: 'TOKEN_REVOKED' });
      return;
    }

    // Add user and token info to request object
    (req as AuthRequest).user = user;
    (req as AuthRequest).userId = String(user._id);
    (req as AuthRequest).jti = decoded.jti; // Store jti for logout revocation

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'TokenExpiredError',
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
      return;
    }

    logger.error('Auth middleware error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Middleware to check if user is premium
 */
export const requirePremium = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authReq = req as AuthRequest;
  
  if (!authReq.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  if (!authReq.user.premium.isActive ||
    (authReq.user.premium.expiresAt && authReq.user.premium.expiresAt < new Date())) {
    res.status(403).json({
      success: false,
      message: 'Premium subscription required',
      code: 'PREMIUM_REQUIRED'
    });
    return;
  }
  
  next();
};

/**
 * Middleware to check specific premium features
 */
export const requirePremiumFeature = (feature: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;
    
    if (!authReq.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!authReq.user.premium.isActive ||
      !authReq.user.premium.features[feature as keyof typeof authReq.user.premium.features]) {
      res.status(403).json({
        success: false,
        message: `Premium feature '${feature}' required`,
        code: 'PREMIUM_FEATURE_REQUIRED',
        requiredFeature: feature
      });
      return;
    }
    
    next();
  };
};

/**
 * Middleware for admin-only routes
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authReq = req as AuthRequest;
  
  if (!authReq.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  if (authReq.user.role !== 'administrator') {
    res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
    return;
  }
  
  next();
};

/**
 * Refresh token middleware
 */
export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
      return;
    }

    // Verify refresh token with refresh secret
    const isTest = process.env.NODE_ENV === 'test';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || (isTest ? 'test-refresh-secret' : undefined);
    
    if (!refreshSecret) {
      throw new Error('JWT refresh secret not configured');
    }

    const decoded = jwt.verify(refreshToken, refreshSecret) as JWTPayload;

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
        res.status(401).json({ success: false, message: 'Refresh token revoked', code: 'TOKEN_REVOKED' });
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
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
      return;
    }

    logger.error('Refresh token error:', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

/**
 * Optional authentication (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: Request,
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
      const accessSecret = process.env.JWT_SECRET || (isTest ? 'test-secret' : undefined);
      
      if (accessSecret) {
        const decoded = jwt.verify(token, accessSecret) as JWTPayload;
        const user = await User.findById(decoded.userId).select('-password -refreshTokens');

        if (user && user.isActive && !user.isBlocked) {
          // Check if token is invalidated
          let isInvalid = false;
          
          if (user.tokensInvalidatedAt) {
            const iatMs = (decoded.iat || 0) * 1000;
            if (iatMs < new Date(user.tokensInvalidatedAt).getTime()) {
              isInvalid = true;
            }
          }
          
          if (!isInvalid && Array.isArray(user.revokedJtis) && decoded.jti && user.revokedJtis.includes(decoded.jti)) {
            isInvalid = true;
          }

          if (!isInvalid) {
            (req as AuthRequest).user = user;
            (req as AuthRequest).userId = String(user._id);
          }
        }
      }
    }

    next();
  } catch {
    // Silently continue without authentication
    next();
  }
};
