import { useTheme } from '@/theme';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, Animated, StyleSheet, TextInput, View } from 'react-native';
import { chatMediaService } from '../../services/ChatMediaService';
import { getExtendedColors } from '../../theme/adapters';
import { EliteButton } from '../EliteComponents';
import { GlassContainer } from '../GlassMorphism';
import { PremiumBody } from '../PremiumTypography';
import { MediaPicker } from './MediaPicker';
import { VoiceNoteRecorder } from './VoiceNoteRecorder';
import type { MediaFile, GifResult, StickerResult } from '../../services/ChatMediaService';

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
  testID?: string;
}

const MAX_MESSAGE_LENGTH = 500;

export function MessageInput({
  value,
  onChangeText,
  onSend,
  onTypingChange,
  isSending = false,
  maxLength = MAX_MESSAGE_LENGTH,
  placeholder = 'Type a message...',
  inputRef,
  matchId,
  onAttachmentSent,
  onVoiceNoteSent,
  testID,
}: MessageInputProps): React.JSX.Element {
  const theme = useTheme();
  const colors = getExtendedColors(theme);
  const [characterCount, setCharacterCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

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
    if (isUploading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowMediaPicker(true);
  }, [isUploading]);

  const handleMediaSelected = useCallback(
    async (media: MediaFile | GifResult | StickerResult) => {
      setIsUploading(true);
      try {
        await chatMediaService.sendMedia({
          matchId,
          media,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onAttachmentSent?.();
        setShowMediaPicker(false);
      } catch (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Failed to send media. Please try again.');
      } finally {
        setIsUploading(false);
      }
    },
    [matchId, onAttachmentSent],
  );

  const handleVoicePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowVoiceRecorder(true);
  }, []);

  const handleEmojiPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Open media picker in sticker mode
    setShowMediaPicker(true);
  }, []);

  const handleVoiceNoteSent = useCallback(() => {
    setShowVoiceRecorder(false);
    onVoiceNoteSent?.();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [onVoiceNoteSent]);

  const isNearLimit = characterCount > maxLength * 0.9;
  const isOverLimit = characterCount > maxLength;

  return (
    <GlassContainer
      intensity="heavy"
      transparency="medium"
      border="light"
      shadow="medium"
      testID={testID}
    >
      <View style={styles.container}>
        <EliteButton
          testID="attachment-button"
          title=""
          variant="glass"
          size="sm"
          icon={isUploading ? 'hourglass' : 'add'}
          ripple={true}
          onPress={handleAttachPress}
          disabled={isUploading}
          accessibilityLabel={isUploading ? 'Uploading attachment' : 'Add attachment'}
          accessibilityHint="Tap to attach a photo, video, or file"
          accessibilityRole="button"
        />

        <View style={styles.inputWrapper}>
          <TextInput
            testID="message-text-input"
            ref={inputRef}
            style={StyleSheet.flatten([
              styles.textInput,
              {
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(255,255,255,0.2)',
                color: colors.onSurface || theme.colors.onSurface,
              },
              isTyping && [
                styles.textInputFocused,
                {
                  borderColor: colors.primary,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                },
              ],
              isNearLimit && [
                styles.textInputWarning,
                {
                  borderColor: colors.warning,
                  backgroundColor: 'rgba(245,158,11,0.1)',
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
            accessibilityLabel="Message input"
            accessibilityHint={`Type your message here. Maximum ${maxLength} characters.`}
            accessibilityRole="none"
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
                style={{ color: isOverLimit ? colors.danger : colors.onMuted || theme.colors.onMuted }}
              >
                {characterCount}/{maxLength}
              </PremiumBody>
            </Animated.View>
          )}
        </View>

        <EliteButton
          testID="voice-button"
          title=""
          variant="glass"
          size="sm"
          icon="mic-outline"
          ripple={true}
          onPress={handleVoicePress}
          disabled={isSending || isUploading}
          accessibilityLabel="Record voice note"
          accessibilityHint="Hold to record a voice message"
          accessibilityRole="button"
        />

        <EliteButton
          testID="emoji-button"
          title=""
          variant="glass"
          size="sm"
          icon="happy-outline"
          ripple={true}
          onPress={handleEmojiPress}
          accessibilityLabel="Add emoji or sticker"
          accessibilityHint="Tap to open emoji and sticker picker"
          accessibilityRole="button"
        />

        <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
          <EliteButton
            testID="send-button"
            title=""
            variant={value.trim() || isUploading ? 'primary' : 'glass'}
            size="sm"
            icon={isSending || isUploading ? 'hourglass' : 'send'}
            ripple={true}
            glow={!!(value.trim() || isUploading)}
            shimmer={!!(isSending || isUploading)}
            onPress={handleSend}
            disabled={(!value.trim() && !isUploading) || isSending || isUploading}
            accessibilityLabel={isSending || isUploading ? 'Sending message' : 'Send message'}
            accessibilityHint="Tap to send your message"
            accessibilityRole="button"
            accessibilityState={{ disabled: (!value.trim() && !isUploading) || isSending || isUploading }}
          />
        </Animated.View>
      </View>

      {/* Media Picker */}
      <MediaPicker
        visible={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onMediaSelected={handleMediaSelected}
        mode="all"
        matchId={matchId}
      />

      {/* Voice Note Recorder */}
      <VoiceNoteRecorder
        visible={showVoiceRecorder}
        matchId={matchId}
        onClose={() => setShowVoiceRecorder(false)}
        onSent={handleVoiceNoteSent}
      />
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
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
    textAlignVertical: 'center',
  },
  textInputFocused: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  textInputWarning: {
    // Warning styles handled by theme colors
  },
  characterCountContainer: {
    position: 'absolute',
    bottom: 4,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 4,
  },
});
