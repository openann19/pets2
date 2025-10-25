/**
 * HapticFeedbackService Test Suite
 * Comprehensive tests for haptic feedback service
 */

import * as Haptics from "expo-haptics";
import * as AccessibilityInfo from "react-native";
import { hapticFeedback, HapticPatterns } from "../HapticFeedbackService";

// Mock dependencies
jest.mock("expo-haptics");
jest.mock("react-native", () => ({
  AccessibilityInfo: {
    isReduceMotionEnabled: jest.fn(),
  },
}));

describe("HapticFeedbackService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset accessibility setting
    (
      AccessibilityInfo.AccessibilityInfo.isReduceMotionEnabled as jest.Mock
    ).mockResolvedValue(false);
  });

  describe("Initialization", () => {
    it("should initialize successfully", async () => {
      (
        AccessibilityInfo.AccessibilityInfo.isReduceMotionEnabled as jest.Mock
      ).mockResolvedValue(false);

      await hapticFeedback.initialize();

      expect(
        AccessibilityInfo.AccessibilityInfo.isReduceMotionEnabled,
      ).toHaveBeenCalled();
    });

    it("should handle accessibility settings", async () => {
      (
        AccessibilityInfo.AccessibilityInfo.isReduceMotionEnabled as jest.Mock
      ).mockResolvedValue(true);

      await hapticFeedback.initialize();

      const settings = hapticFeedback.getAccessibilitySettings();
      expect(settings.reduceMotionEnabled).toBe(true);
    });
  });

  describe("Haptic Feedback Methods", () => {
    beforeEach(async () => {
      (
        AccessibilityInfo.AccessibilityInfo.isReduceMotionEnabled as jest.Mock
      ).mockResolvedValue(false);
      await hapticFeedback.initialize();
    });

    it("should trigger light impact feedback", async () => {
      const mockImpactAsync = Haptics.impactAsync as jest.Mock;
      mockImpactAsync.mockResolvedValue(undefined);

      await hapticFeedback.triggerLight();

      expect(mockImpactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light,
      );
    });

    it("should trigger medium impact feedback", async () => {
      const mockImpactAsync = Haptics.impactAsync as jest.Mock;
      mockImpactAsync.mockResolvedValue(undefined);

      await hapticFeedback.triggerMedium();

      expect(mockImpactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Medium,
      );
    });

    it("should trigger heavy impact feedback", async () => {
      const mockImpactAsync = Haptics.impactAsync as jest.Mock;
      mockImpactAsync.mockResolvedValue(undefined);

      await hapticFeedback.triggerHeavy();

      expect(mockImpactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Heavy,
      );
    });

    it("should trigger success notification", async () => {
      const mockNotificationAsync = Haptics.notificationAsync as jest.Mock;
      mockNotificationAsync.mockResolvedValue(undefined);

      await hapticFeedback.triggerSuccess();

      expect(mockNotificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success,
      );
    });

    it("should trigger error notification", async () => {
      const mockNotificationAsync = Haptics.notificationAsync as jest.Mock;
      mockNotificationAsync.mockResolvedValue(undefined);

      await hapticFeedback.triggerError();

      expect(mockNotificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error,
      );
    });

    it("should trigger selection feedback", async () => {
      const mockSelectionAsync = Haptics.selectionAsync as jest.Mock;
      mockSelectionAsync.mockResolvedValue(undefined);

      await hapticFeedback.triggerSelection();

      expect(mockSelectionAsync).toHaveBeenCalled();
    });

    it("should trigger custom pattern using Vibration", async () => {
      const mockVibrate = jest.fn();
      // Mock the require for react-native Vibration
      const originalRequire = global.require;
      global.require = jest.fn((module) => {
        if (module === "react-native") {
          return { Vibration: { vibrate: mockVibrate } };
        }
        return originalRequire(module);
      });

      await hapticFeedback.triggerCustomPattern();

      expect(mockVibrate).toHaveBeenCalledWith(HapticPatterns.RING, false);

      // Restore original require
      global.require = originalRequire;
    });
  });

  describe("Accessibility Handling", () => {
    it("should skip haptic feedback when reduce motion is enabled", async () => {
      (
        AccessibilityInfo.AccessibilityInfo.isReduceMotionEnabled as jest.Mock
      ).mockResolvedValue(true);
      await hapticFeedback.initialize();

      const mockImpactAsync = Haptics.impactAsync as jest.Mock;
      mockImpactAsync.mockResolvedValue(undefined);

      await hapticFeedback.triggerLight();

      expect(mockImpactAsync).not.toHaveBeenCalled();
    });

    it("should force haptic feedback even when reduce motion is enabled", async () => {
      (
        AccessibilityInfo.AccessibilityInfo.isReduceMotionEnabled as jest.Mock
      ).mockResolvedValue(true);
      await hapticFeedback.initialize();

      const mockImpactAsync = Haptics.impactAsync as jest.Mock;
      mockImpactAsync.mockResolvedValue(undefined);

      await hapticFeedback.triggerLight({ force: true });

      expect(mockImpactAsync).toHaveBeenCalledWith(
        Haptics.ImpactFeedbackStyle.Light,
      );
    });

    it("should respect accessibility parameter", async () => {
      (
        AccessibilityInfo.AccessibilityInfo.isReduceMotionEnabled as jest.Mock
      ).mockResolvedValue(false);
      await hapticFeedback.initialize();

      const mockImpactAsync = Haptics.impactAsync as jest.Mock;
      mockImpactAsync.mockResolvedValue(undefined);

      await hapticFeedback.triggerLight({ respectAccessibility: false });

      expect(mockImpactAsync).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    beforeEach(async () => {
      (
        AccessibilityInfo.AccessibilityInfo.isReduceMotionEnabled as jest.Mock
      ).mockResolvedValue(false);
      await hapticFeedback.initialize();
    });

    it("should handle haptic API errors gracefully", async () => {
      const mockImpactAsync = Haptics.impactAsync as jest.Mock;
      mockImpactAsync.mockRejectedValue(new Error("Haptic API error"));

      // Should not throw
      await expect(hapticFeedback.triggerLight()).resolves.toBeUndefined();
    });

    it("should handle initialization errors", async () => {
      const mockIsReduceMotionEnabled = AccessibilityInfo.AccessibilityInfo
        .isReduceMotionEnabled as jest.Mock;
      mockIsReduceMotionEnabled.mockRejectedValue(
        new Error("Accessibility API error"),
      );

      // Should not throw
      await expect(hapticFeedback.initialize()).resolves.toBeUndefined();
    });
  });

  describe("Platform Support", () => {
    it("should report haptic availability", () => {
      // This would vary by platform in real implementation
      const isAvailable = hapticFeedback.isAvailable();

      // Just verify it returns a boolean
      expect(typeof isAvailable).toBe("boolean");
    });
  });

  describe("Haptic Patterns", () => {
    it("should export predefined patterns", () => {
      expect(HapticPatterns.RING).toEqual([0, 1000, 500, 1000, 500]);
      expect(HapticPatterns.DOUBLE_TAP).toEqual([0, 100, 50, 100]);
      expect(HapticPatterns.SUCCESS_SEQUENCE).toEqual([0, 200, 100, 200]);
      expect(HapticPatterns.ERROR_BUZZ).toEqual([0, 500]);
    });
  });

  describe("Stop Functionality", () => {
    it("should stop ongoing haptic feedback", async () => {
      const mockVibrate = jest.fn();
      const originalRequire = global.require;
      global.require = jest.fn((module) => {
        if (module === "react-native") {
          return { Vibration: { cancel: mockVibrate } };
        }
        return originalRequire(module);
      });

      await hapticFeedback.stop();

      expect(mockVibrate).toHaveBeenCalled();

      // Restore original require
      global.require = originalRequire;
    });
  });
});
