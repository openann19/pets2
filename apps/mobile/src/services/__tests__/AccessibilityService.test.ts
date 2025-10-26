/**
 * Comprehensive tests for AccessibilityService
 *
 * Coverage:
 * - Singleton pattern and initialization
 * - Accessibility configuration management
 * - Screen reader, bold text, reduce motion detection
 * - Event listeners and change notifications
 * - Accessibility announcements and focus
 * - Text size multipliers and color schemes
 * - Touch target size requirements
 * - Error handling and edge cases
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { AccessibilityInfo, Platform } from 'react-native';
import { accessibilityService, AccessibilityService } from '../AccessibilityService';

// Mock React Native AccessibilityInfo
jest.mock('react-native', () => ({
  AccessibilityInfo: {
    isScreenReaderEnabled: jest.fn(),
    isBoldTextEnabled: jest.fn(),
    isGrayscaleEnabled: jest.fn(),
    isInvertColorsEnabled: jest.fn(),
    isReduceMotionEnabled: jest.fn(),
    isReduceTransparencyEnabled: jest.fn(),
    announceForAccessibility: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
}));

// Mock logger
jest.mock('../logger', () => ({
  logger: {
    warn: jest.fn(),
  },
}));

const mockAccessibilityInfo = AccessibilityInfo as jest.Mocked<typeof AccessibilityInfo>;

describe('AccessibilityService', () => {
  let mockListeners: { [key: string]: jest.Mock } = {};

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset singleton instance
    (AccessibilityService as any).instance = undefined;

    // Setup default mock returns
    mockAccessibilityInfo.isScreenReaderEnabled.mockResolvedValue(false);
    mockAccessibilityInfo.isBoldTextEnabled.mockResolvedValue(false);
    mockAccessibilityInfo.isGrayscaleEnabled.mockResolvedValue(false);
    mockAccessibilityInfo.isInvertColorsEnabled.mockResolvedValue(false);
    mockAccessibilityInfo.isReduceMotionEnabled.mockResolvedValue(false);
    mockAccessibilityInfo.isReduceTransparencyEnabled.mockResolvedValue(false);

    // Mock addEventListener to capture listeners
    mockAccessibilityInfo.addEventListener.mockImplementation((event, listener) => {
      mockListeners[event] = listener;
      return { remove: jest.fn() };
    });
  });

  afterEach(() => {
    mockListeners = {};
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AccessibilityService.getInstance();
      const instance2 = AccessibilityService.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBe(accessibilityService);
    });

    it('should initialize accessibility on first getInstance call', async () => {
      const service = AccessibilityService.getInstance();

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockAccessibilityInfo.isScreenReaderEnabled).toHaveBeenCalled();
      expect(mockAccessibilityInfo.isBoldTextEnabled).toHaveBeenCalled();
      expect(mockAccessibilityInfo.isGrayscaleEnabled).toHaveBeenCalled();
      expect(mockAccessibilityInfo.isInvertColorsEnabled).toHaveBeenCalled();
      expect(mockAccessibilityInfo.isReduceMotionEnabled).toHaveBeenCalled();
      expect(mockAccessibilityInfo.isReduceTransparencyEnabled).toHaveBeenCalled();
    });
  });

  describe('Initialization', () => {
    it('should initialize with default config when accessibility checks fail', async () => {
      mockAccessibilityInfo.isScreenReaderEnabled.mockRejectedValue(new Error('Failed'));

      const service = AccessibilityService.getInstance();
      await new Promise(resolve => setTimeout(resolve, 0));

      const config = service.getAccessibilityConfig();
      expect(config.isScreenReaderEnabled).toBe(false);
      expect(config.isBoldTextEnabled).toBe(false);
      expect(config.isGrayscaleEnabled).toBe(false);
      expect(config.isInvertColorsEnabled).toBe(false);
      expect(config.isReduceMotionEnabled).toBe(false);
      expect(config.isReduceTransparencyEnabled).toBe(false);
      expect(config.preferredContentSizeCategory).toBe('normal');
    });

    it('should setup all accessibility event listeners', async () => {
      const service = AccessibilityService.getInstance();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockAccessibilityInfo.addEventListener).toHaveBeenCalledWith(
        'screenReaderChanged',
        expect.any(Function)
      );
      expect(mockAccessibilityInfo.addEventListener).toHaveBeenCalledWith(
        'boldTextChanged',
        expect.any(Function)
      );
      expect(mockAccessibilityInfo.addEventListener).toHaveBeenCalledWith(
        'grayscaleChanged',
        expect.any(Function)
      );
      expect(mockAccessibilityInfo.addEventListener).toHaveBeenCalledWith(
        'invertColorsChanged',
        expect.any(Function)
      );
      expect(mockAccessibilityInfo.addEventListener).toHaveBeenCalledWith(
        'reduceMotionChanged',
        expect.any(Function)
      );
      expect(mockAccessibilityInfo.addEventListener).toHaveBeenCalledWith(
        'reduceTransparencyChanged',
        expect.any(Function)
      );
    });
  });

  describe('Configuration Management', () => {
    it('should return current accessibility config', () => {
      const config = accessibilityService.getAccessibilityConfig();

      expect(config).toEqual({
        isScreenReaderEnabled: false,
        isBoldTextEnabled: false,
        isGrayscaleEnabled: false,
        isInvertColorsEnabled: false,
        isReduceMotionEnabled: false,
        isReduceTransparencyEnabled: false,
        preferredContentSizeCategory: 'normal',
      });
    });

    it('should update config when accessibility changes', async () => {
      const service = AccessibilityService.getInstance();
      await new Promise(resolve => setTimeout(resolve, 0));

      // Simulate screen reader enabled
      mockListeners['screenReaderChanged'](true);

      expect(service.isScreenReaderEnabled()).toBe(true);
      expect(service.getAccessibilityConfig().isScreenReaderEnabled).toBe(true);
    });

    it('should update config for all accessibility features', async () => {
      const service = AccessibilityService.getInstance();
      await new Promise(resolve => setTimeout(resolve, 0));

      // Simulate all features enabled
      mockListeners['screenReaderChanged'](true);
      mockListeners['boldTextChanged'](true);
      mockListeners['grayscaleChanged'](true);
      mockListeners['invertColorsChanged'](true);
      mockListeners['reduceMotionChanged'](true);
      mockListeners['reduceTransparencyChanged'](true);

      const config = service.getAccessibilityConfig();
      expect(config.isScreenReaderEnabled).toBe(true);
      expect(config.isBoldTextEnabled).toBe(true);
      expect(config.isGrayscaleEnabled).toBe(true);
      expect(config.isInvertColorsEnabled).toBe(true);
      expect(config.isReduceMotionEnabled).toBe(true);
      expect(config.isReduceTransparencyEnabled).toBe(true);
    });
  });

  describe('Accessibility Checks', () => {
    it('should return screen reader status', () => {
      expect(accessibilityService.isScreenReaderEnabled()).toBe(false);
    });

    it('should return bold text status', () => {
      expect(accessibilityService.isBoldTextEnabled()).toBe(false);
    });

    it('should return reduce motion status', () => {
      expect(accessibilityService.isReduceMotionEnabled()).toBe(false);
    });

    it('should return high contrast status', () => {
      expect(accessibilityService.isHighContrastEnabled()).toBe(false);

      // Enable grayscale
      (accessibilityService as any).config.isGrayscaleEnabled = true;
      expect(accessibilityService.isHighContrastEnabled()).toBe(true);

      // Reset and enable invert colors
      (accessibilityService as any).config.isGrayscaleEnabled = false;
      (accessibilityService as any).config.isInvertColorsEnabled = true;
      expect(accessibilityService.isHighContrastEnabled()).toBe(true);
    });
  });

  describe('Touch Target Requirements', () => {
    it('should return minimum touch target size', () => {
      const size = accessibilityService.getMinimumTouchTargetSize();

      expect(size).toEqual({
        width: 44,
        height: 44,
      });
    });
  });

  describe('Accessibility Announcements', () => {
    it('should announce content for accessibility', () => {
      const message = 'Button pressed';

      accessibilityService.announceForAccessibility(message);

      expect(mockAccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(message);
    });

    it('should handle announcement errors gracefully', () => {
      mockAccessibilityInfo.announceForAccessibility.mockImplementation(() => {
        throw new Error('Announcement failed');
      });

      expect(() => {
        accessibilityService.announceForAccessibility('test');
      }).not.toThrow();
    });
  });

  describe('Accessibility Focus', () => {
    it('should set accessibility focus on iOS', () => {
      const mockRef = { current: null };

      accessibilityService.setAccessibilityFocus(mockRef);

      expect((mockAccessibilityInfo as any).setAccessibilityFocus).toHaveBeenCalledWith(mockRef);
    });

    it('should handle focus errors gracefully', () => {
      (mockAccessibilityInfo as any).setAccessibilityFocus = jest.fn(() => {
        throw new Error('Focus failed');
      });

      expect(() => {
        accessibilityService.setAccessibilityFocus({});
      }).not.toThrow();
    });
  });

  describe('Text Size Multipliers', () => {
    it('should return correct multiplier for different content sizes', () => {
      const testCases = [
        { category: 'extraSmall', expected: 0.8 },
        { category: 'small', expected: 0.9 },
        { category: 'normal', expected: 1.0 },
        { category: 'large', expected: 1.1 },
        { category: 'extraLarge', expected: 1.2 },
        { category: 'extraExtraLarge', expected: 1.3 },
        { category: 'extraExtraExtraLarge', expected: 1.4 },
        { category: 'accessibilityMedium', expected: 1.5 },
        { category: 'accessibilityLarge', expected: 1.6 },
        { category: 'accessibilityExtraLarge', expected: 1.7 },
        { category: 'accessibilityExtraExtraLarge', expected: 1.8 },
        { category: 'accessibilityExtraExtraExtraLarge', expected: 2.0 },
        { category: 'unknown', expected: 1.0 }, // Default case
      ];

      testCases.forEach(({ category, expected }) => {
        (accessibilityService as any).config.preferredContentSizeCategory = category;
        expect(accessibilityService.getTextSizeMultiplier()).toBe(expected);
      });
    });
  });

  describe('Color Schemes', () => {
    it('should return standard accessible color scheme', () => {
      const colors = accessibilityService.getAccessibleColorScheme();

      expect(colors).toEqual({
        primary: '#2563EB',
        secondary: '#64748B',
        background: '#FFFFFF',
        surface: '#F8FAFC',
        text: '#1E293B',
        textSecondary: '#64748B',
        error: '#DC2626',
        success: '#16A34A',
        warning: '#D97706',
      });
    });

    it('should return high contrast color scheme when enabled', () => {
      // Enable high contrast
      (accessibilityService as any).config.isGrayscaleEnabled = true;

      const colors = accessibilityService.getAccessibleColorScheme();

      expect(colors).toEqual({
        primary: '#FFFFFF',
        secondary: '#CCCCCC',
        background: '#000000',
        surface: '#111111',
        text: '#FFFFFF',
        textSecondary: '#CCCCCC',
        error: '#FF4444',
        success: '#44FF44',
        warning: '#FFFF44',
      });
    });
  });

  describe('Contrast Requirements', () => {
    it('should return true for contrast check (placeholder implementation)', () => {
      const result = accessibilityService.meetsContrastRequirement('#000000', '#FFFFFF');

      expect(result).toBe(true);
    });
  });

  describe('Event Listeners', () => {
    it('should add and remove change listeners', () => {
      const listener = jest.fn();

      const unsubscribe = accessibilityService.addChangeListener(listener);

      expect((accessibilityService as any).listeners).toContain(listener);

      unsubscribe();

      expect((accessibilityService as any).listeners).not.toContain(listener);
    });

    it('should notify listeners when accessibility changes', async () => {
      const listener = jest.fn();
      accessibilityService.addChangeListener(listener);

      const service = AccessibilityService.getInstance();
      await new Promise(resolve => setTimeout(resolve, 0));

      // Simulate change
      mockListeners['screenReaderChanged'](true);

      expect(listener).toHaveBeenCalledWith({
        isScreenReaderEnabled: true,
        isBoldTextEnabled: false,
        isGrayscaleEnabled: false,
        isInvertColorsEnabled: false,
        isReduceMotionEnabled: false,
        isReduceTransparencyEnabled: false,
        preferredContentSizeCategory: 'normal',
      });
    });

    it('should handle listener errors gracefully', async () => {
      const errorListener = jest.fn(() => {
        throw new Error('Listener error');
      });
      const goodListener = jest.fn();

      accessibilityService.addChangeListener(errorListener);
      accessibilityService.addChangeListener(goodListener);

      const service = AccessibilityService.getInstance();
      await new Promise(resolve => setTimeout(resolve, 0));

      // Simulate change - should not throw
      mockListeners['screenReaderChanged'](true);

      expect(goodListener).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', async () => {
      mockAccessibilityInfo.isScreenReaderEnabled.mockRejectedValue(new Error('Init failed'));

      const service = AccessibilityService.getInstance();
      await new Promise(resolve => setTimeout(resolve, 0));

      // Should not crash, should use defaults
      expect(service.getAccessibilityConfig()).toBeDefined();
    });

    it('should handle listener setup errors', async () => {
      mockAccessibilityInfo.addEventListener.mockImplementation(() => {
        throw new Error('Listener setup failed');
      });

      // Should not crash during initialization
      const service = AccessibilityService.getInstance();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(service).toBeDefined();
    });
  });

  describe('Platform Differences', () => {
    it('should handle iOS-specific focus implementation', () => {
      Platform.OS = 'ios';
      const mockRef = {};

      accessibilityService.setAccessibilityFocus(mockRef);

      expect((mockAccessibilityInfo as any).setAccessibilityFocus).toHaveBeenCalledWith(mockRef);
    });

    it('should handle Android focus (placeholder)', () => {
      Platform.OS = 'android';
      const mockRef = {};

      // Should not crash on Android
      expect(() => {
        accessibilityService.setAccessibilityFocus(mockRef);
      }).not.toThrow();
    });
  });
});
