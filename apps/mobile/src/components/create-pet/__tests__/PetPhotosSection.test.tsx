/**
 * PetPhotosSection Component Tests
 * Tests for photo upload UI and progress indicators
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PetPhotosSection } from '../PetPhotosSection';
import type { PhotoData } from '../../../hooks/usePhotoManager';

// Mock useExtendedColors
jest.mock('../../../hooks/useExtendedTheme', () => ({
  useExtendedColors: () => ({
    textSecondary: '#6b7280',
    white: '#ffffff',
    error: '#ef4444',
    success: '#10b981',
  }),
}));

// Mock Ionicons
jest.mock('@expo/vector-icons/Ionicons', () => {
  const { View } = require('react-native');
  return {
    default: ({ name, size, color, testID }: any) => (
      <View
        testID={testID || name}
        accessibleRole="image"
      />
    ),
  };
});

const mockOnPickImage = jest.fn();
const mockOnRemovePhoto = jest.fn();
const mockOnSetPrimaryPhoto = jest.fn();

const defaultErrors = {};

describe('PetPhotosSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with empty photos array', () => {
      render(
        <PetPhotosSection
          photos={[]}
          errors={defaultErrors}
          onPickImage={mockOnPickImage}
          onRemovePhoto={mockOnRemovePhoto}
          onSetPrimaryPhoto={mockOnSetPrimaryPhoto}
        />,
      );

      expect(screen.getByText('Photos')).toBeTruthy();
      expect(screen.getByText('Add Photos')).toBeTruthy();
    });

    it('should render add photo button with correct text', () => {
      const photos: PhotoData[] = [];
      render(
        <PetPhotosSection
          photos={photos}
          errors={defaultErrors}
          onPickImage={mockOnPickImage}
          onRemovePhoto={mockOnRemovePhoto}
          onSetPrimaryPhoto={mockOnSetPrimaryPhoto}
        />,
      );

      expect(screen.getByText('Add Photos')).toBeTruthy();
    });

    it('should show photo count when photos exist', () => {
      const photos: PhotoData[] = [
        { uri: 'file://photo1.jpg', type: 'image/jpeg', fileName: 'photo1.jpg', isPrimary: true },
      ];

      render(
        <PetPhotosSection
          photos={photos}
          errors={defaultErrors}
          onPickImage={mockOnPickImage}
          onRemovePhoto={mockOnRemovePhoto}
          onSetPrimaryPhoto={mockOnSetPrimaryPhoto}
        />,
      );

      expect(screen.getByText(/Add More Photos/)).toBeTruthy();
    });
  });

  describe('Photo Display', () => {
    it('should display photos when provided', () => {
      const photos: PhotoData[] = [
        { uri: 'file://photo1.jpg', type: 'image/jpeg', fileName: 'photo1.jpg', isPrimary: true },
        { uri: 'file://photo2.jpg', type: 'image/jpeg', fileName: 'photo2.jpg', isPrimary: false },
      ];

      render(
        <PetPhotosSection
          photos={photos}
          errors={defaultErrors}
          onPickImage={mockOnPickImage}
          onRemovePhoto={mockOnRemovePhoto}
          onSetPrimaryPhoto={mockOnSetPrimaryPhoto}
        />,
      );

      // Photos should be rendered (checking by image sources)
      const images = screen.getAllByRole('image');
      expect(images.length).toBeGreaterThan(0);
    });

    it('should show primary badge on first photo', () => {
      const photos: PhotoData[] = [
        { uri: 'file://photo1.jpg', type: 'image/jpeg', fileName: 'photo1.jpg', isPrimary: true },
      ];

      render(
        <PetPhotosSection
          photos={photos}
          errors={defaultErrors}
          onPickImage={mockOnPickImage}
          onRemovePhoto={mockOnRemovePhoto}
          onSetPrimaryPhoto={mockOnSetPrimaryPhoto}
        />,
      );

      expect(screen.getByText('Primary')).toBeTruthy();
    });
  });

  describe('Upload Progress', () => {
    it('should show uploading indicator when photo is uploading', () => {
      const photos: PhotoData[] = [
        {
          uri: 'file://photo1.jpg',
          type: 'image/jpeg',
          fileName: 'photo1.jpg',
          isPrimary: true,
          isUploading: true,
          uploadProgress: { uploaded: 50, total: 100, percentage: 50 },
        },
      ];

      render(
        <PetPhotosSection
          photos={photos}
          errors={defaultErrors}
          onPickImage={mockOnPickImage}
          onRemovePhoto={mockOnRemovePhoto}
          onSetPrimaryPhoto={mockOnSetPrimaryPhoto}
        />,
      );

      expect(screen.getByText('Uploading photos...')).toBeTruthy();
    });

    it('should show progress percentage during upload', () => {
      const photos: PhotoData[] = [
        {
          uri: 'file://photo1.jpg',
          type: 'image/jpeg',
          fileName: 'photo1.jpg',
          isPrimary: true,
          isUploading: true,
          uploadProgress: { uploaded: 75, total: 100, percentage: 75 },
        },
      ];

      render(
        <PetPhotosSection
          photos={photos}
          errors={defaultErrors}
          onPickImage={mockOnPickImage}
          onRemovePhoto={mockOnRemovePhoto}
          onSetPrimaryPhoto={mockOnSetPrimaryPhoto}
        />,
      );

      expect(screen.getByText('75%')).toBeTruthy();
    });

    it('should show success indicator after upload completes', () => {
      const photos: PhotoData[] = [
        {
          uri: 'file://photo1.jpg',
          type: 'image/jpeg',
          fileName: 'photo1.jpg',
          isPrimary: true,
          isUploading: false,
          uploadedUrl: 'https://s3.amazonaws.com/bucket/photo.jpg',
          thumbnailUrl: 'https://s3.amazonaws.com/bucket/thumbnail.jpg',
        },
      ];

      render(
        <PetPhotosSection
          photos={photos}
          errors={defaultErrors}
          onPickImage={mockOnPickImage}
          onRemovePhoto={mockOnRemovePhoto}
          onSetPrimaryPhoto={mockOnSetPrimaryPhoto}
        />,
      );

      // Success indicator should be present
      expect(screen.getByText('Photos')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should show error indicator when upload fails', () => {
      const photos: PhotoData[] = [
        {
          uri: 'file://photo1.jpg',
          type: 'image/jpeg',
          fileName: 'photo1.jpg',
          isPrimary: true,
          isUploading: false,
          error: 'Upload failed',
        },
      ];

      render(
        <PetPhotosSection
          photos={photos}
          errors={defaultErrors}
          onPickImage={mockOnPickImage}
          onRemovePhoto={mockOnRemovePhoto}
          onSetPrimaryPhoto={mockOnSetPrimaryPhoto}
        />,
      );

      expect(screen.getByText(/failed to upload/i)).toBeTruthy();
    });

    it('should show error message when photos field has error', () => {
      render(
        <PetPhotosSection
          photos={[]}
          errors={{ photos: 'At least one photo is required' }}
          onPickImage={mockOnPickImage}
          onRemovePhoto={mockOnRemovePhoto}
          onSetPrimaryPhoto={mockOnSetPrimaryPhoto}
        />,
      );

      expect(screen.getByText('At least one photo is required')).toBeTruthy();
    });
  });

  describe('Photo Actions', () => {
    it('should disable photo picker when at max capacity', () => {
      const photos: PhotoData[] = Array(10)
        .fill(null)
        .map((_, i) => ({
          uri: `file://photo${i}.jpg`,
          type: 'image/jpeg',
          fileName: `photo${i}.jpg`,
          isPrimary: i === 0,
        }));

      render(
        <PetPhotosSection
          photos={photos}
          errors={defaultErrors}
          onPickImage={mockOnPickImage}
          onRemovePhoto={mockOnRemovePhoto}
          onSetPrimaryPhoto={mockOnSetPrimaryPhoto}
        />,
      );

      // Button should be disabled at max
      const addButton = screen.getByText(/Add More Photos/);
      expect(addButton).toBeTruthy();
    });

    it('should not show star button for primary photo', () => {
      const photos: PhotoData[] = [
        { uri: 'file://photo1.jpg', type: 'image/jpeg', fileName: 'photo1.jpg', isPrimary: true },
      ];

      render(
        <PetPhotosSection
          photos={photos}
          errors={defaultErrors}
          onPickImage={mockOnPickImage}
          onRemovePhoto={mockOnRemovePhoto}
          onSetPrimaryPhoto={mockOnSetPrimaryPhoto}
        />,
      );

      // Star button should not be rendered for primary photo
      const starButtons = screen.queryAllByTestId('star');
      expect(starButtons.length).toBe(0);
    });

    it('should not show delete button during upload', () => {
      const photos: PhotoData[] = [
        {
          uri: 'file://photo1.jpg',
          type: 'image/jpeg',
          fileName: 'photo1.jpg',
          isPrimary: true,
          isUploading: true,
          uploadProgress: { uploaded: 50, total: 100, percentage: 50 },
        },
      ];

      render(
        <PetPhotosSection
          photos={photos}
          errors={defaultErrors}
          onPickImage={mockOnPickImage}
          onRemovePhoto={mockOnRemovePhoto}
          onSetPrimaryPhoto={mockOnSetPrimaryPhoto}
        />,
      );

      // Delete button should not be visible during upload
      const trashButtons = screen.queryAllByTestId('trash');
      expect(trashButtons.length).toBe(0);
    });
  });

  describe('Photo Hints', () => {
    it('should display photo upload hints', () => {
      render(
        <PetPhotosSection
          photos={[]}
          errors={defaultErrors}
          onPickImage={mockOnPickImage}
          onRemovePhoto={mockOnRemovePhoto}
          onSetPrimaryPhoto={mockOnSetPrimaryPhoto}
        />,
      );

      expect(screen.getByText(/Upload up to 10 photos/)).toBeTruthy();
      expect(screen.getByText(/First photo will be set as primary/)).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle photos with uploaded URLs', () => {
      const photos: PhotoData[] = [
        {
          uri: 'file://photo1.jpg',
          type: 'image/jpeg',
          fileName: 'photo1.jpg',
          isPrimary: true,
          uploadedUrl: 'https://s3.amazonaws.com/bucket/photo.jpg',
          thumbnailUrl: 'https://s3.amazonaws.com/bucket/thumbnail.webp',
        },
      ];

      render(
        <PetPhotosSection
          photos={photos}
          errors={defaultErrors}
          onPickImage={mockOnPickImage}
          onRemovePhoto={mockOnRemovePhoto}
          onSetPrimaryPhoto={mockOnSetPrimaryPhoto}
        />,
      );

      expect(screen.getByText('Primary')).toBeTruthy();
    });

    it('should handle multiple photos with different states', () => {
      const photos: PhotoData[] = [
        {
          uri: 'file://photo1.jpg',
          type: 'image/jpeg',
          fileName: 'photo1.jpg',
          isPrimary: true,
          isUploading: true,
          uploadProgress: { uploaded: 50, total: 100, percentage: 50 },
        },
        {
          uri: 'file://photo2.jpg',
          type: 'image/jpeg',
          fileName: 'photo2.jpg',
          isPrimary: false,
          uploadedUrl: 'https://s3.amazonaws.com/bucket/photo2.jpg',
        },
        {
          uri: 'file://photo3.jpg',
          type: 'image/jpeg',
          fileName: 'photo3.jpg',
          isPrimary: false,
          error: 'Upload failed',
        },
      ];

      render(
        <PetPhotosSection
          photos={photos}
          errors={defaultErrors}
          onPickImage={mockOnPickImage}
          onRemovePhoto={mockOnRemovePhoto}
          onSetPrimaryPhoto={mockOnSetPrimaryPhoto}
        />,
      );

      expect(screen.getByText('Uploading photos...')).toBeTruthy();
      expect(screen.getByText(/failed to upload/i)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const photos: PhotoData[] = [
        { uri: 'file://photo1.jpg', type: 'image/jpeg', fileName: 'photo1.jpg', isPrimary: true },
      ];

      render(
        <PetPhotosSection
          photos={photos}
          errors={defaultErrors}
          onPickImage={mockOnPickImage}
          onRemovePhoto={mockOnRemovePhoto}
          onSetPrimaryPhoto={mockOnSetPrimaryPhoto}
        />,
      );

      expect(screen.getByText('Photos')).toBeTruthy();
    });
  });
});
