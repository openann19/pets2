/**
 * 🎯 USE SCROLLY FOR HEADER - Hook to create scrollY SharedValue for header collapse
 * Use this in screens with ScrollView or FlatList to enable header collapse animation
 */

import { useSharedValue } from 'react-native-reanimated';
import { useAnimatedScrollHandler } from 'react-native-reanimated';

interface UseScrollYForHeaderReturn {
  scrollY: ReturnType<typeof useSharedValue<number>>;
  scrollHandler: ReturnType<typeof useAnimatedScrollHandler>;
}

/**
 * Hook that creates a scrollY SharedValue and scroll handler for header collapse
 * 
 * @example
 * ```tsx
 * const { scrollY, scrollHandler } = useScrollYForHeader();
 * 
 * <Animated.ScrollView
 *   onScroll={scrollHandler}
 *   scrollEventThrottle={16}
 * >
 *   ...
 * </Animated.ScrollView>
 * 
 * // Then pass scrollY to SmartHeader via HeaderBus
 * ```
 */
export function useScrollYForHeader(): UseScrollYForHeaderReturn {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return {
    scrollY,
    scrollHandler,
  };
}

