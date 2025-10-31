/**
 * Dashboard Metrics Section - Web Version
 * Matches mobile design exactly
 */
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';
import { COLORS } from '@/constants/design-tokens';

export interface AdminStats {
  users: {
    total: number;
    active: number;
    verified: number;
    premium?: number;
    new24h?: number;
    suspended?: number;
    banned?: number;
    recent24h?: number;
  };
  pets: {
    total: number;
    active: number;
    recent24h: number;
  };
  matches: {
    total: number;
    active: number;
    blocked: number;
    recent24h?: number;
  };
  messages: {
    total: number;
    recent24h: number;
    deleted: number;
  };
  revenue?: {
    total: number;
    monthly: number;
    growth: number;
  };
}

interface DashboardMetricsSectionProps {
  stats: AdminStats;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const DashboardMetricsSection: React.FC<DashboardMetricsSectionProps> = ({ stats }) => {
  const theme = useTheme();
  const { colors, isDark } = theme;

  // Map theme colors to match mobile semantic colors
  // Use type assertion to handle theme typing
  const themeColors = colors as typeof COLORS;
  const surfaceColor = isDark ? themeColors.neutral[800] : themeColors.neutral[0];
  const onSurfaceColor = isDark ? themeColors.neutral[0] : themeColors.neutral[900];
  const onMutedColor = isDark ? themeColors.neutral[400] : themeColors.neutral[600];
  const primaryColor = themeColors.primary[500];

  const metrics = [
    {
      id: 'users',
      title: 'Users',
      value: stats.users.total,
      icon: UserIcon,
      details: [
        { label: 'Active', value: stats.users.active },
        { label: 'Verified', value: stats.users.verified },
      ],
    },
    {
      id: 'pets',
      title: 'Pets',
      value: stats.pets.total,
      icon: ChartBarIcon,
      details: [
        { label: 'Active', value: stats.pets.active },
        { label: 'New (24h)', value: stats.pets.recent24h },
      ],
    },
    {
      id: 'matches',
      title: 'Matches',
      value: stats.matches.total,
      icon: HeartIcon,
      details: [
        { label: 'Active', value: stats.matches.active },
        { label: 'Blocked', value: stats.matches.blocked },
      ],
    },
    {
      id: 'messages',
      title: 'Messages',
      value: stats.messages.total,
      icon: ChatBubbleLeftRightIcon,
      details: [
        { label: 'New (24h)', value: stats.messages.recent24h },
        { label: 'Deleted', value: stats.messages.deleted },
      ],
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              delay: index * 0.1,
            }}
            style={{
              width: '48%',
              borderRadius: '16px',
              padding: '16px',
              backgroundColor: surfaceColor,
              boxShadow: isDark
                ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                : '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <Icon
                style={{
                  width: '24px',
                  height: '24px',
                  color: primaryColor,
                }}
              />
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginLeft: '8px',
                  color: onSurfaceColor,
                  margin: 0,
                }}
              >
                {metric.title}
              </h3>
            </div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: onSurfaceColor,
              }}
            >
              {formatNumber(metric.value)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {metric.details.map((detail) => (
                <div
                  key={detail.label}
                  style={{
                    fontSize: '12px',
                    color: onMutedColor,
                  }}
                >
                  {detail.label}: {formatNumber(detail.value)}
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

