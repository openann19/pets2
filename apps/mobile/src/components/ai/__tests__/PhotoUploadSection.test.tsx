/**
 * PhotoUploadSection Component Tests
 * Comprehensive test coverage for the photo upload component
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PhotoUploadSection } from '../PhotoUploadSection';

// Mock theme
jest.mock('@mobile/theme', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      bg: '#FFFFFF',
      surface: '#F8F9FA',
      onSurface: '#000000',
      onMuted: '#666666',
      border: '#CCCCCC',
    },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    radii: { md: 8, lg: 12, full: 9999 },
    typography: {
      h2: { size: 20, weight: '700' },
      body: { size: 16 },
    },
    shadows: {
      elevation2: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
    },
  })),
}));

describe('PhotoUploadSection', () => {
  const mockOnPickImage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with placeholder when no photo is selected', () => {
      const { getByText, getByTestId } = render(
        <PhotoUploadSection
          selectedPhoto={null}
          onPickImage={mockOnPickImage}
        />,
      );

      expect(getByText('Pet Photo (Optional)')).toBeTruthy();
      expect(getByTestId('photo-upload-button')).toBeTruthy();
      expect(getByText('Add Photo for Better Analysis')).toBeTruthy();
    });

    it('should render with selected photo when photo is provided', () => {
      const photoUri = 'https://example.com/pet-photo.jpg';
      const { getByTestId, queryByText } = render(
        <PhotoUploadSection
          selectedPhoto={photoUri}
          onPickImage={mockOnPickImage}
        />,
      );

      const image = getByTestId('photo-upload-button').findByType('Image');
      expect(image).toBeTruthy();
      expect(queryByText('Add Photo for Better Analysis')).toBeNull();
    });
  });

  describe('User Interactions', () => {
    it('should call onPickImage when button is pressed', () => {
      const { getByTestId } = render(
        <PhotoUploadSection
          selectedPhoto={null}
          onPickImage={mockOnPickImage}
        />,
      );

      const button = getByTestId('photo-upload-button');
      fireEvent.press(button);

      expect(mockOnPickImage).toHaveBeenCalledTimes(1);
    });

    it('should call onPickImage when button with photo is pressed', () => {
      const photoUri = 'https://example.com/pet-photo.jpg';
      const { getByTestId } = render(
        <PhotoUploadSection
          selectedPhoto={photoUri}
          onPickImage={mockOnPickImage}
        />,
      );

      const button = getByTestId('photo-upload-button');
      fireEvent.press(button);

      expect(mockOnPickImage).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility label', () => {
      const { getByTestId } = render(
        <PhotoUploadSection
          selectedPhoto={null}
          onPickImage={mockOnPickImage}
        />,
      );

      const button = getByTestId('photo-upload-button');
      expect(button.props.accessibilityLabel).toBe('Upload pet photo');
      expect(button.props.accessibilityRole).toBe('button');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string photo URI', () => {
      const { getByText } = render(
        <PhotoUploadSection
          selectedPhoto={''}
          onPickImage={mockOnPickImage}
        />,
      );

      expect(getByText('Add Photo for Better Analysis')).toBeTruthy();
    });

    it('should handle rapid button presses', () => {
      const { getByTestId } = render(
        <PhotoUploadSection
          selectedPhoto={null}
          onPickImage={mockOnPickImage}
        />,
      );

      const button = getByTestId('photo-upload-button');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(mockOnPickImage).toHaveBeenCalledTimes(3);
    });
  });
});

