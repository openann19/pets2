/**
 * Hook for managing photo navigation in swipe cards
 * Handles photo index state and navigation actions
 */

import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export interface UsePhotoNavigationOptions {
  totalPhotos: number;
  initialIndex?: number;
}

export interface UsePhotoNavigationReturn {
  currentIndex: number;
  nextPhoto: () => void;
  prevPhoto: () => void;
  goToPhoto: (index: number) => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export function usePhotoNavigation({
  totalPhotos,
  initialIndex = 0,
}: UsePhotoNavigationOptions): UsePhotoNavigationReturn {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const nextPhoto = useCallback(() => {
    if (currentIndex < totalPhotos - 1) {
      setCurrentIndex((prev) => prev + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [currentIndex, totalPhotos]);

  const prevPhoto = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [currentIndex]);

  const goToPhoto = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalPhotos) {
        setCurrentIndex(index);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [totalPhotos],
  );

  const canGoNext = currentIndex < totalPhotos - 1;
  const canGoPrev = currentIndex > 0;

  return {
    currentIndex,
    nextPhoto,
    prevPhoto,
    goToPhoto,
    canGoNext,
    canGoPrev,
  };
}
