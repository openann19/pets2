import React, { useCallback, useState } from "react";
import { View, TextInput, StyleSheet, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import EliteButton from "../buttons/EliteButton";
import { PremiumBody } from "../PremiumTypography";
import { tokens } from "@pawfectmatch/design-tokens";
import { useTheme } from "../../contexts/ThemeContext";
import { GlassContainer } from "../GlassMorphism";

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

  // Simplified version without animations for TypeScript compatibility

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
  }, [onTypingChange]);

  const handleBlur = useCallback(() => {
    setIsTyping(false);
    onTypingChange?.(false);
  }, [onTypingChange]);

  const handleSend = useCallback(() => {
    if (!value.trim() || isSending) return;

    // Haptic feedback for send action
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    onSend();
  }, [value, isSending, onSend]);

  const handleAttachPress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Attach Media", "Photo and file sharing coming soon!");
  }, []);

  const handleEmojiPress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          leftIcon="add"
          magneticEffect={true}
          rippleEffect={true}
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
            <View style={[styles.characterCountContainer]}>
              <PremiumBody
                size="sm"
                weight="regular"
                style={{ color: isOverLimit ? colors.error : colors.gray500 }}
              >
                {characterCount}/{maxLength}
              </PremiumBody>
            </View>
          )}
        </View>

        <EliteButton
          title=""
          variant="glass"
          size="sm"
          leftIcon="happy-outline"
          magneticEffect={true}
          rippleEffect={true}
          onPress={handleEmojiPress}
        />

        <View>
          <EliteButton
            title=""
            variant={value.trim() ? "primary" : "glass"}
            size="sm"
            leftIcon={isSending ? "hourglass" : "send"}
            magneticEffect={true}
            rippleEffect={true}
            glowEffect={!!value.trim()}
            shimmerEffect={isSending}
            onPress={handleSend}
            disabled={!value.trim() || isSending}
          />
        </View>
      </View>
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    gap: tokens.spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    position: "relative",
    minHeight: 36,
    maxHeight: 120,
  },
  textInput: {
    borderRadius: tokens.borderRadius.xl,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    fontSize: tokens.typography.body.fontSize,
    lineHeight: tokens.typography.body.lineHeight,
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
    bottom: tokens.spacing.xs,
    right: tokens.spacing.sm,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: tokens.spacing.xs,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.borderRadius.sm,
  },
});
