/**
 * Redis Cache Management Panel
 */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrashIcon,
  ArrowPathIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import adminApiService from '@/services/adminApi';
import { logger } from '@pawfectmatch/core';

interface RedisStatus {
  connected: boolean;
  ping?: number;
  error?: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  keys: number;
  memory: {
    used: number;
    peak: number;
  };
  operations: {
    sets: number;
    gets: number;
    deletes: number;
  };
}

export function RedisCachePanel({
  status,
  colors,
  isDark,
  spacing,
}: {
  status: RedisStatus;
  colors: any;
  isDark: boolean;
  spacing: any;
}) {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [clearPattern, setClearPattern] = useState('');
  const surfaceColor = isDark ? colors.neutral[800] : colors.neutral[0];
  const onSurfaceColor = isDark ? colors.neutral[0] : colors.neutral[900];
  const onMutedColor = isDark ? colors.neutral[400] : colors.neutral[600];

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminApiService.getRedisStats();
      setStats(data);
    } catch (error) {
      logger.error('Failed to load Redis stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status.connected) {
      loadStats();
      const interval = setInterval(loadStats, 10000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [status.connected]);

  const handleClearCache = async (pattern?: string) => {
    try {
      setLoading(true);
      await adminApiService.clearRedisCache(pattern);
      await loadStats();
      alert('Cache cleared successfully');
    } catch (error) {
      alert('Failed to clear cache');
      logger.error('Failed to clear cache:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <p>Redis is not connected</p>
        <p style={{ fontSize: '14px', marginTop: '8px' }}>{status.error || 'Check Redis configuration'}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing[4] }}>
        <StatCard
          title="Hit Rate"
          value={`${stats?.hitRate.toFixed(1) || 0}%`}
          subtitle={`${stats?.hits || 0} hits / ${stats?.misses || 0} misses`}
          colors={colors}
          isDark={isDark}
        />
        <StatCard
          title="Keys"
          value={stats?.keys.toLocaleString() || '0'}
          subtitle="Cached items"
          colors={colors}
          isDark={isDark}
        />
        <StatCard
          title="Memory"
          value={`${(stats?.memory.used || 0) / 1024 / 1024}MB`}
          subtitle={`Peak: ${(stats?.memory.peak || 0) / 1024 / 1024}MB`}
          colors={colors}
          isDark={isDark}
        />
        <StatCard
          title="Operations"
          value={`${((stats?.operations.sets || 0) + (stats?.operations.gets || 0) + (stats?.operations.deletes || 0)).toLocaleString()}`}
          subtitle={`${stats?.operations.sets || 0} sets, ${stats?.operations.gets || 0} gets`}
          colors={colors}
          isDark={isDark}
        />
      </div>

      {/* Cache Management */}
      <div style={{ backgroundColor: surfaceColor, borderRadius: '12px', padding: spacing[4] }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: onSurfaceColor, marginBottom: spacing[4] }}>
          Cache Management
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
          <div style={{ display: 'flex', gap: spacing[2] }}>
            <input
              type="text"
              placeholder="Pattern (e.g., cache:user:* or leave empty for all)"
              value={clearPattern}
              onChange={(e) => setClearPattern(e.target.value)}
              style={{
                flex: 1,
                padding: `${spacing[2]} ${spacing[3]}`,
                borderRadius: '8px',
                border: `1px solid ${isDark ? colors.neutral[700] : colors.neutral[300]}`,
                backgroundColor: isDark ? colors.neutral[900] : colors.neutral[50],
                color: onSurfaceColor,
                fontSize: '14px',
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClearCache(clearPattern || undefined)}
              disabled={loading}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                borderRadius: '8px',
                backgroundColor: colors.error[500],
                color: '#FFFFFF',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}
            >
              <TrashIcon style={{ width: '20px', height: '20px' }} />
              Clear Cache
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadStats}
            disabled={loading}
            style={{
              padding: `${spacing[2]} ${spacing[4]}`,
              borderRadius: '8px',
              backgroundColor: colors.primary[500],
              color: '#FFFFFF',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[2],
            }}
          >
            <ArrowPathIcon
              style={{
                width: '20px',
                height: '20px',
                animation: loading ? 'spin 1s linear infinite' : 'none',
              }}
            />
            Refresh Stats
          </motion.button>
        </div>
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

function StatCard({
  title,
  value,
  subtitle,
  colors,
  isDark,
}: {
  title: string;
  value: string;
  subtitle: string;
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
      <p style={{ fontSize: '14px', color: onMutedColor, marginBottom: '8px' }}>{title}</p>
      <p style={{ fontSize: '24px', fontWeight: '700', color: onSurfaceColor, marginBottom: '4px' }}>{value}</p>
      <p style={{ fontSize: '12px', color: onMutedColor }}>{subtitle}</p>
    </motion.div>
  );
}

