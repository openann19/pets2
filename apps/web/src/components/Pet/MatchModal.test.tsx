import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

// Remove react-router-dom import as we're using Next.js
import type { Pet, User } from '../../types/index';

import MatchModal from './MatchModal';

const mockCurrentUserPet: Pet = { _id: 'pet1', owner: 'user1', name: 'MyPet', species: 'dog', breed: 'Labrador', age: 3, gender: 'male', size: 'large', intent: 'playdate', photos: [{ url: 'http://example.com/mypet.jpg', isPrimary: true }], personalityTags: [], healthInfo: { vaccinated: true, spayedNeutered: true, microchipped: false }, location: { type: 'Point', coordinates: [0,0] }, featured: { isFeatured: false, boostCount: 0 }, analytics: { views: 0, likes: 0, matches: 0, messages: 0 }, isActive: true, status: 'active', availability: { isAvailable: true }, isVerified: true, listedAt: '', createdAt: '', updatedAt: '' };
const mockMatchedPet: Pet = { ...mockCurrentUserPet, _id: 'pet2', owner: 'user2', name: 'MatchedPet' };
const mockMatchedUser: User = { _id: 'user2', email: 'matched@example.com', firstName: 'Matched', lastName: 'User', dateOfBirth: '1992-02-02', age: 28, location: { type: 'Point', coordinates: [0,0] }, preferences: { maxDistance: 50, ageRange: { min: 0, max: 20 }, species: [], intents: [], notifications: { email: true, push: true, matches: true, messages: true } }, premium: { isActive: false, plan: 'basic', features: { unlimitedLikes: false, boostProfile: false, seeWhoLiked: false, advancedFilters: false } }, pets: [], analytics: { totalSwipes: 0, totalLikes: 0, totalMatches: 0, profileViews: 0, lastActive: '' }, isEmailVerified: true, isActive: true, createdAt: '', updatedAt: '' };

// Mock Next.js router before the component import
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe('MatchModal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockPush.mockClear();
  });

  it('renders the match information correctly when open', () => {
    render(
      <MatchModal
        isOpen={true}
        onClose={mockOnClose}
        matchId="match123"
        currentUserPet={mockCurrentUserPet}
        matchedPet={mockMatchedPet}
        matchedUser={mockMatchedUser}
      />
    );

    expect(screen.getByText("It's a Match!")).toBeInTheDocument();
    expect(screen.getByText('MyPet and MatchedPet liked each other')).toBeInTheDocument();
    expect(screen.getByText('MyPet')).toBeInTheDocument();
    expect(screen.getByText('MatchedPet')).toBeInTheDocument();
    expect(screen.getByText("Matched's pet")).toBeInTheDocument();
  });

  it('calls onClose when the "Keep Swiping" button is clicked', () => {
    render(
      <MatchModal isOpen={true} onClose={mockOnClose} matchId="match123" currentUserPet={mockCurrentUserPet} matchedPet={mockMatchedPet} matchedUser={mockMatchedUser} />
    );
  
      const keepSwipingButton = screen.getByText('Keep Swiping');
      fireEvent.click(keepSwipingButton);
  
      expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('navigates to the chat page when "Start Chatting" is clicked', () => {
    render(
      <MatchModal isOpen={true} onClose={mockOnClose} matchId="match123" currentUserPet={mockCurrentUserPet} matchedPet={mockMatchedPet} matchedUser={mockMatchedUser} />
    );

    const startChattingButton = screen.getByText('Start Chatting');
    fireEvent.click(startChattingButton);

    expect(mockPush).toHaveBeenCalledWith('/chat/match123');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when isOpen is false', () => {
    render(
      <MatchModal isOpen={false} onClose={mockOnClose} matchId="match123" currentUserPet={mockCurrentUserPet} matchedPet={mockMatchedPet} matchedUser={mockMatchedUser} />
    );

    // Should not find the modal content when closed
    expect(screen.queryByText("It's a Match!")).not.toBeInTheDocument();
  });
});
