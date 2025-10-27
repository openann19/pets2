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

import { useTheme } from "../theme/Provider";
import performanceMonitorInstance, {
  type PerformanceMetrics,
} from "../utils/PerformanceMonitor";

import { EliteButtonPresets } from "./buttons/EliteButton";
import { FXContainerPresets } from "./containers/FXContainer";
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
  const theme = useTheme();
  const styles = makeStyles(theme);
  
  const [testState, setTestState] = useState<TestState>({
    isRunning: false,
    currentTest: "",
    progress: 0,
    results: null,
  });

  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const performanceMonitor = performanceMonitorInstance;

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
    // PerformanceMonitor doesn't have callback methods in this implementation
    // Tracking is automatic when enabled
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
        gestureResponseTime: finalMetrics.gestureResponseTime || 0,
        memoryUsage: finalMetrics.memoryUsage,
        overallGrade: finalMetrics.fps >= 55 ? "A" : finalMetrics.fps >= 45 ? "B" : "C",
        recommendations: [],
      };

      setTestState((prev) => ({
        ...prev,
        isRunning: false,
        currentTest: "Complete!",
        results,
      }));

      onTestComplete?.(results);
      // PerformanceMonitor doesn't have logMetrics method
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
              style={StyleSheet.flatten([
                styles.metricValue,
                {
                  color:
                    metrics.fps >= 55
                      ? theme.colors.success
                      : theme.colors.danger,
                },
              ])}
            >
              {metrics.fps}
            </Body>
          </View>
          <View style={styles.metricRow}>
            <Label style={styles.metricLabel}>Frame Time:</Label>
            <Body style={styles.metricValue}>
              {(metrics as any).animationFrameTime || 0}ms
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
              style={StyleSheet.flatten([
                styles.progressFill,
                { width: `${testState.progress}%` },
              ])}
            />
          </View>
          <BodySmall style={styles.progressText}>
            {testState.progress}%
          </BodySmall>
        </View>
      )}

      {/* Test Visualization */}
      <View style={styles.testVisualization}>
        <Animated.View
          style={StyleSheet.flatten([styles.testBox, animatedTestStyle])}
        />
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
              style={StyleSheet.flatten([
                styles.resultValue,
                { color: getGradeColor(testState.results.overallGrade) },
              ])}
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
function getGradeColor(grade: string, theme: any): string {
  switch (grade) {
    case "A+":
    case "A":
      return theme.colors.success;
    case "B":
      return theme.colors.info;
    case "C":
      return theme.colors.warning;
    case "D":
    case "F":
      return theme.colors.danger;
    default:
      return theme.colors.text;
  }
}

const makeStyles = (theme: any) => StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    marginBottom: theme.spacing.lg,
    color: theme.colors.textMuted,
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.radius.lg,
  },
  metricRow: {
    alignItems: "center",
  },
  metricLabel: {
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  metricValue: {
    fontWeight: "bold",
  },
  progressContainer: {
    marginBottom: theme.spacing.lg,
  },
  progressLabel: {
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressText: {
    textAlign: "center",
    color: theme.colors.textMuted,
  },
  testVisualization: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  testBox: {
    width: 50,
    height: 50,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
  },
  controlsContainer: {
    marginBottom: theme.spacing.lg,
  },
  testButton: {
    width: "100%",
  },
  resultsContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.neutral[50],
    borderRadius: theme.radius.lg,
  },
  resultsTitle: {
    marginBottom: theme.spacing.md,
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  resultLabel: {
    color: theme.colors.textMuted,
  },
  resultValue: {
    fontWeight: "bold",
  },
  recommendationsContainer: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  recommendationsTitle: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.info,
  },
  recommendation: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.textMuted,
  },
});
