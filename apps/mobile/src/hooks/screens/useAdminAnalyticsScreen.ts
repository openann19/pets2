/**
 * Admin Analytics Screen Hook
 * Provides comprehensive analytics and reporting for admin dashboard
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { logger } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";
import type { AdminScreenProps } from "../../navigation/types";
import { useErrorHandler } from "../useErrorHandler";

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  change: number; // percentage change from previous period
  trend: "up" | "down" | "stable";
  period: "day" | "week" | "month";
}

interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  userRetention: number;
  premiumUsers: number;
  premiumConversionRate: number;
}

interface PetAnalytics {
  totalPets: number;
  petsCreatedToday: number;
  verifiedPets: number;
  adoptionRate: number;
  popularBreeds: Array<{ breed: string; count: number }>;
}

interface MatchAnalytics {
  totalMatches: number;
  matchesToday: number;
  matchSuccessRate: number;
  averageMessagesPerMatch: number;
  topMatchLocations: Array<{ location: string; count: number }>;
}

interface RevenueAnalytics {
  totalRevenue: number;
  revenueThisMonth: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  churnRate: number;
}

interface SystemAnalytics {
  apiResponseTime: number;
  errorRate: number;
  uptime: number;
  storageUsed: number;
  bandwidthUsed: number;
}

interface AnalyticsData {
  users: UserAnalytics;
  pets: PetAnalytics;
  matches: MatchAnalytics;
  revenue: RevenueAnalytics;
  system: SystemAnalytics;
  keyMetrics: AnalyticsMetric[];
}

interface UseAdminAnalyticsScreenParams {
  navigation: AdminScreenProps<"AdminAnalytics">["navigation"];
}

export interface AdminAnalyticsScreenState {
  // Data
  analytics: AnalyticsData | null;

  // Time Range
  timeRange: "7d" | "30d" | "90d" | "1y";

  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: Date | null;

  // Actions
  onRefresh: () => Promise<void>;
  onTimeRangeChange: (range: typeof timeRange) => void;
  onExportData: (format: "csv" | "pdf") => Promise<void>;
  onBackPress: () => void;
}

/**
 * Hook for admin analytics screen
 * Provides comprehensive analytics dashboard
 */
export function useAdminAnalyticsScreen({
  navigation,
}: UseAdminAnalyticsScreenParams): AdminAnalyticsScreenState {
  const { handleNetworkError, handleOfflineError } = useErrorHandler();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Mock data generation - replace with real API calls
  const generateMockAnalytics = useCallback(
    (range: typeof timeRange): AnalyticsData => {
      const baseMultiplier =
        range === "7d" ? 1 : range === "30d" ? 4 : range === "90d" ? 12 : 52;

      return {
        users: {
          totalUsers: 15420 * baseMultiplier,
          activeUsers: 12890 * baseMultiplier,
          newUsersToday: 45 * baseMultiplier,
          newUsersThisWeek: 234 * baseMultiplier,
          userRetention: 78.5,
          premiumUsers: 2890 * baseMultiplier,
          premiumConversionRate: 18.7,
        },
        pets: {
          totalPets: 8760 * baseMultiplier,
          petsCreatedToday: 23 * baseMultiplier,
          verifiedPets: 7234 * baseMultiplier,
          adoptionRate: 12.3,
          popularBreeds: [
            { breed: "Golden Retriever", count: 450 * baseMultiplier },
            { breed: "Labrador", count: 380 * baseMultiplier },
            { breed: "Persian Cat", count: 290 * baseMultiplier },
            { breed: "German Shepherd", count: 275 * baseMultiplier },
            { breed: "Siamese Cat", count: 240 * baseMultiplier },
          ],
        },
        matches: {
          totalMatches: 45230 * baseMultiplier,
          matchesToday: 156 * baseMultiplier,
          matchSuccessRate: 24.7,
          averageMessagesPerMatch: 8.3,
          topMatchLocations: [
            { location: "New York", count: 1250 * baseMultiplier },
            { location: "Los Angeles", count: 980 * baseMultiplier },
            { location: "Chicago", count: 750 * baseMultiplier },
            { location: "Houston", count: 680 * baseMultiplier },
            { location: "Phoenix", count: 590 * baseMultiplier },
          ],
        },
        revenue: {
          totalRevenue: 89250 * baseMultiplier,
          revenueThisMonth: 12450 * baseMultiplier,
          monthlyRecurringRevenue: 8940 * baseMultiplier,
          averageRevenuePerUser: 5.78,
          churnRate: 3.2,
        },
        system: {
          apiResponseTime: 145,
          errorRate: 0.12,
          uptime: 99.97,
          storageUsed: 2.4, // GB
          bandwidthUsed: 45.7, // GB
        },
        keyMetrics: [
          {
            id: "total_users",
            name: "Total Users",
            value: 15420 * baseMultiplier,
            change: 12.5,
            trend: "up",
            period: "month",
          },
          {
            id: "active_users",
            name: "Active Users",
            value: 12890 * baseMultiplier,
            change: 8.3,
            trend: "up",
            period: "month",
          },
          {
            id: "total_matches",
            name: "Total Matches",
            value: 45230 * baseMultiplier,
            change: 15.7,
            trend: "up",
            period: "month",
          },
          {
            id: "revenue",
            name: "Monthly Revenue",
            value: 12450 * baseMultiplier,
            change: 22.1,
            trend: "up",
            period: "month",
          },
          {
            id: "system_uptime",
            name: "System Uptime",
            value: 99.97,
            change: -0.02,
            trend: "down",
            period: "month",
          },
        ],
      };
    },
    [],
  );

  const loadAnalytics = useCallback(
    async (options?: { force?: boolean }) => {
      try {
        if (!options?.force) {
          setIsLoading(true);
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1200));

        const data = generateMockAnalytics(timeRange);
        setAnalytics(data);
        setLastUpdated(new Date());

        logger.info("Admin analytics loaded", {
          timeRange,
          metricsCount: data.keyMetrics.length,
        });
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to load analytics");
        logger.error("Failed to load admin analytics", {
          error: err,
          timeRange,
        });
        handleNetworkError(err, "admin.analytics.load");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [timeRange, generateMockAnalytics, handleNetworkError],
  );

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadAnalytics({ force: true });
  }, [loadAnalytics]);

  const onTimeRangeChange = useCallback((range: typeof timeRange) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setTimeRange(range);
  }, []);

  const onExportData = useCallback(
    async (format: "csv" | "pdf") => {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
          () => {},
        );

        // Simulate export process
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // In a real app, this would trigger a download or email
        logger.info("Analytics data exported", { format, timeRange });
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("Failed to export data");
        logger.error("Failed to export analytics data", { error: err, format });
        handleNetworkError(err, "admin.analytics.export");
      }
    },
    [timeRange, handleNetworkError],
  );

  // Computed values for charts and visualizations
  const chartData = useMemo(() => {
    if (!analytics) return null;

    return {
      userGrowth: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            data: [
              12000,
              13500,
              14200,
              14800,
              15200,
              analytics.users.totalUsers,
            ],
            color: () => "#3B82F6",
          },
        ],
      },
      revenueTrend: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            data: [
              8500,
              9200,
              10100,
              11200,
              11800,
              analytics.revenue.revenueThisMonth,
            ],
            color: () => "#10B981",
          },
        ],
      },
      matchSuccess: {
        labels: ["Success", "No Match"],
        datasets: [
          {
            data: [
              analytics.matches.totalMatches *
                (analytics.matches.matchSuccessRate / 100),
              analytics.matches.totalMatches *
                (1 - analytics.matches.matchSuccessRate / 100),
            ],
            colors: ["#10B981", "#EF4444"],
          },
        ],
      },
    };
  }, [analytics]);

  return {
    // Data
    analytics,

    // Time Range
    timeRange,

    // UI State
    isLoading,
    isRefreshing,
    lastUpdated,

    // Actions
    onRefresh,
    onTimeRangeChange,
    onExportData,
    onBackPress: () => navigation.goBack(),

    // Computed data (could be exposed if needed)
    // chartData,
  };
}

export default useAdminAnalyticsScreen;
