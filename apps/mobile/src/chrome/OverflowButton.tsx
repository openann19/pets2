/**
 * 🎯 OVERFLOW BUTTON - Triggers overflow sheet
 * Minimal design, accessibility compliant
 */

import { Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

type Props = {
  onPress: () => void;
};

export function OverflowButton({ onPress }: Props) {
  const theme = useTheme() as AppTheme;
  const styles = makeStyles(theme);

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="More actions"
      accessibilityRole="button"
      accessibilityHint="Opens menu with additional actions"
      style={styles.container}
    >
      <Text style={styles.text}>⋯</Text>
    </Pressable>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      minWidth: 44,
      minHeight: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: theme.colors.onSurface,
      fontSize: 18,
      fontWeight: '600',
    },
  });

