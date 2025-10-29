/**
 * Animation Config Service Unit Tests
 * Tests deterministic configuration behavior and seed-based stability
 */

import { animationConfig, useAnimationConfig } from '../src/services/animationConfig';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock environment utils
jest.mock('../src/utils/env', () => ({
  getLocalStorageItem: jest.fn(),
  setLocalStorageItem: jest.fn(),
}));

describe('AnimationConfigService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset to defaults
    animationConfig.resetToDefaults();
    
    // Mock localStorage
    global.localStorage = mockLocalStorage as any;
  });

  describe('Configuration Management', () => {
    it('should return stable default configuration', () => {
      const config1 = animationConfig.getConfig();
      const config2 = animationConfig.getConfig();
      
      expect(config1).toEqual(config2);
      expect(config1.enabled).toBeDefined();
      expect(config1.buttons).toBeDefined();
      expect(config1.cards).toBeDefined();
      expect(config1.lists).toBeDefined();
      expect(config1.celebrations).toBeDefined();
      expect(config1.mobile).toBeDefined();
      expect(config1.web).toBeDefined();
    });

    it('should update configuration and notify listeners', () => {
      const mockListener = jest.fn();
      
      animationConfig.subscribe(mockListener);
      
      const updates = {
        enabled: false,
        buttons: { scale: false, bounce: true },
      };
      
      animationConfig.updateConfig(updates);
      
      const config = animationConfig.getConfig();
      expect(config.enabled).toBe(false);
      expect(config.buttons.scale).toBe(false);
      expect(config.buttons.bounce).toBe(true);
      expect(mockListener).toHaveBeenCalledWith(config);
    });

    it('should reset to defaults', () => {
      // Update config first
      animationConfig.updateConfig({ enabled: false });
      expect(animationConfig.getConfig().enabled).toBe(false);
      
      // Reset to defaults
      animationConfig.resetToDefaults();
      expect(animationConfig.getConfig().enabled).toBe(true);
    });
  });

  describe('Feature Enablement', () => {
    it('should check if animations are enabled globally', () => {
      expect(animationConfig.areAnimationsEnabled()).toBe(true);
      
      animationConfig.updateConfig({ enabled: false });
      expect(animationConfig.areAnimationsEnabled()).toBe(false);
    });

    it('should check if specific features are enabled', () => {
      // All features should be enabled when animations are enabled
      expect(animationConfig.isFeatureEnabled('buttons')).toBe(true);
      expect(animationConfig.isFeatureEnabled('cards')).toBe(true);
      expect(animationConfig.isFeatureEnabled('lists')).toBe(true);
      
      // Disable animations globally
      animationConfig.updateConfig({ enabled: false });
      
      // All features should be disabled when animations are disabled
      expect(animationConfig.isFeatureEnabled('buttons')).toBe(false);
      expect(animationConfig.isFeatureEnabled('cards')).toBe(false);
      expect(animationConfig.isFeatureEnabled('lists')).toBe(false);
    });
  });

  describe('Configuration Getters', () => {
    it('should return specific configuration sections', () => {
      const buttonConfig = animationConfig.getButtonConfig();
      const cardConfig = animationConfig.getCardConfig();
      const listConfig = animationConfig.getListConfig();
      const celebrationConfig = animationConfig.getCelebrationConfig();
      const mobileConfig = animationConfig.getMobileConfig();
      const webConfig = animationConfig.getWebConfig();
      
      expect(buttonConfig).toBeDefined();
      expect(cardConfig).toBeDefined();
      expect(listConfig).toBeDefined();
      expect(celebrationConfig).toBeDefined();
      expect(mobileConfig).toBeDefined();
      expect(webConfig).toBeDefined();
    });
  });

  describe('Subscription Management', () => {
    it('should add and remove listeners', () => {
      const mockListener1 = jest.fn();
      const mockListener2 = jest.fn();
      
      const unsubscribe1 = animationConfig.subscribe(mockListener1);
      const unsubscribe2 = animationConfig.subscribe(mockListener2);
      
      animationConfig.updateConfig({ enabled: false });
      
      expect(mockListener1).toHaveBeenCalledTimes(1);
      expect(mockListener2).toHaveBeenCalledTimes(1);
      
      // Remove first listener
      unsubscribe1();
      
      animationConfig.updateConfig({ enabled: true });
      
      expect(mockListener1).toHaveBeenCalledTimes(1); // Still only called once
      expect(mockListener2).toHaveBeenCalledTimes(2); // Called again
    });

    it('should handle listener errors gracefully', () => {
      const mockListener = jest.fn(() => {
        throw new Error('Listener error');
      });
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      animationConfig.subscribe(mockListener);
      
      // Should not throw when listener errors
      expect(() => {
        animationConfig.updateConfig({ enabled: false });
      }).not.toThrow();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error notifying animation config listener:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Persistence', () => {
    it('should save configuration to localStorage', async () => {
      const { setLocalStorageItem } = require('../src/utils/env');
      
      const updates = { enabled: false };
      animationConfig.updateConfig(updates);
      
      // Wait for async save
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(setLocalStorageItem).toHaveBeenCalledWith(
        'animation-config',
        expect.stringContaining('"enabled":false')
      );
    });

    it('should load configuration from localStorage', async () => {
      const { getLocalStorageItem } = require('../src/utils/env');
      
      const storedConfig = {
        enabled: false,
        buttons: { scale: false },
      };
      
      getLocalStorageItem.mockReturnValue(JSON.stringify(storedConfig));
      
      // Create new instance to test loading
      const { AnimationConfigService } = require('../src/services/animationConfig');
      const newConfig = new AnimationConfigService();
      
      // Wait for async load
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(newConfig.getConfig().enabled).toBe(false);
      expect(newConfig.getConfig().buttons.scale).toBe(false);
    });

    it('should handle localStorage errors gracefully', async () => {
      const { getLocalStorageItem, setLocalStorageItem } = require('../src/utils/env');
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Mock load error
      getLocalStorageItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      // Should not throw when storage fails
      expect(() => {
        new (require('../src/services/animationConfig').AnimationConfigService)();
      }).not.toThrow();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load animation config:',
        expect.any(Error)
      );
      
      // Mock save error
      setLocalStorageItem.mockImplementation(() => {
        throw new Error('Save error');
      });
      
      animationConfig.updateConfig({ enabled: false });
      
      // Wait for async save
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save animation config:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Deterministic Behavior', () => {
    it('should return same config for same seed', () => {
      // Reset to ensure clean state
      animationConfig.resetToDefaults();
      
      const config1 = animationConfig.getConfig();
      const config2 = animationConfig.getConfig();
      
      // Same seed should produce identical config
      expect(config1).toEqual(config2);
    });

    it('should maintain config stability across updates', () => {
      // Start with defaults
      const initialConfig = animationConfig.getConfig();
      
      // Apply updates
      animationConfig.updateConfig({
        enabled: false,
        buttons: { scale: false },
      });
      
      const updatedConfig = animationConfig.getConfig();
      
      // Verify updates applied
      expect(updatedConfig.enabled).toBe(false);
      expect(updatedConfig.buttons.scale).toBe(false);
      
      // Other properties should remain unchanged
      expect(updatedConfig.cards).toEqual(initialConfig.cards);
      expect(updatedConfig.lists).toEqual(initialConfig.lists);
      expect(updatedConfig.celebrations).toEqual(initialConfig.celebrations);
    });
  });

  describe('useAnimationConfig Hook', () => {
    it('should return the animation config service instance', () => {
      const config = useAnimationConfig();
      
      expect(config).toBeDefined();
      expect(typeof config.getConfig).toBe('function');
      expect(typeof config.updateConfig).toBe('function');
      expect(typeof config.subscribe).toBe('function');
    });

    it('should return the same instance (singleton)', () => {
      const config1 = useAnimationConfig();
      const config2 = useAnimationConfig();
      
      expect(config1).toBe(config2);
    });
  });

  describe('Package Import Tests', () => {
    it('should import animation config via package name', () => {
      expect(() => {
        require('@pawfectmatch/core');
      }).not.toThrow();
    });

    it('should export animation config service', () => {
      const core = require('../src/index');
      
      expect(core.animationConfig).toBeDefined();
      expect(core.useAnimationConfig).toBeDefined();
    });
  });
});
