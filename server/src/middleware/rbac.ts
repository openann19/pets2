/**
 * Role-Based Access Control (RBAC) Middleware
 * Implements fine-grained permission system for admin panel
 */

import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/express';
import logger from '../utils/logger';

/**
 * Permissions mapping for different roles
 */
export const permissions: Record<string, string[]> = {
  administrator: ['*'], // Full access to everything
  moderator: [
    'users:read', 'users:suspend', 'users:activate', 'users:ban',
    'chats:read', 'chats:block', 'chats:unblock', 'chats:delete_message',
    'uploads:read', 'uploads:approve', 'uploads:reject', 'uploads:delete',
    'verifications:read', 'verifications:approve', 'verifications:reject',
    'analytics:read',
    'reports:read',
    'security:read'
  ],
  support: [
    'users:read',
    'chats:read',
    'uploads:read',
    'verifications:read',
    'analytics:read'
  ],
  analyst: [
    'analytics:read', 'analytics:export',
    'reports:read', 'reports:create', 'reports:export',
    'users:read',
    'chats:read'
  ],
  billing_admin: [
    'billing:read', 'billing:manage',
    'stripe:read', 'stripe:configure',
    'subscriptions:read', 'subscriptions:manage',
    'analytics:read',
    'users:read'
  ]
};

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (userRole: string, requiredPermission: string): boolean => {
  const userPermissions = permissions[userRole] || [];

  // Administrator has all permissions
  if (userPermissions.includes('*')) {
    return true;
  }

  // Check exact permission match
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // Check wildcard permissions (e.g., 'users:*' matches 'users:read', 'users:write', etc.)
  const [resource] = requiredPermission.split(':');
  if (userPermissions.includes(`${resource}:*`)) {
    return true;
  }

  return false;
};

/**
 * Middleware to check if user has required permission
 */
export const checkPermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthRequest;
      
      // Ensure user is authenticated
      if (!authReq.user) {
        res.status(401).json({ 
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required' 
        });
        return;
      }

      const userRole = authReq.user.role;

      // Check if user has the required permission
      if (!hasPermission(userRole, requiredPermission)) {
        // Log unauthorized access attempt
        const { logAdminActivity } = await import('./adminLogger');
        await logAdminActivity(
          req, 
          'UNAUTHORIZED_ACCESS_ATTEMPT', 
          { requiredPermission, userRole },
          false,
          `User lacks permission: ${requiredPermission}`
        );

        res.status(403).json({ 
          success: false,
          error: 'Forbidden',
          message: 'Insufficient permissions to perform this action',
          requiredPermission
        });
        return;
      }

      // User has permission, proceed
      next();
    } catch (error) {
      logger.error('Permission check error', { error });
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: 'Failed to verify permissions' 
      });
    }
  };
};

/**
 * Middleware to check if user has ANY of the specified permissions
 */
export const checkAnyPermission = (requiredPermissions: string[]) => {
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

      const userRole = authReq.user.role;
      const hasAnyPermission = requiredPermissions.some(permission => 
        hasPermission(userRole, permission)
      );

      if (!hasAnyPermission) {
        const { logAdminActivity } = await import('./adminLogger');
        await logAdminActivity(
          req, 
          'UNAUTHORIZED_ACCESS_ATTEMPT', 
          { requiredPermissions, userRole },
          false,
          'User lacks any of the required permissions'
        );

        res.status(403).json({ 
          success: false,
          error: 'Forbidden',
          message: 'Insufficient permissions to perform this action',
          requiredPermissions
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Permission check error', { error });
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: 'Failed to verify permissions' 
      });
    }
  };
};

/**
 * Middleware to check if user has ALL of the specified permissions
 */
export const checkAllPermissions = (requiredPermissions: string[]) => {
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

      const userRole = authReq.user.role;
      const hasAllPermissions = requiredPermissions.every(permission => 
        hasPermission(userRole, permission)
      );

      if (!hasAllPermissions) {
        const { logAdminActivity } = await import('./adminLogger');
        await logAdminActivity(
          req, 
          'UNAUTHORIZED_ACCESS_ATTEMPT', 
          { requiredPermissions, userRole },
          false,
          'User lacks all required permissions'
        );

        res.status(403).json({ 
          success: false,
          error: 'Forbidden',
          message: 'Insufficient permissions to perform this action',
          requiredPermissions
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Permission check error', { error });
      res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: 'Failed to verify permissions' 
      });
    }
  };
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role: string): string[] => {
  return permissions[role] || [];
};

/**
 * Get all available roles
 */
export const getAllRoles = (): string[] => {
  return Object.keys(permissions);
};
