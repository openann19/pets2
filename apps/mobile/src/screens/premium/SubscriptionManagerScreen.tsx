import { Ionicons } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import type { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { _subscriptionAPI as subscriptionApi } from "../../services/api";

type RootStackParamList = {
  Premium: undefined;
  [key: string]: undefined | object;
};

interface Subscription {
  id: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  plan: {
    id: string;
    name: string;
    interval: "month" | "year";
    amount: number;
    currency: string;
  };
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialEnd?: string;
}

interface UsageStats {
  swipesRemaining: number;
  totalSwipes: number;
  superLikesRemaining: number;
  totalSuperLikes: number;
  boostsRemaining: number;
  totalBoosts: number;
  resetDate: string;
}

/**
 * Temporary helper until the core SDK exposes `createCheckoutSession`.
 * It returns the Stripe Checkout URL needed to update the payment method.
 */
const createCheckoutSession = async <T extends { url: string }>(payload: {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<T> => {
  const response = await fetch(
    `${String(process.env["EXPO_PUBLIC_API_BASE_URL"])}/subscriptions/checkout-session`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to create checkout session");
  }

  return response.json() as Promise<T>;
};

export const SubscriptionManagerScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Fetch current subscription using the core SDK
      const subscriptionData = await (
        subscriptionApi as {
          getCurrentSubscription: () => Promise<Subscription | null>;
        }
      ).getCurrentSubscription();
      setSubscription(subscriptionData);

      // Fetch usage stats
      const usageData = (await fetch(
        `${String(process.env["EXPO_PUBLIC_API_BASE_URL"])}/subscriptions/usage`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      ).then((res) => res.json())) as UsageStats;
      setUsageStats(usageData);
    } catch (err) {
      logger.error("Failed to fetch subscription data:", { error: err });
      setError("Failed to load subscription data. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchSubscriptionData();
  }, []);

  const handleRefresh = (): void => {
    setIsRefreshing(true);
    void fetchSubscriptionData();
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your subscription? You can continue to use premium features until the end of your billing period.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                setIsLoading(true);
                if (subscription?.id !== undefined && subscription.id !== "") {
                  await fetch(
                    `${String(process.env["EXPO_PUBLIC_API_BASE_URL"])}/subscriptions/cancel`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ subscriptionId: subscription.id }),
                    },
                  );
                  Alert.alert(
                    "Subscription Canceled",
                    "Your subscription has been canceled. You can continue using premium features until the end of your current billing period.",
                  );
                  // Refresh data to show updated status
                  void fetchSubscriptionData();
                }
              } catch (err) {
                logger.error("Failed to cancel subscription:", { error: err });
                Alert.alert(
                  "Error",
                  "Failed to cancel your subscription. Please try again later.",
                );
              } finally {
                setIsLoading(false);
              }
            })();
          },
        },
      ],
    );
  };

  const handleReactivateSubscription = async () => {
    try {
      setIsLoading(true);
      if (subscription?.id !== undefined && subscription.id !== "") {
        await fetch(
          `${String(process.env["EXPO_PUBLIC_API_BASE_URL"])}/subscriptions/reactivate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscriptionId: subscription.id }),
          },
        );
        Alert.alert(
          "Subscription Reactivated",
          "Your subscription has been successfully reactivated.",
        );
        // Refresh data to show updated status
        void fetchSubscriptionData();
      }
    } catch (err) {
      logger.error("Failed to reactivate subscription:", { error: err });
      Alert.alert(
        "Error",
        "Failed to reactivate your subscription. Please try again later.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      setIsLoading(true);

      // Create checkout session for updating payment method
      const session = await createCheckoutSession<{ url: string }>({
        priceId:
          subscription?.plan.id !== undefined && subscription.plan.id !== ""
            ? subscription.plan.id
            : "",
        successUrl: "pawfectmatch://subscription/update-success",
        cancelUrl: "pawfectmatch://subscription/update-cancel",
        metadata: {
          action: "update_payment",
          subscriptionId:
            subscription?.id !== undefined ? subscription.id : undefined,
        },
      });

      // Open Stripe checkout in browser
      if (session.url !== "") {
        await Linking.openURL(session.url);
      }
    } catch (err) {
      logger.error("Failed to update payment method:", { error: err });
      Alert.alert(
        "Error",
        "Failed to update payment method. Please try again later.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Format date string
  const formatDate = (dateString?: string): string => {
    if (dateString === undefined || dateString === "") return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get status badge color
  const getStatusColor = (
    status?: Subscription["status"],
  ): { bg: string; text: string } => {
    switch (status) {
      case "active":
        return { bg: "#E0F7E6", text: "#1E8A3D" };
      case "canceled":
        return { bg: "#FFEAEA", text: "#D92D20" };
      case "past_due":
        return { bg: "#FFF6E5", text: "#D97706" };
      case "trialing":
        return { bg: "#E0F1FF", text: "#0F70E6" };
      default:
        return { bg: "#F2F4F7", text: "#667085" };
    }
  };

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading subscription details...</Text>
      </View>
    );
  }

  const statusColors = getStatusColor(subscription?.status);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <LinearGradient
        colors={["#6D28D9", "#7C3AED"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Subscription Details</Text>
      </LinearGradient>

      {error !== null && error !== "" ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={24} color="#D92D20" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => void fetchSubscriptionData()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : subscription === null ? (
        <View style={styles.noSubscriptionContainer}>
          <Ionicons
            name="information-circle-outline"
            size={64}
            color="#6D28D9"
          />
          <Text style={styles.noSubscriptionTitle}>No Active Subscription</Text>
          <Text style={styles.noSubscriptionText}>
            You don&apos;t have an active subscription. Upgrade to Premium to
            unlock exclusive features!
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => {
              navigation.navigate("Premium");
            }}
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Subscription Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Current Plan</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColors.bg },
                ]}
              >
                <Text style={[styles.statusText, { color: statusColors.text }]}>
                  {subscription.status.charAt(0).toUpperCase() +
                    subscription.status.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.planDetails}>
              <Text style={styles.planName}>{subscription.plan.name}</Text>
              <Text style={styles.planPrice}>
                ${subscription.plan.amount / 100} / {subscription.plan.interval}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Current Period</Text>
              <Text style={styles.detailValue}>
                {formatDate(subscription.currentPeriodStart)} to{" "}
                {formatDate(subscription.currentPeriodEnd)}
              </Text>
            </View>

            {subscription.cancelAtPeriodEnd ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Cancellation</Text>
                <Text style={styles.detailValueHighlight}>
                  Ends on {formatDate(subscription.currentPeriodEnd)}
                </Text>
              </View>
            ) : null}

            {subscription.trialEnd !== undefined ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Trial Ends</Text>
                <Text style={styles.detailValueHighlight}>
                  {formatDate(subscription.trialEnd)}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Usage Stats Card */}
          {usageStats !== null ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Usage</Text>

              <View style={styles.usageItem}>
                <Text style={styles.usageLabel}>Swipes</Text>
                <View style={styles.usageBar}>
                  <View
                    style={[
                      styles.usageProgress,
                      {
                        width:
                          `${String(Math.round((usageStats.swipesRemaining / usageStats.totalSwipes) * 100))}%` as `${number}%`,
                        backgroundColor: "#7C3AED",
                      },
                    ]}
                  />
                </View>
                <Text style={styles.usageText}>
                  {usageStats.swipesRemaining} / {usageStats.totalSwipes}{" "}
                  remaining
                </Text>
              </View>

              <View style={styles.usageItem}>
                <Text style={styles.usageLabel}>Super Likes</Text>
                <View style={styles.usageBar}>
                  <View
                    style={[
                      styles.usageProgress,
                      {
                        width:
                          `${String(Math.round((usageStats.superLikesRemaining / usageStats.totalSuperLikes) * 100))}%` as `${number}%`,
                        backgroundColor: "#0EA5E9",
                      },
                    ]}
                  />
                </View>
                <Text style={styles.usageText}>
                  {usageStats.superLikesRemaining} /{" "}
                  {usageStats.totalSuperLikes} remaining
                </Text>
              </View>

              <View style={styles.usageItem}>
                <Text style={styles.usageLabel}>Boosts</Text>
                <View style={styles.usageBar}>
                  <View
                    style={[
                      styles.usageProgress,
                      {
                        width:
                          `${String(Math.round((usageStats.boostsRemaining / usageStats.totalBoosts) * 100))}%` as `${number}%`,
                        backgroundColor: "#F97316",
                      },
                    ]}
                  />
                </View>
                <Text style={styles.usageText}>
                  {usageStats.boostsRemaining} / {usageStats.totalBoosts}{" "}
                  remaining
                </Text>
              </View>

              <Text style={styles.usageResetText}>
                Resets on {formatDate(usageStats.resetDate)}
              </Text>
            </View>
          ) : null}

          {/* Actions Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Manage Subscription</Text>

            {subscription.status === "active" &&
              !subscription.cancelAtPeriodEnd && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    handleCancelSubscription();
                  }}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={24}
                    color="#D92D20"
                  />
                  <Text style={[styles.actionButtonText, { color: "#D92D20" }]}>
                    Cancel Subscription
                  </Text>
                </TouchableOpacity>
              )}

            {subscription.status === "canceled" ||
            subscription.cancelAtPeriodEnd ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.reactivateButton]}
                onPress={() => void handleReactivateSubscription()}
              >
                <Ionicons name="refresh-outline" size={24} color="#FFFFFF" />
                <Text style={[styles.actionButtonText, { color: "#FFFFFF" }]}>
                  Reactivate Subscription
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => void handleUpdatePaymentMethod()}
            >
              <Ionicons name="card-outline" size={24} color="#6D28D9" />
              <Text style={[styles.actionButtonText, { color: "#6D28D9" }]}>
                Update Payment Method
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                navigation.navigate("Premium");
              }}
            >
              <Ionicons name="pricetag-outline" size={24} color="#6D28D9" />
              <Text style={[styles.actionButtonText, { color: "#6D28D9" }]}>
                Change Plan
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6D28D9",
  },
  header: {
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  errorContainer: {
    padding: 24,
    backgroundColor: "#FFEAEA",
    borderRadius: 12,
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#D92D20",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#D92D20",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  noSubscriptionContainer: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  noSubscriptionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  noSubscriptionText: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 24,
  },
  upgradeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#6D28D9",
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  planDetails: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 16,
    color: "#6D28D9",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: "#4B5563",
  },
  detailValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "500",
  },
  detailValueHighlight: {
    fontSize: 16,
    color: "#D97706",
    fontWeight: "500",
  },
  usageItem: {
    marginBottom: 16,
  },
  usageLabel: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 8,
  },
  usageBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  usageProgress: {
    height: "100%",
    borderRadius: 4,
  },
  usageText: {
    fontSize: 14,
    color: "#6B7280",
  },
  usageResetText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    marginBottom: 12,
  },
  reactivateButton: {
    backgroundColor: "#6D28D9",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
});

export default SubscriptionManagerScreen;

/* Removed duplicate getUsageStats definition that referenced an undefined
   `apiClient`; the screen already uses `subscriptionApi.getUsageStats` from
   @pawfectmatch/core. */
