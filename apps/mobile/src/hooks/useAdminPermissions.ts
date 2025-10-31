/**
 * Admin Permissions Hook for Mobile
 * Provides type-safe admin role checking and permission validation
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@pawfectmatch/core';
import type { AdminRole, Permission } from '../../../packages/api/src/types/admin';
import { ROLE_PERMISSIONS } from '../../../packages/api/src/types/admin';

interface UseAdminPermissionsReturn {
  isLoading: boolean;
  isAdmin: boolean;
  userRole: AdminRole | null;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  isRole: (role: AdminRole | AdminRole[]) => boolean;
}

/**
 * Mobile admin roles that grant admin access
 * These should match the backend admin roles
 */
const ADMIN_ROLES: string[] = [
  'administrator',
  'admin',
  'superadmin',
  'moderator',
  'support',
  'analyst',
  'billing_admin',
  'finance',
];

/**
 * Check if a user role string is an admin role
 */
function isAdminRole(role: string | undefined | null): role is AdminRole {
  if (!role) return false;
  return ADMIN_ROLES.includes(role.toLowerCase());
}

/**
 * Convert string role to AdminRole type if valid
 */
function toAdminRole(role: string | undefined | null): AdminRole | null {
  if (!role) return null;
  const normalized = role.toLowerCase();
  
  // Map string roles to AdminRole enum values
  const roleMap: Record<string, AdminRole> = {
    'administrator': 'superadmin',
    'admin': 'superadmin',
    'superadmin': 'superadmin',
    'moderator': 'moderator',
    'support': 'support',
    'analyst': 'analyst',
    'billing_admin': 'finance',
    'finance': 'finance',
  };
  
  const mappedRole = roleMap[normalized];
  return mappedRole || null;
}

/**
 * Hook to check admin permissions and roles
 */
export function useAdminPermissions(): UseAdminPermissionsReturn {
  const { user, isLoading: authLoading } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<AdminRole | null>(null);

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (!user || !user.role) {
      setIsAdmin(false);
      setUserRole(null);
      setIsLoading(false);
      return;
    }

    const admin = isAdminRole(user.role);
    const role = toAdminRole(user.role);
    
    setIsAdmin(admin);
    setUserRole(role);
    setIsLoading(false);
  }, [user, authLoading]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!userRole) return false;

      const userPermissions = ROLE_PERMISSIONS[userRole] || [];

      // Superadmin has all permissions
      if (userRole === 'superadmin') {
        return true;
      }

      // Check exact permission match
      if (userPermissions.includes(permission)) {
        return true;
      }

      // Check wildcard permissions (e.g., 'users:*' matches 'users:read', 'users:write', etc.)
      const [resource, action] = permission.split(':');
      if (userPermissions.includes(`${resource}:*` as Permission)) {
        return true;
      }

      return false;
    },
    [userRole],
  );

  /**
   * Check if user has ANY of the specified permissions
   */
  const hasAnyPermission = useCallback(
    (permissions: Permission[]): boolean => {
      return permissions.some((permission) => hasPermission(permission));
    },
    [hasPermission],
  );

  /**
   * Check if user has ALL of the specified permissions
   */
  const hasAllPermissions = useCallback(
    (permissions: Permission[]): boolean => {
      return permissions.every((permission) => hasPermission(permission));
    },
    [hasPermission],
  );

  /**
   * Check if user has a specific role
   */
  const isRole = useCallback(
    (role: AdminRole | AdminRole[]): boolean => {
      if (!userRole) return false;
      const roles = Array.isArray(role) ? role : [role];
      return roles.includes(userRole);
    },
    [userRole],
  );

  return {
    isLoading,
    isAdmin,
    userRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRole,
  };
}

