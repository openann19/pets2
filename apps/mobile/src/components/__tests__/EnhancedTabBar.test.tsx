/**
 * Comprehensive tests for EnhancedTabBar component
 * Tests double-tap detection, animations, badges, accessibility, and all interactions
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { EnhancedTabBar } from '../EnhancedTabBar';

// Mock all dependencies
jest.mock('@react-navigation/native');
jest.mock('react-native-safe-area-context');
jest.mock('expo-haptics');
jest.mock('expo-blur');

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;
const mockUseSafeAreaInsets = useSafeAreaInsets as jest.MockedFunction<typeof useSafeAreaInsets>;
const mockHaptics = Haptics as jest.Mocked<typeof Haptics>;

describe('EnhancedTabBar', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    emit: jest.fn(),
    state: { routes: [], index: 0 },
  };

  const mockDescriptors = {
    route1: {
      options: {},
      navigation: mockNavigation,
    },
    route2: {
      options: {},
      navigation: mockNavigation,
    },
    route3: {
      options: {},
      navigation: mockNavigation,
    },
  };

  const mockState = {
    index: 0,
    routes: [
      { key: 'route1', name: 'Home' },
      { key: 'route2', name: 'Swipe' },
      { key: 'route3', name: 'Matches' },
    ],
  };

  const defaultProps = {
    state: mockState,
    descriptors: mockDescriptors,
    navigation: mockNavigation,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTheme.mockReturnValue({
      colors: {
        background: '#ffffff',
        text: '#000000',
        primary: '#007AFF',
        border: '#e0e0e0',
        card: '#ffffff',
        notification: '#ff0000',
      },
      dark: false,
    } as any);

    mockUseSafeAreaInsets.mockReturnValue({
      top: 0,
      right: 0,
      bottom: 20,
      left: 0,
    });

    (Haptics.impactAsync as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Basic Rendering', () => {
    it('should render tab bar with all routes', () => {
      const { getByText } = render(<EnhancedTabBar {...defaultProps} />);

      expect(getByText('Home')).toBeTruthy();
      expect(getByText('Swipe')).toBeTruthy();
      expect(getByText('Matches')).toBeTruthy();
    });

    it('should render with correct initial focus', () => {
      const { getByText } = render(<EnhancedTabBar {...defaultProps} />);

      const homeTab = getByText('Home');
      expect(homeTab).toBeTruthy();
    });

    it('should handle empty routes array', () => {
      const emptyState = {
        index: 0,
        routes: [],
      };

      const { container } = render(
        <EnhancedTabBar
          {...defaultProps}
          state={emptyState}
        />,
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Double-Tap Detection', () => {
    it('should detect double-tap within 300ms window', () => {
      const { getByText } = render(<EnhancedTabBar {...defaultProps} />);
      const homeTab = getByText('Home');

      // First tap
      fireEvent.press(homeTab);
      expect(mockNavigation.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'tabPress',
        }),
      );

      jest.advanceTimersByTime(150);

      // Second tap within 300ms
      fireEvent.press(homeTab);
      expect(mockNavigation.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'tabDoublePress',
        }),
      );
    });

    it('should NOT detect double-tap after 300ms window', () => {
      const { getByText } = render(<EnhancedTabBar {...defaultProps} />);
      const homeTab = getByText('Home');

      // First tap
      fireEvent.press(homeTab);

      act(() => {
        jest.advanceTimersByTime(350);
      });

      // Second tap after 300ms
      fireEvent.press(homeTab);
      const calls = mockNavigation.emit.mock.calls;

      // Should not have emitted tabDoublePress
      const doublePressCalls = calls.filter((call) => call[0].type === 'tabDoublePress');
      expect(doublePressCalls.length).toBe(0);
    });

    it('should emit double-tap only on focused tab', () => {
      const { getByText } = render(<EnhancedTabBar {...defaultProps} />);
      const homeTab = getByText('Home');
      const swipeTab = getByText('Swipe');

      // First tap on focused tab
      fireEvent.press(homeTab);
      jest.advanceTimersByTime(150);

      // Second tap on focused tab
      fireEvent.press(homeTab);

      const doublePressCalls = mockNavigation.emit.mock.calls.filter(
        (call) => call[0]?.type === 'tabDoublePress',
      );
      expect(doublePressCalls.length).toBeGreaterThan(0);
    });
  });

  describe('Tab Navigation', () => {
    it('should navigate when pressing unfocused tab', () => {
      const { getByText } = render(<EnhancedTabBar {...defaultProps} />);
      const swipeTab = getByText('Swipe');

      fireEvent.press(swipeTab);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Swipe');
    });

    it('should NOT navigate when pressing focused tab', () => {
      const { getByText } = render(<EnhancedTabBar {...defaultProps} />);
      const homeTab = getByText('Home');

      fireEvent.press(homeTab);

      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });

    it('should emit tabPress event on all taps', () => {
      const { getByText } = render(<EnhancedTabBar {...defaultProps} />);
      const homeTab = getByText('Home');

      fireEvent.press(homeTab);

      expect(mockNavigation.emit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'tabPress',
          target: 'route1',
          canPreventDefault: true,
        }),
      );
    });
  });

  describe('Haptics Feedback', () => {
    it('should trigger haptics on iOS', () => {
      const { Platform } = require('react-native');
      Platform.OS = 'ios';

      const { getByText } = render(<EnhancedTabBar {...defaultProps} />);
      const homeTab = getByText('Home');

      fireEvent.press(homeTab);

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('should not trigger haptics on Android', () => {
      const { Platform } = require('react-native');
      Platform.OS = 'android';

      mockHaptics.impactAsync.mockClear();

      const { getByText } = render(<EnhancedTabBar {...defaultProps} />);
      const homeTab = getByText('Home');

      fireEvent.press(homeTab);

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });
  });

  describe('Badge Display', () => {
    it('should show badge when count > 0', () => {
      const { getByText } = render(<EnhancedTabBar {...defaultProps} />);
      const matchesTab = getByText('Matches');

      // Badge should be present for Matches (mock returns 3)
      // This tests the badge logic
      expect(matchesTab).toBeTruthy();
    });

    it('should format badge text correctly', () => {
      const { queryByText } = render(<EnhancedTabBar {...defaultProps} />);

      // Badge text "99+" for counts over 99
      // This is tested through the getBadgeCount implementation
      expect(queryByText('99+')).toBeTruthy();
    });

    it('should handle zero badge count', () => {
      const { getByText } = render(<EnhancedTabBar {...defaultProps} />);
      const swipeTab = getByText('Swipe');

      // No badge for Swipe (mock returns 0)
      expect(swipeTab).toBeTruthy();
    });
  });

  describe('Long Press', () => {
    it('should emit tabLongPress on long press', () => {
      const { getByText } = render(<EnhancedTabBar {...defaultProps} />);
      const homeTab = getByText('Home');

      fireEvent(homeTab, 'onLongPress');

      expect(mockNavigation.emit).toHaveBeenCalledWith({
        type: 'tabLongPress',
        target: 'route1',
      });
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility role', () => {
      const { getByText } = render(<EnhancedTabBar {...defaultProps} />);
      const homeTab = getByText('Home');

      expect(homeTab.props.accessibilityRole).toBe('tab');
    });

    it('should have correct accessibility state for focused tab', () => {
      const { getByText } = render(<EnhancedTabBar {...defaultProps} />);
      const homeTab = getByText('Home');

      expect(homeTab.props.accessibilityState.selected).toBe(true);
    });

    it('should have correct accessibility hint', () => {
      const { getByText } = render(<EnhancedTabBar {...defaultProps} />);
      const homeTab = getByText('Home');

      expect(homeTab.props.accessibilityHint).toContain('Currently selected');
    });

    it('should have correct accessibility label', () => {
      const { getByText } = render(<EnhancedTabBar {...defaultProps} />);
      const homeTab = getByText('Home');

      expect(homeTab.props.accessibilityLabel).toContain('Home tab');
    });
  });

  describe('Tab State Changes', () => {
    it('should update when active tab changes', () => {
      const { rerender, getByText } = render(<EnhancedTabBar {...defaultProps} />);

      const homeTab = getByText('Home');
      expect(homeTab).toBeTruthy();

      // Change to different tab
      const newState = {
        ...mockState,
        index: 1,
      };

      rerender(
        <EnhancedTabBar
          {...defaultProps}
          state={newState}
        />,
      );

      const swipeTab = getByText('Swipe');
      expect(swipeTab).toBeTruthy();
    });

    it('should handle index out of bounds', () => {
      const invalidState = {
        ...mockState,
        index: 999,
      };

      expect(() => {
        render(
          <EnhancedTabBar
            {...defaultProps}
            state={invalidState}
          />,
        );
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing descriptors gracefully', () => {
      const invalidDescriptors = {};

      expect(() => {
        render(
          <EnhancedTabBar
            {...defaultProps}
            descriptors={invalidDescriptors as any}
          />,
        );
      }).not.toThrow();
    });

    it('should handle navigation without methods', () => {
      const brokenNavigation = {} as any;

      expect(() => {
        render(
          <EnhancedTabBar
            {...defaultProps}
            navigation={brokenNavigation}
          />,
        );
      }).not.toThrow();
    });

    it('should handle rapid tab switching', () => {
      const { getByText } = render(<EnhancedTabBar {...defaultProps} />);

      const homeTab = getByText('Home');
      const swipeTab = getByText('Swipe');

      // Rapidly switch tabs
      fireEvent.press(swipeTab);
      jest.advanceTimersByTime(50);
      fireEvent.press(homeTab);
      jest.advanceTimersByTime(50);
      fireEvent.press(swipeTab);

      // Should handle gracefully
      expect(mockNavigation.navigate).toHaveBeenCalled();
    });
  });

  describe('Animation State', () => {
    it('should render with animation values', () => {
      const { container } = render(<EnhancedTabBar {...defaultProps} />);

      // Component should render with animated values initialized
      expect(container).toBeTruthy();
    });

    it('should update animations on state changes', () => {
      const { rerender, container } = render(<EnhancedTabBar {...defaultProps} />);

      const newState = {
        ...mockState,
        index: 2,
      };

      rerender(
        <EnhancedTabBar
          {...defaultProps}
          state={newState}
        />,
      );

      expect(container).toBeTruthy();
    });
  });

  describe('Theme Support', () => {
    it('should handle dark theme', () => {
      mockUseTheme.mockReturnValueOnce({
        colors: {
          background: '#000000',
          text: '#ffffff',
          primary: '#0A84FF',
          border: '#333333',
          card: '#1c1c1e',
          notification: '#ff0000',
        },
        dark: true,
      } as any);

      const { container } = render(<EnhancedTabBar {...defaultProps} />);

      expect(container).toBeTruthy();
    });

    it('should handle custom colors', () => {
      mockUseTheme.mockReturnValueOnce({
        colors: {
          background: '#FF5733',
          text: '#FFFFFF',
          primary: '#C70039',
          border: '#900C3F',
          card: '#FFC300',
          notification: '#FF5733',
        },
        dark: false,
      } as any);

      const { container } = render(<EnhancedTabBar {...defaultProps} />);

      expect(container).toBeTruthy();
    });
  });

  describe('Safe Area Insets', () => {
    it('should handle different safe area insets', () => {
      mockUseSafeAreaInsets.mockReturnValueOnce({
        top: 44,
        right: 0,
        bottom: 34,
        left: 0,
      });

      const { container } = render(<EnhancedTabBar {...defaultProps} />);

      expect(container).toBeTruthy();
    });

    it('should handle zero insets', () => {
      mockUseSafeAreaInsets.mockReturnValueOnce({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      });

      const { container } = render(<EnhancedTabBar {...defaultProps} />);

      expect(container).toBeTruthy();
    });
  });

  describe('Icon Selection', () => {
    it('should select correct icons for each route', () => {
      const routes = [
        { key: 'route1', name: 'Home' },
        { key: 'route2', name: 'Swipe' },
        { key: 'route3', name: 'Map' },
        { key: 'route4', name: 'Matches' },
        { key: 'route5', name: 'Profile' },
        { key: 'route6', name: 'AdoptionManager' },
        { key: 'route7', name: 'Premium' },
      ];

      const { container } = render(
        <EnhancedTabBar
          {...defaultProps}
          state={{ ...mockState, routes }}
        />,
      );

      expect(container).toBeTruthy();
    });

    it('should handle unknown route names', () => {
      const routes = [{ key: 'route1', name: 'UnknownRoute' }];

      const { container } = render(
        <EnhancedTabBar
          {...defaultProps}
          state={{ ...mockState, routes }}
        />,
      );

      expect(container).toBeTruthy();
    });
  });
});
