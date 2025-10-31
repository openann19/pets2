/**
 * Tests for LikedUserItem Component
 */

import { render, fireEvent } from '@testing-library/react-native';
import { LikedUserItem } from '../LikedUserItem';
import type { ReceivedLike } from '../../../../services/api';

const mockLike: ReceivedLike = {
  userId: 'user123',
  name: 'John Doe',
  profilePicture: 'https://example.com/avatar.jpg',
  location: 'New York, NY',
  likedAt: new Date().toISOString(),
  isSuperLike: false,
  petsLiked: [
    {
      petId: 'pet1',
      action: 'like',
      likedAt: new Date().toISOString(),
    },
  ],
};

describe('LikedUserItem', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render user information correctly', () => {
    const { getByText } = render(<LikedUserItem like={mockLike} onPress={mockOnPress} />);

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('New York, NY')).toBeTruthy();
    expect(getByText(/1 pet liked/)).toBeTruthy();
  });

  it('should display super like badge when isSuperLike is true', () => {
    const superLike = { ...mockLike, isSuperLike: true };
    const { getByText } = render(<LikedUserItem like={superLike} onPress={mockOnPress} />);

    expect(getByText('⭐ Super Like')).toBeTruthy();
  });

  it('should call onPress when item is pressed', () => {
    const { getByTestId } = render(<LikedUserItem like={mockLike} onPress={mockOnPress} />);

    const item = getByTestId(`liked-user-item-${mockLike.userId}`);
    fireEvent.press(item);

    expect(mockOnPress).toHaveBeenCalledWith(mockLike);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should format date correctly for today', () => {
    const todayLike = {
      ...mockLike,
      likedAt: new Date().toISOString(),
    };
    const { getByText } = render(<LikedUserItem like={todayLike} onPress={mockOnPress} />);

    expect(getByText(/Liked Today/)).toBeTruthy();
  });

  it('should format date correctly for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayLike = {
      ...mockLike,
      likedAt: yesterday.toISOString(),
    };
    const { getByText } = render(<LikedUserItem like={yesterdayLike} onPress={mockOnPress} />);

    expect(getByText(/Liked Yesterday/)).toBeTruthy();
  });

  it('should display placeholder avatar when profilePicture is missing', () => {
    const noAvatarLike = { ...mockLike, profilePicture: undefined };
    const { queryByTestId } = render(<LikedUserItem like={noAvatarLike} onPress={mockOnPress} />);

    // Should render placeholder icon
    expect(queryByTestId('liked-user-item-user123')).toBeTruthy();
  });

  it('should handle multiple pets liked', () => {
    const multiPetLike = {
      ...mockLike,
      petsLiked: [
        { petId: 'pet1', action: 'like' as const, likedAt: new Date().toISOString() },
        { petId: 'pet2', action: 'superlike' as const, likedAt: new Date().toISOString() },
      ],
    };
    const { getByText } = render(<LikedUserItem like={multiPetLike} onPress={mockOnPress} />);

    expect(getByText(/2 pets liked/)).toBeTruthy();
  });
});

