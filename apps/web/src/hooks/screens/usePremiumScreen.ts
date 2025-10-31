/**
 * usePremiumScreen Hook - Web Version
 * Matches mobile usePremiumScreen exactly
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@pawfectmatch/core';

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
  subscriptionTiers: SubscriptionTier[];
  setBillingPeriod: (period: BillingPeriod) => void;
  setSelectedTier: (tierId: string) => void;
  handleSubscribe: (tierId: string) => Promise<void>;
  handleGoBack: () => void;
}

const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
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
      'Priority in search results',
      'Read receipts',
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
      'Unlimited Super Likes',
      'Advanced analytics',
    ],
  },
];

export const usePremiumScreen = (): UsePremiumScreenReturn => {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [selectedTier, setSelectedTier] = useState<string>('premium');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (tierId: string) => {
    setIsLoading(true);
    try {
      const tier = SUBSCRIPTION_TIERS.find((t) => t.id === tierId);
      if (!tier) return;

      // Redirect to Stripe checkout
      const priceId = tier.stripePriceId[billingPeriod];
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      logger.error('Failed to initiate subscription:', { error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return {
    billingPeriod,
    selectedTier,
    isLoading,
    subscriptionTiers: SUBSCRIPTION_TIERS,
    setBillingPeriod,
    setSelectedTier,
    handleSubscribe,
    handleGoBack,
  };
};

