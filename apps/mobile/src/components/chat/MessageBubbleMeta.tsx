/**
 * MessageBubbleMeta Component
 * Displays timestamp and message status indicators
 */

import { useTheme } from '@/theme';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import MessageStatusTicksComponent, { type MessageStatus } from './MessageStatusTicks';
import type { MessageWithStatus } from './MessageBubbleTypes';
import RetryBadge from './RetryBadge';

interface MessageBubbleMetaProps {
  message: MessageWithStatus;
  isOwnMessage: boolean;
  showStatus?: boolean;
  currentUserId?: string;
  onRetry?: () => void;
}

export function MessageBubbleMeta({
  message,
  isOwnMessage,
  showStatus = true,
  currentUserId: _currentUserId,
  onRetry,
}: MessageBubbleMetaProps): React.JSX.Element | null {
  const theme = useTheme();
  const messageStatus: MessageStatus = message.status || 'sent';

  const styles = useMemo(
    () =>
      StyleSheet.create({
        messageMeta: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: theme.spacing.xs,
        },
        timestamp: {
          fontSize: 12,
        },
        timestampLight: {
          color: theme.colors.onMuted,
        },
        timestampDark: {
          color: theme.colors.onMuted,
        },
        statusRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: theme.spacing.sm,
        },
      }),
    [theme],
  );

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <View style={styles.messageMeta}>
      <Text
        style={StyleSheet.flatten([
          styles.timestamp,
          theme.isDark ? styles.timestampDark : styles.timestampLight,
        ])}
        allowFontScaling
      >
        {formatTime(message.sentAt)}
      </Text>
      {isOwnMessage && showStatus ? (
        <View style={styles.statusRow}>
          <MessageStatusTicksComponent
            status={messageStatus}
            size={12}
            sentColor={theme.colors.onMuted}
            deliveredColor={theme.colors.onMuted}
            readColor={theme.colors.success}
            failedColor={theme.colors.danger}
          />
          {messageStatus === 'failed' && onRetry && <RetryBadge onPress={onRetry} />}
        </View>
      ) : null}
    </View>
  );
}

