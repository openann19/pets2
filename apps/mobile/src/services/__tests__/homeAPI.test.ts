/**
 * Comprehensive tests for Home API Service
 * 
 * Coverage:
 * - Home stats retrieval
 * - Activity feed fetching
 * - Error handling
 * - Type safety
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { getHomeStats, getActivityFeed } from '../homeAPI';

// Mock fetch
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('Home API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_API_URL = 'https://api.test.com';
    process.env.API_URL = 'https://api.test.com';
  });

  describe('Happy Path - Get Home Stats', () => {
    it('should fetch home stats successfully', async () => {
      const mockStats = {
        totalLikes: 150,
        totalMatches: 12,
        totalSwipes: 450,
        streakDays: 5,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      } as Response);

      const result = await getHomeStats();

      expect(result).toEqual(mockStats);
      expect(mockFetch).toHaveBeenCalledWith('https://api.test.com/api/home/stats');
    });

    it('should handle empty stats', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      const result = await getHomeStats();

      expect(result).toEqual({});
    });

    it('should handle numeric stats', async () => {
      const numericStats = {
        totalLikes: 100,
        totalMatches: 5,
        totalSwipes: 300,
        streakDays: 3,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => numericStats,
      } as Response);

      const result = await getHomeStats();

      expect(result.totalLikes).toBe(100);
      expect(result.totalMatches).toBe(5);
    });
  });

  describe('Happy Path - Get Activity Feed', () => {
    it('should fetch activity feed successfully', async () => {
      const mockFeed = {
        activities: [
          { id: '1', type: 'like', pet: { name: 'Max' }, timestamp: '2024-01-01' },
          { id: '2', type: 'match', pet: { name: 'Buddy' }, timestamp: '2024-01-02' },
        ],
        hasMore: true,
        nextCursor: 'cursor123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFeed,
      } as Response);

      const result = await getActivityFeed();

      expect(result).toEqual(mockFeed);
      expect(mockFetch).toHaveBeenCalledWith('https://api.test.com/api/home/feed');
    });

    it('should handle empty activity feed', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ activities: [], hasMore: false }),
      } as Response);

      const result = await getActivityFeed();

      expect(result.activities).toEqual([]);
      expect(result.hasMore).toBe(false);
    });

    it('should handle feed with pagination', async () => {
      const paginatedFeed = {
        activities: [{ id: '1', type: 'like' }],
        hasMore: true,
        nextCursor: 'abc123',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => paginatedFeed,
      } as Response);

      const result = await getActivityFeed();

      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('abc123');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors for stats', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getHomeStats()).rejects.toThrow();
    });

    it('should handle network errors for feed', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getActivityFeed()).rejects.toThrow();
    });

    it('should handle HTTP errors for stats', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(getHomeStats()).rejects.toThrow('home stats failed');
    });

    it('should handle HTTP errors for feed', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(getActivityFeed()).rejects.toThrow('home feed failed');
    });

    it('should handle JSON parse errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('JSON parse error');
        },
      } as Response);

      await expect(getHomeStats()).rejects.toThrow('JSON parse error');
    });

    it('should handle timeout errors', async () => {
      mockFetch.mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1))
      );

      await expect(getHomeStats()).rejects.toThrow('Timeout');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing environment URL', async () => {
      process.env.EXPO_PUBLIC_API_URL = '';
      process.env.API_URL = '';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ totalLikes: 0 }),
      } as Response);

      const result = await getHomeStats();

      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledWith('/api/home/stats');
    });

    it('should handle very large stats responses', async () => {
      const largeStats = {
        totalLikes: Number.MAX_SAFE_INTEGER,
        totalMatches: Number.MAX_SAFE_INTEGER,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => largeStats,
      } as Response);

      const result = await getHomeStats();

      expect(result.totalLikes).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle feed with many activities', async () => {
      const manyActivities = Array.from({ length: 1000 }, (_, i) => ({
        id: String(i),
        type: 'like',
        timestamp: new Date().toISOString(),
      }));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ activities: manyActivities, hasMore: false }),
      } as Response);

      const result = await getActivityFeed();

      expect(result.activities).toHaveLength(1000);
    });

    it('should handle concurrent requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ totalLikes: Math.random() }),
      } as Response);

      const promises = Array.from({ length: 10 }, () => getHomeStats());
      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      expect(mockFetch).toHaveBeenCalledTimes(10);
    });

    it('should handle special characters in stats', async () => {
      const statsWithSpecialChars = {
        message: 'Hello & "world"',
        data: { value: '<script>alert("xss")</script>' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => statsWithSpecialChars,
      } as Response);

      const result = await getHomeStats();

      expect(result.message).toBe('Hello & "world"');
    });

    it('should handle empty string environment URL', async () => {
      process.env.EXPO_PUBLIC_API_URL = '';
      process.env.API_URL = '';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await getHomeStats();

      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('Integration', () => {
    it('should integrate with fetch API', async () => {
      const stats = { totalLikes: 100 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => stats,
      } as Response);

      const result = await getHomeStats();

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/home/stats'));
      expect(result).toEqual(stats);
    });

    it('should handle multiple sequential calls', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ totalLikes: 100 }),
      } as Response);

      await getHomeStats();
      await getHomeStats();

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should integrate stats and feed together', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ totalLikes: 100 }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ activities: [] }),
        } as Response);

      const stats = await getHomeStats();
      const feed = await getActivityFeed();

      expect(stats.totalLikes).toBe(100);
      expect(feed.activities).toEqual([]);
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for stats response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ totalLikes: 100, totalMatches: 5 }),
      } as Response);

      const result = await getHomeStats();

      expect(typeof result.totalLikes).toBe('number');
      expect(typeof result.totalMatches).toBe('number');
    });

    it('should maintain type safety for feed response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          activities: [{ id: '1', type: 'like' }],
          hasMore: false,
        }),
      } as Response);

      const result = await getActivityFeed();

      expect(Array.isArray(result.activities)).toBe(true);
      expect(typeof result.hasMore).toBe('boolean');
    });

    it('should handle unknown properties gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalLikes: 100,
          unknownProperty: 'test',
        }),
      } as Response);

      const result = await getHomeStats();

      expect(result).toHaveProperty('totalLikes');
      expect(result).toHaveProperty('unknownProperty');
    });
  });
});
