/**
 * 🚀 PERFORMANCE OPTIMIZATION UTILITIES
 * Advanced performance monitoring and optimization for jaw-dropping UX
 */

import React from 'react'
import { logger } from '@pawfectmatch/core';

// ====== LAZY LOADING UTILITIES ======
export const dynamicImport = <T>(
  importFn: () => Promise<T>,
  fallback?: React.ComponentType
) => {
  return React.lazy(async () => {
    const start = performance.now();
    
    try {
      const module = await importFn();
      const loadTime = performance.now() - start;
      
      // Log performance metrics
      if (typeof window !== 'undefined' && loadTime > 1000) {
        logger.warn(`Slow dynamic import detected: ${loadTime.toFixed(2)}ms`);
      }
      
      return { default: module as any };
    } catch (error) {
      logger.error('Dynamic import failed:', { error });
      return { default: fallback || (() => React.createElement('div', null, 'Loading failed')) };
    }
  });
};

// ====== IMAGE OPTIMIZATION ======
export const optimizeImageUrl = (
  url: string, 
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
    blur?: boolean;
  } = {}
) => {
  if (!url) return '/api/placeholder-pet.jpg';
  
  const { width = 400, height = 400, quality = 85, format = 'auto', blur = false } = options;
  
  // Cloudinary optimization
  if (url.includes('cloudinary.com') || url.includes('res.cloudinary.com')) {
    const baseUrl = url.split('/upload/')[0] + '/upload/';
    const imagePath = url.split('/upload/')[1];
    
    const transformations = [
      `w_${width}`,
      `h_${height}`,
      `q_${quality}`,
      'c_fill',
      'g_auto',
      format !== 'auto' ? `f_${format}` : 'f_auto',
      blur ? 'e_blur:300' : null,
    ].filter(Boolean).join(',');
    
    return `${baseUrl}${transformations}/${imagePath}`;
  }
  
  // Fallback for other URLs
  return url;
};

// ====== BUNDLE ANALYSIS ======
export const analyzeBundleSize = () => {
  if (typeof window === 'undefined') return;
  
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  
  const totalResources = scripts.length + styles.length;
  const bundleInfo = {
    scripts: scripts.length,
    styles: styles.length,
    total: totalResources,
    estimate: `~${(totalResources * 50).toFixed(0)}KB`, // Rough estimate
  };
  
  logger.info('📦 Bundle Analysis:', { bundleInfo });
  return bundleInfo;
};

// ====== PERFORMANCE MONITORING ======
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];
  
  constructor() {
    this.initializeObservers();
  }
  
  private initializeObservers() {
    if (typeof window === 'undefined') return;
    
    try {
      // Monitor loading performance
      const loadObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const nav = entry as PerformanceNavigationTiming;
            this.trackMetric('page_load', nav.loadEventEnd - nav.navigationStart);
            this.trackMetric('first_paint', nav.domContentLoadedEventEnd - nav.navigationStart);
          }
        }
      });
      
      loadObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(loadObserver);
      
      // Monitor largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackMetric('lcp', entry.startTime);
        }
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
      
      // Monitor cumulative layout shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.trackMetric('cls', clsValue);
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
      
    } catch (error) {
      logger.debug('Performance observers not supported');
    }
  }
  
  trackMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 10 measurements
    if (values.length > 10) {
      values.shift();
    }
    
    // Log concerning metrics
    if (name === 'page_load' && value > 3000) {
      logger.warn(`Slow page load detected: ${value.toFixed(2)}ms`);
    }
    
    if (name === 'lcp' && value > 2500) {
      logger.warn(`Poor LCP detected: ${value.toFixed(2)}ms`);
    }
    
    if (name === 'cls' && value > 0.1) {
      logger.warn(`High layout shift detected: ${value.toFixed(3)}`);
    }
  }
  
  getMetrics() {
    const summary: Record<string, any> = {};
    
    for (const [name, values] of this.metrics.entries()) {
      if (values.length > 0) {
        summary[name] = {
          current: values[values.length - 1],
          average: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length,
        };
      }
    }
    
    return summary;
  }
  
  generateReport() {
    const metrics = this.getMetrics();
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      recommendations: this.generateRecommendations(metrics),
      score: this.calculatePerformanceScore(metrics),
    };
    
    logger.info('📊 Performance Report:', { report });
    return report;
  }
  
  private generateRecommendations(metrics: Record<string, any>): string[] {
    const recommendations: string[] = [];
    
    if (metrics.page_load?.average > 2000) {
      recommendations.push('Consider code splitting to reduce initial bundle size');
    }
    
    if (metrics.lcp?.average > 2000) {
      recommendations.push('Optimize images and critical resources loading');
    }
    
    if (metrics.cls?.average > 0.05) {
      recommendations.push('Add proper dimensions to images and dynamic content');
    }
    
    return recommendations;
  }
  
  private calculatePerformanceScore(metrics: Record<string, any>): number {
    let score = 100;
    
    // Page load penalty
    if (metrics.page_load?.average > 3000) score -= 20;
    else if (metrics.page_load?.average > 2000) score -= 10;
    
    // LCP penalty
    if (metrics.lcp?.average > 2500) score -= 20;
    else if (metrics.lcp?.average > 1500) score -= 10;
    
    // CLS penalty
    if (metrics.cls?.average > 0.1) score -= 15;
    else if (metrics.cls?.average > 0.05) score -= 8;
    
    return Math.max(0, score);
  }
  
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// ====== ANIMATION PERFORMANCE ======
export const optimizeAnimations = () => {
  if (typeof window === 'undefined') return;
  
  // Detect reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Disable complex animations for accessibility
    document.documentElement.style.setProperty('--animation-duration', '0.01s');
    document.documentElement.style.setProperty('--animation-delay', '0s');
  }
  
  // Optimize for low-end devices
  const isLowEndDevice = (() => {
    if (navigator.deviceMemory && navigator.deviceMemory < 4) return true;
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return true;
    return false;
  })();
  
  if (isLowEndDevice) {
    document.documentElement.classList.add('reduced-animations');
  }
  
  return { prefersReducedMotion, isLowEndDevice };
};

// ====== MEMORY OPTIMIZATION ======
export const optimizeMemory = () => {
  if (typeof window === 'undefined') return;
  
  // Monitor memory usage
  const getMemoryInfo = () => {
    if (performance.memory) {
      const memory = performance.memory;
      return {
        used: (memory.usedJSHeapSize / 1048576).toFixed(2), // MB
        total: (memory.totalJSHeapSize / 1048576).toFixed(2), // MB
        limit: (memory.jsHeapSizeLimit / 1048576).toFixed(2), // MB
        percentage: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2),
      };
    }
    return null;
  };
  
  // Cleanup unused images
  const cleanupImages = () => {
    const images = document.querySelectorAll('img[data-cleanup="true"]');
    images.forEach(img => {
      if (!img.getBoundingClientRect().width) {
        img.remove();
      }
    });
  };
  
  // Periodic memory cleanup
  const startMemoryMonitoring = () => {
    setInterval(() => {
      const memInfo = getMemoryInfo();
      if (memInfo && parseFloat(memInfo.percentage) > 80) {
        logger.warn('High memory usage detected:', { memInfo });
        cleanupImages();
        
        // Trigger garbage collection if available
        if (window.gc) {
          window.gc();
        }
      }
    }, 30000); // Check every 30 seconds
  };
  
  return { getMemoryInfo, cleanupImages, startMemoryMonitoring };
};

// ====== NETWORK OPTIMIZATION ======
export const optimizeNetwork = () => {
  if (typeof window === 'undefined') return;
  
  // Detect connection quality
  const getConnectionInfo = () => {
    if (navigator.connection) {
      const conn = navigator.connection;
      return {
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData,
      };
    }
    return null;
  };
  
  // Adaptive loading based on connection
  const shouldOptimizeForConnection = () => {
    const conn = getConnectionInfo();
    if (!conn) return false;
    
    return (
      conn.saveData ||
      conn.effectiveType === 'slow-2g' ||
      conn.effectiveType === '2g' ||
      conn.downlink < 1
    );
  };
  
  return { getConnectionInfo, shouldOptimizeForConnection };
};

// ====== PRELOADING UTILITIES ======
export const preloadCriticalResources = () => {
  if (typeof window === 'undefined') return;
  
  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  };
  
  const preloadFont = (fontUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = fontUrl;
      link.onload = () => resolve();
      link.onerror = reject;
      document.head.appendChild(link);
    });
  };
  
  const preloadCriticalImages = async () => {
    const criticalImages = [
      '/icons/paw-icon.svg',
      '/images/hero-pets.webp',
      '/images/dashboard-bg.webp',
    ];
    
    try {
      await Promise.all(criticalImages.map(preloadImage));
      logger.info('✅ Critical images preloaded');
    } catch (error) {
      logger.warn('Some critical images failed to preload:', { error });
    }
  };
  
  return { preloadImage, preloadFont, preloadCriticalImages };
};

// ====== EXPORTS ======
export const createPerformanceMonitor = () => new PerformanceMonitor();
