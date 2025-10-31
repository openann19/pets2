import React from 'react';
import type { ReactNode } from 'react';

interface NavigationGuardProps {
  children: ReactNode;
}

export function NavigationGuard({ children }: NavigationGuardProps): React.ReactElement {
  // Stub implementation - add navigation guard logic here if needed
  return <>{children}</>;
}
