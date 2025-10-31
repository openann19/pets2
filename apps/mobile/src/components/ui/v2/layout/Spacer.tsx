import { useTheme } from '@/theme';
import { View } from 'react-native';

export interface SpacerProps {
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  horizontal?: boolean;
}

export function Spacer({ size = 'md', horizontal = false }: SpacerProps) {
  const theme = useTheme();

  const getSize = () => {
    if (typeof size === 'number') return size;
    return theme.spacing[size];
  };

  return (
    <View
      style={{
        width: horizontal ? getSize() : undefined,
        height: horizontal ? undefined : getSize(),
      }}
    />
  );
}
