import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import {
  AdvancedHeader,
  HeaderConfigs,
} from "../components/Advanced/AdvancedHeader";
import { MatchCard } from "../components/matches/MatchCard";
import { MatchesTabs } from "../components/matches/MatchesTabs";
import { EmptyState } from "../components/matches/EmptyState";
import { SkeletonLoader } from "../components/matches/SkeletonLoader";
import { PremiumBanner } from "../components/matches/PremiumBanner";
import { useMatchesData } from "../hooks/useMatchesData";
import { useAuthStore } from "@pawfectmatch/core";
import { logger } from "@pawfectmatch/core";
import type { Match } from "@pawfectmatch/core";

type RootStackParamList = {
  Matches: undefined;
  Chat: { matchId: string; petName: string };
  Premium: undefined;
  Filter: undefined;
};

type MatchesScreenProps = NativeStackScreenProps<RootStackParamList, "Matches">;

export default function MatchesScreen({ navigation }: MatchesScreenProps) {
  const { user } = useAuthStore();
  const {
    matches,
    likedYou,
    selectedTab,
    refreshing,
    isLoading,
    onRefresh,
    setSelectedTab,
    handleScroll,
    loadMatches,
  } = useMatchesData();

  // Premium features state
  const [isPremium] = useState(
    user?.subscriptionStatus === "premium" ||
      user?.subscriptionStatus === "premium_plus",
  );
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);

  // Enhanced match press with haptic feedback
  const handleMatchPress = useCallback(
    (matchId: string, petName: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      logger.info("Match pressed", { matchId, petName });
      navigation.navigate("Chat", { matchId, petName });
    },
    [navigation],
  );

  // Enhanced tab change with haptic feedback
  const handleTabChange = useCallback(
    (tab: "matches" | "likedYou") => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedTab(tab);
      logger.info("Tab changed", { tab });
    },
    [setSelectedTab],
  );

  // Filter functionality
  const handleFilterPress = useCallback(async () => {
    if (!isPremium) {
      // TODO: Show premium upgrade modal
      logger.info("Filter pressed - premium required");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFilters(true);
    logger.info("Filter matches button pressed");
  }, [isPremium]);

  // Search functionality
  const handleSearchPress = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    logger.info("Search matches button pressed");
    // TODO: Implement search modal
  }, []);

  // Apply filters
  const applyFilters = useCallback(
    (filters: any) => {
      const currentData = selectedTab === "matches" ? matches : likedYou;
      let filtered = [...currentData];

      // Apply age filter
      if (filters.ageRange) {
        filtered = filtered.filter(
          (match) =>
            match.petAge >= filters.ageRange.min &&
            match.petAge <= filters.ageRange.max,
        );
      }

      // Apply breed filter
      if (filters.breeds && filters.breeds.length > 0) {
        filtered = filtered.filter((match) =>
          filters.breeds.includes(match.petBreed),
        );
      }

      // Apply online status filter
      if (filters.onlineOnly) {
        filtered = filtered.filter((match) => match.isOnline);
      }

      setFilteredMatches(filtered);
      setShowFilters(false);
      logger.info("Filters applied", { filterCount: filtered.length });
    },
    [selectedTab, matches, likedYou],
  );

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilteredMatches([]);
    setShowFilters(false);
    logger.info("Filters cleared");
  }, []);

  // Enhanced refresh with haptic feedback
  const handleRefresh = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await onRefresh();
    logger.info("Matches refreshed");
  }, [onRefresh]);

  // Load matches on mount
  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Update filtered matches when data changes
  useEffect(() => {
    const currentData = selectedTab === "matches" ? matches : likedYou;
    if (filteredMatches.length === 0) {
      setFilteredMatches(currentData);
    } else {
      setFilteredMatches(currentData);
    }
  }, [matches, likedYou, selectedTab, filteredMatches.length]);

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: "Matches",
            rightButtons: [
              {
                type: "filter",
                onPress: handleFilterPress,
                variant: "glass",
                haptic: "light",
                disabled: !isPremium,
              },
              {
                type: "search",
                onPress: handleSearchPress,
                variant: "minimal",
                haptic: "light",
              },
            ],
          })}
        />
        <MatchesTabs selectedTab={selectedTab} onTabChange={handleTabChange} />
        <SkeletonLoader />
      </SafeAreaView>
    );
  }

  // Show empty state
  const currentData = selectedTab === "matches" ? matches : likedYou;
  const displayData =
    filteredMatches.length > 0 ? filteredMatches : currentData;

  if (displayData.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: "Matches",
            rightButtons: [
              {
                type: "filter",
                onPress: handleFilterPress,
                variant: "glass",
                haptic: "light",
                disabled: !isPremium,
              },
              {
                type: "search",
                onPress: handleSearchPress,
                variant: "minimal",
                haptic: "light",
              },
            ],
          })}
        />
        <MatchesTabs selectedTab={selectedTab} onTabChange={handleTabChange} />
        <EmptyState
          tab={selectedTab}
          onRefresh={handleRefresh}
          isPremium={isPremium}
          onUpgrade={() => navigation.navigate("Premium")}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Advanced Header with Premium Features */}
      <AdvancedHeader
        {...HeaderConfigs.glass({
          title: "Matches",
          subtitle: `${displayData.length} ${selectedTab === "matches" ? "matches" : "likes"}`,
          rightButtons: [
            {
              type: "filter",
              onPress: handleFilterPress,
              variant: "glass",
              haptic: "light",
              disabled: !isPremium,
              badge: !isPremium ? 1 : undefined,
            },
            {
              type: "search",
              onPress: handleSearchPress,
              variant: "minimal",
              haptic: "light",
            },
          ],
          apiActions: {
            filter: handleFilterPress,
            search: handleSearchPress,
          },
        })}
      />

      {/* Enhanced Tabs */}
      <MatchesTabs
        selectedTab={selectedTab}
        onTabChange={handleTabChange}
        isPremium={isPremium}
      />

      {/* Enhanced FlatList with Premium Features */}
      <FlatList
        data={displayData}
        renderItem={({ item, index }) => (
          <MatchCard
            match={item}
            onPress={() => handleMatchPress(item._id, item.petName)}
            onUnmatch={async (matchId, petName) => {
              logger.info("Unmatch requested", { matchId, petName });
            }}
            onArchive={async (matchId, petName) => {
              logger.info("Archive requested", { matchId, petName });
            }}
            onReport={(matchId, petName) => {
              logger.info("Report requested", { matchId, petName });
            }}
            isPremium={isPremium}
            index={index}
          />
        )}
        keyExtractor={(item) => item._id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        onScroll={async (e) => {
          await handleScroll(e.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={120}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#ec4899"
            colors={["#ec4899", "#be185d"]}
            progressBackgroundColor="#fff"
          />
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        getItemLayout={(data, index) => ({
          length: 120,
          offset: 120 * index,
          index,
        })}
      />

      {/* Premium Upgrade Banner */}
      {!isPremium && (
        <PremiumBanner onUpgrade={() => navigation.navigate("Premium")} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
});
