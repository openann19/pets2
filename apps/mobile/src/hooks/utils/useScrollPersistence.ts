import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FlatList } from "react-native";
import { logger } from "../../services/logger";

export interface UseScrollPersistenceOptions {
  key: string;
  enabled?: boolean;
}

export interface UseScrollPersistenceReturn {
  listRef: React.RefObject<FlatList>;
  initialOffset: number;
  handleScroll: (offset: number) => Promise<void>;
  restoreScroll: () => void;
}

/**
 * Hook for persisting scroll position to AsyncStorage
 *
 * @example
 * const { listRef, initialOffset, handleScroll, restoreScroll } = useScrollPersistence({
 *   key: 'matches_scroll',
 * });
 */
export function useScrollPersistence({
  key,
  enabled = true,
}: UseScrollPersistenceOptions): UseScrollPersistenceReturn {
  const listRef = useRef<FlatList>(null);
  const [initialOffset, setInitialOffset] = useState<number>(0);
  const didRestoreRef = useRef(false);

  // Restore scroll position on mount
  useEffect(() => {
    const restore = async () => {
      if (!enabled) return;

      try {
        const saved = await AsyncStorage.getItem(key);
        if (saved) {
          const offset = Number(saved);
          setInitialOffset(offset);
        }
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to restore scroll position', { key, error: err });
      }
    };

    void restore();
  }, [key, enabled]);

  // Scroll to initial position when data loads
  useEffect(() => {
    if (initialOffset > 0 && !didRestoreRef.current) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({
          offset: initialOffset,
          animated: false,
        });
        didRestoreRef.current = true;
      });
    }
  }, [initialOffset]);

  const handleScroll = useCallback(
    async (offset: number) => {
      if (!enabled) return;

      try {
        await AsyncStorage.setItem(key, String(offset));
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to save scroll position', { key, error: err });
      }
    },
    [key, enabled],
  );

  const restoreScroll = useCallback(() => {
    didRestoreRef.current = false;
    void handleScroll(0);
  }, [handleScroll]);

  return {
    listRef,
    initialOffset,
    handleScroll,
    restoreScroll,
  };
}
