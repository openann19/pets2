import { useState, useCallback, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UseChatInputOptions {
  matchId: string;
  maxLength?: number;
  enabled?: boolean;
}

export interface UseChatInputReturn {
  inputText: string;
  setInputText: (text: string) => void;
  clearInput: () => void;
  isTyping: boolean;
  handleTyping: (isTyping: boolean) => void;
}

/**
 * Hook for managing chat input state and draft persistence
 */
export function useChatInput({
  matchId,
  maxLength = 500,
  enabled = true,
}: UseChatInputOptions): UseChatInputReturn {
  const [inputText, setInputTextState] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load draft from storage on mount
  useEffect(() => {
    const loadDraft = async () => {
      if (!enabled) return;

      try {
        const key = `mobile_chat_draft_${matchId}`;
        const draft = await AsyncStorage.getItem(key);
        if (draft) {
          setInputTextState(draft);
        }
      } catch (error) {
        console.error("Failed to load draft:", error);
      }
    };

    void loadDraft();
  }, [matchId, enabled]);

  // Persist draft to storage
  useEffect(() => {
    const persist = async () => {
      if (!enabled) return;

      try {
        const key = `mobile_chat_draft_${matchId}`;
        if (inputText) {
          await AsyncStorage.setItem(key, inputText);
        } else {
          await AsyncStorage.removeItem(key);
        }
      } catch (error) {
        console.error("Failed to persist draft:", error);
      }
    };

    void persist();
  }, [inputText, matchId, enabled]);

  const setInputText = useCallback(
    (text: string) => {
      if (text.length <= maxLength) {
        setInputTextState(text);
      }
    },
    [maxLength],
  );

  const clearInput = useCallback(() => {
    setInputTextState("");

    // Clear draft from storage
    void AsyncStorage.removeItem(`mobile_chat_draft_${matchId}`);
  }, [matchId]);

  const handleTyping = useCallback((typing: boolean) => {
    setIsTyping(typing);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (typing) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    inputText,
    setInputText,
    clearInput,
    isTyping,
    handleTyping,
  };
}
