/**
 * 🎯 HEADER ICON - Renders Ionicons for header actions
 * Tokenized, accessible, consistent sizing
 */

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';

type Props = {
  name: string;
  size?: number;
};

export function HeaderIcon({ name, size = 22 }: Props) {
  const theme = useTheme() as AppTheme;
  // Ionicons accepts string names - validation happens at runtime
  // Using type assertion as icon names are dynamically determined
  return (
    <Ionicons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      name={name as any}
      size={size}
      color={theme.colors.onSurface}
    />
  );
}

