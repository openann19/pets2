import React from 'react';
import { initializeNotificationsService, notificationService } from '../services/notifications';

/**
 * React Hook for notifications management
 * Provides access to notification functionality and state
 */
export const useNotifications = () => {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [pushToken, setPushToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    const initializeNotifications = async () => {
      try {
        const token = await initializeNotificationsService();
        setPushToken(token);
        setIsInitialized(true);
      } catch (error) {
        // On error, mark as initialized but with null token
        setPushToken(null);
        setIsInitialized(true);
      }
    };

    initializeNotifications();

    return () => {
      notificationService.cleanup();
    };
  }, []);

  return {
    isInitialized,
    pushToken,
    sendMatchNotification: notificationService.sendMatchNotification.bind(notificationService),
    sendMessageNotification: notificationService.sendMessageNotification.bind(notificationService),
    sendLikeNotification: notificationService.sendLikeNotification.bind(notificationService),
    scheduleReminderNotification:
      notificationService.scheduleReminderNotification.bind(notificationService),
    setBadgeCount: notificationService.setBadgeCount.bind(notificationService),
    clearBadge: notificationService.clearBadge.bind(notificationService),
  };
};
