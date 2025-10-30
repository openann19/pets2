/**
 * 🖼️ IMAGE DOMINANT-COLOR FADE-IN
 * Blur-up from dominant color to final image; avoids flash
 * No layout shift; memory stable
 */

import React from 'react';
import type { ImageStyle, ImageProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Image } from 'react-native';

import { motion, getEasingArray } from '@/theme/motion';
import { useMotionGuards } from '@/utils/motionGuards';

interface UseDominantColorFadeReturn {
  imageStyle: ReturnType<typeof useAnimatedStyle>;
  placeholderStyle: ReturnType<typeof useAnimatedStyle>;
  onLoad: () => void;
}

/**
 * Hook for dominant color fade-in animation
 * Shows placeholder color, then fades in image
 */
export function useDominantColorFade(dominantColor?: string): UseDominantColorFadeReturn {
  const guards = useMotionGuards();
  const imageOpacity = useSharedValue(0);
  const placeholderOpacity = useSharedValue(1);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const imageStyle = useAnimatedStyle(() => {
    return {
      opacity: imageOpacity.value,
    };
  });

  const placeholderStyle = useAnimatedStyle(() => {
    return {
      opacity: placeholderOpacity.value,
    };
  });

  const onLoad = React.useCallback(() => {
    setImageLoaded(true);

    if (!guards.shouldAnimate) {
      // Instant show on reduced motion
      imageOpacity.value = 1;
      placeholderOpacity.value = 0;
      return;
    }

    // Fade in image
    imageOpacity.value = withTiming(1, {
      duration: motion.duration.slow,
      easing: getEasingArray('standard'),
    });

    // Fade out placeholder
    placeholderOpacity.value = withDelay(
      motion.duration.base,
      withTiming(0, {
        duration: motion.duration.base,
        easing: getEasingArray('decel'),
      }),
    );
  }, [guards.shouldAnimate]);

  return {
    imageStyle,
    placeholderStyle,
    onLoad,
  };
}

/**
 * Dominant Color Fade Image Component
 */
interface DominantColorFadeImageProps extends ImageProps {
  dominantColor?: string;
  style?: ImageStyle;
}

export function DominantColorFadeImage({
  dominantColor = '#E5E7EB', // Default gray placeholder
  style,
  ...imageProps
}: DominantColorFadeImageProps): React.JSX.Element {
  const { imageStyle, placeholderStyle, onLoad } = useDominantColorFade(dominantColor);

  return (
    <>
      {/* Placeholder */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: dominantColor,
          },
          placeholderStyle,
          style,
        ]}
      />
      {/* Image */}
      <Animated.Image
        {...imageProps}
        style={[style, imageStyle]}
        onLoad={onLoad}
      />
    </>
  );
}
