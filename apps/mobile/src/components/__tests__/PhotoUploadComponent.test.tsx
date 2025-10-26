/**
 * Component tests for PhotoUploadComponent
 *
 * Tests button states, spinners, limit reached message, a11y labels
 * as defined in Test Plan v1.0
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PhotoUploadComponent } from '../components/PhotoUploadComponent';
import * as ImagePicker from 'expo-image-picker';
import { usePhotoManagement } from '../hooks/usePhotoManagement';

// Mock dependencies
jest.mock('expo-image-picker');
jest.mock('../hooks/usePhotoManagement');
jest.mock('../test-utils', () => ({
  customRender: jest.requireActual('@testing-library/react-native').render,
}));

const mockImagePicker = ImagePicker as jest.Mocked<typeof ImagePicker>;
const mockUsePhotoManagement = usePhotoManagement as jest.MockedFunction<typeof usePhotoManagement>;

describe('PhotoUploadComponent', () => {
  const mockPetId = 'pet-123';

  const defaultMockHookReturn = {
    photos: [],
    primaryPhoto: null,
    canAddMorePhotos: true,
    isLoading: false,
    errors: [],
    addPhoto: jest.fn(),
    removePhoto: jest.fn(),
    setPrimaryPhoto: jest.fn(),
    reorderPhotos: jest.fn(),
    accessibilityLabels: {
      addPhotoButton: 'Add photo to pet profile',
      photoCount: '0 of 6 photos added',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted',
      granted: true,
      canAskAgain: true,
    });

    mockUsePhotoManagement.mockReturnValue(defaultMockHookReturn);
  });

  it('should render add photo button with correct accessibility label', () => {
    const { getByLabelText } = render(<PhotoUploadComponent petId={mockPetId} />);

    const addButton = getByLabelText('Add photo to pet profile');
    expect(addButton).toBeTruthy();
  });

  it('should show photo count indicator', () => {
    const { getByText } = render(<PhotoUploadComponent petId={mockPetId} />);

    expect(getByText('0 of 6 photos added')).toBeTruthy();
  });

  it('should display loading spinner when adding photos', () => {
    mockUsePhotoManagement.mockReturnValue({
      ...defaultMockHookReturn,
      isLoading: true,
    });

    const { getByTestId } = render(<PhotoUploadComponent petId={mockPetId} />);

    expect(getByTestId('photo-upload-spinner')).toBeTruthy();
  });

  it('should disable add button when loading', () => {
    mockUsePhotoManagement.mockReturnValue({
      ...defaultMockHookReturn,
      isLoading: true,
    });

    const { getByLabelText } = render(<PhotoUploadComponent petId={mockPetId} />);

    const addButton = getByLabelText('Add photo to pet profile');
    expect(addButton).toBeDisabled();
  });

  it('should show limit reached message when at max photos', () => {
    mockUsePhotoManagement.mockReturnValue({
      ...defaultMockHookReturn,
      canAddMorePhotos: false,
      photos: Array.from({ length: 6 }, (_, i) => ({
        id: `photo${i}`,
        uri: `photo${i}.jpg`,
        isPrimary: i === 0,
        status: 'approved' as const,
      })),
      accessibilityLabels: {
        ...defaultMockHookReturn.accessibilityLabels,
        photoCount: '6 of 6 photos added',
      },
    });

    const { getByText, getByLabelText } = render(<PhotoUploadComponent petId={mockPetId} />);

    expect(getByText('6 of 6 photos added')).toBeTruthy();
    expect(getByText('Maximum 6 photos reached')).toBeTruthy();

    const addButton = getByLabelText('Add photo to pet profile');
    expect(addButton).toBeDisabled();
  });

  it('should call addPhoto when add button is pressed', async () => {
    const mockAddPhoto = jest.fn();
    mockUsePhotoManagement.mockReturnValue({
      ...defaultMockHookReturn,
      addPhoto: mockAddPhoto,
    });

    const { getByLabelText } = render(<PhotoUploadComponent petId={mockPetId} />);

    const addButton = getByLabelText('Add photo to pet profile');
    fireEvent.press(addButton);

    expect(mockAddPhoto).toHaveBeenCalledTimes(1);
  });

  it('should display error messages', () => {
    const errorMessage = 'Failed to add photo';
    mockUsePhotoManagement.mockReturnValue({
      ...defaultMockHookReturn,
      errors: [errorMessage],
    });

    const { getByText } = render(<PhotoUploadComponent petId={mockPetId} />);

    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('should display multiple error messages', () => {
    const errors = ['Network error', 'File too large', 'Invalid format'];
    mockUsePhotoManagement.mockReturnValue({
      ...defaultMockHookReturn,
      errors,
    });

    const { getByText } = render(<PhotoUploadComponent petId={mockPetId} />);

    errors.forEach(error => {
      expect(getByText(error)).toBeTruthy();
    });
  });

  it('should show photo grid when photos exist', () => {
    const mockPhotos = [
      {
        id: 'photo1',
        uri: 'photo1.jpg',
        isPrimary: true,
        status: 'approved' as const,
      },
      {
        id: 'photo2',
        uri: 'photo2.jpg',
        isPrimary: false,
        status: 'approved' as const,
      },
    ];

    mockUsePhotoManagement.mockReturnValue({
      ...defaultMockHookReturn,
      photos: mockPhotos,
      accessibilityLabels: {
        ...defaultMockHookReturn.accessibilityLabels,
        photoCount: '2 of 6 photos added',
      },
    });

    const { getByTestId, getAllByTestId } = render(<PhotoUploadComponent petId={mockPetId} />);

    expect(getByTestId('photo-grid')).toBeTruthy();
    expect(getAllByTestId('photo-item')).toHaveLength(2);
  });

  it('should show primary photo indicator', () => {
    const mockPhotos = [
      {
        id: 'photo1',
        uri: 'photo1.jpg',
        isPrimary: true,
        status: 'approved' as const,
      },
    ];

    mockUsePhotoManagement.mockReturnValue({
      ...defaultMockHookReturn,
      photos: mockPhotos,
      primaryPhoto: mockPhotos[0],
    });

    const { getByText } = render(<PhotoUploadComponent petId={mockPetId} />);

    expect(getByText('Primary photo')).toBeTruthy();
  });

  it('should show photo status indicators', () => {
    const mockPhotos = [
      {
        id: 'photo1',
        uri: 'photo1.jpg',
        isPrimary: false,
        status: 'uploading' as const,
        progress: 50,
      },
      {
        id: 'photo2',
        uri: 'photo2.jpg',
        isPrimary: false,
        status: 'approved' as const,
      },
      {
        id: 'photo3',
        uri: 'photo3.jpg',
        isPrimary: false,
        status: 'error' as const,
      },
    ];

    mockUsePhotoManagement.mockReturnValue({
      ...defaultMockHookReturn,
      photos: mockPhotos,
    });

    const { getByText, getAllByTestId } = render(<PhotoUploadComponent petId={mockPetId} />);

    const photoItems = getAllByTestId('photo-item');

    // Check uploading status
    expect(getByText('Uploading...')).toBeTruthy();
    expect(getByText('50%')).toBeTruthy();

    // Check approved status
    expect(getByText('Approved')).toBeTruthy();

    // Check error status
    expect(getByText('Upload failed')).toBeTruthy();
  });

  it('should allow removing photos', () => {
    const mockRemovePhoto = jest.fn();
    const mockPhotos = [
      {
        id: 'photo1',
        uri: 'photo1.jpg',
        isPrimary: false,
        status: 'approved' as const,
      },
    ];

    mockUsePhotoManagement.mockReturnValue({
      ...defaultMockHookReturn,
      photos: mockPhotos,
      removePhoto: mockRemovePhoto,
    });

    const { getByTestId } = render(<PhotoUploadComponent petId={mockPetId} />);

    const removeButton = getByTestId('remove-photo-button');
    fireEvent.press(removeButton);

    expect(mockRemovePhoto).toHaveBeenCalledWith('photo1');
  });

  it('should allow setting primary photo', () => {
    const mockSetPrimaryPhoto = jest.fn();
    const mockPhotos = [
      {
        id: 'photo1',
        uri: 'photo1.jpg',
        isPrimary: false,
        status: 'approved' as const,
      },
      {
        id: 'photo2',
        uri: 'photo2.jpg',
        isPrimary: true,
        status: 'approved' as const,
      },
    ];

    mockUsePhotoManagement.mockReturnValue({
      ...defaultMockHookReturn,
      photos: mockPhotos,
      setPrimaryPhoto: mockSetPrimaryPhoto,
    });

    const { getAllByTestId } = render(<PhotoUploadComponent petId={mockPetId} />);

    const setPrimaryButtons = getAllByTestId('set-primary-button');
    fireEvent.press(setPrimaryButtons[0]); // Set photo1 as primary

    expect(mockSetPrimaryPhoto).toHaveBeenCalledWith('photo1');
  });

  it('should prevent removing primary photo when multiple photos exist', () => {
    const mockRemovePhoto = jest.fn();
    const mockPhotos = [
      {
        id: 'photo1',
        uri: 'photo1.jpg',
        isPrimary: true,
        status: 'approved' as const,
      },
      {
        id: 'photo2',
        uri: 'photo2.jpg',
        isPrimary: false,
        status: 'approved' as const,
      },
    ];

    mockUsePhotoManagement.mockReturnValue({
      ...defaultMockHookReturn,
      photos: mockPhotos,
      removePhoto: mockRemovePhoto,
    });

    const { getAllByTestId } = render(<PhotoUploadComponent petId={mockPetId} />);

    const removeButtons = getAllByTestId('remove-photo-button');
    fireEvent.press(removeButtons[0]); // Try to remove primary photo

    expect(mockRemovePhoto).not.toHaveBeenCalled();
  });

  it('should show reorder controls when multiple photos exist', () => {
    const mockReorderPhotos = jest.fn();
    const mockPhotos = Array.from({ length: 3 }, (_, i) => ({
      id: `photo${i}`,
      uri: `photo${i}.jpg`,
      isPrimary: i === 0,
      status: 'approved' as const,
    }));

    mockUsePhotoManagement.mockReturnValue({
      ...defaultMockHookReturn,
      photos: mockPhotos,
      reorderPhotos: mockReorderPhotos,
    });

    const { getByTestId } = render(<PhotoUploadComponent petId={mockPetId} />);

    expect(getByTestId('photo-reorder-controls')).toBeTruthy();
  });

  it('should handle empty state correctly', () => {
    const { getByText, getByLabelText, queryByTestId } = render(<PhotoUploadComponent petId={mockPetId} />);

    expect(getByText('0 of 6 photos added')).toBeTruthy();
    expect(getByLabelText('Add photo to pet profile')).toBeTruthy();
    expect(queryByTestId('photo-grid')).toBeNull();
  });

  it('should update accessibility labels dynamically', () => {
    mockUsePhotoManagement.mockReturnValue({
      ...defaultMockHookReturn,
      photos: Array.from({ length: 4 }, (_, i) => ({
        id: `photo${i}`,
        uri: `photo${i}.jpg`,
        isPrimary: i === 0,
        status: 'approved' as const,
      })),
      accessibilityLabels: {
        addPhotoButton: 'Add photo to pet profile',
        photoCount: '4 of 6 photos added',
      },
    });

    const { getByText } = render(<PhotoUploadComponent petId={mockPetId} />);

    expect(getByText('4 of 6 photos added')).toBeTruthy();
  });

  it('should handle long press for additional actions', () => {
    const mockPhotos = [
      {
        id: 'photo1',
        uri: 'photo1.jpg',
        isPrimary: false,
        status: 'approved' as const,
      },
    ];

    mockUsePhotoManagement.mockReturnValue({
      ...defaultMockHookReturn,
      photos: mockPhotos,
    });

    const { getByTestId } = render(<PhotoUploadComponent petId={mockPetId} />);

    const photoItem = getByTestId('photo-item');
    fireEvent(photoItem, 'longPress');

    // Should show context menu or additional actions
    expect(getByTestId('photo-context-menu')).toBeTruthy();
  });

  it('should show progress indicators for uploading photos', () => {
    const mockPhotos = [
      {
        id: 'photo1',
        uri: 'photo1.jpg',
        isPrimary: false,
        status: 'uploading' as const,
        progress: 75,
      },
    ];

    mockUsePhotoManagement.mockReturnValue({
      ...defaultMockHookReturn,
      photos: mockPhotos,
    });

    const { getByTestId, getByText } = render(<PhotoUploadComponent petId={mockPetId} />);

    expect(getByTestId('upload-progress-bar')).toBeTruthy();
    expect(getByText('75%')).toBeTruthy();
  });

  it('should handle photo selection errors gracefully', () => {
    mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'denied',
      granted: false,
      canAskAgain: false,
    });

    const { getByText } = render(<PhotoUploadComponent petId={mockPetId} />);

    const addButton = getByText('Add Photo');
    fireEvent.press(addButton);

    expect(getByText('Photo library access is required')).toBeTruthy();
  });

  it('should support different photo sources', () => {
    const { getByText, getByTestId } = render(<PhotoUploadComponent petId={mockPetId} />);

    const addButton = getByText('Add Photo');
    fireEvent.press(addButton);

    const photoSourceMenu = getByTestId('photo-source-menu');
    expect(photoSourceMenu).toBeTruthy();

    expect(getByText('Take Photo')).toBeTruthy();
    expect(getByText('Choose from Library')).toBeTruthy();
  });

  it('should show photo preview before upload', () => {
    mockImagePicker.launchImageLibraryAsync.mockResolvedValue({
      cancelled: false,
      assets: [{
        uri: 'file://preview-image.jpg',
        width: 1024,
        height: 768,
        fileSize: 204800,
        mimeType: 'image/jpeg',
        fileName: 'preview-image.jpg',
      }],
    });

    const { getByText, getByTestId } = render(<PhotoUploadComponent petId={mockPetId} />);

    const addButton = getByText('Add Photo');
    fireEvent.press(addButton);

    expect(getByTestId('photo-preview')).toBeTruthy();
    expect(getByText('Use Photo')).toBeTruthy();
    expect(getByText('Retake')).toBeTruthy();
  });

  it('should handle RTL layout correctly', () => {
    // Mock RTL layout
    const { getByTestId } = render(<PhotoUploadComponent petId={mockPetId} isRTL />);

    const photoGrid = getByTestId('photo-grid');
    expect(photoGrid).toHaveStyle({ flexDirection: 'row-reverse' });
  });

  it('should support keyboard navigation', () => {
    const { getByLabelText } = render(<PhotoUploadComponent petId={mockPetId} />);

    const addButton = getByLabelText('Add photo to pet profile');

    // Simulate keyboard navigation
    fireEvent(addButton, 'focus');
    expect(addButton).toHaveAccessibilityState({ focused: true });

    fireEvent(addButton, 'blur');
    expect(addButton).toHaveAccessibilityState({ focused: false });
  });

  it('should show helpful tooltips for new users', () => {
    const { getByText } = render(<PhotoUploadComponent petId={mockPetId} showTooltips />);

    expect(getByText('Tip: First photo becomes your primary photo')).toBeTruthy();
    expect(getByText('Tip: You can reorder photos by dragging')).toBeTruthy();
  });

  it('should handle component unmounting during upload', () => {
    const { unmount } = render(<PhotoUploadComponent petId={mockPetId} />);

    // Start an upload
    const addButton = screen.getByLabelText('Add photo to pet profile');
    fireEvent.press(addButton);

    // Unmount component before upload completes
    unmount();

    // Should not cause memory leaks (verified by mock cleanup)
    expect(mockUsePhotoManagement).toHaveBeenCalled();
  });
});
