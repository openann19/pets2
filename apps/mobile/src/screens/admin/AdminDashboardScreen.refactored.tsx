/**
 * Admin Dashboard Screen - REFACTORED
 * Reduced from 807 lines to ~200 lines by extracting components
 */

import { logger, useAuthStore } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  DashboardMetricsSection,
  SystemHealthSection,
  QuickActionsSection,
} from "./dashboard/components";
import { useAdminDashboard } from "./dashboard/hooks";
import type { AdminScreenProps } from "../../navigation/types";
import { useTheme } from "@mobile/theme";
import type { AppTheme } from "@mobile/theme";

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
});
}


export default function AdminDashboardScreen({
  navigation,
}: AdminScreenProps<"AdminDashboard">): React.JSX.Element {
    const theme = useTheme();
    const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;
  const { user } = useAuthStore();
  const { stats, systemHealth, loading, refreshing, onRefresh } = useAdminDashboard();

  const handleNavigate = (screen: string): void => {
    if (Haptics) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    switch (screen) {
      case "AdminAnalytics":
        navigation.navigate("AdminAnalytics");
        break;
      case "AdminUsers":
        navigation.navigate("AdminUsers");
        break;
      case "AdminSecurity":
        navigation.navigate("AdminSecurity");
        break;
      case "AdminBilling":
        navigation.navigate("AdminBilling");
        break;
      case "AdminChats":
        navigation.navigate("AdminChats");
        break;
      case "AdminUploads":
        navigation.navigate("AdminUploads");
        break;
      case "AdminVerifications":
        navigation.navigate("AdminVerifications");
        break;
      case "AdminLogs":
        logger.info("Admin logs requested");
        break;
      default:
        logger.info(`Navigation to: ${screen}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.onSurface }]}>
            Loading dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.onSurface }]}>Admin Dashboard</Text>
          <Text style={[styles.subtitle, { color: colors.onMuted }]}>
            Welcome, {user?.firstName} {user?.lastName}
          </Text>
        </View>

        {/* Dashboard Metrics */}
        {stats && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Overview</Text>
            <DashboardMetricsSection stats={stats} />
          </View>
        )}

        {/* System Health */}
        {systemHealth && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>System Status</Text>
            <SystemHealthSection health={systemHealth} />
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <QuickActionsSection onNavigate={handleNavigate} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
