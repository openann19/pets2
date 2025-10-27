/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useLeaderboard } from "../useLeaderboard";

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
  {
    id: "3",
    userId: "user3",
    username: "charlie",
    score: 800,
    rank: 3,
    avatar: "avatar3.jpg",
  },
];

const mockUserRank = {
  rank: 5,
  entry: {
    id: "current",
    userId: "currentUser",
    username: "me",
    score: 600,
    rank: 5,
    avatar: "myavatar.jpg",
  },
};

describe("useLeaderboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCategories.mockResolvedValue(mockCategories);
    mockGetLeaderboard.mockResolvedValue({
      entries: mockLeaderboardEntries,
      hasMore: true,
    });
    mockGetUserRank.mockResolvedValue(mockUserRank);
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useLeaderboard());

    expect(result.current.loading).toBe(true);
    expect(result.current.entries).toEqual([]);
    expect(result.current.selectedCategory).toBe("all");
    expect(result.current.selectedPeriod).toBe("weekly");
    expect(result.current.page).toBe(1);
    expect(result.current.showFilters).toBe(false);
  });

  it("should load initial data on mount", async () => {
    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetCategories).toHaveBeenCalled();
    expect(mockGetLeaderboard).toHaveBeenCalled();
    expect(mockGetUserRank).toHaveBeenCalled();

    expect(result.current.categories).toEqual(mockCategories);
    expect(result.current.entries).toEqual(mockLeaderboardEntries);
    expect(result.current.userRank).toBe(5);
    expect(result.current.userEntry).toEqual(mockUserRank.entry);
  });

  it("should load leaderboard with default filter", async () => {
    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetLeaderboard).toHaveBeenCalledWith(
      { period: "weekly" },
      1,
      20,
    );
  });

  it("should change selected category", async () => {
    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockGetLeaderboard.mockClear();

    act(() => {
      result.current.setSelectedCategory("matches");
    });

    await waitFor(() => {
      expect(mockGetLeaderboard).toHaveBeenCalledWith(
        { category: "matches", period: "weekly" },
        expect.any(Number),
        expect.any(Number),
      );
    });

    expect(result.current.selectedCategory).toBe("matches");
  });

  it("should change selected period", async () => {
    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockGetLeaderboard.mockClear();

    act(() => {
      result.current.setSelectedPeriod("monthly");
    });

    await waitFor(() => {
      expect(mockGetLeaderboard).toHaveBeenCalledWith(
        { period: "monthly" },
        expect.any(Number),
        expect.any(Number),
      );
    });

    expect(result.current.selectedPeriod).toBe("monthly");
  });

  it("should toggle filters visibility", () => {
    const { result } = renderHook(() => useLeaderboard());

    expect(result.current.showFilters).toBe(false);

    act(() => {
      result.current.setShowFilters(true);
    });

    expect(result.current.showFilters).toBe(true);

    act(() => {
      result.current.setShowFilters(false);
    });

    expect(result.current.showFilters).toBe(false);
  });

  it("should refresh data", async () => {
    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockGetLeaderboard.mockClear();
    mockGetUserRank.mockClear();

    await act(async () => {
      await result.current.refreshData();
    });

    expect(result.current.refreshing).toBe(false);
    expect(mockGetLeaderboard).toHaveBeenCalledWith(
      { period: "weekly" },
      1,
      20,
    );
    expect(mockGetUserRank).toHaveBeenCalled();
  });

  it("should set refreshing state during refresh", async () => {
    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let refreshingDuringCall = false;

    mockGetLeaderboard.mockImplementation(() => {
      refreshingDuringCall = result.current.refreshing;
      return Promise.resolve({
        entries: mockLeaderboardEntries,
        hasMore: true,
      });
    });

    await act(async () => {
      await result.current.refreshData();
    });

    expect(refreshingDuringCall).toBe(true);
    expect(result.current.refreshing).toBe(false);
  });

  it("should load more entries when available", async () => {
    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const moreEntries = [
      {
        id: "4",
        userId: "user4",
        username: "dave",
        score: 700,
        rank: 4,
        avatar: "avatar4.jpg",
      },
    ];

    mockGetLeaderboard.mockResolvedValue({
      entries: moreEntries,
      hasMore: false,
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(mockGetLeaderboard).toHaveBeenCalledWith(
      { period: "weekly" },
      2, // Next page
      20,
    );

    expect(result.current.entries).toHaveLength(4); // Original 3 + 1 new
    expect(result.current.hasMore).toBe(false);
    expect(result.current.page).toBe(2);
  });

  it("should append entries when loading more", async () => {
    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialEntries = result.current.entries;

    const newEntry = {
      id: "4",
      userId: "user4",
      username: "dave",
      score: 700,
      rank: 4,
      avatar: "avatar4.jpg",
    };

    mockGetLeaderboard.mockResolvedValue({
      entries: [newEntry],
      hasMore: true,
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.entries).toEqual([...initialEntries, newEntry]);
  });

  it("should not load more when hasMore is false", async () => {
    mockGetLeaderboard.mockResolvedValue({
      entries: mockLeaderboardEntries,
      hasMore: false,
    });

    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockGetLeaderboard.mockClear();

    await act(async () => {
      await result.current.loadMore();
    });

    expect(mockGetLeaderboard).not.toHaveBeenCalled();
  });

  it("should not load more when already loading", async () => {
    const { result } = renderHook(() => useLeaderboard());

    // Don't wait for initial load to finish
    mockGetLeaderboard.mockClear();

    await act(async () => {
      await result.current.loadMore();
    });

    // Should not have been called because still loading
    expect(mockGetLeaderboard).not.toHaveBeenCalled();
  });

  it("should replace entries when loading page 1", async () => {
    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const newEntries = [
      {
        id: "10",
        userId: "user10",
        username: "eve",
        score: 1100,
        rank: 1,
        avatar: "avatar10.jpg",
      },
    ];

    mockGetLeaderboard.mockResolvedValue({
      entries: newEntries,
      hasMore: true,
    });

    await act(async () => {
      await result.current.refreshData();
    });

    expect(result.current.entries).toEqual(newEntries);
    expect(result.current.entries).toHaveLength(1);
  });

  it("should load user rank for specific category", async () => {
    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockGetUserRank.mockClear();

    act(() => {
      result.current.setSelectedCategory("matches");
    });

    await waitFor(() => {
      expect(mockGetUserRank).toHaveBeenCalledWith("matches");
    });
  });

  it("should load user rank for all categories", async () => {
    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetUserRank).toHaveBeenCalledWith(undefined);
  });

  it("should handle error during initial load", async () => {
    mockGetCategories.mockRejectedValue(new Error("API error"));

    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should still complete despite error
    expect(result.current.loading).toBe(false);
  });

  it("should provide all periods options", async () => {
    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Test all period options
    const periods: Array<"daily" | "weekly" | "monthly" | "all_time"> = [
      "daily",
      "weekly",
      "monthly",
      "all_time",
    ];

    for (const period of periods) {
      mockGetLeaderboard.mockClear();

      act(() => {
        result.current.setSelectedPeriod(period);
      });

      await waitFor(() => {
        expect(mockGetLeaderboard).toHaveBeenCalledWith(
          expect.objectContaining({ period }),
          expect.any(Number),
          expect.any(Number),
        );
      });
    }
  });

  it("should return stable function references", async () => {
    const { result, rerender } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const firstRefreshData = result.current.refreshData;
    const firstLoadMore = result.current.loadMore;
    const firstSetSelectedCategory = result.current.setSelectedCategory;

    rerender();

    expect(result.current.refreshData).toBe(firstRefreshData);
    expect(result.current.loadMore).toBe(firstLoadMore);
    expect(result.current.setSelectedCategory).toBe(firstSetSelectedCategory);
  });
});
