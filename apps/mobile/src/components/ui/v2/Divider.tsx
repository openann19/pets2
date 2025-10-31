import { View } from 'react-native';
import { useTheme } from '../../../theme';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted';

export interface DividerProps {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  spacing?: number;
  color?: string;
}

export function Divider({
  orientation = 'horizontal',
  variant = 'solid',
  spacing = 0,
  color,
}: DividerProps) {
  const theme = useTheme();
  const borderColor = color || theme.colors.border;

  if (variant === 'solid') {
    return (
      <View
        style={{
          width: orientation === 'horizontal' ? '100%' : undefined,
          height: orientation === 'vertical' ? '100%' : 1,
          backgroundColor: borderColor,
          marginVertical: orientation === 'horizontal' ? spacing : 0,
          marginHorizontal: orientation === 'vertical' ? spacing : 0,
        }}
        accessibilityRole="none"
      />
    );
  }

  // For dashed/dotted, we use a border implementation
  return (
    <View
      style={{
        width: orientation === 'horizontal' ? '100%' : 1,
        height: orientation === 'vertical' ? '100%' : 1,
        borderStyle: variant,
        borderColor,
        borderWidth: 1,
        marginVertical: orientation === 'horizontal' ? spacing : 0,
        marginHorizontal: orientation === 'vertical' ? spacing : 0,
      }}
      accessibilityRole="none"
    />
  );
}
