/**
 * Admin Billing Screen Hook
 * Manages subscription billing, payments, and financial operations
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { logger } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";
import type { AdminScreenProps } from "../../navigation/types";
import { useErrorHandler } from "../useErrorHandler";

interface BillingTransaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: "subscription" | "one_time" | "refund";
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded" | "disputed";
  paymentMethod: "card" | "paypal" | "apple_pay" | "google_pay";
  description: string;
  createdAt: Date;
  processedAt?: Date;
  stripePaymentId?: string;
  failureReason?: string;
}

interface BillingMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  totalTransactions: number;
  successfulPayments: number;
  failedPayments: number;
  refundAmount: number;
  chargebackAmount: number;
  averageTransactionValue: number;
  premiumSubscribers: number;
  churnRate: number;
}

interface SubscriptionData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: "basic" | "premium" | "ultimate";
  status: "active" | "canceled" | "past_due" | "unpaid" | "trialing";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  amount: number;
  currency: string;
  stripeSubscriptionId: string;
}

interface UseAdminBillingScreenParams {
  navigation: AdminScreenProps<"AdminBilling">["navigation"];
}

export interface AdminBillingScreenState {
  // Data
  transactions: BillingTransaction[];
  subscriptions: SubscriptionData[];
  metrics: BillingMetrics;

  // Filters
  transactionStatusFilter: "all" | BillingTransaction["status"];
  transactionTypeFilter: "all" | BillingTransaction["type"];
  subscriptionStatusFilter: "all" | SubscriptionData["status"];
  subscriptionPlanFilter: "all" | SubscriptionData["plan"];
  dateRange: "7d" | "30d" | "90d" | "1y";
  searchQuery: string;

  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  isProcessingAction: boolean;

  // Actions
  onRefresh: () => Promise<void>;
  onTransactionStatusFilterChange: (
    status: typeof transactionStatusFilter,
  ) => void;
  onTransactionTypeFilterChange: (type: typeof transactionTypeFilter) => void;
  onSubscriptionStatusFilterChange: (
    status: typeof subscriptionStatusFilter,
  ) => void;
  onSubscriptionPlanFilterChange: (plan: typeof subscriptionPlanFilter) => void;
  onDateRangeChange: (range: typeof dateRange) => void;
  onSearchChange: (query: string) => void;
  onTransactionSelect: (transaction: BillingTransaction) => void;
  onSubscriptionSelect: (subscription: SubscriptionData) => void;
  onRefundTransaction: (
    transactionId: string,
    amount: number,
    reason: string,
  ) => Promise<void>;
  onCancelSubscription: (subscriptionId: string) => Promise<void>;
  onReactivateSubscription: (subscriptionId: string) => Promise<void>;
  onUpdateSubscriptionPlan: (
    subscriptionId: string,
    newPlan: SubscriptionData["plan"],
  ) => Promise<void>;
  onExportBillingData: (format: "csv" | "pdf") => Promise<void>;
  onBackPress: () => void;
}

/**
 * Hook for admin billing screen
 * Provides comprehensive billing and subscription management
 */
export function useAdminBillingScreen({
  navigation,
}: UseAdminBillingScreenParams): AdminBillingScreenState {
  const { handleNetworkError, handleOfflineError } = useErrorHandler();

  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);

  const [metrics, setMetrics] = useState<BillingMetrics>({
    totalRevenue: 0,
    monthlyRecurringRevenue: 0,
    totalTransactions: 0,
    successfulPayments: 0,
    failedPayments: 0,
    refundAmount: 0,
    chargebackAmount: 0,
    averageTransactionValue: 0,
    premiumSubscribers: 0,
    churnRate: 0,
  });

  const [transactionStatusFilter, setTransactionStatusFilter] = useState<
    "all" | BillingTransaction["status"]
  >("all");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<
    "all" | BillingTransaction["type"]
  >("all");
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState<
    "all" | SubscriptionData["status"]
  >("active");
  const [subscriptionPlanFilter, setSubscriptionPlanFilter] = useState<
    "all" | SubscriptionData["plan"]
  >("all");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Mock data loading - replace with real API calls
  const loadBillingData = useCallback(
    async (options?: { force?: boolean }) => {
      try {
        if (!options?.force) {
          setIsLoading(true);
        }

        // Simulate API calls
        await new Promise((resolve) => setTimeout(resolve, 1200));

        const mockTransactions: BillingTransaction[] = [
          {
            id: "txn1",
            userId: "user1",
            userName: "Alice Johnson",
            userEmail: "alice@example.com",
            type: "subscription",
            amount: 9.99,
            currency: "USD",
            status: "completed",
            paymentMethod: "card",
            description: "Premium Plan - Monthly",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            processedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            stripePaymentId: "pi_1234567890",
          },
          {
            id: "txn2",
            userId: "user2",
            userName: "Bob Smith",
            userEmail: "bob@example.com",
            type: "one_time",
            amount: 4.99,
            currency: "USD",
            status: "failed",
            paymentMethod: "card",
            description: "Super Like Boost",
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
            failureReason: "Card declined",
          },
          {
            id: "txn3",
            userId: "user3",
            userName: "Charlie Brown",
            userEmail: "charlie@example.com",
            type: "refund",
            amount: -9.99,
            currency: "USD",
            status: "completed",
            paymentMethod: "card",
            description: "Subscription refund",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            processedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            stripePaymentId: "rf_0987654321",
          },
        ];

        const mockSubscriptions: SubscriptionData[] = [
          {
            id: "sub1",
            userId: "user1",
            userName: "Alice Johnson",
            userEmail: "alice@example.com",
            plan: "premium",
            status: "active",
            currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: false,
            amount: 9.99,
            currency: "USD",
            stripeSubscriptionId: "sub_1234567890",
          },
          {
            id: "sub2",
            userId: "user4",
            userName: "Diana Wilson",
            userEmail: "diana@example.com",
            plan: "basic",
            status: "canceled",
            currentPeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            currentPeriodEnd: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            cancelAtPeriodEnd: true,
            amount: 4.99,
            currency: "USD",
            stripeSubscriptionId: "sub_0987654321",
          },
        ];

        const mockMetrics: BillingMetrics = {
          totalRevenue: 45230.5,
          monthlyRecurringRevenue: 12890.0,
          totalTransactions: 1247,
          successfulPayments: 1189,
          failedPayments: 23,
          refundAmount: 234.5,
          chargebackAmount: 89.99,
          averageTransactionValue: 36.27,
          premiumSubscribers: 1289,
          churnRate: 3.2,
        };

        setTransactions(mockTransactions);
        setSubscriptions(mockSubscriptions);
        setMetrics(mockMetrics);

        logger.info("Billing data loaded", {
          transactionsCount: mockTransactions.length,
          subscriptionsCount: mockSubscriptions.length,
          metrics: mockMetrics,
        });
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to load billing data");
        logger.error("Failed to load admin billing data", { error: err });
        handleNetworkError(err, "admin.billing.load");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [handleNetworkError],
  );

  useEffect(() => {
    void loadBillingData();
  }, [loadBillingData]);

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return transactions.filter((transaction) => {
      // Status filter
      if (
        transactionStatusFilter !== "all" &&
        transaction.status !== transactionStatusFilter
      )
        return false;

      // Type filter
      if (
        transactionTypeFilter !== "all" &&
        transaction.type !== transactionTypeFilter
      )
        return false;

      // Search filter
      if (query.length > 0) {
        const searchableText = [
          transaction.userName,
          transaction.userEmail,
          transaction.description,
          transaction.stripePaymentId,
        ]
          .join(" ")
          .toLowerCase();
        return searchableText.includes(query);
      }

      return true;
    });
  }, [
    transactions,
    transactionStatusFilter,
    transactionTypeFilter,
    searchQuery,
  ]);

  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return subscriptions.filter((subscription) => {
      // Status filter
      if (
        subscriptionStatusFilter !== "all" &&
        subscription.status !== subscriptionStatusFilter
      )
        return false;

      // Plan filter
      if (
        subscriptionPlanFilter !== "all" &&
        subscription.plan !== subscriptionPlanFilter
      )
        return false;

      // Search filter
      if (query.length > 0) {
        const searchableText = [
          subscription.userName,
          subscription.userEmail,
          subscription.stripeSubscriptionId,
        ]
          .join(" ")
          .toLowerCase();
        return searchableText.includes(query);
      }

      return true;
    });
  }, [
    subscriptions,
    subscriptionStatusFilter,
    subscriptionPlanFilter,
    searchQuery,
  ]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadBillingData({ force: true });
  }, [loadBillingData]);

  const onTransactionStatusFilterChange = useCallback(
    (status: typeof transactionStatusFilter) => {
      setTransactionStatusFilter(status);
    },
    [],
  );

  const onTransactionTypeFilterChange = useCallback(
    (type: typeof transactionTypeFilter) => {
      setTransactionTypeFilter(type);
    },
    [],
  );

  const onSubscriptionStatusFilterChange = useCallback(
    (status: typeof subscriptionStatusFilter) => {
      setSubscriptionStatusFilter(status);
    },
    [],
  );

  const onSubscriptionPlanFilterChange = useCallback(
    (plan: typeof subscriptionPlanFilter) => {
      setSubscriptionPlanFilter(plan);
    },
    [],
  );

  const onDateRangeChange = useCallback((range: typeof dateRange) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setDateRange(range);
  }, []);

  const onSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const onTransactionSelect = useCallback((transaction: BillingTransaction) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Alert.alert(
      "Transaction Details",
      `${transaction.description}\nAmount: $${transaction.amount}\nStatus: ${transaction.status}\nPayment ID: ${transaction.stripePaymentId || "N/A"}`,
      [{ text: "OK" }],
    );
  }, []);

  const onSubscriptionSelect = useCallback((subscription: SubscriptionData) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Alert.alert(
      "Subscription Details",
      `${subscription.userName} - ${subscription.plan.toUpperCase()}\nStatus: ${subscription.status}\nAmount: $${subscription.amount}/month\nEnds: ${subscription.currentPeriodEnd.toLocaleDateString()}`,
      [{ text: "OK" }],
    );
  }, []);

  const onRefundTransaction = useCallback(
    async (transactionId: string, amount: number, reason: string) => {
      setIsProcessingAction(true);
      try {
        const confirmed = await new Promise<boolean>((resolve) => {
          Alert.alert(
            "Process Refund",
            `Refund $${amount} for reason: ${reason}?`,
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => resolve(false),
              },
              {
                text: "Refund",
                style: "destructive",
                onPress: () => resolve(true),
              },
            ],
          );
        });

        if (!confirmed) return;

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        setTransactions((prev) =>
          prev.map((txn) =>
            txn.id === transactionId
              ? { ...txn, status: "refunded" as const }
              : txn,
          ),
        );

        setMetrics((prev) => ({
          ...prev,
          refundAmount: prev.refundAmount + amount,
        }));

        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        ).catch(() => {});
        logger.info("Transaction refunded", { transactionId, amount, reason });
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to process refund");
        logger.error("Failed to refund transaction", {
          error: err,
          transactionId,
        });
        handleNetworkError(err, "admin.billing.refund");
      } finally {
        setIsProcessingAction(false);
      }
    },
    [handleNetworkError],
  );

  const onCancelSubscription = useCallback(
    async (subscriptionId: string) => {
      setIsProcessingAction(true);
      try {
        const confirmed = await new Promise<boolean>((resolve) => {
          Alert.alert(
            "Cancel Subscription",
            "This will cancel the subscription at the end of the current billing period. The user will retain access until then.",
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => resolve(false),
              },
              {
                text: "Confirm",
                style: "destructive",
                onPress: () => resolve(true),
              },
            ],
          );
        });

        if (!confirmed) return;

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 600));

        setSubscriptions((prev) =>
          prev.map((sub) =>
            sub.id === subscriptionId
              ? { ...sub, cancelAtPeriodEnd: true }
              : sub,
          ),
        );

        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        ).catch(() => {});
        logger.info("Subscription cancelled", { subscriptionId });
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to cancel subscription");
        logger.error("Failed to cancel subscription", {
          error: err,
          subscriptionId,
        });
        handleNetworkError(err, "admin.billing.cancel-subscription");
      } finally {
        setIsProcessingAction(false);
      }
    },
    [handleNetworkError],
  );

  const onReactivateSubscription = useCallback(
    async (subscriptionId: string) => {
      setIsProcessingAction(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 600));

        setSubscriptions((prev) =>
          prev.map((sub) =>
            sub.id === subscriptionId
              ? { ...sub, cancelAtPeriodEnd: false, status: "active" as const }
              : sub,
          ),
        );

        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
        logger.info("Subscription reactivated", { subscriptionId });
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to reactivate subscription");
        logger.error("Failed to reactivate subscription", {
          error: err,
          subscriptionId,
        });
        handleNetworkError(err, "admin.billing.reactivate-subscription");
      } finally {
        setIsProcessingAction(false);
      }
    },
    [handleNetworkError],
  );

  const onUpdateSubscriptionPlan = useCallback(
    async (subscriptionId: string, newPlan: SubscriptionData["plan"]) => {
      setIsProcessingAction(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 700));

        setSubscriptions((prev) =>
          prev.map((sub) =>
            sub.id === subscriptionId ? { ...sub, plan: newPlan } : sub,
          ),
        );

        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
        logger.info("Subscription plan updated", { subscriptionId, newPlan });
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to update subscription plan");
        logger.error("Failed to update subscription plan", {
          error: err,
          subscriptionId,
          newPlan,
        });
        handleNetworkError(err, "admin.billing.update-plan");
      } finally {
        setIsProcessingAction(false);
      }
    },
    [handleNetworkError],
  );

  const onExportBillingData = useCallback(
    async (format: "csv" | "pdf") => {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
          () => {},
        );

        // Simulate export process
        await new Promise((resolve) => setTimeout(resolve, 2000));

        Alert.alert(
          "Export Complete",
          `Billing data exported as ${format.toUpperCase()}. Check your downloads folder.`,
        );

        logger.info("Billing data exported", { format, dateRange });
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to export billing data");
        logger.error("Failed to export billing data", { error: err, format });
        handleNetworkError(err, "admin.billing.export");
      }
    },
    [dateRange, handleNetworkError],
  );

  return {
    // Data
    transactions: filteredTransactions,
    subscriptions: filteredSubscriptions,
    metrics,

    // Filters
    transactionStatusFilter,
    transactionTypeFilter,
    subscriptionStatusFilter,
    subscriptionPlanFilter,
    dateRange,
    searchQuery,

    // UI State
    isLoading,
    isRefreshing,
    isProcessingAction,

    // Actions
    onRefresh,
    onTransactionStatusFilterChange,
    onTransactionTypeFilterChange,
    onSubscriptionStatusFilterChange,
    onSubscriptionPlanFilterChange,
    onDateRangeChange,
    onSearchChange,
    onTransactionSelect,
    onSubscriptionSelect,
    onRefundTransaction,
    onCancelSubscription,
    onReactivateSubscription,
    onUpdateSubscriptionPlan,
    onExportBillingData,
    onBackPress: () => navigation.goBack(),
  };
}

export default useAdminBillingScreen;
