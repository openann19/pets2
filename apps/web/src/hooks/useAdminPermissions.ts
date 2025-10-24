/**
 * Admin Permissions Hook
 * Provides permission checking for frontend admin components
 */

import { useState, useEffect, useCallback } from 'react'
import { logger } from '@pawfectmatch/core';
;

// Permission definitions by role
const permissions = {
  administrator: ['*'], // Full access
  moderator: [
    'users:read',
    'users:suspend',
    'users:activate',
    'users:ban',
    'chats:read',
    'chats:block',
    'chats:unblock',
    'chats:delete_message',
    'uploads:read',
    'uploads:approve',
    'uploads:reject',
    'uploads:delete',
    'verifications:read',
    'verifications:approve',
    'verifications:reject',
    'analytics:read',
    'reports:read',
    'security:read',
  ],
  support: ['users:read', 'chats:read', 'uploads:read', 'verifications:read', 'analytics:read'],
  analyst: [
    'analytics:read',
    'analytics:export',
    'reports:read',
    'reports:create',
    'reports:export',
    'users:read',
    'chats:read',
  ],
  billing_admin: [
    'billing:read',
    'billing:manage',
    'stripe:read',
    'stripe:configure',
    'subscriptions:read',
    'subscriptions:manage',
    'analytics:read',
    'users:read',
  ],
  premium: [],
  user: [],
};

export function useAdminPermissions() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('auth-token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      // Fetch user profile with role
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);

        const adminRoles = ['administrator', 'moderator', 'support', 'analyst', 'billing_admin'];
        setIsAdmin(adminRoles.includes(data.user.role));
      }
    } catch (error) {
      logger.error('Failed to load user:', { error });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false;

      const userPermissions = permissions[user.role] || [];

      // Administrator has all permissions
      if (userPermissions.includes('*')) {
        return true;
      }

      // Check exact permission match
      if (userPermissions.includes(permission)) {
        return true;
      }

      // Check wildcard permissions (e.g., 'users:*' matches 'users:read', 'users:write', etc.)
      const [resource, action] = permission.split(':');
      if (userPermissions.includes(`${resource}:*`)) {
        return true;
      }

      return false;
    },
    [user],
  );

  /**
   * Check if user has ANY of the specified permissions
   */
  const hasAnyPermission = useCallback(
    (permissionList) => {
      return permissionList.some((permission) => hasPermission(permission));
    },
    [hasPermission],
  );

  /**
   * Check if user has ALL of the specified permissions
   */
  const hasAllPermissions = useCallback(
    (permissionList) => {
      return permissionList.every((permission) => hasPermission(permission));
    },
    [hasPermission],
  );

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback(
    (role) => {
      if (!user) return false;

      const roles = Array.isArray(role) ? role : [role];
      return roles.includes(user.role);
    },
    [user],
  );

  /**
   * Get all permissions for current user
   */
  const getUserPermissions = useCallback(() => {
    if (!user) return [];
    return permissions[user.role] || [];
  }, [user]);

  return {
    user,
    isLoading,
    isAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    getUserPermissions,
  };
}

/**
 * Permission-based component wrapper
 */
export function PermissionGuard({ permission, requireAll = false, fallback = null, children }) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAdminPermissions();

  const permissions = Array.isArray(permission) ? permission : [permission];

  let hasAccess = false;
  if (permissions.length === 1) {
    hasAccess = hasPermission(permissions[0]);
  } else if (requireAll) {
    hasAccess = hasAllPermissions(permissions);
  } else {
    hasAccess = hasAnyPermission(permissions);
  }

  if (!hasAccess) {
    return fallback || null;
  }

  return children;
}

/**
 * Role-based component wrapper
 */
export function RoleGuard({ role, fallback = null, children }) {
  const { hasRole } = useAdminPermissions();

  if (!hasRole(role)) {
    return fallback || null;
  }

  return children;
}
