import React from 'react';
import { Switch as RNSwitch } from 'react-native';
import { useTheme } from '../../../theme';

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  testID?: string;
}

export function Switch({
  value,
  onValueChange,
  disabled = false,
  testID,
}: SwitchProps) {
  const theme = useTheme();

  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: theme.colors.bgAlt,
        true: theme.colors.primary,
      }}
      thumbColor={theme.colors.bg}
      ios_backgroundColor={theme.colors.bgAlt}
      testID={testID}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
    />
  );
}
