/**
 * Mobile Performance Optimization Utilities
 * Provides lazy loading, bundle splitting, and performance monitoring for mobile devices
 */
import { useEffect, useState, useCallback, useRef } from 'react'
import { logger } from '@pawfectmatch/core';
;
/**
 * Hook for lazy loading components with intersection observer
 */
export function useLazyLoad(options = {}) {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef(null);
    useEffect(() => {
        const element = elementRef.current;
        if (!element)
            return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, {
            rootMargin: '50px',
            threshold: 0.1,
            ...options,
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, [options]);
    return { isVisible, elementRef };
}
/**
 * Hook for performance monitoring on mobile devices
 */
export function usePerformanceMonitor() {
    const [metrics, setMetrics] = useState({
        loadTime: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        firstInputDelay: 0,
        cumulativeLayoutShift: 0,
        isMobile: false,
    });
    useEffect(() => {
        if (typeof window === 'undefined')
            return;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        // Performance observer for Core Web Vitals
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
                switch (entry.entryType) {
                    case 'navigation':
                        const navEntry = entry;
                        setMetrics(prev => ({
                            ...prev,
                            loadTime: navEntry.loadEventEnd - navEntry.fetchStart,
                        }));
                        break;
                    case 'paint':
                        const paintEntry = entry;
                        if (paintEntry.name === 'first-contentful-paint') {
                            setMetrics(prev => ({
                                ...prev,
                                firstContentfulPaint: paintEntry.startTime,
                            }));
                        }
                        break;
                    case 'largest-contentful-paint':
                        setMetrics(prev => ({
                            ...prev,
                            largestContentfulPaint: entry.startTime,
                        }));
                        break;
                    case 'first-input':
                        const fidEntry = entry;
                        setMetrics(prev => ({
                            ...prev,
                            firstInputDelay: fidEntry.processingStart - fidEntry.startTime,
                        }));
                        break;
                    case 'layout-shift':
                        if (!entry.hadRecentInput) {
                            setMetrics(prev => ({
                                ...prev,
                                cumulativeLayoutShift: prev.cumulativeLayoutShift + entry.value,
                            }));
                        }
                        break;
                }
            });
        });
        // Observe all performance entry types
        try {
            observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
        }
        catch (error) {
            logger.warn('Performance Observer not fully supported:', { error });
        }
        setMetrics(prev => ({ ...prev, isMobile }));
        return () => observer.disconnect();
    }, []);
    return metrics;
}
/**
 * Hook for optimizing images on mobile
 */
export function useOptimizedImage(src, options = {}) {
    const [optimizedSrc, setOptimizedSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw', quality = 75 } = options;
    useEffect(() => {
        if (!src)
            return;
        // For mobile devices, use lower quality and smaller sizes
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const img = new Image();
        img.onload = () => {
            setOptimizedSrc(src);
            setIsLoading(false);
        };
        img.onerror = () => {
            setError('Failed to load image');
            setIsLoading(false);
        };
        // Add mobile-specific optimizations
        if (isMobile) {
            // Use WebP if supported
            const supportsWebP = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
            if (supportsWebP && !src.includes('.webp')) {
                // Convert to WebP format (this would need server-side support)
                setOptimizedSrc(src.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
            }
        }
        img.src = src;
    }, [src, sizes, quality]);
    return { optimizedSrc, isLoading, error };
}
/**
 * Hook for managing bundle splitting and code splitting
 */
export function useCodeSplitting() {
    const [loadedModules, setLoadedModules] = useState(new Set());
    const loadModule = useCallback(async (moduleName, importFn) => {
        if (loadedModules.has(moduleName)) {
            return;
        }
        try {
            await importFn();
            setLoadedModules(prev => new Set([...prev, moduleName]));
        }
        catch (error) {
            logger.error(`Failed to load module ${moduleName}:`, { error });
        }
    }, [loadedModules]);
    const isModuleLoaded = useCallback((moduleName) => {
        return loadedModules.has(moduleName);
    }, [loadedModules]);
    return { loadModule, isModuleLoaded };
}
/**
 * Hook for managing memory usage on mobile devices
 */
export function useMemoryOptimization() {
    const [memoryInfo, setMemoryInfo] = useState({
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
        isLowMemory: false,
    });
    useEffect(() => {
        const checkMemory = () => {
            if ('memory' in performance) {
                const memory = performance.memory;
                const usedMB = memory.usedJSHeapSize / 1024 / 1024;
                const totalMB = memory.totalJSHeapSize / 1024 / 1024;
                const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
                setMemoryInfo({
                    usedJSHeapSize: memory.usedJSHeapSize,
                    totalJSHeapSize: memory.totalJSHeapSize,
                    jsHeapSizeLimit: memory.jsHeapSizeLimit,
                    isLowMemory: usedMB / limitMB > 0.8, // 80% threshold
                });
            }
        };
        // Check memory every 30 seconds
        const interval = setInterval(checkMemory, 30000);
        checkMemory(); // Initial check
        return () => clearInterval(interval);
    }, []);
    const clearCache = useCallback(() => {
        // Clear various caches to free memory
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                });
            });
        }
        // Force garbage collection if available
        if ('gc' in window) {
            window.gc();
        }
    }, []);
    return { memoryInfo, clearCache };
}
/**
 * Utility for preloading critical resources
 */
export function preloadCriticalResources() {
    if (typeof window === 'undefined')
        return;
    const criticalResources = [
        // Add critical CSS, fonts, and images here
        '/fonts/inter-var.woff2',
        '/icons/icon-192x192.png',
    ];
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        if (resource.endsWith('.woff2')) {
            link.as = 'font';
            link.type = 'font/woff2';
            link.crossOrigin = 'anonymous';
        }
        else if (resource.endsWith('.png') || resource.endsWith('.jpg')) {
            link.as = 'image';
        }
        document.head.appendChild(link);
    });
}
/**
 * Utility for optimizing touch interactions
 */
export function optimizeTouchInteractions() {
    if (typeof window === 'undefined')
        return;
    // Add touch-action CSS to prevent zoom on double-tap
    const style = document.createElement('style');
    style.textContent = `
    * {
      touch-action: manipulation;
    }
    
    input, textarea, select {
      touch-action: auto;
    }
    
    button, [role="button"] {
      touch-action: manipulation;
    }
  `;
    document.head.appendChild(style);
}
/**
 * Initialize mobile performance optimizations
 */
export function initializeMobileOptimizations() {
    if (typeof window === 'undefined')
        return;
    // Preload critical resources
    preloadCriticalResources();
    // Optimize touch interactions
    optimizeTouchInteractions();
    // Add mobile-specific meta tags
    const metaTags = [
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    ];
    metaTags.forEach(tag => {
        if (!document.querySelector(`meta[name="${tag.name}"]`)) {
            const meta = document.createElement('meta');
            meta.name = tag.name;
            meta.content = tag.content;
            document.head.appendChild(meta);
        }
    });
}
//# sourceMappingURL=mobile-performance.js.map