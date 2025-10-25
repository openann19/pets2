/**
 * PROJECT HYPERION: PERFORMANCE TEST SUITE
 *
 * Comprehensive performance testing component for the new architecture.
 * Tests animation performance, gesture responsiveness, and memory usage.
 */

import React, { useState, useEffect, useCallback } from "react";
import { logger } from "@pawfectmatch/core";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { Theme } from "../theme/unified-theme";
import PerformanceMonitor, {
  type PerformanceMetrics,
} from "../utils/PerformanceMonitor";

import { EliteButtonPresets } from "./buttons/EliteButton";
import { FXContainerPresets } from "./containers/FXContainer";
import { getTextColor } from "../../theme/helpers";
import {
  Heading2,
  Body,
  BodySmall,
  Label,
} from "./typography/ModernTypography";

interface PerformanceTestSuiteProps {
  onTestComplete?: (results: PerformanceTestResults) => void;
}

interface PerformanceTestResults {
  animationFPS: number;
  gestureResponseTime: number;
  memoryUsage: number;
  overallGrade: string;
  recommendations: string[];
}

interface TestState {
  isRunning: boolean;
  currentTest: string;
  progress: number;
  results: PerformanceTestResults | null;
}

export default function PerformanceTestSuite({
  onTestComplete,
}: PerformanceTestSuiteProps) {
  const [testState, setTestState] = useState<TestState>({
    isRunning: false,
    currentTest: "",
    progress: 0,
    results: null,
  });

  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const performanceMonitor = PerformanceMonitor.getInstance();

  // Animation values for testing
  const testAnimationValue = useSharedValue(0);
  const testScaleValue = useSharedValue(1);
  const testRotationValue = useSharedValue(0);

  // Performance monitoring callback
  const handleMetricsUpdate = useCallback((newMetrics: PerformanceMetrics) => {
    setMetrics(newMetrics);
  }, []);

  // Start performance monitoring
  useEffect(() => {
    performanceMonitor.addCallback(handleMetricsUpdate);
    performanceMonitor.startMonitoring();

    return () => {
      performanceMonitor.removeCallback(handleMetricsUpdate);
      performanceMonitor.stopMonitoring();
    };
  }, [performanceMonitor, handleMetricsUpdate]);

  // Test animations
  const testAnimations = useCallback(() => {
    return new Promise<void>((resolve) => {
      setTestState((prev) => ({
        ...prev,
        currentTest: "Testing Animations...",
      }));

      // Complex animation sequence
      testAnimationValue.value = withRepeat(
        withSpring(100, { damping: 15, stiffness: 150 }),
        10,
        true,
      );

      testScaleValue.value = withRepeat(
        withSpring(1.2, { damping: 20, stiffness: 200 }),
        8,
        true,
      );

      testRotationValue.value = withRepeat(
        withTiming(360, { duration: 2000 }),
        5,
        false,
      );

      // Complete after 3 seconds
      setTimeout(() => {
        testAnimationValue.value = withSpring(0);
        testScaleValue.value = withSpring(1);
        testRotationValue.value = withSpring(0);
        resolve();
      }, 3000);
    });
  }, [testAnimationValue, testScaleValue, testRotationValue]);

  // Test gesture responsiveness
  const testGestures = useCallback(() => {
    return new Promise<void>((resolve) => {
      setTestState((prev) => ({ ...prev, currentTest: "Testing Gestures..." }));

      // Simulate rapid gesture interactions
      let gestureCount = 0;
      const maxGestures = 20;

      const performGesture = () => {
        if (gestureCount < maxGestures) {
          // Simulate gesture
          testAnimationValue.value = withSpring(Math.random() * 50, {
            damping: 10,
            stiffness: 300,
          });

          gestureCount++;
          setTimeout(performGesture, 50);
        } else {
          testAnimationValue.value = withSpring(0);
          resolve();
        }
      };

      performGesture();
    });
  }, [testAnimationValue]);

  // Test memory usage
  const testMemoryUsage = useCallback(() => {
    return new Promise<void>((resolve) => {
      setTestState((prev) => ({
        ...prev,
        currentTest: "Testing Memory Usage...",
      }));

      // Create and destroy components rapidly
      const components: Array<{ id: number; data: number[] }> = [];

      for (let i = 0; i < 100; i++) {
        components.push({
          id: i,
          data: new Array(1000).fill(Math.random()),
        });
      }

      // Clean up after 2 seconds
      setTimeout(() => {
        components.length = 0;
        resolve();
      }, 2000);
    });
  }, []);

  // Run complete test suite
  const runTestSuite = useCallback(async () => {
    if (testState.isRunning) return;

    setTestState({
      isRunning: true,
      currentTest: "Initializing...",
      progress: 0,
      results: null,
    });

    try {
      // Test 1: Animations
      setTestState((prev) => ({ ...prev, progress: 25 }));
      await testAnimations();

      // Test 2: Gestures
      setTestState((prev) => ({ ...prev, progress: 50 }));
      await testGestures();

      // Test 3: Memory
      setTestState((prev) => ({ ...prev, progress: 75 }));
      await testMemoryUsage();

      // Calculate results
      setTestState((prev) => ({
        ...prev,
        progress: 100,
        currentTest: "Calculating Results...",
      }));

      const finalMetrics = metrics || {
        fps: 0,
        memoryUsage: 0,
        animationFrameTime: 0,
        gestureResponseTime: 0,
        componentRenderTime: 0,
      };

      const results: PerformanceTestResults = {
        animationFPS: finalMetrics.fps,
        gestureResponseTime: finalMetrics.gestureResponseTime,
        memoryUsage: finalMetrics.memoryUsage,
        overallGrade: performanceMonitor.getPerformanceGrade(finalMetrics),
        recommendations:
          performanceMonitor.getPerformanceRecommendations(finalMetrics),
      };

      setTestState((prev) => ({
        ...prev,
        isRunning: false,
        currentTest: "Complete!",
        results,
      }));

      onTestComplete?.(results);
      performanceMonitor.logMetrics(finalMetrics);
    } catch (error) {
      logger.error("Performance test failed:", { error });
      setTestState((prev) => ({
        ...prev,
        isRunning: false,
        currentTest: "Test Failed",
      }));
    }
  }, [
    testState.isRunning,
    testAnimations,
    testGestures,
    testMemoryUsage,
    metrics,
    performanceMonitor,
    onTestComplete,
  ]);

  // Animated styles for test visualization
  const animatedTestStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: testAnimationValue.value },
      { scale: testScaleValue.value },
      { rotate: `${testRotationValue.value}deg` },
    ],
  }));

  return (
    <FXContainerPresets.glass style={styles.container}>
      <Heading2 style={styles.title}>Performance Test Suite</Heading2>
      <BodySmall style={styles.subtitle}>
        Comprehensive testing of the new architecture
      </BodySmall>

      {/* Real-time Metrics */}
      {metrics && (
        <View style={styles.metricsContainer}>
          <View style={styles.metricRow}>
            <Label style={styles.metricLabel}>FPS:</Label>
            <Body
              style={[
                styles.metricValue,
                {
                  color:
                    metrics.fps >= 55
                      ? Theme.colors.textColor.success
                      : Theme.colors.textColor.error,
                },
              ]}
            >
              {metrics.fps}
            </Body>
          </View>
          <View style={styles.metricRow}>
            <Label style={styles.metricLabel}>Frame Time:</Label>
            <Body style={styles.metricValue}>
              {metrics.animationFrameTime}ms
            </Body>
          </View>
          <View style={styles.metricRow}>
            <Label style={styles.metricLabel}>Memory:</Label>
            <Body style={styles.metricValue}>
              {Math.round(metrics.memoryUsage / 1024 / 1024)}MB
            </Body>
          </View>
        </View>
      )}

      {/* Test Progress */}
      {testState.isRunning && (
        <View style={styles.progressContainer}>
          <Label style={styles.progressLabel}>{testState.currentTest}</Label>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${testState.progress}%` }]}
            />
          </View>
          <BodySmall style={styles.progressText}>
            {testState.progress}%
          </BodySmall>
        </View>
      )}

      {/* Test Visualization */}
      <View style={styles.testVisualization}>
        <Animated.View style={[styles.testBox, animatedTestStyle]} />
      </View>

      {/* Test Controls */}
      <View style={styles.controlsContainer}>
        <EliteButtonPresets.holographic
          title={
            testState.isRunning ? "Running Tests..." : "Run Performance Tests"
          }
          size="lg"
          loading={testState.isRunning}
          onPress={runTestSuite}
          style={styles.testButton}
        />
      </View>

      {/* Test Results */}
      {testState.results && (
        <View style={styles.resultsContainer}>
          <Heading2 style={styles.resultsTitle}>Test Results</Heading2>

          <View style={styles.resultItem}>
            <Label style={styles.resultLabel}>Overall Grade:</Label>
            <Body
              style={[
                styles.resultValue,
                { color: getGradeColor(testState.results.overallGrade) },
              ]}
            >
              {testState.results.overallGrade}
            </Body>
          </View>

          <View style={styles.resultItem}>
            <Label style={styles.resultLabel}>Animation FPS:</Label>
            <Body style={styles.resultValue}>
              {testState.results.animationFPS}
            </Body>
          </View>

          <View style={styles.resultItem}>
            <Label style={styles.resultLabel}>Gesture Response:</Label>
            <Body style={styles.resultValue}>
              {testState.results.gestureResponseTime}ms
            </Body>
          </View>

          <View style={styles.resultItem}>
            <Label style={styles.resultLabel}>Memory Usage:</Label>
            <Body style={styles.resultValue}>
              {Math.round(testState.results.memoryUsage / 1024 / 1024)}MB
            </Body>
          </View>

          <View style={styles.recommendationsContainer}>
            <Label style={styles.recommendationsTitle}>Recommendations:</Label>
            {testState.results.recommendations.map((rec, index) => (
              <BodySmall key={index} style={styles.recommendation}>
                • {rec}
              </BodySmall>
            ))}
          </View>
        </View>
      )}
    </FXContainerPresets.glass>
  );
}

// Helper function to get grade color
function getGradeColor(grade: string): string {
  switch (grade) {
    case "A+":
    case "A":
      return Theme.colors.textColor.success;
    case "B":
      return Theme.colors.textColor.accent;
    case "C":
      return Theme.colors.textColor.warning;
    case "D":
    case "F":
      return Theme.colors.textColor.error;
    default:
      return Theme.colors.textColor.primary;
  }
}

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
  },
  title: {
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    marginBottom: Theme.spacing.lg,
    color: getTextColor(Theme, 'secondary'),
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Theme.spacing.lg,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.neutral[50],
    borderRadius: Theme.borderRadius.lg,
  },
  metricRow: {
    alignItems: "center",
  },
  metricLabel: {
    color: getTextColor(Theme, 'secondary'),
    marginBottom: Theme.spacing.xs,
  },
  metricValue: {
    fontWeight: Theme.typography.fontWeight.bold,
  },
  progressContainer: {
    marginBottom: Theme.spacing.lg,
  },
  progressLabel: {
    marginBottom: Theme.spacing.sm,
    textAlign: "center",
  },
  progressBar: {
    height: 8,
    backgroundColor: Theme.colors.neutral[200],
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: Theme.spacing.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Theme.semantic.interactive.primary,
    borderRadius: 4,
  },
  progressText: {
    textAlign: "center",
    color: getTextColor(Theme, 'secondary'),
  },
  testVisualization: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Theme.spacing.lg,
  },
  testBox: {
    width: 50,
    height: 50,
    backgroundColor: Theme.semantic.interactive.primary,
    borderRadius: Theme.borderRadius.md,
  },
  controlsContainer: {
    marginBottom: Theme.spacing.lg,
  },
  testButton: {
    width: "100%",
  },
  resultsContainer: {
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.neutral[50],
    borderRadius: Theme.borderRadius.lg,
  },
  resultsTitle: {
    marginBottom: Theme.spacing.md,
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Theme.spacing.sm,
  },
  resultLabel: {
    color: getTextColor(Theme, 'secondary'),
  },
  resultValue: {
    fontWeight: Theme.typography.fontWeight.bold,
  },
  recommendationsContainer: {
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.borderColor.light.subtle,
  },
  recommendationsTitle: {
    marginBottom: Theme.spacing.sm,
    color: Theme.colors.textColor.accent,
  },
  recommendation: {
    marginBottom: Theme.spacing.xs,
    color: getTextColor(Theme, 'secondary'),
  },
});
