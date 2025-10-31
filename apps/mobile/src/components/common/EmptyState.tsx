/**
 * EmptyState Component
 * 
 * Reusable empty state component for data-driven screens.
 * Provides consistent messaging and actions when no data is available.
 * 
 * Features:
 * - Multiple empty state types (no data, error, offline)
 * - Customizable icons and messages
 * - Action buttons for recovery
 * - Accessibility support
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import { useReduceMotion } from '@/hooks/useReducedMotion';
import { useEnhancedVariants } from '@/hooks/animations';
import { springs } from '@/foundation/motion';

export interface EmptyStateProps {
  title: string;
  message: string;
  icon?: string;
  actionLabel?: string | undefined;
  onAction?: (() => void) | undefined;
  style?: ViewStyle;
  testID?: string;
  premium?: boolean;
  animated?: boolean;
}

/**
 * Empty state component for screens with no data
 */
export function EmptyState({
  title,
  message,
  icon = 'alert-circle-outline',
  actionLabel,
  onAction,
  style,
  testID,
  premium = true,
  animated = true,
}: EmptyStateProps): React.JSX.Element {
  const theme = useTheme();
  const reducedMotion = useReduceMotion();
  const effectiveAnimated = animated && !reducedMotion && premium;

  // Icon animations
  const iconScale = useSharedValue(effectiveAnimated ? 0 : 1);
  const iconOpacity = useSharedValue(effectiveAnimated ? 0 : 1);
  const iconTranslateY = useSharedValue(effectiveAnimated ? -20 : 0);
  const iconRotation = useSharedValue(0);

  // Text animations
  const titleOpacity = useSharedValue(effectiveAnimated ? 0 : 1);
  const titleTranslateY = useSharedValue(effectiveAnimated ? 10 : 0);
  const messageOpacity = useSharedValue(effectiveAnimated ? 0 : 1);
  const messageTranslateY = useSharedValue(effectiveAnimated ? 10 : 0);

  // Button animation
  const buttonScale = useSharedValue(effectiveAnimated ? 0 : 1);
  const buttonOpacity = useSharedValue(effectiveAnimated ? 0 : 1);

  // Floating animation for icon
  useEffect(() => {
    if (!effectiveAnimated) return;

    // Entrance animations with stagger
    iconScale.value = withDelay(
      100,
      withSpring(1, springs.standard),
    );
    iconOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
    iconTranslateY.value = withDelay(100, withSpring(0, springs.gentle));

    titleOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
    titleTranslateY.value = withDelay(300, withSpring(0, springs.gentle));

    messageOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
    messageTranslateY.value = withDelay(500, withSpring(0, springs.gentle));

    if (actionLabel && onAction) {
      buttonOpacity.value = withDelay(700, withTiming(1, { duration: 400 }));
      buttonScale.value = withDelay(
        700,
        withSpring(1, springs.standard),
      );
    }

    // Continuous floating animation
    iconTranslateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000 }),
        withTiming(0, { duration: 2000 }),
      ),
      -1,
      true,
    );

    // Subtle rotation
    iconRotation.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 3000 }),
        withTiming(-5, { duration: 3000 }),
      ),
      -1,
      true,
    );
  }, [effectiveAnimated, actionLabel, onAction]);

  // Icon glow effect
  const iconGlow = useEnhancedVariants({
    variant: 'glow',
    enabled: premium && effectiveAnimated,
    duration: 3000,
    color: theme.colors.onMuted,
    intensity: 0.3,
  });

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [
      { scale: iconScale.value },
      { translateY: iconTranslateY.value },
      { rotate: `${iconRotation.value}deg` },
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
    transform: [{ translateY: messageTranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.bg,
        },
        style,
      ]}
      testID={testID}
      accessibilityLabel={`${title}. ${message}`}
      accessibilityRole="text"
    >
      <Animated.View
        style={[
          styles.iconContainer,
          iconStyle,
          premium ? iconGlow.animatedStyle : undefined,
        ]}
      >
        <Ionicons
          name={icon as any}
          size={64}
          color={theme.colors.onMuted}
          accessibilityLabel=""
        />
      </Animated.View>
      
      <Animated.Text
        style={[
          styles.title,
          {
            color: theme.colors.onSurface,
            fontSize: theme.typography.h2.size,
            fontWeight: theme.typography.h2.weight,
          },
          titleStyle,
        ]}
        accessibilityRole="header"
      >
        {title}
      </Animated.Text>
      
      <Animated.Text
        style={[
          styles.message,
          {
            color: theme.colors.onMuted,
            fontSize: theme.typography.body.size,
          },
          messageStyle,
        ]}
      >
        {message}
      </Animated.Text>
      
      {actionLabel && onAction && (
        <Animated.View style={buttonStyle}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radii.md,
                paddingHorizontal: theme.spacing.xl,
                paddingVertical: theme.spacing.md,
              },
            ]}
            onPress={onAction}
            accessibilityLabel={actionLabel}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.actionButtonText,
                {
                  color: theme.colors.onPrimary,
                  fontSize: theme.typography.body.size,
                  fontWeight: theme.typography.h2.weight,
                },
              ]}
            >
              {actionLabel}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

/**
 * Pre-configured empty states for common scenarios
 */
export const EmptyStates = {
  /**
   * No data available
   */
  NoData: ({
    title = 'No data available',
    message = 'There\'s nothing here yet. Check back later!',
    actionLabel,
    onAction,
  }: Partial<EmptyStateProps>) => (
    <EmptyState
      title={title}
      message={message}
      icon="document-outline"
      {...(actionLabel ? { actionLabel } : {})}
      {...(onAction ? { onAction } : {})}
      testID="empty-state-no-data"
    />
  ),

  /**
   * Network error
   */
  NetworkError: ({
    title = 'Connection Error',
    message = 'Unable to load data. Please check your internet connection.',
    actionLabel = 'Retry',
    onAction,
  }: Partial<EmptyStateProps>) => (
    <EmptyState
      title={title}
      message={message}
      icon="cloud-offline-outline"
      actionLabel={actionLabel}
      {...(onAction ? { onAction } : {})}
      testID="empty-state-network-error"
    />
  ),

  /**
   * Offline mode
   */
  Offline: ({
    title = 'You\'re Offline',
    message = 'Some features may be limited. Please connect to the internet.',
    actionLabel,
    onAction,
  }: Partial<EmptyStateProps>) => (
    <EmptyState
      title={title}
      message={message}
      icon="wifi-outline"
      {...(actionLabel ? { actionLabel } : {})}
      {...(onAction ? { onAction } : {})}
      testID="empty-state-offline"
    />
  ),

  /**
   * Error state
   */
  Error: ({
    title = 'Something went wrong',
    message = 'We encountered an error. Please try again.',
    actionLabel = 'Retry',
    onAction,
  }: Partial<EmptyStateProps>) => (
    <EmptyState
      title={title}
      message={message}
      icon="alert-circle-outline"
      actionLabel={actionLabel}
      {...(onAction ? { onAction } : {})}
      testID="empty-state-error"
    />
  ),

  /**
   * No matches
   */
  NoMatches: ({
    title = 'No matches yet',
    message = 'Keep swiping to find your perfect match!',
    actionLabel = 'Start Swiping',
    onAction,
  }: Partial<EmptyStateProps>) => (
    <EmptyState
      title={title}
      message={message}
      icon="heart-outline"
      actionLabel={actionLabel}
      {...(onAction ? { onAction } : {})}
      testID="empty-state-no-matches"
    />
  ),

  /**
   * No pets
   */
  NoPets: ({
    title = 'No pets yet',
    message = 'Add your first pet to get started!',
    actionLabel = 'Add Pet',
    onAction,
  }: Partial<EmptyStateProps>) => (
    <EmptyState
      title={title}
      message={message}
      icon="paw-outline"
      actionLabel={actionLabel}
      {...(onAction ? { onAction } : {})}
      testID="empty-state-no-pets"
    />
  ),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButton: {
    minWidth: 120,
  },
  actionButtonText: {
    textAlign: 'center',
  },
});

