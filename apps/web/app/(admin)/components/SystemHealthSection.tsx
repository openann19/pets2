/**
 * System Health Section - Web Version
 * Matches mobile design exactly
 */
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  CpuChipIcon,
  XCircleIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  database: {
    status: string;
    connected: boolean;
    responseTime: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  environment: string;
}

interface SystemHealthSectionProps {
  health: SystemHealth;
}

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
};

const formatMemory = (bytes: number): string => {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(2)}GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)}MB`;
};

const getStatusColor = (status: string, colors: any): string => {
  switch (status.toLowerCase()) {
    case 'healthy':
    case 'ok':
    case 'connected':
      return colors.success[500];
    case 'warning':
      return colors.warning[500];
    case 'error':
    case 'disconnected':
      return colors.error[500];
    default:
      return colors.neutral[500];
  }
};

export const SystemHealthSection: React.FC<SystemHealthSectionProps> = ({ health }) => {
  const theme = useTheme();
  const { colors, isDark } = theme;

  const surfaceColor = isDark ? colors.neutral[800] : colors.neutral[0];
  const onSurfaceColor = isDark ? colors.neutral[0] : colors.neutral[900];
  const onMutedColor = isDark ? colors.neutral[400] : colors.neutral[600];
  const statusColor = getStatusColor(health.status, colors);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      style={{
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
          marginBottom: '16px',
        }}
      >
        <HeartIcon
          style={{
            width: '24px',
            height: '24px',
            color: statusColor,
          }}
        />
        <h2
          style={{
            fontSize: '18px',
            fontWeight: '600',
            marginLeft: '8px',
            flex: 1,
            color: onSurfaceColor,
            margin: 0,
          }}
        >
          System Health
        </h2>
        <div
          style={{
            paddingHorizontal: '8px',
            paddingVertical: '4px',
            borderRadius: '8px',
            backgroundColor: statusColor,
          }}
        >
          <span
            style={{
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 'bold',
            }}
          >
            {health.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Uptime */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          <ClockIcon
            style={{
              width: '16px',
              height: '16px',
              color: onMutedColor,
            }}
          />
          <span style={{ fontSize: '14px', minWidth: '80px', color: onMutedColor }}>
            Uptime:
          </span>
          <span style={{ fontSize: '14px', fontWeight: '600', flex: 1, color: onSurfaceColor }}>
            {formatUptime(health.uptime)}
          </span>
        </div>

        {/* Database */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          {health.database.connected ? (
            <CheckCircleIcon
              style={{
                width: '16px',
                height: '16px',
                color: getStatusColor(health.database.status, colors),
              }}
            />
          ) : (
            <XCircleIcon
              style={{
                width: '16px',
                height: '16px',
                color: getStatusColor(health.database.status, colors),
              }}
            />
          )}
          <span style={{ fontSize: '14px', minWidth: '80px', color: onMutedColor }}>
            Database:
          </span>
          <span
            style={{
              fontSize: '14px',
              fontWeight: '600',
              flex: 1,
              color: getStatusColor(health.database.status, colors),
            }}
          >
            {health.database.status}
          </span>
        </div>

        {/* Memory */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          <CpuChipIcon
            style={{
              width: '16px',
              height: '16px',
              color: onMutedColor,
            }}
          />
          <span style={{ fontSize: '14px', minWidth: '80px', color: onMutedColor }}>
            Memory:
          </span>
          <span style={{ fontSize: '14px', fontWeight: '600', flex: 1, color: onSurfaceColor }}>
            {formatMemory(health.memory.used)} / {formatMemory(health.memory.total)}
          </span>
        </div>

        {/* Environment */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
          <Cog6ToothIcon
            style={{
              width: '16px',
              height: '16px',
              color: onMutedColor,
            }}
          />
          <span style={{ fontSize: '14px', minWidth: '80px', color: onMutedColor }}>
            Environment:
          </span>
          <span style={{ fontSize: '14px', fontWeight: '600', flex: 1, color: onSurfaceColor }}>
            {health.environment}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

