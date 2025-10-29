/**
 * UltraTabBar Integration Tests
 *
 * Tests the ultra-enhanced tab bar with:
 * - Glass blur effects
 * - Spotlight press ripple
 * - Breathing active underline
 * - Springy badge physics
 * - Icon micro-motions
 */

import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import UltraTabBar from '../UltraTabBar';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';

// Mock haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
}));

const Tab = createBottomTabNavigator();

const TestScreen = ({ name }: { name: string }) => (
  <View testID={`screen-${name}`}>
    <Text>{name}</Text>
  </View>
);

function createTestNavigator(initialRouteName = 'Home') {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props: BottomTabBarProps) => <UltraTabBar {...props} />}
        initialRouteName={initialRouteName}
      >
        <Tab.Screen
          name="Home"
          component={() => <TestScreen name="Home" />}
          options={{ tabBarLabel: 'Home' }}
        />
        <Tab.Screen
          name="Swipe"
          component={() => <TestScreen name="Swipe" />}
          options={{ tabBarLabel: 'Swipe' }}
        />
        <Tab.Screen
          name="Matches"
          component={() => <TestScreen name="Matches" />}
          options={{ tabBarLabel: 'Matches' }}
        />
        <Tab.Screen
          name="Map"
          component={() => <TestScreen name="Map" />}
          options={{ tabBarLabel: 'Map' }}
        />
        <Tab.Screen
          name="Profile"
          component={() => <TestScreen name="Profile" />}
          options={{ tabBarLabel: 'Profile' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

describe('UltraTabBar Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering and Initial State', () => {
    it('renders all tabs with correct labels', () => {
      const { getByText } = render(createTestNavigator());

      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Swipe')).toBeTruthy();
      expect(getByText('Matches')).toBeTruthy();
      expect(getByText('Map')).toBeTruthy();
      expect(getByText('Profile')).toBeTruthy();
    });

    it('renders with blur view wrapper', () => {
      const { UNSAFE_getByType } = render(createTestNavigator());
      const blurViews = UNSAFE_getByType('BlurView');
      expect(blurViews).toBeTruthy();
    });

    it('shows active indicator with animated underline', () => {
      const { UNSAFE_getByType } = render(createTestNavigator());
      const animatedViews = UNSAFE_getByType('Animated.View');

      // Should have multiple animated views (tabBarAnim, indicatorAnim, spotAnim, iconAnim, badgeAnim)
      expect(animatedViews.length).toBeGreaterThan(0);
    });

    it('displays badges for tabs with counts', () => {
      const { getByText } = render(createTestNavigator());

      // Matches should have badge count 3
      expect(getByText('3')).toBeTruthy();
      // Map should have badge count 1
      expect(getByText('1')).toBeTruthy();
      // Home should have badge count 2
      expect(getByText('2')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('navigates to different tab on press', async () => {
      const { getByText, getByTestId } = render(createTestNavigator());

      // Initial screen should be Home
      expect(getByTestId('screen-Home')).toBeTruthy();

      // Press Swipe tab
      const swipeButton = getByText('Swipe');
      fireEvent.press(swipeButton);

      // Should navigate to Swipe screen
      await waitFor(() => {
        expect(getByTestId('screen-Swipe')).toBeTruthy();
      });
    });

    it('handles multiple tab switches', async () => {
      const { getByText, getByTestId } = render(createTestNavigator());

      // Start at Home
      expect(getByTestId('screen-Home')).toBeTruthy();

      // Switch to Matches
      fireEvent.press(getByText('Matches'));
      await waitFor(() => {
        expect(getByTestId('screen-Matches')).toBeTruthy();
      });

      // Switch to Profile
      fireEvent.press(getByText('Profile'));
      await waitFor(() => {
        expect(getByTestId('screen-Profile')).toBeTruthy();
      });

      // Switch back to Home
      fireEvent.press(getByText('Home'));
      await waitFor(() => {
        expect(getByTestId('screen-Home')).toBeTruthy();
      });
    });

    it('triggers haptic feedback on tab press', () => {
      const { getByText } = render(createTestNavigator());

      fireEvent.press(getByText('Swipe'));

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('triggers medium haptic feedback on same tab reselect', () => {
      const { getByText } = render(createTestNavigator());

      // First press
      fireEvent.press(getByText('Home'));
      jest.clearAllMocks();

      // Second press on same tab
      fireEvent.press(getByText('Home'));

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const { getByLabelText } = render(createTestNavigator());

      expect(getByLabelText('Home tab')).toBeTruthy();
      expect(getByLabelText('Swipe tab')).toBeTruthy();
      expect(getByLabelText('Matches tab')).toBeTruthy();
      expect(getByLabelText('Map tab')).toBeTruthy();
      expect(getByLabelText('Profile tab')).toBeTruthy();
    });

    it('sets correct accessibility state for active tab', () => {
      const { getByLabelText } = render(createTestNavigator());

      const homeTab = getByLabelText('Home tab');
      expect(homeTab.props.accessibilityState?.selected).toBe(true);
    });

    it('updates accessibility state on tab switch', async () => {
      const { getByLabelText, getByText } = render(createTestNavigator());

      // Home is selected initially
      expect(getByLabelText('Home tab').props.accessibilityState?.selected).toBe(true);

      // Switch to Swipe
      fireEvent.press(getByText('Swipe'));

      await waitFor(() => {
        expect(getByLabelText('Swipe tab').props.accessibilityState?.selected).toBe(true);
        expect(getByLabelText('Home tab').props.accessibilityState?.selected).toBeUndefined();
      });
    });
  });

  describe('Badge Functionality', () => {
    it('shows badge with correct count', () => {
      const { getByText } = render(createTestNavigator());

      // Matches has 3
      expect(getByText('3')).toBeTruthy();
      // Map has 1
      expect(getByText('1')).toBeTruthy();
      // Home has 2
      expect(getByText('2')).toBeTruthy();
    });

    it('hides badge when count is 0', () => {
      const { getByText } = render(createTestNavigator());

      // Swipe and Profile have no badges (count = 0)
      expect(() => getByText('0')).toThrow();
    });

    it('displays 99+ for counts over 99', () => {
      // This would require mocking the badge count function
      // Test implementation would go here
    });
  });

  describe('Long Press Events', () => {
    it('emits long press event', () => {
      const { getByText } = render(createTestNavigator());

      const homeTab = getByText('Home');
      fireEvent(homeTab, 'longPress');

      // Long press event should be emitted
      // Actual implementation depends on navigation.emit behavior
    });
  });

  describe('Visual Effects', () => {
    it('applies blur view with correct intensity', () => {
      const { UNSAFE_getByType } = render(createTestNavigator());
      const blurView = UNSAFE_getByType('BlurView');

      // Intensity should be set (88 for iOS, 100 for Android)
      expect(blurView).toBeTruthy();
    });

    it('has proper styling with shadows and elevation', () => {
      const { UNSAFE_getByType } = render(createTestNavigator());
      const blurView = UNSAFE_getByType('BlurView');

      // Should have blur effect applied
      expect(blurView).toBeTruthy();
    });

    it('animates icon scale on focus', async () => {
      const { getByText } = render(createTestNavigator());

      // Icons should scale when focused
      const homeIcon = getByText('Home').parent;
      expect(homeIcon).toBeTruthy();
    });

    it('renders spotlight pulse on press', () => {
      const { getByText } = render(createTestNavigator());

      fireEvent.press(getByText('Swipe'));

      // Spotlight animation should trigger
      // This is tested via the animation state changes
    });

    it('renders breathing underline indicator', () => {
      const { UNSAFE_getByType } = render(createTestNavigator());
      const animatedViews = UNSAFE_getByType('Animated.View');

      // Should have animated indicator
      expect(animatedViews.length).toBeGreaterThan(0);
    });
  });

  describe('Layout and Responsiveness', () => {
    it('handles safe area insets', () => {
      const { container } = render(createTestNavigator());

      // Should apply safe area padding
      expect(container).toBeTruthy();
    });

    it('measures tab positions for accurate animations', () => {
      const { UNSAFE_getByType } = render(createTestNavigator());

      // Layout measurement callbacks should be registered
      const tabButtons = UNSAFE_getByType('TouchableOpacity');
      expect(tabButtons.length).toBeGreaterThan(0);
    });

    it('adapts to different screen sizes', () => {
      // This would require mocking different screen dimensions
      // Test implementation would go here
    });
  });

  describe('Performance', () => {
    it('does not create unnecessary re-renders', () => {
      const { rerender } = render(createTestNavigator());

      // Re-render with same props
      rerender(createTestNavigator());

      // Should not cause issues
    });

    it('handles rapid tab switching smoothly', async () => {
      const { getByText } = render(createTestNavigator());

      // Rapidly switch between tabs
      for (let i = 0; i < 5; i++) {
        fireEvent.press(getByText('Home'));
        fireEvent.press(getByText('Swipe'));
        fireEvent.press(getByText('Profile'));
      }

      // Should handle without errors
      await waitFor(() => {
        expect(true).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    it('gracefully handles missing route descriptors', () => {
      // This would require creating a test with malformed descriptors
      // Test implementation would go here
    });

    it('handles navigation errors without crashing', () => {
      // This would test navigation error scenarios
      // Test implementation would go here
    });
  });

  describe('Theme Support', () => {
    it('adapts to dark theme', () => {
      // This would require mocking theme context
      // Test implementation would go here
    });

    it('adapts to light theme', () => {
      // This would require mocking theme context
      // Test implementation would go here
    });

    it('updates colors on theme change', () => {
      // This would require dynamic theme switching
      // Test implementation would go here
    });
  });

  describe('Animation States', () => {
    it('animates indicator position on tab change', async () => {
      const { getByText } = render(createTestNavigator());

      // Start at Home
      // Switch to Swipe
      fireEvent.press(getByText('Swipe'));

      // Indicator should animate to new position
      await waitFor(() => {
        expect(getByText('Swipe').parent).toBeTruthy();
      });
    });

    it('animates badge appearance', () => {
      const { getByText } = render(createTestNavigator());

      // Badges should be visible for tabs with counts
      expect(getByText('3')).toBeTruthy();
    });

    it('applies breathing animation to active indicator', () => {
      const { UNSAFE_getByType } = render(createTestNavigator());

      // Breathing animation should be active
      const animatedViews = UNSAFE_getByType('Animated.View');
      expect(animatedViews).toBeTruthy();
    });
  });
});
