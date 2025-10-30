import {
  isScreenReaderEnabled,
  isReduceMotionEnabled,
  getAdaptiveDuration,
  getAdaptiveHapticIntensity,
  getVoiceOverLabels,
  getHighContrastColors,
  getSafeTouchTarget,
  formatPercentage,
} from '../A11yHelpers';
import { AccessibilityInfo } from 'react-native';

// Mock react-native
jest.mock('react-native', () => ({
  AccessibilityInfo: {
    isScreenReaderEnabled: jest.fn(),
    isReduceMotionEnabled: jest.fn(),
  },
}));

describe('A11yHelpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isScreenReaderEnabled', () => {
    it('should return true when screen reader is enabled', async () => {
      (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockResolvedValue(true);

      const enabled = await isScreenReaderEnabled();

      expect(enabled).toBe(true);
    });

    it('should return false when screen reader is disabled', async () => {
      (AccessibilityInfo.isScreenReaderEnabled as jest.Mock).mockResolvedValue(false);

      const enabled = await isScreenReaderEnabled();

      expect(enabled).toBe(false);
    });
  });

  describe('isReduceMotionEnabled', () => {
    it('should return true when reduce motion is enabled', async () => {
      (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(true);

      const enabled = await isReduceMotionEnabled();

      expect(enabled).toBe(true);
    });

    it('should return false when reduce motion is disabled', async () => {
      (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(false);

      const enabled = await isReduceMotionEnabled();

      expect(enabled).toBe(false);
    });
  });

  describe('getAdaptiveDuration', () => {
    it('should return 0 when reduce motion is enabled', async () => {
      (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(true);

      const duration = await getAdaptiveDuration(300);

      expect(duration).toBe(0);
    });

    it('should return normal duration when reduce motion is disabled', async () => {
      (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(false);

      const duration = await getAdaptiveDuration(300);

      expect(duration).toBe(300);
    });
  });

  describe('getAdaptiveHapticIntensity', () => {
    it('should return light when reduce motion is enabled', async () => {
      (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(true);

      const intensity = await getAdaptiveHapticIntensity('heavy');

      expect(intensity).toBe('light');
    });

    it('should return original intensity when reduce motion is disabled', async () => {
      (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(false);

      const intensity = await getAdaptiveHapticIntensity('heavy');

      expect(intensity).toBe('heavy');
    });

    it('should respect light intensity preference', async () => {
      (AccessibilityInfo.isReduceMotionEnabled as jest.Mock).mockResolvedValue(false);

      const intensity = await getAdaptiveHapticIntensity('light');

      expect(intensity).toBe('light');
    });
  });

  describe('getVoiceOverLabels', () => {
    it('should return all control labels', () => {
      const labels = getVoiceOverLabels();

      expect(labels.brightness).toContain('Brightness');
      expect(labels.contrast).toContain('Contrast');
      expect(labels.saturation).toContain('Saturation');
      expect(labels.warmth).toContain('Warmth');
      expect(labels.blur).toContain('Blur');
      expect(labels.sharpen).toContain('Clarity');
      expect(labels.autoCrop).toContain('Auto crop');
      expect(labels.save).toContain('Save');
      expect(labels.cancel).toContain('Cancel');
      expect(labels.undo).toContain('Undo');
      expect(labels.redo).toContain('Redo');
    });

    it('should have descriptive hints', () => {
      const labels = getVoiceOverLabels();

      expect(labels.brightness).toContain('slider');
      expect(labels.contrast).toContain('slider');
      expect(labels.ratioOneOne).toContain('Square');
      expect(labels.ratioFourFive).toContain('Portrait');
      expect(labels.ratioNineSixteen).toContain('Vertical story');
    });
  });

  describe('getHighContrastColors', () => {
    it('should return high contrast color palette', () => {
      const colors = getHighContrastColors();

      expect(colors.background).toBe('#000000');
      expect(colors.onSurface).toBe('#ffffff');
      expect(colors.primary).toBe('#ffffff');
      expect(colors.border).toBe('#ffffff');
    });

    it('should have distinct colors for all states', () => {
      const colors = getHighContrastColors();

      expect(colors.error).toBe('#ff0000');
      expect(colors.success).toBe('#00ff00');
      expect(colors.warning).toBe('#ffff00');
    });
  });

  describe('getSafeTouchTarget', () => {
    it('should return minimum 44x44 points', () => {
      const size = getSafeTouchTarget(20);

      expect(size).toBe(44);
    });

    it('should return original size if larger than 44', () => {
      const size = getSafeTouchTarget(60);

      expect(size).toBe(60);
    });

    it('should handle exact 44 size', () => {
      const size = getSafeTouchTarget(44);

      expect(size).toBe(44);
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      const percent = formatPercentage(100, 0, 200);

      expect(percent).toBe('50%');
    });

    it('should handle 0%', () => {
      const percent = formatPercentage(0, 0, 100);

      expect(percent).toBe('0%');
    });

    it('should handle 100%', () => {
      const percent = formatPercentage(100, 0, 100);

      expect(percent).toBe('100%');
    });

    it('should handle non-zero min', () => {
      const percent = formatPercentage(150, 50, 200);

      expect(percent).toBe('67%'); // 100/150 * 100
    });

    it('should round to nearest integer', () => {
      const percent = formatPercentage(33, 0, 100);

      expect(percent).toBe('33%');
    });
  });
});
