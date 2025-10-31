/**
 * WebSocket Management Panel
 */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UsersIcon, HomeIcon, ServerIcon } from '@heroicons/react/24/outline';
import adminApiService from '@/services/adminApi';
import { logger } from '@pawfectmatch/core';

interface WebSocketStatus {
  active: boolean;
  connections?: number;
  rooms?: number;
  adapter?: string;
}

interface WebSocketStats {
  connections: number;
  rooms: number;
  messagesSent: number;
  messagesReceived: number;
  adapter: string;
  uptime: number;
  topRooms: Array<{ name: string; connections: number }>;
}

export function WebSocketPanel({
  status,
  colors,
  isDark,
  spacing,
}: {
  status: WebSocketStatus;
  colors: any;
  isDark: boolean;
  spacing: any;
}) {
  const [stats, setStats] = useState<WebSocketStats | null>(null);
  const [loading, setLoading] = useState(false);
  const surfaceColor = isDark ? colors.neutral[800] : colors.neutral[0];
  const onSurfaceColor = isDark ? colors.neutral[0] : colors.neutral[900];
  const onMutedColor = isDark ? colors.neutral[400] : colors.neutral[600];

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminApiService.getWebSocketStats();
      setStats(data);
    } catch (error) {
      logger.error('Failed to load WebSocket stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status.active) {
      loadStats();
      const interval = setInterval(loadStats, 5000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [status.active]);

  if (!status.active) {
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
        <p>WebSocket server is not active</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing[4] }}>
        <StatCard
          icon={UsersIcon}
          title="Active Connections"
          value={stats?.connections.toLocaleString() || '0'}
          colors={colors}
          isDark={isDark}
        />
        <StatCard
          icon={HomeIcon}
          title="Active Rooms"
          value={stats?.rooms.toLocaleString() || '0'}
          colors={colors}
          isDark={isDark}
        />
        <StatCard
          icon={ServerIcon}
          title="Adapter"
          value={stats?.adapter || 'memory'}
          colors={colors}
          isDark={isDark}
        />
        <StatCard
          title="Uptime"
          value={stats ? `${Math.floor(stats.uptime / 3600)}h ${Math.floor((stats.uptime % 3600) / 60)}m` : '0h'}
          colors={colors}
          isDark={isDark}
        />
      </div>

      {/* Message Stats */}
      {stats && (
        <div style={{ backgroundColor: surfaceColor, borderRadius: '12px', padding: spacing[4] }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: onSurfaceColor, marginBottom: spacing[4] }}>
            Message Statistics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: spacing[4] }}>
            <div>
              <p style={{ fontSize: '14px', color: onMutedColor, marginBottom: '4px' }}>Messages Sent</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: onSurfaceColor }}>
                {stats.messagesSent.toLocaleString()}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: onMutedColor, marginBottom: '4px' }}>Messages Received</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: onSurfaceColor }}>
                {stats.messagesReceived.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Rooms */}
      {stats && stats.topRooms.length > 0 && (
        <div style={{ backgroundColor: surfaceColor, borderRadius: '12px', padding: spacing[4] }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: onSurfaceColor, marginBottom: spacing[4] }}>
            Top Rooms
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
            {stats.topRooms.map((room, index) => (
              <div
                key={room.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: spacing[2],
                  backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100],
                  borderRadius: '8px',
                }}
              >
                <span style={{ color: onSurfaceColor, fontSize: '14px' }}>{room.name}</span>
                <span style={{ color: onMutedColor, fontSize: '14px', fontWeight: '600' }}>
                  {room.connections} connections
                </span>
              </div>
            ))}
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
  colors,
  isDark,
}: {
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  value: string;
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
      <p style={{ fontSize: '24px', fontWeight: '700', color: onSurfaceColor }}>{value}</p>
    </motion.div>
  );
}

