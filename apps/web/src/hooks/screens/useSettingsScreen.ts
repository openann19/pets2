/**
 * useSettingsScreen Hook - Web Version
 * Matches mobile useSettingsScreen exactly
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { logger } from '@pawfectmatch/core';
import { useAuthStore } from '@/lib/auth-store';

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
}

export const useSettingsScreen = (): UseSettingsScreenReturn => {
  const { logout } = useAuthStore();

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

  useEffect(() => {
    const checkDeletionStatus = async () => {
      try {
        // Check deletion status from API
        const response = await fetch('/api/account/status');
        if (response.ok) {
          const status = await response.json();
          if (status.status === 'pending') {
            setDeletionStatus({
              isPending: true,
              daysRemaining: status.daysRemaining ?? null,
            });
          }
        }
      } catch (error) {
        logger.error('Failed to check deletion status:', { error });
      }
    };

    void checkDeletionStatus();
  }, []);

  const handleLogout = useCallback(() => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  }, [logout]);

  const handleDeleteAccount = useCallback(() => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Delete account logic
      logger.info('Account deletion initiated');
    }
  }, []);

  const handleExportData = useCallback(async () => {
    try {
      const response = await fetch('/api/account/export-data', {
        method: 'POST',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pawfectmatch-data.json';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      logger.error('Failed to export data:', { error });
    }
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
  };
};

