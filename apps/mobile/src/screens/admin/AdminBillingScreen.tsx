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

// Runtime theme has radius (not radii) and bgAlt/surfaceAlt in colors
type RuntimeTheme = AppTheme & { 
  radius: { xs: number; sm: number; md: number; lg: number; xl: number; '2xl': number; full: number; pill: number; none: number };
  colors: AppTheme['colors'] & { bgAlt?: string; surfaceAlt?: string };
};

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
  const { colors } = theme;
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

  const getStatusIcon = (status: string) => {
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

  const formatCurrency = (amount: number, currency都是 = "USD") =>
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
        style={StyleSheet.flatten([
          styles.subscriptionCard,
          { backgroundColor: colors.surface },
        ])}
      >
        <View style={styles.subscriptionHeader}>
          <View style={styles.subscriptionInfo}>
            <View style={styles.userAvatar}>
              <Text
                style={StyleSheet.flatten([
                  styles.userAvatarText,
                  { color: colors.onSurface},
                ])}
              >
                {item.userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Text>
            </View>
            <View style={styles.subscriptionDetails}>
              <Text
                style={StyleSheet.flatten([
                  styles.userName,
                  { color: colors.onSurface},
                ])}
              >
                {item.userName}
              </Text>
              <Text
                style={StyleSheet.flatten([
                  styles.userEmail,
                  { color: colors.onMuted },
                ])}
              >
                {item.userEmail}
              </Text>
              <View style={styles.subscriptionMeta}>
                <View
                  style={StyleSheet.flatten([
                    styles.planBadge,
                    { backgroundColor: getPlanColor(item.planId) },
                  ])}
                >
                  <Text style={styles.planText}>{item.planName}</Text>
                </View>
                <View
                  style={StyleSheet.flatten([
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) },
                  ])}
                >
                  <Ionicons
                    name={getStatusIcon(item.status) as any}
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
                style={StyleSheet.flatten([
                  styles.actionButton,
                  { backgroundColor: theme.colors.success },
                ])}
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
                style={StyleSheet.flatten([
                  styles.actionButton,
                  { backgroundColor: theme.colors.warning },
                ])}
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
              style={StyleSheet.flatten([
                styles.statText,
                { color: colors.onMuted },
              ])}
            >
              {formatCurrency(item.amount, item.currency)}/{item.interval}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="calendar" size={16} color={theme.colors.info} />
            <Text
              style={StyleSheet.flatten([
                styles.statText,
                { color: colors.onMuted },
              ])}
            >
              Next: {formatDate(item.currentPeriodEnd)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time" size={16} color={theme.colors.border} />
            <Text
              style={StyleSheet.flatten([
                styles.statText,
                { color: colors.onMuted },
              ])}
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
        style={StyleSheet.flatten([
          styles.container,
          { backgroundColor: colors.bg },
        ])}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={StyleSheet.flatten([
              styles.loadingText,
              { color: colors.onSurface},
            ])}
          >
            Loading billing data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={StyleSheet.flatten([
        styles.container,
        { backgroundColor: colors.bg },
      ])}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
           testID="AdminBillingScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text
          style={StyleSheet.flatten([styles.title, { color: colors.onSurface}])}
        >
          Billing Management
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={StyleSheet.flatten([
              styles.refreshButton,
              { backgroundColor: colors.primary },
            ])}
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
            style={StyleSheet.flatten([
              styles.sectionTitle,
              { color: colors.onSurface},
            ])}
          >
            Revenue Overview
          </Text>
          <View style={styles.metricsGrid}>
            <View
              style={StyleSheet.flatten([
                styles.metricCard,
                { backgroundColor: colors.surface },
              ])}
            >
              <View style={styles.metricHeader}>
                <Ionicons name="cash" size={20} color={theme.colors.success} />
                <Text
                  style={StyleSheet.flatten([
                    styles.metricTitle,
                    { color: colors.onSurface},
                  ])}
                >
                  Total Revenue
                </Text>
              </View>
              <Text
                style={StyleSheet.flatten([
                  styles.metricValue,
                  { color: colors.onSurface},
                ])}
              >
                {formatCurrency(metrics.totalRevenue)}
              </Text>
            </View>

            <View
              style={StyleSheet.flatten([
                styles.metricCard,
                { backgroundColor: colors.surface },
              ])}
            >
              <View style={styles.metricHeader}>
                <Ionicons name="trending-up" size={20} color={theme.colors.info} />
                <Text
                  style={StyleSheet.flatten([
                    styles.metricTitle,
                    { color: colors.onSurface},
                  ])}
                >
                  MRR
                </Text>
              </View>
              <Text
                style={StyleSheet.flatten([
                  styles.metricValue,
                  { color: colors.onSurface},
                ])}
              >
                {formatCurrency(metrics.monthlyRecurringRevenue)}
              </Text>
            </View>

            <View
              style={StyleSheet.flatten([
                styles.metricCard,
                { backgroundColor: colors.surface },
              ])}
            >
              <View style={styles.metricHeader}>
                <Ionicons name="people" size={20} color={theme.colors.primary} />
                <Text
                  style={StyleSheet.flatten([
                    styles.metricTitle,
                    { color: colors.onSurface},
                  ])}
                >
                  ARPU
                </Text>
              </View>
              <Text
                style={StyleSheet.flatten([
                  styles.metricValue,
                  { color: colors.onSurface},
                ])}
              >
                {formatCurrency(metrics.averageRevenuePerUser)}
              </Text>
            </View>

            <View
              style={StyleSheet.flatten([
                styles.metricCard,
                { backgroundColor: colors.surface },
              ])}
            >
              <View style={styles.metricHeader}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                <Text
                  style={StyleSheet.flatten([
                    styles.metricTitle,
                    { color: colors.onSurface},
                  ])}
                >
                  Active Subs
                </Text>
              </View>
              <Text
                style={StyleSheet.flatten([
                  styles.metricValue,
                  { color: colors.onSurface},
                ])}
              >
                {metrics.activeSubscriptions}
              </Text>
            </View>
          </View>

          <View style={styles.secondaryMetrics}>
            <View
              style={StyleSheet.flatten([
                styles.secondaryMetricCard,
                { backgroundColor: colors.surface },
              ])}
            >
              <Text
                style={StyleSheet.flatten([
                  styles.secondaryMetricLabel,
                  { color: colors.onMuted },
                ])}
              >
                Conversion Rate
              </Text>
              <Text
                style={StyleSheet.flatten([
                  styles.secondaryMetricValue,
                  { color: colors.onSurface},
                ])}
              >
                {metrics.conversionRate.toFixed(1)}%
              </Text>
            </View>
            <View
              style={StyleSheet.flatten([
                styles.secondaryMetricCard,
                { backgroundColor: colors.surface },
              ])}
            >
              <Text
                style={StyleSheet.flatten([
                  styles.secondaryMetricLabel,
                  { color: colors.onMuted },
                ])}
              >
                Churn Rate
              </Text>
              <Text
                style={StyleSheet.flatten([
                  styles.secondaryMetricValue,
                  { color: theme.colors.danger },
                ])}
              >
                {metrics.churnRate.toFixed(1)}%
              </Text>
            </View>
            <View
              style={StyleSheet.flatten([
                styles.secondaryMetricCard,
                { backgroundColor: colors.surface },
              ])}
            >
              <Text
                style={StyleSheet.flatten([
                  styles.secondaryMetricLabel,
                  { color: colors.onMuted },
                ])}
              >
                Revenue Growth
              </Text>
              <Text
                style={StyleSheet.flatten([
                  styles.secondaryMetricValue,
                  { color: metrics.revenueGrowth > 0 ? theme.colors.success : theme.colors.danger },
                ])}
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
            style={StyleSheet.flatten([
              styles.filterLabel,
              { color: colors.onSurface},
            ])}
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
                style={StyleSheet.flatten([
                  styles.filterButton,
                  selectedStatus === status && styles.filterButtonActive,
                  {
                    backgroundColor:
                      selectedStatus === status ? colors.primary : colors.surface,
                  },
                ])}
                 testID="AdminBillingScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                  setSelectedStatus(status);
                }}
              >
                <Text
                  style={StyleSheet.flatten([
                    styles.filterText,
                    {
                      color:
                        selectedStatus === status ? theme.colors.onSurface : colors.onMuted
                    },
                  ])}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text
            style={StyleSheet.flatten([
              styles.filterLabel,
              { color: colors.onSurface},
            ])}
          >
            Plan:
          </Text>
          <View style={styles.filterButtons}>
            {(["all", "basic", "premium", "ultimate"] as const).map((plan) => (
              <TouchableOpacity
                key={plan}
                style={StyleSheet.flatten([
                  styles.filterButton,
                  selectedPlan === plan && styles.filterButtonActive,
                  {
                    backgroundColor:
                      selectedPlan === plan ? colors.primary : colors.surface,
                  },
                ])}
                 testID="AdminBillingScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                  setSelectedPlan(plan);
                }}
              >
                <Text
                  style={StyleSheet.flatten([
                    styles.filterText,
                    { color: selectedPlan === plan ? theme.colors.onSurface : colors.onMuted},
                  ])}
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
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function makeStyles(theme: AppTheme) {
  const themeRuntime = theme as RuntimeTheme;
  
  return {
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: 16,
      fontWeight: "500" as const,
    },
    header: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
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
      fontSize: 20,
      fontWeight: "bold" as const,
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    headerActions: {
      flexDirection: "row" as const,
      gap: theme.spacing.sm,
    },
    refreshButton: {
      width: 40,
      height: 40,
      borderRadius: themeRuntime.radius.full,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    metricsContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600" as const,
      marginBottom: theme.spacing.md,
    },
      container: {
        flex: 1,
      },
      loadingContainer: {
        flex: 1,
        justifyContent: "center" as const,
        alignItems: "center" as const,
      },
      loadingText: {
        marginTop: theme.spacing.md,
        fontSize: 16,
        fontWeight: "500" as const,
      },
      header: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
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
        fontSize: 20,
        fontWeight: "bold" as const,
        flex: 1,
        marginLeft: theme.spacing.sm,
      },
      headerActions: {
        flexDirection: "row" as const,
        gap: theme.spacing.sm,
      },
      refreshButton: {
        width: 40,
        height: 40,
        borderRadius: themeRuntime.radius.full,
        justifyContent: "center" as const,
        alignItems: "center" as const,
      },
      metricsContainer: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
      },
      sectionTitle: {
        fontSize: 18,
        fontWeight: "600" as const,
        marginBottom: theme.spacing.md,
      },
      metricsGrid: {
        flexDirection: "row" as const,
        flexWrap: "wrap" as const,
        gap: theme.spacing.md,
        marginBottom: theme.spacing.md,
      },
      metricCard: {
        width: (SCREEN_WIDTH - 44) / 2,
        borderRadius: themeRuntime.radius.md,
        padding: theme.spacing.md,
        shadowColor: theme.colors.border,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
      },
      metricHeader: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        margin<｜place▁holder▁no▁24｜>: theme.spacing.sm,
      },
      metricTitle: {
        fontSize: 14,
        fontWeight: "600" as const,
        marginLeft: theme.spacing.sm,
      },
      metricValue: {
        fontSize: 20,
        fontWeight: "bold" as const,
      },
      secondaryMetrics: {
        flexDirection: "row" as const,
        gap: theme.spacing.md,
      },
      secondaryMetricCard: {
        flex: 1,
        borderRadius: themeRuntime.radius.md,
        padding: theme.spacing.md,
        alignItems: "center" as const,
        shadowColor: theme.colors.border,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
      },
      secondaryMetricLabel: {
        fontSize: 12,
        fontWeight: "500" as const,
        marginBottom: 4,
      },
      secondaryMetricValue: {
        fontSize: 16,
        fontWeight: "bold" as const,
      },
      filtersContainer: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        gap: theme.spacing.md,
        backgroundColor: theme.colors.surface,
      },
      filterRow: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        gap: theme.spacing.md,
      },
      filterLabel: {
        fontSize: 14,
        fontWeight: "600" as const,
        minWidth: 60,
      },
      filterButtons: {
        flexDirection: "row" as const,
        flexWrap: "wrap" as const,
        gap: theme.spacing.sm,
      },
      filterButton: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 6,
        borderRadius: themeRuntime.radius.lg,
      },
      filterButtonActive: {
        // Active state handled by backgroundColor
      },
      filterText: {
        fontSize: 12,
        fontWeight: "600" as const,
      },
      listContainer: {
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.md,
      },
      subscriptionCard: {
        borderRadius: themeRuntime.radius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        shadowColor: theme.colors.border,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
      },
      subscriptionHeader: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        justifyContent: "space-between" as const,
        marginBottom: theme.spacing.md,
      },
      subscriptionInfo: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        flex: 1,
      },
      userAvatar: {
        width: 48,
        height: 48,
        borderRadius: themeRuntime.radius.full,
        backgroundColor: theme.colors.border,
        justifyContent: "center" as const,
        alignItems: "center" as const,
        marginRight: theme.spacing.md,
      },
      userAvatarText: {
        fontSize: 16,
        fontWeight: "bold" as const,
      },
      subscriptionDetails: {
        flex: 1,
      },
      userName: {
        fontSize: 16,
        fontWeight: "600" as const,
        marginBottom: 2,
      },
      userEmail: {
        fontSize: 14,
        marginBottom: 4,
      },
      subscriptionMeta: {
        flexDirection: "row" as const,
        gap: theme.spacing.sm,
      },
      planBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: themeRuntime.radius.sm,
      },
      planText: {
        color: theme.colors.onSurface,
        fontSize: 10,
        fontWeight: "600" as const,
      },
      statusBadge: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: themeRuntime.radius.sm,
        gap: 4,
      },
      statusText: {
        color: theme.colors.onSurface,
        fontSize: 10,
        fontWeight: "600" as const,
      },
      subscriptionActions: {
        flexDirection: "row" as const,
        gap: theme.spacing.sm,
      },
      actionButton: {
        width: 32,
        height: 32,
        borderRadius: themeRuntime.radius.full,
        justifyContent: "center" as const,
        alignItems: "center" as const,
      },
      subscriptionStats: {
        flexDirection: "row" as const,
        flexWrap: "wrap" as const,
        gap: theme.spacing.md,
      },
      statItem: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        gap: 4,
      },
      statText: {
        fontSize: 12,
        fontWeight: "500" as const,
      },
    };
  }
}
