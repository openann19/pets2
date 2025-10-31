/**
 * Admin Billing Screen for Mobile
 * Comprehensive billing management and subscription analytics
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import type { AdminScreenProps } from '../../navigation/types';
import { BillingMetricsSection } from './components/BillingMetricsSection';
import { BillingFiltersSection } from './components/BillingFiltersSection';
import { SubscriptionCard } from './components/SubscriptionCard';
import { useAdminBilling } from './hooks/useAdminBilling';

export default function AdminBillingScreen({
  navigation,
}: AdminScreenProps<'AdminBilling'>): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const {
    subscriptions,
    metrics,
    loading,
    refreshing,
    selectedStatus,
    selectedPlan,
    actionLoading,
    onRefresh,
    handleStatusFilter,
    handlePlanFilter,
    handleCancelSubscription,
    handleReactivateSubscription,
  } = useAdminBilling();

  const renderSubscriptionItem = ({ item }: { item: typeof subscriptions[0] }) => (
    <SubscriptionCard
      subscription={item}
      isActionLoading={actionLoading === item.id}
      onCancel={handleCancelSubscription}
      onReactivate={handleReactivateSubscription}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
          />
          <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
            Loading billing data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          testID="AdminBillingScreen-button-back"
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>Billing Management</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
            testID="AdminBillingScreen-button-refresh"
            accessibilityLabel="Refresh billing data"
            accessibilityRole="button"
            onPress={onRefresh}
            disabled={refreshing}
          >
            <Ionicons
              name="refresh"
              size={20}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Billing Metrics */}
      {metrics ? <BillingMetricsSection metrics={metrics} /> : null}

      {/* Filters */}
      <BillingFiltersSection
        selectedStatus={selectedStatus}
        selectedPlan={selectedPlan}
        onStatusChange={handleStatusFilter}
        onPlanChange={handlePlanFilter}
      />

      {/* Subscriptions List */}
      <FlatList
        data={subscriptions}
        renderItem={renderSubscriptionItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
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
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      padding: theme.spacing.sm,
    },
    title: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      flex: 1,
      marginStart: theme.spacing.sm,
    },
    headerActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    refreshButton: {
      width: theme.spacing['2xl'],
      height: theme.spacing['2xl'],
      borderRadius: theme.radii.full,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.md,
    },
  });
