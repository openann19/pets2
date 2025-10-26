import React, { useCallback, useRef, useState } from "react";
import { View, TextInput, StyleSheet, Alert } from "react-native";
import { Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { EliteButton } from "../EliteComponents";
import { GlassContainer } from "../GlassMorphism";
import { PremiumBody } from "../PremiumTypography";
import { tokens } from "@pawfectmatch/design-tokens";
import { useTheme } from "../../contexts/ThemeContext";

interface MessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onTypingChange?: (isTyping: boolean) => void;
  isSending?: boolean;
  maxLength?: number;
  placeholder?: string;
  inputRef?: React.RefObject<TextInput>;
}

const MAX_MESSAGE_LENGTH = 500;

export function MessageInput({
  value,
  onChangeText,
  onSend,
  onTypingChange,
  isSending = false,
  maxLength = MAX_MESSAGE_LENGTH,
  placeholder = "Type a message...",
  inputRef,
}: MessageInputProps): React.JSX.Element {
  const { colors } = useTheme();
  const [characterCount, setCharacterCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const messageEntryAnimation = useRef(new Animated.Value(0)).current;
  const sendButtonScale = useRef(new Animated.Value(1)).current;

  const handleTextChange = useCallback(
    (text: string) => {
      onChangeText(text);
      setCharacterCount(text.length);

      // Notify parent about typing state
      const wasTyping = isTyping;
      const nowTyping = text.length > 0;

      if (wasTyping !== nowTyping) {
        setIsTyping(nowTyping);
        onTypingChange?.(nowTyping);
      }
    },
    [onChangeText, isTyping, onTypingChange],
  );

  const handleFocus = useCallback(() => {
    setIsTyping(true);
    onTypingChange?.(true);
    Animated.timing(messageEntryAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [messageEntryAnimation, onTypingChange]);

  const handleBlur = useCallback(() => {
    setIsTyping(false);
    onTypingChange?.(false);
    Animated.timing(messageEntryAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [messageEntryAnimation, onTypingChange]);

  const handleSend = useCallback(() => {
    if (!value.trim() || isSending) return;

    // Haptic feedback for send action
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate send button
    Animated.sequence([
      Animated.timing(sendButtonScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(sendButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onSend();
  }, [value, isSending, onSend, sendButtonScale]);

  const handleAttachPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Attach Media", "Photo and file sharing coming soon!");
  }, []);

  const handleEmojiPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Emoji Picker", "Emoji picker coming soon! 😊");
  }, []);

  const isNearLimit = characterCount > maxLength * 0.9;
  const isOverLimit = characterCount > maxLength;

  return (
    <GlassContainer
      intensity="heavy"
      transparency="medium"
      border="light"
      shadow="medium"
    >
      <View style={styles.container}>
        <EliteButton
          title=""
          variant="glass"
          size="sm"
          icon="add"
          magnetic={true}
          ripple={true}
          onPress={handleAttachPress}
        />

        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={[
              styles.textInput,
              {
                backgroundColor: "rgba(255,255,255,0.1)",
                borderColor: "rgba(255,255,255,0.2)",
                color: "#fff",
              },
              isTyping && [
                styles.textInputFocused,
                {
                  borderColor: colors.primary,
                  backgroundColor: "rgba(255,255,255,0.2)",
                },
              ],
              isNearLimit && [
                styles.textInputWarning,
                {
                  borderColor: colors.warning,
                  backgroundColor: "rgba(245,158,11,0.1)",
                },
              ],
            ]}
            value={value}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.6)"
            multiline
            maxLength={maxLength}
            onFocus={handleFocus}
            onBlur={handleBlur}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />

          {/* Character Counter */}
          {characterCount > maxLength * 0.8 && (
            <Animated.View
              style={[
                styles.characterCountContainer,
                { opacity: messageEntryAnimation },
              ]}
            >
              <PremiumBody
                size="xs"
                weight="regular"
                style={{ color: isOverLimit ? colors.error : colors.gray500 }}
              >
                {characterCount}/{maxLength}
              </PremiumBody>
            </Animated.View>
          )}
        </View>

        <EliteButton
          title=""
          variant="glass"
          size="sm"
          icon="happy-outline"
          magnetic={true}
          ripple={true}
          onPress={handleEmojiPress}
        />

        <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
          <EliteButton
            title=""
            variant={value.trim() ? "primary" : "glass"}
            size="sm"
            icon={isSending ? "hourglass" : "send"}
            magnetic={true}
            ripple={true}
            glow={value.trim()}
            shimmer={isSending}
            onPress={handleSend}
            disabled={!value.trim() || isSending}
          />
        </Animated.View>
      </View>
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    position: "relative",
    minHeight: 36,
    maxHeight: 120,
  },
  textInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    lineHeight: 24,
    borderWidth: 1,
    textAlignVertical: "center",
  },
  textInputFocused: {
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  textInputWarning: {
    // Warning styles handled by theme colors
  },
  characterCountContainer: {
    position: "absolute",
    bottom: 4,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 4,
  },
});
