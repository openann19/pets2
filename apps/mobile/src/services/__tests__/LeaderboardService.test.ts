/**
 * Comprehensive tests for LeaderboardService
 *
 * Coverage:
 * - Leaderboard data fetching and caching
 * - User rank and entry retrieval
 * - Category management
 * - Badge system
 * - Pet statistics
 * - Score updates and cache invalidation
 * - Historical data and trends
 * - Nearby leaders functionality
 * - Achievement progress tracking
 * - Social sharing features
 * - Error handling and edge cases
 * - Cache management and expiration
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { leaderboardService, LeaderboardService } from '../LeaderboardService';
import { authService } from '../AuthService';

// Mock auth service
jest.mock('../AuthService', () => ({
  authService: {
    getAccessToken: jest.fn(),
  },
}));

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    error: jest.fn(),
  },
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('LeaderboardService', () => {
  let service: LeaderboardService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LeaderboardService();

    // Setup default mocks
    mockAuthService.getAccessToken.mockResolvedValue('test-token');
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    } as any);
  });

  afterEach(() => {
    service.clearCache();
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with correct base URL from environment', () => {
      const originalEnv = process.env.EXPO_PUBLIC_API_URL;
      process.env.EXPO_PUBLIC_API_URL = 'https://test-api.com';

      const testService = new LeaderboardService();
      expect((testService as any).baseUrl).toBe('https://test-api.com');

      process.env.EXPO_PUBLIC_API_URL = originalEnv;
    });

    it('should use default base URL when environment variable is not set', () => {
      const originalEnv = process.env.EXPO_PUBLIC_API_URL;
      delete process.env.EXPO_PUBLIC_API_URL;

      const testService = new LeaderboardService();
      expect((testService as any).baseUrl).toBe('https://api.pawfectmatch.com');

      process.env.EXPO_PUBLIC_API_URL = originalEnv;
    });
  });

  describe('getLeaderboard', () => {
    const mockLeaderboardResponse = {
      entries: [
        {
          id: 'entry1',
          userId: 'user1',
          petId: 'pet1',
          petName: 'Buddy',
          petImage: 'buddy.jpg',
          ownerName: 'John',
          score: 1500,
          rank: 1,
          category: { id: 'matches', name: 'Matches', period: 'weekly' as const },
          badges: [],
          stats: { matches: 50, likes: 30, superLikes: 5 },
          lastUpdated: Date.now(),
        },
      ],
      total: 100,
      page: 1,
      limit: 20,
      hasMore: true,
      userRank: 5,
      userEntry: null,
    };

    it('should fetch leaderboard data successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockLeaderboardResponse),
      });

      const result = await service.getLeaderboard();

      expect(result).toEqual(mockLeaderboardResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.pawfectmatch.com/api/leaderboard?page=1&limit=20',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        }),
      );
    });

    it('should apply filters correctly', async () => {
      const filters = {
        category: 'matches',
        period: 'weekly' as const,
        location: { latitude: 40.7128, longitude: -74.006, radius: 10 },
        ageRange: { min: 1, max: 5 },
        breed: 'Golden Retriever',
        gender: 'male' as const,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockLeaderboardResponse),
      });

      await service.getLeaderboard(filters, 2, 10);

      const expectedUrl = expect.stringContaining('page=2&limit=10&category=matches&period=weekly');
      expect(mockFetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
    });

    it('should return cached data when available and not expired', async () => {
      // First call - should fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockLeaderboardResponse),
      });

      await service.getLeaderboard({ category: 'test' });
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call with same params - should use cache
      await service.getLeaderboard({ category: 'test' });
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1 call
    });

    it('should refetch when cache expires', async () => {
      // Set very short cache expiration
      (service as any).cacheExpiration = 1; // 1ms

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockLeaderboardResponse),
      });

      await service.getLeaderboard();
      await new Promise((resolve) => setTimeout(resolve, 2)); // Wait for cache to expire
      await service.getLeaderboard();

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(service.getLeaderboard()).rejects.toThrow('HTTP 500: Internal Server Error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.getLeaderboard()).rejects.toThrow('Network error');
    });
  });

  describe('getUserRank', () => {
    const mockUserRankResponse = {
      rank: 15,
      entry: {
        id: 'user-entry',
        userId: 'current-user',
        petId: 'pet1',
        petName: 'Fluffy',
        petImage: 'fluffy.jpg',
        ownerName: 'Current User',
        score: 1200,
        rank: 15,
        category: { id: 'likes', name: 'Likes', period: 'monthly' as const },
        badges: [],
        stats: { likes: 45 },
        lastUpdated: Date.now(),
      },
    };

    it('should fetch user rank successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserRankResponse),
      });

      const result = await service.getUserRank('matches');

      expect(result).toEqual(mockUserRankResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.pawfectmatch.com/api/leaderboard/user-rank?category=matches',
        expect.any(Object),
      );
    });

    it('should fetch user rank without category', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ rank: 10, entry: null }),
      });

      const result = await service.getUserRank();

      expect(result.rank).toBe(10);
      expect(result.entry).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.pawfectmatch.com/api/leaderboard/user-rank',
        expect.any(Object),
      );
    });

    it('should use cached user rank data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserRankResponse),
      });

      await service.getUserRank('test');
      await service.getUserRank('test'); // Should use cache

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCategories', () => {
    const mockCategories = [
      {
        id: 'matches',
        name: 'Matches',
        description: 'Most matches this period',
        icon: 'heart',
        color: '#FF6B6B',
        period: 'weekly' as const,
        isActive: true,
      },
      {
        id: 'likes',
        name: 'Likes',
        description: 'Most likes received',
        icon: 'thumbs-up',
        color: '#4ECDC4',
        period: 'monthly' as const,
        isActive: true,
      },
    ];

    it('should fetch categories successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockCategories),
      });

      const result = await service.getCategories();

      expect(result).toEqual(mockCategories);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.pawfectmatch.com/api/leaderboard/categories',
        expect.any(Object),
      );
    });

    it('should cache categories data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockCategories),
      });

      await service.getCategories();
      await service.getCategories(); // Should use cache

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserBadges', () => {
    const mockBadges = [
      {
        id: 'first-match',
        name: 'First Match',
        description: 'Got your first match!',
        icon: 'trophy',
        color: '#FFD700',
        earnedAt: Date.now(),
        rarity: 'common' as const,
      },
      {
        id: 'speed-dater',
        name: 'Speed Dater',
        description: '50 matches in one week',
        icon: 'zap',
        color: '#FF6B6B',
        earnedAt: Date.now() - 86400000,
        rarity: 'rare' as const,
      },
    ];

    it('should fetch user badges successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockBadges),
      });

      const result = await service.getUserBadges();

      expect(result).toEqual(mockBadges);
    });

    it('should cache user badges', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockBadges),
      });

      await service.getUserBadges();
      await service.getUserBadges(); // Cache hit

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getPetStats', () => {
    const mockStats = {
      matches: 25,
      likes: 40,
      superLikes: 8,
      messages: 15,
      profileViews: 120,
      daysActive: 30,
      streak: 7,
      achievements: 3,
    };

    it('should fetch pet statistics successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockStats),
      });

      const result = await service.getPetStats('pet123');

      expect(result).toEqual(mockStats);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.pawfectmatch.com/api/leaderboard/pet/pet123/stats',
        expect.any(Object),
      );
    });

    it('should cache pet stats', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockStats),
      });

      await service.getPetStats('pet123');
      await service.getPetStats('pet123'); // Cache hit

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateScore', () => {
    it('should update score successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      await expect(
        service.updateScore('pet123', 'matches', 10, 'Got a new match'),
      ).resolves.not.toThrow();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.pawfectmatch.com/api/leaderboard/update-score',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            petId: 'pet123',
            category: 'matches',
            points: 10,
            reason: 'Got a new match',
          }),
        }),
      );
    });

    it('should clear relevant cache after score update', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      // Populate cache
      (service as any).setCachedData('leaderboard-test-1-20', {});
      (service as any).setCachedData('user-rank-matches', {});
      (service as any).setCachedData('pet-stats-pet123', {});

      await service.updateScore('pet123', 'matches', 5, 'test');

      // Check cache was cleared
      expect((service as any).getCachedData('leaderboard-test-1-20')).toBeNull();
      expect((service as any).getCachedData('user-rank-matches')).toBeNull();
      expect((service as any).getCachedData('pet-stats-pet123')).toBeNull();
    });

    it('should handle update score errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(service.updateScore('pet123', 'matches', 10, 'test')).rejects.toThrow(
        'HTTP 400: Bad Request',
      );
    });
  });

  describe('getLeaderboardHistory', () => {
    const mockHistory = [
      { date: '2024-01-01', rank: 10, score: 1000 },
      { date: '2024-01-08', rank: 8, score: 1200 },
      { date: '2024-01-15', rank: 5, score: 1400 },
    ];

    it('should fetch leaderboard history successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockHistory),
      });

      const result = await service.getLeaderboardHistory('matches', 'weekly', 3);

      expect(result).toEqual(mockHistory);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.pawfectmatch.com/api/leaderboard/history?category=matches&period=weekly&weeks=3',
        expect.any(Object),
      );
    });

    it('should use default period when not specified', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockHistory),
      });

      await service.getLeaderboardHistory('likes');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('period=weekly'),
        expect.any(Object),
      );
    });

    it('should cache history data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockHistory),
      });

      await service.getLeaderboardHistory('matches', 'weekly', 4);
      await service.getLeaderboardHistory('matches', 'weekly', 4); // Cache hit

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getNearbyLeaders', () => {
    const mockNearbyLeaders = [
      {
        id: 'nearby1',
        userId: 'user1',
        petId: 'pet1',
        petName: 'Nearby Pet',
        petImage: 'nearby.jpg',
        ownerName: 'Nearby Owner',
        score: 800,
        rank: 25,
        category: { id: 'local', name: 'Local', period: 'monthly' as const },
        badges: [],
        stats: { matches: 20 },
        lastUpdated: Date.now(),
      },
    ];

    it('should fetch nearby leaders successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockNearbyLeaders),
      });

      const result = await service.getNearbyLeaders(40.7128, -74.006, 5);

      expect(result).toEqual(mockNearbyLeaders);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.pawfectmatch.com/api/leaderboard/nearby?latitude=40.7128&longitude=-74.006&radius=5',
        expect.any(Object),
      );
    });

    it('should use default radius when not specified', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockNearbyLeaders),
      });

      await service.getNearbyLeaders(40.7128, -74.006);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('radius=10'),
        expect.any(Object),
      );
    });

    it('should cache nearby leaders data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockNearbyLeaders),
      });

      await service.getNearbyLeaders(40.7128, -74.006, 10);
      await service.getNearbyLeaders(40.7128, -74.006, 10); // Cache hit

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAchievementProgress', () => {
    const mockProgress = {
      completed: [
        {
          id: 'first-match',
          name: 'First Match',
          description: 'Got your first match!',
          icon: 'trophy',
          color: '#FFD700',
          earnedAt: Date.now(),
          rarity: 'common' as const,
        },
      ],
      inProgress: [
        {
          badge: {
            id: 'super-liker',
            name: 'Super Liker',
            description: 'Send 100 super likes',
            icon: 'star',
            color: '#FF6B6B',
            earnedAt: 0,
            rarity: 'epic' as const,
          },
          progress: 75,
          target: 100,
        },
      ],
    };

    it('should fetch achievement progress successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockProgress),
      });

      const result = await service.getAchievementProgress();

      expect(result).toEqual(mockProgress);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.pawfectmatch.com/api/leaderboard/achievements/progress',
        expect.any(Object),
      );
    });

    it('should cache achievement progress', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockProgress),
      });

      await service.getAchievementProgress();
      await service.getAchievementProgress(); // Cache hit

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('shareAchievement', () => {
    it('should share achievement successfully', async () => {
      const mockShareUrl = 'https://pawfectmatch.com/share/badge123';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ shareUrl: mockShareUrl }),
      });

      const result = await service.shareAchievement('badge123', 'twitter');

      expect(result).toBe(mockShareUrl);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.pawfectmatch.com/api/leaderboard/share',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            badgeId: 'badge123',
            platform: 'twitter',
          }),
        }),
      );
    });

    it('should handle share errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      await expect(service.shareAchievement('badge123', 'facebook')).rejects.toThrow(
        'HTTP 403: Forbidden',
      );
    });
  });

  describe('Authentication', () => {
    it('should throw error when no auth token available', async () => {
      mockAuthService.getAccessToken.mockResolvedValue(null);

      await expect(service.getLeaderboard()).rejects.toThrow(
        'Authentication required for leaderboard access',
      );
    });

    it('should include auth token in all API requests', async () => {
      mockAuthService.getAccessToken.mockResolvedValue('custom-token');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ entries: [], total: 0 }),
      });

      await service.getLeaderboard();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer custom-token',
          }),
        }),
      );
    });
  });

  describe('Cache Management', () => {
    it('should clear cache completely', () => {
      (service as any).setCachedData('test-key', 'test-data');
      expect((service as any).getCachedData('test-key')).not.toBeNull();

      service.clearCache();

      expect((service as any).cache.size).toBe(0);
    });

    it('should clear cache by pattern', () => {
      (service as any).setCachedData('leaderboard-weekly', 'data1');
      (service as any).setCachedData('user-rank-weekly', 'data2');
      (service as any).setCachedData('other-data', 'data3');

      (service as any).clearCacheByPattern('weekly');

      expect((service as any).getCachedData('leaderboard-weekly')).toBeNull();
      expect((service as any).getCachedData('user-rank-weekly')).toBeNull();
      expect((service as any).getCachedData('other-data')).not.toBeNull();
    });

    it('should return null for expired cache', () => {
      (service as any).cacheExpiration = 1; // 1ms

      (service as any).setCachedData('test-key', 'test-data');
      expect((service as any).getCachedData('test-key')).not.toBeNull();

      // Wait for expiration
      setTimeout(() => {
        expect((service as any).getCachedData('test-key')).toBeNull();
      }, 2);
    });
  });

  describe('Error Handling and Logging', () => {
    it('should log errors for failed requests', async () => {
      const { logger } = require('@pawfectmatch/core');
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      await expect(service.getLeaderboard()).rejects.toThrow();

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to get leaderboard',
        expect.objectContaining({
          error: expect.any(Error),
        }),
      );
    });

    it('should handle malformed JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      });

      await expect(service.getLeaderboard()).rejects.toThrow();
    });

    it('should handle non-200 HTTP responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(service.getCategories()).rejects.toThrow('HTTP 404: Not Found');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty leaderboard responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          entries: [],
          total: 0,
          page: 1,
          limit: 20,
          hasMore: false,
        }),
      });

      const result = await service.getLeaderboard();

      expect(result.entries).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    it('should handle large page numbers and limits', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          entries: [],
          total: 1000,
          page: 50,
          limit: 100,
          hasMore: false,
        }),
      });

      await service.getLeaderboard({}, 50, 100);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=50&limit=100'),
        expect.any(Object),
      );
    });

    it('should handle special characters in category names', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          rank: 1,
          entry: null,
        }),
      });

      await service.getUserRank('special-category_with+chars');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.pawfectmatch.com/api/leaderboard/user-rank?category=special-category_with+chars',
        expect.any(Object),
      );
    });
  });
});
