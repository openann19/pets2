/**
 * EmptyState Component
 * Standardized empty state template with illustration, message, and CTA
 * 
 * Features:
 * - Semantic token-based styling
 * - Consistent copy and spacing
 * - Optional illustration/icon
 * - Action button support
 * - Accessibility labels
 */

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme';
import { Text } from '../ui/Text';
import { Button } from '../ui/v2/Button';

export interface EmptyStateProps {
  /**
   * Icon name (Ionicons)
   */
  icon?: string;
  
  /**
   * Title text
   */
  title: string;
  
  /**
   * Subtitle/description text
   */
  subtitle?: string;
  
  /**
   * Action button label
   */
  actionLabel?: string;
  
  /**
   * Action button onPress handler
   */
  onAction?: () => void;
  
  /**
   * Custom style
   */
  style?: ViewStyle;
  
  /**
   * Icon size (default: 64)
   */
  iconSize?: number;
  
  /**
   * Variant: 'default' | 'error' | 'info'
   */
  variant?: 'default' | 'error' | 'info';
}

/**
 * EmptyState - Standardized empty state component
 * 
 * Usage:
 * ```tsx
 * <EmptyState
 *   icon="heart-outline"
 *   title="No matches yet"
 *   subtitle="Start swiping to find your perfect match!"
 *   actionLabel="Go to Swipe"
 *   onAction={() => navigation.navigate('Swipe')}
 * />
 * ```
 */
export function EmptyState({
  icon = 'ellipse-outline',
  title,
  subtitle,
  actionLabel,
  onAction,
  style,
  iconSize = 64,
  variant = 'default',
}: EmptyStateProps): React.JSX.Element {
  const theme = useTheme();
  
  const iconColor = 
    variant === 'error' ? theme.colors.danger :
    variant === 'info' ? theme.colors.info :
    theme.colors.onMuted;
  
  const styles = createStyles(theme);
  
  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="none"
      accessibilityLabel={`${title}${subtitle ? `. ${subtitle}` : ''}`}
    >
      <Ionicons
        name={icon as any}
        size={iconSize}
        color={iconColor}
        style={styles.icon}
      />
      
      <Text
        variant="heading3"
        style={styles.title}
        accessibilityRole="header"
      >
        {title}
      </Text>
      
      {subtitle && (
        <Text
          variant="body"
          style={styles.subtitle}
        >
          {subtitle}
        </Text>
      )}
      
      {actionLabel && onAction && (
        <View style={styles.action}>
          <Button
            title={actionLabel}
            onPress={onAction}
            variant="primary"
            size="md"
          />
        </View>
      )}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing['2xl'],
    },
    icon: {
      marginBottom: theme.spacing.lg,
    },
    title: {
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
      color: theme.colors.onSurface,
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      color: theme.colors.onMuted,
    },
    action: {
      marginTop: theme.spacing.md,
    },
  });
}

