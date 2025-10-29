/**
 * Leaderboard Screen
 * Comprehensive leaderboard display matching web functionality
 */

import { Ionicons } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState, useRef } from "react";
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
import type {
  LeaderboardCategory,
  LeaderboardEntry,
  LeaderboardFilter,
} from "../../services/LeaderboardService";
import LeaderboardService from "../../services/LeaderboardService";
import { useTheme } from "@/theme";
import { useScrollOffsetTracker } from "../../hooks/navigation/useScrollOffsetTracker";
import { useTabReselectRefresh } from "../../hooks/navigation/useTabReselectRefresh";

const { width: _screenWidth } = Dimensions.get("window");

export default function LeaderboardScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const { onScroll, getOffset } = useScrollOffsetTracker();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [categories, setCategories] = useState<LeaderboardCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<
    "daily" | "weekly" | "monthly" | "all_time"
  >("weekly");
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Define refreshData after the functions it uses are defined
  const loadLeaderboard = async (pageNum = 1) => {
    try {
      const filter: LeaderboardFilter =
        selectedCategory === "all"
          ? { period: selectedPeriod }
          : { category: selectedCategory, period: selectedPeriod };

      const response = await LeaderboardService.getLeaderboard(
        filter,
        pageNum,
        20,
      );

      if (pageNum === 1) {
        setEntries(response.entries);
      } else {
        setEntries((prev) => [...prev, ...response.entries]);
      }

      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (error) {
      logger.error("Failed to load leaderboard:", { error });
      Alert.alert("Error", "Failed to load leaderboard");
    }
  };

  const loadUserRank = async () => {
    try {
      const userRankData = await LeaderboardService.getUserRank(
        selectedCategory === "all" ? undefined : selectedCategory,
      );
      setUserRank(userRankData.rank);
      setUserEntry(userRankData.entry);
    } catch (error) {
      logger.error("Failed to load user rank:", { error });
    }
  };

  const refreshData = useCallback(async () => {
    if (loading || refreshing) return;
    setRefreshing(true);
    try {
      await Promise.all([loadLeaderboard(1), loadUserRank()]);
    } catch (error) {
      logger.error("Failed to refresh data:", { error });
    } finally {
      setRefreshing(false);
    }
  }, [loading, refreshing, selectedCategory, selectedPeriod]);

  useTabReselectRefresh({
    listRef: scrollRef,
    onRefresh: refreshData,
    getOffset,
    topThreshold: 80,
    cooldownMs: 700,
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Reload when category or period changes
  useEffect(() => {
    if (categories.length > 0) {
      loadLeaderboard();
      loadUserRank();
    }
  }, [selectedCategory, selectedPeriod]);

  // Focus effect to refresh data
  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        refreshData();
      }
    }, [loading]),
  );

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadCategories(), loadLeaderboard(), loadUserRank()]);
    } catch (error) {
      logger.error("Failed to load initial data:", { error });
      Alert.alert("Error", "Failed to load leaderboard data");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await LeaderboardService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      logger.error("Failed to load categories:", { error });
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;

    try {
      await loadLeaderboard(page + 1);
    } catch (error) {
      logger.error("Failed to load more entries:", { error });
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
    setHasMore(true);
  };

  const handlePeriodChange = (
    period: "daily" | "weekly" | "monthly" | "all_time",
  ) => {
    setSelectedPeriod(period);
    setPage(1);
    setHasMore(true);
  };

  const renderCategoryTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryTabs}
      contentContainerStyle={styles.categoryTabsContent}
    >
      <TouchableOpacity
        style={StyleSheet.flatten([
          styles.categoryTab,
          selectedCategory === "all" && styles.categoryTabActive,
        ])}
         testID="LeaderboardScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
          handleCategoryChange("all");
        }}
      >
        <Text
          style={StyleSheet.flatten([
            styles.categoryTabText,
            selectedCategory === "all" && styles.categoryTabTextActive,
          ])}
        >
          All
        </Text>
      </TouchableOpacity>

      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={StyleSheet.flatten([
            styles.categoryTab,
            selectedCategory === category.id && styles.categoryTabActive,
          ])}
           testID="LeaderboardScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
            handleCategoryChange(category.id);
          }}
        >
          <Ionicons
            name={category.icon as never}
            size={16}
            color={selectedCategory === category.id ? theme.colors.onSurface : "#666"}
            style={styles.categoryTabIcon}
          />
          <Text
            style={StyleSheet.flatten([
              styles.categoryTabText,
              selectedCategory === category.id && styles.categoryTabTextActive,
            ])}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderPeriodTabs = () => (
    <View style={styles.periodTabs}>
      {(["daily", "weekly", "monthly", "all_time"] as const).map((period) => (
        <TouchableOpacity
          key={period}
          style={StyleSheet.flatten([
            styles.periodTab,
            selectedPeriod === period && styles.periodTabActive,
          ])}
           testID="LeaderboardScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
            handlePeriodChange(period);
          }}
        >
          <Text
            style={StyleSheet.flatten([
              styles.periodTabText,
              selectedPeriod === period && styles.periodTabTextActive,
            ])}
          >
            {period.replace("_", " ").toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderUserRankCard = () => {
    if (!userEntry) return null;

    return (
      <View style={styles.userRankCard}>
        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.userRankGradient}
        >
          <View style={styles.userRankContent}>
            <View style={styles.userRankInfo}>
              <Text style={styles.userRankTitle}>Your Rank</Text>
              <Text style={styles.userRankNumber}>#{userRank}</Text>
              <Text style={styles.userRankScore}>{userEntry.score} points</Text>
            </View>

            <View style={styles.userRankPet}>
              <View style={styles.userRankPetImage}>
                <Ionicons name="paw" size={24} color={theme.colors.onSurface} />
              </View>
              <Text style={styles.userRankPetName}>{userEntry.petName}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderLeaderboardEntry = (entry: LeaderboardEntry, index: number) => {
    const isTopThree = index < 3;
    const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"]; // Gold, Silver, Bronze

    return (
      <View key={entry.id} style={styles.entryCard}>
        <View style={styles.entryRank}>
          {isTopThree ? (
            <View
              style={StyleSheet.flatten([
                styles.rankBadge,
                { backgroundColor: rankColors[index] },
              ])}
            >
              <Ionicons name="trophy" size={16} color={theme.colors.onSurface} />
            </View>
          ) : (
            <Text style={styles.rankNumber}>#{entry.rank}</Text>
          )}
        </View>

        <View style={styles.entryPetImage}>
          <Ionicons name="paw" size={20} color="#666" />
        </View>

        <View style={styles.entryInfo}>
          <Text style={styles.entryPetName}>{entry.petName}</Text>
          <Text style={styles.entryOwnerName}>by {entry.ownerName}</Text>
          <View style={styles.entryStats}>
            <Text style={styles.entryStat}>{entry.stats.matches} matches</Text>
            <Text style={styles.entryStat}>•</Text>
            <Text style={styles.entryStat}>{entry.stats.likes} likes</Text>
          </View>
        </View>

        <View style={styles.entryScore}>
          <Text style={styles.entryScoreText}>{entry.score}</Text>
          <Text style={styles.entryScoreLabel}>pts</Text>
        </View>

        {entry.badges.length > 0 && (
          <View style={styles.entryBadges}>
            {entry.badges.slice(0, 3).map((badge) => (
              <View
                key={badge.id}
                style={StyleSheet.flatten([
                  styles.badge,
                  { backgroundColor: badge.color },
                ])}
              >
                <Ionicons name="star" size={12} color={theme.colors.onSurface} />
              </View>
            ))}
            {entry.badges.length > 3 && (
              <Text style={styles.badgeCount}>+{entry.badges.length - 3}</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderLoadingMore = () => {
    if (!hasMore) return null;

    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color="#667eea" />
        <Text style={styles.loadingMoreText}>Loading more...</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <TouchableOpacity
          style={styles.filterButton}
           testID="LeaderboardScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
            setShowFilters(!showFilters);
          }}
        >
          <Ionicons name="filter" size={24} color="#667eea" />
        </TouchableOpacity>
      </View>

      {renderCategoryTabs()}
      {renderPeriodTabs()}

      {renderUserRankCard()}

      <ScrollView
        ref={scrollRef}
        style={styles.leaderboardList}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshData}
            colors={["#667eea"]}
          />
        }
        onScrollEndDrag={loadMore}
      >
        {entries.map((entry, index) => renderLeaderboardEntry(entry, index))}
        {renderLoadingMore()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  filterButton: {
    padding: 8,
  },
  categoryTabs: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  categoryTabsContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
  categoryTabActive: {
    backgroundColor: "#667eea",
  },
  categoryTabIcon: {
    marginRight: 6,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  categoryTabTextActive: {
    color: theme.colors.onSurface,
  },
  periodTabs: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  periodTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  periodTabActive: {
    backgroundColor: "#667eea",
  },
  periodTabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
  },
  periodTabTextActive: {
    color: theme.colors.onSurface,
  },
  userRankCard: {
    margin: 20,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: theme.colors.bg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userRankGradient: {
    padding: 20,
  },
  userRankContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userRankInfo: {
    flex: 1,
  },
  userRankTitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  userRankNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  userRankScore: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
  },
  userRankPet: {
    alignItems: "center",
  },
  userRankPetImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  userRankPetName: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
  leaderboardList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  entryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: theme.colors.bg,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  entryRank: {
    width: 40,
    alignItems: "center",
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  entryPetImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 12,
  },
  entryInfo: {
    flex: 1,
  },
  entryPetName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  entryOwnerName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  entryStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  entryStat: {
    fontSize: 12,
    color: "#999",
    marginRight: 8,
  },
  entryScore: {
    alignItems: "center",
    marginLeft: 12,
  },
  entryScoreText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#667eea",
  },
  entryScoreLabel: {
    fontSize: 12,
    color: "#666",
  },
  entryBadges: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  badge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  badgeCount: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  loadingMore: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});
