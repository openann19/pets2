/**
 * useSafetyCenter Hook
 * Manages safety center operations including emergency mode, reporting, and safety tools
 */
import { useCallback, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Alert, Linking } from 'react-native';
import { logger } from '@pawfectmatch/core';
import { request } from '../../../services/api';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../navigation/types';

interface SafetyOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
}

interface UseSafetyCenterReturn {
  // Emergency mode
  emergencyMode: boolean;
  setEmergencyMode: (mode: boolean) => void;
  toggleEmergencyMode: () => Promise<void>;

  // Safety options
  safetyOptions: SafetyOption[];
  handleSafetyOption: (option: SafetyOption) => void;

  // Actions
  reportUser: (userId: string, reason: string) => Promise<boolean>;
  contactSupport: () => void;
  viewSafetyGuidelines: () => void;
  navigateToPrivacySettings: () => void;
  setupEmergencyContacts: () => void;
  viewSafetyTips: () => void;

  // State
  isReporting: boolean;
}

interface UseSafetyCenterOptions {
  navigation?: NavigationProp<RootStackParamList>;
}

export const useSafetyCenter = (options?: UseSafetyCenterOptions): UseSafetyCenterReturn => {
  const { navigation } = options || {};
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const toggleEmergencyMode = useCallback(async (): Promise<void> => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});

    const newMode = !emergencyMode;

    Alert.alert(
      newMode ? 'Enable Emergency Mode' : 'Disable Emergency Mode',
      newMode
        ? 'Emergency mode will limit interactions and enhance safety features.'
        : 'This will restore normal app functionality.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: newMode ? 'Enable' : 'Disable',
          style: newMode ? 'destructive' : 'default',
          onPress: () => {
            setEmergencyMode(newMode);
            Alert.alert(
              'Emergency Mode',
              newMode ? 'Emergency mode enabled. Stay safe!' : 'Emergency mode disabled',
            );
          },
        },
      ],
    );
  }, [emergencyMode]);

  const reportUser = useCallback(async (userId: string, reason: string): Promise<boolean> => {
    setIsReporting(true);
    try {
      const success = await request<boolean>('/reports', {
        method: 'POST',
        body: {
          type: 'user',
          targetId: userId,
          reason,
          description: `User reported: ${reason}`,
        },
      });

      if (success) {
        Alert.alert('Report Submitted', 'Thank you for your report. We will review it shortly.');
        logger.info('User reported successfully', { userId, reason });
        return true;
      } else {
        throw new Error('Report submission failed');
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to report user', { error: errorObj, userId });
      Alert.alert('Error', 'Failed to submit report. Please try again.');
      return false;
    } finally {
      setIsReporting(false);
    }
  }, []);

  const contactSupport = useCallback(async () => {
    try {
      const email = 'support@pawfectmatch.com';
      const subject = 'Safety Support Request';
      const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        logger.info('Contact support opened', { email });
      } else {
        Alert.alert('Contact Support', `Please email us at ${email}`);
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to open support email', { error: errorObj });
      Alert.alert(
        'Error',
        'Unable to open email app. Please contact support@pawfectmatch.com manually.',
      );
    }
  }, []);

  const viewSafetyGuidelines = useCallback(async () => {
    try {
      const url = 'https://pawfectmatch.com/safety-guidelines';
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        logger.info('Safety guidelines opened', { url });
      } else {
        Alert.alert('Safety Guidelines', `Visit ${url} to view safety guidelines.`);
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to open safety guidelines', { error: errorObj });
      Alert.alert('Error', 'Unable to open safety guidelines.');
    }
  }, []);

  const navigateToPrivacySettings = useCallback(() => {
    if (navigation) {
      try {
        (navigation as any).navigate('PrivacySettings');
        logger.info('Navigated to Privacy Settings');
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to navigate to Privacy Settings', { error: errorObj });
        Alert.alert('Navigation Error', 'Unable to navigate to Privacy Settings.');
      }
    } else {
      Alert.alert(
        'Privacy Settings',
        'Navigation not available. Please navigate to Privacy Settings from Settings screen.',
      );
    }
  }, [navigation]);

  const setupEmergencyContacts = useCallback(() => {
    // Navigate to settings or show info about emergency contacts
    Alert.alert(
      'Emergency Contacts',
      'To set up emergency contacts, please go to Settings > Privacy & Safety > Emergency Contacts.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Go to Settings',
          onPress: () => {
            if (navigation) {
              try {
                (navigation as any).navigate('Settings');
              } catch (error) {
                const errorObj = error instanceof Error ? error : new Error(String(error));
                logger.error('Failed to navigate to Settings', { error: errorObj });
              }
            }
          },
        },
      ],
    );
  }, [navigation]);

  const viewSafetyTips = useCallback(async () => {
    try {
      const url = 'https://pawfectmatch.com/safety-tips';
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        logger.info('Safety tips opened', { url });
      } else {
        Alert.alert('Safety Tips', `Visit ${url} to view safety tips and guidelines.`);
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to open safety tips', { error: errorObj });
      Alert.alert('Error', 'Unable to open safety tips.');
    }
  }, []);

  const handleSafetyOption = useCallback((option: SafetyOption) => {
    Haptics.selectionAsync().catch(() => {});
    option.action();
  }, []);

  const safetyOptions: SafetyOption[] = [
    {
      id: 'report',
      title: 'Report User',
      description: 'Report inappropriate behavior or content',
      icon: 'flag-outline',
      color: '#EF4444',
      action: () => {
        Alert.prompt(
          'Report User',
          'Please provide a reason for reporting this user:',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Submit',
              style: 'destructive',
              onPress: async (reason) => {
                if (reason && reason.trim()) {
                  // Note: userId should be passed from the component using this hook
                  const userId = 'unknown'; // Should be passed from component context
                  await reportUser(userId, reason.trim());
                }
              },
            },
          ],
          'plain-text',
        );
      },
    },
    {
      id: 'block',
      title: 'Block & Report',
      description: 'Block a user and report their behavior',
      icon: 'person-remove-outline',
      color: '#F59E0B',
      action: () => {
        // This would navigate back to profile where blocking is handled
        logger.info('Navigate back to profile for blocking');
      },
    },
    {
      id: 'privacy',
      title: 'Privacy Settings',
      description: 'Control who can see your profile and contact you',
      icon: 'lock-closed-outline',
      color: '#10B981',
      action: navigateToPrivacySettings,
    },
    {
      id: 'emergency',
      title: 'Emergency Contacts',
      description: 'Set up emergency contacts for safety',
      icon: 'call-outline',
      color: '#8B5CF6',
      action: setupEmergencyContacts,
    },
    {
      id: 'safety-tips',
      title: 'Safety Tips',
      description: 'Learn about online safety and best practices',
      icon: 'shield-checkmark-outline',
      color: '#06B6D4',
      action: viewSafetyTips,
    },
  ];

  return {
    // Emergency mode
    emergencyMode,
    setEmergencyMode,
    toggleEmergencyMode,

    // Safety options
    safetyOptions,
    handleSafetyOption,

    // Actions
    reportUser,
    contactSupport,
    viewSafetyGuidelines,
    navigateToPrivacySettings,
    setupEmergencyContacts,
    viewSafetyTips,

    // State
    isReporting,
  };
};
