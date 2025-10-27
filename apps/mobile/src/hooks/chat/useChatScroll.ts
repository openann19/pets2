import { useRef, useState, useEffect } from "react";
import type { FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "../../services/logger";

export interface UseChatScrollOptions {
  matchId: string;
  enabled?: boolean;
}

export interface UseChatScrollReturn {
  flatListRef: React.RefObject<FlatList>;
  initialOffset: number;
  handleScroll: (offset: number) => Promise<void>;
}

/**
 * Hook for managing chat scroll position persistence
 */
export function useChatScroll({
  matchId,
  enabled = true,
}: UseChatScrollOptions): UseChatScrollReturn {
  const flatListRef = useRef<FlatList>(null);
  const [initialOffset, setInitialOffset] = useState(0);
  const didRestoreRef = useRef(false);

  // Restore scroll position on mount
  useEffect(() => {
    const restore = async () => {
      if (!enabled) return;

      try {
        const saved = await AsyncStorage.getItem(
          `mobile_chat_scroll_${matchId}`,
        );
        if (saved) {
          setInitialOffset(Number(saved));
        }
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("Failed to restore scroll position for chat", { matchId, error: err });
      }
    };

    void restore();
  }, [matchId, enabled]);

  // Scroll to initial position when data loads
  useEffect(() => {
    if (initialOffset > 0 && !didRestoreRef.current) {
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToOffset({
          offset: initialOffset,
          animated: false,
        });
        didRestoreRef.current = true;
      });
    }
  }, [initialOffset]);

  let writeTimer: ReturnType<typeof setTimeout> | undefined;
  const handleScroll = async (offset: number) => {
    if (!enabled) return;
    if (writeTimer) clearTimeout(writeTimer);
    writeTimer = setTimeout(() => {
      AsyncStorage.setItem(`mobile_chat_scroll_${matchId}`, String(offset)).catch(() => {});
    }, 250);
  };

  return {
    flatListRef,
    initialOffset,
    handleScroll,
  };
}
