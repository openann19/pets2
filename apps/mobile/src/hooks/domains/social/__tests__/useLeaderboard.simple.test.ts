/**
 * Tests for useLeaderboard hook - Simplified version
 */

// Mock logger
jest.mock("@pawfectmatch/core", () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock LeaderboardService
const mockGetCategories = jest.fn();
const mockGetLeaderboard = jest.fn();
const mockGetUserRank = jest.fn();

jest.mock("../../../../services/LeaderboardService", () => ({
  __esModule: true,
  default: {
    getCategories: mockGetCategories,
    getLeaderboard: mockGetLeaderboard,
    getUserRank: mockGetUserRank,
  },
}));

const mockCategories = [
  { id: "all", name: "All", icon: "🏆" },
  { id: "matches", name: "Matches", icon: "💕" },
  { id: "chats", name: "Chats", icon: "💬" },
];

const mockLeaderboardEntries = [
  {
    id: "1",
    userId: "user1",
    username: "alice",
    score: 1000,
    rank: 1,
    avatar: "avatar1.jpg",
  },
  {
    id: "2",
    userId: "user2",
    username: "bob",
    score: 900,
    rank: 2,
    avatar: "avatar2.jpg",
  },
];

import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useLeaderboard } from "../useLeaderboard";

describe("useLeaderboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock returns
    mockGetCategories.mockResolvedValue(mockCategories);
    mockGetLeaderboard.mockResolvedValue({
      entries: mockLeaderboardEntries,
      hasMore: false,
      totalCount: 2,
    });
    mockGetUserRank.mockResolvedValue({
      rank: 5,
      entry: {
        id: "3",
        userId: "currentUser",
        username: "currentuser",
        score: 800,
        rank: 5,
        avatar: "current.jpg",
      },
    });
  });

  describe("Initialization", () => {
    it("should initialize with default state", async () => {
      const { result } = renderHook(() => useLeaderboard());

      // Initial state before data loads
      expect(result.current.entries).toEqual([]);
      expect(result.current.categories).toEqual([]);
      expect(result.current.selectedCategory).toBe("all");
      expect(result.current.selectedPeriod).toBe("weekly");
      expect(result.current.page).toBe(1);
      expect(result.current.hasMore).toBe(false);
      expect(result.current.showFilters).toBe(false);

      // Wait for initial data to load
      await waitFor(() => result.current.loading === false);

      // After loading
      expect(result.current.loading).toBe(false);
      expect(result.current.categories).toEqual(mockCategories);
      expect(result.current.entries).toEqual(mockLeaderboardEntries);
      expect(result.current.userRank).toBe(5);
    });

    it("should provide all required functions", () => {
      const { result } = renderHook(() => useLeaderboard());

      expect(typeof result.current.setSelectedCategory).toBe('function');
      expect(typeof result.current.setSelectedPeriod).toBe('function');
      expect(typeof result.current.setShowFilters).toBe('function');
      expect(typeof result.current.refreshData).toBe('function');
      expect(typeof result.current.loadMore).toBe('function');
      expect(typeof result.current.loadInitialData).toBe('function');
    });
  });

  describe("Category and Period Filtering", () => {
    it("should change selected category", () => {
      const { result } = renderHook(() => useLeaderboard());

      act(() => {
        result.current.setSelectedCategory("matches");
      });

      expect(result.current.selectedCategory).toBe("matches");
    });

    it("should change selected period", () => {
      const { result } = renderHook(() => useLeaderboard());

      act(() => {
        result.current.setSelectedPeriod("monthly");
      });

      expect(result.current.selectedPeriod).toBe("monthly");
    });

    it("should toggle filter visibility", () => {
      const { result } = renderHook(() => useLeaderboard());

      act(() => {
        result.current.setShowFilters(true);
      });

      expect(result.current.showFilters).toBe(true);
    });
  });

  describe("Data Loading", () => {
    it("should load categories successfully", async () => {
      const { result } = renderHook(() => useLeaderboard());

      await act(async () => {
        await result.current.loadInitialData();
      });

      expect(mockGetCategories).toHaveBeenCalled();
      expect(result.current.categories).toEqual(mockCategories);
    });

    it("should load leaderboard data successfully", async () => {
      const { result } = renderHook(() => useLeaderboard());

      await act(async () => {
        await result.current.loadInitialData();
      });

      expect(mockGetLeaderboard).toHaveBeenCalledWith({
        category: "all",
        period: "weekly",
        page: 1,
      });
      expect(result.current.entries).toEqual(mockLeaderboardEntries);
    });

    it("should load user rank successfully", async () => {
      const { result } = renderHook(() => useLeaderboard());

      await act(async () => {
        await result.current.loadInitialData();
      });

      expect(mockGetUserRank).toHaveBeenCalled();
      expect(result.current.userRank).toBe(5);
    });
  });

  describe("Error Handling", () => {
    it("should handle category loading errors", async () => {
      mockGetCategories.mockRejectedValueOnce(new Error("API Error"));

      const { result } = renderHook(() => useLeaderboard());

      await act(async () => {
        await result.current.loadInitialData();
      });

      expect(result.current.loading).toBe(false);
      // Should still have default empty state on error
      expect(result.current.categories).toEqual([]);
    });

    it("should handle leaderboard loading errors", async () => {
      mockGetLeaderboard.mockRejectedValueOnce(new Error("API Error"));

      const { result } = renderHook(() => useLeaderboard());

      await act(async () => {
        await result.current.loadInitialData();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.entries).toEqual([]);
    });
  });
});
