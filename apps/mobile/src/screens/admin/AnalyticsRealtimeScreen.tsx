import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { request } from '../../services/api';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';

type Row = { _id: string; count: number };

export default function AnalyticsRealtimeScreen() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- useTheme is properly typed to return AppTheme, throws if Provider missing
  const theme: AppTheme = useTheme();
  const styles = makeStyles(theme);
  const [events, setEvents] = useState<Row[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await request<{ events: Row[]; errors: any[] }>(
        '/api/admin/analytics/realtime',
        { method: 'GET' },
      );
      setEvents(data.events || []);
      setErrors(data.errors || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 15000);
    return () => {
      clearInterval(id);
    };
  }, []);

  return (
      <View
        style={styles.root}
        testID="admin-analytics"
      >
        <Text style={styles.h1}>Realtime Analytics (last hour)</Text>

        <Text style={styles.h2}>Top Events</Text>
      <FlatList
        data={events}
        keyExtractor={(i) => String(i._id)}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchAll}
            tintColor={theme.colors.primary}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.event}>{item._id}</Text>
            <Text style={styles.count}>{item.count}</Text>
          </View>
        )}
      />

      <Text style={styles.h2}>Recent Errors</Text>
      <FlatList
        data={errors}
        keyExtractor={(i, idx) => String(i._id ?? idx)}
        renderItem={({ item }) => (
          <View style={styles.errorRow}>
            <Text style={styles.errorName}>{item.type ?? 'Error'}</Text>
            <Text
              style={styles.errorMsg}
              numberOfLines={2}
            >
              {item.message}
            </Text>
            <Text style={styles.errorTs}>{new Date(item.ts).toLocaleTimeString()}</Text>
          </View>
        )}
      />
    </View>
  );
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    root: {
      flex: 1,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.bg,
    },
    h1: {
      fontSize: theme.typography.h2.size * 0.9,
      fontWeight: theme.typography.h1.weight,
      marginBottom: theme.spacing.md,
      color: theme.colors.onSurface,
    },
    h2: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h1.weight,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      color: theme.colors.onSurface,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    event: {
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
    },
    count: {
      fontVariant: ['tabular-nums'] as any,
      color: theme.colors.onMuted,
    },
    errorRow: {
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    errorName: {
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.danger,
    },
    errorMsg: {
      opacity: 0.8,
      marginTop: theme.spacing.xs / 2,
      color: theme.colors.onMuted,
    },
    errorTs: {
      opacity: 0.6,
      marginTop: theme.spacing.xs / 2,
      fontVariant: ['tabular-nums'] as any,
      color: theme.colors.onMuted,
    },
  });
}
