/**
 * PhotoUploadSection Comprehensive Component Tests
 * Tests photo upload UI, states, interactions, and edge cases
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@mobile/theme';
import { PhotoUploadSection } from '../PhotoUploadSection';

// Mock dependencies
jest.mock('expo-blur', () => ({
  BlurView: ({ children, style }: any) => {
    const { View } = require('react-native');
    return <View style={style}>{children}</View>;
  },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, style }: any) => {
    const { View } = require('react-native');
    return <View style={style}>{children}</View>;
  },
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider scheme="light">{children}</ThemeProvider>
);

describe('PhotoUploadSection Component Tests', () => {
  const defaultProps = {
    photos: [],
    isUploading: false,
    onAddPhoto: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render photo upload section successfully', () => {
      render(
        <TestWrapper>
          <PhotoUploadSection {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Photos *')).toBeTruthy();
      expect(screen.getByText('Add Photos')).toBeTruthy();
    });

    it('should render upload button with correct accessibility props', () => {
      render(
        <TestWrapper>
          <PhotoUploadSection {...defaultProps} />
        </TestWrapper>,
      );

      const uploadButton = screen.getByTestID('photo-upload-button');
      expect(uploadButton).toHaveAccessibilityLabel('Add photos');
      expect(uploadButton).toHaveAccessibilityRole('button');
      expect(uploadButton).toHaveAccessibilityState({ disabled: false });
    });

    it('should show hint text', () => {
      render(
        <TestWrapper>
          <PhotoUploadSection {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Tap to upload pet photos')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should not show photo count when no photos', () => {
      render(
        <TestWrapper>
          <PhotoUploadSection {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.queryByText(/photo/)).not.toContain('photo');
    });
  });

  describe('With Photos', () => {
    it('should display photo count for single photo', () => {
      render(
        <TestWrapper>
          <PhotoUploadSection {...defaultProps} photos={['photo1.jpg']} />
        </TestWrapper>,
      );

      expect(screen.getByText('1 photo selected')).toBeTruthy();
    });

    it('should display photo count for multiple photos', () => {
      render(
        <TestWrapper>
          <PhotoUploadSection {...defaultProps} photos={['photo1.jpg', 'photo2.jpg', 'photo3.jpg']} />
        </TestWrapper>,
      );

      expect(screen.getByText('3 photos selected')).toBeTruthy();
    });

    it('should handle many photos', () => {
      const manyPhotos = Array.from({ length: 20 }, (_, i) => `photo${i}.jpg`);
      render(
        <TestWrapper>
          <PhotoUploadSection {...defaultProps} photos={manyPhotos} />
        </TestWrapper>,
      );

      expect(screen.getByText('20 photos selected')).toBeTruthy();
    });
  });

  describe('Upload Interactions', () => {
    it('should call onAddPhoto when upload button is pressed', () => {
      render(
        <TestWrapper>
          <PhotoUploadSection {...defaultProps} />
        </TestWrapper>,
      );

      const uploadButton = screen.getByTestID('photo-upload-button');
      fireEvent.press(uploadButton);

      expect(defaultProps.onAddPhoto).toHaveBeenCalledTimes(1);
    });

    it('should not call onAddPhoto when button is disabled during upload', () => {
      render(
        <TestWrapper>
          <PhotoUploadSection {...defaultProps} isUploading={true} />
        </TestWrapper>,
      );

      const uploadButton = screen.getByTestID('photo-upload-button');
      fireEvent.press(uploadButton);

      expect(defaultProps.onAddPhoto).not.toHaveBeenCalled();
    });

    it('should disable button during upload', () => {
      render(
        <TestWrapper>
          <PhotoUploadSection {...defaultProps} isUploading={true} />
        </TestWrapper>,
      );

      const uploadButton = screen.getByTestID('photo-upload-button');
      expect(uploadButton).toHaveAccessibilityState({ disabled: true });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid button presses', () => {
      render(
        <TestWrapper>
          <PhotoUploadSection {...defaultProps} />
        </TestWrapper>,
      );

      const uploadButton = screen.getByTestID('photo-upload-button');
      fireEvent.press(uploadButton);
      fireEvent.press(uploadButton);
      fireEvent.press(uploadButton);

      // Should handle all presses (though actual upload logic may throttle)
      expect(defaultProps.onAddPhoto).toHaveBeenCalledTimes(3);
    });

    it('should handle empty photo array', () => {
      render(
        <TestWrapper>
          <PhotoUploadSection {...defaultProps} photos={[]} />
        </TestWrapper>,
      );

      expect(screen.getByText('Add Photos')).toBeTruthy();
    });

    it('should handle null photos prop gracefully', () => {
      render(
        <TestWrapper>
          <PhotoUploadSection {...defaultProps} photos={null as any} />
        </TestWrapper>,
      );

      // Should render without crashing
      expect(screen.getByText('Photos *')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility state when disabled', () => {
      render(
        <TestWrapper>
          <PhotoUploadSection {...defaultProps} isUploading={true} />
        </TestWrapper>,
      );

      const uploadButton = screen.getByTestID('photo-upload-button');
      expect(uploadButton).toHaveAccessibilityState({ disabled: true });
    });

    it('should have proper accessibility state when enabled', () => {
      render(
        <TestWrapper>
          <PhotoUploadSection {...defaultProps} isUploading={false} />
        </TestWrapper>,
      );

      const uploadButton = screen.getByTestID('photo-upload-button');
      expect(uploadButton).toHaveAccessibilityState({ disabled: false });
    });
  });
});

