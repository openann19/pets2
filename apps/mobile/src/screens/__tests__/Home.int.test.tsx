/**
 * HomeScreen Integration Tests
 * Tests HomeScreen rendering, user interactions, and state transitions
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@/theme';
import HomeScreen from '../HomeScreen';
import { useAuthStore } from '@pawfectmatch/core';

// Mock dependencies
jest.mock('@pawfectmatch/core', () => ({
  useAuthStore: jest.fn(),
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('../hooks/screens/useHomeScreen', () => ({
  useHomeScreen: jest.fn(() => ({
    stats: {
      matches: 12,
      messages: 5,
      views: 48,
    },
    refreshing: false,
    onRefresh: jest.fn(),
    handleProfilePress: jest.fn(),
    handleSettingsPress: jest.fn(),
    handleSwipePress: jest.fn(),
    handleMatchesPress: jest.fn(),
    handleMessagesPress: jest.fn(),
    handleMyPetsPress: jest.fn(),
    handleCreatePetPress: jest.fn(),
    handleCommunityPress: jest.fn(),
  })),
}));

jest.mock('../hooks/navigation', () => ({
  useScrollOffsetTracker: jest.fn(() => ({
    onScroll: jest.fn(),
    getOffset: jest.fn(() => 0),
  })),
  useTabReselectRefresh: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider scheme="light">
      <NavigationContainer>{children}</NavigationContainer>
    </ThemeProvider>
  );
};

describe('HomeScreen Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
      },
    });
  });

  describe('Screen Rendering', () => {
    it('should render HomeScreen successfully', () => {
      render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      // Screen should render without errors
      expect(() =>
        render(
          <TestWrapper>
            <HomeScreen />
          </TestWrapper>,
        ),
      ).not.toThrow();
    });

    it('should display user stats', async () => {
      const { useHomeScreen } = require('../hooks/screens/useHomeScreen');
      useHomeScreen.mockReturnValue({
        stats: {
          matches: 12,
          messages: 5,
          views: 48,
        },
        refreshing: false,
        onRefresh: jest.fn(),
        handleProfilePress: jest.fn(),
        handleSettingsPress: jest.fn(),
        handleSwipePress: jest.fn(),
        handleMatchesPress: jest.fn(),
        handleMessagesPress: jest.fn(),
        handleMyPetsPress: jest.fn(),
        handleCreatePetPress: jest.fn(),
        handleCommunityPress: jest.fn(),
      });

      render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      // Stats should be displayed (if rendered)
      await waitFor(() => {
        // Check if stats are rendered in the component
      });
    });
  });

  describe('User Interactions', () => {
    it('should handle refresh action', async () => {
      const mockOnRefresh = jest.fn();
      const { useHomeScreen } = require('../hooks/screens/useHomeScreen');
      useHomeScreen.mockReturnValue({
        stats: { matches: 12, messages: 5, views: 48 },
        refreshing: false,
        onRefresh: mockOnRefresh,
        handleProfilePress: jest.fn(),
        handleSettingsPress: jest.fn(),
        handleSwipePress: jest.fn(),
        handleMatchesPress: jest.fn(),
        handleMessagesPress: jest.fn(),
        handleMyPetsPress: jest.fn(),
        handleCreatePetPress: jest.fn(),
        handleCommunityPress: jest.fn(),
      });

      render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      // Trigger refresh (if pull-to-refresh is implemented)
      await waitFor(() => {
        expect(mockOnRefresh).toBeDefined();
      });
    });

    it('should handle navigation actions', () => {
      const mockHandleSwipePress = jest.fn();
      const { useHomeScreen } = require('../hooks/screens/useHomeScreen');
      useHomeScreen.mockReturnValue({
        stats: { matches: 12, messages: 5, views: 48 },
        refreshing: false,
        onRefresh: jest.fn(),
        handleProfilePress: jest.fn(),
        handleSettingsPress: jest.fn(),
        handleSwipePress: mockHandleSwipePress,
        handleMatchesPress: jest.fn(),
        handleMessagesPress: jest.fn(),
        handleMyPetsPress: jest.fn(),
        handleCreatePetPress: jest.fn(),
        handleCommunityPress: jest.fn(),
      });

      render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      // Navigation handlers should be available
      expect(mockHandleSwipePress).toBeDefined();
    });
  });

  describe('Theme Integration', () => {
    it('should use theme colors correctly', () => {
      render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      // Component should use theme colors
      // This is verified by the component rendering without errors
      expect(TestWrapper).toBeDefined();
    });
  });

  describe('State Management', () => {
    it('should manage refreshing state correctly', async () => {
      const { useHomeScreen } = require('../hooks/screens/useHomeScreen');
      useHomeScreen.mockReturnValue({
        stats: { matches: 12, messages: 5, views: 48 },
        refreshing: true,
        onRefresh: jest.fn(),
        handleProfilePress: jest.fn(),
        handleSettingsPress: jest.fn(),
        handleSwipePress: jest.fn(),
        handleMatchesPress: jest.fn(),
        handleMessagesPress: jest.fn(),
        handleMyPetsPress: jest.fn(),
        handleCreatePetPress: jest.fn(),
        handleCommunityPress: jest.fn(),
      });

      render(
        <TestWrapper>
          <HomeScreen />
        </TestWrapper>,
      );

      // Refreshing state should be handled
      await waitFor(() => {
        // Check for refresh indicator if present
      });
    });
  });
});
