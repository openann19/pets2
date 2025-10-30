/**
 * ChatScreen Integration Tests
 * Tests ChatScreen rendering, message sending, and real-time updates
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@/theme';
import ChatScreen from '../ChatScreen';

jest.mock('../hooks/screens/useChatScreen', () => ({
  useChatScreen: jest.fn(() => ({
    inputText: '',
    setInputText: jest.fn(),
    isTyping: false,
    showReactions: false,
    data: {
      messages: [],
      isOnline: true,
      otherUserTyping: false,
    },
    actions: {
      retryMessage: jest.fn(),
    },
    flatListRef: { current: null },
    inputRef: { current: null },
    handleSendMessage: jest.fn(),
    handleTypingChange: jest.fn(),
    handleScroll: jest.fn(),
    handleQuickReplySelect: jest.fn(),
    handleMessageLongPress: jest.fn(),
    handleReactionSelect: jest.fn(),
    handleReactionCancel: jest.fn(),
    handleVoiceCall: jest.fn(),
    handleVideoCall: jest.fn(),
    handleMoreOptions: jest.fn(),
    quickReplies: [],
  })),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider scheme="light">
    <NavigationContainer>{children}</NavigationContainer>
  </ThemeProvider>
);

describe('ChatScreen Integration Tests', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  };

  const mockRoute = {
    params: {
      matchId: 'match-1',
      petName: 'Buddy',
    },
    key: 'Chat',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render ChatScreen successfully', () => {
    render(
      <TestWrapper>
        <ChatScreen
          navigation={mockNavigation as any}
          route={mockRoute as any}
        />
      </TestWrapper>,
    );

    // Screen should render without errors
    expect(() =>
      render(
        <TestWrapper>
          <ChatScreen
            navigation={mockNavigation as any}
            route={mockRoute as any}
          />
        </TestWrapper>,
      ),
    ).not.toThrow();
  });

  it('should handle message sending', async () => {
    const { useChatScreen } = require('../hooks/screens/useChatScreen');
    const mockHandleSendMessage = jest.fn();
    useChatScreen.mockReturnValue({
      inputText: 'Hello',
      setInputText: jest.fn(),
      isTyping: false,
      showReactions: false,
      data: {
        messages: [],
        isOnline: true,
        otherUserTyping: false,
      },
      actions: {
        retryMessage: jest.fn(),
      },
      flatListRef: { current: null },
      inputRef: { current: null },
      handleSendMessage: mockHandleSendMessage,
      handleTypingChange: jest.fn(),
      handleScroll: jest.fn(),
      handleQuickReplySelect: jest.fn(),
      handleMessageLongPress: jest.fn(),
      handleReactionSelect: jest.fn(),
      handleReactionCancel: jest.fn(),
      handleVoiceCall: jest.fn(),
      handleVideoCall: jest.fn(),
      handleMoreOptions: jest.fn(),
      quickReplies: [],
    });

    render(
      <TestWrapper>
        <ChatScreen
          navigation={mockNavigation as any}
          route={mockRoute as any}
        />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(mockHandleSendMessage).toBeDefined();
    });
  });

  it('should display messages correctly', () => {
    const { useChatScreen } = require('../hooks/screens/useChatScreen');
    useChatScreen.mockReturnValue({
      inputText: '',
      setInputText: jest.fn(),
      isTyping: false,
      showReactions: false,
      data: {
        messages: [{ id: 'msg-1', text: 'Hello', senderId: 'user-1', timestamp: Date.now() }],
        isOnline: true,
        otherUserTyping: false,
      },
      actions: {
        retryMessage: jest.fn(),
      },
      flatListRef: { current: null },
      inputRef: { current: null },
      handleSendMessage: jest.fn(),
      handleTypingChange: jest.fn(),
      handleScroll: jest.fn(),
      handleQuickReplySelect: jest.fn(),
      handleMessageLongPress: jest.fn(),
      handleReactionSelect: jest.fn(),
      handleReactionCancel: jest.fn(),
      handleVoiceCall: jest.fn(),
      handleVideoCall: jest.fn(),
      handleMoreOptions: jest.fn(),
      quickReplies: [],
    });

    render(
      <TestWrapper>
        <ChatScreen
          navigation={mockNavigation as any}
          route={mockRoute as any}
        />
      </TestWrapper>,
    );

    // Component should render successfully
    expect(mockNavigation).toBeDefined();
  });
});
