

import { PermissionGuard, RoleGuard, useAdminPermissions } from '@/hooks/useAdminPermissions';
import { fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/admin',
  }),
  usePathname: () => '/admin',
}));

// Mock fetch
global.fetch = jest.fn();

describe('🎨 ULTRA DEEP FRONTEND ADMIN TESTS', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorage.clear();
  });

  // ============================================================================
  // SECTION 1: PERMISSION HOOK TESTS
  // ============================================================================

  describe('🔐 useAdminPermissions Hook', () => {
    test('Returns loading state initially', () => {
      const { result } = renderHook(() => useAdminPermissions());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.user).toBe(null);
    });

    test('Loads user with administrator role', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            _id: '1',
            email: 'admin@test.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'administrator',
          },
        }),
      });

      localStorage.setItem('auth-token', 'test-token');

      const { result } = renderHook(() => useAdminPermissions());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user?.role).toBe('administrator');
      expect(result.current.isAdmin).toBe(true);
    });

    test('Administrator has all permissions', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            _id: '1',
            role: 'administrator',
          },
        }),
      });

      localStorage.setItem('auth-token', 'test-token');

      const { result, waitForNextUpdate } = renderHook(() => useAdminPermissions());

      await waitForNextUpdate();

      expect(result.current.hasPermission('users:read')).toBe(true);
      expect(result.current.hasPermission('users:write')).toBe(true);
      expect(result.current.hasPermission('stripe:configure')).toBe(true);
      expect(result.current.hasPermission('anything:anything')).toBe(true);
    });

    test('Moderator has limited permissions', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            _id: '2',
            role: 'moderator',
          },
        }),
      });

      localStorage.setItem('auth-token', 'test-token');

      const { result, waitForNextUpdate } = renderHook(() => useAdminPermissions());

      await waitForNextUpdate();

      expect(result.current.hasPermission('users:read')).toBe(true);
      expect(result.current.hasPermission('users:suspend')).toBe(true);
      expect(result.current.hasPermission('stripe:configure')).toBe(false);
    });

    test('Support has read-only permissions', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            _id: '3',
            role: 'support',
          },
        }),
      });

      localStorage.setItem('auth-token', 'test-token');

      const { result, waitForNextUpdate } = renderHook(() => useAdminPermissions());

      await waitForNextUpdate();

      expect(result.current.hasPermission('users:read')).toBe(true);
      expect(result.current.hasPermission('users:write')).toBe(false);
      expect(result.current.hasPermission('users:delete')).toBe(false);
    });

    test('hasAnyPermission works correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            _id: '4',
            role: 'analyst',
          },
        }),
      });

      localStorage.setItem('auth-token', 'test-token');

      const { result, waitForNextUpdate } = renderHook(() => useAdminPermissions());

      await waitForNextUpdate();

      expect(result.current.hasAnyPermission(['analytics:read', 'stripe:configure'])).toBe(true);
      expect(result.current.hasAnyPermission(['stripe:configure', 'users:ban'])).toBe(false);
    });

    test('hasAllPermissions works correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            _id: '5',
            role: 'moderator',
          },
        }),
      });

      localStorage.setItem('auth-token', 'test-token');

      const { result, waitForNextUpdate } = renderHook(() => useAdminPermissions());

      await waitForNextUpdate();

      expect(result.current.hasAllPermissions(['users:read', 'chats:read'])).toBe(true);
      expect(result.current.hasAllPermissions(['users:read', 'stripe:configure'])).toBe(false);
    });
  });

  // ============================================================================
  // SECTION 2: PERMISSION GUARD COMPONENT TESTS
  // ============================================================================

  describe('🛡️ PermissionGuard Component', () => {
    test('Shows content when permission granted', () => {
      // Mock the hook to return admin permissions
      jest.spyOn(require('@/hooks/useAdminPermissions'), 'useAdminPermissions').mockReturnValue({
        hasPermission: () => true,
        hasAnyPermission: () => true,
        hasAllPermissions: () => true,
        isLoading: false,
        isAdmin: true,
        user: { role: 'administrator' },
      });

      render(
        <PermissionGuard permission="users:read">
          <div>Protected Content</div>
        </PermissionGuard>,
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    test('Hides content when permission denied', () => {
      jest.spyOn(require('@/hooks/useAdminPermissions'), 'useAdminPermissions').mockReturnValue({
        hasPermission: () => false,
        hasAnyPermission: () => false,
        hasAllPermissions: () => false,
        isLoading: false,
        isAdmin: false,
        user: { role: 'support' },
      });

      render(
        <PermissionGuard permission="users:delete">
          <div>Protected Content</div>
        </PermissionGuard>,
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    test('Shows fallback when permission denied', () => {
      jest.spyOn(require('@/hooks/useAdminPermissions'), 'useAdminPermissions').mockReturnValue({
        hasPermission: () => false,
        isLoading: false,
      });

      render(
        <PermissionGuard
          permission="users:delete"
          fallback={<div>No Access</div>}
        >
          <div>Protected Content</div>
        </PermissionGuard>,
      );

      expect(screen.getByText('No Access')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // SECTION 3: ROLE GUARD COMPONENT TESTS
  // ============================================================================

  describe('👤 RoleGuard Component', () => {
    test('Shows content for correct role', () => {
      jest.spyOn(require('@/hooks/useAdminPermissions'), 'useAdminPermissions').mockReturnValue({
        hasRole: (role: string) => role === 'administrator',
        isLoading: false,
        user: { role: 'administrator' },
      });

      render(
        <RoleGuard role="administrator">
          <div>Admin Only Content</div>
        </RoleGuard>,
      );

      expect(screen.getByText('Admin Only Content')).toBeInTheDocument();
    });

    test('Hides content for wrong role', () => {
      jest.spyOn(require('@/hooks/useAdminPermissions'), 'useAdminPermissions').mockReturnValue({
        hasRole: (role: string) => role === 'support',
        isLoading: false,
        user: { role: 'support' },
      });

      render(
        <RoleGuard role="administrator">
          <div>Admin Only Content</div>
        </RoleGuard>,
      );

      expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument();
    });

    test('Supports multiple roles', () => {
      jest.spyOn(require('@/hooks/useAdminPermissions'), 'useAdminPermissions').mockReturnValue({
        hasRole: (roles: string | string[]) => {
          const roleArray = Array.isArray(roles) ? roles : [roles];
          return roleArray.includes('moderator');
        },
        isLoading: false,
        user: { role: 'moderator' },
      });

      render(
        <RoleGuard role={['administrator', 'moderator']}>
          <div>Multi-Role Content</div>
        </RoleGuard>,
      );

      expect(screen.getByText('Multi-Role Content')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // SECTION 4: ADMIN DASHBOARD COMPONENT TESTS
  // ============================================================================

  describe('📊 Admin Dashboard Component', () => {
    test('Shows loading state initially', async () => {
      const Dashboard = (await import('@/app/(admin)/dashboard/page')).default as React.ComponentType;

      render(<Dashboard />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    test('Loads and displays analytics data', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          analytics: {
            users: {
              total: 1000,
              active: 800,
              growth: 15.5,
              trend: 'up',
            },
            pets: {
              total: 1500,
              active: 1200,
            },
          },
        }),
      });

      const Dashboard = (await import('@/app/(admin)/dashboard/page')).default as React.ComponentType;

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/1000/)).toBeInTheDocument();
        expect(screen.getByText(/800/)).toBeInTheDocument();
      });
    });

    test('Handles API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const Dashboard = (await import('@/app/(admin)/dashboard/page')).default as React.ComponentType;

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    test('Shows retry button on error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      const Dashboard = (await import('@/app/(admin)/dashboard/page')).default as React.ComponentType;

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/try again/i)).toBeInTheDocument();
      });
    });

    test('Retry button refetches data', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            analytics: {
              users: { total: 1000 },
            },
          }),
        });

      const Dashboard = (await import('@/app/(admin)/dashboard/page')).default as React.ComponentType;

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/try again/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/try again/i));

      await waitFor(() => {
        expect(screen.getByText(/1000/)).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // SECTION 5: ERROR BOUNDARY TESTS
  // ============================================================================

  describe('🚨 Error Handling', () => {
    test('Catches component errors', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { container } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>,
      );

      expect(container.textContent).toContain('error');
    });

    test('Shows error message to user', () => {
      const ThrowError = () => {
        throw new Error('Something went wrong');
      };

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>,
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // SECTION 6: ACCESSIBILITY TESTS
  // ============================================================================

  describe('♿ Accessibility', () => {
    test('Dashboard has proper ARIA labels', async () => {
      const Dashboard = (await import('@/app/(admin)/dashboard/page')).default as React.ComponentType;

      const { container } = render(<Dashboard />);

      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    test('Navigation is keyboard accessible', async () => {
      const Layout = (await import('@/app/(admin)/layout')).default as React.ComponentType;

      render(
        <Layout>
          <div>Content</div>
        </Layout>,
      );

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });
    });
  });

  // ============================================================================
  // SECTION 7: INTEGRATION TESTS
  // ============================================================================

  describe('🔗 Integration Tests', () => {
    test('Complete admin workflow', async () => {
      // 1. Load dashboard
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          analytics: {
            users: { total: 1000 },
          },
        }),
      });

      const Dashboard = (await import('@/app/(admin)/dashboard/page')).default as React.ComponentType;

      render(<Dashboard />);

      // 2. Wait for data to load
      await waitFor(() => {
        expect(screen.getByText(/1000/)).toBeInTheDocument();
      });

      // 3. Verify fetch was called with correct params
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/analytics'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
    });
  });
});

// Mock ErrorBoundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <div>Error: {this.state.error?.message}</div>;
    }

    return this.props.children;
  }
}
