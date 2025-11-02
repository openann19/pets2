/**
 * Admin Enhanced Features Screen for Mobile
 * Management interface for biometric auth, leaderboard, and smart notifications
 */

import { Ionicons } from "@expo/vector-icons";
import { logger, useAuthStore } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import type { AdminScreenProps } from "../../navigation/types";
import { _adminAPI as adminAPI } from "../../services/adminAPI";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface EnhancedFeaturesStats {
  biometric: {
    adoptionRate: number;
    biometricUsers: number;
    totalUsers: number;
  };
  leaderboard: {
    totalScores: number;
    categories: string[];
    timeframes: string[];
  };
  notifications: {
    adoptionRate: number;
    enabledUsers: number;
    quietHoursUsers: number;
  };
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  onPress,
}: StatCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: colors.surface }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#fff" />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

export default function AdminEnhancedFeaturesScreen({
  navigation,
}: AdminScreenProps<"AdminEnhancedFeatures">): React.JSX.Element {
  const { colors } = useTheme();
  const { user: _user } = useAuthStore();
  const [stats, setStats] = useState<EnhancedFeaturesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void loadEnhancedFeaturesData();
  }, []);

  const loadEnhancedFeaturesData = async (): Promise<void> => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockStats: EnhancedFeaturesStats = {
        biometric: {
          adoptionRate: 45,
          biometricUsers: 1250,
          totalUsers: 2800,
        },
        leaderboard: {
          totalScores: 15420,
          categories: ["overall", "streak", "matches", "engagement"],
          timeframes: ["daily", "weekly", "monthly", "allTime"],
        },
        notifications: {
          adoptionRate: 78,
          enabledUsers: 2184,
          quietHoursUsers: 1456,
        },
      };

      setStats(mockStats);
    } catch (error: unknown) {
      logger.error("Error loading enhanced features data:", { error });
      Alert.alert("Error", "Failed to load enhanced features data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadEnhancedFeaturesData();
    setRefreshing(false);
  };

  const navigateToBiometric = (): void => {
    navigation.navigate("AdminBiometric");
  };

  const navigateToLeaderboard = (): void => {
    navigation.navigate("AdminLeaderboard");
  };

  const navigateToNotifications = (): void => {
    navigation.navigate("AdminNotifications");
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading enhanced features...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Failed to load enhanced features data
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={loadEnhancedFeaturesData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Enhanced Features 2025
          </Text>
          <View style={styles.placeholder} />
        </View>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Manage biometric authentication, leaderboard, and smart notifications
        </Text>

        {/* Overview Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Biometric Authentication"
            value={`${stats.biometric.adoptionRate}%`}
            subtitle={`${stats.biometric.biometricUsers} of ${stats.biometric.totalUsers} users`}
            icon="finger-print"
            color="#3B82F6"
            onPress={navigateToBiometric}
          />

          <StatCard
            title="Leaderboard System"
            value={stats.leaderboard.totalScores.toLocaleString()}
            subtitle={`${stats.leaderboard.categories.length} categories, ${stats.leaderboard.timeframes.length} timeframes`}
            icon="trophy"
            color="#F59E0B"
            onPress={navigateToLeaderboard}
          />

          <StatCard
            title="Smart Notifications"
            value={`${stats.notifications.adoptionRate}%`}
            subtitle={`${stats.notifications.enabledUsers} enabled, ${stats.notifications.quietHoursUsers} quiet hours`}
            icon="notifications"
            color="#10B981"
            onPress={navigateToNotifications}
          />
        </View>

        {/* Quick Actions */}
        <View
          style={[
            styles.quickActionsContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
          </Text>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[
                styles.quickActionButton,
                { backgroundColor: colors.primary + "20" },
              ]}
              onPress={navigateToBiometric}
            >
              <Ionicons name="finger-print" size={24} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.primary }]}>
                Manage Biometric Auth
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionButton,
                { backgroundColor: "#F59E0B20" },
              ]}
              onPress={navigateToLeaderboard}
            >
              <Ionicons name="trophy" size={24} color="#F59E0B" />
              <Text style={[styles.quickActionText, { color: "#F59E0B" }]}>
                Manage Leaderboard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionButton,
                { backgroundColor: "#10B98120" },
              ]}
              onPress={navigateToNotifications}
            >
              <Ionicons name="notifications" size={24} color="#10B981" />
              <Text style={[styles.quickActionText, { color: "#10B981" }]}>
                Manage Notifications
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View
          style={[
            styles.activityContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Activity
          </Text>

          <View style={styles.activityItem}>
            <View
              style={[styles.activityIcon, { backgroundColor: "#3B82F620" }]}
            >
              <Ionicons name="finger-print" size={16} color="#3B82F6" />
            </View>
            <View style={styles.activityContent}>
              <Text style={[styles.activityTitle, { color: colors.text }]}>
                Biometric authentication enabled
              </Text>
              <Text
                style={[
                  styles.activitySubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                15 new users in the last hour
              </Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View
              style={[styles.activityIcon, { backgroundColor: "#F59E0B20" }]}
            >
              <Ionicons name="trophy" size={16} color="#F59E0B" />
            </View>
            <View style={styles.activityContent}>
              <Text style={[styles.activityTitle, { color: colors.text }]}>
                Leaderboard updated
              </Text>
              <Text
                style={[
                  styles.activitySubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Weekly rankings refreshed
              </Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View
              style={[styles.activityIcon, { backgroundColor: "#10B98120" }]}
            >
              <Ionicons name="notifications" size={16} color="#10B981" />
            </View>
            <View style={styles.activityContent}>
              <Text style={[styles.activityTitle, { color: colors.text }]}>
                Smart notifications configured
              </Text>
              <Text
                style={[
                  styles.activitySubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                8 users updated preferences
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  statsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 14,
  },
  quickActionsContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  quickActionsGrid: {
    gap: 12,
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  activityContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
  },
});
