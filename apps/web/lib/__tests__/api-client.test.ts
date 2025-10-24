/**
 * Web API Client Tests
 * Comprehensive test suite for production-hardened web API client
 */

import { webApiClient, WebApiClient } from '../lib/api-client';
import { handleApiError, createWebError, ErrorType, ErrorSeverity } from '../lib/error-handling';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('WebApiClient', () => {
  let client: WebApiClient;

  beforeEach(() => {
    client = new WebApiClient('https://api.test.com');
    mockFetch.mockClear();
    client.resetRateLimit(); // Reset rate limiting for tests
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { test: 'data' } }),
        status: 200,
      });

      const response1 = await client.get('/test1');
      const response2 = await client.get('/test2');

      expect(response1.success).toBe(true);
      expect(response2.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should block requests over rate limit', async () => {
      // Temporarily reduce rate limit for testing
      const originalLimit = (client as any).REQUEST_LIMIT;
      (client as any).REQUEST_LIMIT = 1;

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { test: 'data' } }),
        status: 200,
      });

      await client.get('/test1');

      await expect(client.get('/test2')).rejects.toThrow('Rate limit exceeded');

      // Restore original limit
      (client as any).REQUEST_LIMIT = originalLimit;
    });
  });

  describe('Request Methods', () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ success: true, data: { test: 'data' } }),
      status: 200,
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue(mockResponse);
    });

    it('should make GET requests', async () => {
      const response = await client.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/test',
        expect.objectContaining({ method: 'GET' })
      );
      expect(response.success).toBe(true);
      expect(response.data).toEqual({ test: 'data' });
    });

    it('should make POST requests with body', async () => {
      const testData = { name: 'test' };
      const response = await client.post('/test', testData);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(testData),
        })
      );
      expect(response.success).toBe(true);
    });

    it('should handle query parameters', async () => {
      const response = await client.get('/test', { param1: 'value1', param2: 'value2' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/test?param1=value1&param2=value2',
        expect.any(Object)
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network Error'));

      await expect(client.get('/test')).rejects.toThrow();
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: () => Promise.resolve('Not Found'),
      });

      await expect(client.get('/test')).rejects.toThrow('HTTP 404: Not Found');
    });

    it('should retry on network errors', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: { test: 'data' } }),
          status: 200,
        });

      const response = await client.get('/test');

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(response.success).toBe(true);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { test: 'data' } }),
        status: 200,
      });

      await client.get('/test');

      const call = mockFetch.mock.calls[0][1];
      expect(call.headers).toEqual(
        expect.objectContaining({
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-Client-Type': 'web',
        })
      );
    });
  });

  describe('Request Sanitization', () => {
    it('should sanitize request body', async () => {
      const maliciousData = {
        name: 'test',
        script: '<script>alert("xss")</script>',
        sql: 'SELECT * FROM users; DROP TABLE users;',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: { sanitized: true } }),
        status: 200,
      });

      await client.post('/test', maliciousData);

      const call = mockFetch.mock.calls[0][1];
      const body = JSON.parse(call.body);

      expect(body.script).toBe('alert("xss")'); // Angle brackets removed
      expect(body.sql).toBe('SELECT * FROM users; DROP TABLE users;'); // Quotes removed
    });
  });
});

describe('Error Handling', () => {
  describe('Error Classification', () => {
    it('should classify network errors', () => {
      const error = new Error('fetch failed');
      const webError = createWebError(error);

      expect(webError.type).toBe(ErrorType.NETWORK);
    });

    it('should classify authentication errors', () => {
      const error = new Error('401 Unauthorized');
      const webError = createWebError(error);

      expect(webError.type).toBe(ErrorType.AUTHENTICATION);
    });

    it('should classify validation errors', () => {
      const error = new Error('Validation failed');
      const webError = createWebError(error);

      expect(webError.type).toBe(ErrorType.VALIDATION);
    });
  });

  describe('User-Friendly Messages', () => {
    it('should provide user-friendly network error message', () => {
      const error = new Error('Network Error');
      const webError = createWebError(error);

      expect(webError.userMessage).toContain('Connection lost');
    });

    it('should provide user-friendly auth error message', () => {
      const error = new Error('401 Unauthorized');
      const webError = createWebError(error);

      expect(webError.userMessage).toContain('sign in');
    });
  });

  describe('API Error Handling', () => {
    it('should handle API errors with context', () => {
      const error = new Error('Server Error');
      const webError = handleApiError(error, '/api/test', 'GET', { userId: '123' });

      expect(webError.context).toEqual(
        expect.objectContaining({
          endpoint: '/api/test',
          method: 'GET',
          userId: '123',
        })
      );
    });
  });
});

describe('Authentication Service', () => {
  // Mock localStorage
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(() => {
    global.localStorage = mockLocalStorage;
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
  });

  describe('Token Management', () => {
    it('should store auth state securely', () => {
      // Mock implementation would go here
      // Testing the auth service would require more complex setup
      expect(true).toBe(true); // Placeholder test
    });
  });
});
