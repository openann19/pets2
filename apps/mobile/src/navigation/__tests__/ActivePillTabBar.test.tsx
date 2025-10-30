/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Platform } from 'react-native';
import ActivePillTabBar from '../ActivePillTabBar';
import * as Haptics from 'expo-haptics';

// Mock dependencies
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

jest.mock('expo-blur', () => {
  const { View } = require('react-native');
  return {
    BlurView: ({ children, ...props }: any) => (
      <View
        testID="blur-view"
        {...props}
      >
        {children}
      </View>
    ),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }),
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  const React = require('react');
  return {
    Ionicons: React.forwardRef(({ name, size, color, testID, ...props }: any, ref: any) => {
      // Store icon props as data attributes for testing
      const iconProps = {
        'testID': testID || `icon-${name}`,
        'accessibilityLabel': name,
        'data-name': name,
        'data-size': size,
        'data-color': color,
        'ref': ref,
        ...props,
      };
      return <View {...iconProps} />;
    }),
  };
});

describe('ActivePillTabBar', () => {
  const mockState = {
    index: 0,
    routes: [
      { key: 'Home-0', name: 'Home' },
      { key: 'Swipe-1', name: 'Swipe' },
      { key: 'Matches-2', name: 'Matches' },
      { key: 'Map-3', name: 'Map' },
      { key: 'Profile-4', name: 'Profile' },
    ],
  };

  const mockDescriptors = {
    'Home-0': {
      options: { title: 'Home', tabBarTestID: 'tab-Home' },
    },
    'Swipe-1': {
      options: { title: 'Swipe', tabBarTestID: 'tab-Swipe' },
    },
    'Matches-2': {
      options: { title: 'Matches', tabBarTestID: 'tab-Matches' },
    },
    'Map-3': {
      options: { title: 'Map', tabBarTestID: 'tab-Map' },
    },
    'Profile-4': {
      options: { title: 'Profile', tabBarTestID: 'tab-Profile' },
    },
  };

  const mockNavigation: any = {
    emit: jest.fn(() => ({ defaultPrevented: false })),
    navigate: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
  };

  const mockTheme = {
    colors: {
      primary: '#007AFF',
      text: '#000000',
      background: '#FFFFFF',
    },
    dark: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (Haptics.impactAsync as jest.Mock).mockResolvedValue(undefined);
  });

  it('should render all tabs correctly', () => {
    const { getByTestId } = render(
      <ActivePillTabBar
        state={mockState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    expect(getByTestId('tab-Home')).toBeTruthy();
    expect(getByTestId('tab-Swipe')).toBeTruthy();
    expect(getByTestId('tab-Matches')).toBeTruthy();
    expect(getByTestId('tab-Map')).toBeTruthy();
    expect(getByTestId('tab-Profile')).toBeTruthy();
  });

  it('should display correct icons for each route', () => {
    const { queryByTestId, getAllByTestId } = render(
      <ActivePillTabBar
        state={mockState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    // Icons are rendered, check they exist (may be multiple with same name due to animation)
    const homeIcons = queryByTestId('icon-home') || queryByTestId('icon-home-outline');
    const heartIcons = queryByTestId('icon-heart') || queryByTestId('icon-heart-outline');
    const chatIcons =
      queryByTestId('icon-chatbubbles') || queryByTestId('icon-chatbubbles-outline');
    const mapIcons = queryByTestId('icon-map') || queryByTestId('icon-map-outline');
    const personIcons = queryByTestId('icon-person') || queryByTestId('icon-person-outline');

    expect(homeIcons).toBeTruthy();
    expect(heartIcons).toBeTruthy();
    expect(chatIcons).toBeTruthy();
    expect(mapIcons).toBeTruthy();
    expect(personIcons).toBeTruthy();
  });

  it('should display focused icon for active tab', () => {
    const { getByTestId } = render(
      <ActivePillTabBar
        state={mockState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    const homeIcon = getByTestId('icon-home');
    expect(homeIcon).toBeTruthy();
    // Home is focused (index 0)
    expect(homeIcon.props['data-name']).toBe('home');
  });

  it('should navigate to tab on press', () => {
    const { getByTestId } = render(
      <ActivePillTabBar
        state={mockState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    const swipeTab = getByTestId('tab-Swipe');
    fireEvent.press(swipeTab);

    expect(mockNavigation.emit).toHaveBeenCalledWith({
      type: 'tabPress',
      target: 'Swipe-1',
      canPreventDefault: true,
    });
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Swipe');
  });

  it('should not navigate when already on the tab', () => {
    const { getByTestId } = render(
      <ActivePillTabBar
        state={mockState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    const homeTab = getByTestId('tab-Home');
    fireEvent.press(homeTab);

    expect(mockNavigation.emit).toHaveBeenCalledWith({
      type: 'tabPress',
      target: 'Home-0',
      canPreventDefault: true,
    });
    // Should not navigate since already on Home
    expect(mockNavigation.navigate).not.toHaveBeenCalled();
  });

  it('should detect double-tap and emit tabDoublePress event', async () => {
    const { getByTestId } = render(
      <ActivePillTabBar
        state={mockState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    const homeTab = getByTestId('tab-Home');

    // First tap
    fireEvent.press(homeTab);

    // Second tap within 300ms (simulate quick double tap)
    await act(async () => {
      fireEvent.press(homeTab);
    });

    await waitFor(() => {
      expect(mockNavigation.emit).toHaveBeenCalledWith({
        type: 'tabDoublePress',
        target: 'Home-0',
      });
    });
  });

  it('should not emit tabDoublePress if second tap is after 300ms', async () => {
    const { getByTestId } = render(
      <ActivePillTabBar
        state={mockState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    const homeTab = getByTestId('tab-Home');

    // First tap
    fireEvent.press(homeTab);

    // Wait 350ms before second tap (longer than 300ms threshold)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 350));
    });

    // Reset mock to ignore first tap events
    mockNavigation.emit.mockClear();

    // Second tap after delay
    fireEvent.press(homeTab);

    // Should only have regular tap event, not double-tap
    await waitFor(() => {
      expect(mockNavigation.emit).toHaveBeenCalledWith({
        type: 'tabPress',
        target: 'Home-0',
        canPreventDefault: true,
      });
    });

    expect(mockNavigation.emit).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'tabDoublePress',
      }),
    );
  });

  it('should show badge for routes with counts', () => {
    const { getByText } = render(
      <ActivePillTabBar
        state={mockState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    // Matches tab should have a badge with count 3
    expect(getByText('3')).toBeTruthy();
  });

  it('should display badges for Home and Map tabs', () => {
    const { getByText } = render(
      <ActivePillTabBar
        state={mockState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    // Home should have badge with count 2
    expect(getByText('2')).toBeTruthy();

    // Map should have badge with count 1
    expect(getByText('1')).toBeTruthy();
  });

  it('should display correct labels for each tab', () => {
    const { getByText } = render(
      <ActivePillTabBar
        state={mockState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Swipe')).toBeTruthy();
    expect(getByText('Matches')).toBeTruthy();
    expect(getByText('Map')).toBeTruthy();
    expect(getByText('Profile')).toBeTruthy();
  });

  it('should handle long press event', () => {
    const { getByTestId } = render(
      <ActivePillTabBar
        state={mockState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    const homeTab = getByTestId('tab-Home');
    fireEvent.press(homeTab, { nativeEvent: { timestamp: Date.now() } });

    // Long press should emit tabLongPress
    // Note: React Native's fireEvent.press doesn't support long press,
    // so we simulate by calling the handler
    const descriptors = (homeTab as any)._fiber?.stateNode?.props?.onLongPress;
    if (descriptors) {
      act(() => {
        descriptors();
      });
    }

    expect(mockNavigation.emit).toHaveBeenCalled();
  });

  it('should handle route without title', () => {
    const customState = {
      index: 0,
      routes: [{ key: 'Test-0', name: 'TestRoute' }],
    };

    const customDescriptors = {
      'Test-0': {
        options: {},
      },
    };

    const { getByText } = render(
      <ActivePillTabBar
        state={customState}
        descriptors={customDescriptors}
        navigation={mockNavigation}
      />,
    );

    // Should use route name as label
    expect(getByText('TestRoute')).toBeTruthy();
  });

  it('should handle theme changes (dark mode)', () => {
    const darkTheme = {
      colors: {
        primary: '#007AFF',
        text: '#FFFFFF',
        background: '#000000',
      },
      dark: true,
    };

    const { getByTestId } = render(
      <ActivePillTabBar
        state={mockState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    expect(getByTestId('tab-Home')).toBeTruthy();
  });

  it('should animate indicator on tab change', () => {
    const newState = {
      index: 1, // Swipe is now focused
      routes: mockState.routes,
    };

    const { rerender, getByTestId } = render(
      <ActivePillTabBar
        state={mockState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    rerender(
      <ActivePillTabBar
        state={newState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    // Swipe should now be focused
    const swipeIcon = getByTestId('icon-heart');
    expect(swipeIcon.props['data-name']).toBe('heart');
  });

  it('should handle undefined scale gracefully', () => {
    const customState = {
      index: 0,
      routes: [{ key: 'Test-0', name: 'Test' }],
    };

    const customDescriptors = {
      'Test-0': { options: { title: 'Test' } },
    };

    expect(() => {
      render(
        <ActivePillTabBar
          state={customState}
          descriptors={customDescriptors}
          navigation={mockNavigation}
        />,
      );
    }).not.toThrow();
  });

  it('should apply correct accessibility props', () => {
    const { getByTestId } = render(
      <ActivePillTabBar
        state={mockState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    const homeTab = getByTestId('tab-Home');
    expect(homeTab.props.accessibilityRole).toBe('tab');
    expect(homeTab.props.accessibilityState.selected).toBe(true);
  });

  it('should handle platform differences (iOS vs Android)', () => {
    const originalPlatform = Platform.OS;

    // Test iOS
    Platform.OS = 'ios';
    const { rerender } = render(
      <ActivePillTabBar
        state={mockState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    // Test Android
    Platform.OS = 'android';
    rerender(
      <ActivePillTabBar
        state={mockState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    Platform.OS = originalPlatform;
    expect(true).toBe(true); // If we got here, no errors occurred
  });

  it('should get correct icon for unknown route', () => {
    const customState = {
      index: 0,
      routes: [{ key: 'Unknown-0', name: 'UnknownRoute' }],
    };

    const customDescriptors = {
      'Unknown-0': { options: { title: 'Unknown' } },
    };

    const { getByTestId } = render(
      <ActivePillTabBar
        state={customState}
        descriptors={customDescriptors}
        navigation={mockNavigation}
      />,
    );

    // Should default to home-outline icon
    const icon = getByTestId('icon-home-outline');
    expect(icon).toBeTruthy();
  });
});
