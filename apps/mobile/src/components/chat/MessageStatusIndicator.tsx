/**
 * Message Status Indicator Component
 * Displays message delivery status (sent, delivered, read)
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

interface MessageStatusIndicatorProps {
  status: MessageStatus;
  size?: number;
}

export function MessageStatusIndicator({
  status,
  size = 14,
}: MessageStatusIndicatorProps): React.JSX.Element | null {
  const theme = useTheme();
  const styles = makeStyles(theme);

  // Don't show indicator for incoming messages or sending status
  if (status === 'sending') {
    return (
      <View style={styles.container}>
        <Ionicons
          name="time-outline"
          size={size}
          color={theme.colors.onMuted}
          style={styles.icon}
        />
      </View>
    );
  }

  if (status === 'failed') {
    return (
      <View style={styles.container}>
        <Ionicons
          name="alert-circle"
          size={size}
          color={theme.colors.danger}
          style={styles.icon}
        />
      </View>
    );
  }

  if (status === 'sent') {
    return (
      <View style={styles.container}>
        <Ionicons
          name="checkmark"
          size={size}
          color={theme.colors.onMuted}
          style={styles.icon}
        />
      </View>
    );
  }

  if (status === 'delivered') {
    return (
      <View style={styles.container}>
        <Ionicons
          name="checkmark-done"
          size={size}
          color={theme.colors.onMuted}
          style={styles.icon}
        />
      </View>
    );
  }

  if (status === 'read') {
    return (
      <View style={styles.container}>
        <Ionicons
          name="checkmark-done"
          size={size}
          color={theme.colors.primary}
          style={styles.icon}
        />
      </View>
    );
  }

  return null;
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      marginLeft: theme.spacing.xs,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      // Icon styling is handled by Ionicons props
    },
  });
}

