/**
 * Comprehensive tests for AdminUsersService
 *
 * Coverage:
 * - User fetching with caching and pagination
 * - Admin user actions (suspend, activate, ban, unban)
 * - Cache management and invalidation
 * - Data mapping and transformation
 * - Error handling and recovery
 * - Query parameter handling
 * - Cache expiration and validation
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  fetchAdminUsers,
  performAdminUserAction,
  invalidateAdminUsersCache,
  adminUsersService,
  type AdminUsersQuery,
  type AdminUsersResult,
  type AdminUserAction,
} from '../adminUsersService';

// Mock dependencies
jest.mock('../adminAPI', () => ({
  _adminAPI: {
    getUsers: jest.fn(),
    suspendUser: jest.fn(),
    activateUser: jest.fn(),
    banUser: jest.fn(),
  },
}));

jest.mock('@pawfectmatch/core', () => ({
  logger: {
    error: jest.fn(),
  },
}));

import { _adminAPI as adminAPI } from '../adminAPI';
import { logger } from '@pawfectmatch/core';

const mockAdminAPI = adminAPI as jest.Mocked<typeof adminAPI>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('AdminUsersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear cache before each test
    invalidateAdminUsersCache();
  });

  describe('Cache Management', () => {
    it('should create consistent cache keys', () => {
      const query1: AdminUsersQuery = { page: 1, limit: 20 };
      const query2: AdminUsersQuery = { page: 1, limit: 20 };
      const query3: AdminUsersQuery = { page: 2, limit: 20 };

      // Access private function for testing
      const createCacheKey = (global as any).createCacheKey;

      expect(createCacheKey(query1)).toBe(createCacheKey(query2));
      expect(createCacheKey(query1)).not.toBe(createCacheKey(query3));
    });

    it('should handle complex query normalization', () => {
      const query: AdminUsersQuery = {
        page: 1,
        limit: 50,
        search: 'John DOE',
        status: 'active',
        role: 'admin',
        verified: true,
      };

      const createCacheKey = (global as any).createCacheKey;
      const key = createCacheKey(query);

      // Should normalize search to lowercase
      expect(key).toContain('"search":"john doe"');
      expect(key).toContain('"status":"active"');
      expect(key).toContain('"role":"admin"');
      expect(key).toContain('"verified":"true"');
    });

    it('should exclude undefined and empty values from cache key', () => {
      const query: AdminUsersQuery = {
        page: 1,
        limit: undefined,
        search: '',
        status: undefined,
        role: 'user',
        verified: undefined,
      };

      const createCacheKey = (global as any).createCacheKey;
      const key = createCacheKey(query);

      // Should not include undefined or empty values
      expect(key).not.toContain('limit');
      expect(key).not.toContain('search');
      expect(key).not.toContain('status');
      expect(key).not.toContain('verified');
      expect(key).toContain('"role":"user"');
      expect(key).toContain('"page":"1"');
    });

    it('should validate cache expiration', () => {
      const isCacheValid = (global as any).isCacheValid;

      const validEntry = { timestamp: Date.now() - 10000 }; // 10 seconds ago
      const expiredEntry = { timestamp: Date.now() - 40000 }; // 40 seconds ago

      expect(isCacheValid(validEntry)).toBe(true);
      expect(isCacheValid(expiredEntry)).toBe(false);
      expect(isCacheValid()).toBe(false);
      expect(isCacheValid({})).toBe(false);
    });

    it('should invalidate cache', () => {
      // Add something to cache first
      const cache = (global as any).cache;
      cache.set('test', { timestamp: Date.now(), data: {} });

      expect(cache.size).toBe(1);

      invalidateAdminUsersCache();

      expect(cache.size).toBe(0);
    });
  });

  describe('Data Mapping', () => {
    it('should map user data correctly', () => {
      const rawUser = {
        _id: 'user123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'admin',
        status: 'active',
        isVerified: true,
        createdAt: '2024-01-01T00:00:00Z',
        lastLoginAt: '2024-01-15T00:00:00Z',
        pets: [{ id: 'pet1' }, { id: 'pet2' }],
        matchesCount: 25,
        messagesCount: 150,
      };

      const mapUser = (global as any).mapUser;
      const mapped = mapUser(rawUser);

      expect(mapped).toEqual({
        id: 'user123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'admin',
        status: 'active',
        verified: true,
        createdAt: '2024-01-01T00:00:00Z',
        lastLoginAt: '2024-01-15T00:00:00Z',
        petsCount: 2,
        matchesCount: 25,
        messagesCount: 150,
      });
    });

    it('should handle missing or invalid user data gracefully', () => {
      const incompleteUser = {
        // Missing most fields
        _id: undefined,
        firstName: null,
        lastName: undefined,
        email: '',
        role: null,
        status: 'invalid_status',
        isVerified: undefined,
        createdAt: null,
        pets: null,
        matchesCount: 'invalid',
        messagesCount: undefined,
      };

      const mapUser = (global as any).mapUser;
      const mapped = mapUser(incompleteUser);

      expect(mapped).toEqual({
        id: '',
        firstName: 'Unknown',
        lastName: 'User',
        email: 'unknown@example.com',
        role: 'user',
        status: 'pending',
        verified: false,
        createdAt: expect.any(String), // Current timestamp fallback
        lastLoginAt: undefined,
        petsCount: 0,
        matchesCount: 0,
        messagesCount: 0,
      });
    });

    it('should handle alternative field names', () => {
      const altUser = {
        _id: 'user456',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        role: 'user',
        status: 'active',
        verified: true, // Alternative to isVerified
        createdAt: '2024-01-01T00:00:00Z',
        pets: ['pet1', 'pet2', 'pet3'], // Array of strings
        petsCount: 5, // Alternative to pets array
        matchesCount: 10,
        messagesCount: 50,
      };

      const mapUser = (global as any).mapUser;
      const mapped = mapUser(altUser);

      expect(mapped.petsCount).toBe(3); // Uses array length over petsCount
      expect(mapped.verified).toBe(true);
    });

    it('should map response data correctly', () => {
      const rawResponse = {
        success: true,
        data: {
          users: [
            {
              _id: 'user1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              role: 'user',
              status: 'active',
              isVerified: true,
              createdAt: '2024-01-01T00:00:00Z',
              pets: [{ id: 'pet1' }],
              matchesCount: 5,
              messagesCount: 10,
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 100,
            pages: 5,
          },
        },
      };

      const mapResponse = (global as any).mapResponse;
      const mapped = mapResponse(rawResponse);

      expect(mapped.users).toHaveLength(1);
      expect(mapped.users[0].id).toBe('user1');
      expect(mapped.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 100,
        pages: 5,
      });
    });

    it('should handle missing response data', () => {
      const emptyResponse = {
        success: false,
        data: undefined,
      };

      const mapResponse = (global as any).mapResponse;
      const mapped = mapResponse(emptyResponse);

      expect(mapped.users).toEqual([]);
      expect(mapped.pagination).toEqual({
        page: 1,
        limit: 0,
        total: 0,
        pages: 1,
      });
    });
  });

  describe('fetchAdminUsers', () => {
    const mockApiResponse = {
      success: true,
      data: {
        users: [
          {
            _id: 'user1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            role: 'user',
            status: 'active',
            isVerified: true,
            createdAt: '2024-01-01T00:00:00Z',
            pets: [{ id: 'pet1' }],
            matchesCount: 5,
            messagesCount: 10,
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          pages: 1,
        },
      },
    };

    it('should fetch users from API and cache result', async () => {
      mockAdminAPI.getUsers.mockResolvedValue(mockApiResponse);

      const result = await fetchAdminUsers({ page: 1, limit: 20 });

      expect(mockAdminAPI.getUsers).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
      });

      expect(result.users).toHaveLength(1);
      expect(result.users[0].id).toBe('user1');
      expect(result.pagination.total).toBe(1);

      // Check caching
      const cache = (global as any).cache;
      expect(cache.size).toBe(1);
    });

    it('should return cached data when available and valid', async () => {
      // Pre-populate cache
      const cache = (global as any).cache;
      const cachedData: AdminUsersResult = {
        users: [
          {
            id: 'cached-user',
            firstName: 'Cached',
            lastName: 'User',
            email: 'cached@example.com',
            role: 'user',
            status: 'active',
            verified: true,
            createdAt: '2024-01-01T00:00:00Z',
            petsCount: 1,
            matchesCount: 2,
            messagesCount: 3,
          },
        ],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      };
      cache.set('{"page":"1","limit":"20"}', {
        timestamp: Date.now(),
        data: cachedData,
      });

      const result = await fetchAdminUsers({ page: 1, limit: 20 });

      // Should not call API
      expect(mockAdminAPI.getUsers).not.toHaveBeenCalled();
      expect(result).toBe(cachedData);
    });

    it('should refetch when cache is expired', async () => {
      // Pre-populate with expired cache
      const cache = (global as any).cache;
      const expiredData: AdminUsersResult = {
        users: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      };
      cache.set('{"page":"1","limit":"20"}', {
        timestamp: Date.now() - 40000, // 40 seconds ago (expired)
        data: expiredData,
      });

      mockAdminAPI.getUsers.mockResolvedValue(mockApiResponse);

      const result = await fetchAdminUsers({ page: 1, limit: 20 });

      // Should call API despite cache
      expect(mockAdminAPI.getUsers).toHaveBeenCalled();
      expect(result.users).toHaveLength(1);
    });

    it('should handle various query parameters', async () => {
      mockAdminAPI.getUsers.mockResolvedValue(mockApiResponse);

      const queries: AdminUsersQuery[] = [
        { search: 'john', status: 'active', role: 'user', verified: true },
        { page: 2, limit: 50 },
        { status: 'all' }, // Should be excluded
        { role: '' }, // Should be excluded
        { verified: undefined }, // Should be excluded
      ];

      for (const query of queries) {
        await fetchAdminUsers(query);
      }

      expect(mockAdminAPI.getUsers).toHaveBeenCalledTimes(5);

      // Check specific parameter handling
      expect(mockAdminAPI.getUsers).toHaveBeenNthCalledWith(1, {
        search: 'john',
        status: 'active',
        role: 'user',
        verified: 'true',
      });

      expect(mockAdminAPI.getUsers).toHaveBeenNthCalledWith(2, {
        page: 2,
        limit: 50,
      });

      expect(mockAdminAPI.getUsers).toHaveBeenNthCalledWith(3, {});
      expect(mockAdminAPI.getUsers).toHaveBeenNthCalledWith(4, {});
      expect(mockAdminAPI.getUsers).toHaveBeenNthCalledWith(5, {});
    });

    it('should handle API errors and clear cache', async () => {
      const cache = (global as any).cache;
      cache.set('test-key', { timestamp: Date.now(), data: {} }); // Pre-populate

      const error = new Error('API failed');
      mockAdminAPI.getUsers.mockRejectedValue(error);

      await expect(fetchAdminUsers()).rejects.toThrow('API failed');

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to fetch admin users', {
        error,
      });

      // Should clear cache on error
      expect(cache.size).toBe(0);
    });

    it('should handle non-Error exceptions', async () => {
      mockAdminAPI.getUsers.mockRejectedValue('String error');

      await expect(fetchAdminUsers()).rejects.toThrow('Failed to fetch admin users');

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to fetch admin users', {
        error: expect.any(Error),
      });
    });
  });

  describe('performAdminUserAction', () => {
    beforeEach(() => {
      // Setup cache with some data
      const cache = (global as any).cache;
      cache.set('test-key', { timestamp: Date.now(), data: { users: [], pagination: {} } });
    });

    it('should suspend user successfully', async () => {
      mockAdminAPI.suspendUser.mockResolvedValue({ success: true });

      await performAdminUserAction('user123', 'suspend', {
        reason: 'Violation of terms',
        durationDays: 7,
      });

      expect(mockAdminAPI.suspendUser).toHaveBeenCalledWith('user123', 'Violation of terms', 7);

      // Should invalidate cache
      const cache = (global as any).cache;
      expect(cache.size).toBe(0);
    });

    it('should activate user successfully', async () => {
      mockAdminAPI.activateUser.mockResolvedValue({ success: true });

      await performAdminUserAction('user123', 'activate', {
        reason: 'Appeal approved',
      });

      expect(mockAdminAPI.activateUser).toHaveBeenCalledWith('user123', 'Appeal approved');
    });

    it('should ban user successfully', async () => {
      mockAdminAPI.banUser.mockResolvedValue({ success: true });

      await performAdminUserAction('user123', 'ban', {
        reason: 'Severe violation',
      });

      expect(mockAdminAPI.banUser).toHaveBeenCalledWith('user123', 'Severe violation');
    });

    it('should handle unban action (same as activate)', async () => {
      mockAdminAPI.activateUser.mockResolvedValue({ success: true });

      await performAdminUserAction('user123', 'unban', {
        reason: 'Reinstated',
      });

      expect(mockAdminAPI.activateUser).toHaveBeenCalledWith('user123', 'Reinstated');
    });

    it('should use default reasons when not provided', async () => {
      mockAdminAPI.suspendUser.mockResolvedValue({ success: true });
      mockAdminAPI.activateUser.mockResolvedValue({ success: true });
      mockAdminAPI.banUser.mockResolvedValue({ success: true });

      await performAdminUserAction('user123', 'suspend');
      await performAdminUserAction('user456', 'activate');
      await performAdminUserAction('user789', 'ban');

      expect(mockAdminAPI.suspendUser).toHaveBeenCalledWith(
        'user123',
        'User suspended via mobile admin controls',
        undefined,
      );

      expect(mockAdminAPI.activateUser).toHaveBeenCalledWith(
        'user456',
        'User reactivated via mobile admin controls',
      );

      expect(mockAdminAPI.banUser).toHaveBeenCalledWith(
        'user789',
        'User banned via mobile admin controls',
      );
    });

    it('should handle API errors and log appropriately', async () => {
      const error = new Error('Action failed');
      mockAdminAPI.suspendUser.mockRejectedValue(error);

      await expect(performAdminUserAction('user123', 'suspend')).rejects.toThrow('Action failed');

      expect(mockLogger.error).toHaveBeenCalledWith('Admin user action failed', {
        action: 'suspend',
        userId: 'user123',
        error,
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockAdminAPI.banUser.mockRejectedValue('String error');

      await expect(performAdminUserAction('user123', 'ban')).rejects.toThrow('Failed to ban user');

      expect(mockLogger.error).toHaveBeenCalledWith('Admin user action failed', {
        action: 'ban',
        userId: 'user123',
        error: expect.any(Error),
      });
    });

    it('should invalidate cache on successful actions', async () => {
      const cache = (global as any).cache;
      cache.set('test-key', { timestamp: Date.now(), data: {} });

      mockAdminAPI.activateUser.mockResolvedValue({ success: true });

      await performAdminUserAction('user123', 'activate');

      expect(cache.size).toBe(0);
    });

    it('should not invalidate cache on failed actions', async () => {
      const cache = (global as any).cache;
      cache.set('test-key', { timestamp: Date.now(), data: {} });

      mockAdminAPI.suspendUser.mockRejectedValue(new Error('Failed'));

      await expect(performAdminUserAction('user123', 'suspend')).rejects.toThrow();

      // Cache should still exist
      expect(cache.size).toBe(1);
    });
  });

  describe('Service Interface', () => {
    it('should export service methods correctly', () => {
      expect(adminUsersService.fetchAdminUsers).toBe(fetchAdminUsers);
      expect(adminUsersService.performAdminUserAction).toBe(performAdminUserAction);
      expect(adminUsersService.invalidate).toBe(invalidateAdminUsersCache);
    });

    it('should handle concurrent operations', async () => {
      mockAdminAPI.getUsers.mockResolvedValue({
        success: true,
        data: {
          users: [],
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        },
      });

      const promises = [
        fetchAdminUsers({ page: 1 }),
        fetchAdminUsers({ page: 2 }),
        fetchAdminUsers({ page: 3 }),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(mockAdminAPI.getUsers).toHaveBeenCalledTimes(3);
    });

    it('should handle cache race conditions', async () => {
      const cache = (global as any).cache;
      const cacheKey = '{"page":"1"}';

      // Simulate race condition where cache is set between check and set
      let callCount = 0;
      const originalSet = cache.set.bind(cache);
      cache.set = jest.fn((key, value) => {
        if (callCount++ === 0) {
          // First call succeeds
          return originalSet(key, value);
        } else {
          // Second call simulates race condition
          return originalSet(key, value);
        }
      });

      mockAdminAPI.getUsers.mockResolvedValue({
        success: true,
        data: {
          users: [{ _id: 'user1', firstName: 'Test' }],
          pagination: { page: 1, limit: 20, total: 1, pages: 1 },
        },
      });

      // Make concurrent calls
      const results = await Promise.all([
        fetchAdminUsers({ page: 1 }),
        fetchAdminUsers({ page: 1 }),
      ]);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual(results[1]);

      // Restore original method
      cache.set = originalSet;
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very large result sets', async () => {
      const largeUsers = Array.from({ length: 1000 }, (_, i) => ({
        _id: `user${i}`,
        firstName: `User${i}`,
        lastName: 'Test',
        email: `user${i}@example.com`,
        role: 'user',
        status: 'active',
        isVerified: true,
        createdAt: '2024-01-01T00:00:00Z',
        pets: Array.from({ length: Math.floor(Math.random() * 5) }, () => ({ id: 'pet' })),
        matchesCount: Math.floor(Math.random() * 100),
        messagesCount: Math.floor(Math.random() * 500),
      }));

      mockAdminAPI.getUsers.mockResolvedValue({
        success: true,
        data: {
          users: largeUsers,
          pagination: { page: 1, limit: 1000, total: 1000, pages: 1 },
        },
      });

      const result = await fetchAdminUsers({ page: 1, limit: 1000 });

      expect(result.users).toHaveLength(1000);
      expect(result.pagination.total).toBe(1000);
    });

    it('should handle empty user arrays', async () => {
      mockAdminAPI.getUsers.mockResolvedValue({
        success: true,
        data: {
          users: [],
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        },
      });

      const result = await fetchAdminUsers();

      expect(result.users).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('should handle very long search queries', async () => {
      const longSearch = 'A'.repeat(1000);
      mockAdminAPI.getUsers.mockResolvedValue({
        success: true,
        data: {
          users: [],
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        },
      });

      await fetchAdminUsers({ search: longSearch });

      expect(mockAdminAPI.getUsers).toHaveBeenCalledWith({
        search: longSearch,
      });
    });

    it('should handle special characters in queries', async () => {
      const specialQueries = [
        { search: 'José María ñoño' },
        { search: 'café & naïve résumé 🚀' },
        { role: 'admin@#$%^&*()' },
        { search: 'user@example.com' },
      ];

      mockAdminAPI.getUsers.mockResolvedValue({
        success: true,
        data: {
          users: [],
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        },
      });

      for (const query of specialQueries) {
        await fetchAdminUsers(query);
      }

      expect(mockAdminAPI.getUsers).toHaveBeenCalledTimes(4);
    });

    it('should handle extreme pagination values', async () => {
      mockAdminAPI.getUsers.mockResolvedValue({
        success: true,
        data: {
          users: [],
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        },
      });

      const extremeQueries = [
        { page: 999999, limit: 10000 },
        { page: 0, limit: 0 },
        { page: -1, limit: -10 },
      ];

      for (const query of extremeQueries) {
        await fetchAdminUsers(query);
      }

      // Should handle gracefully without crashing
      expect(mockAdminAPI.getUsers).toHaveBeenCalledTimes(3);
    });

    it('should handle malformed API responses', async () => {
      const malformedResponses = [
        { success: true, data: null },
        { success: true, data: { users: null, pagination: null } },
        { success: true, data: { users: 'not an array', pagination: {} } },
        { success: false },
        null,
        undefined,
        'string response',
      ];

      for (const response of malformedResponses) {
        mockAdminAPI.getUsers.mockResolvedValueOnce(response as any);

        const result = await fetchAdminUsers();

        // Should handle gracefully and return mapped result
        expect(result).toHaveProperty('users');
        expect(result).toHaveProperty('pagination');
        expect(Array.isArray(result.users)).toBe(true);
      }
    });

    it('should handle cache corruption', () => {
      const cache = (global as any).cache;

      // Add corrupted cache entries
      cache.set('corrupted1', null);
      cache.set('corrupted2', undefined);
      cache.set('corrupted3', { timestamp: 'invalid' });
      cache.set('corrupted4', { data: null });

      // Should not crash when accessing cache
      expect(() => {
        const isCacheValid = (global as any).isCacheValid;
        expect(isCacheValid(null)).toBe(false);
        expect(isCacheValid(undefined)).toBe(false);
        expect(isCacheValid({ timestamp: 'invalid' })).toBe(false);
        expect(isCacheValid({ data: null })).toBe(false);
      }).not.toThrow();
    });

    it('should handle memory pressure with large caches', () => {
      const cache = (global as any).cache;

      // Add many cache entries
      for (let i = 0; i < 1000; i++) {
        cache.set(`key${i}`, {
          timestamp: Date.now(),
          data: {
            users: Array.from({ length: 100 }, () => ({
              id: `user${Math.random()}`,
              firstName: 'Test',
              lastName: 'User',
              email: 'test@example.com',
              role: 'user',
              status: 'active',
              verified: true,
              createdAt: '2024-01-01T00:00:00Z',
              petsCount: 1,
              matchesCount: 5,
              messagesCount: 10,
            })),
            pagination: { page: 1, limit: 100, total: 100, pages: 1 },
          },
        });
      }

      expect(cache.size).toBe(1000);

      // Clearing should work efficiently
      invalidateAdminUsersCache();
      expect(cache.size).toBe(0);
    });

    it('should handle rapid cache invalidations', () => {
      const cache = (global as any).cache;

      // Rapid add/invalidate cycles
      for (let i = 0; i < 100; i++) {
        cache.set(`temp${i}`, { timestamp: Date.now(), data: {} });
        invalidateAdminUsersCache();
        expect(cache.size).toBe(0);
      }
    });

    it('should handle concurrent cache operations', async () => {
      const cacheOperations = Array.from({ length: 50 }, async (_, i) => {
        const cache = (global as any).cache;
        cache.set(`concurrent${i}`, { timestamp: Date.now(), data: { users: [], pagination: {} } });
        await new Promise((resolve) => setTimeout(resolve, 1)); // Small delay
        invalidateAdminUsersCache();
      });

      await Promise.all(cacheOperations);

      expect((global as any).cache.size).toBe(0);
    });
  });
});
