/**
 * Hook for managing photo compare mode (original vs edited)
 * Handles press-and-hold to show original, release to show edited
 */

import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export interface UsePhotoCompareOptions {
  duration?: number;
}

export interface UsePhotoCompareReturn {
  comparing: boolean;
  originalOpacity: ReturnType<typeof useAnimatedStyle>;
  editedOpacity: ReturnType<typeof useAnimatedStyle>;
  onCompareIn: () => void;
  onCompareOut: () => void;
}

export function usePhotoCompare({
  duration = 160,
}: UsePhotoCompareOptions = {}): UsePhotoCompareReturn {
  const [comparing, setComparing] = useState(false);
  const compare = useSharedValue(0); // 0=edited, 1=original

  const originalOpacity = useAnimatedStyle(() => ({
    opacity: compare.value,
  }));

  const editedOpacity = useAnimatedStyle(() => ({
    opacity: 1 - compare.value,
  }));

  const onCompareIn = useCallback(() => {
    setComparing(true);
    Haptics.selectionAsync();
    compare.value = withTiming(1, { duration });
  }, [compare, duration]);

  const onCompareOut = useCallback(() => {
    setComparing(false);
    compare.value = withTiming(0, { duration });
  }, [compare, duration]);

  return {
    comparing,
    originalOpacity,
    editedOpacity,
    onCompareIn,
    onCompareOut,
  };
}
