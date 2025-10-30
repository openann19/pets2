/**
 * useSettingsScreen Hook
 * Manages SettingsScreen state and business logic
 */
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@pawfectmatch/core';
import { useAuthStore } from '@pawfectmatch/core';
import * as gdprService from '../../services/gdprService';

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

interface UseSettingsScreenReturn {
  notifications: Notifications;
  preferences: Preferences;
  deletionStatus: DeletionStatus;
  setNotifications: (notifications: Notifications) => void;
  setPreferences: (preferences: Preferences) => void;
  handleLogout: () => void;
  handleDeleteAccount: () => void;
  handleExportData: () => Promise<void>;
  handleExportDataComplete: () => void;
}

export const useSettingsScreen = (): UseSettingsScreenReturn => {
  const { logout, user } = useAuthStore();

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

  // Check deletion status on mount
  useEffect(() => {
    const checkDeletionStatus = async () => {
      try {
        const status = await gdprService.getAccountStatus();
        if (status.success && status.status === 'pending') {
          setDeletionStatus({
            isPending: true,
            daysRemaining: status.daysRemaining ?? null,
          });
        } else {
          setDeletionStatus({
            isPending: false,
            daysRemaining: null,
          });
        }
      } catch (error) {
        logger.error('Failed to check deletion status:', { error });
      }
    };

    void checkDeletionStatus();
  }, []);

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
                  (gracePeriodEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
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
    notifications,
    preferences,
    deletionStatus,
    setNotifications,
    setPreferences,
    handleLogout,
    handleDeleteAccount,
    handleExportData,
    handleExportDataComplete,
  };
};
