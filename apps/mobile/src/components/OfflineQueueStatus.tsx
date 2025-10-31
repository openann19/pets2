/**
 * OfflineQueueStatus Component
 * Displays pending actions waiting to sync when offline
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTheme } from '@mobile/theme';
import { Ionicons } from '@expo/vector-icons';

export interface OfflineQueueStatusProps {
  pendingActions: number;
  isSyncing?: boolean;
  onRetry?: () => void;
}

export function OfflineQueueStatus({
  pendingActions,
  isSyncing = false,
  onRetry,
}: OfflineQueueStatusProps): React.JSX.Element | null {
  const { isOnline } = useNetworkStatus();
  const theme = useTheme();

  // Don't show if online or no pending actions
  if (isOnline || pendingActions === 0) return null;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 56,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    icon: {
      marginRight: theme.spacing.sm,
    },
    text: {
      color: theme.colors.onSurface,
      fontSize: 14,
      flex: 1,
    },
    retryButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radii.md,
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 80,
      justifyContent: 'center',
    },
    retryText: {
      color: theme.colors.onSurface,
      fontSize: 14,
      fontWeight: '600',
      marginLeft: theme.spacing.xs,
    },
    syncingIndicator: {
      marginRight: theme.spacing.sm,
    },
  });

  return (
    <View
      style={styles.container}
      accessibilityRole="none"
      accessibilityLabel={`${pendingActions} action${pendingActions !== 1 ? 's' : ''} waiting to sync`}
    >
      <View style={styles.content}>
        {isSyncing ? (
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
            style={styles.syncingIndicator}
          />
        ) : (
          <Ionicons
            name="time-outline"
            size={20}
            color={theme.colors.onMuted}
            style={styles.icon}
          />
        )}
        <Text style={styles.text}>
          {isSyncing
            ? `Syncing ${pendingActions} action${pendingActions !== 1 ? 's' : ''}...`
            : `${pendingActions} action${pendingActions !== 1 ? 's' : ''} waiting to sync`}
        </Text>
      </View>
      {onRetry && !isSyncing && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry sync"
        >
          <Ionicons name="refresh-outline" size={16} color={theme.colors.onSurface} />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

