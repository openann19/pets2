/**
 * Hook for slide-to-cancel gesture handling
 * Uses PanResponder to detect horizontal drag gestures for cancellation
 */

import { useMemo, useRef, useState } from 'react';
import { PanResponder } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface UseSlideToCancelOptions {
  enabled: boolean;
  cancelThreshold?: number;
  onCancel: () => void;
  onRelease?: (willCancel: boolean) => void;
}

export interface UseSlideToCancelReturn {
  panResponder: ReturnType<typeof PanResponder.create>;
  isCancelling: boolean;
}

export function useSlideToCancel({
  enabled,
  cancelThreshold = 80,
  onCancel,
  onRelease,
}: UseSlideToCancelOptions): UseSlideToCancelReturn {
  const [isCancelling, setIsCancelling] = useState(false);
  const panState = useRef({ dx: 0 });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => enabled,
        onMoveShouldSetPanResponder: () => enabled,
        onPanResponderMove: (_, gestureState) => {
          panState.current.dx = gestureState.dx;
          setIsCancelling(gestureState.dx < -cancelThreshold);
        },
        onPanResponderRelease: () => {
          const cancel = panState.current.dx < -cancelThreshold;
          panState.current.dx = 0;
          if (cancel) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            onCancel();
          }
          setIsCancelling(false);
          onRelease?.(cancel);
        },
      }),
    [enabled, cancelThreshold, onCancel, onRelease],
  );

  return {
    panResponder,
    isCancelling,
  };
}

