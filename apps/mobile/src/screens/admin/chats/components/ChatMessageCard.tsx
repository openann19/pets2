/**
 * Chat Message Card Component
 * Displays a single chat message with moderation actions
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { ChatMessage } from '../types';

interface ChatMessageCardProps {
  message: ChatMessage;
  onAction: (messageId: string, action: 'approve' | 'remove' | 'warn') => void;
}

export function ChatMessageCard({ message, onAction }: ChatMessageCardProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={[styles.senderName, { color: theme.colors.onSurface }]}>
            {message.senderName} → {message.receiverName}
          </Text>
          <Text style={[styles.timestamp, { color: theme.colors.onMuted }]}>
            {new Date(message.timestamp).toLocaleString()}
          </Text>
        </View>
        {message.flagged ? (
          <View style={[styles.flagBadge, { backgroundColor: theme.colors.danger }]}>
            <Ionicons
              name="flag"
              size={12}
              color={theme.colors.onPrimary}
            />
            <Text style={styles.flagText}>Flagged</Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.messageText, { color: theme.colors.onSurface }]}>
        {message.message}
      </Text>

      {message.flagReason ? (
        <Text style={[styles.flagReason, { color: theme.colors.danger }]}>
          Reason: {message.flagReason}
        </Text>
      ) : null}

      {message.reviewed ? (
        <View style={[styles.reviewedBadge, { backgroundColor: theme.colors.success }]}>
          <Text style={styles.reviewedText}>
            {message.action?.toUpperCase()} by {message.reviewedBy}
          </Text>
        </View>
      ) : (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton, { backgroundColor: theme.colors.success }]}
            testID="AdminChatsScreen-button-approve"
            accessibilityLabel="Approve message"
            accessibilityRole="button"
            onPress={() => onAction(message.id, 'approve')}
          >
            <Ionicons
              name="checkmark"
              size={16}
              color={theme.colors.onPrimary}
            />
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.warnButton, { backgroundColor: theme.colors.warning }]}
            testID="AdminChatsScreen-button-warn"
            accessibilityLabel="Warn user"
            accessibilityRole="button"
            onPress={() => onAction(message.id, 'warn')}
          >
            <Ionicons
              name="warning"
              size={16}
              color={theme.colors.onPrimary}
            />
            <Text style={styles.actionButtonText}>Warn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.removeButton, { backgroundColor: theme.colors.danger }]}
            testID="AdminChatsScreen-button-remove"
            accessibilityLabel="Remove message"
            accessibilityRole="button"
            onPress={() => onAction(message.id, 'remove')}
          >
            <Ionicons
              name="trash"
              size={16}
              color={theme.colors.onPrimary}
            />
            <Text style={styles.actionButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      padding: theme.spacing.lg,
      borderRadius: theme.radii.md,
      marginBottom: theme.spacing.md,
      ...theme.shadows.elevation2,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    userInfo: {
      flex: 1,
    },
    senderName: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.xs,
    },
    timestamp: {
      fontSize: theme.typography.body.size * 0.75,
    },
    flagBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.sm,
      gap: theme.spacing.xs,
    },
    flagText: {
      fontSize: theme.typography.body.size * 0.75,
      color: theme.colors.onPrimary,
      fontWeight: theme.typography.body.weight,
    },
    messageText: {
      fontSize: theme.typography.body.size,
      lineHeight: theme.typography.body.size * 1.375,
      marginBottom: theme.spacing.sm,
    },
    flagReason: {
      fontSize: theme.typography.body.size * 0.875,
      fontStyle: 'italic',
      marginBottom: theme.spacing.md,
    },
    reviewedBadge: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.md,
      alignSelf: 'flex-start',
    },
    reviewedText: {
      fontSize: theme.typography.body.size * 0.75,
      color: theme.colors.onPrimary,
      fontWeight: theme.typography.h2.weight,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radii.md,
      gap: theme.spacing.xs,
    },
    approveButton: {},
    warnButton: {},
    removeButton: {},
    actionButtonText: {
      fontSize: theme.typography.body.size * 0.75,
      color: theme.colors.onPrimary,
      fontWeight: theme.typography.h2.weight,
    },
  });

