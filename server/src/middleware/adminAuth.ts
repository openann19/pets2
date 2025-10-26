/**
 * Admin Authentication Middleware
 * Ensures only authenticated admin users can access admin routes
 */

import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import logger from '../utils/logger';
import type { AuthRequest } from '../types/express';

/**
 * Admin roles that have admin access
 */
const ADMIN_ROLES = ['administrator', 'moderator', 'support', 'analyst', 'billing_admin'] as const;

/**
 * Type for admin role
 */
type AdminRole = typeof ADMIN_ROLES[number];

/**
 * JWT payload structure
 */
interface JWTPayload {
  userId: string;
}

/**
 * Verify JWT token and attach user to request
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No authentication token provided'
      });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

    if (!decoded || !decoded.userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid authentication token'
      });
      return;
    }

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not found'
      });
      return;
    }

    // Check if user account is active
    if (user.status === 'banned' || user.status === 'suspended') {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Account is not active'
      });
      return;
    }

    // Attach user to request
    (req as AuthRequest).user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid authentication token'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication token has expired'
      });
      return;
    }

    logger.error('Authentication error', { error });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to authenticate'
    });
  }
};

/**
 * Ensure user has an admin role
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    
    if (!authReq.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      return;
    }

    if (!ADMIN_ROLES.includes(authReq.user.role as AdminRole)) {
      // Log unauthorized admin access attempt
      // Dynamic import to avoid circular dependency
      const { logAdminActivity } = await import('./adminLogger');
      await logAdminActivity(
        req,
        'UNAUTHORIZED_ADMIN_ACCESS',
        { userRole: authReq.user.role },
        false,
        'User attempted to access admin panel without admin role'
      );

      res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Admin access required'
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Admin authorization error', { error });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to verify admin access'
    });
  }
};

/**
 * Require specific admin role(s)
 */
export const requireRole = (allowedRoles: string | string[]) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      
      if (!authReq.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      if (!roles.includes(authReq.user.role)) {
        const { logAdminActivity } = await import('./adminLogger');
        await logAdminActivity(
          req,
          'UNAUTHORIZED_ROLE_ACCESS',
          { userRole: authReq.user.role, requiredRoles: roles },
          false,
          `User role ${authReq.user.role} not in allowed roles: ${roles.join(', ')}`
        );

        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Insufficient role permissions',
          requiredRoles: roles
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Role authorization error', { error });
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to verify role'
      });
    }
  };
};

/**
 * Optional authentication - attaches user if token is present, but doesn't require it
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      next();
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!process.env.JWT_SECRET) {
      next();
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

    if (decoded && decoded.userId) {
      const user = await User.findById(decoded.userId).select('+role');
      if (user && user.status === 'active') {
        (req as AuthRequest).user = user;
      }
    }

    next();
  } catch {
    // Ignore errors for optional auth
    next();
  }
};
