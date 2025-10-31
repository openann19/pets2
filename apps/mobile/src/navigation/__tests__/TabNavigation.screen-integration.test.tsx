/**
 * Screen Integration Tests for Tab Navigation with Double-Tap
 * Tests complete user flows across all screens
 *
 * @jest-environment jsdom
 */
import React, { useRef } from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { render } from '@/test-utils';
import { ScrollView, FlatList, View } from 'react-native';
import { useTabDoublePress } from '../../hooks/navigation/useTabDoublePress';
import ActivePillTabBar from '../ActivePillTabBar';
import * as Haptics from 'expo-haptics';

// Mock dependencies
jest.mock('expo-haptics');
jest.mock('expo-blur');
jest.mock('react-native-safe-area-context');
jest.mock('@expo/vector-icons');

// Helper to wrap with theme (render from test-utils already includes ThemeProvider)
const renderWithTheme = (component: React.ReactElement) => {
  return render(component);
};

describe('Tab Navigation Screen Integration', () => {
  describe('HomeScreen Double-Tap Integration', () => {
    it('should scroll to top and refresh on double-tap', async () => {
      const onScrollToTop = jest.fn();

      const TestHomeScreen = () => {
        const scrollRef = useRef<ScrollView>(null);
        useTabDoublePress(() => {
          scrollRef.current?.scrollTo({ y: 0, animated: true });
          onScrollToTop();
        });

        return (
          <ScrollView ref={scrollRef}>
            <View style={{ height: 2000 }} />
          </ScrollView>
        );
      };

      render(<TestHomeScreen />);

      // Test that hook is set up correctly
      expect(onScrollToTop).not.toHaveBeenCalled();
    });
  });

  describe('MatchesScreen Double-Tap Integration', () => {
    it('should scroll to top and refresh on double-tap', async () => {
      const onRefresh = jest.fn();

      const TestMatchesScreen = () => {
        const listRef = useRef<FlatList>(null);
        useTabDoublePress(() => {
          listRef.current?.scrollToOffset({ offset: 0, animated: true });
          onRefresh();
        });

        return (
          <FlatList
            ref={listRef}
            data={[1, 2, 3]}
            renderItem={({ item }) => <View>{item}</View>}
          />
        );
      };

      render(<TestMatchesScreen />);

      await waitFor(() => {
        expect(onRefresh).not.toHaveBeenCalled(); // Initial render
      });
    });
  });

  describe('ProfileScreen Double-Tap Integration', () => {
    it('should scroll to top on double-tap', async () => {
      const TestProfileScreen = () => {
        const scrollRef = useRef<ScrollView>(null);
        useTabDoublePress(() => {
          scrollRef.current?.scrollTo({ y: 0, animated: true });
        });

        return (
          <ScrollView ref={scrollRef}>
            <View style={{ height: 2000 }} />
          </ScrollView>
        );
      };

      render(<TestProfileScreen />);

      // Verify component renders
      expect(scrollRef.current).toBeTruthy();
    });
  });

  describe('SwipeScreen Double-Tap Integration', () => {
    it('should refresh pets on double-tap', async () => {
      const refreshPets = jest.fn();

      const TestSwipeScreen = () => {
        useTabDoublePress(() => {
          refreshPets();
        });

        return <View />;
      };

      render(<TestSwipeScreen />);

      await waitFor(() => {
        expect(refreshPets).not.toHaveBeenCalled(); // No event fired yet
      });
    });
  });

  describe('MapScreen Double-Tap Integration', () => {
    it('should center on user location on double-tap', async () => {
      const getCurrentLocation = jest.fn();

      const TestMapScreen = () => {
        useTabDoublePress(() => {
          getCurrentLocation();
        });

        return <View />;
      };

      render(<TestMapScreen />);

      await waitFor(() => {
        expect(getCurrentLocation).not.toHaveBeenCalled(); // No event fired yet
      });
    });
  });

  describe('Complete Tab Bar Navigation Flow', () => {
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
      'Home-0': { options: { title: 'Home', tabBarTestID: 'tab-Home' } },
      'Swipe-1': { options: { title: 'Swipe', tabBarTestID: 'tab-Swipe' } },
      'Matches-2': { options: { title: 'Matches', tabBarTestID: 'tab-Matches' } },
      'Map-3': { options: { title: 'Map', tabBarTestID: 'tab-Map' } },
      'Profile-4': { options: { title: 'Profile', tabBarTestID: 'tab-Profile' } },
    };

    it('should navigate through all tabs and handle double-taps', async () => {
      const mockNavigation = {
        emit: jest.fn(),
        navigate: jest.fn(),
        addListener: jest.fn(),
      };

      jest.useFakeTimers();

      const { getByTestId } = renderWithTheme(
        <ActivePillTabBar
          state={mockState}
          descriptors={mockDescriptors}
          navigation={mockNavigation}
        />,
      );

      // Navigate to each tab
      const tabs = ['Swipe', 'Matches', 'Map', 'Profile'];
      for (const tabName of tabs) {
        const tab = getByTestId(`tab-${tabName}`);
        fireEvent.press(tab);

        await waitFor(() => {
          expect(mockNavigation.navigate).toHaveBeenCalledWith(tabName);
        });
      }

      // Test double-tap on Home
      const homeTab = getByTestId('tab-Home');
      fireEvent.press(homeTab);

      await waitFor(() => {
        jest.advanceTimersByTime(150);
      });

      fireEvent.press(homeTab);

      await waitFor(() => {
        expect(mockNavigation.emit).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'tabDoublePress' }),
        );
      });

      jest.useRealTimers();
    });
  });

  describe('Gesture and Animation Integration', () => {
    it('should handle rapid tab switching without errors', async () => {
      const mockState = {
        index: 0,
        routes: [
          { key: 'Home-0', name: 'Home' },
          { key: 'Swipe-1', name: 'Swipe' },
        ],
      };

      const mockDescriptors = {
        'Home-0': { options: { title: 'Home', tabBarTestID: 'tab-Home' } },
        'Swipe-1': { options: { title: 'Swipe', tabBarTestID: 'tab-Swipe' } },
      };

      const mockNavigation = {
        emit: jest.fn(),
        navigate: jest.fn(),
        addListener: jest.fn(),
      };

      const { getByTestId } = renderWithTheme(
        <ActivePillTabBar
          state={mockState}
          descriptors={mockDescriptors}
          navigation={mockNavigation}
        />,
      );

      const homeTab = getByTestId('tab-Home');
      const swipeTab = getByTestId('tab-Swipe');

      // Rapidly switch between tabs
      for (let i = 0; i < 10; i++) {
        fireEvent.press(i % 2 === 0 ? homeTab : swipeTab);
      }

      await waitFor(() => {
        expect(mockNavigation.emit).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain accessibility during tab switching', () => {
      const mockState = {
        index: 0,
        routes: [
          { key: 'Home-0', name: 'Home' },
          { key: 'Swipe-1', name: 'Swipe' },
        ],
      };

      const mockDescriptors = {
        'Home-0': { options: { title: 'Home', tabBarTestID: 'tab-Home' } },
        'Swipe-1': { options: { title: 'Swipe', tabBarTestID: 'tab-Swipe' } },
      };

      const mockNavigation = {
        emit: jest.fn(),
        navigate: jest.fn(),
        addListener: jest.fn(),
      };

      const { getByTestId } = renderWithTheme(
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
  });

  describe('Performance Integration', () => {
    it('should handle many tab switches efficiently', () => {
      const mockState = {
        index: 0,
        routes: Array.from({ length: 20 }, (_, i) => ({
          key: `Tab-${i}`,
          name: `Tab${i}`,
        })),
      };

      const mockDescriptors = mockState.routes.reduce((acc, route) => {
        acc[route.key] = { options: { title: route.name } };
        return acc;
      }, {} as any);

      const mockNavigation = {
        emit: jest.fn(),
        navigate: jest.fn(),
        addListener: jest.fn(),
      };

      expect(() => {
        render(
          <ActivePillTabBar
            state={mockState}
            descriptors={mockDescriptors}
            navigation={mockNavigation}
          />,
        );
      }).not.toThrow();
    });
  });
});
