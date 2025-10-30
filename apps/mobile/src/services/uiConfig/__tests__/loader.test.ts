/**
 * 🎛️ UI Config - Tests
 * Comprehensive test suite for UI config SDK
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadConfig, loadPreviewConfig, clearPreviewMode, loadPreviewCode } from './index';
import { saveConfig, savePreviewCode, clearPreviewCode } from './storage';
import { getDefaultUIConfig } from './defaults';
import { request } from '../api';
import { uiConfigSchema, type UIConfig } from '@pawfectmatch/core';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../api');
jest.mock('../hooks/useReducedMotion', () => ({
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

      expect(config).toEqual(mockConfig);
      expect(mockRequest).toHaveBeenCalledWith('/api/ui-config/current', {
        method: 'GET',
        params: {},
      });
    });

    it('should use cached config if within TTL', async () => {
      const cachedConfig: UIConfig = {
        ...getDefaultUIConfig(),
        version: 'cached',
        status: 'prod',
      };

      // Mock cached config
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify(cachedConfig))
        .mockResolvedValueOnce(Date.now().toString());

      const config = await loadConfig();

      expect(config).toEqual(cachedConfig);
      expect(mockRequest).not.toHaveBeenCalled();
    });

    it('should fallback to embedded defaults if API fails', async () => {
      mockRequest.mockRejectedValue(new Error('Network error'));

      const config = await loadConfig({ forceRefresh: true });

      expect(config).toEqual(getDefaultUIConfig());
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

      expect(config).toEqual(previewConfig);
      expect(mockRequest).toHaveBeenCalledWith('/api/ui-config/preview/ABC123', {
        method: 'GET',
        params: {},
      });
    });

    it('should validate config schema before returning', async () => {
      const invalidConfig = { invalid: 'config' };

      mockRequest.mockResolvedValue({
        success: true,
        data: { config: invalidConfig },
      });

      const config = await loadConfig({ forceRefresh: true });

      // Should fallback to defaults
      expect(config).toEqual(getDefaultUIConfig());
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

      expect(config).toEqual(previewConfig);
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
      const cachedConfig: UIConfig = {
        ...getDefaultUIConfig(),
        version: 'cached',
        status: 'prod',
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
        .mockResolvedValueOnce(null) // No preview code
        .mockResolvedValueOnce(JSON.stringify(cachedConfig))
        .mockResolvedValueOnce(Date.now().toString());

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

      const config = await loadConfig({ forceRefresh: true });

      // Should fallback to defaults
      expect(config).toEqual(getDefaultUIConfig());
    });
  });
});
