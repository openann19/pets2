/**
 * Authentication Bridge
 * Connects @pawfectmatch/core auth store with admin package
 */

import { useEffect } from 'react';
import { useAuthStore } from '@pawfectmatch/core';
import type { AdminUser, AdminPermission } from '../types';
import { useAdminStore } from './store';

/**
 * Admin roles (simplified - should match backend)
 */
type AdminRole = 'superadmin' | 'support' | 'moderator' | 'finance' | 'analyst';

/**
 * Permissions (simplified - should match backend)
 */
type Permission = 
  | 'users:read' | 'users:write' | 'users:delete'
  | 'chats:read' | 'chats:moderate' | 'chats:export'
  | 'billing:read' | 'billing:write' | 'billing:refund'
  | 'analytics:read' | 'analytics:export'
  | 'flags:read' | 'flags:write'
  | 'health:read'
  | 'settings:read' | 'settings:write'
  | 'audit:read'
  | 'impersonate';

/**
 * Role permissions map (simplified)
 */
const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  superadmin: ['users:read', 'users:write', 'users:delete', 'chats:read', 'chats:moderate', 'chats:export', 'billing:read', 'billing:write', 'billing:refund', 'analytics:read', 'analytics:export', 'flags:read', 'flags:write', 'health:read', 'settings:read', 'settings:write', 'audit:read', 'impersonate'],
  support: ['users:read', 'chats:read', 'billing:read', 'analytics:read', 'audit:read'],
  moderator: ['users:read', 'users:write', 'chats:read', 'chats:moderate', 'chats:export', 'flags:read', 'audit:read'],
  finance: ['users:read', 'billing:read', 'billing:write', 'billing:refund', 'analytics:read', 'analytics:export', 'audit:read'],
  analyst: ['users:read', 'chats:read', 'analytics:read', 'analytics:export', 'flags:read', 'health:read', 'audit:read'],
};

/**
 * Mobile admin roles that grant admin access
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
function isAdminRole(role: string | undefined | null): boolean {
  if (!role) return false;
  return ADMIN_ROLES.includes(role.toLowerCase());
}

/**
 * Convert string role to AdminRole type if valid
 */
function toAdminRole(role: string | undefined | null): AdminRole | null {
  if (!role) return null;
  const normalized = role.toLowerCase();
  
  const roleMap: Partial<Record<string, AdminRole>> = {
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
 * Map User from @pawfectmatch/core to AdminUser format
 */
function mapUserToAdminUser(user: { _id: string; email: string; firstName: string; lastName: string; role?: string; status?: string; isEmailVerified?: boolean; createdAt?: string | Date } | null): AdminUser | null {
  if (!user) return null;

  const adminRole = toAdminRole(user.role);
  if (!adminRole) return null;

  // Map permissions based on role
  const rolePermissions = ROLE_PERMISSIONS[adminRole] || [];
  const permissions: AdminPermission[] = rolePermissions.map(perm => ({
    resource: perm.split(':')[0] || '*',
    actions: [perm.split(':')[1] || '*'],
  }));

  // Map status
  let status: 'active' | 'suspended' | 'banned' = 'active';
  if (user.status) {
    const userStatus = user.status.toLowerCase();
    if (userStatus === 'suspended' || userStatus === 'suspend') {
      status = 'suspended';
    } else if (userStatus === 'banned' || userStatus === 'ban') {
      status = 'banned';
    }
  }

  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role === 'superadmin' || user.role === 'administrator' || user.role === 'admin' ? 'admin' : (user.role === 'moderator' ? 'moderator' : 'user'),
    status,
    isVerified: user.isEmailVerified ?? false,
    createdAt: typeof user.createdAt === 'string' ? user.createdAt : (user.createdAt ? user.createdAt.toISOString() : new Date().toISOString()),
    permissions,
  };
}

/**
 * Hook to sync auth store with admin store
 * This should be called at the app root level
 */
export function useAdminAuthSync() {
  const { user, isAuthenticated } = useAuthStore();
  const { setCurrentAdmin } = useAdminStore();

  useEffect(() => {
    if (isAuthenticated && user && isAdminRole(user.role)) {
      const adminUser = mapUserToAdminUser(user);
      setCurrentAdmin(adminUser);
    } else {
      setCurrentAdmin(null);
    }
  }, [user, isAuthenticated, setCurrentAdmin]);
}

/**
 * Check if current user has admin permissions
 */
export function useIsAdmin(): boolean {
  const { user } = useAuthStore();
  return user !== null && isAdminRole(user.role ?? undefined);
}

