/**
 * Admin Permissions Hook for Web
 * Provides type-safe admin role checking and permission validation
 * Matches mobile version implementation
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import type { AdminRole, Permission } from '../../../../packages/api/src/types/admin';
import { ROLE_PERMISSIONS } from '../../../../packages/api/src/types/admin';

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
 * Web admin roles that grant admin access
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
  const authStore = useAuthStore();
  const user = authStore.user;
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<AdminRole | null>(null);

  useEffect(() => {
    if (authStore.isLoading) {
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
  }, [user, authStore.isLoading]);

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
      const [resource] = permission.split(':');
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

interface PermissionGuardProps {
  permission: Permission | Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Permission Guard Component
 * Renders children only if user has required permissions
 */
export function PermissionGuard({ permission, requireAll = false, fallback = null, children }: PermissionGuardProps): React.JSX.Element {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAdminPermissions();
  const permissions = Array.isArray(permission) ? permission : [permission];
  let hasAccess = false;
  
  if (permissions.length === 1) {
    hasAccess = hasPermission(permissions[0]!);
  }
  else if (requireAll) {
    hasAccess = hasAllPermissions(permissions);
  }
  else {
    hasAccess = hasAnyPermission(permissions);
  }
  
  if (!hasAccess) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}

interface RoleGuardProps {
  role: AdminRole | AdminRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Role Guard Component
 * Renders children only if user has required role
 */
export function RoleGuard({ role, fallback = null, children }: RoleGuardProps): React.JSX.Element {
  const { isRole } = useAdminPermissions();
  if (!isRole(role)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
