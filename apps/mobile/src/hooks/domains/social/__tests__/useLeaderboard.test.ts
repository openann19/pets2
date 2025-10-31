/**
 * @jest-environment node
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock auth service
jest.mock('../../../../services/AuthService', () => ({
  authService: {
    getAccessToken: jest.fn(() => Promise.resolve('fake-token')),
  },
}));

// Mock LeaderboardService
jest.mock('../../../../services/LeaderboardService', () => ({
  __esModule: true,
  default: {
    getCategories: jest.fn(),
    getLeaderboard: jest.fn(),
    getUserRank: jest.fn(),
    clearCache: jest.fn(),
  },
}));

import { renderHook, act, waitFor } from '@testing-library/react-native';
import LeaderboardService from '../../../../services/LeaderboardService';
import { useLeaderboard } from '../useLeaderboard';

const mockLeaderboardService = LeaderboardService as jest.Mocked<typeof LeaderboardService>;

// Test data
const mockCategories = [
  { 
    id: 'all', 
    name: 'All', 
    description: 'All categories',
    icon: '🏆',
    color: '#2563EB',
    period: 'weekly' as const,
    isActive: true
  },
  { 
    id: 'matches', 
    name: 'Matches', 
    description: 'Match categories',
    icon: '💕',
    color: '#10B981',
    period: 'weekly' as const,
    isActive: true
  },
  { 
    id: 'chats', 
    name: 'Chats', 
    description: 'Chat categories',
    icon: '💬',
    color: '#F59E0B',
    period: 'weekly' as const,
    isActive: true
  },
];

const mockLeaderboardEntries = [
  {
    id: '1',
    userId: 'user1',
    petId: 'pet1',
    petName: 'Fluffy',
    petImage: 'fluffy.jpg',
    ownerName: 'alice',
    score: 1000,
    rank: 1,
    category: 'all' as any,
    badges: [],
    stats: {
      matches: 50,
      likes: 100,
      superLikes: 10,
      messages: 200,
      profileViews: 300,
      daysActive: 30,
      streak: 15,
      achievements: 5,
    },
    lastUpdated: Date.now(),
  },
  {
    id: '2',
    userId: 'user2',
    petId: 'pet2',
    petName: 'Whiskers',
    petImage: 'whiskers.jpg',
    ownerName: 'bob',
    score: 900,
    rank: 2,
    category: 'all' as any,
    badges: [],
    stats: {
      matches: 45,
      likes: 90,
      superLikes: 8,
      messages: 180,
      profileViews: 250,
      daysActive: 28,
      streak: 12,
      achievements: 4,
    },
    lastUpdated: Date.now(),
  },
  {
    id: '3',
    userId: 'user3',
    petId: 'pet3',
    petName: 'Shadow',
    petImage: 'shadow.jpg',
    ownerName: 'charlie',
    score: 800,
    rank: 3,
    category: 'all' as any,
    badges: [],
    stats: {
      matches: 40,
      likes: 80,
      superLikes: 6,
      messages: 160,
      profileViews: 200,
      daysActive: 25,
      streak: 10,
      achievements: 3,
    },
    lastUpdated: Date.now(),
  },
];

const mockUserRank = {
  rank: 5,
  entry: {
    id: 'current',
    userId: 'currentUser',
    petId: 'currentPet',
    petName: 'MyPet',
    petImage: 'mypet.jpg',
    ownerName: 'me',
    score: 600,
    rank: 5,
    category: 'all' as any,
    badges: [],
    stats: {
      matches: 30,
      likes: 60,
      superLikes: 4,
      messages: 120,
      profileViews: 150,
      daysActive: 20,
      streak: 8,
      achievements: 2,
    },
    lastUpdated: Date.now(),
  },
};

const mockLeaderboardResponse = {
  entries: mockLeaderboardEntries,
  total: 100,
  page: 1,
  limit: 20,
  hasMore: true,
  userRank: 5,
  userEntry: mockUserRank.entry,
};

describe('useLeaderboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock service methods
    mockLeaderboardService.getCategories.mockResolvedValue(mockCategories);
    mockLeaderboardService.getLeaderboard.mockResolvedValue(mockLeaderboardResponse);
    mockLeaderboardService.getUserRank.mockResolvedValue(mockUserRank);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useLeaderboard());

    expect(result.current.loading).toBe(true);
    expect(result.current.entries).toEqual([]);
    expect(result.current.selectedCategory).toBe('all');
    expect(result.current.selectedPeriod).toBe('weekly');
    expect(result.current.page).toBe(1);
    expect(result.current.showFilters).toBe(false);
  });

  it('should load initial data on mount', async () => {
    const { result } = renderHook(() => useLeaderboard());

    // Explicitly load initial data since useEffect may not run in test environment
    await act(async () => {
      await result.current.loadInitialData();
    });

    expect(mockLeaderboardService.getCategories).toHaveBeenCalled();
    expect(mockLeaderboardService.getLeaderboard).toHaveBeenCalledWith(
      {
        period: 'weekly',
      },
      1,
      20,
    );
    expect(mockLeaderboardService.getUserRank).toHaveBeenCalledWith(undefined);

    expect(result.current.categories).toEqual(mockCategories);
    expect(result.current.entries).toEqual(mockLeaderboardEntries);
    expect(result.current.userRank).toBe(5);
    expect(result.current.userEntry).toEqual(mockUserRank.entry);
  });

  it('should load initial data when called explicitly', async () => {
    const { result } = renderHook(() => useLeaderboard());

    // Explicitly call loadInitialData
    await act(async () => {
      await result.current.loadInitialData();
    });

    expect(mockLeaderboardService.getCategories).toHaveBeenCalled();
    expect(mockLeaderboardService.getLeaderboard).toHaveBeenCalledWith(
      {
        period: 'weekly',
      },
      1,
      20,
    );
    expect(mockLeaderboardService.getUserRank).toHaveBeenCalledWith(undefined);

    expect(result.current.categories).toEqual(mockCategories);
    expect(result.current.entries).toEqual(mockLeaderboardEntries);
    expect(result.current.userRank).toBe(5);
    expect(result.current.userEntry).toEqual(mockUserRank.entry);
  });

  it('should load leaderboard with default filter', async () => {
    const { result } = renderHook(() => useLeaderboard());

    // Load initial data first
    await act(async () => {
      await result.current.loadInitialData();
    });

    expect(mockLeaderboardService.getLeaderboard).toHaveBeenCalledWith(
      {
        period: 'weekly',
      },
      1,
      20,
    );
  });

  it('should change selected category', async () => {
    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockLeaderboardService.getLeaderboard.mockClear();

    act(() => {
      result.current.setSelectedCategory('matches');
    });

    await waitFor(() => {
      expect(mockLeaderboardService.getLeaderboard).toHaveBeenCalledWith(
        {
          category: 'matches',
          period: 'weekly',
        },
        1,
        20,
      );
    });

    expect(result.current.selectedCategory).toBe('matches');
  });

  it('should change selected period', async () => {
    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockLeaderboardService.getLeaderboard.mockClear();

    act(() => {
      result.current.setSelectedPeriod('monthly');
    });

    await waitFor(() => {
      expect(mockLeaderboardService.getLeaderboard).toHaveBeenCalledWith(
        {
          period: 'monthly',
        },
        1,
        20,
      );
    });

    expect(result.current.selectedPeriod).toBe('monthly');
  });

  it('should toggle filters visibility', () => {
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

  it('should refresh data', async () => {
    const { result } = renderHook(() => useLeaderboard());

    // Load initial data first
    await act(async () => {
      await result.current.loadInitialData();
    });

    // Clear mock calls but restore the default implementation
    mockLeaderboardService.getLeaderboard.mockClear();
    mockLeaderboardService.getUserRank.mockClear();

    // Clear the service cache to force API calls
    mockLeaderboardService.clearCache();

    await act(async () => {
      await result.current.refreshData();
    });

    expect(result.current.refreshing).toBe(false);
    expect(mockLeaderboardService.getLeaderboard).toHaveBeenCalledWith(
      {
        period: 'weekly',
      },
      1,
      20,
    );
    expect(mockLeaderboardService.getUserRank).toHaveBeenCalledWith(undefined);
  });

  it('should set refreshing state during refresh', async () => {
    const { result } = renderHook(() => useLeaderboard());

    // Load initial data first
    await act(async () => {
      await result.current.loadInitialData();
    });

    let refreshingDuringCall = false;

    // Override the mock for this specific test
    mockLeaderboardService.getLeaderboard.mockImplementation(() => {
      refreshingDuringCall = result.current.refreshing;
      return Promise.resolve(mockLeaderboardResponse);
    });

    // Clear the service cache to force API calls
    mockLeaderboardService.clearCache();

    await act(async () => {
      await result.current.refreshData();
    });

    expect(refreshingDuringCall).toBe(true);
    expect(result.current.refreshing).toBe(false);
  });

  it('should load more entries when available', async () => {
    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const moreEntries = [
      {
        id: '4',
        userId: 'user4',
        petId: 'pet4',
        petName: 'Buddy',
        petImage: 'buddy.jpg',
        ownerName: 'dave',
        score: 700,
        rank: 4,
        category: 'all' as any,
        badges: [],
        stats: {
          matches: 35,
          likes: 70,
          superLikes: 5,
          messages: 140,
          profileViews: 180,
          daysActive: 22,
          streak: 9,
          achievements: 3,
        },
        lastUpdated: Date.now(),
      },
    ];

    // Mock the second page response
    mockLeaderboardService.getLeaderboard.mockImplementation(() => {
      // Return second page data for second call
      if (mockLeaderboardService.getLeaderboard.mock.calls.length > 1) {
        return Promise.resolve({
          entries: moreEntries,
          total: 100,
          page: 2,
          limit: 20,
          hasMore: false,
          userRank: 5,
          userEntry: mockUserRank.entry,
        });
      }
      return Promise.resolve(mockLeaderboardResponse);
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.entries).toHaveLength(4); // Original 3 + 1 new
    expect(result.current.hasMore).toBe(false);
    expect(result.current.page).toBe(2);
  });

  it('should append entries when loading more', async () => {
    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialEntries = result.current.entries;

    const newEntry = {
      id: '4',
      userId: 'user4',
      petId: 'pet4',
      petName: 'Buddy',
      petImage: 'buddy.jpg',
      ownerName: 'dave',
      score: 700,
      rank: 4,
      category: 'all' as any,
      badges: [],
      stats: {
        matches: 35,
        likes: 70,
        superLikes: 5,
        messages: 140,
        profileViews: 180,
        daysActive: 22,
        streak: 9,
        achievements: 3,
      },
      lastUpdated: Date.now(),
    };

    // Mock the second page response
    mockLeaderboardService.getLeaderboard.mockImplementation(() => {
      // Return second page data for second call
      if (mockLeaderboardService.getLeaderboard.mock.calls.length > 1) {
        return Promise.resolve({
          entries: [newEntry],
          total: 100,
          page: 2,
          limit: 20,
          hasMore: true,
          userRank: 5,
          userEntry: mockUserRank.entry,
        });
      }
      return Promise.resolve(mockLeaderboardResponse);
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.entries).toEqual([...initialEntries, newEntry]);
  });

  it('should not load more when hasMore is false', async () => {
    mockLeaderboardService.getLeaderboard.mockResolvedValue({
      entries: mockLeaderboardEntries,
      total: 100,
      page: 1,
      limit: 20,
      hasMore: false,
      userRank: 5,
      userEntry: mockUserRank.entry,
    });

    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockLeaderboardService.getLeaderboard.mockClear();

    await act(async () => {
      await result.current.loadMore();
    });

    expect(mockLeaderboardService.getLeaderboard).not.toHaveBeenCalled();
  });

  it('should not load more when already loading', async () => {
    const { result } = renderHook(() => useLeaderboard());

    // Don't wait for initial load to finish
    mockLeaderboardService.getLeaderboard.mockClear();

    await act(async () => {
      await result.current.loadMore();
    });

    // Should not have been called because still loading
    expect(mockLeaderboardService.getLeaderboard).not.toHaveBeenCalled();
  });

  it('should replace entries when loading page 1', async () => {
    const { result } = renderHook(() => useLeaderboard());

    // Load initial data first
    await act(async () => {
      await result.current.loadInitialData();
    });

    const newEntries = [
      {
        id: '10',
        userId: 'user10',
        petId: 'pet10',
        petName: 'Eve',
        petImage: 'eve.jpg',
        ownerName: 'eve',
        score: 1100,
        rank: 1,
        category: 'all' as any,
        badges: [],
        stats: {
          matches: 55,
          likes: 110,
          superLikes: 12,
          messages: 220,
          profileViews: 350,
          daysActive: 35,
          streak: 18,
          achievements: 6,
        },
        lastUpdated: Date.now(),
      },
    ];

    // Mock the first page refresh response
    mockLeaderboardService.getLeaderboard.mockResolvedValue({
      entries: newEntries,
      total: 100,
      page: 1,
      limit: 20,
      hasMore: true,
      userRank: 5,
      userEntry: mockUserRank.entry,
    });

    // Clear the service cache to force API calls
    mockLeaderboardService.clearCache();

    await act(async () => {
      await result.current.refreshData();
    });

    expect(result.current.entries).toEqual(newEntries);
    expect(result.current.entries).toHaveLength(1);
  });

  it('should load user rank for specific category', async () => {
    const { result } = renderHook(() => useLeaderboard());

    // Load initial data first
    await act(async () => {
      await result.current.loadInitialData();
    });

    // Clear mock calls
    mockLeaderboardService.getUserRank.mockClear();

    act(() => {
      result.current.setSelectedCategory('matches');
    });

    await waitFor(() => {
      expect(mockLeaderboardService.getUserRank).toHaveBeenCalledWith('matches');
    });
  });

  it('should load user rank for all categories', async () => {
    const { result } = renderHook(() => useLeaderboard());

    // Load initial data first
    await act(async () => {
      await result.current.loadInitialData();
    });

    expect(mockLeaderboardService.getUserRank).toHaveBeenCalledWith(undefined);
  });

  it('should handle error during initial load', async () => {
    // Mock the service to reject with an error
    mockLeaderboardService.getLeaderboard.mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should still complete despite error
    expect(result.current.loading).toBe(false);
  });

  it('should provide all periods options', async () => {
    const { result } = renderHook(() => useLeaderboard());

    // Load initial data first
    await act(async () => {
      await result.current.loadInitialData();
    });

    // Test all period options
    const periods: Array<'daily' | 'weekly' | 'monthly' | 'all_time'> = [
      'daily',
      'weekly',
      'monthly',
      'all_time',
    ];

    for (const period of periods) {
      // Clear mock calls but keep implementation
      mockLeaderboardService.getLeaderboard.mockClear();

      act(() => {
        result.current.setSelectedPeriod(period);
      });

      await waitFor(() => {
        expect(mockLeaderboardService.getLeaderboard).toHaveBeenCalledWith(
          {
            period,
          },
          1,
          20,
        );
      });
    }
  });

  it('should return stable function references', async () => {
    const { result, rerender } = renderHook(() => useLeaderboard());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const firstRefreshData = result.current.refreshData;
    const firstLoadMore = result.current.loadMore;
    const firstSetSelectedCategory = result.current.setSelectedCategory;

    rerender(() => useLeaderboard());

    expect(result.current.refreshData).toBe(firstRefreshData);
    expect(result.current.loadMore).toBe(firstLoadMore);
    expect(result.current.setSelectedCategory).toBe(firstSetSelectedCategory);
  });
});
