/**
 * Admin Authentication Middleware
 * Ensures only authenticated admin users can access admin routes
 */

import * as jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import type { IUserDocument } from '../types/mongoose';
import logger from '../utils/logger';

/**
 * Verify JWT token and attach user to request
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No authentication token provided'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & { userId: string };

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid authentication token'
      });
    }

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'User not found'
      });
    }

    // Check if user account is active
    if (user.status === 'banned' || user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Account is not active'
      });
    }

    // Attach user to request with type assertion at boundary point
    req.userId = decoded.userId;
    req.user = user as IUserDocument;
    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid authentication token'
      });
    }

    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication token has expired'
      });
    }

    logger.error('Authentication error', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to authenticate'
    });
  }
};

/**
 * Ensure user has an admin role
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    // Define admin roles
    const adminRoles = ['administrator', 'moderator', 'support', 'analyst', 'billing_admin'];

    if (!adminRoles.includes(req.user.role)) {
      // Log unauthorized admin access attempt
      const { logAdminActivity } = await import('./adminLogger');
      await logAdminActivity(
        req,
        'UNAUTHORIZED_ADMIN_ACCESS',
        { userRole: req.user.role },
        false,
        'User attempted to access admin panel without admin role'
      );

      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    logger.error('Admin authorization error', { error });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to verify admin access'
    });
  }
};

/**
 * Require specific admin role(s)
 * @param allowedRoles - Single role or array of allowed roles
 */
export const requireRole = (allowedRoles: string | string[]) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      if (!roles.includes(req.user.role)) {
        const { logAdminActivity } = await import('./adminLogger');
        await logAdminActivity(
          req,
          'UNAUTHORIZED_ROLE_ACCESS',
          { userRole: req.user.role, requiredRoles: roles },
          false,
          `User role ${req.user.role} not in allowed roles: ${roles.join(', ')}`
        );

        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Insufficient role permissions',
          requiredRoles: roles
        });
      }

      next();
    } catch (error) {
      logger.error('Role authorization error', { error });
      return res.status(500).json({
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
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      return next();
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & { userId?: string };

    if (decoded && decoded.userId) {
      const user = await User.findById(decoded.userId).select('+role');
      if (user && user.status === 'active') {
        req.user = user as IUserDocument;
        req.userId = decoded.userId;
      }
    }

    next();
  } catch {
    // Ignore errors for optional auth
    next();
  }
};

