import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme';
import { Text } from './Text';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps {
  label?: string;
  checked: boolean;
  onValueChange: (checked: boolean) => void;
  size?: CheckboxSize;
  disabled?: boolean;
  testID?: string;
}

const sizeMap = {
  sm: { boxSize: 18, iconSize: 12 },
  md: { boxSize: 22, iconSize: 14 },
  lg: { boxSize: 28, iconSize: 18 },
};

export function Checkbox({
  label,
  checked,
  onValueChange,
  size = 'md',
  disabled = false,
  testID,
}: CheckboxProps) {
  const theme = useTheme();
  const sizeStyles = sizeMap[size];
  const boxSize = sizeStyles.boxSize;

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!checked);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={styles.container}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      testID={testID}
    >
      <View
        style={[
          styles.box,
          {
            width: boxSize,
            height: boxSize,
            borderRadius: theme.radius.sm,
            borderWidth: 2,
            borderColor: checked ? theme.colors.primary : theme.colors.border,
            backgroundColor: checked ? theme.colors.primary : 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {checked && (
          <View
            style={[
              styles.check,
              {
                width: sizeStyles.iconSize,
                height: sizeStyles.iconSize,
                borderRadius: sizeStyles.iconSize / 4,
                backgroundColor: theme.colors.onPrimary,
              },
            ]}
          />
        )}
      </View>
      {label && (
        <Text
          variant="body"
          tone="text"
          style={{ marginLeft: theme.spacing.sm }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    borderStyle: 'solid',
  },
  check: {
    backgroundColor: '#FFFFFF',
  },
});
