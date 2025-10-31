/**
 * PremiumSection Component - WEB VERSION
 * Premium upgrade prompt matching mobile design
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { Card } from '@/components/UI/Card';
import { Button } from '@/components/UI/Button';
import { SparklesIcon } from '@heroicons/react/24/solid';

interface PremiumSectionProps {
  onUpgradePress: () => void;
}

export function PremiumSection({ onUpgradePress }: PremiumSectionProps): React.JSX.Element {
  const theme = useTheme() as AppTheme;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      style={{ padding: theme.spacing.lg }}
    >
      <Card
        padding="lg"
        radius="lg"
        shadow="glass"
        tone="surface"
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary}20 0%, ${theme.colors.primary}10 100%)`,
          borderColor: theme.colors.primary + '40',
          borderRadius: theme.radii.xl,
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.palette.gradients.primary[1]} 100%)`,
            }}
          >
            <SparklesIcon className="w-8 h-8" style={{ color: theme.colors.onPrimary }} />
          </div>
          <div className="flex-1">
            <h3
              className="font-bold mb-1"
              style={{
                fontSize: theme.typography.h2.size,
                color: theme.colors.onSurface,
              }}
            >
              Upgrade to Premium
            </h3>
            <p
              className="text-sm mb-3"
              style={{
                color: theme.colors.onMuted,
                fontSize: theme.typography.body.size * 0.875,
              }}
            >
              Unlock unlimited swipes, see who liked you, and more!
            </p>
            <Button
              title="Upgrade Now"
              variant="primary"
              size="sm"
              onPress={onUpgradePress}
              icon={<SparklesIcon className="w-4 h-4" />}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

