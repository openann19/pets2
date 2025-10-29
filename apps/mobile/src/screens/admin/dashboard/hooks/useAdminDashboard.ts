/**
 * Admin Dashboard Hook
 * Manages business logic for admin dashboard
 */

import { logger } from "@pawfectmatch/core";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { _adminAPI as adminAPI } from "../../../../services/api";
import type { AdminStats, SystemHealth } from "../types";

export const useAdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const loadDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [statsResponse, healthResponse] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getSystemHealth(),
      ]);

      setStats(statsResponse.data as AdminStats);
      setSystemHealth(healthResponse.data as SystemHealth);
    } catch (error: unknown) {
      logger.error("Error loading dashboard data:", { error });
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  return {
    stats,
    systemHealth,
    loading,
    refreshing,
    onRefresh,
  };
};

