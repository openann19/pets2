/**
 * Comprehensive tests for Storage Service
 *
 * Coverage:
 * - AsyncStorage integration
 * - JSON serialization
 * - Error handling
 * - Type safety
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { readJSON, writeJSON } from '../storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Storage Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path - readJSON', () => {
    it('should read and parse valid JSON', async () => {
      const mockData = { name: 'test', count: 42 };
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockData));

      const result = await readJSON('test_key', {});

      expect(result).toEqual(mockData);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('test_key');
    });

    it('should return fallback for missing key', async () => {
      const fallback = { default: true };
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await readJSON('missing_key', fallback);

      expect(result).toEqual(fallback);
    });

    it('should return fallback for null value', async () => {
      const fallback = { default: true };
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await readJSON('null_key', fallback);

      expect(result).toEqual(fallback);
    });

    it('should handle complex nested objects', async () => {
      const complexData = {
        user: { id: '123', profile: { name: 'John', age: 30 } },
        pets: [
          { id: '1', name: 'Fluffy' },
          { id: '2', name: 'Max' },
        ],
        settings: { notifications: true, theme: 'dark' },
      };
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(complexData));

      const result = await readJSON('complex_key', {});

      expect(result).toEqual(complexData);
      expect(result.user.profile.name).toBe('John');
      expect(result.pets).toHaveLength(2);
    });

    it('should handle arrays correctly', async () => {
      const arrayData = [1, 2, 3, { nested: 'value' }];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(arrayData));

      const result = await readJSON('array_key', []);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(4);
      expect(result[3].nested).toBe('value');
    });

    it('should handle primitive types', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(123));
      const result = await readJSON('number_key', 0);
      expect(result).toBe(123);

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify('string'));
      const strResult = await readJSON('string_key', '');
      expect(strResult).toBe('string');

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(true));
      const boolResult = await readJSON('bool_key', false);
      expect(boolResult).toBe(true);
    });
  });

  describe('Happy Path - writeJSON', () => {
    it('should write simple object to storage', async () => {
      mockAsyncStorage.setItem.mockResolvedValueOnce();

      const data = { name: 'test', count: 42 };
      await writeJSON('test_key', data);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('test_key', JSON.stringify(data));
    });

    it('should write complex nested object', async () => {
      mockAsyncStorage.setItem.mockResolvedValueOnce();

      const complexData = {
        user: { id: '123', profile: { name: 'John' } },
        pets: [{ id: '1', name: 'Fluffy' }],
      };
      await writeJSON('complex_key', complexData);

      const callArgs = mockAsyncStorage.setItem.mock.calls[0];
      expect(callArgs[0]).toBe('complex_key');
      expect(JSON.parse(callArgs[1] as string)).toEqual(complexData);
    });

    it('should write arrays to storage', async () => {
      mockAsyncStorage.setItem.mockResolvedValueOnce();

      const arrayData = [1, 2, 3, 'test'];
      await writeJSON('array_key', arrayData);

      const callArgs = mockAsyncStorage.setItem.mock.calls[0];
      expect(JSON.parse(callArgs[1] as string)).toEqual(arrayData);
    });

    it('should handle null and undefined values', async () => {
      mockAsyncStorage.setItem.mockResolvedValueOnce();

      await writeJSON('null_key', null);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('null_key', 'null');
    });

    it('should handle primitive types', async () => {
      mockAsyncStorage.setItem.mockResolvedValueOnce();
      await writeJSON('number_key', 123);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('number_key', '123');

      mockAsyncStorage.setItem.mockResolvedValueOnce();
      await writeJSON('string_key', 'test');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('string_key', '"test"');

      mockAsyncStorage.setItem.mockResolvedValueOnce();
      await writeJSON('bool_key', true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('bool_key', 'true');
    });
  });

  describe('Error Handling', () => {
    it('should return fallback on JSON parse error', async () => {
      const fallback = { default: true };
      mockAsyncStorage.getItem.mockResolvedValueOnce('invalid json {');

      const result = await readJSON('invalid_key', fallback);

      expect(result).toEqual(fallback);
    });

    it('should return fallback on storage read error', async () => {
      const fallback = { default: true };
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Read failed'));

      const result = await readJSON('error_key', fallback);

      expect(result).toEqual(fallback);
    });

    it('should handle write errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Write failed'));

      await expect(writeJSON('error_key', { data: 'test' })).rejects.toThrow('Write failed');
    });

    it('should handle circular references in writeJSON', async () => {
      const circularData: Record<string, unknown> = { name: 'test' };
      circularData.self = circularData;

      await expect(writeJSON('circular_key', circularData)).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('');

      const result = await readJSON('empty_key', { default: true });

      expect(result).toEqual({ default: true });
    });

    it('should handle very large objects', async () => {
      const largeData = { data: 'x'.repeat(10000) };
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(largeData));

      const result = await readJSON('large_key', {});

      expect(result.data.length).toBe(10000);
    });

    it('should handle empty objects', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({}));

      const result = await readJSON('empty_obj_key', { default: true });

      expect(result).toEqual({});
    });

    it('should handle special characters in keys', async () => {
      const data = { special: 'value with "quotes" and \n newlines' };
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(data));

      const result = await readJSON('special_chars_key', {});

      expect(result.special).toBe('value with "quotes" and \n newlines');
    });

    it('should handle unicode characters', async () => {
      const data = { unicode: 'Hello 世界 🌍' };
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(data));

      const result = await readJSON('unicode_key', {});

      expect(result.unicode).toBe('Hello 世界 🌍');
    });

    it('should handle dates', async () => {
      const data = { date: new Date().toISOString(), timestamp: Date.now() };
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(data));

      const result = await readJSON('date_key', {});

      expect(result.date).toBeDefined();
      expect(typeof result.timestamp).toBe('number');
    });
  });

  describe('Integration', () => {
    it('should read and write data correctly', async () => {
      const data = { name: 'test', version: '1.0' };

      mockAsyncStorage.setItem.mockResolvedValueOnce();
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(data));

      await writeJSON('integration_key', data);
      const result = await readJSON('integration_key', {});

      expect(result).toEqual(data);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'integration_key',
        JSON.stringify(data),
      );
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('integration_key');
    });

    it('should handle multiple keys correctly', async () => {
      const data1 = { key1: 'value1' };
      const data2 = { key2: 'value2' };

      mockAsyncStorage.setItem.mockResolvedValue();
      mockAsyncStorage.getItem.mockImplementation((key: string) => {
        if (key === 'multi_key1') return Promise.resolve(JSON.stringify(data1));
        if (key === 'multi_key2') return Promise.resolve(JSON.stringify(data2));
        return Promise.resolve(null);
      });

      await writeJSON('multi_key1', data1);
      await writeJSON('multi_key2', data2);

      const result1 = await readJSON('multi_key1', {});
      const result2 = await readJSON('multi_key2', {});

      expect(result1).toEqual(data1);
      expect(result2).toEqual(data2);
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety for readJSON', async () => {
      interface TestType {
        name: string;
        age: number;
      }

      const mockData: TestType = { name: 'John', age: 30 };
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockData));

      const result = await readJSON<TestType>('typed_key', { name: '', age: 0 });

      expect(typeof result.name).toBe('string');
      expect(typeof result.age).toBe('number');
    });

    it('should maintain type safety for writeJSON', async () => {
      interface TestType {
        id: string;
        value: number;
      }

      const data: TestType = { id: '123', value: 42 };
      mockAsyncStorage.setItem.mockResolvedValueOnce();

      await writeJSON('typed_write_key', data);

      const callArgs = mockAsyncStorage.setItem.mock.calls[0];
      const written = JSON.parse(callArgs[1] as string);

      expect(typeof written.id).toBe('string');
      expect(typeof written.value).toBe('number');
    });
  });
});
