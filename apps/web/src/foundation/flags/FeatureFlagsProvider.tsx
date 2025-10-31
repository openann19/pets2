/**
 * 🎯 FOUNDATION: FEATURE FLAGS PROVIDER
 * 
 * Provides feature flags with remote loading support
 */

'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isBrowser, getSafeWindow } from '@pawfectmatch/core/utils/env';
import { DEFAULT_FLAGS, type Flags } from './flags';

const FlagsCtx = createContext<Flags>(DEFAULT_FLAGS);

export interface FeatureFlagsProviderProps {
  bootstrap?: Partial<Flags>;
  children: React.ReactNode;
}

export const FeatureFlagsProvider: React.FC<FeatureFlagsProviderProps> = ({ 
  bootstrap, 
  children 
}) => {
  const [remote, setRemote] = useState<Partial<Flags>>({});

  // Minimal remote loading (optional). In prod, replace with your remote-config.
  useEffect(() => {
    if (!isBrowser()) return;

    let aborted = false;
    fetch('/flags.json', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : {})
      .then((data) => { 
        if (!aborted) setRemote(data); 
      })
      .catch(() => {
        // Silently fail - use defaults
      });
    
    return () => { 
      aborted = true; 
    };
  }, []);

  // Safe mode via query (?safeMode=1) — great for Play Pre-launch or reviewer repro
  const win = getSafeWindow();
  const querySafe = win !== undefined && 
    new URLSearchParams(win.location.search).get('safeMode') === '1';

  const value = useMemo<Flags>(() => ({
    ...DEFAULT_FLAGS,
    ...bootstrap,
    ...remote,
    'effects.safeMode': querySafe || 
      (bootstrap?.['effects.safeMode'] ?? false) || 
      (remote['effects.safeMode'] ?? false),
  }), [bootstrap, remote, querySafe]);

  return <FlagsCtx.Provider value={value}>{children}</FlagsCtx.Provider>;
};

export function useFlags(): Flags {
  const ctx = useContext(FlagsCtx);
  if (!ctx) {
    // Fallback if used outside provider
    return DEFAULT_FLAGS;
  }
  return ctx;
}

