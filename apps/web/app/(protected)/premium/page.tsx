/**
 * 💎 Premium Subscription Page - Phase 3
 * Tier selection and upgrade flow
 */

'use client';

import {
  BoltIcon,
  ChartBarIcon,
  CheckIcon,
  GlobeAltIcon,
  SparklesIcon,
  VideoCameraIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import PremiumButton from '@/components/UI/PremiumButton';
import PremiumCard from '@/components/UI/PremiumCard';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/services/api';
import type { SubscriptionPlan, SubscriptionStatus } from '@/types';

// Premium tier types
type PremiumTier = 'free' | 'basic' | 'premium' | 'vip';


function usePremiumTier(userId: string) {
  const [currentTier, setCurrentTier] = useState<PremiumTier>('free');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    const loadPremiumData = async () => {
      try {
        setIsLoading(true);
        
        // Load available plans
        const plansResponse: any = await api.subscription.getPlans();
        if (plansResponse.success) {
          setPlans(plansResponse.data.plans);
        }
        
        // Load current subscription status
        try {
          const statusResponse: any = await api.subscription.getCurrentSubscription();
          if (statusResponse.success) {
            setSubscriptionStatus(statusResponse.data);
            setCurrentTier(statusResponse.data.plan as PremiumTier);
          }
        } catch (error) {
          // User might not have a subscription yet
          console.log('No subscription found, using free tier');
        }
      } catch (error) {
        console.error('Failed to load premium data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadPremiumData();
    }
  }, [userId]);

  const upgrade = async (tier: PremiumTier) => {
    try {
      setIsUpgrading(true);
      
      // Create checkout session
      const checkoutResponse: any = await api.subscription.createCheckoutSession({
        plan: tier,
        interval: 'month'
      });
      
      if (checkoutResponse.success && checkoutResponse.data.url) {
        // Redirect to Stripe checkout
        window.location.href = checkoutResponse.data.url;
      }
    } catch (error) {
      console.error('Failed to upgrade:', error);
      alert('Failed to start upgrade process. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return {
    currentTier,
    plan: plans.find(p => (p as any).id === currentTier) || plans[0],
    allPlans: plans,
    subscriptionStatus,
    upgrade,
    isUpgrading,
    isLoading
  };
}

export default function PremiumPage() {
  const { user } = useAuthStore();
  const { currentTier, plan, allPlans, upgrade, isUpgrading, isLoading } = usePremiumTier(user?.id || '');
  const [selectedTier, setSelectedTier] = useState<PremiumTier>(currentTier);

  const handleUpgrade = () => {
    if (selectedTier !== currentTier) {
      upgrade(selectedTier);
    }
  };

  const tierIcons = {
    free: BoltIcon,
    basic: VideoCameraIcon,
    premium: ChartBarIcon,
    vip: GlobeAltIcon,
  };

  const tierColors = {
    free: 'from-gray-400 to-gray-500',
    basic: 'from-blue-500 to-blue-600',
    premium: 'from-pink-500 to-purple-600',
    vip: 'from-yellow-500 to-orange-600',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <SparklesIcon className="h-12 w-12 text-purple-500 mx-auto" />
          </motion.div>
          <p className="mt-4 text-gray-600">Loading premium plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4" data-testid="premium-page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <SparklesIcon className="w-16 h-16 mx-auto text-purple-500 mb-4" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Upgrade to Premium
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Unlock powerful features and find your perfect match faster
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Current Plan: <span className="font-semibold text-purple-600">{plan?.name || 'Free'}</span>
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <PremiumCard
              hover
              glow={selectedTier === 'free'}
              variant="gradient"
              className={`p-6 h-full ${selectedTier === 'free' ? 'ring-4 ring-purple-500' : ''}`}
              data-testid="plan-card"
            >
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tierColors.free} flex items-center justify-center mb-4`}>
                    <BoltIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h3>
                  <div className="flex items-baseline mb-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
                  </div>
                  {currentTier === 'free' && (
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-purple-500 rounded-full">
                      Current Plan
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-900 dark:text-white">Basic matching</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-900 dark:text-white">50 daily swipes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    <span className="text-sm text-gray-400">Video calls</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    <span className="text-sm text-gray-400">Analytics</span>
                  </div>
                </div>

                <PremiumButton
                  size="lg"
                  variant={selectedTier === 'free' ? 'primary' : 'secondary'}
                  disabled={currentTier === 'free'}
                  onClick={() => setSelectedTier('free')}
                >
                  {currentTier === 'free' ? 'Current Plan' : selectedTier === 'free' ? 'Selected' : 'Select Plan'}
                </PremiumButton>
              </div>
            </PremiumCard>
          </motion.div>

          {/* Paid Plans */}
          {allPlans.map((tierPlan, index) => {
            const Icon = tierIcons[(tierPlan as any).id as keyof typeof tierIcons];
            const isCurrentTier = (tierPlan as any).id === currentTier;
            const isSelected = (tierPlan as any).id === selectedTier;

            return (
              <motion.div
                key={(tierPlan as any).id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 1) * 0.1 }}
              >
                <PremiumCard
                  hover
                  glow={isSelected}
                  variant="gradient"
                  className={`p-6 h-full ${isSelected ? 'ring-4 ring-purple-500' : ''}`}
                  data-testid="plan-card"
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tierColors[(tierPlan as any).id as keyof typeof tierColors]} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {tierPlan.name}
                      </h3>
                      <div className="flex items-baseline mb-2">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          ${tierPlan.price}
                        </span>
                        <span className="text-gray-500 ml-2">/month</span>
                      </div>
                      {isCurrentTier && (
                        <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-purple-500 rounded-full">
                          Current Plan
                        </span>
                      )}
                    </div>

                    <div className="flex-1 space-y-3 mb-6">
                      {tierPlan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2">
                          <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-900 dark:text-white">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <PremiumButton
                      size="lg"
                      variant={isSelected ? 'primary' : 'secondary'}
                      disabled={isCurrentTier}
                      onClick={() => setSelectedTier((tierPlan as any).id as PremiumTier)}
                    >
                      {isCurrentTier ? 'Current Plan' : isSelected ? 'Selected' : 'Select Plan'}
                    </PremiumButton>
                  </div>
                </PremiumCard>
              </motion.div>
            );
          })}
        </div>

        {/* Upgrade Button */}
        {selectedTier !== currentTier && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <PremiumCard className="max-w-2xl mx-auto p-8" glow>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to upgrade?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Upgrade to {selectedTier === 'free' ? 'Free' : allPlans.find(p => (p as any).id === selectedTier)?.name} for just 
                <span className="font-bold text-purple-600 mx-2">
                  ${selectedTier === 'free' ? '0' : allPlans.find(p => (p as any).id === selectedTier)?.price}/month
                </span>
              </p>
              <div className="flex gap-4 justify-center">
                <PremiumButton
                  size="lg"
                  variant="secondary"
                  onClick={() => setSelectedTier(currentTier)}
                >
                  Cancel
                </PremiumButton>
                <PremiumButton
                  size="lg"
                  loading={isUpgrading}
                  onClick={handleUpgrade}
                  data-testid="upgrade-button"
                >
                  Upgrade Now
                </PremiumButton>
              </div>
            </PremiumCard>
          </motion.div>
        )}

        {/* Feature Comparison */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Feature Comparison
          </h2>
          <PremiumCard className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 text-gray-900 dark:text-white font-semibold">
                      Feature
                    </th>
                    <th className="text-center py-4 px-4 text-gray-900 dark:text-white font-semibold">Free</th>
                    {allPlans.map(tierPlan => (
                      <th key={(tierPlan as any).id} className="text-center py-4 px-4 text-gray-900 dark:text-white font-semibold">
                        {tierPlan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-600">Basic Matching</td>
                    <td className="text-center py-3 px-4">
                      <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                    {allPlans.map(tierPlan => (
                      <td key={(tierPlan as any).id} className="text-center py-3 px-4">
                        <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-600">Advanced Matching</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-gray-300">—</span>
                    </td>
                    {allPlans.map(tierPlan => (
                      <td key={(tierPlan as any).id} className="text-center py-3 px-4">
                        <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-600">Super Likes</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-gray-300">—</span>
                    </td>
                    {allPlans.map(tierPlan => (
                      <td key={(tierPlan as any).id} className="text-center py-3 px-4">
                        <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-600">Priority Support</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-gray-300">—</span>
                    </td>
                    {allPlans.map(tierPlan => (
                      <td key={(tierPlan as any).id} className="text-center py-3 px-4">
                        {(tierPlan as any).id === 'vip' ? (
                          <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-gray-600">All Features</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-gray-300">—</span>
                    </td>
                    {allPlans.map(tierPlan => (
                      <td key={(tierPlan as any).id} className="text-center py-3 px-4">
                        {(tierPlan as any).id === 'vip' ? (
                          <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
}
