import React from 'react';

// Web-specific navigation container that provides navigation context
export const WebNavigationContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // For now, just render children. We'll add navigation state management later
  return <>{children}</>;
};
