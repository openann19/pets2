/**
 * Admin Dashboard Screen for Mobile
 * Professional admin interface with enhanced export functionality
 */

import { Ionicons } from '@expo/vector-icons';
import { logger, useAuthStore } from '@pawfectmatch/core';
import * as Haptics from 'expo-haptics';
import { useMemo, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { AdminScreenProps } from '../../navigation/types';
import { ExportFormatModal } from '../../components/Admin/ExportFormatModal';
import useAdminDashboardScreen from '../../hooks/screens/useAdminDashboardScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AdminStats {
  users: {
    total: number;
    active: number;
    suspended: number;
    banned: number;
    verified: number;
    recent24h: number;
  };
  pets: {
    total: number;
    active: number;
    recent24h: number;
  };
  matches: {
    total: number;
    active: number;
    blocked: number;
    recent24h: number;
  };
  messages: {
    total: number;
    deleted: number;
    recent24h: number;
  };
}

interface SystemHealth {
  status: string;
  uptime: number;
  database: {
    status: string;
    connected: boolean;
  };
  memory: {
    used: number;
    total: number;
    external: number;
  };
  environment: string;
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: theme.spacing.md,
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
    },
    header: {
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xs,
    },
    title: {
      fontSize: theme.typography.h1.size,
      fontWeight: theme.typography.h1.weight,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: theme.typography.sizes.md,
    },
    section: {
      padding: theme.spacing.lg,
      paddingTop: 0,
    },
    sectionTitle: {
      fontSize: theme.typography.sizes.lg,
      fontWeight: theme.typography.weights.semibold,
      marginBottom: theme.spacing.md,
    },
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    quickActionCard: {
      width: (SCREEN_WIDTH - theme.spacing.lg * 2 - theme.spacing.md) / 2,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.lg,
      alignItems: 'center',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    quickActionTitle: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.semibold,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    quickActionSubtitle: {
      fontSize: theme.typography.sizes.sm,
      textAlign: 'center',
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    statCard: {
      width: (SCREEN_WIDTH - theme.spacing.lg * 2 - theme.spacing.md) / 2,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.lg,
      alignItems: 'center',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    statNumber: {
      fontSize: theme.typography.sizes.xl,
      fontWeight: theme.typography.weights.bold,
      marginBottom: theme.spacing.xs,
    },
    statLabel: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.medium,
      marginBottom: theme.spacing.xs,
    },
    statDetail: {
      fontSize: theme.typography.sizes.sm,
    },
    activityList: {
      gap: theme.spacing.sm,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    activityIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: theme.spacing.md,
    },
    activityContent: {
      flex: 1,
    },
    activityTitle: {
      fontSize: theme.typography.sizes.md,
      fontWeight: theme.typography.weights.medium,
      marginBottom: theme.spacing.xs / 2,
    },
    activityTime: {
      fontSize: theme.typography.sizes.sm,
    },
  });

  export default function AdminDashboardScreen({
    navigation,
  }: AdminScreenProps<'AdminDashboard'>): React.JSX.Element {
    const theme = useTheme();
    const styles = useMemo(() => makeStyles(theme), [theme]);
    const { user: _user } = useAuthStore();

    // Use the enhanced admin dashboard hook
    const {
      metrics,
      recentActivity,
      quickActions,
      isLoading,
      isRefreshing,
      onRefresh,
      onQuickAction,
      exportModalVisible,
      setExportModalVisible,
      exportData,
    } = useAdminDashboardScreen();

    const getStatusColor = useCallback(
      (status: string): string => {
        switch (status) {
          case 'healthy':
            return theme.colors.success;
          case 'warning':
            return theme.colors.warning;
          case 'error':
            return theme.colors.danger;
          default:
            return theme.colors.border;
        }
      },
      [theme],
    );

    if (isLoading) {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
            />
            <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
              Loading dashboard...
            </Text>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>Admin Dashboard</Text>
            <Text style={[styles.subtitle, { color: theme.colors.onMuted }]}>
              Welcome back, {_user?.firstName || 'Admin'}
            </Text>
          </View>

          {/* Quick Actions Grid */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Quick Actions
            </Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[
                    styles.quickActionCard,
                    {
                      backgroundColor: theme.colors.surface,
                      shadowColor: theme.colors.border,
                      opacity: action.disabled ? 0.5 : 1,
                    },
                  ]}
                  testID="AdminDashboardScreen-button-2"
                  accessibilityLabel="Interactive element"
                  accessibilityRole="button"
                  onPress={() => {
                    if (Haptics) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    onQuickAction(action.id);
                  }}
                  disabled={action.disabled}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={32}
                    color={
                      action.disabled ? theme.colors.onMuted : action.color || theme.colors.primary
                    }
                  />
                  <Text style={[styles.quickActionTitle, { color: theme.colors.onSurface }]}>
                    {action.title}
                  </Text>
                  <Text style={[styles.quickActionSubtitle, { color: theme.colors.onMuted }]}>
                    {action.subtitle}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stats Overview */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Overview</Text>
            <View style={styles.statsGrid}>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
                ]}
              >
                <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                  {metrics.users.total}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onMuted }]}>Total Users</Text>
                <Text style={[styles.statDetail, { color: theme.colors.success }]}>
                  +{metrics.users.recent24h} today
                </Text>
              </View>

              <View
                style={[
                  styles.statCard,
                  { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
                ]}
              >
                <Text style={[styles.statNumber, { color: theme.colors.info }]}>
                  {metrics.pets.total}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onMuted }]}>Pets</Text>
                <Text style={[styles.statDetail, { color: theme.colors.success }]}>
                  +{metrics.pets.recent24h} today
                </Text>
              </View>

              <View
                style={[
                  styles.statCard,
                  { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
                ]}
              >
                <Text style={[styles.statNumber, { color: theme.colors.warning }]}>
                  {metrics.matches.total}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onMuted }]}>Matches</Text>
                <Text style={[styles.statDetail, { color: theme.colors.success }]}>
                  +{metrics.matches.recent24h} today
                </Text>
              </View>

              <View
                style={[
                  styles.statCard,
                  { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border },
                ]}
              >
                <Text style={[styles.statNumber, { color: theme.colors.danger }]}>
                  {metrics.systemHealth}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.onMuted }]}>
                  System Health
                </Text>
                <Text style={[styles.statDetail, { color: theme.colors.success }]}>
                  All systems operational
                </Text>
              </View>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
              Recent Activity
            </Text>
            <View style={styles.activityList}>
              {recentActivity.slice(0, 5).map((activity, index) => (
                <View
                  key={index}
                  style={[
                    styles.activityItem,
                    {
                      backgroundColor: theme.colors.surface,
                      shadowColor: theme.colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.activityIndicator,
                      { backgroundColor: activity.color || theme.colors.primary },
                    ]}
                  />
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityTitle, { color: theme.colors.onSurface }]}>
                      {activity.title}
                    </Text>
                    <Text style={[styles.activityTime, { color: theme.colors.onMuted }]}>
                      {activity.time}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Export Format Modal */}
        <ExportFormatModal
          visible={exportModalVisible}
          onClose={() => setExportModalVisible(false)}
          onExport={(format, timeRange) => {
            exportData(format, timeRange);
          }}
          isLoading={isRefreshing}
        />
      </SafeAreaView>
    );
  }
}
