/**
 * Support Chat Card Component
 * Displays a support chat in the list
 */

import { Ionicons } from '@expo/vector-icons';
import { memo, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { SupportChat } from '../types';

interface SupportChatCardProps {
  chat: SupportChat;
  onPress: () => void;
}

function formatTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

export const SupportChatCard = memo<SupportChatCardProps>(({ chat, onPress }) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const statusColor =
    chat.status === 'open'
      ? theme.colors.success
      : chat.status === 'closed'
        ? theme.colors.onMuted
        : theme.colors.warning;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Support chat with ${chat.userName}`}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons
            name="person"
            size={24}
            color={theme.colors.primary}
          />
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.userName, { color: theme.colors.onSurface }]}>
              {chat.userName}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{chat.status.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={[styles.email, { color: theme.colors.onMuted }]}>{chat.userEmail}</Text>
          <Text style={[styles.subject, { color: theme.colors.onSurface }]} numberOfLines={1}>
            {chat.subject}
          </Text>
          <Text style={[styles.lastMessage, { color: theme.colors.onMuted }]} numberOfLines={2}>
            {chat.lastMessage}
          </Text>
        </View>
        <View style={styles.meta}>
          {chat.unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.badgeText}>{chat.unreadCount}</Text>
            </View>
          )}
          <Text style={[styles.time, { color: theme.colors.onMuted }]}>
            {formatTime(chat.lastMessageAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

SupportChatCard.displayName = 'SupportChatCard';

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    avatarContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: `${theme.colors.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    content: {
      flex: 1,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
      gap: 8,
    },
    userName: {
      fontSize: 16,
      fontWeight: '600',
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    statusText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '600',
    },
    email: {
      fontSize: 13,
      marginBottom: 4,
    },
    subject: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 4,
    },
    lastMessage: {
      fontSize: 13,
      marginTop: 4,
    },
    meta: {
      alignItems: 'flex-end',
      gap: 4,
    },
    badge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '600',
    },
    time: {
      fontSize: 12,
    },
  });


