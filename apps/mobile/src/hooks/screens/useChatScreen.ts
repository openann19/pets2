/**
 * useChatScreen Hook
 * Manages ChatScreen UI state and interactions
 * Extracts all local state, refs, animations, and handlers from ChatScreen component
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  InteractionManager,
  Platform,
  StatusBar,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LayoutAnimation } from "react-native";
import type { RootStackScreenProps } from "../../navigation/types";
import { useChatData } from "../useChatData";
import { useReactionMetrics } from "../useInteractionMetrics";
import { useTheme } from "../../theme/Provider";
import { api } from "../../services/api";
import { haptic } from "../../ui/haptics";
import { logger } from "../../services/logger";

interface UseChatScreenParams {
  matchId: string;
  petName: string;
  navigation: RootStackScreenProps<"Chat">["navigation"];
}

interface UseChatScreenReturn {
  // State
  inputText: string;
  setInputText: (text: string) => void;
  isTyping: boolean;
  showReactions: boolean;
  selectedMessageId: string | null;
  
  // Data from useChatData
  data: ReturnType<typeof useChatData>["data"];
  actions: ReturnType<typeof useChatData>["actions"];
  
  // Refs
  flatListRef: React.RefObject<any>;
  inputRef: React.RefObject<any>;
  
  // Handlers
  handleSendMessage: () => Promise<void>;
  handleTypingChange: (typing: boolean) => void;
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  handleQuickReplySelect: (reply: string) => void;
  handleMessageLongPress: (messageId: string) => void;
  handleReactionSelect: (emoji: string) => void;
  handleReactionCancel: () => void;
  handleVoiceCall: () => Promise<void>;
  handleVideoCall: () => Promise<void>;
  handleMoreOptions: () => void;
  
  // Constants
  quickReplies: string[];
}

export const useChatScreen = ({
  matchId,
  petName,
  navigation,
}: UseChatScreenParams): UseChatScreenReturn => {
  const { isDark } = useTheme();
  const { startInteraction, endInteraction } = useReactionMetrics();
  
  // Use the extracted chat data hook
  const { data, actions } = useChatData(matchId);

  // Local state for UI interactions
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  // Refs
  const flatListRef = useRef<any>(null);
  const inputRef = useRef<any>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedOffsetRef = useRef<number>(0);
  const didRestoreRef = useRef<boolean>(false);

  // Animations
  const typingAnimation = useRef(new Animated.Value(0)).current;

  // Initialize component
  useEffect(() => {
    StatusBar.setBarStyle(isDark ? "light-content" : "dark-content");

    InteractionManager.runAfterInteractions(() => {
      startTypingAnimation();
      inputRef.current?.focus();
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isDark]);

  // Draft persistence
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await AsyncStorage.getItem(
          `mobile_chat_draft_${matchId}`,
        );
        if (draft) {
          setInputText(draft);
        }
      } catch {
        // Ignore errors
      }
    };
    loadDraft();
  }, [matchId]);

  useEffect(() => {
    const persist = async () => {
      try {
        const key = `mobile_chat_draft_${matchId}`;
        if (inputText) {
          await AsyncStorage.setItem(key, inputText);
        } else {
          await AsyncStorage.removeItem(key);
        }
      } catch {
        // Ignore errors
      }
    };
    persist();
  }, [inputText, matchId]);

  // Restore scroll position
  useEffect(() => {
    const tryRestore = async () => {
      if (didRestoreRef.current) return;
      try {
        const saved = await AsyncStorage.getItem(
          `mobile_chat_scroll_${matchId}`,
        );
        const offset = saved ? Number(saved) : 0;
        if (offset > 0) {
          savedOffsetRef.current = offset;
          InteractionManager.runAfterInteractions(() => {
            flatListRef.current?.scrollToOffset({ offset, animated: false });
          });
        }
        didRestoreRef.current = true;
      } catch {
        // Ignore errors
      }
    };
    if (!data.isLoading) {
      tryRestore();
    }
  }, [data.isLoading, matchId]);

  // Typing animation
  const startTypingAnimation = useCallback(() => {
    Animated.loop(
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 400,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 400,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, [typingAnimation]);

  // Handle message sending
  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim()) return;

    const messageContent = inputText.trim();

    // Haptic feedback for send action
    haptic.confirm();

    // Clear input immediately for better UX
    setInputText("");

    // Add message with animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // Send message via hook
    await actions.sendMessage(messageContent);

    // Smooth scroll to bottom
    InteractionManager.runAfterInteractions(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  }, [inputText, actions]);

  // Handle typing changes
  const handleTypingChange = useCallback((typing: boolean) => {
    setIsTyping(typing);

    // Debounced typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (typing) {
      // Emit typing event to server
      api.chat.sendTypingIndicator(matchId, true);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        // Emit stop typing event to server
        api.chat.sendTypingIndicator(matchId, false);
      }, 1000);
    }
  }, [matchId]);

  // Handle scroll events
  const handleScroll = useCallback(
    async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      try {
        const offset = event.nativeEvent.contentOffset.y;
        await AsyncStorage.setItem(
          `mobile_chat_scroll_${matchId}`,
          String(offset),
        );
      } catch {
        // Ignore errors
      }
    },
    [matchId],
  );

  // Handle quick reply selection
  const handleQuickReplySelect = useCallback((reply: string) => {
    haptic.tap();
    setInputText(reply);
    inputRef.current?.focus();
  }, []);

  // Handle message long press for reactions
  const handleMessageLongPress = useCallback((messageId: string) => {
    haptic.tap();
    setSelectedMessageId(messageId);
    setShowReactions(true);
  }, []);

  // Handle reaction selection
  const handleReactionSelect = useCallback((emoji: string) => {
    if (selectedMessageId) {
      haptic.confirm();
      startInteraction('reaction', { messageId: selectedMessageId, emoji });
      // TODO: Send reaction to server
      logger.info("Reacted with emoji", { emoji, messageId: selectedMessageId });
      endInteraction('reaction', true);
    }
    setShowReactions(false);
    setSelectedMessageId(null);
  }, [selectedMessageId, startInteraction, endInteraction]);

  // Handle reaction cancel
  const handleReactionCancel = useCallback(() => {
    haptic.selection();
    setShowReactions(false);
    setSelectedMessageId(null);
  }, []);

  // Call handlers
  const handleVoiceCall = useCallback(async () => {
    Alert.alert("Voice Call", `Start a voice call with ${petName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Call",
        onPress: async () => {
          Alert.alert("Call Feature", "Voice calling feature coming soon!");
        },
      },
    ]);
  }, [petName]);

  const handleVideoCall = useCallback(async () => {
    Alert.alert("Video Call", `Start a video call with ${petName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Call",
        onPress: async () => {
          Alert.alert("Call Feature", "Video calling feature coming soon!");
        },
      },
    ]);
  }, [petName]);

  const handleMoreOptions = useCallback(() => {
    Alert.alert("More Options", "Additional options coming soon!");
  }, []);

  // Quick replies
  const quickReplies = [
    "Sounds good! 👍",
    "When works for you?",
    "Let's do it! 🎾",
    "Perfect! 😊",
  ];

  return {
    // State
    inputText,
    setInputText,
    isTyping,
    showReactions,
    selectedMessageId,
    
    // Data
    data,
    actions,
    
    // Refs
    flatListRef,
    inputRef,
    
    // Handlers
    handleSendMessage,
    handleTypingChange,
    handleScroll,
    handleQuickReplySelect,
    handleMessageLongPress,
    handleReactionSelect,
    handleReactionCancel,
    handleVoiceCall,
    handleVideoCall,
    handleMoreOptions,
    
    // Constants
    quickReplies,
  };
};

