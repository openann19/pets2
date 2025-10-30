/**
 * useSubscriptionManager Hook
 * Manages subscription management screen state and operations
 */
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { logger } from '@pawfectmatch/core';
import { usePremiumStatus } from '../domains/premium/usePremiumStatus';
import { useSubscriptionState } from '../domains/premium/useSubscriptionState';
import { paymentErrorService } from '../../services/PaymentErrorLocalizationService';
import i18n from '../../i18n';

interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  plan: {
    id: string;
    name: string;
    interval: 'month' | 'year';
    amount: number;
    currency: string;
  };
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialEnd?: string;
}

interface UsageStats {
  swipesRemaining: number;
  totalSwipes: number;
  superLikesRemaining: number;
  totalSuperLikes: number;
  boostsRemaining: number;
  totalBoosts: number;
  resetDate: string;
}

interface UseSubscriptionManagerReturn {
  subscription: Subscription | null;
  usageStats: UsageStats | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  isCanceling: boolean;
  isUpdating: boolean;
  refreshData: () => Promise<void>;
  handleCancelSubscription: () => Promise<void>;
  handleUpdatePaymentMethod: () => Promise<void>;
  handleGoBack: () => void;
}

export const useSubscriptionManager = (): UseSubscriptionManagerReturn => {
  const navigation = useNavigation();
  const { subscriptionStatus, refreshStatus } = usePremiumStatus();
  const {
    cancelSubscription,
    updatePaymentMethod,
    isCanceling,
    isUpdating,
    error: stateError,
  } = useSubscriptionState();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionData = useCallback(async () => {
    try {
      setError(null);

      // Refresh premium status
      await refreshStatus();

      // Mock subscription data - in real app this would come from API
      const mockSubscription: Subscription = {
        id: 'sub_mock123',
        status: subscriptionStatus?.isActive ? 'active' : 'canceled',
        plan: {
          id: subscriptionStatus?.plan ?? 'free',
          name: subscriptionStatus?.plan ?? 'Free',
          interval: 'month',
          amount:
            subscriptionStatus?.plan === 'premium'
              ? 999
              : subscriptionStatus?.plan === 'ultimate'
                ? 1999
                : 0,
          currency: 'usd',
        },
        currentPeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
      };

      setSubscription(mockSubscription);

      // Mock usage stats
      const mockUsageStats: UsageStats = {
        swipesRemaining: 25,
        totalSwipes: 50,
        superLikesRemaining: 3,
        totalSuperLikes: 3,
        boostsRemaining: 1,
        totalBoosts: 1,
        resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      setUsageStats(mockUsageStats);

      logger.info('Subscription data fetched', {
        hasSubscription: !!mockSubscription,
        plan: mockSubscription.plan.name,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subscription data';
      setError(errorMessage);
      logger.error('Failed to fetch subscription data', { error: err });
    }
  }, [subscriptionStatus, refreshStatus]);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    await fetchSubscriptionData();
    setIsRefreshing(false);
  }, [fetchSubscriptionData]);

  const handleCancelSubscription = useCallback(async () => {
    Alert.alert(
      i18n.t('premium:subscription.cancel_subscription'),
      i18n.t('premium:subscription.cancel_warning', {
        defaultValue:
          "Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.",
      }),
      [
        { text: i18n.t('common:cancel'), style: 'cancel' },
        {
          text: i18n.t('premium:subscription.cancel_subscription'),
          style: 'destructive',
          onPress: async () => {
            const success = await cancelSubscription();
            if (success) {
              await refreshData();
              paymentErrorService.showSuccessAlert('subscription.cancelled_success', {
                defaultValue: 'Your subscription has been cancelled.',
              });
            } else {
              paymentErrorService.showErrorAlert('subscription_cancelled');
            }
          },
        },
      ],
    );
  }, [cancelSubscription, refreshData]);

  const handleUpdatePaymentMethod = useCallback(async () => {
    const success = await updatePaymentMethod();
    if (success) {
      // In real implementation, this would redirect to Stripe customer portal
      paymentErrorService.showSuccessAlert('subscription.payment_method_updated', {
        defaultValue: 'Payment method update initiated. Check your email for the secure link.',
      });
    } else {
      paymentErrorService.showErrorAlert('processing_error');
    }
  }, [updatePaymentMethod]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Initial data fetch
  useEffect(() => {
    void fetchSubscriptionData().finally(() => {
      setIsLoading(false);
    });
  }, [fetchSubscriptionData]);

  return {
    subscription,
    usageStats,
    isLoading,
    isRefreshing,
    error: error || stateError,
    isCanceling,
    isUpdating,
    refreshData,
    handleCancelSubscription,
    handleUpdatePaymentMethod,
    handleGoBack,
  };
};
