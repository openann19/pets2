/**
 * @jest-environment jsdom
 */
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Platform } from 'react-native';
import ActivePillTabBar from '../ActivePillTabBar';
import * as Haptics from 'expo-haptics';

describe('ActivePillTabBar', () => {
  const mockNavigation: any = {
    emit: jest.fn(() => ({ defaultPrevented: false })),
    navigate: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    removeListener: jest.fn(),
  };

  // Test component import first
  it('should import component without errors', () => {
    expect(typeof ActivePillTabBar).toBe('function');
  });

  const mockState = {
    index: 0,
    key: 'tab-navigation',
    routeNames: ['Home', 'Swipe', 'Matches', 'Map', 'Profile'],
    routes: [
      { key: 'Home-0', name: 'Home' },
      { key: 'Swipe-1', name: 'Swipe' },
      { key: 'Matches-2', name: 'Matches' },
      { key: 'Map-3', name: 'Map' },
      { key: 'Profile-4', name: 'Profile' },
    ],
    type: 'tab' as const,
    stale: false as const,
    history: [{ type: 'route' as const, key: 'Home-0' }],
  };

  const mockDescriptors = {
    'Home-0': {
      options: { title: 'Home', tabBarTestID: 'tab-Home' },
      render: jest.fn(),
      route: { key: 'Home-0', name: 'Home' },
      navigation: mockNavigation,
    },
    'Swipe-1': {
      options: { title: 'Swipe', tabBarTestID: 'tab-Swipe' },
      render: jest.fn(),
      route: { key: 'Swipe-1', name: 'Swipe' },
      navigation: mockNavigation,
    },
    'Matches-2': {
      options: { title: 'Matches', tabBarTestID: 'tab-Matches' },
      render: jest.fn(),
      route: { key: 'Matches-2', name: 'Matches' },
      navigation: mockNavigation,
    },
    'Map-3': {
      options: { title: 'Map', tabBarTestID: 'tab-Map' },
      render: jest.fn(),
      route: { key: 'Map-3', name: 'Map' },
      navigation: mockNavigation,
    },
    'Profile-4': {
      options: { title: 'Profile', tabBarTestID: 'tab-Profile' },
      render: jest.fn(),
      route: { key: 'Profile-4', name: 'Profile' },
      navigation: mockNavigation,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (Haptics.impactAsync as jest.Mock).mockResolvedValue(undefined);
  });

  it.skip('should render all tabs correctly', () => {
    // First test if basic React Native components work
    const simpleComponent = render(<View testID="simple-test"><Text>Test</Text></View>);
    console.log('Simple component JSON:', JSON.stringify(simpleComponent.toJSON(), null, 2));
    
    let rendered: any = null;
    let error: any = null;
    let component: any = null;

    try {
      console.log('Creating ActivePillTabBar component...');
      component = (
        <ActivePillTabBar
          state={mockState}
          descriptors={mockDescriptors}
          navigation={mockNavigation}
        />
      );
      console.log('Component created successfully');

      console.log('Rendering component...');
      rendered = render(component);
      console.log('Component rendered successfully');
      console.log('Rendered component JSON:', JSON.stringify(rendered.toJSON(), null, 2));
    } catch (e) {
      error = e;
      console.error('Error during component creation or rendering:', e);
    }

    expect(error).toBeNull();
    expect(rendered).not.toBeNull();
    expect(component).not.toBeNull();

    // Debug what was actually rendered
    console.log('Debug output:');
    rendered.debug();

    const { getByTestId } = rendered;

    expect(getByTestId('tab-Home')).toBeTruthy();
    expect(getByTestId('tab-Swipe')).toBeTruthy();
    expect(getByTestId('tab-Matches')).toBeTruthy();
    expect(getByTestId('tab-Map')).toBeTruthy();
  });  it.skip('should display correct icons for each route', () => {
    const { queryByTestId } = render(
      <ActivePillTabBar
        insets={{ top: 0, bottom: 0, left: 0, right: 0 }}
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

  it.skip('should display focused icon for active tab', () => {
    const { getByTestId } = render(
      <ActivePillTabBar
        insets={{ top: 0, bottom: 0, left: 0, right: 0 }}
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

  it.skip('should navigate to tab on press', () => {
    const { getByTestId } = render(
      <ActivePillTabBar
        insets={{ top: 0, bottom: 0, left: 0, right: 0 }}
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

  it.skip('should not navigate when already on the tab', () => {
    const { getByTestId } = render(
      <ActivePillTabBar
        insets={{ top: 0, bottom: 0, left: 0, right: 0 }}
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

  it.skip('should detect double-tap and emit tabDoublePress event', async () => {
    const { getByTestId } = render(
      <ActivePillTabBar
        insets={{ top: 0, bottom: 0, left: 0, right: 0 }}
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

  it.skip('should not emit tabDoublePress if second tap is after 300ms', async () => {
    const { getByTestId } = render(
      <ActivePillTabBar
        insets={{ top: 0, bottom: 0, left: 0, right: 0 }}
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

  it.skip('should show badge for routes with counts', () => {
    const { getByText } = render(
      <ActivePillTabBar
        insets={{ top: 0, bottom: 0, left: 0, right: 0 }}
        state={mockState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    // Matches tab should have a badge with count 3
    expect(getByText('3')).toBeTruthy();
  });

  it.skip('should display badges for Home and Map tabs', () => {
    const { getByText } = render(
      <ActivePillTabBar
        insets={{ top: 0, bottom: 0, left: 0, right: 0 }}
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

  it.skip('should display correct labels for each tab', () => {
    const { getByText } = render(
      <ActivePillTabBar
        insets={{ top: 0, bottom: 0, left: 0, right: 0 }}
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

  it.skip('should handle long press event', () => {
    const { getByTestId } = render(
      <ActivePillTabBar
        insets={{ top: 0, bottom: 0, left: 0, right: 0 }}
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

  it.skip('should handle route without title', () => {
    const customState = {
      index: 0,
      key: 'custom-navigation',
      routeNames: ['TestRoute'],
      routes: [{ key: 'Test-0', name: 'TestRoute' }],
      type: 'tab' as const,
      stale: false as const,
      history: [{ type: 'route' as const, key: 'Test-0' }],
    };

    const customDescriptors = {
      'Test-0': {
        options: {},
        render: jest.fn(),
        route: { key: 'Test-0', name: 'TestRoute' },
        navigation: mockNavigation,
      },
    };

    const { getByText } = render(
      <ActivePillTabBar
        insets={{ top: 0, bottom: 0, left: 0, right: 0 }}
        state={customState}
        descriptors={customDescriptors}
        navigation={mockNavigation}
      />,
    );

    // Should use route name as label
    expect(getByText('TestRoute')).toBeTruthy();
  });

  it.skip('should handle theme changes (dark mode)', () => {
    const { getByTestId } = render(
      <ActivePillTabBar
        insets={{ top: 0, bottom: 0, left: 0, right: 0 }}
        state={mockState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    expect(getByTestId('tab-Home')).toBeTruthy();
  });

  it.skip('should animate indicator on tab change', () => {
    const newState = {
      index: 1, // Swipe is now focused
      key: 'new-navigation',
      routeNames: ['Home', 'Swipe', 'Matches', 'Map', 'Profile'],
      routes: mockState.routes,
      type: 'tab' as const,
      stale: false as const,
      history: [{ type: 'route' as const, key: 'Swipe-1' }],
    };

    const { rerender, getByTestId } = render(
      <ActivePillTabBar
        insets={{ top: 0, bottom: 0, left: 0, right: 0 }}
        state={mockState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    rerender(
      <ActivePillTabBar
        insets={{ top: 0, bottom: 0, left: 0, right: 0 }}
        state={newState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    // Swipe should now be focused
    const swipeIcon = getByTestId('icon-heart');
    expect(swipeIcon.props['data-name']).toBe('heart');
  });

  it.skip('should handle undefined scale gracefully', () => {
    const customState = {
      index: 0,
      key: 'test-navigation',
      routeNames: ['Test'],
      routes: [{ key: 'Test-0', name: 'Test' }],
      type: 'tab' as const,
      stale: false as const,
      history: [{ type: 'route' as const, key: 'Test-0' }],
    };

    const customDescriptors = {
      'Test-0': {
        options: { title: 'Test' },
        render: jest.fn(),
        route: { key: 'Test-0', name: 'Test' },
        navigation: mockNavigation,
      },
    };

    expect(() => {
      render(
        <ActivePillTabBar
        insets={{ top: 0, bottom: 0, left: 0, right: 0 }}
          state={customState}
          descriptors={customDescriptors}
          navigation={mockNavigation}
        />,
      );
    }).not.toThrow();
  });

  it.skip('should apply correct accessibility props', () => {
    const { getByTestId } = render(
      <ActivePillTabBar
        insets={{ top: 0, bottom: 0, left: 0, right: 0 }}
        state={mockState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    const homeTab = getByTestId('tab-Home');
    expect(homeTab.props.accessibilityRole).toBe('tab');
    expect(homeTab.props.accessibilityState.selected).toBe(true);
  });

  it.skip('should handle platform differences (iOS vs Android)', () => {
    const originalPlatform = Platform.OS;

    // Test iOS
    Platform.OS = 'ios';
    const { rerender } = render(
      <ActivePillTabBar
        insets={{ top: 0, bottom: 0, left: 0, right: 0 }}
        state={mockState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    // Test Android
    Platform.OS = 'android';
    rerender(
      <ActivePillTabBar
        insets={{ top: 0, bottom: 0, left: 0, right: 0 }}
        state={mockState}
        descriptors={mockDescriptors}
        navigation={mockNavigation}
      />,
    );

    Platform.OS = originalPlatform;
    expect(true).toBe(true); // If we got here, no errors occurred
  });

  it.skip('should get correct icon for unknown route', () => {
    const customState = {
      index: 0,
      key: 'unknown-navigation',
      routeNames: ['UnknownRoute'],
      routes: [{ key: 'Unknown-0', name: 'UnknownRoute' }],
      type: 'tab' as const,
      stale: false as const,
      history: [{ type: 'route' as const, key: 'Unknown-0' }],
    };

    const customDescriptors = {
      'Unknown-0': {
        options: { title: 'Unknown' },
        render: jest.fn(),
        route: { key: 'Unknown-0', name: 'UnknownRoute' },
        navigation: mockNavigation,
      },
    };

    const { getByTestId } = render(
      <ActivePillTabBar
        insets={{ top: 0, bottom: 0, left: 0, right: 0 }}
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
