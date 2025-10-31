/**
 * useSettingsScreen Hook - Comprehensive Settings State Manager
 * Manages all settings screen state, operations, and interactions
 */
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@pawfectmatch/core';
import { useAuthStore } from '@pawfectmatch/core';
import * as gdprService from '../../services/gdprService';
import { api } from '../../services/api';
import { analyticsService } from '../../services/analyticsService';
import { useColorScheme } from '../../hooks/useColorScheme';

// Types
interface Notifications {
  email: boolean;
  push: boolean;
  matches: boolean;
  messages: boolean;
}

interface Preferences {
  maxDistance: number;
  ageRange: { min: number; max: number };
  species: string[];
  intents: string[];
}

interface DeletionStatus {
  isPending: boolean;
  daysRemaining: number | null;
}

interface SettingsData {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt: string;
  };
  privacy: {
    profileVisible: boolean;
    showDistance: boolean;
    showAge: boolean;
    allowMessagesFromStrangers: boolean;
    dataSharing: {
      analytics: boolean;
      marketing: boolean;
      thirdParty: boolean;
    };
  };
  notifications: {
    push: {
      matches: boolean;
      messages: boolean;
      likes: boolean;
      superLikes: boolean;
      reminders: boolean;
    };
    email: {
      weeklyDigest: boolean;
      matchAlerts: boolean;
      securityAlerts: boolean;
      marketing: boolean;
    };
    sms: {
      securityAlerts: boolean;
      importantUpdates: boolean;
    };
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    units: 'metric' | 'imperial';
    maxDistance: number;
    ageRange: { min: number; max: number };
    petPreferences: {
      species: string[];
      sizes: string[];
      energyLevels: string[];
    };
  };
  account: {
    isPremium: boolean;
    subscriptionStatus: string;
    verificationStatus: string;
    lastLogin: string;
    loginDevices: Array<{
      id: string;
      name: string;
      lastActive: string;
      current: boolean;
    }>;
  };
}

interface UseSettingsScreenReturn {
  // State
  isLoading: boolean;
  isSaving: boolean;
  settings: SettingsData | null;
  error: string | null;

  // Legacy state (for backward compatibility)
  notifications: Notifications;
  preferences: Preferences;
  deletionStatus: DeletionStatus;

  // Settings operations
  updatePrivacySettings: (settings: Partial<SettingsData['privacy']>) => Promise<boolean>;
  togglePrivacySetting: (key: keyof SettingsData['privacy']) => Promise<void>;
  updatePushNotifications: (settings: Partial<SettingsData['notifications']['push']>) => Promise<boolean>;
  updateEmailNotifications: (settings: Partial<SettingsData['notifications']['email']>) => Promise<boolean>;
  toggleNotification: (type: 'push' | 'email', key: string) => Promise<void>;
  updatePreferences: (preferences: Partial<SettingsData['preferences']>) => Promise<boolean>;
  updatePreference: (key: keyof SettingsData['preferences'], value: any) => Promise<void>;

  // Account operations
  requestAccountDeletion: (reason: string) => Promise<boolean>;
  exportUserData: () => Promise<unknown>;
  logoutFromDevice: () => Promise<boolean>;
  logoutFromAllDevices: () => Promise<boolean>;

  // Device management
  getLoginDevices: () => SettingsData['account']['loginDevices'];
  getCurrentDevice: () => SettingsData['account']['loginDevices'][0] | undefined;
  revokeDeviceAccess: (deviceId: string) => Promise<boolean>;

  // Cache management
  clearCache: () => void;
  handleSettingsUpdate: (newSettings: SettingsData) => void;

  // Analytics
  trackSettingsInteraction: (element: string, metadata: Record<string, unknown>) => void;
  trackSettingsChange: (category: string, changes: Record<string, unknown>) => void;

  // Real-time updates
  handleSettingsUpdate: (newSettings: SettingsData) => void;

  // Utility
  getCurrentTheme: () => 'light' | 'dark';

  // Legacy setters (for backward compatibility)
  setNotifications: (notifications: Notifications) => void;
  setPreferences: (preferences: Preferences) => void;

  // Legacy handlers (for backward compatibility)
  handleLogout: () => void;
  handleDeleteAccount: () => void;
  handleExportData: () => Promise<void>;
  handleExportDataComplete: () => void;
}

const SETTINGS_CACHE_KEY = 'settings_screen_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Validation functions
const validateAgeRange = (ageRange: { min: number; max: number }): boolean => {
  return ageRange.min >= 0 && ageRange.max >= ageRange.min && ageRange.max <= 100;
};

const validateNotificationSettings = (settings: Partial<SettingsData['notifications']['push']>): boolean => {
  // Check push notification settings
  if (settings.matches !== undefined && typeof settings.matches !== 'boolean') return false;
  if (settings.messages !== undefined && typeof settings.messages !== 'boolean') return false;
  if (settings.likes !== undefined && typeof settings.likes !== 'boolean') return false;
  if (settings.superLikes !== undefined && typeof settings.superLikes !== 'boolean') return false;
  if (settings.reminders !== undefined && typeof settings.reminders !== 'boolean') return false;

  // Check for invalid properties
  const validKeys = ['matches', 'messages', 'likes', 'superLikes', 'reminders'];
  return Object.keys(settings).every(key => validKeys.includes(key));
};

const validatePrivacySettings = (settings: any): boolean => {
  // dataSharing is optional - only validate if provided
  if (settings.dataSharing !== undefined) {
    if (settings.dataSharing === null) return false;

    // If dataSharing exists, it must be an object
    if (typeof settings.dataSharing !== 'object') return false;

    // Validate dataSharing properties if present
    const { analytics, marketing, thirdParty } = settings.dataSharing;
    if (analytics !== undefined && typeof analytics !== 'boolean') return false;
    if (marketing !== undefined && typeof marketing !== 'boolean') return false;
    if (thirdParty !== undefined && typeof thirdParty !== 'boolean') return false;
  }

  return true;
};

export const useSettingsScreen = (): UseSettingsScreenReturn => {
  const { logout, user: authUser } = useAuthStore();
  const colorScheme = useColorScheme();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Legacy state (for backward compatibility)
  const [notifications, setNotifications] = useState<Notifications>({
    email: true,
    push: true,
    matches: true,
    messages: true,
  });

  const [preferences, setPreferences] = useState<Preferences>({
    maxDistance: 50,
    ageRange: { min: 0, max: 30 },
    species: [],
    intents: [],
  });

  const [deletionStatus, setDeletionStatus] = useState<DeletionStatus>({
    isPending: false,
    daysRemaining: null,
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try cache first
      const cached = await AsyncStorage.getItem(SETTINGS_CACHE_KEY);
      if (cached) {
        try {
          const { settings: cachedSettings, timestamp } = JSON.parse(cached);
          const isFresh = Date.now() - timestamp < CACHE_DURATION;

          if (isFresh && cachedSettings) {
            setSettings(cachedSettings);
            setIsLoading(false);
            return;
          }
        } catch (cacheError) {
          // Cache is corrupted, log and continue to fetch fresh data
          logger.warn('Corrupted cache data, fetching fresh data:', { error: cacheError });
        }
      }

      // Fetch fresh data
      const response = await api.get('/settings');
      const newSettings: SettingsData = response.data;

      setSettings(newSettings);

      // Cache the data
      await AsyncStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({
        settings: newSettings,
        timestamp: Date.now(),
      }));

      analyticsService.trackScreenView('SettingsScreen');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load settings';
      setError(errorMessage);
      logger.error('Settings load error:', { error: err });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePrivacySettings = useCallback(async (newSettings: Partial<SettingsData['privacy']>): Promise<boolean> => {
    if (!settings) return false;

    // Validate privacy settings
    if (!validatePrivacySettings(newSettings)) {
      setError('Invalid privacy settings');
      return false;
    }

    try {
      setIsSaving(true);
      setError(null);

      const response = await api.put('/settings/privacy', newSettings);

      const updatedSettings = {
        ...settings,
        privacy: { ...settings.privacy, ...newSettings },
      };

      setSettings(updatedSettings);
      await AsyncStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({
        settings: updatedSettings,
        timestamp: Date.now(),
      }));

      // Track settings change
      analyticsService.trackEvent('settings_changed', {
        category: 'privacy',
        changes: newSettings,
      }, authUser?.id);

      return response.data?.success ?? true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message :
        (typeof err === 'object' && err && 'message' in err) ? (err as { message: string }).message :
        'Failed to update privacy settings';
      setError(errorMessage);
      logger.error('Privacy settings update error:', { error: err });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [settings, authUser?.id]);

  const togglePrivacySetting = useCallback(async (key: keyof SettingsData['privacy']) => {
    if (!settings) return;

    const currentValue = settings.privacy[key];
    await updatePrivacySettings({ [key]: !currentValue });
  }, [settings, updatePrivacySettings]);

  const updatePushNotifications = useCallback(async (newSettings: Partial<SettingsData['notifications']['push']>): Promise<boolean> => {
    if (!settings) return false;

    // Validate notification settings
    if (!validateNotificationSettings(newSettings)) {
      setError('Invalid notification settings');
      return false;
    }

    try {
      setIsSaving(true);
      setError(null);

      const response = await api.put('/settings/notifications/push', newSettings);

      const updatedSettings = {
        ...settings,
        notifications: {
          ...settings.notifications,
          push: { ...settings.notifications.push, ...newSettings },
        },
      };

      setSettings(updatedSettings);
      await AsyncStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({
        settings: updatedSettings,
        timestamp: Date.now(),
      }));

      return response.data?.success ?? true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message :
        (typeof err === 'object' && err && 'message' in err) ? (err as { message: string }).message :
        'Failed to update push notifications';
      setError(errorMessage);
      logger.error('Push notifications update error:', { error: err });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const updateEmailNotifications = useCallback(async (newSettings: Partial<SettingsData['notifications']['email']>): Promise<boolean> => {
    if (!settings) return false;

    try {
      setIsSaving(true);
      setError(null);

      const response = await api.put('/settings/notifications/email', newSettings);

      const updatedSettings = {
        ...settings,
        notifications: {
          ...settings.notifications,
          email: { ...settings.notifications.email, ...newSettings },
        },
      };

      setSettings(updatedSettings);
      await AsyncStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({
        settings: updatedSettings,
        timestamp: Date.now(),
      }));

      return response.data?.success ?? true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message :
        (typeof err === 'object' && err && 'message' in err) ? (err as { message: string }).message :
        'Failed to update email notifications';
      setError(errorMessage);
      logger.error('Email notifications update error:', { error: err });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const toggleNotification = useCallback(async (type: 'push' | 'email', key: string) => {
    if (!settings) return;

    const currentValue = settings.notifications[type][key as keyof typeof settings.notifications[typeof type]];
    const updateMethod = type === 'push' ? updatePushNotifications : updateEmailNotifications;
    await updateMethod({ [key]: !currentValue });
  }, [settings, updatePushNotifications, updateEmailNotifications]);

  const updatePreferences = useCallback(async (newPreferences: Partial<SettingsData['preferences']>): Promise<boolean> => {
    if (!settings) return false;

    // Validate age range if provided
    if (newPreferences.ageRange && !validateAgeRange(newPreferences.ageRange)) {
      setError('Invalid age range');
      return false;
    }

    try {
      setIsSaving(true);
      setError(null);

      const response = await api.put('/settings/preferences', newPreferences);

      const updatedSettings = {
        ...settings,
        preferences: { ...settings.preferences, ...newPreferences },
      };

      setSettings(updatedSettings);
      await AsyncStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({
        settings: updatedSettings,
        timestamp: Date.now(),
      }));

      return response.data?.success ?? true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message :
        (typeof err === 'object' && err && 'message' in err) ? (err as { message: string }).message :
        'Failed to update preferences';
      setError(errorMessage);
      logger.error('Preferences update error:', { error: err });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const updatePreference = useCallback(async (key: keyof SettingsData['preferences'], value: SettingsData['preferences'][keyof SettingsData['preferences']]) => {
    await updatePreferences({ [key]: value });
  }, [updatePreferences]);

  const requestAccountDeletion = useCallback(async (reason: string): Promise<boolean> => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await api.post('/settings/account/delete', { reason });
      return response.data?.success ?? true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request account deletion';
      setError(errorMessage);
      logger.error('Account deletion request error:', { error: err });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const exportUserData = useCallback(async (): Promise<any> => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await api.post('/settings/account/export');
      return response.data?.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export user data';
      setError(errorMessage);
      logger.error('Data export error:', { error: err });
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const logoutFromDevice = useCallback(async (): Promise<boolean> => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await api.post('/auth/logout');
      return response.data?.success ?? true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to logout from device';
      setError(errorMessage);
      logger.error('Device logout error:', { error: err });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const logoutFromAllDevices = useCallback(async (): Promise<boolean> => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await api.post('/auth/logout-all');
      return response.data?.success ?? true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to logout from all devices';
      setError(errorMessage);
      logger.error('All devices logout error:', { error: err });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const getLoginDevices = useCallback(() => {
    return settings?.account.loginDevices ?? [];
  }, [settings]);

  const getCurrentDevice = useCallback(() => {
    return settings?.account.loginDevices.find(device => device.current);
  }, [settings]);

  const revokeDeviceAccess = useCallback(async (deviceId: string): Promise<boolean> => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await api.delete(`/settings/devices/${deviceId}`);

      if (settings) {
        const updatedSettings = {
          ...settings,
          account: {
            ...settings.account,
            loginDevices: settings.account.loginDevices.filter(device => device.id !== deviceId),
          },
        };
        setSettings(updatedSettings);
        await AsyncStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({
          settings: updatedSettings,
          timestamp: Date.now(),
        }));
      }

      return response.data?.success ?? true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revoke device access';
      setError(errorMessage);
      logger.error('Device access revocation error:', { error: err });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const clearCache = useCallback(async () => {
    setSettings(null);
    setError(null);
    await AsyncStorage.removeItem(SETTINGS_CACHE_KEY);
  }, []);

  const handleSettingsUpdate = useCallback((newSettings: SettingsData) => {
    setSettings(newSettings);
    AsyncStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({
      settings: newSettings,
      timestamp: Date.now(),
    })).catch(err => logger.error('Cache update error:', { error: err }));
  }, []);

  const getCurrentTheme = useCallback((): 'light' | 'dark' => {
    if (settings?.preferences.theme === 'system') {
      return colorScheme === 'dark' ? 'dark' : 'light';
    }
    return settings?.preferences.theme ?? 'light';
  }, [settings, colorScheme]);

  const trackSettingsInteraction = useCallback((element: string, metadata: Record<string, any>) => {
    // Derive action from element name
    let action = 'click';
    if (element.includes('_toggle')) {
      action = 'toggle';
    }

    analyticsService.trackEvent('settings_interaction', {
      element,
      action,
      ...metadata,
    }, authUser?.id);
  }, [authUser?.id]);

  const trackSettingsChange = useCallback((category: string, changes: Record<string, any>) => {
    analyticsService.trackEvent('settings_changed', {
      category,
      changes,
    }, authUser?.id);
  }, [authUser?.id]);

  // Legacy handlers (for backward compatibility)
  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
        },
      },
    ]);
  }, [logout]);

  const handleDeleteAccount = useCallback(() => {
    // If deletion is pending, cancel it
    if (deletionStatus.isPending) {
      Alert.alert(
        'Cancel Account Deletion',
        'Are you sure you want to cancel your account deletion request?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'default',
            onPress: async () => {
              try {
                const response = await gdprService.cancelDeletion();
                if (response.success) {
                  setDeletionStatus({
                    isPending: false,
                    daysRemaining: null,
                  });
                  Alert.alert('Success', 'Account deletion has been cancelled.');
                } else {
                  Alert.alert('Error', response.message || 'Failed to cancel deletion.');
                }
              } catch (error) {
                logger.error('Failed to cancel deletion:', { error });
                Alert.alert('Error', 'Failed to cancel deletion. Please try again.');
              }
            },
          },
        ],
      );
      return;
    }

    // Password prompt for account deletion
    Alert.prompt(
      'Delete Account',
      'Enter your password to confirm account deletion.\n\nYour account will be deleted in 30 days unless you cancel.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async (password) => {
            if (!password) {
              Alert.alert('Error', 'Password is required to delete your account.');
              return;
            }

            try {
              const response = await gdprService.deleteAccount({
                password,
                reason: 'User requested from settings',
              });

              if (response.success) {
                const gracePeriodEndsAt = response.gracePeriodEndsAt
                  ? new Date(response.gracePeriodEndsAt)
                  : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                const daysRemaining = Math.ceil(
                  (gracePeriodEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000),
                );

                setDeletionStatus({
                  isPending: true,
                  daysRemaining,
                });
                Alert.alert(
                  'Account Deletion Requested',
                  `Your account will be deleted in ${daysRemaining} days. You can cancel this anytime from settings.`,
                );
              } else {
                Alert.alert('Error', response.message || 'Failed to delete account.');
              }
            } catch (error) {
              logger.error('Failed to request account deletion:', { error });
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ],
      'secure-text',
    );
  }, [deletionStatus.isPending]);

  const handleExportData = useCallback(async () => {
    try {
      const response = await gdprService.exportUserData();

      if (response.success && response.exportData) {
        // In a real app, you would download or share the data
        Alert.alert(
          'Data Export Ready',
          `Your data export is ready! Export ID: ${response.exportId}. You will receive an email when it's available for download.`,
        );
      } else {
        Alert.alert('Export Started', response.message || 'Your data export is being prepared.');
      }
    } catch (error) {
      logger.error('Failed to export data:', { error });
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  }, []);

  const handleExportDataComplete = useCallback(() => {
    Alert.alert('Export Complete', 'Your data has been exported successfully.');
  }, []);

  return {
    // State
    isLoading,
    isSaving,
    settings,
    error,

    // Legacy state (for backward compatibility)
    notifications,
    preferences,
    deletionStatus,

    // Settings operations
    updatePrivacySettings,
    togglePrivacySetting,
    updatePushNotifications,
    updateEmailNotifications,
    toggleNotification,
    updatePreferences,
    updatePreference,

    // Account operations
    requestAccountDeletion,
    exportUserData,
    logoutFromDevice,
    logoutFromAllDevices,

    // Device management
    getLoginDevices,
    getCurrentDevice,
    revokeDeviceAccess,

    // Cache management
    clearCache,
    handleSettingsUpdate,

    // Analytics
    trackSettingsInteraction,
    trackSettingsChange,

    // Real-time updates
    handleSettingsUpdate,

    // Utility
    getCurrentTheme,

    // Legacy setters (for backward compatibility)
    setNotifications,
    setPreferences,

    // Legacy handlers (for backward compatibility)
    handleLogout,
    handleDeleteAccount,
    handleExportData,
    handleExportDataComplete,
  };
};
