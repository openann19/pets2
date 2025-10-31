/**
 * Tests for MessageList with enhanced features (reactions, attachments, voice notes)
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { MessageList } from '../MessageList';
import type { Message } from '../../../hooks/useChatData';

// Mock MessageWithEnhancements
jest.mock('../MessageWithEnhancements', () => ({
  MessageWithEnhancements: ({ message }: { message: Message }) => {
    const React = require('react');
    return React.createElement('Text', { testID: 'enhanced-message' }, `Enhanced: ${message.content}`);
  },
}));

// Mock MessageItem
jest.mock('../MessageItem', () => ({
  MessageItem: ({ message }: { message: Message }) => {
    const React = require('react');
    return React.createElement('Text', { testID: 'regular-message' }, message.content);
  },
}));

describe('MessageList with Enhancements', () => {
  const mockMessages: Message[] = [
    {
      _id: 'msg1',
      content: 'Hello',
      senderId: 'user1',
      timestamp: new Date().toISOString(),
      read: true,
      type: 'text',
    },
    {
      _id: 'msg2',
      content: 'How are you?',
      senderId: 'user2',
      timestamp: new Date().toISOString(),
      read: true,
      type: 'text',
      reactions: { '❤️': 2, '👍': 1 },
    } as Message & { reactions?: Record<string, number> },
    {
      _id: 'msg3',
      content: 'Check this out',
      senderId: 'user1',
      timestamp: new Date().toISOString(),
      read: true,
      type: 'text',
      attachment: {
        type: 'image',
        url: 'https://example.com/image.jpg',
      },
    } as Message & { attachment?: { type: 'image' | 'video' | 'file'; url: string } },
  ];

  it('should use regular MessageItem for messages without enhancements', () => {
    const regularMessages = [mockMessages[0]];

    const { getByTestId } = render(
      <MessageList
        messages={regularMessages}
        typingUsers={[]}
        isOnline={true}
        currentUserId="user1"
        matchId="match1"
      />,
    );

    expect(getByTestId('regular-message')).toBeTruthy();
  });

  it('should use MessageWithEnhancements for messages with reactions', () => {
    const messagesWithReactions = [mockMessages[1]];

    const { getByTestId } = render(
      <MessageList
        messages={messagesWithReactions}
        typingUsers={[]}
        isOnline={true}
        currentUserId="user2"
        matchId="match1"
      />,
    );

    expect(getByTestId('enhanced-message')).toBeTruthy();
  });

  it('should use MessageWithEnhancements for messages with attachments', () => {
    const messagesWithAttachments = [mockMessages[2]];

    const { getByTestId } = render(
      <MessageList
        messages={messagesWithAttachments}
        typingUsers={[]}
        isOnline={true}
        currentUserId="user1"
        matchId="match1"
      />,
    );

    expect(getByTestId('enhanced-message')).toBeTruthy();
  });

  it('should mix regular and enhanced messages correctly', () => {
    const { getAllByTestId } = render(
      <MessageList
        messages={mockMessages}
        typingUsers={[]}
        isOnline={true}
        currentUserId="user1"
        matchId="match1"
      />,
    );

    // Should have 1 regular and 2 enhanced messages
    expect(getAllByTestId('regular-message')).toHaveLength(1);
    expect(getAllByTestId('enhanced-message')).toHaveLength(2);
  });
});

