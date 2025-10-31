import React from 'react';

// Navigation guard that handles route protection and transitions
export const NavigationGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // For now, just render children. We'll add navigation logic later
  return <>{children}</>;
};
