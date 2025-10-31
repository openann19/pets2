/**
 * Admin Dashboard Screen - REFACTORED
 * Reduced from 807 lines to ~200 lines by extracting components
 */

import { logger, useAuthStore } from '@pawfectmatch/core';
import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DashboardMetricsSection,
  SystemHealthSection,
  QuickActionsSection,
} from './dashboard/components';
import { useAdminDashboard } from './dashboard/hooks';
import type { AdminScreenProps } from '../../navigation/types';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';

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
      fontSize: theme.typography.body.size,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.md,
    },
  });
}

export default function AdminDashboardScreen({
  navigation,
}: AdminScreenProps<'AdminDashboard'>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { user } = useAuthStore();
  const { stats, systemHealth, loading, refreshing, onRefresh } = useAdminDashboard();

  const handleNavigate = (screen: string): void => {
    if (Haptics) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    switch (screen) {
      case 'AdminAnalytics':
        navigation.navigate('AdminAnalytics');
        break;
      case 'AdminUsers':
        navigation.navigate('AdminUsers');
        break;
      case 'AdminSecurity':
        navigation.navigate('AdminSecurity');
        break;
      case 'AdminBilling':
        navigation.navigate('AdminBilling');
        break;
      case 'AdminChats':
        navigation.navigate('AdminChats');
        break;
      case 'AdminUploads':
        navigation.navigate('AdminUploads');
        break;
      case 'AdminVerifications':
        navigation.navigate('AdminVerifications');
        break;
      case 'AdminLogs':
        logger.info('Admin logs requested');
        break;
      default:
        logger.info(`Navigation to: ${screen}`);
    }
  };

  if (loading) {
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
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>Admin Dashboard</Text>
          <Text style={[styles.subtitle, { color: theme.colors.onMuted }]}>
            Welcome, {user?.firstName} {user?.lastName}
          </Text>
        </View>

        {/* Dashboard Metrics */}
        {stats && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Overview</Text>
            <DashboardMetricsSection stats={stats} />
          </View>
        )}

        {/* System Health */}
        {systemHealth && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>System Status</Text>
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
