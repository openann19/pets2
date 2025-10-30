import React from "react";
/**
 * Admin Billing Screen for Mobile
 * Comprehensive billing management and subscription analytics
 */

import { Ionicons } from "@expo/vector-icons";
import { logger, useAuthStore } from "@pawfectmatch/core";
import { useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import type { AdminScreenProps } from "../../navigation/types";
import { _adminAPI as adminAPI } from "../../services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Subscription {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: string;
  planName: string;
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  amount: number;
  currency: string;
  interval: "monthly" | "yearly";
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  createdAt: string;
  updatedAt: string;
}

interface BillingMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  averageRevenuePerUser: number;
  conversionRate: number;
  churnRate: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  trialSubscriptions: number;
  pastDueSubscriptions: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  revenueGrowth: number;
  subscriptionGrowth: number;
}

export default function AdminBillingScreen({
  navigation,
}: AdminScreenProps<"AdminBilling">): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { user: _user } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<
    Subscription[]
  >([]);
  const [metrics, setMetrics] = useState<BillingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "active" | "canceled" | "past_due" | "trialing" | "incomplete"
  >("all");
  const [selectedPlan, setSelectedPlan] = useState<
    "all" | "basic" | "premium" | "ultimate"
  >("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    void loadBillingData();
  }, []);

  useEffect(() => {
    filterSubscriptions();
  }, [subscriptions, selectedStatus, selectedPlan]);

  const loadBillingData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [subscriptionsResponse, metricsResponse] = await Promise.all([
        adminAPI.getSubscriptions({
          page: 1,
          limit: 100,
          sort: "createdAt",
          order: "desc",
        }),
        adminAPI.getBillingMetrics(),
      ]);

      setSubscriptions(subscriptionsResponse.data.subscriptions as Subscription[]);
      setMetrics(metricsResponse.data as BillingMetrics);
    } catch (error: unknown) {
      logger.error("Error loading billing data:", { error });
      Alert.alert("Error", "Failed to load billing data");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadBillingData();
    setRefreshing(false);
  };

  const filterSubscriptions = (): void => {
    let filtered = subscriptions;

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((sub) => sub.status === selectedStatus);
    }

    // Filter by plan
    if (selectedPlan !== "all") {
      filtered = filtered.filter((sub) => sub.planId === selectedPlan);
    }

    setFilteredSubscriptions(filtered);
  };

  const handleCancelSubscription = async (
    subscriptionId: string,
  ): Promise<void> => {
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel this subscription?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(subscriptionId);
              const response =
                await adminAPI.cancelSubscription({ userId: subscriptionId });

              if (response.success) {
                setSubscriptions((prevSubs) =>
                  prevSubs.map((sub) =>
                    sub.id === subscriptionId
                      ? { ...sub, cancelAtPeriodEnd: true }
                      : sub,
                  ),
                );

                Alert.alert("Success", "Subscription canceled successfully");
              }
            } catch (error) {
              logger.error("Error canceling subscription:", { error });
              Alert.alert("Error", "Failed to cancel subscription");
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

  const handleReactivateSubscription = async (subscriptionId: string) => {
    try {
      setActionLoading(subscriptionId);
      const response = await adminAPI.reactivateSubscription({ userId: subscriptionId });

      if (response.success) {
        setSubscriptions((prevSubs) =>
          prevSubs.map((sub) =>
            sub.id === subscriptionId
              ? { ...sub, cancelAtPeriodEnd: false }
              : sub,
          ),
        );

        Alert.alert("Success", "Subscription reactivated successfully");
      }
    } catch (error) {
      logger.error("Error reactivating subscription:", { error });
      Alert.alert("Error", "Failed to reactivate subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return theme.colors.success;
      case "canceled":
        return theme.colors.border;
      case "past_due":
        return theme.colors.warning;
      case "trialing":
        return theme.colors.info;
      case "incomplete":
        return theme.colors.danger;
      default:
        return theme.colors.border;
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case "active":
        return "checkmark-circle";
      case "canceled":
        return "close-circle";
      case "past_due":
        return "warning";
      case "trialing":
        return "time";
      case "incomplete":
        return "alert-circle";
      default:
        return "help-circle";
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "basic":
        return theme.colors.border;
      case "premium":
        return theme.colors.info;
      case "ultimate":
        return theme.colors.primary;
      default:
        return theme.colors.border;
    }
  };

  const formatCurrency = (amount: number, currency: string = "USD") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount / 100); // Assuming amount is in cents
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const renderSubscriptionItem = ({ item }: { item: Subscription }) => {
    const isActionLoading = actionLoading === item.id;

    return (
      <View
        style={[
          styles.subscriptionCard,
          { backgroundColor: theme.colors.surface },
]}
      >
        <View style={styles.subscriptionHeader}>
          <View style={styles.subscriptionInfo}>
            <View style={styles.userAvatar}>
              <Text
                style={[
                  styles.userAvatarText,
                  { color: theme.colors.onSurface },
        ]}
              >
                {item.userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Text>
            </View>
            <View style={styles.subscriptionDetails}>
              <Text
                style={[
                  styles.userName,
                  { color: theme.colors.onSurface },
        ]}
              >
                {item.userName}
              </Text>
              <Text
                style={[
                  styles.userEmail,
                  { color: theme.colors.onMuted },
        ]}
              >
                {item.userEmail}
              </Text>
              <View style={styles.subscriptionMeta}>
                <View
                  style={[
                    styles.planBadge,
                    { backgroundColor: getPlanColor(item.planId) },
          ]}
                >
                  <Text style={styles.planText}>{item.planName}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) },
          ]}
                >
                  <Ionicons
                    name={getStatusIcon(item.status)}
                    size={12}
                    color={theme.colors.onSurface}
                  />
                  <Text style={styles.statusText}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.subscriptionActions}>
            {item.cancelAtPeriodEnd ? (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.colors.success },
        ]}
                 testID="AdminBillingScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => handleReactivateSubscription(item.id)}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.onSurface} />
                ) : (
                  <Ionicons name="play" size={16} color={theme.colors.onSurface} />
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.colors.warning },
        ]}
                 testID="AdminBillingScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => handleCancelSubscription(item.id)}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.onSurface} />
                ) : (
                  <Ionicons name="pause" size={16} color={theme.colors.onSurface} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.subscriptionStats}>
          <View style={styles.statItem}>
            <Ionicons name="cash" size={16} color={theme.colors.success} />
            <Text
              style={[
                styles.statText,
                { color: theme.colors.onMuted },
      ]}
            >
              {formatCurrency(item.amount, item.currency)}/{item.interval}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="calendar" size={16} color={theme.colors.info} />
            <Text
              style={[
                styles.statText,
                { color: theme.colors.onMuted },
      ]}
            >
              Next: {formatDate(item.currentPeriodEnd)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time" size={16} color={theme.colors.border} />
            <Text
              style={[
                styles.statText,
                { color: theme.colors.onMuted },
      ]}
            >
              Created: {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.bg },
]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[
              styles.loadingText,
              { color: theme.colors.onSurface },
    ]}
          >
            Loading billing data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.bg }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
           testID="AdminBillingScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          Billing Management
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.refreshButton,
              { backgroundColor: theme.colors.primary },
    ]}
             testID="AdminBillingScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={onRefresh}
            disabled={refreshing}
          >
            <Ionicons name="refresh" size={20} color={theme.colors.onSurface} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Billing Metrics */}
      {metrics ? (
        <View style={styles.metricsContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.onSurface },
    ]}
          >
            Revenue Overview
          </Text>
          <View style={styles.metricsGrid}>
            <View
              style={[
                styles.metricCard,
                { backgroundColor: theme.colors.surface },
      ]}
            >
              <View style={styles.metricHeader}>
                <Ionicons name="cash" size={20} color={theme.colors.success} />
                <Text
                  style={[
                    styles.metricTitle,
                    { color: theme.colors.onSurface },
          ]}
                >
                  Total Revenue
                </Text>
              </View>
              <Text
                style={[
                  styles.metricValue,
                  { color: theme.colors.onSurface },
        ]}
              >
                {formatCurrency(metrics.totalRevenue)}
              </Text>
            </View>

            <View
              style={[
                styles.metricCard,
                { backgroundColor: theme.colors.surface },
      ]}
            >
              <View style={styles.metricHeader}>
                <Ionicons name="trending-up" size={20} color={theme.colors.info} />
                <Text
                  style={[
                    styles.metricTitle,
                    { color: theme.colors.onSurface },
          ]}
                >
                  MRR
                </Text>
              </View>
              <Text
                style={[
                  styles.metricValue,
                  { color: theme.colors.onSurface },
        ]}
              >
                {formatCurrency(metrics.monthlyRecurringRevenue)}
              </Text>
            </View>

            <View
              style={[
                styles.metricCard,
                { backgroundColor: theme.colors.surface },
      ]}
            >
              <View style={styles.metricHeader}>
                <Ionicons name="people" size={20} color={theme.colors.primary} />
                <Text
                  style={[
                    styles.metricTitle,
                    { color: theme.colors.onSurface },
          ]}
                >
                  ARPU
                </Text>
              </View>
              <Text
                style={[
                  styles.metricValue,
                  { color: theme.colors.onSurface },
        ]}
              >
                {formatCurrency(metrics.averageRevenuePerUser)}
              </Text>
            </View>

            <View
              style={[
                styles.metricCard,
                { backgroundColor: theme.colors.surface },
      ]}
            >
              <View style={styles.metricHeader}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                <Text
                  style={[
                    styles.metricTitle,
                    { color: theme.colors.onSurface },
          ]}
                >
                  Active Subs
                </Text>
              </View>
              <Text
                style={[
                  styles.metricValue,
                  { color: theme.colors.onSurface },
        ]}
              >
                {metrics.activeSubscriptions}
              </Text>
            </View>
          </View>

          <View style={styles.secondaryMetrics}>
            <View
              style={[
                styles.secondaryMetricCard,
                { backgroundColor: theme.colors.surface },
      ]}
            >
              <Text
                style={[
                  styles.secondaryMetricLabel,
                  { color: theme.colors.onMuted },
        ]}
              >
                Conversion Rate
              </Text>
              <Text
                style={[
                  styles.secondaryMetricValue,
                  { color: theme.colors.onSurface },
        ]}
              >
                {metrics.conversionRate.toFixed(1)}%
              </Text>
            </View>
            <View
              style={[
                styles.secondaryMetricCard,
                { backgroundColor: theme.colors.surface },
      ]}
            >
              <Text
                style={[
                  styles.secondaryMetricLabel,
                  { color: theme.colors.onMuted },
        ]}
              >
                Churn Rate
              </Text>
              <Text
                style={[
                  styles.secondaryMetricValue,
                  { color: theme.colors.danger },
        ]}
              >
                {metrics.churnRate.toFixed(1)}%
              </Text>
            </View>
            <View
              style={[
                styles.secondaryMetricCard,
                { backgroundColor: theme.colors.surface },
      ]}
            >
              <Text
                style={[
                  styles.secondaryMetricLabel,
                  { color: theme.colors.onMuted },
        ]}
              >
                Revenue Growth
              </Text>
              <Text
                style={[
                  styles.secondaryMetricValue,
                  { color: metrics.revenueGrowth > 0 ? theme.colors.success : theme.colors.danger },
        ]}
              >
                {metrics.revenueGrowth > 0 ? "+" : ""}
                {metrics.revenueGrowth.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <Text
            style={[
              styles.filterLabel,
              { color: theme.colors.onSurface },
    ]}
          >
            Status:
          </Text>
          <View style={styles.filterButtons}>
            {(
              [
                "all",
                "active",
                "canceled",
                "past_due",
                "trialing",
                "incomplete",
              ] as const
            ).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  selectedStatus === status && styles.filterButtonActive,
                  {
                    backgroundColor:
                      selectedStatus === status ? theme.colors.primary : theme.colors.surface,
                  },
        ]}
                 testID="AdminBillingScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                  setSelectedStatus(status);
                }}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color:
                        selectedStatus === status ? theme.colors.onSurface : theme.colors.onMuted
                    },
          ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text
            style={[
              styles.filterLabel,
              { color: theme.colors.onSurface },
    ]}
          >
            Plan:
          </Text>
          <View style={styles.filterButtons}>
            {(["all", "basic", "premium", "ultimate"] as const).map((plan) => (
              <TouchableOpacity
                key={plan}
                style={[
                  styles.filterButton,
                  selectedPlan === plan && styles.filterButtonActive,
                  {
                    backgroundColor:
                      selectedPlan === plan ? theme.colors.primary : theme.colors.surface,
                  },
        ]}
                 testID="AdminBillingScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                  setSelectedPlan(plan);
                }}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: selectedPlan === plan ? theme.colors.onSurface : theme.colors.onMuted },
          ]}
                >
                  {plan.charAt(0).toUpperCase() + plan.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Subscriptions List */}
      <FlatList
        data={filteredSubscriptions}
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

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.body.weight,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    backButton: {
      padding: theme.spacing.sm,
    },
    title: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    headerActions: {
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    refreshButton: {
      width: theme.spacing['2xl'],
      height: theme.spacing['2xl'],
      borderRadius: theme.radii.full,
      justifyContent: "center",
      alignItems: "center",
    },
    metricsContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: theme.typography.body.size * 1.125,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.md,
    },
    metricsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.spacing.md,
        marginBottom: theme.spacing.md,
      },
      metricCard: {
        width: (SCREEN_WIDTH - theme.spacing.md * 2 - theme.spacing.sm) / 2,
        borderRadius: theme.radii.md,
        padding: theme.spacing.md,
        ...theme.shadows.elevation2,
      },
      metricHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: theme.spacing.sm,
      },
      metricTitle: {
        fontSize: theme.typography.body.size * 0.875,
        fontWeight: theme.typography.h2.weight,
        marginLeft: theme.spacing.sm,
      },
      metricValue: {
        fontSize: theme.typography.h2.size * 0.875,
        fontWeight: theme.typography.h1.weight,
      },
      secondaryMetrics: {
        flexDirection: "row",
        gap: theme.spacing.md,
      },
      secondaryMetricCard: {
        flex: 1,
        borderRadius: theme.radii.md,
        padding: theme.spacing.md,
        alignItems: "center",
        ...theme.shadows.elevation2,
      },
      secondaryMetricLabel: {
        fontSize: theme.typography.body.size * 0.75,
        fontWeight: theme.typography.body.weight,
        marginBottom: theme.spacing.xs,
      },
      secondaryMetricValue: {
        fontSize: theme.typography.body.size,
        fontWeight: theme.typography.h1.weight,
      },
      filtersContainer: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        gap: theme.spacing.md,
        backgroundColor: theme.colors.surface,
      },
      filterRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
      },
      filterLabel: {
        fontSize: theme.typography.body.size * 0.875,
        fontWeight: theme.typography.h2.weight,
        minWidth: theme.spacing['3xl'],
      },
      filterButtons: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.spacing.sm,
      },
      filterButton: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radii.lg,
      },
      filterButtonActive: {
        // Active state handled by backgroundColor
      },
      filterText: {
        fontSize: theme.typography.body.size * 0.75,
        fontWeight: theme.typography.h2.weight,
      },
      listContainer: {
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.md,
      },
    subscriptionCard: {
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      ...theme.shadows.elevation2,
    },
    subscriptionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.md,
    },
    subscriptionInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    userAvatar: {
      width: theme.spacing['3xl'],
      height: theme.spacing['3xl'],
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.border,
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.md,
    },
    userAvatarText: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h1.weight,
    },
    subscriptionDetails: {
      flex: 1,
    },
    userName: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.xs / 2,
    },
    userEmail: {
      fontSize: theme.typography.body.size * 0.875,
      marginBottom: theme.spacing.xs,
    },
    subscriptionMeta: {
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    planBadge: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.radii.sm,
    },
    planText: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.body.size * 0.625,
      fontWeight: theme.typography.h2.weight,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.radii.sm,
      gap: theme.spacing.xs,
    },
    statusText: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.body.size * 0.625,
      fontWeight: theme.typography.h2.weight,
    },
    subscriptionActions: {
      flexDirection: "row",
      gap: theme.spacing.sm,
    },
    actionButton: {
      width: theme.spacing.xl,
      height: theme.spacing.xl,
      borderRadius: theme.radii.full,
      justifyContent: "center",
      alignItems: "center",
    },
    subscriptionStats: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.md,
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    statText: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.body.weight,
    },
  });
}
