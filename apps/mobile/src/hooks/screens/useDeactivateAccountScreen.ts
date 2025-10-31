/**
 * useDeactivateAccountScreen Hook
 * Manages Deactivate Account screen state and interactions
 */
import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { logger } from '@pawfectmatch/core';
import { useTranslation } from 'react-i18next';
import * as gdprService from '../../services/gdprService';

interface UseDeactivateAccountScreenReturn {
  reason: string;
  confirmText: string;
  loading: boolean;
  reasons: string[];
  selectReason: (reason: string) => void;
  setConfirmText: (text: string) => void;
  handleDeactivate: () => Promise<void>;
  handleGoBack: () => void;
  confirmationWord: string;
}

export const useDeactivateAccountScreen = (): UseDeactivateAccountScreenReturn => {
  const navigation = useNavigation();
  const { t } = useTranslation('common');
  const [reason, setReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  // Get translated reasons and confirmation word
  const reasons = [
    t('deactivate.reasons.takingBreak'),
    t('deactivate.reasons.foundPartner'),
    t('deactivate.reasons.notEnjoying'),
    t('deactivate.reasons.privacyConcerns'),
    t('deactivate.reasons.tooManyNotifications'),
    t('deactivate.reasons.other'),
  ];

  const confirmationWord = t('deactivate.confirmPlaceholder').toLowerCase();

  const selectReason = useCallback((selectedReason: string) => {
    Haptics.selectionAsync().catch(() => {});
    setReason(selectedReason);
  }, []);

  const handleDeactivate = useCallback(async () => {
    if (!reason) {
      Alert.alert(
        t('deactivate.alerts.required'),
        t('deactivate.alerts.selectReason'),
      );
      return;
    }

    if (confirmText.toLowerCase() !== confirmationWord) {
      Alert.alert(
        t('deactivate.alerts.confirmationRequired'),
        t('deactivate.alerts.typeConfirm'),
      );
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
        t('deactivate.alerts.successTitle'),
        t('deactivate.alerts.successMessage'),
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
      Alert.alert(
        t('deactivate.alerts.error'),
        t('deactivate.alerts.errorMessage'),
      );
    } finally {
      setLoading(false);
    }
  }, [reason, confirmText, navigation, t, confirmationWord]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    reason,
    confirmText,
    loading,
    reasons,
    selectReason,
    setConfirmText,
    handleDeactivate,
    handleGoBack,
    confirmationWord,
  };
};
