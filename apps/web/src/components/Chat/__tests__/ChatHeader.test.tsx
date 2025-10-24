/**
 * ChatHeader Component Tests
 * Tests the chat interface header with match information and actions
 * 
 * CRITICAL: This component is completely untested
 * Business Impact: Core chat interface functionality
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatHeader } from '../ChatHeader';

const mockMatch = {
  _id: 'match-123',
  pet1: {
    _id: 'pet-1',
    name: 'Buddy',
    photos: ['https://example.com/buddy.jpg'],
    species: 'dog',
    breed: 'Golden Retriever'
  },
  pet2: {
    _id: 'pet-2',
    name: 'Max',
    photos: ['https://example.com/max.jpg'],
    species: 'dog',
    breed: 'Labrador'
  },
  user1: {
    _id: 'user-1',
    name: 'John',
    isOnline: false
  },
  user2: {
    _id: 'user-2',
    name: 'Jane',
    isOnline: true,
    lastSeen: new Date().toISOString()
  },
  compatibilityScore: 85,
  createdAt: new Date().toISOString(),
  status: 'active'
};

const mockOnBack = jest.fn();
const mockOnBlock = jest.fn();
const mockOnReport = jest.fn();
const mockOnUnmatch = jest.fn();
const mockOnViewProfile = jest.fn();

describe('ChatHeader Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display match information', () => {
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText(/Labrador/i)).toBeInTheDocument();
  });

  it('should show online status when user is online', () => {
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText(/online/i)).toBeInTheDocument();
    expect(screen.getByTestId('online-indicator')).toBeInTheDocument();
  });

  it('should show offline status when user is offline', () => {
    const offlineMatch = {
      ...mockMatch,
      user2: { ...mockMatch.user2, isOnline: false }
    };

    render(
      <ChatHeader
        match={offlineMatch}
        currentUserId="user-1"
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText(/offline/i)).toBeInTheDocument();
    expect(screen.queryByTestId('online-indicator')).not.toBeInTheDocument();
  });

  it('should show last seen when user is offline', () => {
    const offlineMatch = {
      ...mockMatch,
      user2: { 
        ...mockMatch.user2, 
        isOnline: false,
        lastSeen: '2023-10-08T10:30:00Z'
      }
    };

    render(
      <ChatHeader
        match={offlineMatch}
        currentUserId="user-1"
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText(/last seen/i)).toBeInTheDocument();
  });

  it('should handle back navigation', async () => {
    const user = userEvent.setup();
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBack={mockOnBack}
      />
    );

    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should show action menu when menu button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBlock={mockOnBlock}
        onReport={mockOnReport}
        onUnmatch={mockOnUnmatch}
        onViewProfile={mockOnViewProfile}
      />
    );

    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);

    expect(screen.getByText(/block/i)).toBeInTheDocument();
    expect(screen.getByText(/report/i)).toBeInTheDocument();
    expect(screen.getByText(/unmatch/i)).toBeInTheDocument();
    expect(screen.getByText(/view profile/i)).toBeInTheDocument();
  });

  it('should handle block action', async () => {
    const user = userEvent.setup();
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBlock={mockOnBlock}
      />
    );

    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);

    const blockButton = screen.getByText(/block/i);
    await user.click(blockButton);

    expect(mockOnBlock).toHaveBeenCalledWith(mockMatch._id);
  });

  it('should handle report action', async () => {
    const user = userEvent.setup();
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onReport={mockOnReport}
      />
    );

    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);

    const reportButton = screen.getByText(/report/i);
    await user.click(reportButton);

    expect(mockOnReport).toHaveBeenCalledWith(mockMatch._id);
  });

  it('should handle unmatch action', async () => {
    const user = userEvent.setup();
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onUnmatch={mockOnUnmatch}
      />
    );

    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);

    const unmatchButton = screen.getByText(/unmatch/i);
    await user.click(unmatchButton);

    expect(mockOnUnmatch).toHaveBeenCalledWith(mockMatch._id);
  });

  it('should handle view profile action', async () => {
    const user = userEvent.setup();
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onViewProfile={mockOnViewProfile}
      />
    );

    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);

    const viewProfileButton = screen.getByText(/view profile/i);
    await user.click(viewProfileButton);

    expect(mockOnViewProfile).toHaveBeenCalledWith(mockMatch.user2._id);
  });

  it('should close menu when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBlock={mockOnBlock}
      />
    );

    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);

    expect(screen.getByText(/block/i)).toBeInTheDocument();

    // Click outside
    await user.click(document.body);

    await waitFor(() => {
      expect(screen.queryByText(/block/i)).not.toBeInTheDocument();
    });
  });

  it('should close menu when pressing escape key', async () => {
    const user = userEvent.setup();
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBlock={mockOnBlock}
      />
    );

    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);

    expect(screen.getByText(/block/i)).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByText(/block/i)).not.toBeInTheDocument();
    });
  });

  it('should display pet photo', () => {
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBack={mockOnBack}
      />
    );

    const image = screen.getByRole('img', { name: /Max/i });
    expect(image).toHaveAttribute('src', mockMatch.pet2.photos[0]);
  });

  it('should display compatibility score', () => {
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText(/85% match/i)).toBeInTheDocument();
  });

  it('should handle match without compatibility score', () => {
    const matchWithoutScore = { ...mockMatch, compatibilityScore: undefined };

    render(
      <ChatHeader
        match={matchWithoutScore}
        currentUserId="user-1"
        onBack={mockOnBack}
      />
    );

    expect(screen.queryByText(/% match/i)).not.toBeInTheDocument();
  });

  it('should handle match without pet photos', () => {
    const matchWithoutPhotos = {
      ...mockMatch,
      pet2: { ...mockMatch.pet2, photos: [] }
    };

    render(
      <ChatHeader
        match={matchWithoutPhotos}
        currentUserId="user-1"
        onBack={mockOnBack}
      />
    );

    expect(screen.getByTestId('placeholder-avatar')).toBeInTheDocument();
  });

  it('should handle match without user information', () => {
    const matchWithoutUser = {
      ...mockMatch,
      user2: undefined
    };

    render(
      <ChatHeader
        match={matchWithoutUser}
        currentUserId="user-1"
        onBack={mockOnBack}
      />
    );

    expect(screen.queryByText('Jane')).not.toBeInTheDocument();
  });

  it('should be accessible with proper ARIA labels', () => {
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBack={mockOnBack}
      />
    );

    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toHaveAttribute('aria-label', expect.stringContaining('back'));

    const menuButton = screen.getByRole('button', { name: /menu/i });
    expect(menuButton).toHaveAttribute('aria-label', expect.stringContaining('menu'));

    const image = screen.getByRole('img', { name: /Max/i });
    expect(image).toHaveAttribute('alt', expect.stringContaining('Max'));
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBack={mockOnBack}
        onBlock={mockOnBlock}
      />
    );

    // Tab to menu button
    await user.tab();
    await user.tab();
    
    const menuButton = screen.getByRole('button', { name: /menu/i });
    expect(menuButton).toHaveFocus();

    // Open menu with Enter
    await user.keyboard('{Enter}');
    expect(screen.getByText(/block/i)).toBeInTheDocument();

    // Navigate menu items with arrow keys
    await user.keyboard('{ArrowDown}');
    const blockButton = screen.getByText(/block/i);
    expect(blockButton).toHaveFocus();

    // Select with Enter
    await user.keyboard('{Enter}');
    expect(mockOnBlock).toHaveBeenCalled();
  });

  it('should handle different match statuses', () => {
    const archivedMatch = { ...mockMatch, status: 'archived' };

    render(
      <ChatHeader
        match={archivedMatch}
        currentUserId="user-1"
        onBack={mockOnBack}
      />
    );

    expect(screen.getByTestId('archived-indicator')).toBeInTheDocument();
  });

  it('should show typing indicator when user is typing', () => {
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBack={mockOnBack}
        isTyping={true}
      />
    );

    expect(screen.getByText(/typing/i)).toBeInTheDocument();
    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
  });

  it('should show unread message count', () => {
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBack={mockOnBack}
        unreadCount={5}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByTestId('unread-badge')).toBeInTheDocument();
  });

  it('should handle zero unread messages', () => {
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBack={mockOnBack}
        unreadCount={0}
      />
    );

    expect(screen.queryByTestId('unread-badge')).not.toBeInTheDocument();
  });

  it('should handle large unread message counts', () => {
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBack={mockOnBack}
        unreadCount={999}
      />
    );

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('should show match age', () => {
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText(/matched/i)).toBeInTheDocument();
  });

  it('should handle current user being user2', () => {
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-2"
        onBack={mockOnBack}
      />
    );

    // Should show user1's pet and info
    expect(screen.getByText('Buddy')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText(/Golden Retriever/i)).toBeInTheDocument();
  });

  it('should handle menu actions with confirmation', async () => {
    const user = userEvent.setup();
    const mockOnBlockWithConfirm = jest.fn().mockResolvedValue(true);

    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBlock={mockOnBlockWithConfirm}
      />
    );

    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);

    const blockButton = screen.getByText(/block/i);
    await user.click(blockButton);

    // Should show confirmation dialog
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);

    expect(mockOnBlockWithConfirm).toHaveBeenCalledWith(mockMatch._id);
  });

  it('should handle menu action cancellation', async () => {
    const user = userEvent.setup();
    const mockOnBlockWithConfirm = jest.fn().mockResolvedValue(true);

    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBlock={mockOnBlockWithConfirm}
      />
    );

    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);

    const blockButton = screen.getByText(/block/i);
    await user.click(blockButton);

    // Should show confirmation dialog
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Should not call the action
    expect(mockOnBlockWithConfirm).not.toHaveBeenCalled();
  });

  it('should handle loading states', () => {
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBack={mockOnBack}
        isLoading={true}
      />
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should handle error states', () => {
    render(
      <ChatHeader
        match={mockMatch}
        currentUserId="user-1"
        onBack={mockOnBack}
        error="Failed to load match"
      />
    );

    expect(screen.getByText(/failed to load match/i)).toBeInTheDocument();
  });
});
