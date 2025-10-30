import { useRef, useCallback } from 'react';
import { Animated, Dimensions, PanResponder } from 'react-native';
import type { PanResponderInstance } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface SwipeGestureState {
  position: Animated.ValueXY;
  rotate: Animated.AnimatedInterpolation<string>;
  likeOpacity: Animated.AnimatedInterpolation<string | number>;
  nopeOpacity: Animated.AnimatedInterpolation<string | number>;
  panResponder: PanResponderInstance;
}

export interface UseSwipeGesturesOptions {
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  onSwipeUp: () => void;
}

/**
 * Hook for managing swipe gestures and animations
 */
export function useSwipeGestures({
  onSwipeRight,
  onSwipeLeft,
  onSwipeUp,
}: UseSwipeGesturesOptions): SwipeGestureState {
  // Animation values
  const position = useRef(new Animated.ValueXY()).current;

  // Rotate interpolation
  const rotate = position.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: ['-30deg', '0deg', '30deg'],
    extrapolate: 'clamp',
  });

  // Like opacity (right swipe)
  const likeOpacity = position.x.interpolate({
    inputRange: [0, screenWidth / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Nope opacity (left swipe)
  const nopeOpacity = position.x.interpolate({
    inputRange: [-screenWidth / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Reset position animation
  const resetPosition = useCallback(() => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  }, [position]);

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        position.setValue({
          x: gestureState.dx,
          y: gestureState.dy,
        });
      },
      onPanResponderRelease: (_evt, gestureState) => {
        const { dx, dy } = gestureState;
        const swipeThreshold = screenWidth * 0.3;

        if (dx > swipeThreshold) {
          // Swipe right - like
          onSwipeRight();
        } else if (dx < -swipeThreshold) {
          // Swipe left - pass
          onSwipeLeft();
        } else if (dy < -swipeThreshold) {
          // Swipe up - super like
          onSwipeUp();
        } else {
          // Snap back
          resetPosition();
        }
      },
    }),
  ).current;

  return {
    position,
    rotate,
    likeOpacity,
    nopeOpacity,
    panResponder,
  };
}
