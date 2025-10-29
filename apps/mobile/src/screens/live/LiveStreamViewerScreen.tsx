import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { VideoView } from 'livekit-react-native';
import type { RemoteParticipant } from 'livekit-client';
import { useLiveStream } from '../../hooks/useLiveStream';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { AppTheme } from '@mobile/src/theme';
import { useTheme } from '@mobile/src/theme';

interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
}

export function LiveStreamViewerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { streamId } = route.params as { streamId: string };

  const {
    isConnected,
    participants,
    viewerCount,
    error,
    watchStream,
    sendChatMessage,
    sendReaction,
  } = useLiveStream();

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [pinnedMessages] = useState<
    Array<{ messageId: string; content: string }>
  >([]);

  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const statusBarStyle = theme.isDark ? 'light-content' : 'dark-content';
  const placeholderColor = `${theme.colors.onMuted}CC`;

  useEffect(() => {
    if (streamId) {
      watchStream(streamId);
    }

    return () => {
      // Cleanup handled in hook
    };
  }, [streamId, watchStream]);

  const handleSendMessage = useCallback(() => {
    if (messageInput.trim()) {
      sendChatMessage(messageInput);
      setMessageInput('');
    }
  }, [messageInput, sendChatMessage]);

  const handleReaction = useCallback(
    (emoji: string) => {
      sendReaction(emoji);
    },
    [sendReaction],
  );

  const quickReactions = useMemo(() => ['❤️', '🔥', '😍', '👏', '🎉'], []);

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={statusBarStyle} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.backButton}
            testID="LiveStreamViewerScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={statusBarStyle} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Connecting...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={statusBarStyle} />

      {/* Header with live indicator */}
      <View style={styles.header}>
        <TouchableOpacity
          testID="LiveStreamViewerScreen-button-2"
          accessibilityLabel="navigation.goBack();"
          accessibilityRole="button"
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Text style={styles.viewerCount}>{viewerCount} watching</Text>
      </View>

      {/* Video streams */}
      <View style={styles.videoContainer}>
        {participants.length > 0 ? (
          participants.map((participant: RemoteParticipant) => {
            const videoTrack = participant.videoTrackPublications.values().next().value?.track;
            return videoTrack && videoTrack.kind === 'video' ? (
              <VideoView
                key={participant.sid}
                style={styles.videoStream}
                videoTrack={videoTrack as any}
              />
            ) : (
              <View
                key={participant.sid}
                style={styles.noStreamView}
              >
                <Text style={styles.noStreamText}>No video</Text>
              </View>
            );
          })
        ) : (
          <View style={styles.noStreamView}>
            <Text style={styles.noStreamText}>Waiting for stream...</Text>
          </View>
        )}
      </View>

      {/* Pinned messages */}
      {pinnedMessages.length > 0 && (
        <View style={styles.pinnedContainer}>
          <Text style={styles.pinnedLabel}>📌 Pinned</Text>
          <FlatList
            data={pinnedMessages}
            horizontal
            keyExtractor={(item) => item.messageId}
            renderItem={({ item }) => (
              <View style={styles.pinnedMessage}>
                <Text style={styles.pinnedText}>{item.content}</Text>
              </View>
            )}
          />
        </View>
      )}

      {/* Quick reactions */}
      <View style={styles.reactionsContainer}>
        {quickReactions.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            style={styles.reactionButton}
            testID="LiveStreamViewerScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => {
              handleReaction(emoji);
            }}
          >
            <Text style={styles.reactionEmoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chat input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={placeholderColor}
            value={messageInput}
            onChangeText={setMessageInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={styles.sendButton}
            testID="LiveStreamViewerScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={handleSendMessage}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Chat messages */}
      <View style={styles.chatContainer}>
        <FlatList
          data={chatMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.chatMessage}>
              <Text style={styles.chatContent}>{item.content}</Text>
            </View>
          )}
          inverted
        />
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: theme.colors.onBg,
      fontSize: 16,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: 16,
    },
    backButton: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radii.lg,
    },
    backButtonText: {
      color: theme.colors.onSurface,
      fontWeight: '700',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.overlay,
    },
    closeButton: {
      color: theme.colors.onSurface,
      fontSize: 24,
    },
    liveIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    liveDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.danger,
    },
    liveText: {
      color: theme.colors.onSurface,
      fontWeight: '700',
      fontSize: 12,
    },
    viewerCount: {
      color: theme.colors.onSurface,
      fontSize: 12,
    },
    videoContainer: {
      flex: 1,
    },
    videoStream: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    noStreamView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    noStreamText: {
      color: theme.colors.onSurface,
      fontSize: 16,
    },
    pinnedContainer: {
      backgroundColor: `${theme.colors.warning}1A`,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    pinnedLabel: {
      color: theme.colors.warning,
      fontSize: 12,
      fontWeight: '700',
    },
    pinnedMessage: {
      backgroundColor: `${theme.colors.surface}E6`,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radii.lg,
      marginRight: theme.spacing.sm,
    },
    pinnedText: {
      color: theme.colors.onSurface,
      fontSize: 12,
    },
    reactionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.overlay,
    },
    reactionButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: `${theme.colors.onSurface}1A`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    reactionEmoji: {
      fontSize: 24,
      color: theme.colors.onSurface,
    },
    inputContainer: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.overlay,
      gap: theme.spacing.sm,
    },
    input: {
      flex: 1,
      backgroundColor: `${theme.colors.onSurface}1A`,
      color: theme.colors.onSurface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radii.full,
      fontSize: 14,
    },
    sendButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radii.full,
      justifyContent: 'center',
    },
    sendButtonText: {
      color: theme.colors.onPrimary,
      fontWeight: '700',
      fontSize: 14,
    },
    chatContainer: {
      maxHeight: 150,
      backgroundColor: theme.colors.overlay,
    },
    chatMessage: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    chatContent: {
      color: theme.colors.onSurface,
      fontSize: 14,
    },
  });
