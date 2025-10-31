/**
 * Admin Dashboard Component
 * Platform-agnostic admin dashboard wrapper
 */
import React from 'react';

export interface AdminDashboardProps {
  title?: string;
  children?: React.ReactNode;
  onRefresh?: () => void | Promise<void>;
  loading?: boolean;
}

/**
 * AdminDashboard - Platform-agnostic container component
 * Platform-specific implementations should wrap this or use it as a base
 */
export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  title,
  children,
  onRefresh,
  loading,
}) => {
  return (
    <div data-testid="admin-dashboard">
      {title && <h1>{title}</h1>}
      {loading && <div>Loading...</div>}
      {children}
      {onRefresh && (
        <button onClick={onRefresh} type="button">
          Refresh
        </button>
      )}
    </div>
  );
};
