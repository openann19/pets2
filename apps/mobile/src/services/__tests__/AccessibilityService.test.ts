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
import type { AppTheme } from '@/theme';
import { createTheme } from '@/theme/rnTokens';

// Mocks are handled globally in jest.setup.ts

const mockAccessibilityInfo = AccessibilityInfo as jest.Mocked<typeof AccessibilityInfo>;

describe('AccessibilityService', () => {
  let mockListeners: { [key: string]: jest.Mock } = {};
  let mockTheme: AppTheme;
  let mockService: AccessibilityService;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock service instance
    mockService = new AccessibilityService();

    // Mock the getInstance method to return our mock service
    jest.spyOn(AccessibilityService, 'getInstance').mockReturnValue(mockService);

    // Create mock theme for testing (this will be mocked by jest.mock above)
    mockTheme = {
      scheme: 'dark',
      colors: {
        bg: '#000000',
        bgElevated: '#0a0a0a',
        text: '#fafafa',
        textMuted: '#a3a3a3',
        primary: '#4f46e5',
        primaryText: '#ffffff',
        border: '#262626',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        background: '#000000',
        surface: '#000000',
        surfaceElevated: '#0a0a0a',
        card: '#0a0a0a',
        textSecondary: '#a3a3a3',
        white: '#ffffff',
        black: '#000000',
        gray50: '#fafafa',
        gray100: '#f5f5f5',
        gray200: '#e5e5e5',
        gray300: '#d4d4d4',
        gray400: '#a3a3a3',
        gray500: '#737373',
        gray600: '#525252',
        gray700: '#404040',
        gray800: '#262626',
        gray900: '#171717',
        gray950: '#0a0a0a',
        primaryLight: '#fce7f3',
        primaryDark: '#831843',
        secondary: '#a855f7',
        secondaryLight: '#f3e8ff',
        secondaryDark: '#581c87',
        accent: '#10b981',
        accentLight: '#dcfce7',
        accentDark: '#064e3b',
        glass: 'rgba(255, 255, 255, 0.1)',
        glassLight: 'rgba(255, 255, 255, 0.05)',
        glassWhite: 'rgba(255, 255, 255, 0.05)',
        glassWhiteLight: 'rgba(255, 255, 255, 0.1)',
        glassWhiteDark: 'rgba(255, 255, 255, 0.2)',
        glassDark: 'rgba(0, 0, 0, 0.8)',
        glassDarkMedium: 'rgba(0, 0, 0, 0.6)',
        glassDarkStrong: 'rgba(0, 0, 0, 0.4)',
        info: '#3b82f6',
        error: '#ef4444',
        tertiary: '#f59e0b',
        inverse: '#ffffff',
        shadow: 'rgba(0, 0, 0, 0.5)',
        interactive: '#4f46e5',
        feedback: '#10b981',
      },
      palette: {
        neutral: {
          0: '#ffffff',
          50: '#fafafa',
          200: '#e5e5e5',
          400: '#a3a3a3',
          600: '#525252',
          950: '#0a0a0a',
        },
        brand: {
          500: '#64748b',
        },
      },
    } as AppTheme;

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

      expect(instance1).toBe(mockService);
      expect(instance2).toBe(mockService);
      expect(instance1).toBe(instance2);
    });

    it('should initialize accessibility on first getInstance call', async () => {
      const service = AccessibilityService.getInstance();
      expect(service).toBe(mockService);

      // Wait for initialization
      await new Promise((resolve) => setTimeout(resolve, 0));

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
      await new Promise((resolve) => setTimeout(resolve, 0));

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
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockAccessibilityInfo.addEventListener).toHaveBeenCalledWith(
        'screenReaderChanged',
        expect.any(Function),
      );
      expect(mockAccessibilityInfo.addEventListener).toHaveBeenCalledWith(
        'boldTextChanged',
        expect.any(Function),
      );
      expect(mockAccessibilityInfo.addEventListener).toHaveBeenCalledWith(
        'grayscaleChanged',
        expect.any(Function),
      );
      expect(mockAccessibilityInfo.addEventListener).toHaveBeenCalledWith(
        'invertColorsChanged',
        expect.any(Function),
      );
      expect(mockAccessibilityInfo.addEventListener).toHaveBeenCalledWith(
        'reduceMotionChanged',
        expect.any(Function),
      );
      expect(mockAccessibilityInfo.addEventListener).toHaveBeenCalledWith(
        'reduceTransparencyChanged',
        expect.any(Function),
      );
    });
  });

  describe('Configuration Management', () => {
    it('should return current accessibility config', () => {
      const config = mockService.getAccessibilityConfig();

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
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Simulate screen reader enabled
      mockListeners['screenReaderChanged'](true);

      expect(service.isScreenReaderEnabled()).toBe(true);
      expect(service.getAccessibilityConfig().isScreenReaderEnabled).toBe(true);
    });

    it('should update config for all accessibility features', async () => {
      const service = AccessibilityService.getInstance();
      await new Promise((resolve) => setTimeout(resolve, 0));

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
      expect(mockService.isScreenReaderEnabled()).toBe(false);
    });

    it('should return bold text status', () => {
      expect(mockService.isBoldTextEnabled()).toBe(false);
    });

    it('should return reduce motion status', () => {
      expect(mockService.isReduceMotionEnabled()).toBe(false);
    });

    it('should return high contrast status', () => {
      expect(mockService.isHighContrastEnabled()).toBe(false);

      // Enable grayscale
      (mockService as any).config.isGrayscaleEnabled = true;
      expect(mockService.isHighContrastEnabled()).toBe(true);

      // Reset and enable invert colors
      (mockService as any).config.isGrayscaleEnabled = false;
      (mockService as any).config.isInvertColorsEnabled = true;
      expect(mockService.isHighContrastEnabled()).toBe(true);
    });
  });

  describe('Accessibility Focus', () => {
    it('should set accessibility focus on iOS', () => {
      const mockRef = { current: null };

      mockService.setAccessibilityFocus(mockRef);

      expect((mockAccessibilityInfo as any).setAccessibilityFocus).toHaveBeenCalledWith(mockRef);
    });

    it('should handle focus errors gracefully', () => {
      (mockAccessibilityInfo as any).setAccessibilityFocus = jest.fn(() => {
        throw new Error('Focus failed');
      });

      expect(() => {
        mockService.setAccessibilityFocus({});
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
        (mockService as any).config.preferredContentSizeCategory = category;
        expect(mockService.getTextSizeMultiplier()).toBe(expected);
      });
    });
  });

  describe('Color Schemes', () => {
    beforeEach(() => {
      // Set up theme resolver directly on mockService
      mockService.setThemeResolver(() => mockTheme);
    });

    it('should return standard accessible color scheme using theme', () => {
      const colors = mockService.getAccessibleColorScheme();

      expect(colors).toEqual({
        primary: '#4f46e5', // c.primary[600] from theme
        secondary: expect.any(String), // From brand palette
        background: '#000000', // c.neutral[950] for dark theme
        surface: '#000000', // c.neutral[950] for dark theme
        text: '#fafafa', // c.neutral[50] for dark theme
        textSecondary: '#a3a3a3', // c.neutral[400] for dark theme
        error: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
      });
    });

    it('should return high contrast color scheme when enabled using theme', () => {
      // Enable high contrast
      (mockService as any).config.isGrayscaleEnabled = true;

      const colors = mockService.getAccessibleColorScheme();

      // High contrast should use theme palette values for neutral steps
      expect(colors).toEqual({
        primary: expect.any(String), // From theme onPrimary or fallback
        secondary: expect.any(String), // High contrast secondary from neutral[200]
        background: '#0a0a0a', // From theme neutral[950]
        surface: '#0a0a0a', // From theme neutral[950]
        text: '#fafafa', // From theme neutral[50]
        textSecondary: '#e5e5e5', // From theme neutral[200]
        error: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
      });
    });
  });

  describe('Contrast Requirements', () => {
    it('should return true for contrast check (placeholder implementation)', () => {
      const result = mockService.meetsContrastRequirement('#000000', '#FFFFFF');

      expect(result).toBe(true);
    });
  });

  describe('Event Listeners', () => {
    it('should add and remove change listeners', () => {
      const listener = jest.fn();

      const unsubscribe = mockService.addChangeListener(listener);

      expect((mockService as any).listeners).toContain(listener);

      unsubscribe();

      expect((mockService as any).listeners).not.toContain(listener);
    });

    it('should notify listeners when accessibility changes', async () => {
      const listener = jest.fn();
      mockService.addChangeListener(listener);

      const service = AccessibilityService.getInstance();
      await new Promise((resolve) => setTimeout(resolve, 0));

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

      mockService.addChangeListener(errorListener);
      mockService.addChangeListener(goodListener);

      const service = AccessibilityService.getInstance();
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Simulate change - should not throw
      mockListeners['screenReaderChanged'](true);

      expect(goodListener).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle initialization errors gracefully', async () => {
      mockAccessibilityInfo.isScreenReaderEnabled.mockRejectedValue(new Error('Init failed'));

      const service = AccessibilityService.getInstance();
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Should not crash, should use defaults
      expect(service.getAccessibilityConfig()).toBeDefined();
    });

    it('should handle listener setup errors', async () => {
      mockAccessibilityInfo.addEventListener.mockImplementation(() => {
        throw new Error('Listener setup failed');
      });

      // Should not crash during initialization
      const service = AccessibilityService.getInstance();
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(service).toBeDefined();
    });
  });

  describe('Platform Differences', () => {
    it('should handle iOS-specific focus implementation', () => {
      Platform.OS = 'ios';
      const mockRef = {};

      mockService.setAccessibilityFocus(mockRef);

      expect((mockAccessibilityInfo as any).setAccessibilityFocus).toHaveBeenCalledWith(mockRef);
    });

    it('should handle Android focus (placeholder)', () => {
      Platform.OS = 'android';
      const mockRef = {};

      // Should not crash on Android
      expect(() => {
        mockService.setAccessibilityFocus(mockRef);
      }).not.toThrow();
    });
  });

  describe('Listener Cleanup', () => {
    it('should cleanup all subscriptions when cleanup is called', () => {
      const removeMock1 = jest.fn();
      const removeMock2 = jest.fn();
      const removeMock3 = jest.fn();

      mockAccessibilityInfo.addEventListener.mockReturnValueOnce({ remove: removeMock1 });
      mockAccessibilityInfo.addEventListener.mockReturnValueOnce({ remove: removeMock2 });
      mockAccessibilityInfo.addEventListener.mockReturnValueOnce({ remove: removeMock3 });

      // Setup listeners
      mockService.setupAccessibilityListeners();

      // Call cleanup
      mockService.cleanup();

      // Verify all remove methods were called
      expect(removeMock1).toHaveBeenCalledTimes(1);
      expect(removeMock2).toHaveBeenCalledTimes(1);
      expect(removeMock3).toHaveBeenCalledTimes(1);
    });

    it('should handle cleanup errors gracefully', () => {
      const removeMock = jest.fn(() => {
        throw new Error('Remove failed');
      });

      mockAccessibilityInfo.addEventListener.mockReturnValue({ remove: removeMock });

      mockService.setupAccessibilityListeners();

      // Should not throw even if remove fails
      expect(() => {
        mockService.cleanup();
      }).not.toThrow();
    });

    it('should clear subscriptions array after cleanup', () => {
      mockAccessibilityInfo.addEventListener.mockReturnValue({ remove: jest.fn() });

      mockService.setupAccessibilityListeners();
      mockService.cleanup();

      // Setup again should work without duplicates
      mockService.setupAccessibilityListeners();

      // Cleanup should only remove new subscriptions
      expect(mockAccessibilityInfo.addEventListener).toHaveBeenCalled();
    });

    it('should call cleanup before setting up new listeners', () => {
      const removeMock = jest.fn();
      mockAccessibilityInfo.addEventListener.mockReturnValue({ remove: removeMock });

      // First setup
      mockService.setupAccessibilityListeners();
      const firstCallCount = mockAccessibilityInfo.addEventListener.mock.calls.length;

      // Second setup should cleanup first
      mockService.setupAccessibilityListeners();

      // Verify cleanup was called (subscriptions should be reset)
      expect(removeMock).toHaveBeenCalled();
    });
  });

  describe('Theme Resolution and Fallbacks', () => {
    it('should return fallback scheme when theme resolution fails', () => {
      // Mock theme resolver to throw
      const service = new AccessibilityService();
      (service as any).themeResolver = () => {
        throw new Error('Theme resolution failed');
      };

      const scheme = service.getAccessibleColorScheme();

      expect(scheme).toBeDefined();
      expect(scheme).toHaveProperty('text');
      expect(scheme).toHaveProperty('background');
    });

    it('should use theme colors when resolution succeeds', () => {
      const testTheme = createTheme('light');
      const service = new AccessibilityService();
      (service as any).themeResolver = () => testTheme;

      const scheme = service.getAccessibleColorScheme();

      expect(scheme.text).toBe(testTheme.colors.onSurface);
      expect(scheme.background).toBe(testTheme.colors.bg);
    });
  });
});
