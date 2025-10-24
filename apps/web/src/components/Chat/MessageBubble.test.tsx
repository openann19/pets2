import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

import type { Message, User } from '../../types';

import MessageBubble from './MessageBubble';

const mockUser: User = {
  _id: 'user1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-01',
  age: 30,
  location: { type: 'Point', coordinates: [0, 0] },
  preferences: {
    maxDistance: 50,
    ageRange: { min: 0, max: 20 },
    species: [],
    intents: [],
    notifications: { email: true, push: true, matches: true, messages: true }
  },
  premium: {
    isActive: false,
    plan: 'basic',
    features: { unlimitedLikes: false, boostProfile: false, seeWhoLiked: false, advancedFilters: false }
  },
  pets: [],
  analytics: { totalSwipes: 0, totalLikes: 0, totalMatches: 0, profileViews: 0, lastActive: '' },
  isEmailVerified: true,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockMessage: Message = {
  _id: 'msg1',
  sender: mockUser,
  content: 'Hello, world!',
  messageType: 'text',
  sentAt: new Date().toISOString(),
  readBy: [{ user: 'user2', readAt: new Date().toISOString() }],
  isEdited: false,
  isDeleted: false,
};

describe('MessageBubble Component', () => {
  it('renders text message correctly', () => {
    render(
      <MessageBubble
        message={mockMessage}
        isOwnMessage={false}
        currentUser={mockUser}
      />
    );

    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows avatar for other user messages', () => {
    render(
      <MessageBubble
        message={mockMessage}
        isOwnMessage={false}
        currentUser={mockUser}
      />
    );

    const avatar = screen.getByText('J');
    expect(avatar).toBeInTheDocument();
  });

  it('does not show avatar for own messages', () => {
    render(
      <MessageBubble
        message={mockMessage}
        isOwnMessage={true}
        currentUser={mockUser}
      />
    );

    expect(screen.queryByText('J')).not.toBeInTheDocument();
  });

  it('shows read receipt for own messages', () => {
    render(
      <MessageBubble
        message={mockMessage}
        isOwnMessage={true}
        currentUser={mockUser}
      />
    );

    // Should show read receipt icon (SVG, not img)
    const readReceipt = document.querySelector('svg');
    expect(readReceipt).toBeInTheDocument();
  });

  it('formats timestamp correctly', () => {
    const specificTime = '2023-01-01T12:30:00.000Z';
    const messageWithTime = { ...mockMessage, sentAt: specificTime };

    render(
      <MessageBubble
        message={messageWithTime}
        isOwnMessage={false}
        currentUser={mockUser}
      />
    );

    // Should show formatted time (could be 12:30 PM or 2:30 PM depending on timezone)
    const timeElement = screen.getByText(/\d{1,2}:\d{2}\s?(AM|PM)/);
    expect(timeElement).toBeInTheDocument();
  });

  it('handles image messages', () => {
    const imageMessage = {
      ...mockMessage,
      messageType: 'image' as const,
      attachments: [{ type: 'image', url: 'https://example.com/image.jpg', fileName: 'image.jpg' }]
    };

    render(
      <MessageBubble
        message={imageMessage}
        isOwnMessage={false}
        currentUser={mockUser}
      />
    );

    const image = screen.getByAltText('image.jpg');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('handles location messages', () => {
    const locationMessage = {
      ...mockMessage,
      messageType: 'location' as const,
      content: 'Central Park'
    };

    render(
      <MessageBubble
        message={locationMessage}
        isOwnMessage={false}
        currentUser={mockUser}
      />
    );

    expect(screen.getByText('📍')).toBeInTheDocument();
    expect(screen.getByText('Location shared')).toBeInTheDocument();
    expect(screen.getByText('Central Park')).toBeInTheDocument();
  });
});
