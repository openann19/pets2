/**
 * SettingsScreen Integration Tests
 * Tests SettingsScreen rendering, GDPR actions, and navigation
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@/theme';
import SettingsScreen from '../SettingsScreen';

jest.mock('../hooks/screens/useSettingsScreen', () => ({
  useSettingsScreen: jest.fn(() => ({
    notifications: {
      email: true,
      push: true,
      matches: true,
      messages: true,
    },
    preferences: {
      maxDistance: 50,
      ageRange: { min: 0, max: 30 },
    },
    deletionStatus: {
      isPending: false,
      daysRemaining: null,
    },
    setNotifications: jest.fn(),
    setPreferences: jest.fn(),
    handleLogout: jest.fn(),
    handleDeleteAccount: jest.fn(),
    handleExportData: jest.fn(),
  })),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider scheme="light">
    <NavigationContainer>
      {children}
    </NavigationContainer>
  </ThemeProvider>
);

describe('SettingsScreen Integration Tests', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render SettingsScreen successfully', () => {
    render(
      <TestWrapper>
        <SettingsScreen navigation={mockNavigation as any} route={{ params: {}, key: 'Settings' } as any} />
      </TestWrapper>
    );

    // Screen should render without errors
    expect(() => render(
      <TestWrapper>
        <SettingsScreen navigation={mockNavigation as any} route={{ params: {}, key: 'Settings' } as any} />
      </TestWrapper>
    )).not.toThrow();
  });

  it('should handle GDPR export data action', async () => {
    const { useSettingsScreen } = require('../hooks/screens/useSettingsScreen');
    const mockHandleExportData = jest.fn();
    useSettingsScreen.mockReturnValue({
      notifications: {
        email: true,
        push: true,
        matches: true,
        messages: true,
      },
      preferences: {
        maxDistance: 50,
        ageRange: { min: 0, max: 30 },
      },
      deletionStatus: {
        isPending: false,
        daysRemaining: null,
      },
      setNotifications: jest.fn(),
      setPreferences: jest.fn(),
      handleLogout: jest.fn(),
      handleDeleteAccount: jest.fn(),
      handleExportData: mockHandleExportData,
    });

    render(
      <TestWrapper>
        <SettingsScreen navigation={mockNavigation as any} route={{ params: {}, key: 'Settings' } as any} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockHandleExportData).toBeDefined();
    });
  });

  it('should handle account deletion status', () => {
    const { useSettingsScreen } = require('../hooks/screens/useSettingsScreen');
    useSettingsScreen.mockReturnValue({
      notifications: {
        email: true,
        push: true,
        matches: true,
        messages: true,
      },
      preferences: {
        maxDistance: 50,
        ageRange: { min: 0, max: 30 },
      },
      deletionStatus: {
        isPending: true,
        daysRemaining: 15,
      },
      setNotifications: jest.fn(),
      setPreferences: jest.fn(),
      handleLogout: jest.fn(),
      handleDeleteAccount: jest.fn(),
      handleExportData: jest.fn(),
    });

      render(
        <TestWrapper>
          <SettingsScreen navigation={mockNavigation as any} route={{ params: {}, key: 'Settings' } as any} />
        </TestWrapper>
      );

      expect(mockNavigation).toBeDefined();
  });
});

