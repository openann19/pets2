import { useEffect, useState } from 'react';
import { useAuthStore } from '@pawfectmatch/core';
import { useAdminStore } from './store';
import { getAdminAPI } from '../services/api';
import type { AdminFilter } from '../types';

export const useAdminStats = () => {
  const { stats, loading, errors, updateStats, setLoading, setError } = useAdminStore();

  const fetchStats = async () => {
    try {
      setLoading('stats', true);
      setError('stats', null);
      const response = await getAdminAPI().getStats();
      updateStats(response.data);
    } catch (err) {
      setError('stats', err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading('stats', false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading: loading.stats,
    error: errors.stats,
    refetch: fetchStats,
  };
};

export const useAdminUsers = (filters: AdminFilter = {}) => {
  const { users, loading, errors, updateUsers, setLoading, setError, setFilter } = useAdminStore();

  const fetchUsers = async (overrideFilters?: AdminFilter) => {
    try {
      setLoading('users', true);
      setError('users', null);
      const activeFilters = overrideFilters || filters;
      const response = await getAdminAPI().getUsers(activeFilters);
      updateUsers(response.data);
      setFilter('users', activeFilters as Record<string, unknown>);
    } catch (err) {
      setError('users', err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading('users', false);
    }
  };

  useEffect(() => {
    fetchUsers(filters);
  }, [JSON.stringify(filters)]);

  return {
    users,
    loading: loading.users,
    error: errors.users,
    refetch: fetchUsers,
  };
};

export const useAdminChats = (filters: AdminFilter = {}) => {
  const { chats, loading, errors, updateChats, setLoading, setError } = useAdminStore();

  const fetchChats = async (overrideFilters?: AdminFilter) => {
    try {
      setLoading('chats', true);
      setError('chats', null);
      const activeFilters = overrideFilters || filters;
      const response = await getAdminAPI().getChats(activeFilters);
      updateChats(response.data);
    } catch (err) {
      setError('chats', err instanceof Error ? err.message : 'Failed to fetch chats');
    } finally {
      setLoading('chats', false);
    }
  };

  useEffect(() => {
    fetchChats(filters);
  }, [JSON.stringify(filters)]);

  return {
    chats,
    loading: loading.chats,
    error: errors.chats,
    refetch: fetchChats,
  };
};

export const useAdminUploads = (filters: AdminFilter = {}) => {
  const { uploads, loading, errors, updateUploads, setLoading, setError } = useAdminStore();

  const fetchUploads = async (overrideFilters?: AdminFilter) => {
    try {
      setLoading('uploads', true);
      setError('uploads', null);
      const activeFilters = overrideFilters || filters;
      const response = await getAdminAPI().getUploads(activeFilters);
      updateUploads(response.data);
    } catch (err) {
      setError('uploads', err instanceof Error ? err.message : 'Failed to fetch uploads');
    } finally {
      setLoading('uploads', false);
    }
  };

  useEffect(() => {
    fetchUploads(filters);
  }, [JSON.stringify(filters)]);

  return {
    uploads,
    loading: loading.uploads,
    error: errors.uploads,
    refetch: fetchUploads,
  };
};

export const useAdminAnalytics = (filters: AdminFilter = {}) => {
  const { analytics, loading, errors, updateAnalytics, setLoading, setError } = useAdminStore();

  const fetchAnalytics = async (overrideFilters?: AdminFilter) => {
    try {
      setLoading('analytics', true);
      setError('analytics', null);
      const activeFilters = overrideFilters || filters;
      const response = await getAdminAPI().getAnalytics(activeFilters);
      updateAnalytics(response.data);
    } catch (err) {
      setError('analytics', err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading('analytics', false);
    }
  };

  useEffect(() => {
    fetchAnalytics(filters);
  }, [JSON.stringify(filters)]);

  return {
    analytics,
    loading: loading.analytics,
    error: errors.analytics,
    refetch: fetchAnalytics,
  };
};

export const useAdminSecurity = (filters: AdminFilter = {}) => {
  const { securityAlerts, loading, errors, updateSecurityAlerts, setLoading, setError } = useAdminStore();

  const fetchSecurityAlerts = async (overrideFilters?: AdminFilter) => {
    try {
      setLoading('security', true);
      setError('security', null);
      const activeFilters = overrideFilters || filters;
      const response = await getAdminAPI().getSecurityAlerts(activeFilters);
      updateSecurityAlerts(response.data);
    } catch (err) {
      setError('security', err instanceof Error ? err.message : 'Failed to fetch security alerts');
    } finally {
      setLoading('security', false);
    }
  };

  useEffect(() => {
    fetchSecurityAlerts(filters);
  }, [JSON.stringify(filters)]);

  return {
    securityAlerts,
    loading: loading.security,
    error: errors.security,
    refetch: fetchSecurityAlerts,
  };
};

// Export auth bridge utilities
export { useAdminAuthSync, useIsAdmin } from './authBridge';

// Admin permissions and authentication hook
// Integrated with @pawfectmatch/core auth store via authBridge
export const useAdminAuth = () => {
  const { currentAdmin, setCurrentAdmin } = useAdminStore();
  const { user, logout: authLogout, isLoading: authLoading, isAuthenticated: authIsAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // Sync admin state from auth store
  useEffect(() => {
    setIsLoading(authLoading);
    
    // Import sync logic inline to avoid circular dependency
    if (authIsAuthenticated && user && user.role) {
      const ADMIN_ROLES = ['administrator', 'admin', 'superadmin', 'moderator', 'support', 'analyst', 'billing_admin', 'finance'];
      const isAdmin = ADMIN_ROLES.includes(user.role.toLowerCase());
      
      if (isAdmin) {
        // Map user to admin user format (simplified inline version)
        const adminUser: import('../types').AdminUser = {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role === 'superadmin' || user.role === 'administrator' || user.role === 'admin' ? 'admin' : (user.role === 'moderator' ? 'moderator' : 'user'),
          status: (user.status?.toLowerCase() === 'suspended' || user.status?.toLowerCase() === 'suspend') ? 'suspended' : ((user.status?.toLowerCase() === 'banned' || user.status?.toLowerCase() === 'ban') ? 'banned' : 'active'),
          isVerified: user.isEmailVerified ?? false,
          createdAt: typeof user.createdAt === 'string' ? user.createdAt : (user.createdAt ? user.createdAt.toISOString() : new Date().toISOString()),
          permissions: [{ resource: '*', actions: ['*'] }], // Simplified - full mapping would use ROLE_PERMISSIONS
        };
        setCurrentAdmin(adminUser);
      } else {
        setCurrentAdmin(null);
      }
    } else {
      setCurrentAdmin(null);
    }
  }, [user, authIsAuthenticated, authLoading, setCurrentAdmin]);

  const logout = () => {
    // Clear admin state and call core auth logout
    setCurrentAdmin(null);
    authLogout();
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentAdmin) return false;
    return currentAdmin.permissions.some(p =>
      p.resource === '*' || p.actions.includes('*') || p.actions.includes(permission)
    );
  };

  return {
    admin: currentAdmin,
    isAuthenticated: !!currentAdmin && !!user,
    isLoading,
    logout,
    hasPermission,
  };
};
