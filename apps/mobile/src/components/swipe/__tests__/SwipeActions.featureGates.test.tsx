/**
 * SwipeActions Feature Gates Tests
 * Tests UI feature gating for Super Like button
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { SwipeActions } from '../SwipeActions';
import { usePremiumStatus } from '../../../hooks/domains/premium/usePremiumStatus';
import { useIAPBalance } from '../../../hooks/domains/premium/useIAPBalance';

jest.mock('../../../hooks/domains/premium/usePremiumStatus');
jest.mock('../../../hooks/domains/premium/useIAPBalance');
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Alert.alert = jest.fn();
  return RN;
});

const mockNavigation = {
  navigate: jest.fn(),
};

const mockUsePremiumStatus = usePremiumStatus as jest.Mock;
const mockUseIAPBalance = useIAPBalance as jest.Mock;

describe('SwipeActions - Feature Gates', () => {
  const mockOnPass = jest.fn();
  const mockOnLike = jest.fn();
  const mockOnSuperlike = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    Alert.alert = jest.fn();
  });

  describe('Super Like Button - Premium Access', () => {
    it('should enable super like button for premium users', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        plan: 'premium',
      });
      mockUseIAPBalance.mockReturnValue({
        balance: { superLikes: 0 },
      });

      const { getByTestId } = render(
        <SwipeActions
          onPass={mockOnPass}
          onLike={mockOnLike}
          onSuperlike={mockOnSuperlike}
          navigation={mockNavigation}
        />,
      );

      const superLikeButton = getByTestId('swipe-superlike-button');
      expect(superLikeButton).toBeTruthy();
      expect(superLikeButton.props.disabled).toBe(false);
    });

    it('should enable super like button for users with IAP balance', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        plan: 'free',
      });
      mockUseIAPBalance.mockReturnValue({
        balance: { superLikes: 5 },
      });

      const { getByTestId } = render(
        <SwipeActions
          onPass={mockOnPass}
          onLike={mockOnLike}
          onSuperlike={mockOnSuperlike}
          navigation={mockNavigation}
        />,
      );

      const superLikeButton = getByTestId('swipe-superlike-button');
      expect(superLikeButton.props.disabled).toBe(false);
    });

    it('should disable super like button for free users without IAP balance', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        plan: 'free',
      });
      mockUseIAPBalance.mockReturnValue({
        balance: { superLikes: 0 },
      });

      const { getByTestId } = render(
        <SwipeActions
          onPass={mockOnPass}
          onLike={mockOnLike}
          onSuperlike={mockOnSuperlike}
          navigation={mockNavigation}
        />,
      );

      const superLikeButton = getByTestId('swipe-superlike-button');
      expect(superLikeButton.props.disabled).toBe(true);
    });

    it('should show alert when super like pressed without access', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        plan: 'free',
      });
      mockUseIAPBalance.mockReturnValue({
        balance: { superLikes: 0 },
      });

      const { getByTestId } = render(
        <SwipeActions
          onPass={mockOnPass}
          onLike={mockOnLike}
          onSuperlike={mockOnSuperlike}
          navigation={mockNavigation}
        />,
      );

      const superLikeButton = getByTestId('swipe-superlike-button');
      fireEvent.press(superLikeButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Super Like Required',
        'Purchase Super Likes from the Premium screen to use this feature.',
        expect.any(Array),
      );
      expect(mockOnSuperlike).not.toHaveBeenCalled();
    });

    it('should call onSuperlike when user has access', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        plan: 'premium',
      });
      mockUseIAPBalance.mockReturnValue({
        balance: { superLikes: 0 },
      });

      const { getByTestId } = render(
        <SwipeActions
          onPass={mockOnPass}
          onLike={mockOnLike}
          onSuperlike={mockOnSuperlike}
          navigation={mockNavigation}
        />,
      );

      const superLikeButton = getByTestId('swipe-superlike-button');
      fireEvent.press(superLikeButton);

      expect(mockOnSuperlike).toHaveBeenCalled();
      expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('should navigate to Premium screen from alert', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        plan: 'free',
      });
      mockUseIAPBalance.mockReturnValue({
        balance: { superLikes: 0 },
      });

      (Alert.alert as jest.Mock).mockImplementation(
        (title, message, buttons) => {
          const upgradeButton = buttons[1];
          if (upgradeButton && upgradeButton.onPress) {
            upgradeButton.onPress();
          }
        },
      );

      const { getByTestId } = render(
        <SwipeActions
          onPass={mockOnPass}
          onLike={mockOnLike}
          onSuperlike={mockOnSuperlike}
          navigation={mockNavigation}
        />,
      );

      const superLikeButton = getByTestId('swipe-superlike-button');
      fireEvent.press(superLikeButton);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('Premium');
    });

    it('should show lock icon when super like is disabled', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        plan: 'free',
      });
      mockUseIAPBalance.mockReturnValue({
        balance: { superLikes: 0 },
      });

      const { getByTestId } = render(
        <SwipeActions
          onPass={mockOnPass}
          onLike={mockOnLike}
          onSuperlike={mockOnSuperlike}
          navigation={mockNavigation}
        />,
      );

      const lockIcon = getByTestId('swipe-superlike-button').findByProps({
        style: expect.objectContaining({
          opacity: 0.5,
        }),
      });

      expect(lockIcon).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility label for enabled super like', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: true,
        plan: 'premium',
      });
      mockUseIAPBalance.mockReturnValue({
        balance: { superLikes: 0 },
      });

      const { getByTestId } = render(
        <SwipeActions
          onPass={mockOnPass}
          onLike={mockOnLike}
          onSuperlike={mockOnSuperlike}
          navigation={mockNavigation}
        />,
      );

      const superLikeButton = getByTestId('swipe-superlike-button');
      expect(superLikeButton.props.accessibilityLabel).toBe('Super like this pet');
    });

    it('should have correct accessibility label for disabled super like', () => {
      mockUsePremiumStatus.mockReturnValue({
        isPremium: false,
        plan: 'free',
      });
      mockUseIAPBalance.mockReturnValue({
        balance: { superLikes: 0 },
      });

      const { getByTestId } = render(
        <SwipeActions
          onPass={mockOnPass}
          onLike={mockOnLike}
          onSuperlike={mockOnSuperlike}
          navigation={mockNavigation}
        />,
      );

      const superLikeButton = getByTestId('swipe-superlike-button');
      expect(superLikeButton.props.accessibilityLabel).toContain('Premium required');
    });
  });
});

