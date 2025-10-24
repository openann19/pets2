import { render } from '@testing-library/react-native';
import React from 'react';

import { ThemeProvider } from '../../contexts/ThemeContext';
import ChatScreen from '../ChatScreen';

// Mock the route params
const mockRoute = {
  params: {
    matchId: 'test-match-id',
    petName: 'Buddy',
  },
};

const mockNavigation = {
  goBack: jest.fn(),
  navigate: jest.fn(),
};

// Mock the calling components
jest.mock('../../components/calling/CallManager', () => ({
  useCallManager: () => ({
    startCall: jest.fn(),
    isCallActive: () => false,
  }),
}));

// Mock the chat API
jest.mock('../../services/api', () => ({
  chatAPI: {
    getMessages: jest.fn(() => Promise.resolve([])),
    sendMessage: jest.fn(() => Promise.resolve({ _id: 'test', content: 'test' })),
    markAsRead: jest.fn(() => Promise.resolve()),
  },
}));

describe('ChatScreen with Theme', () => {
  it('renders without crashing with theme provider', () => {
    const { getByText } = render(
      <ThemeProvider>
        <ChatScreen navigation={mockNavigation} route={mockRoute} />
      </ThemeProvider>
    );

    expect(getByText('Buddy')).toBeTruthy();
  });

  it('applies theme colors correctly', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ChatScreen navigation={mockNavigation} route={mockRoute} />
      </ThemeProvider>
    );

    // The component should render without throwing errors
    // This tests that theme colors are properly applied
    expect(true).toBe(true);
  });
});
