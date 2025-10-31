import { Platform, Dimensions } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { logger } from '../services/logger';

export interface PerformanceMetrics {
  timestamp: number;
  deviceInfo: {
    platform: string;
    osVersion: string;
    deviceModel?: string;
    screenWidth: number;
    screenHeight: number;
    memoryInfo?: any;
  };
  networkInfo: {
    type: string;
    isConnected: boolean;
    strength?: number;
  };
  appPerformance: {
    memoryUsage?: number;
    cpuUsage?: number;
    fps?: number;
  };
  callMetrics?: {
    sessionId: string;
    duration: number;
    quality: string;
    reconnections: number;
    avgBitrate: number;
    packetLoss: number;
  };
}

export interface AppHealthReport {
  timestamp: number;
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
  issues: string[];
  recommendations: string[];
  metrics: PerformanceMetrics;
}

class PerformanceMonitorService {
  private static instance: PerformanceMonitorService;
  private metrics: PerformanceMetrics[] = [];
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;
  private readonly maxMetricsHistory = 100;
  private readonly healthCheckIntervalMs = 30000; // 30 seconds

  public static getInstance(): PerformanceMonitorService {
    if (!PerformanceMonitorService.instance) {
      PerformanceMonitorService.instance = new PerformanceMonitorService();
    }
    return PerformanceMonitorService.instance;
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.healthCheckInterval !== null) {
      return; // Already monitoring
    }

    logger.info('Starting performance monitoring');

    // Initial metrics collection
    this.collectMetrics();

    // Set up periodic monitoring
    this.healthCheckInterval = setInterval(() => {
      this.collectMetrics();
      this.performHealthCheck();
    }, this.healthCheckIntervalMs);
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (this.healthCheckInterval !== null) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      logger.info('Stopped performance monitoring');
    }
  }

  /**
   * Collect current performance metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

      // Get network information
      const netInfo = await NetInfo.fetch();

      // Get device information
      const deviceInfo = {
        platform: Platform.OS,
        osVersion: Platform.Version.toString(),
        screenWidth,
        screenHeight,
      };

      // Get network information
      const networkInfo = {
        type: netInfo.type || 'unknown',
        isConnected: netInfo.isConnected ?? false,
        strength: this.estimateNetworkStrength(netInfo),
      };

      const metrics: PerformanceMetrics = {
        timestamp: Date.now(),
        deviceInfo,
        networkInfo,
        appPerformance: {
          // These would be populated by native modules in production
          memoryUsage: undefined,
          cpuUsage: undefined,
          fps: undefined,
        },
      };

      // Add to metrics history
      this.metrics.push(metrics);

      // Keep only recent metrics
      if (this.metrics.length > this.maxMetricsHistory) {
        this.metrics = this.metrics.slice(-this.maxMetricsHistory);
      }

      logger.debug('Performance metrics collected', {
        platform: deviceInfo.platform,
        network: networkInfo.type,
        connected: networkInfo.isConnected,
      });
    } catch (error) {
      logger.warn('Failed to collect performance metrics', { error });
    }
  }

  /**
   * Perform health check and generate report
   */
  private performHealthCheck(): void {
    const report = this.generateHealthReport();

    // Log issues if any
    if (report.issues.length > 0) {
      logger.warn('Performance health check issues detected', {
        issues: report.issues,
        overallHealth: report.overallHealth,
      });
    }

    // Log recommendations if any
    if (report.recommendations.length > 0) {
      logger.info('Performance recommendations', {
        recommendations: report.recommendations,
      });
    }
  }

  /**
   * Generate comprehensive health report
   */
  generateHealthReport(): AppHealthReport {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    if (!latestMetrics) {
      return {
        timestamp: Date.now(),
        overallHealth: 'fair',
        issues: ['No metrics available'],
        recommendations: ['Start performance monitoring'],
        metrics: {} as PerformanceMetrics,
      };
    }

    const issues: string[] = [];
    const recommendations: string[] = [];

    // Network health checks
    if (!latestMetrics.networkInfo.isConnected) {
      issues.push('No network connection');
      recommendations.push('Check network connectivity');
    } else if (latestMetrics.networkInfo.strength && latestMetrics.networkInfo.strength < 3) {
      issues.push('Poor network quality');
      recommendations.push('Consider using WiFi for better performance');
    }

    // Device performance checks
    const { screenWidth, screenHeight } = latestMetrics.deviceInfo;
    if (screenWidth * screenHeight > 1000000) {
      // Very high resolution
      recommendations.push('High resolution device - ensure optimized assets');
    }

    // Memory and performance checks (would be more comprehensive with native modules)
    // For now, provide general recommendations

    // Determine overall health
    let overallHealth: AppHealthReport['overallHealth'] = 'excellent';

    if (issues.length > 2) {
      overallHealth = 'poor';
    } else if (issues.length > 0) {
      overallHealth = 'fair';
    } else if (recommendations.length > 0) {
      overallHealth = 'good';
    }

    return {
      timestamp: Date.now(),
      overallHealth,
      issues,
      recommendations,
      metrics: latestMetrics,
    };
  }

  /**
   * Record call performance metrics
   */
  recordCallMetrics(sessionId: string, metrics: PerformanceMetrics['callMetrics']): void {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    if (latestMetrics) {
      latestMetrics.callMetrics = metrics;

      logger.info('Call metrics recorded', {
        sessionId,
        duration: metrics.duration,
        quality: metrics.quality,
        reconnections: metrics.reconnections,
      });
    }
  }

  /**
   * Get recent performance metrics
   */
  getRecentMetrics(count: number = 10): PerformanceMetrics[] {
    return this.metrics.slice(-count);
  }

  /**
   * Get latest health report
   */
  getHealthReport(): AppHealthReport {
    return this.generateHealthReport();
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): {
    metrics: PerformanceMetrics[];
    summary: {
      totalMetrics: number;
      timeRange: { start: number; end: number };
      networkTypes: string[];
      avgNetworkStrength: number;
      healthTrend: string;
    };
  } {
    const summary = {
      totalMetrics: this.metrics.length,
      timeRange: {
        start: this.metrics[0]?.timestamp || 0,
        end: this.metrics[this.metrics.length - 1]?.timestamp || 0,
      },
      networkTypes: [...new Set(this.metrics.map((m) => m.networkInfo.type))],
      avgNetworkStrength: this.calculateAverageNetworkStrength(),
      healthTrend: this.calculateHealthTrend(),
    };

    return {
      metrics: this.metrics,
      summary,
    };
  }

  /**
   * Estimate network strength based on connection type
   */
  private estimateNetworkStrength(netInfo: any): number {
    switch (netInfo.type) {
      case 'wifi':
        return 5; // Assume good WiFi
      case 'cellular':
        // Estimate based on cellular generation
        if (netInfo.details?.cellularGeneration === '5g') return 5;
        if (netInfo.details?.cellularGeneration === '4g') return 4;
        if (netInfo.details?.cellularGeneration === '3g') return 2;
        return 1; // 2G or unknown
      case 'ethernet':
        return 5;
      default:
        return netInfo.isConnected ? 3 : 0;
    }
  }

  /**
   * Calculate average network strength
   */
  private calculateAverageNetworkStrength(): number {
    if (this.metrics.length === 0) return 0;

    const totalStrength = this.metrics.reduce((sum, m) => sum + (m.networkInfo.strength || 0), 0);
    return Math.round(totalStrength / this.metrics.length);
  }

  /**
   * Calculate health trend over time
   */
  private calculateHealthTrend(): string {
    if (this.metrics.length < 2) return 'stable';

    const recent = this.metrics.slice(-5); // Last 5 metrics
    const older = this.metrics.slice(-10, -5); // Previous 5

    if (recent.length === 0 || older.length === 0) return 'stable';

    const recentAvgStrength =
      older.reduce((sum, m) => sum + (m.networkInfo.strength || 0), 0) / older.length;
    const olderAvgStrength =
      recent.reduce((sum, m) => sum + (m.networkInfo.strength || 0), 0) / recent.length;

    if (olderAvgStrength > recentAvgStrength) return 'degrading';
    if (olderAvgStrength < recentAvgStrength) return 'improving';
    return 'stable';
  }
}

export default PerformanceMonitorService.getInstance();
