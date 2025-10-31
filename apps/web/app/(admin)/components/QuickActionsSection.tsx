/**
 * Quick Actions Section - Web Version
 * Matches mobile design exactly with spring animations
 */
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  PhotoIcon,
  ShieldCheckIcon,
  UserIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';
import { COLORS } from '@/constants/design-tokens';

interface QuickActionsSectionProps {
  onNavigate?: (screen: string) => void;
}

const actionMap: Record<string, { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; color: string }> = {
  users: { icon: UserIcon, color: 'primary' },
  analytics: { icon: ChartBarIcon, color: 'info' },
  security: { icon: ShieldCheckIcon, color: 'danger' },
  billing: { icon: CurrencyDollarIcon, color: 'success' },
  verifications: { icon: CheckBadgeIcon, color: 'warning' },
  chats: { icon: ChatBubbleLeftRightIcon, color: 'primary' },
  uploads: { icon: PhotoIcon, color: 'primary' },
  services: { icon: Cog6ToothIcon, color: 'info' },
  config: { icon: Cog6ToothIcon, color: 'warning' },
  reports: { icon: DocumentIcon, color: 'danger' },
  infrastructure: { icon: ServerIcon, color: 'info' },
};

const hrefMap: Record<string, string> = {
  users: '/admin/users',
  analytics: '/admin/analytics',
  security: '/admin/security',
  billing: '/admin/billing',
  verifications: '/admin/verifications',
  chats: '/admin/chats',
  uploads: '/admin/uploads',
  services: '/admin/services',
  config: '/admin/config',
  reports: '/admin/reports',
  infrastructure: '/admin/infrastructure',
};

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({ onNavigate }) => {
  const theme = useTheme();
  const { colors, spacing, isDark } = theme;

  // Map theme colors - use type assertion to handle theme typing
  const themeColors = colors as typeof COLORS;
  const surfaceColor = isDark ? themeColors.neutral[800] : themeColors.neutral[0];
  const onSurfaceColor = isDark ? themeColors.neutral[0] : themeColors.neutral[900];
  const primaryColor = themeColors.primary[500];
  const infoColor = themeColors.info[500];
  const successColor = themeColors.success[500];
  const dangerColor = themeColors.error[500];
  const warningColor = themeColors.warning[500];
  const onPrimaryColor = '#FFFFFF';

  const colorMap: Record<string, string> = {
    primary: primaryColor,
    info: infoColor,
    success: successColor,
    danger: dangerColor,
    warning: warningColor,
  };

  const actions = [
    { id: 'users', title: 'Users' },
    { id: 'analytics', title: 'Analytics' },
    { id: 'security', title: 'Security' },
    { id: 'billing', title: 'Billing' },
    { id: 'verifications', title: 'Verifications' },
    { id: 'chats', title: 'Chats' },
    { id: 'uploads', title: 'Uploads' },
    { id: 'services', title: 'Services' },
    { id: 'config', title: 'Config' },
    { id: 'reports', title: 'Reports' },
    { id: 'infrastructure', title: 'Infrastructure' },
  ];

  const handleClick = (actionId: string) => {
    if (onNavigate) {
      onNavigate(`Admin${actionId.charAt(0).toUpperCase() + actionId.slice(1)}`);
    }
  };

  return (
    <div style={{ marginTop: spacing[6] || '24px' }}>
      <h2
        style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: spacing[4] || '16px',
          color: onSurfaceColor,
        }}
      >
        Quick Actions
      </h2>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing[4] || '16px',
        }}
      >
        {actions.map((action, index) => {
          const actionConfig = actionMap[action.id];
          if (!actionConfig) return null;

          const Icon = actionConfig.icon;
          const actionColor = colorMap[actionConfig.color] || primaryColor;

          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                delay: index * 0.05,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={hrefMap[action.id] || '#'}
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    handleClick(action.id);
                  }
                }}
                style={{
                  width: '23%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: spacing[4] || '16px',
                  borderRadius: '12px',
                  backgroundColor: surfaceColor,
                  textDecoration: 'none',
                  boxShadow: isDark
                    ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: spacing[2] || '8px',
                    backgroundColor: actionColor,
                  }}
                >
                  <Icon
                    className="h-6 w-6"
                    style={{
                      color: onPrimaryColor,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    textAlign: 'center',
                    color: onSurfaceColor,
                  }}
                >
                  {action.title}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

