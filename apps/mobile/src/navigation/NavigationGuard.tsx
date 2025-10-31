import type { ReactNode } from 'react';
import React from 'react';

interface NavigationGuardProps {
  children: ReactNode;
}

/**
 * NavigationGuard - Navigation protection wrapper
 * Can be extended with navigation analytics, protection logic, etc.
 */
export function NavigationGuard({ children }: NavigationGuardProps): React.ReactElement {
  return <>{children}</>;
}
