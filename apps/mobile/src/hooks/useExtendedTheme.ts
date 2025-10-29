/**
 * Extended Theme Hook
 * Provides backward compatibility for components using extended color properties
 * 
 * Usage:
 * ```tsx
 * import { useExtendedTheme } from "../hooks/useExtendedTheme";
 * 
 * function MyComponent() {
 *   const { colors } = useExtendedTheme();
 *   // theme.palette.neutral[500], colors.onPrimary, etc. now work
 * }
 * ```
 */

import { useTheme } from "@/theme";
import { getExtendedColors, getIsDark } from "../theme/adapters";
import type { Theme } from "../theme/types";
import type { ExtendedColors } from "../theme/adapters";

export interface ExtendedTheme extends Theme {
  colors: ExtendedColors;
  isDark: boolean;
}

/**
 * Hook that returns the theme with extended color palette
 * Provides backward compatibility for old component API
 */
export function useExtendedTheme(): ExtendedTheme {
  const theme = useTheme();
  
  return {
    ...theme,
    colors: getExtendedColors(theme),
    isDark: getIsDark(theme),
  };
}

/**
 * Hook that returns just the extended colors
 */
export function useExtendedColors(): ExtendedColors {
  const theme = useTheme();
  return getExtendedColors(theme);
}
