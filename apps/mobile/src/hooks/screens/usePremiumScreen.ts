/**
 * usePremiumScreen Hook
 * Manages premium subscription screen state and interactions
 */
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import { logger } from '@pawfectmatch/core';
import { usePremium } from '../../providers/PremiumProvider';
import { premiumService, type SubscriptionPlan } from '../../services/PremiumService';
import { useAuthStore } from '../../stores/useAuthStore';
import { _adminAPI } from '../../services/adminAPI';

type BillingPeriod = 'monthly' | 'yearly';

interface SubscriptionTier {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  stripePriceId: {
    monthly: string;
    yearly: string;
  };
  features: string[];
  popular?: boolean;
}

interface UsePremiumScreenReturn {
  billingPeriod: BillingPeriod;
  selectedTier: string;
  isLoading: boolean;
  isRestoring: boolean;
  subscriptionTiers: SubscriptionTier[];
  availablePlans: SubscriptionPlan[];
  setBillingPeriod: (period: BillingPeriod) => void;
  setSelectedTier: (tierId: string) => void;
  handleSubscribe: (tierId: string) => Promise<void>;
  handleRestorePurchases: () => Promise<void>;
  handleGoBack: () => void;
}

const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: { monthly: 0, yearly: 0 },
    stripePriceId: {
      monthly: '',
      yearly: '',
    },
    features: [
      '5 daily swipes',
      'Basic matching',
      'Standard chat',
      'Weather updates',
      'Community support',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: { monthly: 9.99, yearly: 99.99 },
    stripePriceId: {
      monthly: 'price_premium_monthly',
      yearly: 'price_premium_yearly',
    },
    features: [
      'Unlimited swipes',
      'See who liked you',
      'Advanced filters',
      'Ad-free experience',
      'Advanced matching algorithm',
      'Priority in search results',
      'Read receipts',
      'Video calls',
    ],
    popular: true,
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: { monthly: 19.99, yearly: 199.99 },
    stripePriceId: {
      monthly: 'price_ultimate_monthly',
      yearly: 'price_ultimate_yearly',
    },
    features: [
      'All Premium features',
      'AI-powered recommendations',
      'Exclusive events access',
      'Priority support',
      'Profile boost',
      'Unlimited Super Likes',
      'Advanced analytics',
      'VIP status',
    ],
  },
];

export const usePremiumScreen = (): UsePremiumScreenReturn => {
  const navigation = useNavigation();
  const { restore } = usePremium();
  const { user } = useAuthStore();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [selectedTier, setSelectedTier] = useState<string>('premium');
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Track paywall view when screen is mounted
  useEffect(() => {
    const trackPaywallView = async () => {
      if (user?.id) {
        try {
          await _adminAPI.trackPaywallView('premium_screen');
        } catch (error) {
          // Non-critical - don't block UI if tracking fails
          logger.warn('Failed to track paywall view', { error });
        }
      }
    };

    void trackPaywallView();
  }, [user?.id]);

  const handleSubscribe = async (tierId: string) => {
    setIsLoading(true);
    try {
      const tier = SUBSCRIPTION_TIERS.find((t) => t.id === tierId);
      if (!tier) {
        throw new Error('Invalid subscription tier');
      }

      const priceId = tier.stripePriceId[billingPeriod];

      if (!priceId) {
        // Free tier - no subscription needed
        return;
      }

      // Create checkout session
      const session = await premiumService.createCheckoutSession(
        priceId,
        'pawfectmatch://subscription/success',
        'pawfectmatch://subscription/cancel',
      );

      // Open Stripe checkout in browser
      if (session?.url) {
        await Linking.openURL(session.url);
      }
    } catch (error) {
      logger.error('Subscription error:', { error });
      Alert.alert('Subscription Error', 'Failed to start checkout process. Please try again.', [
        { text: 'OK' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    try {
      await restore();
      Alert.alert(
        'Success',
        'Your purchases have been restored. You now have access to all premium features.',
      );
    } catch (error) {
      logger.error('Restore purchases error:', { error });
      Alert.alert(
        'Error',
        'Failed to restore purchases. Please check your internet connection and try again. If you continue to have issues, please contact support.',
      );
    } finally {
      setIsRestoring(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const availablePlans = premiumService.getAvailablePlans();

  return {
    billingPeriod,
    selectedTier,
    isLoading,
    isRestoring,
    subscriptionTiers: SUBSCRIPTION_TIERS,
    availablePlans,
    setBillingPeriod,
    setSelectedTier,
    handleSubscribe,
    handleRestorePurchases,
    handleGoBack,
  };
};
