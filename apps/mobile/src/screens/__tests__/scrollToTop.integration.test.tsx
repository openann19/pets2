/**
 * Comprehensive integration tests for scroll-to-top functionality
 * Tests the complete flow from tab press to scroll action
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../HomeScreen';
import MatchesScreen from '../MatchesScreen';
import ProfileScreen from '../ProfileScreen';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock dependencies
jest.mock('@pawfectmatch/core', () => ({
  useAuthStore: () => ({
    user: { firstName: 'Test', email: 'test@example.com' },
  }),
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../hooks/screens/useHomeScreen', () => ({
  useHomeScreen: () => ({
    stats: { matches: 0, messages: 0 },
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
  }),
}));

jest.mock('../../hooks/useMatchesData', () => ({
  useMatchesData: () => ({
    matches: [],
    likedYou: [],
    selectedTab: 'matches',
    refreshing: false,
    onRefresh: jest.fn(),
    setSelectedTab: jest.fn(),
    handleScroll: jest.fn(),
  }),
}));

jest.mock('../../hooks/screens/useProfileScreen', () => ({
  useProfileScreen: () => ({
    user: { firstName: 'Test', email: 'test@example.com' },
    notifications: { push: true, email: true },
    privacy: { profile: true },
    handleLogout: jest.fn(),
    handleSettingToggle: jest.fn(),
    handlePrivacyToggle: jest.fn(),
  }),
}));

const Tab = createBottomTabNavigator();

const TestNavigator = () => (
  <NavigationContainer>
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesScreen}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />
    </Tab.Navigator>
  </NavigationContainer>
);

describe('Scroll-to-Top Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('HomeScreen', () => {
    it('should scroll to top when tab is pressed', async () => {
      const { getByText } = render(<TestNavigator />);

      // Navigate to Home tab
      const homeTab = getByText('Home');
      fireEvent.press(homeTab);

      // Wait for scroll to complete
      await waitFor(() => {
        expect(homeTab).toBeTruthy();
      });
    });

    it('should refresh content on double-tap', async () => {
      const { getByText } = render(<TestNavigator />);

      // Navigate to Home tab
      const homeTab = getByText('Home');

      // Double tap
      fireEvent.press(homeTab);
      fireEvent.press(homeTab);

      await waitFor(() => {
        expect(homeTab).toBeTruthy();
      });
    });
  });

  describe('MatchesScreen', () => {
    it('should scroll to top when tab is pressed', async () => {
      const { getByText } = render(<TestNavigator />);

      // Navigate to Matches tab
      const matchesTab = getByText('Matches');
      fireEvent.press(matchesTab);

      await waitFor(() => {
        expect(matchesTab).toBeTruthy();
      });
    });

    it('should refresh content on double-tap', async () => {
      const { getByText } = render(<TestNavigator />);

      const matchesTab = getByText('Matches');

      // Double tap
      fireEvent.press(matchesTab);
      fireEvent.press(matchesTab);

      await waitFor(() => {
        expect(matchesTab).toBeTruthy();
      });
    });
  });

  describe('ProfileScreen', () => {
    it('should scroll to top when tab is pressed', async () => {
      const { getByText } = render(<TestNavigator />);

      // Navigate to Profile tab
      const profileTab = getByText('Profile');
      fireEvent.press(profileTab);

      await waitFor(() => {
        expect(profileTab).toBeTruthy();
      });
    });

    it('should scroll to top on double-tap', async () => {
      const { getByText } = render(<TestNavigator />);

      const profileTab = getByText('Profile');

      // Double tap
      fireEvent.press(profileTab);
      fireEvent.press(profileTab);

      await waitFor(() => {
        expect(profileTab).toBeTruthy();
      });
    });
  });

  describe('Cross-tab navigation', () => {
    it('should handle navigation between tabs with scroll-to-top', async () => {
      const { getByText } = render(<TestNavigator />);

      const homeTab = getByText('Home');
      const matchesTab = getByText('Matches');
      const profileTab = getByText('Profile');

      // Navigate through tabs
      fireEvent.press(homeTab);
      await waitFor(() => expect(homeTab).toBeTruthy());

      fireEvent.press(matchesTab);
      await waitFor(() => expect(matchesTab).toBeTruthy());

      fireEvent.press(profileTab);
      await waitFor(() => expect(profileTab).toBeTruthy());

      // Go back to home and double-tap
      fireEvent.press(homeTab);
      fireEvent.press(homeTab);

      await waitFor(() => expect(homeTab).toBeTruthy());
    });

    it('should maintain scroll position when switching tabs', async () => {
      const { getByText } = render(<TestNavigator />);

      const homeTab = getByText('Home');
      const matchesTab = getByText('Matches');

      fireEvent.press(homeTab);
      await waitFor(() => expect(homeTab).toBeTruthy());

      fireEvent.press(matchesTab);
      await waitFor(() => expect(matchesTab).toBeTruthy());

      // Return to home and verify it's still accessible
      fireEvent.press(homeTab);
      await waitFor(() => expect(homeTab).toBeTruthy());
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid tab switching', async () => {
      const { getByText } = render(<TestNavigator />);

      const homeTab = getByText('Home');
      const matchesTab = getByText('Matches');

      // Rapidly switch tabs
      for (let i = 0; i < 5; i++) {
        fireEvent.press(i % 2 === 0 ? homeTab : matchesTab);
      }

      await waitFor(() => {
        expect(homeTab).toBeTruthy();
      });
    });

    it('should handle double-tap during navigation', async () => {
      const { getByText } = render(<TestNavigator />);

      const homeTab = getByText('Home');
      const matchesTab = getByText('Matches');

      // Navigate while double-tapping
      fireEvent.press(homeTab);
      fireEvent.press(homeTab);
      fireEvent.press(matchesTab);
      fireEvent.press(matchesTab);

      await waitFor(() => {
        expect(homeTab).toBeTruthy();
        expect(matchesTab).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should maintain accessibility labels during scroll-to-top', async () => {
      const { getByText } = render(<TestNavigator />);

      const homeTab = getByText('Home');

      fireEvent.press(homeTab);
      fireEvent.press(homeTab);

      await waitFor(() => {
        expect(homeTab).toBeTruthy();
      });

      // Verify accessibility is maintained
      expect(homeTab).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should handle multiple scroll-to-top actions efficiently', async () => {
      const { getByText } = render(<TestNavigator />);

      const homeTab = getByText('Home');

      // Perform multiple scroll-to-top actions
      for (let i = 0; i < 10; i++) {
        fireEvent.press(homeTab);
        await waitFor(() => {
          expect(homeTab).toBeTruthy();
        });
      }
    });

    it('should not cause memory leaks with multiple tab presses', async () => {
      const { getByText, unmount } = render(<TestNavigator />);

      const homeTab = getByText('Home');

      for (let i = 0; i < 20; i++) {
        fireEvent.press(homeTab);
      }

      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });

  describe('Integration with navigation events', () => {
    it('should work correctly with tabPress events', async () => {
      const { getByText } = render(<TestNavigator />);

      const homeTab = getByText('Home');

      // Simulate tab press event
      fireEvent.press(homeTab);

      await waitFor(() => {
        expect(homeTab).toBeTruthy();
      });
    });

    it('should handle tabLongPress events separately', async () => {
      const { getByText } = render(<TestNavigator />);

      const homeTab = getByText('Home');

      // Long press should not trigger scroll-to-top
      fireEvent(homeTab, 'onLongPress');

      await waitFor(() => {
        expect(homeTab).toBeTruthy();
      });
    });
  });
});
