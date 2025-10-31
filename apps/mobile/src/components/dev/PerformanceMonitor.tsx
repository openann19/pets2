/**
 * 🎯 PERFORMANCE MONITOR COMPONENT
 * 
 * Real-time FPS and frame time monitoring for animation performance
 * Used during development and testing to ensure 60fps performance
 * 
 * Phase 0: Performance Baseline - Part of animation enhancement plan
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

interface PerformanceMetrics {
  fps: number;
  frameTime: number; // ms
  jankyFrames: number; // frames > 16.67ms
  averageFrameTime: number;
}

interface PerformanceMonitorProps {
  /** Enable performance monitoring */
  enabled?: boolean;
  /** Update interval in ms */
  updateInterval?: number;
  /** Show compact view */
  compact?: boolean;
  /** Position on screen */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Performance Monitor Component
 * Displays real-time FPS and frame time metrics
 */
export function PerformanceMonitor({
  enabled = __DEV__,
  updateInterval = 1000,
  compact = false,
  position = 'top-right',
}: PerformanceMonitorProps): React.JSX.Element | null {
  const theme = useTheme() as AppTheme;
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    jankyFrames: 0,
    averageFrameTime: 16.67,
  });

  useEffect(() => {
    if (!enabled) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let jankyFrameCount = 0;
    const frameTimes: number[] = [];
    const maxFrameTimeHistory = 60; // Keep last 60 frames

    const measure = () => {
      const currentTime = performance.now();
      const delta = currentTime - lastTime;
      
      frameCount++;
      
      // Calculate frame time
      const frameTime = delta;
      frameTimes.push(frameTime);
      
      // Keep only last N frames
      if (frameTimes.length > maxFrameTimeHistory) {
        frameTimes.shift();
      }
      
      // Count janky frames (>16.67ms for 60fps)
      if (frameTime > 16.67) {
        jankyFrameCount++;
      }
      
      // Update metrics every second
      if (delta >= updateInterval) {
        const currentFps = Math.round((frameCount * 1000) / delta);
        const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        const jankyPercentage = (jankyFrameCount / frameCount) * 100;
        
        setMetrics({
          fps: currentFps,
          frameTime: frameTime,
          jankyFrames: Math.round(jankyPercentage * 10) / 10, // 1 decimal place
          averageFrameTime: Math.round(avgFrameTime * 100) / 100, // 2 decimal places
        });
        
        // Reset counters
        frameCount = 0;
        jankyFrameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measure);
    };
    
    const rafId = requestAnimationFrame(measure);
    
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [enabled, updateInterval]);

  if (!enabled) return null;

  const styles = makeStyles(theme);
  const positionStyle = getPositionStyle(position);
  
  // Color coding based on performance
  const fpsColor = metrics.fps >= 60 ? theme.colors.success : metrics.fps >= 55 ? theme.colors.warning : theme.colors.danger;
  const frameTimeColor = metrics.averageFrameTime < 16 ? theme.colors.success : metrics.averageFrameTime < 20 ? theme.colors.warning : theme.colors.danger;

  if (compact) {
    return (
      <View style={[styles.container, styles.compact, positionStyle]}>
        <Text style={[styles.text, styles.compactText, { color: fpsColor }]}>
          {metrics.fps} FPS
        </Text>
        <Text style={[styles.text, styles.compactText, { color: frameTimeColor }]}>
          {metrics.averageFrameTime.toFixed(1)}ms
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, positionStyle]}>
      <Text style={styles.title}>Performance</Text>
      <View style={styles.row}>
        <Text style={styles.label}>FPS:</Text>
        <Text style={[styles.value, { color: fpsColor }]}>{metrics.fps}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Frame Time:</Text>
        <Text style={[styles.value, { color: frameTimeColor }]}>
          {metrics.averageFrameTime.toFixed(2)}ms
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Janky:</Text>
        <Text style={[styles.value, { color: metrics.jankyFrames > 3 ? theme.colors.danger : theme.colors.success }]}>
          {metrics.jankyFrames}%
        </Text>
      </View>
    </View>
  );
}

function getPositionStyle(position: PerformanceMonitorProps['position']) {
  const base = {
    position: 'absolute' as const,
    zIndex: 9999,
  };
  
  switch (position) {
    case 'top-left':
      return { ...base, top: 50, left: 16 };
    case 'top-right':
      return { ...base, top: 50, right: 16 };
    case 'bottom-left':
      return { ...base, bottom: 50, left: 16 };
    case 'bottom-right':
      return { ...base, bottom: 50, right: 16 };
    default:
      return { ...base, top: 50, right: 16 };
  }
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.utils.alpha(theme.colors.bg, 0.95),
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: 140,
      ...Platform.select({
        ios: {
          shadowColor: theme.palette.neutral[950],
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    compact: {
      padding: 8,
      minWidth: 80,
      alignItems: 'center',
    },
    title: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    label: {
      fontSize: 11,
      color: theme.colors.onMuted,
      fontWeight: '500',
    },
    value: {
      fontSize: 11,
      fontWeight: '700',
      fontFamily: Platform.select({
        ios: 'Menlo',
        android: 'monospace',
      }),
    },
    text: {
      fontSize: 10,
      fontWeight: '600',
    },
    compactText: {
      fontFamily: Platform.select({
        ios: 'Menlo',
        android: 'monospace',
      }),
    },
  });

export default PerformanceMonitor;

