/**
 * Admin Analytics Screen for Mobile
 * Comprehensive analytics dashboard with real-time data visualization
 * REFACTORED: Uses hook and extracted components
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AdminScreenProps } from '../../navigation/types';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import {
  EngagementMetricsSection,
  KeyMetricsSection,
  PeriodSelector,
  RevenueMetricsSection,
  SecurityMetricsSection,
  TopPerformersSection,
  ConversionFunnelSection,
  CohortRetentionSection,
} from './analytics/components';
import { useAdminAnalytics } from './analytics/hooks';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: theme.spacing.lg,
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.body.weight,
    },
    header: {
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      padding: theme.spacing.sm,
    },
    title: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      flex: 1,
      textAlign: 'center',
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.lg,
    },
  });
}

export default function AdminAnalyticsScreen({
  navigation,
}: AdminScreenProps<'AdminAnalytics'>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors } = theme;
  const { analytics, loading, refreshing, selectedPeriod, onRefresh, handlePeriodChange } =
    useAdminAnalytics();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
          <Text style={[styles.loadingText, { color: colors.onSurface }]}>
            Loading analytics...
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            style={styles.backButton}
            testID="back-button"
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={colors.onSurface}
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.onSurface }]}>Analytics Dashboard</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
            <PeriodSelector
              selectedPeriod={selectedPeriod}
              onPeriodChange={handlePeriodChange}
            />
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('AnalyticsConfig');
              }}
              style={styles.backButton}
              testID="config-button"
              accessibilityLabel="Analytics configuration"
              accessibilityRole="button"
            >
              <Ionicons
                name="settings-outline"
                size={24}
                color={colors.onSurface}
              />
            </TouchableOpacity>
          </View>
        </View>

        {analytics ? (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Key Metrics</Text>
              <KeyMetricsSection
                analytics={{
                  users: {
                    total: analytics.users.total,
                    growth: analytics.users.growth,
                    trend: analytics.users.trend,
                  },
                  matches: {
                    total: analytics.matches.total,
                    growth: analytics.matches.growth,
                    trend: analytics.matches.trend,
                  },
                  messages: {
                    total: analytics.messages.total,
                    growth: analytics.messages.growth,
                    trend: analytics.messages.trend,
                  },
                  revenue: {
                    totalRevenue: analytics.revenue.totalRevenue,
                    monthlyRecurringRevenue: analytics.revenue.monthlyRecurringRevenue,
                  },
                }}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Engagement</Text>
              <EngagementMetricsSection engagement={analytics.engagement} />
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Revenue Analytics</Text>
              <RevenueMetricsSection
                revenue={{
                  averageRevenuePerUser: analytics.revenue.averageRevenuePerUser,
                  conversionRate: analytics.revenue.conversionRate,
                  churnRate: analytics.revenue.churnRate,
                }}
              />
            </View>

            {analytics.conversionFunnel && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                  Conversion Funnel
                </Text>
                <ConversionFunnelSection funnel={analytics.conversionFunnel} />
              </View>
            )}

            {analytics.retention && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                  Cohort Retention Analysis
                </Text>
                <CohortRetentionSection retention={analytics.retention} />
              </View>
            )}

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Security Overview</Text>
              <SecurityMetricsSection security={analytics.security} />
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Top Performers</Text>
              <TopPerformersSection topPerformers={analytics.topPerformers} />
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
