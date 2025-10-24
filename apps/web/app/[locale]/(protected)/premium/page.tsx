'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import PremiumLayout from '@/components/Layout/PremiumLayout';
import PremiumCard from '@/components/UI/PremiumCard';
import PremiumButton from '@/components/UI/PremiumButton';
import LanguageSelect from '@/components/UI/LanguageSelect';
import { motion } from 'framer-motion';
import { StarIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function PremiumPage() {
  // Handle missing translations gracefully
  let t: any;
  try {
    t = useTranslations();
  } catch (error) {
    // Fallback translations if context is missing
    t = (key: string) => {
      const fallbacks: Record<string, string> = {
        'premium.title': 'Premium Features',
        'premium.subtitle': 'Unlock exclusive features and enhance your pet matching experience',
        'premium.features.unlimitedLikes': 'Unlimited Likes',
        'premium.features.superLikes': 'Super Likes',
        'premium.features.rewind': 'Rewind Last Swipe',
      };
      return fallbacks[key] || key;
    };
  }

  const premiumFeatures = [
    {
      feature: 'unlimitedLikes',
      icon: StarIcon,
      description: 'Супер харесвания'
    },
    {
      feature: 'superLikes',
      icon: SparklesIcon,
      description: 'Неограничени харесвания'
    },
    {
      feature: 'rewind',
      icon: CheckCircleIcon,
      description: 'Отмени последното суайпване'
    }
  ];

  return (
    <PremiumLayout>
      <div className="min-h-screen py-12 px-4" data-testid="premium-page">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                {t('premium.title')}
              </span>
            </h1>
            <p className="text-white/70 text-xl max-w-2xl mx-auto">
              {t('premium.subtitle')}
            </p>
            
            {/* Language Switcher */}
            <div className="mt-6 flex justify-center">
              <LanguageSelect />
            </div>
          </motion.div>

          {/* Premium Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-3 gap-8 mb-12"
          >
            {premiumFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <PremiumCard variant="glass" className="p-6 text-center">
                  <feature.icon className="w-12 h-12 text-pink-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    {t(`premium.features.${feature.feature}`)}
                  </h3>
                  <p className="text-white/70">
                    {feature.description}
                  </p>
                </PremiumCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <PremiumButton
              variant="primary"
              size="lg"
              glow
              magneticEffect
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 font-bold shadow-xl"
            >
              {t('premium.subscribe')}
            </PremiumButton>
          </motion.div>
        </div>
      </div>
    </PremiumLayout>
  );
}