'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthProvider } from '../src/components/providers/AuthProvider';
import { EnhancedErrorBoundary } from '../src/utils/error-boundary';
import { DevTools } from '../src/components/DevTools';
import { ThemeProvider } from '../src/providers/ThemeProvider';
import { CommandPalette } from '../src/providers/CommandPalette';
import { PWAManager } from '../src/components/PWA/PWAManager';

// Create query client per request to avoid sharing state between users
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <EnhancedErrorBoundary level="critical">
        <ThemeProvider>
          <CommandPalette>
            <PWAManager>
              <AuthProvider>
                {children}
              </AuthProvider>
            </PWAManager>
          </CommandPalette>
        </ThemeProvider>
      </EnhancedErrorBoundary>
      <DevTools />
    </QueryClientProvider>
  );
}
