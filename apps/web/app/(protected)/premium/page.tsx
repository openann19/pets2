/**
 * PremiumScreen - Web Version
 * Identical to mobile PremiumScreen structure
 */

'use client';

import React from 'react';
import { ScreenShell } from '@/src/components/layout/ScreenShell';
import { usePremiumScreen } from '@/src/hooks/screens/usePremiumScreen';
import { useTranslation } from 'react-i18next';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function PremiumPage() {
  const { t } = useTranslation('premium');

  const {
    billingPeriod,
    selectedTier,
    isLoading,
    subscriptionTiers,
    setBillingPeriod,
    setSelectedTier,
    handleSubscribe,
    handleGoBack,
  } = usePremiumScreen();

  return (
    <ScreenShell
      header={
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-bold text-gray-900">
                {t('go_premium', 'Go Premium')}
              </h1>
              <button
                onClick={handleGoBack}
                className="p-2 text-gray-600 hover:text-gray-800"
                aria-label="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto">
        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1 inline-flex">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Subscription Tiers */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {subscriptionTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedTier(tier.id)}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                selectedTier === tier.id
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                <div className="text-right">
                  <span className="text-3xl font-bold text-gray-900">
                    ${tier.price[billingPeriod]}
                  </span>
                  <span className="text-gray-600 text-sm">
                    /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-700">
                    <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTier(tier.id);
                }}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  selectedTier === tier.id
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedTier === tier.id ? 'Selected' : 'Select'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Subscribe Button */}
        <button
          onClick={() => handleSubscribe(selectedTier)}
          disabled={isLoading}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              {t('premium_subscribe', 'Subscribe')}
              <span>→</span>
            </>
          )}
        </button>
      </div>
    </ScreenShell>
  );
}
