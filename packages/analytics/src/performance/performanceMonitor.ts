/**
 * Performance Monitoring System for PawfectMatch
 * Comprehensive performance tracking and optimization
 */

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

interface PerformanceReport {
  id: string;
  timestamp: string;
  metrics: PerformanceMetric[];
  summary: {
    totalMetrics: number;
    averageValue: number;
    maxValue: number;
    minValue: number;
  };
  recommendations: string[];
}

interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{
    name: string;
    size: number;
    gzippedSize: number;
    modules: Array<{
      name: string;
      size: number;
      gzippedSize: number;
    }>;
  }>;
  recommendations: string[];
}

interface PerformanceThresholds {
  pageLoadTime: number; // ms
  firstContentfulPaint: number; // ms
  largestContentfulPaint: number; // ms
  cumulativeLayoutShift: number;
  firstInputDelay: number; // ms
  bundleSize: number; // bytes
  memoryUsage: number; // MB
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private thresholds: PerformanceThresholds = {
    pageLoadTime: 3000,
    firstContentfulPaint: 2000,
    largestContentfulPaint: 4000,
    cumulativeLayoutShift: 0.1,
    firstInputDelay: 100,
    bundleSize: 1024 * 1024, // 1MB
    memoryUsage: 100 // 100MB
  };
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;

  constructor() {
    this.initializePerformanceMonitoring();
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if (typeof window === 'undefined') {
      return; // Server-side
    }

    try {
      this.setupPerformanceObservers();
      this.startMonitoring();
      console.log('Performance monitoring initialized');
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  }

  /**
   * Set up performance observers
   */
  private setupPerformanceObservers(): void {
    // Navigation timing
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric('navigation', entry.name, entry.duration, 'ms', {
            type: entry.entryType,
            startTime: entry.startTime
          });
        });
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);

      // Paint timing
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric('paint', entry.name, entry.startTime, 'ms', {
            type: entry.entryType
          });
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // Layout shift
      const layoutShiftObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: unknown) => {
          this.recordMetric('layout-shift', 'CLS', entry.value, 'score', {
            hadRecentInput: entry.hadRecentInput,
            sources: entry.sources
          });
        });
      });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(layoutShiftObserver);

      // First input delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: unknown) => {
          this.recordMetric('first-input-delay', 'FID', entry.processingStart - entry.startTime, 'ms', {
            target: entry.target?.tagName,
            eventType: entry.name
          });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    }
  }

  /**
   * Start performance monitoring
   */
  public startMonitoring(): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.startMemoryMonitoring();
    this.startBundleAnalysis();
    this.startCustomMetrics();
  }

  /**
   * Stop performance monitoring
   */
  public stopMonitoring(): void {
    this.isMonitoring = false;
    this.observers.forEach(observer => { observer.disconnect(); });
    this.observers = [];
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as unknown).memory;
        this.recordMetric('memory', 'used', memory.usedJSHeapSize / 1024 / 1024, 'MB');
        this.recordMetric('memory', 'total', memory.totalJSHeapSize / 1024 / 1024, 'MB');
        this.recordMetric('memory', 'limit', memory.jsHeapSizeLimit / 1024 / 1024, 'MB');
      }, 10000); // Every 10 seconds
    }
  }

  /**
   * Start bundle analysis
   */
  private startBundleAnalysis(): void {
    // Analyze current bundle size
    this.analyzeBundleSize();
    
    // Monitor bundle changes
    setInterval(() => {
      this.analyzeBundleSize();
    }, 60000); // Every minute
  }

  /**
   * Start custom metrics
   */
  private startCustomMetrics(): void {
    // Monitor API response times
    this.monitorAPIPerformance();
    
    // Monitor animation performance
    this.monitorAnimationPerformance();
    
    // Monitor user interactions
    this.monitorUserInteractions();
  }

  /**
   * Record a performance metric
   */
  public recordMetric(
    category: string,
    name: string,
    value: number,
    unit: string,
    context?: Record<string, unknown>
  ): void {
    const metric: PerformanceMetric = {
      id: `${category}-${name}-${Date.now()}`,
      name: `${category}.${name}`,
      value,
      unit,
      timestamp: new Date().toISOString(),
      context
    };

    this.metrics.push(metric);
    
    // Check thresholds
    this.checkThresholds(metric);
    
    // Limit metrics array size
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }

  /**
   * Check performance thresholds
   */
  private checkThresholds(metric: PerformanceMetric): void {
    const { name, value } = metric;
    
    if (name.includes('navigation') && value > this.thresholds.pageLoadTime) {
      console.warn(`Performance threshold exceeded: ${name} = ${value}ms`);
    }
    
    if (name.includes('paint') && value > this.thresholds.firstContentfulPaint) {
      console.warn(`Performance threshold exceeded: ${name} = ${value}ms`);
    }
    
    if (name.includes('layout-shift') && value > this.thresholds.cumulativeLayoutShift) {
      console.warn(`Performance threshold exceeded: ${name} = ${value}`);
    }
    
    if (name.includes('first-input-delay') && value > this.thresholds.firstInputDelay) {
      console.warn(`Performance threshold exceeded: ${name} = ${value}ms`);
    }
    
    if (name.includes('memory') && value > this.thresholds.memoryUsage) {
      console.warn(`Performance threshold exceeded: ${name} = ${value}MB`);
    }
  }

  /**
   * Analyze bundle size
   */
  private analyzeBundleSize(): void {
    try {
      // Get bundle size from performance API
      const navigation = performance.getEntriesByType('navigation')[0];
      const transferSize = navigation.transferSize;
      
      if (transferSize > 0) {
        this.recordMetric('bundle', 'transfer-size', transferSize, 'bytes');
        
        if (transferSize > this.thresholds.bundleSize) {
          console.warn(`Bundle size threshold exceeded: ${transferSize} bytes`);
        }
      }
    } catch (error) {
      console.error('Failed to analyze bundle size:', error);
    }
  }

  /**
   * Monitor API performance
   */
  private monitorAPIPerformance(): void {
    // Override fetch to monitor API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.recordMetric('api', 'response-time', duration, 'ms', {
          url: args[0]?.toString(),
          status: response.status,
          method: 'GET' // Default, would need to parse from args
        });
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.recordMetric('api', 'error-time', duration, 'ms', {
          url: args[0]?.toString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        throw error;
      }
    };
  }

  /**
   * Monitor animation performance
   */
  private monitorAnimationPerformance(): void {
    // Monitor animation frame rate
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        this.recordMetric('animation', 'fps', fps, 'fps');
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      if (this.isMonitoring) {
        requestAnimationFrame(measureFPS);
      }
    };
    
    requestAnimationFrame(measureFPS);
  }

  /**
   * Monitor user interactions
   */
  private monitorUserInteractions(): void {
    const interactionTypes = ['click', 'scroll', 'keydown', 'touchstart'];
    
    interactionTypes.forEach(type => {
      document.addEventListener(type, (event) => {
        const startTime = performance.now();
        
        // Measure interaction response time
        setTimeout(() => {
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          this.recordMetric('interaction', type, duration, 'ms', {
            target: (event.target as HTMLElement)?.tagName,
            timestamp: event.timeStamp
          });
        }, 0);
      });
    });
  }

  /**
   * Get performance report
   */
  public getPerformanceReport(): PerformanceReport {
    const recentMetrics = this.metrics.slice(-100); // Last 100 metrics
    const values = recentMetrics.map(m => m.value);
    
    const summary = {
      totalMetrics: recentMetrics.length,
      averageValue: values.reduce((a, b) => a + b, 0) / values.length,
      maxValue: Math.max(...values),
      minValue: Math.min(...values)
    };
    
    const recommendations = this.generateRecommendations(recentMetrics);
    
    return {
      id: `report-${Date.now()}`,
      timestamp: new Date().toISOString(),
      metrics: recentMetrics,
      summary,
      recommendations
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(metrics: PerformanceMetric[]): string[] {
    const recommendations: string[] = [];
    
    // Analyze metrics by category
    const categories = metrics.reduce<Record<string, PerformanceMetric[]>>((acc, metric) => {
      const category = metric.name.split('.')[0];
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(metric);
      return acc;
    }, {});
    
    // Navigation recommendations
    if (categories.navigation) {
      const navMetrics = categories.navigation;
      const avgLoadTime = navMetrics.reduce((sum, m) => sum + m.value, 0) / navMetrics.length;
      
      if (avgLoadTime > this.thresholds.pageLoadTime) {
        recommendations.push('Consider code splitting to reduce initial bundle size');
        recommendations.push('Optimize images and use modern formats (WebP, AVIF)');
        recommendations.push('Enable gzip compression on server');
      }
    }
    
    // Memory recommendations
    if (categories.memory) {
      const memoryMetrics = categories.memory;
      const avgMemory = memoryMetrics.reduce((sum, m) => sum + m.value, 0) / memoryMetrics.length;
      
      if (avgMemory > this.thresholds.memoryUsage) {
        recommendations.push('Implement memory cleanup for unused objects');
        recommendations.push('Use WeakMap/WeakSet for temporary data');
        recommendations.push('Consider lazy loading for non-critical components');
      }
    }
    
    // API recommendations
    if (categories.api) {
      const apiMetrics = categories.api;
      const avgResponseTime = apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length;
      
      if (avgResponseTime > 1000) {
        recommendations.push('Implement API response caching');
        recommendations.push('Consider using GraphQL for efficient data fetching');
        recommendations.push('Add request deduplication');
      }
    }
    
    // Animation recommendations
    if (categories.animation) {
      const animationMetrics = categories.animation;
      const avgFPS = animationMetrics.reduce((sum, m) => sum + m.value, 0) / animationMetrics.length;
      
      if (avgFPS < 30) {
        recommendations.push('Optimize animations using transform and opacity');
        recommendations.push('Use requestAnimationFrame for smooth animations');
        recommendations.push('Consider reducing animation complexity');
      }
    }
    
    return recommendations;
  }

  /**
   * Get bundle analysis
   */
  public getBundleAnalysis(): BundleAnalysis {
    // This would typically integrate with webpack-bundle-analyzer
    // For now, return a mock analysis
    return {
      totalSize: 1024 * 1024, // 1MB
      gzippedSize: 256 * 1024, // 256KB
      chunks: [
        {
          name: 'main',
          size: 512 * 1024,
          gzippedSize: 128 * 1024,
          modules: [
            { name: 'react', size: 100 * 1024, gzippedSize: 25 * 1024 },
            { name: 'react-dom', size: 150 * 1024, gzippedSize: 40 * 1024 }
          ]
        }
      ],
      recommendations: [
        'Consider code splitting for large components',
        'Remove unused dependencies',
        'Use dynamic imports for non-critical features'
      ]
    };
  }

  /**
   * Update performance thresholds
   */
  public updateThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * Get current thresholds
   */
  public getThresholds(): PerformanceThresholds {
    return { ...this.thresholds };
  }

  /**
   * Clear all metrics
   */
  public clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Export metrics for analysis
   */
  public exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }
}

export const performanceMonitor = new PerformanceMonitor();
