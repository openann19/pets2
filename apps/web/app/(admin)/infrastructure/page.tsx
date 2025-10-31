/**
 * Infrastructure Management Page
 * Redis, WebSocket, CDN, and MongoDB monitoring
 */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ServerIcon,
  WifiIcon,
  CloudIcon,
  CircleStackIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';
import { RedisCachePanel } from './components/RedisCachePanel';
import { WebSocketPanel } from './components/WebSocketPanel';
import { CDNPanel } from './components/CDNPanel';
import { MongoDBAnalyticsPanel } from './components/MongoDBAnalyticsPanel';
import adminApiService from '@/services/adminApi';
import { logger } from '@pawfectmatch/core';

interface InfrastructureStatus {
  redis: {
    connected: boolean;
    ping?: number;
    error?: string;
  };
  websocket: {
    active: boolean;
    connections?: number;
    rooms?: number;
    adapter?: string;
  };
  cdn: {
    enabled: boolean;
    provider?: string;
    baseUrl?: string;
  };
  mongodb: {
    connected: boolean;
    responseTime?: number;
    database?: string;
  };
}

export default function InfrastructurePage() {
  const theme = useTheme();
  const { colors, spacing, isDark } = theme;
  const [status, setStatus] = useState<InfrastructureStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'redis' | 'websocket' | 'cdn' | 'mongodb'>('overview');

  const bgColor = isDark ? colors.neutral[900] : colors.neutral[50];
  const surfaceColor = isDark ? colors.neutral[800] : colors.neutral[0];
  const onSurfaceColor = isDark ? colors.neutral[0] : colors.neutral[900];
  const onMutedColor = isDark ? colors.neutral[400] : colors.neutral[600];

  const loadInfrastructureStatus = async () => {
    try {
      setLoading(true);
      const response = await adminApiService.getInfrastructureStatus();
      setStatus(response);
    } catch (error) {
      logger.error('Failed to load infrastructure status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInfrastructureStatus();
    const interval = setInterval(loadInfrastructureStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading && !status) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: bgColor, padding: spacing[4] }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '40px',
              height: '40px',
              border: `4px solid ${isDark ? colors.neutral[700] : colors.neutral[200]}`,
              borderTopColor: colors.primary[500],
              borderRadius: '50%',
            }}
          />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: ServerIcon },
    { id: 'redis' as const, label: 'Redis Cache', icon: CircleStackIcon },
    { id: 'websocket' as const, label: 'WebSocket', icon: WifiIcon },
    { id: 'cdn' as const, label: 'CDN', icon: CloudIcon },
    { id: 'mongodb' as const, label: 'MongoDB', icon: CircleStackIcon },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bgColor, padding: spacing[4] }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: spacing[6] }}
        >
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: onSurfaceColor, marginBottom: spacing[2] }}>
            Infrastructure Management
          </h1>
          <p style={{ fontSize: '16px', color: onMutedColor }}>
            Monitor and manage Redis, WebSocket, CDN, and MongoDB services
          </p>
        </motion.div>

        {/* Status Overview Cards */}
        {status && activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: spacing[4], marginBottom: spacing[6] }}
          >
            <StatusCard
              title="Redis"
              status={status.redis.connected ? 'healthy' : 'critical'}
              details={status.redis.connected ? `Ping: ${status.redis.ping || 0}ms` : 'Disconnected'}
              icon={CircleStackIcon}
              colors={colors}
              isDark={isDark}
            />
            <StatusCard
              title="WebSocket"
              status={status.websocket.active ? 'healthy' : 'warning'}
              details={status.websocket.active ? `${status.websocket.connections || 0} connections` : 'Inactive'}
              icon={WifiIcon}
              colors={colors}
              isDark={isDark}
            />
            <StatusCard
              title="CDN"
              status={status.cdn.enabled ? 'healthy' : 'warning'}
              details={status.cdn.enabled ? status.cdn.provider || 'Configured' : 'Disabled'}
              icon={CloudIcon}
              colors={colors}
              isDark={isDark}
            />
            <StatusCard
              title="MongoDB"
              status={status.mongodb.connected ? 'healthy' : 'critical'}
              details={status.mongodb.connected ? `${status.mongodb.responseTime || 0}ms` : 'Disconnected'}
              icon={CircleStackIcon}
              colors={colors}
              isDark={isDark}
            />
          </motion.div>
        )}

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: spacing[2],
            marginBottom: spacing[6],
            borderBottom: `2px solid ${isDark ? colors.neutral[700] : colors.neutral[200]}`,
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: isActive ? colors.primary[500] : onMutedColor,
                  borderBottom: isActive ? `3px solid ${colors.primary[500]}` : '3px solid transparent',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                }}
              >
                <Icon style={{ width: '20px', height: '20px' }} />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'redis' && status && (
            <RedisCachePanel status={status.redis} colors={colors} isDark={isDark} spacing={spacing} />
          )}
          {activeTab === 'websocket' && status && (
            <WebSocketPanel status={status.websocket} colors={colors} isDark={isDark} spacing={spacing} />
          )}
          {activeTab === 'cdn' && status && (
            <CDNPanel config={status.cdn} colors={colors} isDark={isDark} spacing={spacing} />
          )}
          {activeTab === 'mongodb' && status && (
            <MongoDBAnalyticsPanel status={status.mongodb} colors={colors} isDark={isDark} spacing={spacing} />
          )}
        </motion.div>

        {/* Refresh Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={loadInfrastructureStatus}
          disabled={loading}
          style={{
            position: 'fixed',
            bottom: spacing[6],
            right: spacing[6],
            padding: `${spacing[3]} ${spacing[4]}`,
            borderRadius: '50%',
            backgroundColor: colors.primary[500],
            color: '#FFFFFF',
            border: 'none',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <ArrowPathIcon
            style={{
              width: '24px',
              height: '24px',
              animation: loading ? 'spin 1s linear infinite' : 'none',
            }}
          />
        </motion.button>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function StatusCard({
  title,
  status,
  details,
  icon: Icon,
  colors,
  isDark,
}: {
  title: string;
  status: 'healthy' | 'warning' | 'critical';
  details: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  colors: any;
  isDark: boolean;
}) {
  const surfaceColor = isDark ? colors.neutral[800] : colors.neutral[0];
  const onSurfaceColor = isDark ? colors.neutral[0] : colors.neutral[900];
  const onMutedColor = isDark ? colors.neutral[400] : colors.neutral[600];

  const statusColor =
    status === 'healthy'
      ? colors.success[500]
      : status === 'warning'
      ? colors.warning[500]
      : colors.error[500];

  const StatusIcon =
    status === 'healthy' ? CheckCircleIcon : status === 'warning' ? ExclamationTriangleIcon : XCircleIcon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        backgroundColor: surfaceColor,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Icon style={{ width: '24px', height: '24px', color: statusColor }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: onSurfaceColor }}>{title}</h3>
        </div>
        <StatusIcon style={{ width: '20px', height: '20px', color: statusColor }} />
      </div>
      <p style={{ fontSize: '14px', color: onMutedColor }}>{details}</p>
      <div
        style={{
          width: '100%',
          height: '4px',
          backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200],
          borderRadius: '2px',
          marginTop: '12px',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.5 }}
          style={{ height: '100%', backgroundColor: statusColor }}
        />
      </div>
    </motion.div>
  );
}

