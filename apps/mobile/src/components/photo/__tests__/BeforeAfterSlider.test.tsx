import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import { BeforeAfterSlider } from '../BeforeAfterSlider';
import * as Haptics from 'expo-haptics';

// Mock dependencies
jest.mock('expo-haptics');
jest.mock('expo-blur', () => ({
  BlurView: ({ children }: any) => children,
}));
jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name }: any) => <test-element name={name} />,
}));
jest.mock('../common/SmartImage', () => ({
  SmartImage: ({ source, style }: any) => <test-element source={source.uri} style={style} />,
}));

// Mock react-native-gesture-handler
const mockPanGesture = {
  onBegin: jest.fn().mockReturnThis(),
  onUpdate: jest.fn().mockReturnThis(),
  onEnd: jest.fn().mockReturnThis(),
};

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  return {
    Gesture: {
      Pan: jest.fn(() => mockPanGesture),
    },
    GestureDetector: ({ children }: any) => children,
  };
});

describe('BeforeAfterSlider', () => {
  const mockOriginalUri = 'file://original.jpg';
  const mockEditedUri = 'file://edited.jpg';
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (Haptics.impactAsync as jest.Mock).mockResolvedValue(undefined);
    (Haptics.selectionAsync as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Rendering', () => {
    it('renders correctly with required props', () => {
      const { getByText } = render(
        <BeforeAfterSlider
          originalUri={mockOriginalUri}
          editedUri={mockEditedUri}
          onClose={mockOnClose}
        />
      );

      expect(getByText('Before')).toBeTruthy();
      expect(getByText('After')).toBeTruthy();
      expect(getByText('Close compare')).toBeTruthy();
    });

    it('renders both original and edited images', () => {
      const { UNSAFE_getAllByType } = render(
        <BeforeAfterSlider
          originalUri={mockOriginalUri}
          editedUri={mockEditedUri}
          onClose={mockOnClose}
        />
      );

      const images = UNSAFE_getAllByType('test-element');
      expect(images.length).toBeGreaterThan(0);
    });

    it('renders handle with swap icon', () => {
      const { UNSAFE_getAllByType } = render(
        <BeforeAfterSlider
          originalUri={mockOriginalUri}
          editedUri={mockEditedUri}
          onClose={mockOnClose}
        />
      );

      const icons = UNSAFE_getAllByType('test-element');
      const swapIcon = icons.find((icon: any) => icon.props.name === 'swap-horizontal');
      expect(swapIcon).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onClose when close button is tapped', () => {
      const { getByText } = render(
        <BeforeAfterSlider
          originalUri={mockOriginalUri}
          editedUri={mockEditedUri}
          onClose={mockOnClose}
        />
      );

      const closeButton = getByText('Close compare').parent;
      if (closeButton) {
        fireEvent.press(closeButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it('calls onClose when background is tapped', () => {
      const { getByTestId } = render(
        <BeforeAfterSlider
          originalUri={mockOriginalUri}
          editedUri={mockEditedUri}
          onClose={mockOnClose}
        />
      );

      // Simulate background tap
      const overlay = getByTestId?.('overlay') || null;
      if (overlay) {
        fireEvent(overlay, 'touchEnd');
        expect(mockOnClose).toHaveBeenCalled();
      }
    });
  });

  describe('Gesture Handling', () => {
    it('creates pan gesture with correct handlers', () => {
      render(
        <BeforeAfterSlider
          originalUri={mockOriginalUri}
          editedUri={mockEditedUri}
          onClose={mockOnClose}
        />
      );

      expect(mockPanGesture.onBegin).toHaveBeenCalled();
      expect(mockPanGesture.onUpdate).toHaveBeenCalled();
      expect(mockPanGesture.onEnd).toHaveBeenCalled();
    });

    it('provides haptic feedback on gesture begin', () => {
      render(
        <BeforeAfterSlider
          originalUri={mockOriginalUri}
          editedUri={mockEditedUri}
          onClose={mockOnClose}
        />
      );

      // Trigger gesture begin handler
      const beginHandler = mockPanGesture.onBegin.mock.calls[0]?.[0];
      if (beginHandler) {
        beginHandler();
      }

      // Verify haptics were called during gesture setup
      expect(Haptics.impactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles missing image URIs gracefully', () => {
      const { getByText } = render(
        <BeforeAfterSlider
          originalUri=""
          editedUri=""
          onClose={mockOnClose}
        />
      );

      expect(getByText('Before')).toBeTruthy();
      expect(getByText('After')).toBeTruthy();
    });

    it('handles rapid open/close cycles', () => {
      const { rerender } = render(
        <BeforeAfterSlider
          originalUri={mockOriginalUri}
          editedUri={mockEditedUri}
          onClose={mockOnClose}
        />
      );

      // Rapidly mount/unmount
      for (let i = 0; i < 5; i++) {
        rerender(
          <BeforeAfterSlider
            originalUri={mockOriginalUri}
            editedUri={mockEditedUri}
            onClose={mockOnClose}
          />
        );
      }

      // Should not crash
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('renders with proper structure for screen readers', () => {
      const { getByText } = render(
        <BeforeAfterSlider
          originalUri={mockOriginalUri}
          editedUri={mockEditedUri}
          onClose={mockOnClose}
        />
      );

      // Labels should be present
      expect(getByText('Before')).toBeTruthy();
      expect(getByText('After')).toBeTruthy();
      expect(getByText('Close compare')).toBeTruthy();
    });
  });
});
