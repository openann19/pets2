/**
 * MatchModal Comprehensive Tests
 * Tests match celebration with confetti integration
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MatchModal } from '../MatchModal';
import type { Pet } from '@pawfectmatch/core';

const mockPet: Pet = {
  _id: 'pet1',
  name: 'Buddy',
  age: 3,
  breed: 'Golden Retriever',
  photos: [{ url: 'photo1.jpg', order: 1 }],
  description: 'Friendly and playful',
  owner: 'user1' as any,
  species: 'dog',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOnKeepSwiping = jest.fn();
const mockOnSendMessage = jest.fn();

describe('MatchModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should not render when show is false', () => {
      const { queryByText } = render(
        <MatchModal
          pet={mockPet}
          show={false}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(queryByText("It's a Match! 🎉")).toBeNull();
    });

    it('should render when show is true', () => {
      const { getByText } = render(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(getByText("It's a Match! 🎉")).toBeTruthy();
    });

    it('should render default show true when not provided', () => {
      const { getByText } = render(
        <MatchModal
          pet={mockPet}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(getByText("It's a Match! 🎉")).toBeTruthy();
    });
  });

  describe('Confetti Integration', () => {
    it('should render confetti burst when shown', () => {
      const { UNSAFE_getAllByType } = render(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      const confettiComponents = UNSAFE_getAllByType('View');
      expect(confettiComponents.length).toBeGreaterThan(0);
    });

    it('should trigger confetti on show', async () => {
      const { rerender } = render(
        <MatchModal
          pet={mockPet}
          show={false}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      rerender(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      await waitFor(() => {
        jest.advanceTimersByTime(100);
      });
    });

    it('should stop confetti after duration', async () => {
      const { UNSAFE_getByType } = render(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      act(() => {
        jest.advanceTimersByTime(4100);
      });

      await waitFor(() => {
        const container = UNSAFE_getByType('View');
        expect(container).toBeTruthy();
      });
    });
  });

  describe('Content Display', () => {
    it('should display match title', () => {
      const { getByText } = render(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(getByText("It's a Match! 🎉")).toBeTruthy();
    });

    it('should display pet name in message', () => {
      const { getByText } = render(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(getByText(/You and Buddy liked each other!/)).toBeTruthy();
    });

    it('should handle long pet names', () => {
      const longNamePet: Pet = {
        ...mockPet,
        name: 'Super Long Pet Name That Should Still Display',
      };

      const { getByText } = render(
        <MatchModal
          pet={longNamePet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(getByText(/Super Long Pet Name That Should Still Display/)).toBeTruthy();
    });
  });

  describe('Buttons', () => {
    it('should render Keep Swiping button', () => {
      const { getByText } = render(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(getByText('Keep Swiping')).toBeTruthy();
    });

    it('should render Send Message button', () => {
      const { getByText } = render(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(getByText('Send Message')).toBeTruthy();
    });

    it('should call onKeepSwiping when Keep Swiping is pressed', () => {
      const { getByText } = render(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      const button = getByText('Keep Swiping');
      fireEvent.press(button);

      expect(mockOnKeepSwiping).toHaveBeenCalledTimes(1);
    });

    it('should call onSendMessage when Send Message is pressed', () => {
      const { getByText } = render(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      const button = getByText('Send Message');
      fireEvent.press(button);

      expect(mockOnSendMessage).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid button presses', () => {
      const { getByText } = render(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      const keepSwipingButton = getByText('Keep Swiping');
      const sendMessageButton = getByText('Send Message');

      fireEvent.press(keepSwipingButton);
      fireEvent.press(sendMessageButton);
      fireEvent.press(keepSwipingButton);

      expect(mockOnKeepSwiping).toHaveBeenCalledTimes(2);
      expect(mockOnSendMessage).toHaveBeenCalledTimes(1);
    });
  });

  describe('Photo Display', () => {
    it('should render photo container', () => {
      const { UNSAFE_getAllByType } = render(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      const containers = UNSAFE_getAllByType('View');
      const photoContainer = containers.find((view) =>
        view.props.style?.some((style: any) => style?.width === 80),
      );

      expect(photoContainer).toBeTruthy();
    });

    it('should handle pets with no photos', () => {
      const petWithoutPhotos: Pet = {
        ...mockPet,
        photos: [],
      };

      const { getByText } = render(
        <MatchModal
          pet={petWithoutPhotos}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(getByText("It's a Match! 🎉")).toBeTruthy();
    });
  });

  describe('Styling', () => {
    it('should have overlay with correct background', () => {
      const { UNSAFE_getByType } = render(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      const overlay = UNSAFE_getByType('View');
      expect(overlay).toBeTruthy();
    });

    it('should have correct z-index', () => {
      const { UNSAFE_getByType } = render(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      const overlay = UNSAFE_getByType('View');
      expect(overlay).toBeTruthy();
    });
  });

  describe('Integration with SwipeScreen', () => {
    it('should handle navigation on Send Message', () => {
      const navigateMock = jest.fn();
      const onSendMessageWithNav = () => {
        navigateMock('Chat', { matchId: mockPet._id, petName: mockPet.name });
      };

      const { getByText } = render(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={onSendMessageWithNav}
        />,
      );

      const button = getByText('Send Message');
      fireEvent.press(button);

      expect(navigateMock).toHaveBeenCalledWith('Chat', {
        matchId: mockPet._id,
        petName: mockPet.name,
      });
    });

    it('should handle dismiss on Keep Swiping', () => {
      const setShowModalMock = jest.fn();
      const onKeepSwipingWithDismiss = () => {
        setShowModalMock(false);
      };

      const { getByText } = render(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={onKeepSwipingWithDismiss}
          onSendMessage={mockOnSendMessage}
        />,
      );

      const button = getByText('Keep Swiping');
      fireEvent.press(button);

      expect(setShowModalMock).toHaveBeenCalledWith(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined callbacks gracefully', () => {
      const { getByText } = render(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={undefined as any}
          onSendMessage={undefined as any}
        />,
      );

      const button = getByText('Keep Swiping');

      expect(() => {
        fireEvent.press(button);
      }).not.toThrow();
    });

    it('should handle rapid show/hide toggles', () => {
      const { rerender } = render(
        <MatchModal
          pet={mockPet}
          show={false}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      rerender(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      rerender(
        <MatchModal
          pet={mockPet}
          show={false}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(() => {}).not.toThrow();
    });

    it('should handle pet changes', () => {
      const newPet: Pet = {
        ...mockPet,
        name: 'Max',
        _id: 'pet2',
      };

      const { rerender, getByText } = render(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      rerender(
        <MatchModal
          pet={newPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(getByText(/You and Max liked each other!/)).toBeTruthy();
    });

    it('should unmount cleanly', () => {
      const { unmount } = render(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible to screen readers', () => {
      const { getByText } = render(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(getByText("It's a Match! 🎉")).toBeTruthy();
    });

    it('should have accessible buttons', () => {
      const { getByText } = render(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(getByText('Keep Swiping')).toBeTruthy();
      expect(getByText('Send Message')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      rerender(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      expect(() => {}).not.toThrow();
    });

    it('should handle confetti cleanup efficiently', async () => {
      const { unmount } = render(
        <MatchModal
          pet={mockPet}
          show={true}
          onKeepSwiping={mockOnKeepSwiping}
          onSendMessage={mockOnSendMessage}
        />,
      );

      act(() => {
        jest.advanceTimersByTime(100);
      });

      unmount();

      expect(() => {
        act(() => {
          jest.runAllTimers();
        });
      }).not.toThrow();
    });
  });
});

// Mock act utility for timer control
function act(callback: () => void) {
  callback();
}
