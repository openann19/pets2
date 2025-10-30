import { useRef, useCallback } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export function useScrollOffsetTracker() {
  const lastYRef = useRef(0);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    lastYRef.current = e.nativeEvent.contentOffset.y;
  }, []);

  const getOffset = useCallback(() => lastYRef.current, []);
  return { onScroll, getOffset };
}
