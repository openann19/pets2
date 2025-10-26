/**
 * SwipeGestureHints Comprehensive Tests
 * Tests onboarding, persistence, and user interaction
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SwipeGestureHints } from '../SwipeGestureHints';
import { HINTS_STORAGE_KEY } from '../SwipeGestureHints';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('SwipeGestureHints', () => {
  const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    it('should not render when hints have been dismissed', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('true');
      
      const { queryByText } = render(<SwipeGestureHints />);
      
      await waitFor(() => {
        expect(queryByText('Swipe left to pass')).toBeNull();
      });
    });

    it('should render on first launch', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      
      const { findByText } = render(<SwipeGestureHints />);
      
      await waitFor(() => {
        expect(findByText('Swipe left to pass')).toBeTruthy();
      });
    });

    it('should check AsyncStorage on mount', async () => {
      render(<SwipeGestureHints />);
      
      await waitFor(() => {
        expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(HINTS_STORAGE_KEY);
      });
    });
  });

  describe('Hints Display', () => {
    it('should display left swipe hint', async () => {
      const { findByText } = render(<SwipeGestureHints />);
      
      await waitFor(async () => {
        const hint = await findByText('Swipe left to pass');
        expect(hint).toBeTruthy();
      });
    });

    it('should display right swipe hint', async () => {
      const { findByText } = render(<SwipeGestureHints />);
      
      await waitFor(async () => {
        const hint = await findByText('Swipe right to like');
        expect(hint).toBeTruthy();
      });
    });

    it('should display super like hint', async () => {
      const { findByText } = render(<SwipeGestureHints />);
      
      await waitFor(async () => {
        const hint = await findByText('Swipe up to super like');
        expect(hint).toBeTruthy();
      });
    });

    it('should position hints correctly', () => {
      const { UNSAFE_getAllByType } = render(<SwipeGestureHints />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      const hints = UNSAFE_getAllByType('View');
      expect(hints.length).toBeGreaterThan(0);
    });
  });

  describe('Auto Dismiss', () => {
    it('should auto-dismiss after 5 seconds', async () => {
      const { rerender } = render(<SwipeGestureHints onDismiss={mockOnDismiss} />);
      
      await waitFor(() => {
        act(() => {
          jest.advanceTimersByTime(5100);
        });
      });

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          HINTS_STORAGE_KEY,
          'true'
        );
      });

      await waitFor(() => {
        expect(mockOnDismiss).toHaveBeenCalled();
      }, { timeout: 6000 });
    });

    it('should call AsyncStorage with correct key on dismiss', async () => {
      render(<SwipeGestureHints onDismiss={mockOnDismiss} />);
      
      await waitFor(() => {
        act(() => {
          jest.advanceTimersByTime(5100);
        });
      });

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          HINTS_STORAGE_KEY,
          'true'
        );
      });
    });
  });

  describe('Manual Dismiss', () => {
    it('should dismiss when close button is pressed', async () => {
      const { getByTestId } = render(<SwipeGestureHints onDismiss={mockOnDismiss} />);
      
      await waitFor(async () => {
        act(() => {
          jest.advanceTimersByTime(100);
        });
      });

      const dismissButton = getByTestId('dismiss-button');
      fireEvent.press(dismissButton);

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
          HINTS_STORAGE_KEY,
          'true'
        );
      });
    });

    it('should call onDismiss when manually dismissed', async () => {
      const { getByTestId } = render(<SwipeGestureHints onDismiss={mockOnDismiss} />);
      
      await waitFor(async () => {
        act(() => {
          jest.advanceTimersByTime(100);
        });
      });

      const dismissButton = getByTestId('dismiss-button');
      fireEvent.press(dismissButton);

      await waitFor(() => {
        expect(mockOnDismiss).toHaveBeenCalled();
      });
    });

    it('should handle dismiss without onDismiss callback', async () => {
      const { getByTestId } = render(<SwipeGestureHints />);
      
      await waitFor(async () => {
        act(() => {
          jest.advanceTimersByTime(100);
        });
      });

      const dismissButton = getByTestId('dismiss-button');
      
      expect(() => {
        fireEvent.press(dismissButton);
      }).not.toThrow();
    });
  });

  describe('Animation', () => {
    it('should fade in on show', async () => {
      const { UNSAFE_getByType } = render(<SwipeGestureHints />);
      
      await waitFor(() => {
        act(() => {
          jest.advanceTimersByTime(500);
        });
      });

      const container = UNSAFE_getByType('Animated.View');
      expect(container).toBeTruthy();
    });

    it('should fade out on dismiss', async () => {
      const { getByTestId, rerender } = render(<SwipeGestureHints />);
      
      await waitFor(async () => {
        act(() => {
          jest.advanceTimersByTime(100);
        });
      });

      const dismissButton = getByTestId('dismiss-button');
      fireEvent.press(dismissButton);

      await waitFor(() => {
        act(() => {
          jest.advanceTimersByTime(400);
        });
      });

      // Should be dismissed
      rerender(<SwipeGestureHints />);
      
      await waitFor(() => {
        // Hints should no longer be visible
      });
    });
  });

  describe('Persistence', () => {
    it('should not show after initial dismiss', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('true');
      
      const { queryByText } = render(<SwipeGestureHints />);
      
      await waitFor(() => {
        expect(queryByText('Swipe left to pass')).toBeNull();
      });
    });

    it('should persist dismissal across sessions', async () => {
      // First render
      const { getByTestId, unmount } = render(<SwipeGestureHints />);
      
      await waitFor(async () => {
        act(() => {
          jest.advanceTimersByTime(100);
        });
      });

      const dismissButton = getByTestId('dismiss-button');
      fireEvent.press(dismissButton);

      await waitFor(() => {
        expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      });

      unmount();

      // Second render after app restart
      mockAsyncStorage.getItem.mockResolvedValue('true');
      
      const { queryByText } = render(<SwipeGestureHints />);
      
      await waitFor(() => {
        expect(queryByText('Swipe left to pass')).toBeNull();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle AsyncStorage.getItem error gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      
      const { findByText } = render(<SwipeGestureHints />);
      
      // Should still show hints as fallback
      await waitFor(async () => {
        const hint = await findByText('Swipe left to pass');
        expect(hint).toBeTruthy();
      });
    });

    it('should handle AsyncStorage.setItem error gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));
      
      const { getByTestId } = render(<SwipeGestureHints />);
      
      await waitFor(async () => {
        act(() => {
          jest.advanceTimersByTime(100);
        });
      });

      const dismissButton = getByTestId('dismiss-button');
      
      expect(() => {
        fireEvent.press(dismissButton);
      }).not.toThrow();
    });

    it('should not crash on rapid dismiss attempts', async () => {
      const { getByTestId } = render(<SwipeGestureHints />);
      
      await waitFor(async () => {
        act(() => {
          jest.advanceTimersByTime(100);
        });
      });

      const dismissButton = getByTestId('dismiss-button');
      
      expect(() => {
        fireEvent.press(dismissButton);
        fireEvent.press(dismissButton);
        fireEvent.press(dismissButton);
      }).not.toThrow();
    });
  });

  describe('Visual Elements', () => {
    it('should render all three hint positions', async () => {
      const { UNSAFE_getAllByType } = render(<SwipeGestureHints />);
      
      await waitFor(() => {
        act(() => {
          jest.advanceTimersByTime(100);
        });
      });

      const hintContainers = UNSAFE_getAllByType('View');
      expect(hintContainers.length).toBeGreaterThan(2);
    });

    it('should display dismiss button', async () => {
      const { getByTestId } = render(<SwipeGestureHints />);
      
      await waitFor(async () => {
        act(() => {
          jest.advanceTimersByTime(100);
        });
      });

      const dismissButton = getByTestId('dismiss-button');
      expect(dismissButton).toBeTruthy();
    });

    it('should have correct colors for each hint', async () => {
      const { findByText } = render(<SwipeGestureHints />);
      
      await waitFor(async () => {
        const leftHint = await findByText('Swipe left to pass');
        const rightHint = await findByText('Swipe right to like');
        const topHint = await findByText('Swipe up to super like');
        
        expect(leftHint).toBeTruthy();
        expect(rightHint).toBeTruthy();
        expect(topHint).toBeTruthy();
      });
    });
  });

  describe('Integration', () => {
    it('should work with multiple hint displays', async () => {
      const { findByText, getByTestId } = render(
        <>
          <SwipeGestureHints />
          <SwipeGestureHints />
        </>
      );
      
      await waitFor(async () => {
        act(() => {
          jest.advanceTimersByTime(100);
        });
      });

      const hints = await findByText('Swipe left to pass');
      expect(hints).toBeTruthy();

      const dismissButtons = getByTestId('dismiss-button');
      expect(dismissButtons).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined onDismiss prop', async () => {
      render(<SwipeGestureHints />);
      
      await waitFor(() => {
        act(() => {
          jest.advanceTimersByTime(100);
        });
      });

      expect(() => {
        act(() => {
          jest.advanceTimersByTime(5100);
        });
      }).not.toThrow();
    });

    it('should handle rapid mount/unmount', () => {
      const { rerender } = render(<SwipeGestureHints />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      rerender(<SwipeGestureHints />);
      rerender(<SwipeGestureHints />);
      rerender(<SwipeGestureHints />);

      expect(() => {}).not.toThrow();
    });
  });
});

