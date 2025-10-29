/**
 * Admin Security Hook
 * Extracts business logic for AdminSecurityScreen
 */

import { logger, useAuthStore } from '@pawfectmatch/core';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { _adminAPI as adminAPI } from '../../../../services/api';
import type { SecurityAlert, SecurityMetrics } from '../types';

export const useAdminSecurity = () => {
  const { user } = useAuthStore();
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

  useEffect(() => {
    void loadSecurityData();
  }, []);

  useEffect(() => {
    filterAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts, selectedSeverity, selectedType]);

  const loadSecurityData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [alertsResponse, metricsResponse] = await Promise.all([
        adminAPI.getSecurityAlerts({
          page: 1,
          limit: 100,
          sort: 'timestamp',
          order: 'desc',
        }),
        adminAPI.getSecurityMetrics(),
      ]);

      setAlerts(alertsResponse.data.alerts as SecurityAlert[]);
      setMetrics(metricsResponse.data as SecurityMetrics);
    } catch (error: unknown) {
      logger.error('Error loading security data:', { error });
      Alert.alert('Error', 'Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadSecurityData();
    setRefreshing(false);
  };

  const filterAlerts = (): void => {
    let filtered = alerts;

    // Filter by severity
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter((alert) => alert.severity === selectedSeverity);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter((alert) => alert.type === selectedType);
    }

    setFilteredAlerts(filtered);
  };

  const handleResolveAlert = async (alertId: string): Promise<void> => {
    if (Haptics) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      setActionLoading(alertId);
      const response = await adminAPI.resolveSecurityAlert({
        alertId,
        action: 'resolved',
      });

      if (response.success) {
        setAlerts((prevAlerts) =>
          prevAlerts.map((alert) =>
            alert.id === alertId
              ? {
                  ...alert,
                  resolved: true,
                  ...(user?.email && { resolvedBy: user.email }),
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
  };

  const handleBlockIP = async (alertId: string, ipAddress: string): Promise<void> => {
    Alert.alert('Block IP Address', `Are you sure you want to block IP address ${ipAddress}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Block',
        style: 'destructive',
        onPress: async () => {
          try {
            setActionLoading(alertId);
            const response = await adminAPI.blockIPAddress({
              ipAddress,
              reason: 'Manual block',
            });

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
  };

  return {
    alerts: filteredAlerts,
    metrics,
    loading,
    refreshing,
    selectedSeverity,
    selectedType,
    actionLoading,
    setSelectedSeverity,
    setSelectedType,
    onRefresh,
    handleResolveAlert,
    handleBlockIP,
  };
};
