import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import {
  Alert,
  FlatList,
  TextInput,
  InteractionManager,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EliteContainer } from "../components/EliteComponents";
import { ChatHeader } from "../components/chat/ChatHeader";
import { MessageList } from "../components/chat/MessageList";
import { MessageInput } from "../components/chat/MessageInput";
import { QuickReplies } from "../components/chat/QuickReplies";
import { useChatData } from "../hooks/useChatData";
import { useTheme } from "../contexts/ThemeContext";

// Enable LayoutAnimation on Android (removed UIManager dependency)
if (Platform.OS === "android") {
  // LayoutAnimation is automatically enabled in RN 0.60+
}

type RootStackParamList = {
  Chat: { matchId: string; petName: string };
  Matches: undefined;
};

type ChatScreenProps = NativeStackScreenProps<RootStackParamList, "Chat">;

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const { matchId, petName } = route.params;
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Data layer
  const { data, actions } = useChatData(matchId);

  // UI state
  const [inputText, setInputText] = useState("");

  // Refs
  const flatListRef = useRef<FlatList | null>(null);
  const inputRef = useRef<TextInput | null>(null);
  const didRestoreRef = useRef<boolean>(false);

  // Keys
  const draftKey = useMemo(() => `mobile_chat_draft_${matchId}`, [matchId]);
  const scrollKey = useMemo(() => `mobile_chat_scroll_${matchId}`, [matchId]);

  // Status bar style on mount & theme change
  useEffect(() => {
    StatusBar.setBarStyle(isDark ? "light-content" : "dark-content");
  }, [isDark]);

  // Initial focus + light boot work after interactions
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      inputRef.current?.focus();
    });
    return () => {
      task.cancel();
    };
  }, []);

  // Load draft (once)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const draft = await AsyncStorage.getItem(draftKey);
        if (mounted && draft) setInputText(draft);
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [draftKey]);

  // Debounced draft persistence
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        if (inputText) {
          await AsyncStorage.setItem(draftKey, inputText);
        } else {
          await AsyncStorage.removeItem(draftKey);
        }
      } catch {
        // ignore
      }
    }, 250);
    return () => {
      clearTimeout(t);
    };
  }, [inputText, draftKey]);

  // Restore scroll position only once when messages are loaded
  useEffect(() => {
    if (didRestoreRef.current || data.isLoading) return;

    void (async () => {
      try {
        const saved = await AsyncStorage.getItem(scrollKey);
        const offset = saved ? Number(saved) : 0;

        InteractionManager.runAfterInteractions(() => {
          if (offset > 0) {
            flatListRef.current?.scrollToOffset({ offset, animated: false });
          } else {
            // No saved position -> start at bottom for classic chat UX
            flatListRef.current?.scrollToEnd({ animated: false });
          }
          didRestoreRef.current = true;
        });
      } catch {
        // ignore
      }
    })();
  }, [data.isLoading, scrollKey]);

  // Send message
  const handleSendMessage = useCallback(async () => {
    const messageContent = inputText.trim();
    if (!messageContent || data.isSending) return;

    // Optimistic UI: clear input immediately
    setInputText("");

    try {
      await actions.sendMessage(messageContent);
      InteractionManager.runAfterInteractions(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      });
    } catch (err: any) {
      // On failure, restore input and notify
      setInputText(messageContent);
      Alert.alert("Send failed", err?.message ?? "Please try again.");
    }
  }, [inputText, data.isSending, actions]);

  // Typing indicator hook point (lint-friendly, no-op until wired)
  const handleTypingChange = useCallback((_isTyping: boolean) => {
    // Integrate your real-time typing pub/sub here (Socket, Ably, Pusher, etc.)
  }, []);

  // Persist scroll offset (throttled naturally by RN event cadence)
  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { x: number; y: number } } }) => {
      const offset = event.nativeEvent.contentOffset.y;
      AsyncStorage.setItem(scrollKey, String(offset)).catch(() => {
        // Ignore errors
      });
    },
    [scrollKey],
  );

  // Quick replies (stable reference)
  const quickReplies = useMemo(
    () => [
      "Sounds good! 👍",
      "When works for you?",
      "Let's do it! 🎾",
      "Perfect! 😊",
    ],
    [],
  );

  const keyboardOffset = insets.top + 56; // header height approximation

  return (
    <EliteContainer gradient="primary">
      {/* Header */}
      <ChatHeader
        petName={petName}
        isOnline={data.isOnline}
        onBack={() => navigation.goBack()}
        onVoiceCall={() => {
          Alert.alert("Voice Call", `Start a voice call with ${petName}?`, [
            { text: "Cancel", style: "cancel" },
            {
              text: "Call",
              onPress: () => {
                Alert.alert("Call Feature", "Voice calling is coming soon.");
              },
            },
          ]);
        }}
        onVideoCall={() => {
          Alert.alert("Video Call", `Start a video call with ${petName}?`, [
            { text: "Cancel", style: "cancel" },
            {
              text: "Call",
              onPress: () => {
                Alert.alert("Call Feature", "Video calling is coming soon.");
              },
            },
          ]);
        }}
        onMoreOptions={() => {
          Alert.alert("More Options", "Additional options are coming soon.");
        }}
      />

      {/* Messages + Input */}
      <KeyboardAvoidingView
        style={[
          styles.chatContainer,
          { paddingTop: 72 + insets.top, paddingBottom: insets.bottom || 8 },
        ]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardOffset}
      >
        <MessageList
          messages={data.messages}
          typingUsers={data.typingUsers}
          isOnline={data.isOnline}
          onRetryMessage={(messageId: string) => {
            void actions.retryMessage(messageId);
          }}
          flatListRef={flatListRef}
          onScroll={handleScroll}
        />

        {data.messages.length > 0 && (
          <QuickReplies
            replies={quickReplies}
            onReplySelect={(reply: string) => {
              setInputText(reply);
              inputRef.current?.focus();
            }}
            visible
          />
        )}

        <MessageInput
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSendMessage}
          onTypingChange={handleTypingChange}
          isSending={data.isSending}
          inputRef={inputRef}
        />
      </KeyboardAvoidingView>
    </EliteContainer>
  );
}

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
  },
});
