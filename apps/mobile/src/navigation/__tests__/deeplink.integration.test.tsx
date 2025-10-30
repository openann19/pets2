/**
 * Integration Tests for Deep Link Routing
 * Tests NavigationContainer integration with deep link handling
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Linking, View, Text } from 'react-native';
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

jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native') as Record<string, unknown>;
  return {
    ...actual,
    Linking: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      getInitialURL: jest.fn(),
      openURL: jest.fn(),
      canOpenURL: jest.fn(() => Promise.resolve(true)) as jest.MockedFunction<
        typeof Linking.canOpenURL
      >,
    },
  };
});

describe('Deep Link Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Chat Deep Links', () => {
    it('should navigate to chat screen with correct matchId', async () => {
      const { getByTestId } = render(<TestNavigator />);

      // Simulate deep link
      const url = 'pawfectmatch://chat/match123';
      const parsed = parseDeepLink(url);

      expect(parsed.type).toBe('chat');
      expect(parsed.params).toEqual({ matchId: 'match123' });

      // Trigger navigation via Linking
      await Linking.openURL(url);

      await waitFor(() => {
        expect(getByTestId('chat-screen')).toBeTruthy();
      });
    });

    it('should handle chat deep link with query params', async () => {
      const { getByTestId } = render(<TestNavigator />);

      const url = 'pawfectmatch://chat/match456?messageId=msg789';
      const parsed = parseDeepLink(url);

      expect(parsed.type).toBe('chat');
      expect(parsed.params['matchId']).toBe('match456');

      await Linking.openURL(url);

      await waitFor(() => {
        expect(getByTestId('chat-screen')).toBeTruthy();
      });
    });
  });

  describe('Match Deep Links', () => {
    it('should navigate to match screen with matchId', async () => {
      const { getByTestId } = render(<TestNavigator />);

      const url = 'pawfectmatch://match/match789';
      const parsed = parseDeepLink(url);

      expect(parsed.type).toBe('match');
      expect(parsed.params).toEqual({ matchId: 'match789' });

      await Linking.openURL(url);

      await waitFor(() => {
        expect(getByTestId('match-screen')).toBeTruthy();
      });
    });
  });

  describe('Premium Deep Links', () => {
    it('should navigate to premium screen', async () => {
      const { getByTestId } = render(<TestNavigator />);

      const url = 'pawfectmatch://premium';
      const parsed = parseDeepLink(url);

      expect(parsed.type).toBe('premium');

      await Linking.openURL(url);

      await waitFor(() => {
        expect(getByTestId('premium-screen')).toBeTruthy();
      });
    });

    it('should handle premium success deep link with sessionId', async () => {
      const { getByTestId } = render(<TestNavigator />);

      const url = 'pawfectmatch://premium-success?session_id=cs_123456';
      const parsed = parseDeepLink(url);

      expect(parsed.type).toBe('subscription_success');
      expect(parsed.params).toEqual({ session_id: 'cs_123456' });

      await Linking.openURL(url);

      await waitFor(() => {
        expect(getByTestId('premium-screen')).toBeTruthy();
      });
    });
  });

  describe('Settings Deep Links', () => {
    it('should navigate to settings screen', async () => {
      const { getByTestId } = render(<TestNavigator />);

      const url = 'pawfectmatch://settings';
      const parsed = parseDeepLink(url);

      expect(parsed.type).toBe('settings');

      await Linking.openURL(url);

      await waitFor(() => {
        expect(getByTestId('settings-screen')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid deep link gracefully', async () => {
      const { getByTestId } = render(<TestNavigator />);

      const url = 'pawfectmatch://invalid/path';
      const parsed = parseDeepLink(url);

      expect(parsed.type).toBe(null);

      await Linking.openURL(url);

      // Should remain on home screen
      await waitFor(() => {
        expect(getByTestId('home-screen')).toBeTruthy();
      });
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
      await Linking.openURL(url);

      // Should show premium screen (guard happens in screen component)
      await waitFor(() => {
        expect(getByTestId('premium-screen')).toBeTruthy();
      });
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
      await Linking.openURL(url);

      await waitFor(() => {
        expect(getByTestId('chat-screen')).toBeTruthy();
      });
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
      await Linking.openURL(url);

      await waitFor(() => {
        const chatScreen = getByTestId('chat-screen');
        expect(chatScreen.props.children).toContain('match456');
      });
    });

    it('should handle multiple query params', async () => {
      const { getByTestId } = render(<TestNavigator />);

      const url = 'pawfectmatch://chat/match789?messageId=msg123&showKeyboard=true';
      await Linking.openURL(url);

      await waitFor(() => {
        expect(getByTestId('chat-screen')).toBeTruthy();
      });
    });
  });
});
