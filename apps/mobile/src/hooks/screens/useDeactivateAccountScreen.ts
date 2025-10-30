/**
 * useDeactivateAccountScreen Hook
 * Manages Deactivate Account screen state and interactions
 */
import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { logger } from '@pawfectmatch/core';
import gdprService from '../../services/gdprService';

interface UseDeactivateAccountScreenReturn {
  reason: string;
  confirmText: string;
  loading: boolean;
  reasons: string[];
  selectReason: (reason: string) => void;
  setConfirmText: (text: string) => void;
  handleDeactivate: () => Promise<void>;
  handleGoBack: () => void;
}

const DEACTIVATION_REASONS = [
  'Taking a break from dating',
  'Found a partner',
  'Not enjoying the app',
  'Privacy concerns',
  'Too many notifications',
  'Other',
];

export const useDeactivateAccountScreen = (): UseDeactivateAccountScreenReturn => {
  const navigation = useNavigation();
  const [reason, setReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const selectReason = useCallback((selectedReason: string) => {
    Haptics.selectionAsync().catch(() => {});
    setReason(selectedReason);
  }, []);

  const handleDeactivate = useCallback(async () => {
    if (!reason) {
      Alert.alert('Required', 'Please select a reason for deactivation.');
      return;
    }

    if (confirmText.toLowerCase() !== 'deactivate') {
      Alert.alert('Confirmation Required', 'Please type "deactivate" to confirm.');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});

    try {
      // Use GDPR service for account deactivation
      await gdprService.deleteAccount({
        password: 'N/A', // Not required for deactivation
        reason,
        feedback: confirmText,
      });

      logger.info('Account deactivated', { reason });

      Alert.alert(
        'Account Deactivated',
        'Your account has been temporarily deactivated. You can reactivate it anytime by logging back in.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
      );
    } catch (error) {
      logger.error('Failed to deactivate account', { error });
      Alert.alert('Error', 'Failed to deactivate account. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [reason, confirmText, navigation]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    reason,
    confirmText,
    loading,
    reasons: DEACTIVATION_REASONS,
    selectReason,
    setConfirmText,
    handleDeactivate,
    handleGoBack,
  };
};
