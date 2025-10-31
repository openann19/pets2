/**
 * Admin Dashboard Page - Web Version
 * Matches mobile design exactly with same animations, colors, and layout
 */
'use client';

import { motion } from 'framer-motion';
import { useAuthStore } from '@pawfectmatch/core';
import { useTheme } from '@/contexts/ThemeContext';
import { useEffect, useState } from 'react';
import { logger } from '@pawfectmatch/core';
import adminApiService from '@/services/adminApi';
import { DashboardMetricsSection, type AdminStats } from './components/DashboardMetricsSection';
import { QuickActionsSection } from './components/QuickActionsSection';
import { SystemHealthSection } from './components/SystemHealthSection';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  uptime: number;
  database: {
    status: string;
    connected: boolean;
    responseTime?: number;
  };
  memory: {
    used: number;
    total: number;
    percentage?: number;
  };
  environment: string;
  services?: Array<{
    name: string;
    status: 'healthy' | 'warning' | 'critical';
    uptime?: string;
    lastCheck: string;
  }>;
}

export default function AdminDashboardPage() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { colors, spacing, isDark } = theme;

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Map theme colors to match mobile semantic colors
  const bgColor = isDark ? colors.neutral[900] : colors.neutral[50];
  const onSurfaceColor = isDark ? colors.neutral[0] : colors.neutral[900];
  const onMutedColor = isDark ? colors.neutral[400] : colors.neutral[600];

  const loadDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [statsResponse, healthResponse] = await Promise.all([
        adminApiService.getStats().catch(() => ({
          users: { total: 0, active: 0, verified: 0, premium: 0, new24h: 0 },
          pets: { total: 0, active: 0, recent24h: 0 },
          matches: { total: 0, active: 0, blocked: 0, recent24h: 0 },
          messages: { total: 0, recent24h: 0, deleted: 0 },
          revenue: { total: 0, monthly: 0, growth: 0 },
        })),
        adminApiService.getSystemHealth().catch(() => ({
          status: 'unknown' as const,
          uptime: 0,
          database: { status: 'unknown', connected: false, responseTime: 0 },
          memory: { used: 0, total: 0, percentage: 0 },
          environment: 'unknown',
          services: [],
        })),
      ]);

      setStats(statsResponse as AdminStats);
      setSystemHealth(healthResponse as SystemHealth);
    } catch (error: unknown) {
      logger.error('Error loading dashboard data:', { error });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadDashboardData();
  };

  if (loading) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: bgColor,
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: spacing[4] || '16px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: `4px solid ${isDark ? colors.neutral[700] : colors.neutral[200]}`,
              borderTopColor: colors.primary[500],
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ color: onSurfaceColor, fontSize: '16px', fontWeight: '500' }}>
            Loading dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: bgColor,
        minHeight: '100vh',
        padding: spacing[4] || '16px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: spacing[6] || '24px',
        }}
      >
        {/* Header - Matches Mobile */}
        <div
          style={{
            paddingVertical: spacing[6] || '24px',
            paddingHorizontal: spacing[2] || '8px',
          }}
        >
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '700',
              marginBottom: spacing[1] || '4px',
              color: onSurfaceColor,
            }}
          >
            Admin Dashboard
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: onMutedColor,
            }}
          >
            Welcome, {user?.firstName || ''} {user?.lastName || ''}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              marginTop: spacing[4] || '16px',
              padding: `${spacing[2] || '8px'} ${spacing[4] || '16px'}`,
              borderRadius: '8px',
              backgroundColor: colors.primary[500],
              color: '#FFFFFF',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              opacity: refreshing ? 0.6 : 1,
            }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </motion.button>
        </div>

        {/* Dashboard Metrics - Matches Mobile */}
        {stats && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              delay: 0.1,
            }}
            style={{ marginBottom: spacing[6] || '24px' }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: spacing[4] || '16px',
                color: onSurfaceColor,
              }}
            >
              Overview
            </h2>
            <DashboardMetricsSection stats={stats} />
          </motion.section>
        )}

        {/* System Health - Matches Mobile */}
        {systemHealth && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              delay: 0.2,
            }}
            style={{ marginBottom: spacing[6] || '24px' }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: spacing[4] || '16px',
                color: onSurfaceColor,
              }}
            >
              System Status
            </h2>
            <SystemHealthSection health={systemHealth} />
          </motion.section>
        )}

        {/* Quick Actions - Matches Mobile */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            delay: 0.3,
          }}
        >
          <QuickActionsSection />
        </motion.section>
      </motion.div>

      {/* Add CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
