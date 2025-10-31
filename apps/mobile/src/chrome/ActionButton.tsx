/**
 * 🎯 ACTION BUTTON - Micro component for header actions
 * Animated press feedback, badge support, accessibility
 */

import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import { usePressFeedback } from '@/hooks/usePressFeedback';

type Props = {
  icon: React.ReactNode;
  label: string;
  badge?: number | undefined;
  onPress: () => void;
  onLongPress?: () => void | undefined;
};

export function ActionButton({
  icon,
  label,
  badge,
  onPress,
  onLongPress,
}: Props) {
  const theme = useTheme() as AppTheme;
  const { animatedStyle, handlePressIn, handlePressOut } = usePressFeedback({
    pressedScale: 0.98,
    overshootScale: 1.02,
    pressDuration: 90,
  });

  const handlePress = () => {
    onPress();
  };

  const styles = makeStyles(theme);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={onLongPress}
      style={styles.container}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityHint={`Double tap to ${label.toLowerCase()}`}
    >
      <Animated.View style={animatedStyle}>
        <View style={styles.iconWrap}>
          {icon}
          {badge !== undefined && badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {badge > 99 ? '99+' : badge}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
      minWidth: 44,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    badge: {
      position: 'absolute',
      top: -2,
      right: -2,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.danger,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    badgeText: {
      color: theme.colors.onSurface,
      fontSize: 10,
      fontWeight: '700',
    },
  });

