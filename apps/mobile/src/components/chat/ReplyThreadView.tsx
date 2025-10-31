/**
 * Reply Thread View Component
 * Displays nested reply threads for messages
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ListRenderItem,
} from 'react-native';

import { useTheme } from '@mobile/theme';
import type { MobileMessage, MessageWithReplies } from '../../types/message';
import { MessageItem } from './MessageItem';
import { MessageWithEnhancements } from './MessageWithEnhancements';

interface ReplyThreadViewProps {
  rootMessage: MobileMessage;
  threadMessages: MobileMessage[];
  currentUserId: string;
  matchId: string;
  onReply: (message: MobileMessage, replyTo?: MobileMessage) => void;
  onClose: () => void;
}

export function ReplyThreadView({
  rootMessage,
  threadMessages,
  currentUserId,
  matchId,
  onReply,
  onClose,
}: ReplyThreadViewProps) {
  const theme = useTheme();
  
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    closeButton: {
      marginRight: 16,
    },
    headerContent: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    headerSubtitle: {
      fontSize: 14,
      marginTop: 2,
    },
    replyButton: {
      padding: 8,
    },
    rootMessageContainer: {
      padding: 16,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 12,
    },
    rootMessageLabel: {
      marginBottom: 8,
    },
    rootMessageLabelText: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    threadList: {
      padding: 16,
    },
    repliesHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 16,
    },
    divider: {
      flex: 1,
      height: 1,
    },
    repliesHeaderText: {
      marginHorizontal: 12,
      fontSize: 12,
      fontWeight: '600',
    },
    messageContainer: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    replyIndicator: {
      width: 2,
      marginRight: 8,
      borderLeftWidth: 2,
    },
  }), []);
  
  // Build thread tree structure
  const threadTree = useMemo(() => {
    const messagesById = new Map<string, MessageWithReplies>();
    const root: MessageWithReplies = { ...rootMessage, replies: [] };
    messagesById.set(rootMessage._id, root);

    // Build tree structure
    threadMessages.forEach((msg) => {
      const messageWithReplies: MessageWithReplies = { ...msg, replies: [] };
      messagesById.set(msg._id, messageWithReplies);

      if (msg.replyTo) {
        const parentId =
          typeof msg.replyTo === 'string' ? msg.replyTo : msg.replyTo._id;
        const parent = messagesById.get(parentId);
        if (parent) {
          parent.replies.push(messageWithReplies);
        }
      } else {
        root.replies.push(messageWithReplies);
      }
    });

    return root;
  }, [rootMessage, threadMessages]);

  // Flatten tree for FlatList
  const flattenedMessages = useMemo(() => {
    const result: Array<{ message: MobileMessage; depth: number }> = [];

    const flatten = (
      msg: MessageWithReplies,
      depth: number,
    ) => {
      result.push({ message: msg, depth });
      msg.replies.forEach((reply) => flatten(reply as MessageWithReplies, depth + 1));
    };

    flatten(threadTree, 0);
    return result;
  }, [threadTree]);

  const renderMessage: ListRenderItem<{ message: MobileMessage; depth: number }> =
    useCallback(
      ({ item }) => {
        const { message, depth } = item;
        const isOwnMessage = message.senderId === currentUserId;
        const hasEnhancements =
          message.reactions ||
          message.attachment ||
          message.voiceNote;

        return (
          <View style={[styles.messageContainer, { paddingLeft: depth * 24 }]}>
            {depth > 0 && (
              <View
                style={[
                  styles.replyIndicator,
                  { borderLeftColor: theme.colors.border },
                ]}
              />
            )}
            {hasEnhancements ? (
              <MessageWithEnhancements
                message={message as unknown as import('@pawfectmatch/core').Message & {
                  reactions?: Record<string, number>;
                  attachment?: {
                    type: 'image' | 'video' | 'file';
                    url: string;
                    name?: string;
                    size?: number;
                  };
                  voiceNote?: { url: string; duration: number; waveform?: number[] };
                }}
                isOwnMessage={isOwnMessage}
                currentUserId={currentUserId}
                matchId={matchId}
                onReply={(msg) => onReply(msg as unknown as MobileMessage, message)}
              />
            ) : (
              <MessageItem
                message={message}
                index={0}
                messages={[message]}
                isOnline={true}
                onPress={() => onReply(message, rootMessage)}
              />
            )}
          </View>
        );
      },
      [currentUserId, matchId, onReply, rootMessage, styles, theme],
    );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border },
        ]}
      >
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            Reply Thread
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.onMuted }]}>
            {threadMessages.length + 1} messages
          </Text>
        </View>
        <TouchableOpacity onPress={() => onReply(rootMessage, rootMessage)} style={styles.replyButton}>
          <Ionicons name="chatbubble-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Root Message */}
      <View style={[styles.rootMessageContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.rootMessageLabel}>
          <Text style={[styles.rootMessageLabelText, { color: theme.colors.onMuted }]}>
            Original Message
          </Text>
        </View>
        <MessageItem
          message={rootMessage}
          index={0}
          messages={[rootMessage]}
          isOnline={true}
          onPress={() => {}}
        />
      </View>

      {/* Thread Messages */}
      <FlatList
        data={flattenedMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.message._id}
        contentContainerStyle={styles.threadList}
        ListHeaderComponent={
          threadMessages.length > 0 ? (
            <View style={styles.repliesHeader}>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.repliesHeaderText, { color: theme.colors.onMuted }]}>
                {threadMessages.length} {threadMessages.length === 1 ? 'reply' : 'replies'}
              </Text>
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            </View>
          ) : null
        }
      />
    </View>
  );
}

