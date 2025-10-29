import { useState, useCallback, useEffect } from 'react';
import { usePersistedState } from '@mobile/hooks/utils/usePersistedState';

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  matches: boolean;
  messages: boolean;
}

export interface UseNotificationSettingsReturn {
  settings: NotificationSettings;
  updateSetting: (key: keyof NotificationSettings, value: boolean) => void;
  resetToDefault: () => void;
}

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  email: true,
  push: true,
  matches: true,
  messages: true,
};

/**
 * Hook for managing notification settings with persistence
 */
export function useNotificationSettings(): UseNotificationSettingsReturn {
  const { value: settings, setValue } = usePersistedState<NotificationSettings>({
    key: 'notification_settings',
    initialValue: DEFAULT_NOTIFICATIONS,
  });

  const updateSetting = useCallback(
    (key: keyof NotificationSettings, value: boolean) => {
      setValue({ ...settings, [key]: value });
    },
    [settings, setValue],
  );

  const resetToDefault = useCallback(() => {
    setValue(DEFAULT_NOTIFICATIONS);
  }, [setValue]);

  return {
    settings,
    updateSetting,
    resetToDefault,
  };
}
