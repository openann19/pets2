import React from 'react';

interface AppChromeProps {
  children: React.ReactNode;
}

// App chrome component for web - provides consistent layout and styling
const AppChrome: React.FC<AppChromeProps> = ({ children }) => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {children}
    </div>
  );
};

export default AppChrome;
