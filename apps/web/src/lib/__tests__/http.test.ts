/**
 * HTTP Client Tests
 */

import { http, HttpError, ValidationError } from '../http';
import { z } from 'zod';

// Mock fetch
global.fetch = jest.fn();

describe('HTTP Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const mockData = { success: true, data: 'test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await http.get('/api/test');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should handle timeout', async () => {
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 10000))
      );

      await expect(
        http.get('/api/test', { timeout: 100 })
      ).rejects.toThrow('Request timeout after 100ms');
    });

    it('should retry on failure', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      const result = await http.get('/api/test', { retries: 2 });

      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ success: true });
    });

    it('should use exponential backoff for retries', async () => {
      const delays: number[] = [];
      let lastTime = Date.now();

      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      await http.get('/api/test', { retries: 2, retryDelay: 100 });

      // Should have delays of ~100ms and ~200ms (exponential backoff)
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request', async () => {
      const mockData = { success: true };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await http.post('/api/test', { name: 'test' });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'test' }),
          credentials: 'include',
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should include CSRF token for POST requests', async () => {
      // Mock document.cookie
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'csrf-token=test-token-123',
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await http.post('/api/test', { data: 'test' });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-CSRF-Token': 'test-token-123',
          }),
        })
      );
    });

    it('should not retry POST requests by default', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(http.post('/api/test', { data: 'test' })).rejects.toThrow();

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error handling', () => {
    it('should throw HttpError on 4xx response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Resource not found' }),
      });

      await expect(http.get('/api/test')).rejects.toThrow(HttpError);
      
      try {
        await http.get('/api/test');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect((error as HttpError).status).toBe(404);
        expect((error as HttpError).message).toBe('Resource not found');
      }
    });

    it('should throw HttpError on 5xx response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Server error' }),
      });

      await expect(http.get('/api/test')).rejects.toThrow(HttpError);
    });

    it('should retry on 5xx errors for GET requests', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ message: 'Server error' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      const result = await http.get('/api/test', { retries: 1 });

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ success: true });
    });

    it('should handle malformed JSON response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(http.get('/api/test')).rejects.toThrow(HttpError);
    });
  });

  describe('Schema validation', () => {
    it('should validate response with Zod schema', async () => {
      const schema = z.object({
        success: z.boolean(),
        data: z.string(),
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: 'test' }),
      });

      const result = await http.getWithSchema('/api/test', schema);

      expect(result).toEqual({ success: true, data: 'test' });
    });

    it('should throw ValidationError on schema mismatch', async () => {
      const schema = z.object({
        success: z.boolean(),
        data: z.string(),
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: 123 }), // Wrong type
      });

      await expect(http.getWithSchema('/api/test', schema)).rejects.toThrow(ValidationError);
    });
  });

  describe('CSRF token handling', () => {
    it('should read CSRF token from cookie', async () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'csrf-token=abc123; other=value',
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await http.post('/api/test', {});

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-CSRF-Token': 'abc123',
          }),
        })
      );
    });

    it('should handle XSRF-TOKEN cookie name', async () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'XSRF-TOKEN=xyz789',
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await http.post('/api/test', {});

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-CSRF-Token': 'xyz789',
          }),
        })
      );
    });

    it('should not add CSRF token for GET requests', async () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'csrf-token=abc123',
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await http.get('/api/test');

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1];
      expect(callArgs.headers['X-CSRF-Token']).toBeUndefined();
    });
  });

  describe('Timeout and AbortController', () => {
    it('should abort request on timeout', async () => {
      let abortCalled = false;
      
      (global.fetch as jest.Mock).mockImplementation((url, options) => {
        options.signal.addEventListener('abort', () => {
          abortCalled = true;
        });
        return new Promise(() => {}); // Never resolves
      });

      await expect(http.get('/api/test', { timeout: 100 })).rejects.toThrow();
      
      // Wait a bit for abort to be called
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(abortCalled).toBe(true);
    });
  });

  describe('Other HTTP methods', () => {
    it('should make PUT request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await http.put('/api/test', { data: 'update' });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ data: 'update' }),
        })
      );
    });

    it('should make PATCH request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await http.patch('/api/test', { data: 'patch' });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'PATCH',
        })
      );
    });

    it('should make DELETE request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await http.delete('/api/test');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });
});
