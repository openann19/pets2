/**
 * AdminSecurityScreen (Refactored)
 * Uses extracted components and improved structure
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { logger, useAuthStore } from '@pawfectmatch/core';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@mobile/theme';
import type { AdminScreenProps } from '../../navigation/types';
import { _adminAPI as adminAPI } from '../../services/api';
import { SecurityAlertCard, type SecurityAlert } from '../../components/admin/SecurityAlertCard';
import { SecurityMetricsGrid, type SecurityMetrics } from '../../components/admin/SecurityMetricsGrid';
import { SecurityFilters } from '../../components/admin/SecurityFilters';

interface SecurityApiResponse {
  alerts?: SecurityAlert[];
}

interface SecurityMetricsApiResponse {
  totalAlerts?: number;
  criticalAlerts?: number;
  highAlerts?: number;
  mediumAlerts?: number;
  lowAlerts?: number;
  resolvedAlerts?: number;
  pendingAlerts?: number;
  suspiciousLogins?: number;
  blockedIPs?: number;
  reportedContent?: number;
  spamDetected?: number;
  dataBreaches?: number;
  unusualActivity?: number;
}

export default function AdminSecurityScreen({
  navigation,
}: AdminScreenProps<'AdminSecurity'>): React.JSX.Element {
  const theme = useTheme();
  const { user: _user } = useAuthStore();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<SecurityAlert[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<
    'all' | 'critical' | 'high' | 'medium' | 'low'
  >('all');
  const [selectedType, setSelectedType] = useState<
    | 'all'
    | 'suspicious_login'
    | 'blocked_ip'
    | 'reported_content'
    | 'spam_detected'
    | 'data_breach'
    | 'unusual_activity'
  >('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadSecurityData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const alertsResponseRaw = await adminAPI.getSecurityAlerts({
        page: 1,
        limit: 100,
        sort: 'timestamp',
        order: 'desc',
      });
      const metricsResponseRaw = await adminAPI.getSecurityMetrics();

      const alertsResponse: SecurityApiResponse = {
        alerts: (alertsResponseRaw.data?.alerts as SecurityAlert[]) || [],
      };
      const metricsResponse: SecurityMetricsApiResponse = metricsResponseRaw.data || {};

      setAlerts(alertsResponse.alerts || []);
      setMetrics(metricsResponse as SecurityMetrics);
    } catch (error: unknown) {
      logger.error('Error loading security data:', { error });
      Alert.alert('Error', 'Failed to load security data');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await loadSecurityData();
    setRefreshing(false);
  }, [loadSecurityData]);

  const filterAlerts = useCallback((): void => {
    let filtered = alerts;

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter((alert) => alert.severity === selectedSeverity);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((alert) => alert.type === selectedType);
    }

    setFilteredAlerts(filtered);
  }, [alerts, selectedSeverity, selectedType]);

  useEffect(() => {
    void loadSecurityData();
  }, [loadSecurityData]);

  useEffect(() => {
    filterAlerts();
  }, [filterAlerts]);

  const handleResolveAlert = useCallback(async (alertId: string): Promise<void> => {
    if (Haptics) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      setActionLoading(alertId);
      const response = await adminAPI.resolveSecurityAlert({ alertId, action: 'resolved' });

      if (response.success) {
        setAlerts((prevAlerts) =>
          prevAlerts.map((alert) =>
            alert.id === alertId
              ? {
                  ...alert,
                  resolved: true,
                  ...(_user?.email && { resolvedBy: _user.email }),
                  resolvedAt: new Date().toISOString(),
                }
              : alert,
          ),
        );

        Alert.alert('Success', 'Alert resolved successfully');
      }
    } catch (error) {
      logger.error('Error resolving alert:', { error });
      Alert.alert('Error', 'Failed to resolve alert');
    } finally {
      setActionLoading(null);
    }
  }, [_user?.email]);

  const handleBlockIP = useCallback(async (alertId: string, ipAddress: string) => {
    Alert.alert('Block IP Address', `Are you sure you want to block IP address ${ipAddress}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: async () => {
          try {
            setActionLoading(alertId);
            const response = await adminAPI.blockIPAddress({ ipAddress, reason: 'Manual block' });

            if (response.success) {
              Alert.alert('Success', 'IP address blocked successfully');
              await loadSecurityData();
            }
          } catch (error) {
            logger.error('Error blocking IP:', { error });
            Alert.alert('Error', 'Failed to block IP address');
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  }, [loadSecurityData]);

  const getSeverityColor = useCallback(
    (severity: string) => {
      switch (severity) {
        case 'critical':
          return theme.colors.danger;
        case 'high':
          return theme.colors.warning;
        case 'medium':
          return theme.colors.info;
        case 'low':
          return theme.colors.success;
        default:
          return theme.colors.border;
      }
    },
    [theme],
  );

  const getTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'suspicious_login':
        return 'log-in';
      case 'blocked_ip':
        return 'shield';
      case 'reported_content':
        return 'flag';
      case 'spam_detected':
        return 'mail';
      case 'data_breach':
        return 'lock-closed';
      case 'unusual_activity':
        return 'eye';
      default:
        return 'alert';
    }
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const renderAlertItem = useCallback(
    ({ item }: { item: SecurityAlert }) => (
      <SecurityAlertCard
        alert={item}
        isActionLoading={actionLoading === item.id}
        onResolve={handleResolveAlert}
        onBlockIP={handleBlockIP}
        getSeverityColor={getSeverityColor}
        getTypeIcon={getTypeIcon}
        formatDate={formatDate}
      />
    ),
    [actionLoading, handleResolveAlert, handleBlockIP, getSeverityColor, getTypeIcon, formatDate],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.bg,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        loadingText: {
          marginTop: theme.spacing.md,
          fontSize: theme.typography.body.size,
          fontWeight: theme.typography.body.weight,
          color: theme.colors.onSurface,
        },
        header: {
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.xs,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        backButton: {
          padding: theme.spacing.xs,
        },
        title: {
          fontSize: theme.typography.h2.size,
          fontWeight: theme.typography.h1.weight,
          flex: 1,
          textAlign: 'center',
          color: theme.colors.onSurface,
        },
        headerActions: {
          flexDirection: 'row',
          gap: theme.spacing.xs,
        },
        refreshButton: {
          width: 40,
          height: 40,
          borderRadius: theme.radii.full,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.primary,
        },
        listContainer: {
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.xl,
        },
      }),
    [theme],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading security data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Security Dashboard</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={refreshing}
            accessibilityLabel="Refresh security data"
            accessibilityRole="button"
          >
            <Ionicons name="refresh" size={20} color={theme.colors.onSurface} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Security Metrics */}
      {metrics && <SecurityMetricsGrid metrics={metrics} />}

      {/* Filters */}
      <SecurityFilters
        selectedSeverity={selectedSeverity}
        selectedType={selectedType}
        onSeverityChange={setSelectedSeverity}
        onTypeChange={setSelectedType}
      />

      {/* Alerts List */}
      <FlatList
        data={filteredAlerts}
        renderItem={renderAlertItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
