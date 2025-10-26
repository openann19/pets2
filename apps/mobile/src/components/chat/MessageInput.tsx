import React, { useCallback, useRef, useState } from "react";
import { View, TextInput, StyleSheet, Alert } from "react-native";
import { Animated } from "react-native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { EliteButton } from "../EliteComponents";
import { GlassContainer } from "../GlassMorphism";
import { PremiumBody } from "../PremiumTypography";
import { tokens } from "@pawfectmatch/design-tokens";
import { useTheme } from "../../theme/Provider";
import { chatService } from "../../services/chatService";
import { VoiceRecorder } from "./VoiceRecorder";
import { Theme } from '../../theme/unified-theme';

interface MessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onTypingChange?: (isTyping: boolean) => void;
  isSending?: boolean;
  maxLength?: number;
  placeholder?: string;
  inputRef?: React.RefObject<TextInput>;
  matchId: string;
  onAttachmentSent?: () => void;
  onVoiceNoteSent?: () => void;
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
  matchId,
  onAttachmentSent,
  onVoiceNoteSent,
}: MessageInputProps): React.JSX.Element {
  const { colors } = useTheme();
  const [characterCount, setCharacterCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

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

  const handleAttachPress = useCallback(async () => {
    if (isUploading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Needed",
          "Please grant photo library access to send attachments.",
        );
        return;
      }

      // Show attachment options
      Alert.alert(
        "Add Attachment",
        "Choose an option",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Photo Library",
            onPress: async () => {
              setIsUploading(true);
              try {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 0.8,
                  allowsMultipleSelection: false,
                });

                if (!result.canceled && result.assets && result.assets[0]) {
                  const asset = result.assets[0];
                  // Convert URI to Blob for upload
                  const response = await fetch(asset.uri);
                  const blob = await response.blob();

                  // Send attachment using chatService
                  await chatService.sendAttachment({
                    matchId,
                    attachmentType: "image",
                    file: blob,
                  });

                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success,
                  );
                  onAttachmentSent?.();
                }
              } catch (error) {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Error,
                );
                Alert.alert(
                  "Error",
                  "Failed to send attachment. Please try again.",
                );
              } finally {
                setIsUploading(false);
              }
            },
          },
          {
            text: "Take Photo",
            onPress: async () => {
              setIsUploading(true);
              try {
                const { status } =
                  await ImagePicker.requestCameraPermissionsAsync();
                if (status !== "granted") {
                  Alert.alert(
                    "Permission Needed",
                    "Camera access required to take photos.",
                  );
                  setIsUploading(false);
                  return;
                }

                const result = await ImagePicker.launchCameraAsync({
                  allowsEditing: true,
                  quality: 0.8,
                });

                if (!result.canceled && result.assets && result.assets[0]) {
                  const asset = result.assets[0];
                  const response = await fetch(asset.uri);
                  const blob = await response.blob();

                  await chatService.sendAttachment({
                    matchId,
                    attachmentType: "image",
                    file: blob,
                  });

                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success,
                  );
                  onAttachmentSent?.();
                }
              } catch (error) {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Error,
                );
                Alert.alert("Error", "Failed to take photo. Please try again.");
              } finally {
                setIsUploading(false);
              }
            },
          },
        ],
        { cancelable: true },
      );
    } catch (error) {
      Alert.alert("Error", "Failed to open photo picker.");
    }
  }, [isUploading, matchId, onAttachmentSent]);

  const handleEmojiPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Emoji Picker", "Emoji picker coming soon! 😊");
  }, []);

  const handleVoicePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowVoiceRecorder(true);
  }, []);

  const handleVoiceNoteSent = useCallback(() => {
    setShowVoiceRecorder(false);
    onVoiceNoteSent?.();
  }, [onVoiceNoteSent]);

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
          icon={isUploading ? "hourglass" : "add"}
          ripple={true}
          onPress={handleAttachPress}
          disabled={isUploading}
        />

        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={StyleSheet.flatten([
              styles.textInput,
              {
                backgroundColor: "rgba(255,255,255,0.1)",
                borderColor: "rgba(255,255,255,0.2)",
                color: "Theme.colors.neutral[0]",
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
            ])}
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
              style={StyleSheet.flatten([
                styles.characterCountContainer,
                { opacity: messageEntryAnimation },
              ])}
            >
              <PremiumBody
                size="sm"
                weight="regular"
                style={{ color: isOverLimit ? colors.danger : colors.gray500 }}
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
          ripple={true}
          onPress={handleEmojiPress}
        />

        <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
          <EliteButton
            title=""
            variant={value.trim() || isUploading ? "primary" : "glass"}
            size="sm"
            icon={isSending || isUploading ? "hourglass" : "send"}
            ripple={true}
            glow={!!(value.trim() || isUploading)}
            shimmer={!!(isSending || isUploading)}
            onPress={handleSend}
            disabled={
              (!value.trim() && !isUploading) || isSending || isUploading
            }
          />
        </Animated.View>
      </View>

      {/* Voice Recorder */}
      {showVoiceRecorder && (
        <VoiceRecorder
          matchId={matchId}
          onVoiceNoteSent={handleVoiceNoteSent}
        />
      )}
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
