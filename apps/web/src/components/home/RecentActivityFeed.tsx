/**
 * RecentActivityFeed Component - WEB VERSION
 * Displays recent activity feed matching mobile design
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { Card } from '@/components/UI/Card';
import type { RecentActivityItem } from '@/hooks/screens/types';
import {
  HeartIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

interface RecentActivityFeedProps {
  activities: RecentActivityItem[];
}

const iconMap: Record<RecentActivityItem['type'], React.ComponentType<React.SVGProps<SVGSVGElement> & { className?: string }>> = {
  match: HeartIcon,
  message: ChatBubbleLeftRightIcon,
  view: EyeIcon,
  like: UserPlusIcon,
};

export function RecentActivityFeed({ activities }: RecentActivityFeedProps): React.JSX.Element {
  const theme = useTheme() as AppTheme;

  if (activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ padding: theme.spacing.lg }}
      >
        <Card padding="lg" radius="md" shadow="elevation1" tone="surface">
          <p style={{ color: theme.colors.onMuted, textAlign: 'center' }}>
            No recent activity
          </p>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
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
        Recent Activity
      </h2>

      <div className="space-y-3">
        {activities.map((activity, index) => {
          const IconComponent = iconMap[activity.type] || HeartIcon;

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                padding="md"
                radius="md"
                shadow="elevation1"
                tone="surface"
                hover
                className="cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: theme.colors.primary + '20',
                    }}
                  >
                    <IconComponent
                      className="w-5 h-5"
                      style={{ color: theme.colors.primary } as React.CSSProperties}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold mb-1"
                      style={{
                        fontSize: theme.typography.body.size,
                        color: theme.colors.onSurface,
                      }}
                    >
                      {activity.title}
                    </p>
                    <p
                      className="text-sm mb-1"
                      style={{
                        color: theme.colors.onMuted,
                        fontSize: theme.typography.body.size * 0.875,
                      }}
                    >
                      {activity.message}
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: theme.colors.onMuted,
                        fontSize: theme.typography.body.size * 0.75,
                      }}
                    >
                      {activity.timeAgo}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

