/**
 * useSubscriptionState Hook
 * Manages subscription lifecycle state and transitions
 */
import { useCallback, useState } from 'react';
import { logger } from '@pawfectmatch/core';
import { premiumService, type SubscriptionStatus } from '../../../services/PremiumService';

interface SubscriptionState {
  status: SubscriptionStatus | null;
  isActivating: boolean;
  isCanceling: boolean;
  isUpdating: boolean;
  lastAction: 'activate' | 'cancel' | 'update' | null;
  error: string | null;
}

interface UseSubscriptionStateReturn extends SubscriptionState {
  activateSubscription: (planId: string) => Promise<boolean>;
  cancelSubscription: () => Promise<boolean>;
  updatePaymentMethod: () => Promise<boolean>;
  clearError: () => void;
  resetState: () => void;
}

export const useSubscriptionState = (): UseSubscriptionStateReturn => {
  const [state, setState] = useState<SubscriptionState>({
    status: null,
    isActivating: false,
    isCanceling: false,
    isUpdating: false,
    lastAction: null,
    error: null,
  });

  const activateSubscription = useCallback(async (planId: string): Promise<boolean> => {
    try {
      setState((prev) => ({
        ...prev,
        isActivating: true,
        error: null,
        lastAction: 'activate',
      }));

      // This would typically redirect to Stripe checkout
      // For now, we'll simulate the activation
      logger.info('Activating subscription', { planId });

      // In real implementation, this would handle the checkout flow
      // and then refresh the status via usePremiumStatus

      setState((prev) => ({ ...prev, isActivating: false }));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to activate subscription';
      setState((prev) => ({
        ...prev,
        isActivating: false,
        error: errorMessage,
      }));
      logger.error('Failed to activate subscription', { error: err, planId });
      return false;
    }
  }, []);

  const cancelSubscription = useCallback(async (): Promise<boolean> => {
    try {
      setState((prev) => ({
        ...prev,
        isCanceling: true,
        error: null,
        lastAction: 'cancel',
      }));

      const result = await premiumService.cancelSubscription();

      setState((prev) => ({
        ...prev,
        isCanceling: false,
        status: prev.status ? { ...prev.status, autoRenew: false } : null,
      }));

      logger.info('Subscription cancelled', result);
      return result.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel subscription';
      setState((prev) => ({
        ...prev,
        isCanceling: false,
        error: errorMessage,
      }));
      logger.error('Failed to cancel subscription', { error: err });
      return false;
    }
  }, []);

  const updatePaymentMethod = useCallback(async (): Promise<boolean> => {
    try {
      setState((prev) => ({
        ...prev,
        isUpdating: true,
        error: null,
        lastAction: 'update',
      }));

      // This would typically create a customer portal session
      // For now, we'll simulate the update
      logger.info('Updating payment method');

      // In real implementation, this would redirect to Stripe customer portal

      setState((prev) => ({ ...prev, isUpdating: false }));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update payment method';
      setState((prev) => ({ ...prev, isUpdating: false, error: errorMessage }));
      logger.error('Failed to update payment method', { error: err });
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const resetState = useCallback(() => {
    setState({
      status: null,
      isActivating: false,
      isCanceling: false,
      isUpdating: false,
      lastAction: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    activateSubscription,
    cancelSubscription,
    updatePaymentMethod,
    clearError,
    resetState,
  };
};
