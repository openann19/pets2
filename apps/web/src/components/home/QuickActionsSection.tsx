/**
 * QuickActionsSection Component - WEB VERSION
 * Displays grid of quick action cards matching mobile design
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { Card } from '@/components/UI/Card';
import { cn } from '@/lib/utils';
import {
  HeartIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  PlusIcon,
  UserGroupIcon,
  SparklesIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

export interface QuickAction {
  id: string;
  icon: string;
  label: string;
  color: 'primary' | 'success' | 'secondary' | 'warning';
  glowColor: 'primary' | 'success' | 'secondary' | 'warning' | 'neon';
  gradient: 'primary' | 'secondary' | 'premium' | 'holographic';
  onPress: () => void;
  badge?: number | undefined;
  delay: number;
}

interface QuickActionsSectionProps {
  actions: QuickAction[];
}

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement> & { className?: string }>> = {
  heart: HeartIcon,
  'chatbubbles': ChatBubbleLeftRightIcon,
  person: UserCircleIcon,
  settings: Cog6ToothIcon,
  add: PlusIcon,
  people: UserGroupIcon,
  sparkles: SparklesIcon,
  map: MapPinIcon,
};

export function QuickActionsSection({ actions }: QuickActionsSectionProps): React.JSX.Element {
  const theme = useTheme() as AppTheme;

  const getColorValue = (color: QuickAction['color']): string => {
    switch (color) {
      case 'primary':
        return theme.colors.primary;
      case 'success':
        return theme.colors.success;
      case 'secondary':
        return theme.colors.info;
      case 'warning':
        return theme.colors.warning;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ padding: theme.spacing.lg }}
    >
      <h2
        className="font-semibold mb-4"
        style={{
          fontSize: theme.typography.h2.size,
          fontWeight: theme.typography.h2.weight,
          color: theme.colors.onSurface,
          marginBottom: theme.spacing.md,
        }}
      >
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => {
          const IconComponent = iconMap[action.icon] || HeartIcon;
          const colorValue = getColorValue(action.color);

          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: action.delay / 1000 }}
            >
              <Card
                padding="md"
                radius="lg"
                shadow="elevation2"
                tone="surface"
                hover
                className="cursor-pointer relative"
                onClick={action.onPress}
              >
                <div className="flex flex-col items-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-2 relative"
                    style={{ backgroundColor: colorValue }}
                  >
                    <IconComponent className="w-6 h-6" style={{ color: theme.colors.surface }} />
                    {action.badge !== undefined && action.badge > 0 && (
                      <span
                        className="absolute -top-1 -right-1 min-w-[24px] h-6 rounded-lg flex items-center justify-center px-1"
                        style={{
                          backgroundColor: theme.colors.danger,
                          color: theme.colors.onPrimary,
                          fontSize: theme.typography.body.size * 0.75,
                          fontWeight: theme.typography.h2.weight,
                        }}
                      >
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <span
                    className="text-sm font-semibold text-center"
                    style={{ color: theme.colors.onSurface }}
                  >
                    {action.label}
                  </span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

