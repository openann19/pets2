/**
 * MongoDB Analytics Panel
 * Shows real-time MongoDB connection and query performance
 */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChartBarIcon, ClockIcon, CircleStackIcon } from '@heroicons/react/24/outline';
import adminApiService from '@/services/adminApi';
import { logger } from '@pawfectmatch/core';

interface MongoDBStatus {
  connected: boolean;
  responseTime?: number;
  database?: string;
}

interface MongoDBAnalytics {
  connectionPool: {
    active: number;
    idle: number;
    total: number;
  };
  queries: {
    total: number;
    avgTime: number;
    slowQueries: number;
  };
  collections: Array<{
    name: string;
    count: number;
    size: number;
  }>;
  indexes: {
    total: number;
    unused: number;
  };
}

export function MongoDBAnalyticsPanel({
  status,
  colors,
  isDark,
  spacing,
}: {
  status: MongoDBStatus;
  colors: any;
  isDark: boolean;
  spacing: any;
}) {
  const [analytics, setAnalytics] = useState<MongoDBAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const surfaceColor = isDark ? colors.neutral[800] : colors.neutral[0];
  const onSurfaceColor = isDark ? colors.neutral[0] : colors.neutral[900];
  const onMutedColor = isDark ? colors.neutral[400] : colors.neutral[600];

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await adminApiService.getMongoDBAnalytics();
      setAnalytics(data);
    } catch (error) {
      logger.error('Failed to load MongoDB analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status.connected) {
      loadAnalytics();
      const interval = setInterval(loadAnalytics, 15000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [status.connected]);

  if (!status.connected) {
    return (
      <div
        style={{
          backgroundColor: surfaceColor,
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          color: onMutedColor,
        }}
      >
        <p>MongoDB is not connected</p>
        <p style={{ fontSize: '14px', marginTop: '8px' }}>Check database configuration</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
      {/* Connection Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing[4] }}>
        <StatCard
          icon={CircleStackIcon}
          title="Response Time"
          value={`${status.responseTime || 0}ms`}
          colors={colors}
          isDark={isDark}
        />
        <StatCard
          title="Connection Pool"
          value={`${analytics?.connectionPool.active || 0}/${analytics?.connectionPool.total || 0}`}
          subtitle={`${analytics?.connectionPool.idle || 0} idle`}
          colors={colors}
          isDark={isDark}
        />
        <StatCard
          icon={ClockIcon}
          title="Avg Query Time"
          value={`${analytics?.queries.avgTime.toFixed(1) || 0}ms`}
          subtitle={`${analytics?.queries.slowQueries || 0} slow queries`}
          colors={colors}
          isDark={isDark}
        />
        <StatCard
          icon={ChartBarIcon}
          title="Total Queries"
          value={analytics?.queries.total.toLocaleString() || '0'}
          colors={colors}
          isDark={isDark}
        />
      </div>

      {/* Collections */}
      {analytics && analytics.collections.length > 0 && (
        <div style={{ backgroundColor: surfaceColor, borderRadius: '12px', padding: spacing[4] }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: onSurfaceColor, marginBottom: spacing[4] }}>
            Collections
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: spacing[3] }}>
            {analytics.collections.map((collection) => (
              <div
                key={collection.name}
                style={{
                  padding: spacing[3],
                  backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100],
                  borderRadius: '8px',
                }}
              >
                <p style={{ fontSize: '14px', fontWeight: '600', color: onSurfaceColor, marginBottom: spacing[1] }}>
                  {collection.name}
                </p>
                <p style={{ fontSize: '12px', color: onMutedColor }}>
                  {collection.count.toLocaleString()} documents
                </p>
                <p style={{ fontSize: '12px', color: onMutedColor }}>
                  {(collection.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indexes */}
      {analytics && (
        <div style={{ backgroundColor: surfaceColor, borderRadius: '12px', padding: spacing[4] }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: onSurfaceColor, marginBottom: spacing[4] }}>
            Indexes
          </h3>
          <div style={{ display: 'flex', gap: spacing[4] }}>
            <div>
              <p style={{ fontSize: '14px', color: onMutedColor, marginBottom: '4px' }}>Total Indexes</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: onSurfaceColor }}>
                {analytics.indexes.total}
              </p>
            </div>
            {analytics.indexes.unused > 0 && (
              <div>
                <p style={{ fontSize: '14px', color: onMutedColor, marginBottom: '4px' }}>Unused Indexes</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: colors.warning[500] }}>
                  {analytics.indexes.unused}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  colors,
  isDark,
}: {
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  value: string;
  subtitle?: string;
  colors: any;
  isDark: boolean;
}) {
  const surfaceColor = isDark ? colors.neutral[800] : colors.neutral[0];
  const onSurfaceColor = isDark ? colors.neutral[0] : colors.neutral[900];
  const onMutedColor = isDark ? colors.neutral[400] : colors.neutral[600];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        backgroundColor: surfaceColor,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        {Icon && <Icon style={{ width: '24px', height: '24px', color: colors.primary[500] }} />}
        <p style={{ fontSize: '14px', color: onMutedColor }}>{title}</p>
      </div>
      <p style={{ fontSize: '24px', fontWeight: '700', color: onSurfaceColor, marginBottom: subtitle ? '4px' : '0' }}>
        {value}
      </p>
      {subtitle && <p style={{ fontSize: '12px', color: onMutedColor }}>{subtitle}</p>}
    </motion.div>
  );
}

