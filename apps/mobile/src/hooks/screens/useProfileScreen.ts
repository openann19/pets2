import { logger } from '@pawfectmatch/core';
import { useAuthStore } from '@pawfectmatch/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { matchesAPI } from '../../services/api';

export function useProfileScreen() {
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState({
    matches: true,
    messages: true,
    email: true,
    push: true,
  });
  const [privacy, setPrivacy] = useState({
    showLocation: true,
    showAge: true,
    showBreed: true,
  });

  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              logout?.();
              await AsyncStorage.clear();
              logger.info('User logged out successfully');
            } catch (error) {
              logger.error('Logout error:', { error });
            }
          })();
        },
      },
    ]);
  }, [logout]);

  const handleSettingToggle = useCallback((setting: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifications((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));
  }, []);

  const handlePrivacyToggle = useCallback((setting: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPrivacy((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));
  }, []);

  return {
    user,
    notifications,
    privacy,
    handleLogout,
    handleSettingToggle,
    handlePrivacyToggle,
  };
}
