import React, { createContext, useContext, useMemo } from 'react';

interface DemoModeContextValue {
  enabled: boolean;
}

const DemoModeContext = createContext<DemoModeContextValue>({ enabled: false });

const readEnvironmentFlag = (): boolean => {
  const explicitFlag = process.env['EXPO_PUBLIC_DEMO_MODE'] ?? process.env['DEMO_MODE'];
  if (explicitFlag !== undefined) {
    return explicitFlag === 'true' || explicitFlag === '1';
  }

  if (typeof globalThis === 'object' && globalThis !== null) {
    const globalFlag = (globalThis as { __DEMO_MODE__?: unknown }).__DEMO_MODE__;
    if (typeof globalFlag === 'boolean') {
      return globalFlag;
    }
  }

  return false;
};

export interface DemoModeProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export const DemoModeProvider = ({ children, enabled }: DemoModeProviderProps): React.ReactElement => {
  const resolvedEnabled = enabled ?? readEnvironmentFlag();
  const value = useMemo(() => ({ enabled: resolvedEnabled }), [resolvedEnabled]);

  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>;
};

export const useDemoMode = (): DemoModeContextValue => useContext(DemoModeContext);

export const isDemoModeEnabled = (): boolean => readEnvironmentFlag();
