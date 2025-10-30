/**
 * useLeaderboard Hook
 * Manages leaderboard data, filtering, pagination, and user ranking
 */
import { useCallback, useEffect, useState } from 'react';
import { logger } from '@pawfectmatch/core';
import type {
  LeaderboardCategory,
  LeaderboardEntry,
  LeaderboardFilter,
} from '../../../services/LeaderboardService';
import LeaderboardService from '../../../services/LeaderboardService';

interface UseLeaderboardReturn {
  // Data
  entries: LeaderboardEntry[];
  categories: LeaderboardCategory[];
  userRank: number | null;
  userEntry: LeaderboardEntry | null;

  // State
  loading: boolean;
  refreshing: boolean;
  page: number;
  hasMore: boolean;
  showFilters: boolean;

  // Filters
  selectedCategory: string;
  selectedPeriod: 'daily' | 'weekly' | 'monthly' | 'all_time';

  // Actions
  setSelectedCategory: (category: string) => void;
  setSelectedPeriod: (period: 'daily' | 'weekly' | 'monthly' | 'all_time') => void;
  setShowFilters: (show: boolean) => void;
  refreshData: () => Promise<void>;
  loadMore: () => Promise<void>;
  loadInitialData: () => Promise<void>;
}

export const useLeaderboard = (): UseLeaderboardReturn => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [categories, setCategories] = useState<LeaderboardCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>(
    'weekly',
  );
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await LeaderboardService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      logger.error('Failed to load categories:', { error });
      throw error;
    }
  }, []);

  const loadLeaderboard = useCallback(
    async (pageNum = 1) => {
      try {
        const filter: LeaderboardFilter =
          selectedCategory === 'all'
            ? { period: selectedPeriod }
            : { category: selectedCategory, period: selectedPeriod };

        const response = await LeaderboardService.getLeaderboard(filter, pageNum, 20);

        if (pageNum === 1) {
          setEntries(response.entries);
        } else {
          setEntries((prev) => [...prev, ...response.entries]);
        }

        setHasMore(response.hasMore);
        setPage(pageNum);
      } catch (error) {
        logger.error('Failed to load leaderboard:', { error });
        throw error;
      }
    },
    [selectedCategory, selectedPeriod],
  );

  const loadUserRank = useCallback(async () => {
    try {
      const rankData = await LeaderboardService.getUserRank(
        selectedCategory === 'all' ? undefined : selectedCategory,
      );
      setUserRank(rankData.rank);
      setUserEntry(rankData.entry);
    } catch (error) {
      logger.error('Failed to load user rank:', { error });
      throw error;
    }
  }, [selectedCategory]);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([loadCategories(), loadLeaderboard(), loadUserRank()]);
    } catch (error) {
      logger.error('Failed to load initial data:', { error });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadCategories, loadLeaderboard, loadUserRank]);

  const refreshData = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([loadLeaderboard(1), loadUserRank()]);
    } catch (error) {
      logger.error('Failed to refresh data:', { error });
      throw error;
    } finally {
      setRefreshing(false);
    }
  }, [loadLeaderboard, loadUserRank]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      await loadLeaderboard(page + 1);
    } catch (error) {
      logger.error('Failed to load more entries:', { error });
      throw error;
    }
  }, [hasMore, loading, loadLeaderboard, page]);

  // Load initial data
  useEffect(() => {
    void loadInitialData();
  }, []);

  // Reload when category or period changes
  useEffect(() => {
    if (categories.length > 0) {
      void loadLeaderboard();
      void loadUserRank();
    }
  }, [selectedCategory, selectedPeriod]);

  return {
    // Data
    entries,
    categories,
    userRank,
    userEntry,

    // State
    loading,
    refreshing,
    page,
    hasMore,
    showFilters,

    // Filters
    selectedCategory,
    selectedPeriod,

    // Actions
    setSelectedCategory,
    setSelectedPeriod,
    setShowFilters,
    refreshData,
    loadMore,
    loadInitialData,
  };
};
