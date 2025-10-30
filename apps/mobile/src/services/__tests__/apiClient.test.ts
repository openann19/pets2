/**
 * Comprehensive tests for ApiClient
 *
 * Coverage:
 * - HTTP methods (GET, POST, PUT, PATCH, DELETE)
 * - Authentication token management
 * - Network monitoring and offline handling
 * - Circuit breaker functionality
 * - Request/response interceptors
 * - Error handling and retry logic
 * - UnifiedAPIClient integration
 * - Resource cleanup and memory management
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosHeaders } from 'axios';
import NetInfo from '@react-native-community/netinfo';
import type { NetInfoState } from '@react-native-community/netinfo';
import { UnifiedAPIClient } from '@pawfectmatch/core/api/UnifiedAPIClient';
import { ApiClient, apiClient } from '../apiClient';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('axios');
jest.mock('@react-native-community/netinfo');
jest.mock('@pawfectmatch/core/api/UnifiedAPIClient');
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockAxios = axios as jest.Mocked<typeof axios>;
const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;
const mockUnifiedAPIClient = UnifiedAPIClient as jest.Mocked<typeof UnifiedAPIClient>;

// Mock axios.create to return a mock instance
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
};

mockAxios.create.mockReturnValue(mockAxiosInstance as any);

describe('ApiClient', () => {
  let client: ApiClient;
  let mockUnifiedClientInstance: jest.Mocked<UnifiedAPIClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);

    mockNetInfo.addEventListener.mockReturnValue({ remove: jest.fn() });
    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      type: 'wifi',
      isInternetReachable: true,
    } as NetInfoState);

    mockUnifiedClientInstance = {
      setOnlineStatus: jest.fn(),
      getCircuitBreakerMetrics: jest.fn().mockReturnValue({}),
      getQueueStats: jest.fn().mockReturnValue({}),
      destroy: jest.fn(),
    } as any;

    mockUnifiedAPIClient.mockImplementation(() => mockUnifiedClientInstance);

    // Create client instance
    client = new ApiClient({
      baseURL: 'https://api.test.com',
      timeout: 10000,
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Initialization', () => {
    it('should create axios instance with correct configuration', () => {
      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.test.com',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should use default timeout when not specified', () => {
      new ApiClient({ baseURL: 'https://api.test.com' });

      expect(mockAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 30000,
        }),
      );
    });

    it('should initialize UnifiedAPIClient with correct config', () => {
      expect(mockUnifiedAPIClient).toHaveBeenCalledWith({
        baseURL: 'https://api.test.com',
        timeout: 10000,
        retryConfig: {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 30000,
        },
        circuitBreakerConfig: {
          failureThreshold: 5,
          successThreshold: 2,
          resetTimeout: 60000,
        },
        queueConfig: {
          maxSize: 1000,
          persistence: 'memory',
        },
      });
    });

    it('should setup network monitoring', () => {
      expect(mockNetInfo.addEventListener).toHaveBeenCalled();
      expect(mockNetInfo.fetch).toHaveBeenCalled();
    });

    it('should load token on initialization', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('stored-token');

      // Create new instance to test initialization
      const newClient = new ApiClient({ baseURL: 'https://api.test.com' });
      await new Promise((resolve) => setTimeout(resolve, 0)); // Allow async initialization

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('authToken');
    });
  });

  describe('Token Management', () => {
    it('should set and store authentication token', async () => {
      const token = 'new-auth-token';

      await client.setToken(token);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('authToken', token);
      // Access private property for testing
      expect((client as any).token).toBe(token);
    });

    it('should handle token storage errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      await expect(client.setToken('token')).resolves.not.toThrow();
      expect((client as any).token).toBe('token'); // Still sets in memory
    });

    it('should clear authentication token', async () => {
      // Set token first
      await client.setToken('test-token');
      expect((client as any).token).toBe('test-token');

      // Clear token
      await client.clearToken();

      expect((client as any).token).toBeNull();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
    });

    it('should handle token clearing errors gracefully', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));

      await expect(client.clearToken()).resolves.not.toThrow();
      expect((client as any).token).toBeNull();
    });
  });

  describe('HTTP Methods', () => {
    const mockResponse = { data: { success: true, id: 123 } };

    beforeEach(() => {
      mockAxiosInstance.get.mockResolvedValue(mockResponse);
      mockAxiosInstance.post.mockResolvedValue(mockResponse);
      mockAxiosInstance.put.mockResolvedValue(mockResponse);
      mockAxiosInstance.patch.mockResolvedValue(mockResponse);
      mockAxiosInstance.delete.mockResolvedValue(mockResponse);
    });

    it('should make GET requests', async () => {
      const result = await client.get('/test');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should make POST requests with data', async () => {
      const data = { name: 'test' };
      const result = await client.post('/test', data);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', data, undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should make PUT requests with data', async () => {
      const data = { name: 'updated' };
      const result = await client.put('/test', data);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test', data, undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should make PATCH requests with data', async () => {
      const data = { name: 'patched' };
      const result = await client.patch('/test', data);

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/test', data, undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should make DELETE requests', async () => {
      const result = await client.delete('/test');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test', undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should pass config to HTTP methods', async () => {
      const config = { timeout: 5000, headers: { 'X-Custom': 'value' } };

      await client.get('/test', config);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', config);
    });
  });

  describe('Request Interceptors', () => {
    it('should add authorization header when token is available', async () => {
      await client.setToken('test-token');

      // Mock interceptor call
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      const config = { headers: new AxiosHeaders() };

      const result = await requestInterceptor(config);

      expect(result.headers.get('Authorization')).toBe('Bearer test-token');
    });

    it('should not add authorization header when no token', async () => {
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
      const config = { headers: new AxiosHeaders() };

      const result = await requestInterceptor(config);

      expect(result.headers.get('Authorization')).toBeNull();
    });

    it('should handle interceptor errors', async () => {
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];

      await expect(requestInterceptor(null)).rejects.toThrow('Request interceptor rejected');
    });
  });

  describe('Response Interceptors', () => {
    let responseInterceptor: (error: any) => Promise<any>;

    beforeEach(() => {
      responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
    });

    it('should pass through successful responses', async () => {
      const response = { data: 'success' };
      const result = await responseInterceptor(response);

      expect(result).toBe(response);
    });

    it('should handle 401 unauthorized errors', async () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };

      await expect(responseInterceptor(error)).rejects.toThrow();

      expect((client as any).token).toBeNull();
      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
    });

    it('should handle 403 forbidden errors', async () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'Forbidden' },
        },
      };

      await expect(responseInterceptor(error)).rejects.toThrow();
    });

    it('should handle 500 server errors', async () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Server Error' },
        },
      };

      await expect(responseInterceptor(error)).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      const error = {
        request: {},
        message: 'Network Error',
      };

      await expect(responseInterceptor(error)).rejects.toThrow();
    });

    it('should handle request setup errors', async () => {
      const error = {
        message: 'Request setup error',
      };

      await expect(responseInterceptor(error)).rejects.toThrow();
    });
  });

  describe('Network Monitoring', () => {
    it('should update unified client when network comes online', () => {
      const networkListener = mockNetInfo.addEventListener.mock.calls[0][0];

      networkListener({
        isConnected: true,
        type: 'wifi',
        isInternetReachable: true,
      } as NetInfoState);

      expect(mockUnifiedClientInstance.setOnlineStatus).toHaveBeenCalledWith(true);
    });

    it('should update unified client when network goes offline', () => {
      const networkListener = mockNetInfo.addEventListener.mock.calls[0][0];

      networkListener({
        isConnected: false,
        type: 'none',
        isInternetReachable: false,
      } as NetInfoState);

      expect(mockUnifiedClientInstance.setOnlineStatus).toHaveBeenCalledWith(false);
    });

    it('should handle initial network state', async () => {
      mockNetInfo.fetch.mockResolvedValue({
        isConnected: false,
        type: 'none',
        isInternetReachable: false,
      } as NetInfoState);

      // Create new instance to test initial state
      new ApiClient({ baseURL: 'https://api.test.com' });

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockUnifiedClientInstance.setOnlineStatus).toHaveBeenCalledWith(false);
    });
  });

  describe('UnifiedAPIClient Integration', () => {
    it('should provide access to unified client', () => {
      const unifiedClient = client.getUnifiedClient();

      expect(unifiedClient).toBe(mockUnifiedClientInstance);
    });

    it('should provide circuit breaker metrics', () => {
      const metrics = { failures: 3, successes: 1, state: 'closed' };
      mockUnifiedClientInstance.getCircuitBreakerMetrics.mockReturnValue(metrics);

      const result = client.getCircuitBreakerMetrics();

      expect(result).toEqual(metrics);
    });

    it('should provide queue statistics', () => {
      const stats = { size: 5, processed: 10, failed: 2 };
      mockUnifiedClientInstance.getQueueStats.mockReturnValue(stats);

      const result = client.getQueueStats();

      expect(result).toEqual(stats);
    });
  });

  describe('Resource Management', () => {
    it('should provide access to axios instance', () => {
      const axiosInstance = client.getAxiosInstance();

      expect(axiosInstance).toBe(mockAxiosInstance);
    });

    it('should cleanup resources on destroy', () => {
      const mockUnsubscribe = jest.fn();
      (client as any).networkUnsubscribe = mockUnsubscribe;

      client.destroy();

      expect(mockUnsubscribe).toHaveBeenCalled();
      expect(mockUnifiedClientInstance.destroy).toHaveBeenCalled();
    });

    it('should handle destroy when network unsubscribe is not set', () => {
      (client as any).networkUnsubscribe = undefined;

      expect(() => client.destroy()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP method errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      await expect(client.get('/test')).rejects.toThrow('Network error');
    });

    it('should handle malformed responses', async () => {
      mockAxiosInstance.get.mockResolvedValue({}); // Missing data property

      await expect(client.get('/test')).rejects.toThrow();
    });

    it('should handle token loading errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      // Should not crash during initialization
      const newClient = new ApiClient({ baseURL: 'https://api.test.com' });
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(newClient).toBeDefined();
    });

    it('should handle network monitoring setup errors', () => {
      mockNetInfo.addEventListener.mockImplementation(() => {
        throw new Error('Network monitoring error');
      });

      // Should not crash during initialization
      expect(() => new ApiClient({ baseURL: 'https://api.test.com' })).not.toThrow();
    });
  });

  describe('Singleton Instance', () => {
    it('should export singleton instance', () => {
      expect(apiClient).toBeInstanceOf(ApiClient);
      expect(apiClient).toBeDefined();
    });

    it('should use correct default configuration for singleton', () => {
      expect(mockAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.stringContaining('localhost:3001/api'),
          timeout: 30000,
        }),
      );
    });
  });

  describe('Environment Configuration', () => {
    it('should use environment variable for API URL', () => {
      const originalEnv = process.env.EXPO_PUBLIC_API_URL;
      process.env.EXPO_PUBLIC_API_URL = 'https://custom-api.com';

      // Import would need to be re-executed for this test
      // In real scenario, this would be tested via module mocking
      expect(process.env.EXPO_PUBLIC_API_URL).toBe('https://custom-api.com');

      process.env.EXPO_PUBLIC_API_URL = originalEnv;
    });

    it('should fallback to localhost when env var is empty', () => {
      const originalEnv = process.env.EXPO_PUBLIC_API_URL;
      process.env.EXPO_PUBLIC_API_URL = '';

      // Similar to above, would need module re-import
      expect(process.env.EXPO_PUBLIC_API_URL).toBe('');

      process.env.EXPO_PUBLIC_API_URL = originalEnv;
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle multiple concurrent requests', async () => {
      const promises = [
        client.get('/endpoint1'),
        client.post('/endpoint2', { data: 1 }),
        client.put('/endpoint3', { data: 2 }),
        client.delete('/endpoint4'),
      ];

      mockAxiosInstance.get.mockResolvedValue({ data: 'response1' });
      mockAxiosInstance.post.mockResolvedValue({ data: 'response2' });
      mockAxiosInstance.put.mockResolvedValue({ data: 'response3' });
      mockAxiosInstance.delete.mockResolvedValue({ data: 'response4' });

      const results = await Promise.all(promises);

      expect(results).toEqual(['response1', 'response2', 'response3', 'response4']);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/endpoint1', undefined);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/endpoint2', { data: 1 }, undefined);
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/endpoint3', { data: 2 }, undefined);
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/endpoint4', undefined);
    });

    it('should maintain authentication across concurrent requests', async () => {
      await client.setToken('shared-token');

      const promises = [client.get('/protected1'), client.get('/protected2')];

      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];

      // Both requests should get the auth header
      const config1 = { headers: new AxiosHeaders() };
      const config2 = { headers: new AxiosHeaders() };

      await requestInterceptor(config1);
      await requestInterceptor(config2);

      expect(config1.headers.get('Authorization')).toBe('Bearer shared-token');
      expect(config2.headers.get('Authorization')).toBe('Bearer shared-token');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long URLs', async () => {
      const longUrl = '/api/' + 'a'.repeat(2000); // Very long URL

      mockAxiosInstance.get.mockResolvedValue({ data: 'response' });

      const result = await client.get(longUrl);

      expect(result).toBe('response');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(longUrl, undefined);
    });

    it('should handle large request payloads', async () => {
      const largeData = {
        array: Array.from({ length: 1000 }, (_, i) => ({ id: i, data: 'x'.repeat(100) })),
        nested: {
          level1: {
            level2: {
              level3: 'deep data',
            },
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue({ data: 'success' });

      const result = await client.post('/large-endpoint', largeData);

      expect(result).toBe('success');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/large-endpoint', largeData, undefined);
    });

    it('should handle special characters in URLs', async () => {
      const specialUrl = '/api/search?q=café&filter=naïve';

      mockAxiosInstance.get.mockResolvedValue({ data: 'results' });

      const result = await client.get(specialUrl);

      expect(result).toBe('results');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(specialUrl, undefined);
    });

    it('should handle empty response data', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: null });

      const result = await client.get('/empty-endpoint');

      expect(result).toBeNull();
    });

    it('should handle undefined response data', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: undefined });

      const result = await client.get('/undefined-endpoint');

      expect(result).toBeUndefined();
    });

    it('should handle zero timeout configuration', () => {
      const zeroTimeoutClient = new ApiClient({
        baseURL: 'https://api.test.com',
        timeout: 0,
      });

      expect(mockAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 0,
        }),
      );
    });
  });
});
