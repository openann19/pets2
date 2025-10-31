/**
 * Support Chat View Component
 * Displays the conversation with a customer
 */

import { Ionicons } from '@expo/vector-icons';
import { memo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import type { SupportMessage } from '../types';

interface SupportChatViewProps {
  messages: SupportMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onCloseChat: () => void;
  chatUserName: string;
}

function formatMessageTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}

export const SupportChatView = memo<SupportChatViewProps>(
  ({ messages, isLoading, onSendMessage, onCloseChat, chatUserName }) => {
    const theme = useTheme();
    const styles = useMemo(() => makeStyles(theme), [theme]);
    const [messageText, setMessageText] = useState('');

    const handleSend = () => {
      const trimmed = messageText.trim();
      if (!trimmed) return;
      onSendMessage(trimmed);
      setMessageText('');
    };

    const handleCloseChat = () => {
      Alert.alert('Close Chat', 'Are you sure you want to close this support chat?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close',
          style: 'destructive',
          onPress: onCloseChat,
        },
      ]);
    };

    const renderMessage = ({ item }: { item: SupportMessage }) => {
      const isAdmin = item.senderType === 'admin';
      return (
        <View
          style={[
            styles.messageContainer,
            isAdmin ? styles.adminMessage : styles.userMessage,
          ]}
        >
          <View
            style={[
              styles.messageBubble,
              {
                backgroundColor: isAdmin ? theme.colors.primary : theme.colors.surfaceAlt,
              },
            ]}
          >
            <Text
              style={[
                styles.senderName,
                { color: isAdmin ? '#FFFFFF' : theme.colors.onSurface },
              ]}
            >
              {item.senderName}
            </Text>
            <Text
              style={[
                styles.messageText,
                { color: isAdmin ? '#FFFFFF' : theme.colors.onSurface },
              ]}
            >
              {item.message}
            </Text>
            <Text
              style={[
                styles.messageTime,
                { color: isAdmin ? '#FFFFFF90' : theme.colors.onMuted },
              ]}
            >
              {formatMessageTime(item.timestamp)}
            </Text>
          </View>
        </View>
      );
    };

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
          />
          <Text style={[styles.loadingText, { color: theme.colors.onMuted }]}>
            Loading messages...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          inverted
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="chatbubbles-outline"
                size={48}
                color={theme.colors.onMuted}
              />
              <Text style={[styles.emptyText, { color: theme.colors.onMuted }]}>
                No messages yet. Start the conversation!
              </Text>
            </View>
          }
        />
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.bg,
                color: theme.colors.onSurface,
                borderColor: theme.colors.border,
              },
            ]}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.onMuted}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: messageText.trim() ? theme.colors.primary : theme.colors.onMuted,
              },
            ]}
            onPress={handleSend}
            disabled={!messageText.trim()}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Ionicons
              name="send"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: theme.colors.danger }]}
          onPress={handleCloseChat}
          accessibilityRole="button"
          accessibilityLabel="Close support chat"
        >
          <Ionicons
            name="close-circle"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.closeButtonText}>Close Chat</Text>
        </TouchableOpacity>
      </View>
    );
  },
);

SupportChatView.displayName = 'SupportChatView';

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
    },
    messagesList: {
      padding: 16,
      paddingBottom: 100,
    },
    messageContainer: {
      marginBottom: 12,
    },
    adminMessage: {
      alignItems: 'flex-end',
    },
    userMessage: {
      alignItems: 'flex-start',
    },
    messageBubble: {
      maxWidth: '80%',
      padding: 12,
      borderRadius: 16,
    },
    senderName: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 4,
      opacity: 0.9,
    },
    messageText: {
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 4,
    },
    messageTime: {
      fontSize: 11,
      alignSelf: 'flex-end',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      gap: 12,
    },
    emptyText: {
      fontSize: 14,
      textAlign: 'center',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: 12,
      gap: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    input: {
      flex: 1,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderWidth: 1,
      fontSize: 14,
      maxHeight: 100,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      gap: 8,
      marginHorizontal: 12,
      marginBottom: 12,
      borderRadius: 12,
    },
    closeButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });


