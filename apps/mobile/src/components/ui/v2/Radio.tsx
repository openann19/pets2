import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from './Text';

export type RadioSize = 'sm' | 'md' | 'lg';

export interface RadioProps {
  label?: string;
  selected: boolean;
  onPress: () => void;
  size?: RadioSize;
  disabled?: boolean;
  testID?: string;
  value: string;
}

const sizeMap = {
  sm: { outerSize: 20, innerSize: 8 },
  md: { outerSize: 24, innerSize: 10 },
  lg: { outerSize: 28, innerSize: 12 },
};

export function Radio({
  label,
  selected,
  onPress,
  size = 'md',
  disabled = false,
  testID,
  value,
}: RadioProps) {
  const theme = useTheme();
  const sizeStyles = sizeMap[size];

  const handlePress = () => {
    if (!disabled) {
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={styles.container}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      testID={testID}
    >
      <View
        style={[
          styles.outer,
          {
            width: sizeStyles.outerSize,
            height: sizeStyles.outerSize,
            borderRadius: sizeStyles.outerSize / 2,
            borderWidth: 2,
            borderColor: selected ? theme.colors.primary : theme.colors.border,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {selected && (
          <View
            style={[
              styles.inner,
              {
                width: sizeStyles.innerSize,
                height: sizeStyles.innerSize,
                borderRadius: sizeStyles.innerSize / 2,
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
        )}
      </View>
      {label && (
        <Text variant="body" tone="text" style={{ marginLeft: theme.spacing.sm }}>
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
  outer: {
    borderStyle: 'solid',
  },
  inner: {},
});

// Radio Group Component
export interface RadioGroupProps {
  options: Array<{ value: string; label: string }>;
  selectedValue: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function RadioGroup({
  options,
  selectedValue,
  onValueChange,
  disabled = false,
}: RadioGroupProps) {
  return (
    <View>
      {options.map((option) => (
        <Radio
          key={option.value}
          label={option.label}
          value={option.value}
          selected={selectedValue === option.value}
          onPress={() => onValueChange(option.value)}
          disabled={disabled || option.value === selectedValue}
        />
      ))}
    </View>
  );
}
