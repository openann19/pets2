/**
 * ErrorBanner Component
 * Consistent error display with retry handler
 *
 * Features:
 * - Network and parsing error support
 * - Retry button
 * - Consistent styling
 * - Accessibility labels
 * - Snapshot test support
 */

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme';
import { Text } from '../ui/Text';
import { Button } from '../ui/v2/Button';

export interface ErrorBannerProps {
  /**
   * Error message to display
   */
  message: string;

  /**
   * Optional error title (default: "Error")
   */
  title?: string;

  /**
   * Retry handler
   */
  onRetry?: () => void;

  /**
   * Custom style
   */
  style?: ViewStyle;

  /**
   * Error type: 'network' | 'parsing' | 'generic'
   */
  type?: 'network' | 'parsing' | 'generic';

  /**
   * Show retry button (default: true if onRetry provided)
   */
  showRetry?: boolean;
}

/**
 * ErrorBanner - Consistent error display component
 *
 * Usage:
 * ```tsx
 * <ErrorBanner
 *   message="Failed to load matches"
 *   type="network"
 *   onRetry={() => refetch()}
 * />
 * ```
 */
export function ErrorBanner({
  message,
  title = 'Error',
  onRetry,
  style,
  type = 'generic',
  showRetry,
}: ErrorBannerProps): React.JSX.Element {
  const theme = useTheme();

  const iconName =
    type === 'network'
      ? 'cloud-offline-outline'
      : type === 'parsing'
        ? 'alert-circle-outline'
        : 'alert-circle-outline';

  const shouldShowRetry = showRetry ?? onRetry !== undefined;

  const styles = createStyles(theme);

  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="alert"
      accessibilityLabel={`${title}: ${message}`}
    >
      <View style={styles.content}>
        <Ionicons
          name={iconName as any}
          size={24}
          color={theme.colors.danger}
          style={styles.icon}
        />

        <View style={styles.textContainer}>
          <Text
            variant="subtitle"
            style={styles.title}
          >
            {title}
          </Text>
          <Text
            variant="body"
            style={styles.message}
          >
            {message}
          </Text>
        </View>
      </View>

      {shouldShowRetry && onRetry && (
        <View style={styles.retry}>
          <Button
            title="Retry"
            onPress={onRetry}
            variant="primary"
            size="sm"
          />
        </View>
      )}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.danger,
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      marginVertical: theme.spacing.sm,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    icon: {
      marginRight: theme.spacing.sm,
      marginTop: 2,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      color: theme.colors.danger,
      marginBottom: theme.spacing.xs,
      fontWeight: '600',
    },
    message: {
      color: theme.colors.onMuted,
    },
    retry: {
      marginTop: theme.spacing.md,
      alignSelf: 'flex-start',
    },
  });
}
