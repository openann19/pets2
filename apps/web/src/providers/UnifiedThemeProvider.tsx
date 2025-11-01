/**
 * 🎨 UNIFIED THEME PROVIDER
 * Integrates unified theme system with next-themes for class-based dark mode
 * Provides both next-themes functionality and our AppTheme context
 */

'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { ThemeProvider as NextThemeProvider, useTheme as useNextTheme } from 'next-themes';
import { ThemeProvider as AppThemeProvider } from '../theme';
import type { ColorScheme } from '../theme';

/**
 * Wrapper that syncs next-themes resolved theme with our AppTheme
 */
function ThemeSyncWrapper({ children }: { children: ReactNode }) {
  // Always call hooks unconditionally at the top level
  const { resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // Always call useEffect unconditionally
  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine color scheme from next-themes
  // Use undefined during SSR to avoid hydration mismatch
  const colorScheme: ColorScheme | undefined = mounted && resolvedTheme 
    ? (resolvedTheme === 'dark' ? 'dark' : 'light')
    : undefined;

  // Always return the same structure - conditional logic is only inside hook bodies
  return (
    <AppThemeProvider scheme={colorScheme}>
      {children}
    </AppThemeProvider>
  );
}

/**
 * Unified theme provider that combines next-themes with our AppTheme system
 * This ensures compatibility with Tailwind's class-based dark mode while
 * providing the unified AppTheme API matching mobile app
 */
export function UnifiedThemeProvider({ 
  children,
  defaultTheme = 'system',
  storageKey = 'pm-theme',
}: { 
  children: ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
  storageKey?: string;
}) {
  return (
    <NextThemeProvider 
      attribute="class" 
      defaultTheme={defaultTheme} 
      enableSystem 
      storageKey={storageKey}
      themes={['light', 'dark', 'system']}
    >
      <ThemeSyncWrapper>
        {children}
      </ThemeSyncWrapper>
    </NextThemeProvider>
  );
}

// Re-export useTheme for convenience (use AppTheme version)
export { useTheme as useAppTheme } from '../theme';
export type { AppTheme, ColorScheme } from '../theme';

