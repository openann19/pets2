/**
 * Role-Based Access Control (RBAC) Middleware
 * Implements fine-grained permission system for admin panel
 */

import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/express';
import logger from '../utils/logger';
import { getErrorMessage } from '../../utils/errorHandler';

export interface Permissions {
  [role: string]: string[];
}

export const permissions: Permissions = {
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
 * @param userRole - The user's role
 * @param requiredPermission - The permission to check (format: "resource:action")
 * @returns True if user has permission
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
 * @param requiredPermission - The permission required (format: "resource:action")
 * @returns Express middleware function
 */
export const checkPermission = (requiredPermission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required' 
        });
      }

      const userRole = req.user.role;

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

        return res.status(403).json({ 
          success: false,
          error: 'Forbidden',
          message: 'Insufficient permissions to perform this action',
          requiredPermission
        });
      }

      // User has permission, proceed
      next();
    } catch (error: unknown) {
      logger.error('Permission check error', { error: getErrorMessage(error) });
      return res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: 'Failed to verify permissions' 
      });
    }
  };
};

/**
 * Middleware to check if user has ANY of the specified permissions
 * @param requiredPermissions - Array of permissions (user needs at least one)
 * @returns Express middleware function
 */
export const checkAnyPermission = (requiredPermissions: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required' 
        });
      }

      const userRole = req.user.role;
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
          `User lacks any of the required permissions`
        );

        return res.status(403).json({ 
          success: false,
          error: 'Forbidden',
          message: 'Insufficient permissions to perform this action',
          requiredPermissions
        });
      }

      next();
    } catch (error: unknown) {
      logger.error('Permission check error', { error: getErrorMessage(error) });
      return res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: 'Failed to verify permissions' 
      });
    }
  };
};

/**
 * Middleware to check if user has ALL of the specified permissions
 * @param requiredPermissions - Array of permissions (user needs all)
 * @returns Express middleware function
 */
export const checkAllPermissions = (requiredPermissions: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required' 
        });
      }

      const userRole = req.user.role;
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
          `User lacks all required permissions`
        );

        return res.status(403).json({ 
          success: false,
          error: 'Forbidden',
          message: 'Insufficient permissions to perform this action',
          requiredPermissions
        });
      }

      next();
    } catch (error: unknown) {
      logger.error('Permission check error', { error: getErrorMessage(error) });
      return res.status(500).json({ 
        success: false,
        error: 'Internal server error',
        message: 'Failed to verify permissions' 
      });
    }
  };
};

/**
 * Get all permissions for a role
 * @param role - The role to get permissions for
 * @returns Array of permissions
 */
export const getRolePermissions = (role: string): string[] => {
  return permissions[role] || [];
};

/**
 * Get all available roles
 * @returns Array of role names
 */
export const getAllRoles = (): string[] => {
  return Object.keys(permissions);
};

