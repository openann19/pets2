import { useCallback } from 'react';
import { Animated, Dimensions } from 'react-native';

// Lazy load dimensions to support test mocking
const getDimensions = () => {
  try {
    const dims = Dimensions.get('window');
    return { width: dims?.width ?? 375, height: dims?.height ?? 812 };
  } catch {
    return { width: 375, height: 812 };
  }
};
const { width: screenWidth, height: screenHeight } = getDimensions();

export interface UseSwipeAnimationsReturn {
  animateSwipe: (
    action: 'like' | 'pass' | 'superlike',
    position: Animated.ValueXY,
  ) => Promise<void>;
}

/**
 * Hook for managing swipe animations
 */
export function useSwipeAnimations(): UseSwipeAnimationsReturn {
  const animateSwipe = useCallback(
    async (action: 'like' | 'pass' | 'superlike', position: Animated.ValueXY) => {
      const toValue = action === 'like' ? screenWidth : action === 'pass' ? -screenWidth : 0;

      return new Promise<void>((resolve) => {
        Animated.timing(position, {
          toValue: {
            x: toValue,
            y: action === 'superlike' ? -screenHeight : 0,
          },
          duration: 300,
          useNativeDriver: false,
        }).start(() => {
          // Reset position for next card
          position.setValue({ x: 0, y: 0 });
          resolve();
        });
      });
    },
    [],
  );

  return {
    animateSwipe,
  };
}
