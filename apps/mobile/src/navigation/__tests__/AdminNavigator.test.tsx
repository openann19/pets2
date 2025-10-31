/**
 * Tests for AdminNavigator
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import AdminNavigator from '../AdminNavigator';
import { useAuthStore } from '@pawfectmatch/core';
import { useAdminPermissions } from '../../hooks/useAdminPermissions';

// Mock dependencies
jest.mock('@pawfectmatch/core', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../hooks/useAdminPermissions', () => ({
  useAdminPermissions: jest.fn(),
}));

jest.mock('../../screens/admin/AdminDashboardScreen', () => {
  const React = require('react');
  return function AdminDashboardScreen() {
    return React.createElement('Text', null, 'Admin Dashboard');
  };
});

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Screen: ({ component: Component }: { component: React.ComponentType }) => <Component />,
  }),
}));

describe('AdminNavigator', () => {
  const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;
  const mockUseAdminPermissions = useAdminPermissions as jest.MockedFunction<typeof useAdminPermissions>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state when permissions are loading', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isLoading: false,
    } as ReturnType<typeof useAuthStore>);

    mockUseAdminPermissions.mockReturnValue({
      isLoading: true,
      isAdmin: false,
      userRole: null,
      hasPermission: jest.fn(),
      hasAnyPermission: jest.fn(),
      hasAllPermissions: jest.fn(),
      isRole: jest.fn(),
    });

    render(<AdminNavigator />);

    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('should show access denied for non-admin users', () => {
    mockUseAuthStore.mockReturnValue({
      user: {
        _id: 'user1',
        email: 'user@example.com',
        role: 'user',
      },
      isLoading: false,
    } as ReturnType<typeof useAuthStore>);

    mockUseAdminPermissions.mockReturnValue({
      isLoading: false,
      isAdmin: false,
      userRole: null,
      hasPermission: jest.fn(),
      hasAnyPermission: jest.fn(),
      hasAllPermissions: jest.fn(),
      isRole: jest.fn(),
    });

    render(<AdminNavigator />);

    expect(screen.getByText('Access Denied')).toBeTruthy();
    expect(screen.getByText(/don't have permission/i)).toBeTruthy();
  });

  it('should render admin screens for admin users', () => {
    mockUseAuthStore.mockReturnValue({
      user: {
        _id: 'admin1',
        email: 'admin@example.com',
        role: 'administrator',
      },
      isLoading: false,
    } as ReturnType<typeof useAuthStore>);

    mockUseAdminPermissions.mockReturnValue({
      isLoading: false,
      isAdmin: true,
      userRole: 'superadmin',
      hasPermission: jest.fn(),
      hasAnyPermission: jest.fn(),
      hasAllPermissions: jest.fn(),
      isRole: jest.fn(),
    });

    render(<AdminNavigator />);

    expect(screen.getByText('Admin Dashboard')).toBeTruthy();
  });
});

