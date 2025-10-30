/**
 * Tests for usePhotoNavigation hook
 */

import { renderHook, act } from '@testing-library/react-native';
import { usePhotoNavigation } from '../usePhotoNavigation';
import * as Haptics from 'expo-haptics';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

describe('usePhotoNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default index 0', () => {
    const { result } = renderHook(() =>
      usePhotoNavigation({
        totalPhotos: 5,
      }),
    );

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.canGoNext).toBe(true);
    expect(result.current.canGoPrev).toBe(false);
  });

  it('should initialize with custom initial index', () => {
    const { result } = renderHook(() =>
      usePhotoNavigation({
        totalPhotos: 5,
        initialIndex: 2,
      }),
    );

    expect(result.current.currentIndex).toBe(2);
    expect(result.current.canGoNext).toBe(true);
    expect(result.current.canGoPrev).toBe(true);
  });

  it('should navigate to next photo', () => {
    const { result } = renderHook(() =>
      usePhotoNavigation({
        totalPhotos: 5,
      }),
    );

    act(() => {
      result.current.nextPhoto();
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.canGoNext).toBe(true);
    expect(result.current.canGoPrev).toBe(true);
    expect(Haptics.impactAsync).toHaveBeenCalled();
  });

  it('should navigate to previous photo', () => {
    const { result } = renderHook(() =>
      usePhotoNavigation({
        totalPhotos: 5,
        initialIndex: 2,
      }),
    );

    act(() => {
      result.current.prevPhoto();
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.canGoNext).toBe(true);
    expect(result.current.canGoPrev).toBe(true);
    expect(Haptics.impactAsync).toHaveBeenCalled();
  });

  it('should not navigate beyond bounds', () => {
    const { result } = renderHook(() =>
      usePhotoNavigation({
        totalPhotos: 3,
        initialIndex: 2,
      }),
    );

    act(() => {
      result.current.nextPhoto();
    });

    expect(result.current.currentIndex).toBe(2);
    expect(result.current.canGoNext).toBe(false);

    act(() => {
      result.current.prevPhoto();
      result.current.prevPhoto();
      result.current.prevPhoto();
    });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.canGoPrev).toBe(false);
  });

  it('should go to specific photo index', () => {
    const { result } = renderHook(() =>
      usePhotoNavigation({
        totalPhotos: 5,
      }),
    );

    act(() => {
      result.current.goToPhoto(3);
    });

    expect(result.current.currentIndex).toBe(3);
    expect(Haptics.impactAsync).toHaveBeenCalled();
  });

  it('should not go to invalid index', () => {
    const { result } = renderHook(() =>
      usePhotoNavigation({
        totalPhotos: 5,
      }),
    );

    act(() => {
      result.current.goToPhoto(-1);
      result.current.goToPhoto(10);
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it('should update canGoNext and canGoPrev flags correctly', () => {
    const { result } = renderHook(() =>
      usePhotoNavigation({
        totalPhotos: 3,
        initialIndex: 1,
      }),
    );

    expect(result.current.canGoNext).toBe(true);
    expect(result.current.canGoPrev).toBe(true);

    act(() => {
      result.current.nextPhoto();
    });

    expect(result.current.canGoNext).toBe(false);
    expect(result.current.canGoPrev).toBe(true);

    act(() => {
      result.current.prevPhoto();
      result.current.prevPhoto();
    });

    expect(result.current.canGoNext).toBe(true);
    expect(result.current.canGoPrev).toBe(false);
  });
});
