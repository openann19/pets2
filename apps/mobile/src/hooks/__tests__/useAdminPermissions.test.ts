/**
 * Tests for useAdminPermissions hook
 */

import { renderHook } from '@testing-library/react-hooks';
import { useAdminPermissions } from '../useAdminPermissions';
import { useAuthStore } from '@pawfectmatch/core';

// Mock the auth store
jest.mock('@pawfectmatch/core', () => ({
  useAuthStore: jest.fn(),
}));

describe('useAdminPermissions', () => {
  const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return isLoading=true when auth is loading', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isLoading: true,
    } as ReturnType<typeof useAuthStore>);

    const { result } = renderHook(() => useAdminPermissions());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.userRole).toBe(null);
  });

  it('should return isAdmin=false for non-admin users', () => {
    mockUseAuthStore.mockReturnValue({
      user: {
        _id: 'user1',
        email: 'user@example.com',
        role: 'user',
      },
      isLoading: false,
    } as ReturnType<typeof useAuthStore>);

    const { result } = renderHook(() => useAdminPermissions());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.userRole).toBe(null);
  });

  it('should return isAdmin=true for admin users', () => {
    mockUseAuthStore.mockReturnValue({
      user: {
        _id: 'admin1',
        email: 'admin@example.com',
        role: 'administrator',
      },
      isLoading: false,
    } as ReturnType<typeof useAuthStore>);

    const { result } = renderHook(() => useAdminPermissions());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.userRole).toBe('superadmin');
  });

  it('should correctly identify moderator role', () => {
    mockUseAuthStore.mockReturnValue({
      user: {
        _id: 'mod1',
        email: 'mod@example.com',
        role: 'moderator',
      },
      isLoading: false,
    } as ReturnType<typeof useAuthStore>);

    const { result } = renderHook(() => useAdminPermissions());

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.userRole).toBe('moderator');
  });

  it('should grant permissions based on role', () => {
    mockUseAuthStore.mockReturnValue({
      user: {
        _id: 'admin1',
        email: 'admin@example.com',
        role: 'superadmin',
      },
      isLoading: false,
    } as ReturnType<typeof useAuthStore>);

    const { result } = renderHook(() => useAdminPermissions());

    // Superadmin should have all permissions
    expect(result.current.hasPermission('users:read' as any)).toBe(true);
    expect(result.current.hasPermission('users:write' as any)).toBe(true);
    expect(result.current.hasPermission('chats:moderate' as any)).toBe(true);
  });

  it('should check for any permission correctly', () => {
    mockUseAuthStore.mockReturnValue({
      user: {
        _id: 'support1',
        email: 'support@example.com',
        role: 'support',
      },
      isLoading: false,
    } as ReturnType<typeof useAuthStore>);

    const { result } = renderHook(() => useAdminPermissions());

    expect(result.current.hasAnyPermission(['users:read' as any, 'chats:moderate' as any])).toBe(true);
    expect(result.current.hasAnyPermission(['users:write' as any, 'billing:refund' as any])).toBe(false);
  });

  it('should check role correctly', () => {
    mockUseAuthStore.mockReturnValue({
      user: {
        _id: 'analyst1',
        email: 'analyst@example.com',
        role: 'analyst',
      },
      isLoading: false,
    } as ReturnType<typeof useAuthStore>);

    const { result } = renderHook(() => useAdminPermissions());

    expect(result.current.isRole('analyst')).toBe(true);
    expect(result.current.isRole('superadmin')).toBe(false);
    expect(result.current.isRole(['analyst', 'support'])).toBe(true);
  });
});

