/**
 * Admin Leaderboard Management Screen for Mobile
 * Management interface for leaderboard system settings and data
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

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  petName: string;
  score: number;
  avatar?: string;
  badge?: string;
}

interface LeaderboardData {
  category: string;
  timeframe: string;
  entries: LeaderboardEntry[];
  totalParticipants: number;
  lastUpdated: string;
}

interface LeaderboardStats {
  totalScores: number;
  categories: string[];
  timeframes: string[];
  activeUsers: number;
  dailyUpdates: number;
}

export default function AdminLeaderboardScreen({
  navigation,
}: AdminScreenProps<"AdminLeaderboard">): React.JSX.Element {
  const { colors } = useTheme();
  const { user: _user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState("overall");
  const [selectedTimeframe, setSelectedTimeframe] = useState("weekly");
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardData | null>(null);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categories = ["overall", "streak", "matches", "engagement"];
  const timeframes = ["daily", "weekly", "monthly", "allTime"];

  useEffect(() => {
    void loadLeaderboardData();
  }, [selectedCategory, selectedTimeframe]);

  const loadLeaderboardData = async (): Promise<void> => {
    try {
      setLoading(true);

      // Mock data for now - replace with actual API call
      const mockStats: LeaderboardStats = {
        totalScores: 15420,
        categories: categories,
        timeframes: timeframes,
        activeUsers: 1250,
        dailyUpdates: 89,
      };

      const mockLeaderboardData: LeaderboardData = {
        category: selectedCategory,
        timeframe: selectedTimeframe,
        entries: [
          {
            rank: 1,
            userId: "1",
            userName: "Sarah Johnson",
            petName: "Buddy",
            score: 2847,
            badge: "gold",
          },
          {
            rank: 2,
            userId: "2",
            userName: "Mike Chen",
            petName: "Luna",
            score: 2756,
            badge: "silver",
          },
          {
            rank: 3,
            userId: "3",
            userName: "Emma Davis",
            petName: "Max",
            score: 2634,
            badge: "bronze",
          },
          {
            rank: 4,
            userId: "4",
            userName: "Alex Rodriguez",
            petName: "Bella",
            score: 2521,
          },
          {
            rank: 5,
            userId: "5",
            userName: "Lisa Wang",
            petName: "Charlie",
            score: 2489,
          },
          {
            rank: 6,
            userId: "6",
            userName: "David Kim",
            petName: "Daisy",
            score: 2345,
          },
          {
            rank: 7,
            userId: "7",
            userName: "Maria Garcia",
            petName: "Rocky",
            score: 2234,
          },
          {
            rank: 8,
            userId: "8",
            userName: "James Wilson",
            petName: "Molly",
            score: 2156,
          },
          {
            rank: 9,
            userId: "9",
            userName: "Anna Brown",
            petName: "Zeus",
            score: 2089,
          },
          {
            rank: 10,
            userId: "10",
            userName: "Tom Anderson",
            petName: "Luna",
            score: 2034,
          },
        ],
        totalParticipants: 1250,
        lastUpdated: new Date().toISOString(),
      };

      setStats(mockStats);
      setLeaderboardData(mockLeaderboardData);
    } catch (error: unknown) {
      logger.error("Error loading leaderboard data:", { error });
      Alert.alert("Error", "Failed to load leaderboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadLeaderboardData();
    setRefreshing(false);
  };

  const resetLeaderboard = (): void => {
    Alert.alert(
      "Reset Leaderboard",
      `Are you sure you want to reset the ${selectedCategory} ${selectedTimeframe} leaderboard? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              // TODO: Implement API call to reset leaderboard
              Alert.alert("Success", "Leaderboard reset successfully");
              await loadLeaderboardData();
            } catch (error: unknown) {
              logger.error("Error resetting leaderboard:", { error });
              Alert.alert("Error", "Failed to reset leaderboard");
            }
          },
        },
      ],
    );
  };

  const getBadgeColor = (badge?: string): string => {
    switch (badge) {
      case "gold":
        return "#FFD700";
      case "silver":
        return "#C0C0C0";
      case "bronze":
        return "#CD7F32";
      default:
        return colors.textSecondary;
    }
  };

  const getBadgeIcon = (badge?: string): keyof typeof Ionicons.glyphMap => {
    switch (badge) {
      case "gold":
        return "medal";
      case "silver":
        return "medal";
      case "bronze":
        return "medal";
      default:
        return "person";
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading leaderboard data...
          </Text>
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
            Leaderboard Management
          </Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetLeaderboard}
          >
            <Ionicons name="refresh" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        {stats && (
          <View
            style={[styles.statsContainer, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Overview
            </Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {stats.totalScores.toLocaleString()}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Total Scores
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {stats.activeUsers.toLocaleString()}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Active Users
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {stats.dailyUpdates}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Daily Updates
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {stats.categories.length}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Categories
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Filters */}
        <View
          style={[styles.filtersContainer, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Filters
          </Text>

          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>
              Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor:
                        selectedCategory === category
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedCategory(category);
                  }}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      {
                        color:
                          selectedCategory === category ? "#fff" : colors.text,
                      },
                    ]}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>
              Timeframe
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
            >
              {timeframes.map((timeframe) => (
                <TouchableOpacity
                  key={timeframe}
                  style={[
                    styles.filterButton,
                    {
                      backgroundColor:
                        selectedTimeframe === timeframe
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedTimeframe(timeframe);
                  }}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      {
                        color:
                          selectedTimeframe === timeframe
                            ? "#fff"
                            : colors.text,
                      },
                    ]}
                  >
                    {timeframe === "allTime"
                      ? "All Time"
                      : timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Leaderboard */}
        {leaderboardData && (
          <View
            style={[
              styles.leaderboardContainer,
              { backgroundColor: colors.surface },
            ]}
          >
            <View style={styles.leaderboardHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {selectedCategory.charAt(0).toUpperCase() +
                  selectedCategory.slice(1)}{" "}
                Leaderboard
              </Text>
              <Text
                style={[
                  styles.leaderboardSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                {selectedTimeframe === "allTime"
                  ? "All Time"
                  : selectedTimeframe.charAt(0).toUpperCase() +
                    selectedTimeframe.slice(1)}{" "}
                • {leaderboardData.totalParticipants.toLocaleString()}{" "}
                participants
              </Text>
            </View>

            <View style={styles.leaderboardList}>
              {leaderboardData.entries.map((entry) => (
                <View key={entry.userId} style={styles.leaderboardItem}>
                  <View style={styles.rankContainer}>
                    <Text style={[styles.rankText, { color: colors.text }]}>
                      #{entry.rank}
                    </Text>
                  </View>

                  <View style={styles.userInfo}>
                    <View style={styles.avatarContainer}>
                      <Ionicons
                        name={getBadgeIcon(entry.badge)}
                        size={24}
                        color={getBadgeColor(entry.badge)}
                      />
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={[styles.userName, { color: colors.text }]}>
                        {entry.userName}
                      </Text>
                      <Text
                        style={[
                          styles.petName,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Pet: {entry.petName}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.scoreContainer}>
                    <Text style={[styles.scoreText, { color: colors.primary }]}>
                      {entry.score.toLocaleString()}
                    </Text>
                    <Text
                      style={[
                        styles.scoreLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      points
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.leaderboardFooter}>
              <Text
                style={[
                  styles.lastUpdatedText,
                  { color: colors.textSecondary },
                ]}
              >
                Last updated:{" "}
                {new Date(leaderboardData.lastUpdated).toLocaleString()}
              </Text>
            </View>
          </View>
        )}
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
  resetButton: {
    padding: 8,
  },
  statsContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  filtersContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: "row",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  leaderboardContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leaderboardHeader: {
    marginBottom: 20,
  },
  leaderboardSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  leaderboardList: {
    gap: 12,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
  },
  rankText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  petName: {
    fontSize: 14,
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scoreLabel: {
    fontSize: 12,
  },
  leaderboardFooter: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  lastUpdatedText: {
    fontSize: 12,
    textAlign: "center",
  },
});
