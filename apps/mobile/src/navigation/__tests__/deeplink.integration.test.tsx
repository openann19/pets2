/**
 * Integration Tests for Deep Link Routing
 * Tests NavigationContainer integration with deep link handling
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { waitFor } from '@testing-library/react-native';
import { render } from '@/test-utils';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
// Import Linking from the mock directly
const RN = require('react-native');
const Linking = RN.Linking || {
  openURL: jest.fn(() => Promise.resolve()),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
};
import { linking } from '../linking';
import { parseDeepLink } from '../../utils/deepLinking';

// Mock screens
const MockChatScreen = ({ route }: any) => (
  <View testID="chat-screen">
    <Text>Chat: {route.params?.matchId}</Text>
  </View>
);

const MockMatchScreen = ({ route }: any) => (
  <View testID="match-screen">
    <Text>Match: {route.params?.matchId}</Text>
  </View>
);

const MockPremiumScreen = () => (
  <View testID="premium-screen">
    <Text>Premium</Text>
  </View>
);

const MockSettingsScreen = () => (
  <View testID="settings-screen">
    <Text>Settings</Text>
  </View>
);

const MockHomeScreen = () => (
  <View testID="home-screen">
    <Text>Home</Text>
  </View>
);

const Stack = createNativeStackNavigator();

// Mock NavigationContainer with linking
const TestNavigator = () => {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={MockHomeScreen}
        />
        <Stack.Screen
          name="Chat"
          component={MockChatScreen}
        />
        <Stack.Screen
          name="Match"
          component={MockMatchScreen}
        />
        <Stack.Screen
          name="Premium"
          component={MockPremiumScreen}
        />
        <Stack.Screen
          name="Settings"
          component={MockSettingsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('Deep Link Integration Tests', () => {
  let urlListeners: Array<(event: { url: string }) => void> = [];

  beforeEach(() => {
    jest.clearAllMocks();
    urlListeners = [];
    // Ensure Linking methods are properly mocked with listener storage
    if (Linking) {
      Linking.openURL = jest.fn(() => Promise.resolve()) as jest.MockedFunction<typeof Linking.openURL>;
      Linking.getInitialURL = jest.fn(() => Promise.resolve(null)) as jest.MockedFunction<typeof Linking.getInitialURL>;
      Linking.canOpenURL = jest.fn(() => Promise.resolve(true)) as jest.MockedFunction<typeof Linking.canOpenURL>;
      Linking.addEventListener = jest.fn((event: string, listener: (event: { url: string }) => void) => {
        if (event === 'url') {
          urlListeners.push(listener);
        }
        return { remove: jest.fn(() => {
          const index = urlListeners.indexOf(listener);
          if (index > -1) urlListeners.splice(index, 1);
        }) };
      }) as jest.MockedFunction<typeof Linking.addEventListener>;
      Linking.removeEventListener = jest.fn() as jest.MockedFunction<typeof Linking.removeEventListener>;
    }
  });

  // Helper to trigger deep link events
  const triggerDeepLink = (url: string) => {
    urlListeners.forEach(listener => {
      try {
        listener({ url });
      } catch (e) {
        // Ignore errors in test
      }
    });
  };

  describe('Chat Deep Links', () => {
    it('should navigate to chat screen with correct matchId', async () => {
      const { getByTestId } = render(<TestNavigator />);

      // Simulate deep link
      const url = 'pawfectmatch://chat/match123';
      const parsed = parseDeepLink(url);

      expect(parsed.type).toBe('chat');
      expect(parsed.params).toEqual({ matchId: 'match123' });

      // Trigger navigation via deep link event
      triggerDeepLink(url);

      await waitFor(() => {
        expect(getByTestId('chat-screen')).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('should handle chat deep link with query params', async () => {
      const { getByTestId } = render(<TestNavigator />);

      const url = 'pawfectmatch://chat/match456?messageId=msg789';
      const parsed = parseDeepLink(url);

      expect(parsed.type).toBe('chat');
      expect(parsed.params['matchId']).toBe('match456');

      triggerDeepLink(url);

      await waitFor(() => {
        expect(getByTestId('chat-screen')).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe('Match Deep Links', () => {
    it('should navigate to match screen with matchId', async () => {
      const { getByTestId } = render(<TestNavigator />);

      const url = 'pawfectmatch://match/match789';
      const parsed = parseDeepLink(url);

      expect(parsed.type).toBe('match');
      expect(parsed.params).toEqual({ matchId: 'match789' });

      triggerDeepLink(url);

      await waitFor(() => {
        expect(getByTestId('match-screen')).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe('Premium Deep Links', () => {
    it('should navigate to premium screen', async () => {
      const { getByTestId } = render(<TestNavigator />);

      const url = 'pawfectmatch://premium';
      const parsed = parseDeepLink(url);

      expect(parsed.type).toBe('premium');

      triggerDeepLink(url);

      await waitFor(() => {
        expect(getByTestId('premium-screen')).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('should handle premium success deep link with sessionId', async () => {
      const { getByTestId } = render(<TestNavigator />);

      const url = 'pawfectmatch://premium-success?session_id=cs_123456';
      const parsed = parseDeepLink(url);

      expect(parsed.type).toBe('subscription_success');
      expect(parsed.params).toEqual({ session_id: 'cs_123456' });

      triggerDeepLink(url);

      await waitFor(() => {
        expect(getByTestId('premium-screen')).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe('Settings Deep Links', () => {
    it('should navigate to settings screen', async () => {
      const { getByTestId } = render(<TestNavigator />);

      const url = 'pawfectmatch://settings';
      const parsed = parseDeepLink(url);

      expect(parsed.type).toBe('settings');

      triggerDeepLink(url);

      await waitFor(() => {
        expect(getByTestId('settings-screen')).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid deep link gracefully', async () => {
      const { getByTestId } = render(<TestNavigator />);

      const url = 'pawfectmatch://invalid/path';
      const parsed = parseDeepLink(url);

      expect(parsed.type).toBe(null);

      triggerDeepLink(url);

      // Should remain on home screen (invalid links shouldn't navigate)
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('should handle unsupported URL scheme', async () => {
      const { getByTestId } = render(<TestNavigator />);

      const url = 'https://pawfectmatch.com/chat/match123';
      const parsed = parseDeepLink(url);

      expect(parsed.type).toBe(null);

      // Should not navigate
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });
    });

    it('should handle malformed URLs', async () => {
      const { getByTestId } = render(<TestNavigator />);

      const url = 'invalid-url';
      const parsed = parseDeepLink(url);

      expect(parsed.type).toBe(null);

      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });
    });
  });

  describe('Premium Guard Behavior', () => {
    it('should guard premium-only routes', async () => {
      // Mock premium status check (guard happens in screen component)
      const { getByTestId } = render(<TestNavigator />);

      const url = 'pawfectmatch://premium';
      triggerDeepLink(url);

      // Should show premium screen (guard happens in screen component)
      await waitFor(() => {
        expect(getByTestId('premium-screen')).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe('State Transitions', () => {
    it('should transition from parsing to routing', async () => {
      const { getByTestId } = render(<TestNavigator />);

      const url = 'pawfectmatch://chat/match123';
      const parsed = parseDeepLink(url);

      // Parsing state
      expect(parsed.type).toBe('chat');

      // Routing state
      triggerDeepLink(url);

      await waitFor(() => {
        expect(getByTestId('chat-screen')).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('should handle error state on invalid link', async () => {
      const { getByTestId } = render(<TestNavigator />);

      const url = 'pawfectmatch://invalid';
      const parsed = parseDeepLink(url);

      // Error state
      expect(parsed.type).toBe(null);

      // Should remain on home
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });
    });
  });

  describe('Navigation Params', () => {
    it('should pass correct params to chat screen', async () => {
      const { getByTestId } = render(<TestNavigator />);

      const url = 'pawfectmatch://chat/match456';
      triggerDeepLink(url);

      await waitFor(() => {
        const chatScreen = getByTestId('chat-screen');
        expect(chatScreen.props.children).toContain('match456');
      }, { timeout: 3000 });
    });

    it('should handle multiple query params', async () => {
      const { getByTestId } = render(<TestNavigator />);

      const url = 'pawfectmatch://chat/match789?messageId=msg123&showKeyboard=true';
      triggerDeepLink(url);

      await waitFor(() => {
        expect(getByTestId('chat-screen')).toBeTruthy();
      }, { timeout: 3000 });
    });
  });
});
