import { useRef, useState, useEffect } from "react";
import type { FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UseChatScrollOptions {
  matchId: string;
  enabled?: boolean;
}

export interface UseChatScrollReturn {
  flatListRef: React.RefObject<FlatList<any>>;
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
  const flatListRef = useRef<FlatList<any>>(null);
  const [initialOffset, setInitialOffset] = useState(0);
  const didRestoreRef = useRef(false);

  // Restore scroll position on mount
  useEffect(() => {
    const restore = async () => {
      if (!enabled) return;

      try {
        const saved = await AsyncStorage.getItem(`mobile_chat_scroll_${matchId}`);
        if (saved) {
          setInitialOffset(Number(saved));
        }
      } catch (error) {
        console.error(`Failed to restore scroll position for chat ${matchId}:`, error);
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

  const handleScroll = async (offset: number) => {
    if (!enabled) return;

    try {
      await AsyncStorage.setItem(`mobile_chat_scroll_${matchId}`, String(offset));
    } catch (error) {
      console.error(`Failed to save scroll position for chat ${matchId}:`, error);
    }
  };

  return {
    flatListRef,
    initialOffset,
    handleScroll,
  };
}
