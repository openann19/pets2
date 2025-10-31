import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Route protection component that redirects to login if not authenticated
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // For now, always allow access. We'll add authentication logic later
  const isAuthenticated = true; // TODO: Get from auth context

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
