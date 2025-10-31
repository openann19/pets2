import React from 'react';
import type { ReactNode } from 'react';

interface AppChromeProps {
  children: ReactNode;
}

export default function AppChrome({ children }: AppChromeProps): React.ReactElement {
  // Stub implementation - add chrome/header logic here if needed
  return <>{children}</>;
}
