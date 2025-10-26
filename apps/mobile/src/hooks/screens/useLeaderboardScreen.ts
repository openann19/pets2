/**
 * useLeaderboardScreen Hook
 * Manages Leaderboard screen state and interactions
 */
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { Alert } from "react-native";
import { logger } from "@pawfectmatch/core";
import { useLeaderboard } from "../domains/social/useLeaderboard";

interface UseLeaderboardScreenReturn {
  // From domain hook
  entries: any[];
  categories: any[];
  userRank: number | null;
  userEntry: any | null;
  loading: boolean;
  refreshing: boolean;
  page: number;
  hasMore: boolean;
  showFilters: boolean;
  selectedCategory: string;
  selectedPeriod: "daily" | "weekly" | "monthly" | "all_time";

  // Actions
  setSelectedCategory: (category: string) => void;
  setSelectedPeriod: (
    period: "daily" | "weekly" | "monthly" | "all_time",
  ) => void;
  setShowFilters: (show: boolean) => void;
  refreshData: () => Promise<void>;
  loadMore: () => Promise<void>;
  handleCategoryChange: (categoryId: string) => void;
  handleGoBack: () => void;
}

export const useLeaderboardScreen = (): UseLeaderboardScreenReturn => {
  const navigation = useNavigation();

  const {
    entries,
    categories,
    userRank,
    userEntry,
    loading,
    refreshing,
    page,
    hasMore,
    showFilters,
    selectedCategory,
    selectedPeriod,
    setSelectedCategory,
    setSelectedPeriod,
    setShowFilters,
    refreshData,
    loadMore,
    loadInitialData,
  } = useLeaderboard();

  // Focus effect to refresh data
  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        void refreshData();
      }
    }, [loading, refreshData]),
  );

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      setSelectedCategory(categoryId);
    },
    [setSelectedCategory],
  );

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    // From domain hook
    entries,
    categories,
    userRank,
    userEntry,
    loading,
    refreshing,
    page,
    hasMore,
    showFilters,
    selectedCategory,
    selectedPeriod,

    // Actions
    setSelectedCategory,
    setSelectedPeriod,
    setShowFilters,
    refreshData,
    loadMore,
    handleCategoryChange,
    handleGoBack,
  };
};
