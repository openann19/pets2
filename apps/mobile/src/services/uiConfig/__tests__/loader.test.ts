/**
 * 🎛️ UI Config - Tests
 * Comprehensive test suite for UI config SDK
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadConfig, loadPreviewConfig, clearPreviewMode } from '../loader';
import { getDefaultUIConfig } from '../defaults';
import { request } from '../../api';
import { type UIConfig } from '@pawfectmatch/core';

jest.mock('@pawfectmatch/core', () => {
  const actual = jest.requireActual('@pawfectmatch/core');
  const parseMock = jest.fn((value) => value);
  return {
    ...actual,
    logger: {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
    uiConfigSchema: {
      parse: parseMock,
    },
  };
});
const mockedCore = jest.requireMock('@pawfectmatch/core') as {
  uiConfigSchema: { parse: jest.Mock };
};
const parseMock = mockedCore.uiConfigSchema.parse;

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../api');
jest.mock('../../../hooks/useReducedMotion', () => ({
  useReduceMotion: jest.fn(() => false),
}));
jest.mock('../utils/motionGuards', () => ({
  isLowEndDevice: jest.fn(() => false),
}));

const mockRequest = request as jest.MockedFunction<typeof request>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('UI Config SDK', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    parseMock.mockImplementation((value: unknown) => value as UIConfig);
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
    mockAsyncStorage.removeItem.mockResolvedValue();
  });

  describe('loadConfig', () => {
    it('should load config from API on first call', async () => {
      const mockConfig: UIConfig = {
        ...getDefaultUIConfig(),
        version: '1.0.0',
        status: 'prod',
      };

      mockRequest.mockResolvedValue({
        success: true,
        data: { config: mockConfig },
      });

      const config = await loadConfig({ forceRefresh: true });

      expect(mockRequest).toHaveBeenCalledWith('/api/ui-config/current', {
        method: 'GET',
        params: {},
      });
      expect(parseMock).toHaveBeenCalled();
      const parseResult = parseMock.mock.results[0];
      if (parseResult?.type === 'throw') {
        throw parseResult.value;
      }
      expect(parseResult?.value).toEqual(expect.objectContaining({ version: mockConfig.version }));
      expect(config.version).toBe(mockConfig.version);
      expect(config.status).toBe(mockConfig.status);
      expect(config.tokens.colors['primary']).toBe(mockConfig.tokens.colors['primary']);
    });

    it('should use cached config if within TTL', async () => {
      const cachedConfig: UIConfig = {
        ...getDefaultUIConfig(),
        version: 'cached',
        status: 'prod',
      };

      // Mock cached config
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(null) // preview code
        .mockResolvedValueOnce(Date.now().toString())
        .mockResolvedValueOnce(JSON.stringify(cachedConfig));

      const config = await loadConfig();

      expect(config).toEqual(cachedConfig);
      expect(mockRequest).not.toHaveBeenCalled();
    });

    it('should fallback to embedded defaults if API fails', async () => {
      mockRequest.mockRejectedValue(new Error('Network error'));

      const config = await loadConfig({ forceRefresh: true });

      const defaultConfig = getDefaultUIConfig();
      expect(config).toMatchObject({
        version: defaultConfig.version,
        status: defaultConfig.status,
      });
    });

    it('should load preview config when preview code is set', async () => {
      const previewConfig: UIConfig = {
        ...getDefaultUIConfig(),
        version: 'preview-1',
        status: 'preview',
      };

      mockAsyncStorage.getItem.mockResolvedValueOnce('ABC123');
      mockRequest.mockResolvedValue({
        success: true,
        data: { config: previewConfig },
      });

      const config = await loadConfig();

      expect(config.version).toBe(previewConfig.version);
      expect(config.status).toBe(previewConfig.status);
      expect(mockRequest).toHaveBeenCalledWith('/api/ui-config/preview/ABC123', {
        method: 'GET',
        params: {},
      });
      expect(parseMock).toHaveReturnedWith(expect.objectContaining({ version: previewConfig.version }));
    });

    it('should validate config schema before returning', async () => {
      const invalidConfig = { invalid: 'config' };

      mockRequest.mockResolvedValue({
        success: true,
        data: { config: invalidConfig },
      });

      parseMock.mockImplementationOnce(() => {
        throw new Error('invalid config');
      });

      const config = await loadConfig({ forceRefresh: true });

      const defaultConfig = getDefaultUIConfig();
      expect(config).toMatchObject({
        version: defaultConfig.version,
        status: defaultConfig.status,
      });
    });
  });

  describe('loadPreviewConfig', () => {
    it('should fetch and save preview config', async () => {
      const previewConfig: UIConfig = {
        ...getDefaultUIConfig(),
        version: 'preview-1',
        status: 'preview',
      };

      mockRequest.mockResolvedValue({
        success: true,
        data: { config: previewConfig },
      });

  const config = await loadPreviewConfig('ABC123');

  expect(config?.version).toBe(previewConfig.version);
  expect(config?.status).toBe(previewConfig.status);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@ui_config:preview_code', 'ABC123');
    });

    it('should return null if preview code is invalid', async () => {
      mockRequest.mockResolvedValue({
        success: false,
      });

      const config = await loadPreviewConfig('INVALID');

      expect(config).toBeNull();
    });
  });

  describe('clearPreviewMode', () => {
    it('should clear preview code from storage', async () => {
      await clearPreviewMode();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@ui_config:preview_code');
    });
  });

  describe('fallback chain', () => {
    it('should follow correct fallback order: preview → API → cache → defaults', async () => {
      const previewConfig: UIConfig = {
        ...getDefaultUIConfig(),
        version: 'preview',
        status: 'preview',
      };
      // Preview code exists
      mockAsyncStorage.getItem.mockResolvedValueOnce('ABC123');
      mockRequest.mockResolvedValue({
        success: true,
        data: { config: previewConfig },
      });

      const config = await loadConfig();

      expect(config.version).toBe('preview');
    });

    it('should use cached config if API fails but cache exists', async () => {
      const cachedConfig: UIConfig = {
        ...getDefaultUIConfig(),
        version: 'cached',
        status: 'prod',
      };

      mockRequest.mockRejectedValue(new Error('Network error'));
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(null) // preview code
        .mockResolvedValueOnce(Date.now().toString())
        .mockResolvedValueOnce(JSON.stringify(cachedConfig));

      const config = await loadConfig({ forceRefresh: true });

      expect(config.version).toBe('cached');
    });
  });

  describe('validation', () => {
    it('should reject configs that fail schema validation', async () => {
      const invalidConfig = {
        version: '1.0.0',
        status: 'prod',
        // Missing required fields
      };

      mockRequest.mockResolvedValue({
        success: true,
        data: { config: invalidConfig },
      });

      parseMock.mockImplementationOnce(() => {
        throw new Error('invalid config');
      });

      const config = await loadConfig({ forceRefresh: true });

      const defaultConfig = getDefaultUIConfig();
      expect(config).toMatchObject({
        version: defaultConfig.version,
        status: defaultConfig.status,
      });
    });
  });
});
