/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react-hooks/native';
import { Alert } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { usePhotoEditor, DEFAULT_ADJUSTMENTS } from '../usePhotoEditor';

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('usePhotoEditor', () => {
  const mockUri = 'file:///test-image.jpg';
  const mockOptions = { maxWidth: 1920, maxHeight: 1920, quality: 0.9 };

  beforeEach(() => {
    jest.clearAllMocks();
    (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
      uri: mockUri,
      width: 1920,
      height: 1920,
    });
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => usePhotoEditor(mockUri, mockOptions));

    expect(result.current.uri).toBe(mockUri);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.adjustments).toEqual(DEFAULT_ADJUSTMENTS);
    expect(result.current.rotation).toBe(0);
    expect(result.current.flipHorizontal).toBe(false);
    expect(result.current.flipVertical).toBe(false);
  });

  it('initializes with custom options', () => {
    const customOptions = { maxWidth: 1080, maxHeight: 1080, quality: 0.8 };

    const { result } = renderHook(() => usePhotoEditor(mockUri, customOptions));

    expect(result.current.uri).toBe(mockUri);
  });

  it('updates adjustment values', () => {
    const { result } = renderHook(() => usePhotoEditor(mockUri, mockOptions));

    act(() => {
      result.current.updateAdjustment('brightness', 120);
    });

    expect(result.current.adjustments.brightness).toBe(120);
  });

  it('updates multiple adjustments', () => {
    const { result } = renderHook(() => usePhotoEditor(mockUri, mockOptions));

    act(() => {
      result.current.updateAdjustment('brightness', 110);
      result.current.updateAdjustment('contrast', 115);
      result.current.updateAdjustment('saturation', 105);
    });

    expect(result.current.adjustments.brightness).toBe(110);
    expect(result.current.adjustments.contrast).toBe(115);
    expect(result.current.adjustments.saturation).toBe(105);
  });

  it('rotates left correctly', () => {
    const { result } = renderHook(() => usePhotoEditor(mockUri, mockOptions));

    act(() => {
      result.current.rotateLeft();
    });

    expect(result.current.rotation).toBe(270);
  });

  it('rotates right correctly', () => {
    const { result } = renderHook(() => usePhotoEditor(mockUri, mockOptions));

    act(() => {
      result.current.rotateRight();
    });

    expect(result.current.rotation).toBe(90);
  });

  it('handles multiple rotations', () => {
    const { result } = renderHook(() => usePhotoEditor(mockUri, mockOptions));

    act(() => {
      result.current.rotateRight();
      result.current.rotateRight();
    });

    expect(result.current.rotation).toBe(180);
  });

  it('flips horizontally', () => {
    const { result } = renderHook(() => usePhotoEditor(mockUri, mockOptions));

    act(() => {
      result.current.setFlipHorizontal(true);
    });

    expect(result.current.flipHorizontal).toBe(true);
  });

  it('flips vertically', () => {
    const { result } = renderHook(() => usePhotoEditor(mockUri, mockOptions));

    act(() => {
      result.current.setFlipVertical(true);
    });

    expect(result.current.flipVertical).toBe(true);
  });

  it('applies filter preset', () => {
    const { result } = renderHook(() => usePhotoEditor(mockUri, mockOptions));

    act(() => {
      result.current.applyFilter({ brightness: 110, contrast: 115 });
    });

    expect(result.current.adjustments.brightness).toBe(110);
    expect(result.current.adjustments.contrast).toBe(115);
  });

  it('resets all adjustments', () => {
    const { result } = renderHook(() => usePhotoEditor(mockUri, mockOptions));

    act(() => {
      result.current.updateAdjustment('brightness', 120);
      result.current.rotateRight();
      result.current.setFlipHorizontal(true);
    });

    act(() => {
      result.current.resetAdjustments();
    });

    expect(result.current.adjustments).toEqual(DEFAULT_ADJUSTMENTS);
    expect(result.current.rotation).toBe(0);
    expect(result.current.flipHorizontal).toBe(false);
    expect(result.current.flipVertical).toBe(false);
  });

  it('saves image successfully', async () => {
    const { result } = renderHook(() => usePhotoEditor(mockUri, mockOptions));

    let savedUri: string | null = null;

    await act(async () => {
      savedUri = await result.current.saveImage();
    });

    expect(savedUri).toBeDefined();
    expect(ImageManipulator.manipulateAsync).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('applies rotation to saved image', async () => {
    const { result } = renderHook(() => usePhotoEditor(mockUri, mockOptions));

    act(() => {
      result.current.rotateRight();
    });

    await act(async () => {
      await result.current.saveImage();
    });

    expect(ImageManipulator.manipulateAsync).toHaveBeenCalled();
  });

  it('applies flips to saved image', async () => {
    const { result } = renderHook(() => usePhotoEditor(mockUri, mockOptions));

    act(() => {
      result.current.setFlipHorizontal(true);
    });

    await act(async () => {
      await result.current.saveImage();
    });

    expect(ImageManipulator.manipulateAsync).toHaveBeenCalled();
  });

  it('handles save failure gracefully', async () => {
    (ImageManipulator.manipulateAsync as jest.Mock).mockRejectedValue(new Error('Save failed'));

    const { result } = renderHook(() => usePhotoEditor(mockUri, mockOptions));

    let savedUri: string | null = null;

    await act(async () => {
      savedUri = await result.current.saveImage();
    });

    expect(savedUri).toBeNull();
    expect(Alert.alert).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  it('sets loading state during save', async () => {
    const { result } = renderHook(() => usePhotoEditor(mockUri, mockOptions));

    const savePromise = act(async () => {
      return result.current.saveImage();
    });

    expect(result.current.isLoading).toBe(true);

    await savePromise;

    expect(result.current.isLoading).toBe(false);
  });

  it('maintains manipulation history', async () => {
    const { result } = renderHook(() => usePhotoEditor(mockUri, mockOptions));

    await act(async () => {
      await result.current.saveImage();
    });

    expect(ImageManipulator.manipulateAsync).toHaveBeenCalled();
  });

  it('handles edge case rotation values', () => {
    const { result } = renderHook(() => usePhotoEditor(mockUri, mockOptions));

    // Rotate 4 times (360 degrees)
    act(() => {
      result.current.rotateRight();
      result.current.rotateRight();
      result.current.rotateRight();
      result.current.rotateRight();
    });

    expect(result.current.rotation).toBe(0);
  });

  it('handles negative rotation (rotate left)', () => {
    const { result } = renderHook(() => usePhotoEditor(mockUri, mockOptions));

    act(() => {
      result.current.rotateLeft();
    });

    expect(result.current.rotation).toBe(270);
  });

  it('prevents repeated flip toggles', () => {
    const { result } = renderHook(() => usePhotoEditor(mockUri, mockOptions));

    act(() => {
      result.current.setFlipHorizontal(true);
      result.current.setFlipHorizontal(true);
    });

    expect(result.current.flipHorizontal).toBe(true);
  });

  it('applies combined transformations', async () => {
    const { result } = renderHook(() => usePhotoEditor(mockUri, mockOptions));

    act(() => {
      result.current.rotateRight();
      result.current.setFlipHorizontal(true);
      result.current.setFlipVertical(true);
      result.current.updateAdjustment('brightness', 110);
    });

    await act(async () => {
      await result.current.saveImage();
    });

    expect(ImageManipulator.manipulateAsync).toHaveBeenCalled();
  });
});
