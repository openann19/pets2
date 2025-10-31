/**
 * Universal test utilities for React Native Testing Library
 * Solves renderWithAct compatibility issues with RNTL v13.3.3
 * 
 * Uses pure entrypoint for hooks to avoid internal renderWithAct
 * and wraps with explicit act via react-test-renderer
 */

import React from 'react';
import { render as rtlRender } from '@testing-library/react-native';
import { renderHook as rtlRenderHookPure } from '@testing-library/react-native/pure';

type RenderOptions = Parameters<typeof rtlRender>[1];

function Providers({ children }: { children: React.ReactNode }) {
  // ThemeProvider is already mocked in jest.setup.ts, so no need to wrap
  // Just return children directly - the mock will handle theme context
  return <>{children}</>;
}

export function render(ui: React.ReactElement, options?: RenderOptions) {
  // Don't use wrapper - ThemeProvider is mocked globally in jest.setup.ts
  // This avoids renderWithAct issues with real ThemeProvider component
  return rtlRender(ui, options);
}

export function renderHookSafe<TProps, TResult>(
  hook: (initialProps: TProps) => TResult,
  options?: Parameters<typeof rtlRenderHookPure<TProps, TResult>>[1]
) {
  // Pure entrypoint avoids renderWithAct - no wrapper needed for hooks
  // Hooks don't need NavigationContainer, that's handled by mocks
  return rtlRenderHookPure<TProps, TResult>(hook, options);
}

