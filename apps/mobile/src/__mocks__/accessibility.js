/**
 * Mock for React Native AccessibilityInfo
 */

module.exports = {
  AccessibilityInfo: {
    isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
    isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
    isBoldTextEnabled: jest.fn(() => Promise.resolve(false)),
    isGrayscaleEnabled: jest.fn(() => Promise.resolve(false)),
    isInvertColorsEnabled: jest.fn(() => Promise.resolve(false)),
    isReduceTransparencyEnabled: jest.fn(() => Promise.resolve(false)),
    isAnnouncementEnabled: jest.fn(() => Promise.resolve(false)),
    announceForAccessibility: jest.fn(),
    setAccessibilityFocus: jest.fn(),
  },
};
