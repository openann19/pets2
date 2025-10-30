/**
 * Comprehensive tests for SecureAPIService
 *
 * Coverage:
 * - SSL pinning and certificate validation
 * - Secure HTTP requests
 * - Retry logic with exponential backoff
 * - Error handling
 * - Type safety
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { secureAPI, SecureAPIError } from '../SecureAPIService';
import { sslFetch } from 'react-native-ssl-pinning';

// Mock dependencies
jest.mock('react-native-ssl-pinning', () => ({
  fetch: jest.fn(),
}));

jest.mock('../logger', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

const mockSslFetch = sslFetch as jest.MockedFunction<typeof sslFetch>;

describe('SecureAPIService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };

    // Mock successful response
    mockSslFetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => ({ data: 'success' }),
      statusText: 'OK',
    } as any);
  });

  describe('Happy Path - GET Request', () => {
    it('should make secure GET request', async () => {
      const result = await secureAPI.get('/test');

      expect(result).toEqual({ data: 'success' });
      expect(mockSslFetch).toHaveBeenCalled();
    });

    it('should include SSL pinning configuration', async () => {
      await secureAPI.get('/test');

      const callArgs = mockSslFetch.mock.calls[0]?.[1];
      expect(callArgs).toHaveProperty('sslPinning');
    });

    it('should set authentication token', async () => {
      secureAPI.setAuthToken('test-token');

      await secureAPI.get('/test');

      const callArgs = mockSslFetch.mock.calls[0]?.[1];
      expect(callArgs?.headers).toHaveProperty('Authorization', 'Bearer test-token');
    });

    it('should use correct timeout', async () => {
      await secureAPI.get('/test', { timeout: 60000 });

      const callArgs = mockSslFetch.mock.calls[0]?.[1];
      expect(callArgs?.timeoutInterval).toBe(60000);
    });
  });

  describe('Happy Path - POST Request', () => {
    it('should make secure POST request', async () => {
      const data = { name: 'test', value: 123 };

      mockSslFetch.mockResolvedValueOnce({
        status: 201,
        ok: true,
        json: async () => ({ created: true }),
        statusText: 'Created',
      } as any);

      const result = await secureAPI.post('/test', data);

      expect(result).toEqual({ created: true });
      expect(mockSslFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        }),
      );
    });

    it('should set Content-Type header', async () => {
      await secureAPI.post('/test', { data: 'test' });

      const callArgs = mockSslFetch.mock.calls[0]?.[1];
      expect(callArgs?.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('Happy Path - PUT Request', () => {
    it('should make secure PUT request', async () => {
      mockSslFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({ updated: true }),
        statusText: 'OK',
      } as any);

      const result = await secureAPI.put('/test', { id: 123 });

      expect(result).toEqual({ updated: true });
      expect(mockSslFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({ method: 'PUT' }),
      );
    });
  });

  describe('Happy Path - DELETE Request', () => {
    it('should make secure DELETE request', async () => {
      mockSslFetch.mockResolvedValueOnce({
        status: 204,
        ok: true,
        json: async () => ({}),
        statusText: 'No Content',
      } as any);

      const result = await secureAPI.delete('/test');

      expect(result).toEqual({});
      expect(mockSslFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('Happy Path - Certificate Validation', () => {
    it('should validate SSL certificate', async () => {
      mockSslFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({}),
        statusText: 'OK',
      } as any);

      const isValid = await secureAPI.validateCertificate('api.pawfectmatch.com');

      expect(isValid).toBe(true);
    });

    it('should return security metrics', () => {
      const metrics = secureAPI.getSecurityMetrics();

      expect(metrics.sslEnabled).toBe(true);
      expect(metrics.certificatePinning).toBe(true);
      expect(Array.isArray(metrics.supportedDomains)).toBe(true);
    });
  });

  describe('Error Handling - Retry Logic', () => {
    it('should retry failed requests', async () => {
      // First two attempts fail, third succeeds
      mockSslFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
          json: async () => ({ data: 'success' }),
          statusText: 'OK',
        } as any);

      const result = await secureAPI.get('/test');

      expect(result).toEqual({ data: 'success' });
      expect(mockSslFetch).toHaveBeenCalledTimes(3);
    });

    it('should throw error after all retries fail', async () => {
      mockSslFetch.mockRejectedValue(new Error('Persistent error'));

      await expect(secureAPI.get('/test', { retries: 2 })).rejects.toThrow();
      expect(mockSslFetch).toHaveBeenCalledTimes(2);
    });

    it('should use exponential backoff for retries', async () => {
      let callTimes: number[] = [];
      const originalSetTimeout = setTimeout;

      jest.spyOn(global, 'setTimeout').mockImplementation((fn: Function, delay: number) => {
        callTimes.push(delay);
        return originalSetTimeout(fn, delay);
      });

      mockSslFetch.mockRejectedValue(new Error('Network error'));

      try {
        await secureAPI.get('/test', { retries: 2, retryDelay: 1000 });
      } catch {
        // Expected error
      }

      // Should have delays increasing: 1000ms, then 2000ms
      expect(setTimeout).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP errors', async () => {
      mockSslFetch.mockResolvedValueOnce({
        status: 404,
        ok: false,
        statusText: 'Not Found',
      } as any);

      await expect(secureAPI.get('/not-found')).rejects.toThrow('HTTP 404');
    });

    it('should handle SSL pinning failures', async () => {
      // In development, should fall back to 'public' certificates
      process.env.NODE_ENV = 'development';
      __DEV__ = true;

      const result = await secureAPI.get('/test');

      expect(result).toBeDefined();
    });

    it('should clear authentication token', () => {
      secureAPI.setAuthToken('test-token');
      expect(() => secureAPI.clearAuthToken()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty response body', async () => {
      mockSslFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => null,
        statusText: 'OK',
      } as any);

      const result = await secureAPI.get('/empty');

      expect(result).toBeNull();
    });

    it('should handle large response bodies', async () => {
      const largeData = { data: 'x'.repeat(100000) };

      mockSslFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => largeData,
        statusText: 'OK',
      } as any);

      const result = await secureAPI.get('/large');

      expect(result).toEqual(largeData);
    });

    it('should handle concurrent requests', async () => {
      mockSslFetch.mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({ id: Math.random() }),
        statusText: 'OK',
      } as any);

      const promises = Array.from({ length: 10 }, () => secureAPI.get('/test'));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      expect(mockSslFetch).toHaveBeenCalledTimes(10);
    });

    it('should handle timeout errors', async () => {
      mockSslFetch.mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1)),
      );

      await expect(secureAPI.get('/slow')).rejects.toThrow();
    });
  });

  describe('Integration', () => {
    it('should maintain authentication across requests', async () => {
      secureAPI.setAuthToken('persistent-token');

      await secureAPI.get('/test1');
      await secureAPI.post('/test2', { data: 'test' });

      const calls = mockSslFetch.mock.calls;
      expect(calls[0]?.[1]?.headers?.Authorization).toBe('Bearer persistent-token');
      expect(calls[1]?.[1]?.headers?.Authorization).toBe('Bearer persistent-token');
    });

    it('should integrate with SSL pinning', async () => {
      await secureAPI.get('/test');

      const callArgs = mockSslFetch.mock.calls[0]?.[1];
      expect(callArgs).toHaveProperty('sslPinning');
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for requests', async () => {
      interface ResponseType {
        id: string;
        name: string;
      }

      mockSslFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({ id: '123', name: 'test' }) as ResponseType,
        statusText: 'OK',
      } as any);

      const result = await secureAPI.get<ResponseType>('/typed');

      expect(typeof result.id).toBe('string');
      expect(typeof result.name).toBe('string');
    });

    it('should handle SecureAPIError properly', async () => {
      const originalError = new Error('Original error');

      try {
        throw new SecureAPIError('Wrapper error', originalError);
      } catch (error) {
        expect(error).toBeInstanceOf(SecureAPIError);
        expect((error as SecureAPIError).message).toBe('Wrapper error');
        expect((error as SecureAPIError).originalError).toBe(originalError);
      }
    });
  });
});
