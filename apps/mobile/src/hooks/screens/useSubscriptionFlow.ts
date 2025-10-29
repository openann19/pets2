/**
 * useSubscriptionFlow Hook
 * Manages subscription flow state and navigation between screens
 */
import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { logger } from '@pawfectmatch/core';
import { premiumService } from '../../services/PremiumService';

type SubscriptionFlowStep = 'select-plan' | 'checkout' | 'processing' | 'success' | 'cancelled';

interface SubscriptionFlowState {
  currentStep: SubscriptionFlowStep;
  selectedPlanId: string | null;
  billingPeriod: 'monthly' | 'yearly';
  isProcessing: boolean;
  error: string | null;
}

interface UseSubscriptionFlowReturn extends SubscriptionFlowState {
  startFlow: (planId: string, billingPeriod?: 'monthly' | 'yearly') => void;
  proceedToCheckout: () => Promise<boolean>;
  handleSuccess: () => void;
  handleCancel: () => void;
  resetFlow: () => void;
  setBillingPeriod: (period: 'monthly' | 'yearly') => void;
  retryCheckout: () => Promise<boolean>;
}

export const useSubscriptionFlow = (): UseSubscriptionFlowReturn => {
  const navigation = useNavigation();

  const [state, setState] = useState<SubscriptionFlowState>({
    currentStep: 'select-plan',
    selectedPlanId: null,
    billingPeriod: 'monthly',
    isProcessing: false,
    error: null,
  });

  const startFlow = useCallback(
    (planId: string, billingPeriod: 'monthly' | 'yearly' = 'monthly') => {
      setState({
        currentStep: 'select-plan',
        selectedPlanId: planId,
        billingPeriod,
        isProcessing: false,
        error: null,
      });

      logger.info('Subscription flow started', { planId, billingPeriod });
    },
    [],
  );

  const proceedToCheckout = useCallback(async (): Promise<boolean> => {
    if (!state.selectedPlanId) {
      setState((prev) => ({ ...prev, error: 'No plan selected' }));
      return false;
    }

    try {
      setState((prev) => ({
        ...prev,
        currentStep: 'processing',
        isProcessing: true,
        error: null,
      }));

      // Get plan details
      const plans = premiumService.getAvailablePlans();
      const plan = plans.find((p) => p.id === state.selectedPlanId);

      if (!plan) {
        throw new Error('Selected plan not found');
      }

      // Create checkout session
      const session = await premiumService.createCheckoutSession(
        plan.stripePriceId,
        'pawfectmatch://subscription/success',
        'pawfectmatch://subscription/cancel',
      );

      if (session?.url) {
        // Open Stripe checkout
        await Linking.openURL(session.url);
        setState((prev) => ({
          ...prev,
          currentStep: 'checkout',
          isProcessing: false,
        }));
        return true;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout';
      setState((prev) => ({
        ...prev,
        currentStep: 'select-plan',
        isProcessing: false,
        error: errorMessage,
      }));
      logger.error('Checkout failed', { error, planId: state.selectedPlanId });

      Alert.alert('Checkout Error', 'Failed to start checkout process. Please try again.', [
        { text: 'OK' },
      ]);

      return false;
    }
  }, [state.selectedPlanId]);

  const handleSuccess = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: 'success',
      isProcessing: false,
    }));

    // Navigate to success screen
    navigation.navigate('SubscriptionSuccess' as never);

    logger.info('Subscription flow completed successfully', {
      planId: state.selectedPlanId,
      billingPeriod: state.billingPeriod,
    });
  }, [navigation, state.selectedPlanId, state.billingPeriod]);

  const handleCancel = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: 'cancelled',
      isProcessing: false,
    }));

    // Navigate back or to cancel screen
    navigation.goBack();

    logger.info('Subscription flow cancelled', {
      planId: state.selectedPlanId,
    });
  }, [navigation, state.selectedPlanId]);

  const resetFlow = useCallback(() => {
    setState({
      currentStep: 'select-plan',
      selectedPlanId: null,
      billingPeriod: 'monthly',
      isProcessing: false,
      error: null,
    });
  }, []);

  const setBillingPeriod = useCallback((period: 'monthly' | 'yearly') => {
    setState((prev) => ({ ...prev, billingPeriod: period }));
  }, []);

  const retryCheckout = useCallback(async (): Promise<boolean> => {
    return proceedToCheckout();
  }, [proceedToCheckout]);

  return {
    ...state,
    startFlow,
    proceedToCheckout,
    handleSuccess,
    handleCancel,
    resetFlow,
    setBillingPeriod,
    retryCheckout,
  };
};
