import { Ionicons } from '@expo/vector-icons';
import type { AppTheme } from '@mobile/src/theme';
import { useTheme } from '@mobile/src/theme';
import { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    fab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      right: 16,
      bottom: 16,
      elevation: 6,
    },
  });
}

export interface FABProps {
  icon: string;
  onPress: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
  testID?: string;
}

export function FAB({ icon, onPress, style, accessibilityLabel, testID }: FABProps) {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={StyleSheet.flatten([
        styles.fab,
        {
          backgroundColor: theme.colors.primary,
          shadowColor: theme.colors.shadow,
        },
        style,
      ])}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || 'Action'}
      testID={testID}
    >
      <Ionicons
        name={icon as any}
        size={22}
        color={theme.colors.onPrimary}
      />
    </TouchableOpacity>
  );
}

export default FAB;
