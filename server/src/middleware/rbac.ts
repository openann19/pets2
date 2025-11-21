/**
 * Role-Based Access Control (RBAC) Middleware
 * Implements fine-grained permission system for admin panel
 */

const logger = require('../utils/logger');

const permissions = {
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
 * @param {string} userRole - The user's role
 * @param {string} requiredPermission - The permission to check (format: "resource:action")
 * @returns {boolean} - True if user has permission
 */
const hasPermission = (userRole, requiredPermission) => {
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
 * @param {string} requiredPermission - The permission required (format: "resource:action")
 * @returns {Function} - Express middleware function
 */
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
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
        const { logAdminActivity } = require('./adminLogger');
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
    } catch (error) {
      logger.error('Permission check error', { error });
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
 * @param {string[]} requiredPermissions - Array of permissions (user needs at least one)
 * @returns {Function} - Express middleware function
 */
const checkAnyPermission = (requiredPermissions) => {
  return async (req, res, next) => {
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
        const { logAdminActivity } = require('./adminLogger');
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
    } catch (error) {
      logger.error('Permission check error', { error });
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
 * @param {string[]} requiredPermissions - Array of permissions (user needs all)
 * @returns {Function} - Express middleware function
 */
const checkAllPermissions = (requiredPermissions) => {
  return async (req, res, next) => {
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
        const { logAdminActivity } = require('./adminLogger');
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
    } catch (error) {
      logger.error('Permission check error', { error });
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
 * @param {string} role - The role to get permissions for
 * @returns {string[]} - Array of permissions
 */
const getRolePermissions = (role) => {
  return permissions[role] || [];
};

/**
 * Get all available roles
 * @returns {string[]} - Array of role names
 */
const getAllRoles = () => {
  return Object.keys(permissions);
};

module.exports = {
  permissions,
  hasPermission,
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  getRolePermissions,
  getAllRoles
};
