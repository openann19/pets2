import React, { createContext, useContext, type ReactNode } from 'react';

import { useUIStore, type NotificationCounts } from '../stores/useUIStore';

export interface NotificationContextType {
  counts: NotificationCounts;
  updateCount: (type: keyof NotificationCounts, count: number) => void;
  incrementCount: (type: keyof NotificationCounts) => void;
  decrementCount: (type: keyof NotificationCounts) => void;
  clearCount: (type: keyof NotificationCounts) => void;
  clearAllCounts: () => void;
  getTotalCount: () => number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps): React.JSX.Element {
  const {
    notificationCounts,
    updateNotificationCount,
    incrementNotificationCount,
    decrementNotificationCount,
    clearNotificationCount,
    clearAllNotificationCounts,
    getTotalNotificationCount,
  } = useUIStore();

  const value: NotificationContextType = {
    counts: notificationCounts,
    updateCount: updateNotificationCount,
    incrementCount: incrementNotificationCount,
    decrementCount: decrementNotificationCount,
    clearCount: clearNotificationCount,
    clearAllCounts: clearAllNotificationCounts,
    getTotalCount: getTotalNotificationCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
