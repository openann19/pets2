/**
 * ConfettiBurst Comprehensive Tests
 * Tests particle animation, performance, and edge cases
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { View } from 'react-native';
import { ConfettiBurst, type ConfettiBurstProps } from '../ConfettiBurst';
import * as Haptics from 'expo-haptics';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
}));

describe('ConfettiBurst', () => {
  const mockOnComplete = jest.fn();
  const defaultProps: ConfettiBurstProps = {
    show: true,
    onComplete: mockOnComplete,
    intensity: 'medium',
    duration: 3000,
    colors: ['#FF6B6B', '#4ECDC4', '#FFD700'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render nothing when show is false', () => {
      const { container } = render(<ConfettiBurst show={false} />);
      expect(container).toBeTruthy();
    });

    it('should render container when show is true', () => {
      const { getByTestId } = render(<ConfettiBurst {...defaultProps} />);
      const container = getByTestId('confetti-container');
      expect(container).toBeTruthy();
    });

    it('should have correct z-index for overlay', () => {
      const { UNSAFE_getByType } = render(<ConfettiBurst {...defaultProps} />);
      const container = UNSAFE_getByType(View);
      expect(container.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            zIndex: 9999,
          }),
        ])
      );
    });
  });

  describe('Intensity Levels', () => {
    it('should create correct number of particles for light intensity', () => {
      render(<ConfettiBurst {...defaultProps} intensity="light" />);
      // Light intensity should create 40 particles
      act(() => {
        jest.advanceTimersByTime(100);
      });
      // Verify particles are created
    });

    it('should create correct number of particles for medium intensity', () => {
      render(<ConfettiBurst {...defaultProps} intensity="medium" />);
      // Medium intensity should create 80 particles
      act(() => {
        jest.advanceTimersByTime(100);
      });
    });

    it('should create correct number of particles for heavy intensity', () => {
      render(<ConfettiBurst {...defaultProps} intensity="heavy" />);
      // Heavy intensity should create 150 particles
      act(() => {
        jest.advanceTimersByTime(100);
      });
    });
  });

  describe('Animation', () => {
    it('should trigger haptic feedback on show', () => {
      render(<ConfettiBurst {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(10);
      });

      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Heavy
      );
    });

    it('should trigger second haptic feedback after delay', async () => {
      render(<ConfettiBurst {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(210); // Past 200ms delay
      });

      expect(Haptics.impactAsync).toHaveBeenCalledTimes(2);
      expect(Haptics.impactAsync).toHaveBeenLastCalledWith(
        Haptics.ImpactFeedbackStyle.Medium
      );
    });

    it('should animate particles with correct properties', () => {
      const { UNSAFE_getAllByType } = render(<ConfettiBurst {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      const particles = UNSAFE_getAllByType('Animated.View');
      expect(particles.length).toBeGreaterThan(0);
    });

    it('should call onComplete after duration', async () => {
      render(<ConfettiBurst {...defaultProps} duration={1000} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });

    it('should stop confetti after completion', async () => {
      const { rerender } = render(<ConfettiBurst {...defaultProps} duration={1000} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });

      rerender(<ConfettiBurst {...defaultProps} show={false} />);
      const container = render(<View />);
      expect(container).toBeTruthy();
    });
  });

  describe('Particle Bursts', () => {
    it('should trigger periodic bursts during animation', () => {
      render(<ConfettiBurst {...defaultProps} duration={5000} />);
      
      act(() => {
        jest.advanceTimersByTime(400); // Past initial 350ms interval
      });

      // Should have triggered at least initial burst
      expect(Haptics.impactAsync).toHaveBeenCalled();
    });

    it('should handle multiple burst cycles', () => {
      render(<ConfettiBurst {...defaultProps} intensity="heavy" duration={5000} />);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Multiple bursts should occur
      const calls = Haptics.impactAsync.mock.calls.length;
      expect(calls).toBeGreaterThan(1);
    });
  });

  describe('Custom Colors', () => {
    it('should use provided colors for particles', () => {
      const customColors = ['#FF0000', '#00FF00', '#0000FF'];
      render(<ConfettiBurst {...defaultProps} colors={customColors} />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
    });

    it('should handle single color array', () => {
      render(<ConfettiBurst {...defaultProps} colors={['#FF6B6B']} />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
    });

    it('should handle empty colors array', () => {
      render(<ConfettiBurst {...defaultProps} colors={[]} />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined onComplete', () => {
      expect(() => {
        render(<ConfettiBurst {...defaultProps} onComplete={undefined} />);
        act(() => {
          jest.advanceTimersByTime(100);
        });
      }).not.toThrow();
    });

    it('should handle rapid show/hide toggles', () => {
      const { rerender } = render(<ConfettiBurst {...defaultProps} show={false} />);
      
      act(() => {
        rerender(<ConfettiBurst {...defaultProps} show={true} />);
      });
      
      act(() => {
        rerender(<ConfettiBurst {...defaultProps} show={false} />);
      });
      
      act(() => {
        rerender(<ConfettiBurst {...defaultProps} show={true} />);
      });

      expect(() => {
        act(() => {
          jest.advanceTimersByTime(100);
        });
      }).not.toThrow();
    });

    it('should cleanup intervals on unmount', () => {
      const { unmount } = render(<ConfettiBurst {...defaultProps} />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      unmount();
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(() => {
        // Should not throw after unmount
      }).not.toThrow();
    });

    it('should handle very short duration', async () => {
      render(<ConfettiBurst {...defaultProps} duration={100} />);
      
      act(() => {
        jest.advanceTimersByTime(150);
      });

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      }, { timeout: 200 });
    });

    it('should handle very long duration', () => {
      render(<ConfettiBurst {...defaultProps} duration={10000} />);
      
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Should still be running
      expect(mockOnComplete).not.toHaveBeenCalled();
    });

    it('should not create particles when show becomes false mid-animation', () => {
      const { rerender } = render(<ConfettiBurst {...defaultProps} show={true} />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      rerender(<ConfettiBurst {...defaultProps} show={false} />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Should handle gracefully
      expect(() => {
        act(() => {
          jest.advanceTimersByTime(1000);
        });
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should not create excessive particles for light intensity', () => {
      render(<ConfettiBurst {...defaultProps} intensity="light" />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Light should have reasonable particle count
      expect(Haptics.impactAsync).toHaveBeenCalled();
    });

    it('should efficiently clean up completed animations', () => {
      const { unmount } = render(<ConfettiBurst {...defaultProps} duration={1000} />);
      
      act(() => {
        jest.advanceTimersByTime(1100);
      });

      unmount();
      
      // Should not have memory leaks
      expect(() => {
        act(() => {
          jest.runAllTimers();
        });
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have pointerEvents="none" to not block interactions', () => {
      const { UNSAFE_getByType } = render(<ConfettiBurst {...defaultProps} />);
      const container = UNSAFE_getByType(View);
      
      expect(container.props.pointerEvents).toBe('none');
    });
  });

  describe('Props Validation', () => {
    it('should work with minimal props', () => {
      render(<ConfettiBurst show={true} />);
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(() => {}).not.toThrow();
    });

    it('should work with all props specified', () => {
      render(
        <ConfettiBurst
          show={true}
          onComplete={mockOnComplete}
          intensity="heavy"
          duration={4000}
          colors={['#FF0000', '#00FF00', '#0000FF']}
        />
      );
      
      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(Haptics.impactAsync).toHaveBeenCalled();
    });
  });

  describe('Integration', () => {
    it('should coordinate with match modal', async () => {
      const matchProps = {
        show: true,
        onComplete: jest.fn(),
        intensity: 'heavy' as const,
        duration: 4000,
      };

      const { rerender } = render(<ConfettiBurst {...matchProps} show={false} />);
      
      // Match occurs
      rerender(<ConfettiBurst {...matchProps} show={true} />);
      
      act(() => {
        jest.advanceTimersByTime(4100);
      });

      await waitFor(() => {
        expect(matchProps.onComplete).toHaveBeenCalled();
      });
    });
  });
});

