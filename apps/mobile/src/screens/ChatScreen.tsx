import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  InteractionManager,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  StatusBar,
  StyleSheet,
  UIManager,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { EliteContainer } from "../components";
import { ChatHeader } from "../components/chat/ChatHeader";
import { MessageList } from "../components/chat/MessageList";
import { MessageInput } from "../components/chat/MessageInput";
import { QuickReplies } from "../components/chat/QuickReplies";
import ReactionBarMagnetic from "../components/chat/ReactionBarMagnetic";
import { useReactionMetrics } from "../hooks/useInteractionMetrics";
import { useChatData } from "../hooks/useChatData";
import { useTheme } from "../theme/Provider";
import { tokens } from "@pawfectmatch/design-tokens";
import { api } from "../services/api";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import type { RootStackScreenProps } from "../navigation/types";

type ChatScreenProps = RootStackScreenProps<"Chat">;

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const { matchId, petName } = route.params;
  const { isDark } = useTheme();

  // Use the extracted chat data hook
  const { data, actions } = useChatData(matchId);

  // Local state for UI interactions
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const { startInteraction, endInteraction } = useReactionMetrics();

  // Refs
  const flatListRef = useRef<any>(null);
  const inputRef = useRef<any>(null);
  const typingTimeoutRef = useRef<number | null>(null);
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
  }, []);

  // Handle scroll events
  const handleScroll = useCallback(
    async (event: {
      nativeEvent: { contentOffset: { x: number; y: number } };
    }) => {
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
    setInputText(reply);
    inputRef.current?.focus();
  }, []);

  // Handle message long press for reactions
  const handleMessageLongPress = useCallback((messageId: string) => {
    setSelectedMessageId(messageId);
    setShowReactions(true);
  }, []);

  // Handle reaction selection
  const handleReactionSelect = useCallback((emoji: string) => {
    if (selectedMessageId) {
      startInteraction('reaction', { messageId: selectedMessageId, emoji });
      // TODO: Send reaction to server
      console.log(`Reacted with ${emoji} to message ${selectedMessageId}`);
      endInteraction('reaction', true);
    }
    setShowReactions(false);
    setSelectedMessageId(null);
  }, [selectedMessageId, startInteraction, endInteraction]);

  // Handle reaction cancel
  const handleReactionCancel = useCallback(() => {
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

  return (
    <EliteContainer gradient="primary">
      {/* Header */}
      <ChatHeader
        petName={petName}
        isOnline={data.isOnline}
        onBack={() => navigation.goBack()}
        onVoiceCall={handleVoiceCall}
        onVideoCall={handleVideoCall}
        onMoreOptions={handleMoreOptions}
      />

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <MessageList
          messages={data.messages}
          typingUsers={data.otherUserTyping ? ["Other User"] : []}
          isOnline={data.isOnline}
          currentUserId="current-user"
          matchId={matchId}
          onRetryMessage={actions.retryMessage}
          flatListRef={flatListRef}
          onScroll={handleScroll}
        />

        {/* Quick Replies */}
        {data.messages.length > 0 && (
          <QuickReplies
            replies={quickReplies}
            onReplySelect={handleQuickReplySelect}
            visible={true}
          />
        )}

        {/* Input */}
        <MessageInput
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSendMessage}
          onTypingChange={handleTypingChange}
          isSending={data.isSending}
          inputRef={inputRef}
          matchId={matchId}
        />
      </KeyboardAvoidingView>

      {/* Reaction Bar Overlay */}
      {showReactions && (
        <View style={styles.reactionOverlay}>
          <ReactionBarMagnetic
            onSelect={handleReactionSelect}
            onCancel={handleReactionCancel}
            influenceRadius={100}
            baseSize={32}
            backgroundColor={isDark ? "#2a2a2a" : "#ffffff"}
            borderColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
          />
        </View>
      )}
    </EliteContainer>
  );
}

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    paddingTop: 80, // Account for header
  },
  reactionOverlay: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
});
