'use client';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
export function ThemeProvider({ children }) {
    return (<NextThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="pm-theme" themes={['light', 'dark', 'system']}>
      {children}
    </NextThemeProvider>);
}
//# sourceMappingURL=ThemeProvider.jsx.map