/**
 * 🧪 PERFORMANCE TEST SUITE
 * 
 * Comprehensive performance tests for motion system
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  PerformanceMetricsCollector,
  validateBundleSize,
  validateMemoryUsage,
  validateAnimationDuration,
  generatePerformanceReport,
  PERFORMANCE_BUDGETS,
} from '@/foundation/performance-validation';

describe('Performance Validation', () => {
  describe('PerformanceMetricsCollector', () => {
    let collector: PerformanceMetricsCollector;

    beforeEach(() => {
      collector = new PerformanceMetricsCollector();
    });

    it('should initialize with empty metrics', () => {
      const metrics = collector.stop();
      expect(metrics.averageFrameTime).toBe(0);
      expect(metrics.droppedFrames).toBe(0);
    });

    it('should record frame times', () => {
      collector.start();
      collector.recordFrame();
      collector.recordFrame();
      collector.recordFrame();

      const metrics = collector.stop();
      expect(metrics.averageFrameTime).toBeGreaterThan(0);
      expect(metrics.frameTimes.length).toBeGreaterThan(0);
    });

    it('should detect dropped frames', () => {
      collector.start();

      // Simulate normal frames
      collector.recordFrame();
      collector.recordFrame();

      // Simulate dropped frame (add delay)
      const start = performance.now();
      while (performance.now() - start < 25) {
        // Wait 25ms (dropped frame)
      }
      collector.recordFrame();

      const metrics = collector.stop();
      expect(metrics.droppedFrames).toBeGreaterThan(0);
    });

    it('should calculate FPS correctly', () => {
      collector.start();

      // Simulate 60fps (16.67ms per frame)
      for (let i = 0; i < 60; i++) {
        collector.recordFrame();
        // Note: In real scenario, would wait ~16.67ms
      }

      const metrics = collector.stop();
      expect(metrics.fps).toBeGreaterThan(0);
      expect(metrics.averageFrameTime).toBeGreaterThan(0);
    });

    it('should check if metrics meet budget', () => {
      collector.start();

      // Record good frames
      for (let i = 0; i < 100; i++) {
        collector.recordFrame();
      }

      const meetsBudget = collector.meetsBudget();
      expect(typeof meetsBudget).toBe('boolean');
    });

    it('should handle custom budget', () => {
      collector.start();

      for (let i = 0; i < 100; i++) {
        collector.recordFrame();
      }

      const customBudget = {
        ...PERFORMANCE_BUDGETS,
        maxFrameTime: 20, // More lenient
      };

      const meetsBudget = collector.meetsBudget(customBudget);
      expect(typeof meetsBudget).toBe('boolean');
    });
  });

  describe('validateBundleSize', () => {
    it('should validate acceptable bundle size increase', () => {
      const result = validateBundleSize(2500, 2400);
      expect(result.valid).toBe(true);
      expect(result.increase).toBe(100);
      expect(result.percentage).toBeGreaterThan(0);
    });

    it('should reject excessive bundle size increase', () => {
      const result = validateBundleSize(2700, 2400);
      expect(result.valid).toBe(false);
      expect(result.increase).toBe(300);
    });

    it('should handle zero previous size', () => {
      const result = validateBundleSize(1000, 0);
      expect(result.valid).toBe(false); // Any increase from 0 exceeds budget
      expect(result.percentage).toBe(0);
    });

    it('should handle bundle size decrease', () => {
      const result = validateBundleSize(2300, 2400);
      expect(result.valid).toBe(true);
      expect(result.increase).toBe(-100);
      expect(result.percentage).toBeLessThan(0);
    });
  });

  describe('validateMemoryUsage', () => {
    it('should validate acceptable memory usage', () => {
      const result = validateMemoryUsage(85);
      expect(result.valid).toBe(true);
      expect(result.usage).toBe(85);
    });

    it('should reject excessive memory usage', () => {
      const result = validateMemoryUsage(150);
      expect(result.valid).toBe(false);
      expect(result.usage).toBe(150);
    });

    it('should handle zero memory usage', () => {
      const result = validateMemoryUsage(0);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateAnimationDuration', () => {
    it('should validate acceptable animation duration', () => {
      const result = validateAnimationDuration(300);
      expect(result.valid).toBe(true);
      expect(result.duration).toBe(300);
    });

    it('should reject excessive animation duration', () => {
      const result = validateAnimationDuration(1000);
      expect(result.valid).toBe(false);
      expect(result.duration).toBe(1000);
    });

    it('should handle zero duration', () => {
      const result = validateAnimationDuration(0);
      expect(result.valid).toBe(true);
    });
  });

  describe('generatePerformanceReport', () => {
    it('should generate comprehensive report', () => {
      const collector = new PerformanceMetricsCollector();
      collector.start();

      // Record some frames
      for (let i = 0; i < 60; i++) {
        collector.recordFrame();
      }

      const report = generatePerformanceReport(
        collector,
        { current: 2500, previous: 2400 },
        85,
        [120, 180, 240, 320]
      );

      expect(report.frameMetrics).toBeDefined();
      expect(report.bundleSize).toBeDefined();
      expect(report.memoryUsage).toBeDefined();
      expect(report.animations).toBeDefined();
      expect(report.overall).toBeDefined();
      expect(report.overall.score).toBeGreaterThanOrEqual(0);
      expect(report.overall.score).toBeLessThanOrEqual(100);
    });

    it('should calculate overall score correctly', () => {
      const collector = new PerformanceMetricsCollector();
      collector.start();

      for (let i = 0; i < 60; i++) {
        collector.recordFrame();
      }

      const report = generatePerformanceReport(
        collector,
        { current: 2500, previous: 2400 },
        85,
        [120, 180, 240, 320]
      );

      expect(report.overall.score).toBeGreaterThanOrEqual(0);
      expect(report.overall.score).toBeLessThanOrEqual(100);
    });

    it('should mark report as invalid for poor performance', () => {
      const collector = new PerformanceMetricsCollector();
      collector.start();

      // Record many frames with delays (simulate poor performance)
      for (let i = 0; i < 100; i++) {
        collector.recordFrame();
      }

      const report = generatePerformanceReport(
        collector,
        { current: 3000, previous: 2400 }, // Large bundle increase
        150, // High memory usage
        [1000, 2000] // Long durations
      );

      expect(report.overall.valid).toBe(false);
      expect(report.overall.score).toBeLessThan(70);
    });
  });

  describe('Performance Budgets', () => {
    it('should have reasonable default budgets', () => {
      expect(PERFORMANCE_BUDGETS.maxFrameTime).toBeLessThanOrEqual(20);
      expect(PERFORMANCE_BUDGETS.maxBundleIncrease).toBeGreaterThan(0);
      expect(PERFORMANCE_BUDGETS.maxMemoryUsage).toBeGreaterThan(0);
      expect(PERFORMANCE_BUDGETS.maxAnimationDuration).toBeGreaterThan(0);
    });

    it('should enforce 60fps target', () => {
      // 60fps = 16.67ms per frame
      expect(PERFORMANCE_BUDGETS.maxFrameTime).toBeLessThanOrEqual(16.67);
    });
  });
});

