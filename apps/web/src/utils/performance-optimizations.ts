/**
 * ⚡ PERFORMANCE OPTIMIZATIONS
 * Mobile performance optimizations based on Tinder clone best practices
 * Provides utilities for smooth, responsive mobile experience
 */
import { useCallback, useRef, useEffect, useState } from 'react'
import { logger } from '@pawfectmatch/core';

// Debounce utility for performance
export const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};
// Throttle utility for performance
export const useThrottle = <T extends (...args: unknown[]) => void>(callback: T, delay: number): (...args: Parameters<T>) => void => {
    const lastRun = useRef(Date.now());
    return useCallback(((...args: Parameters<T>) => {
        if (Date.now() - lastRun.current >= delay) {
            callback(...args);
            lastRun.current = Date.now();
        }
    }), [callback, delay]);
};
// Intersection Observer for lazy loading
export const useIntersectionObserver = (elementRef: React.RefObject<Element>, options: IntersectionObserverInit = {}) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    useEffect(() => {
        const element = elementRef.current;
        if (!element)
            return;
        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, {
            threshold: 0.1,
            rootMargin: '50px',
            ...options,
        });
        observer.observe(element);
        return () => {
            observer.unobserve(element);
        };
    }, [elementRef, options]);
    return isIntersecting;
};
// Virtual scrolling hook for large lists
export const useVirtualScroll = (itemCount: number, itemHeight: number, containerHeight: number) => {
    const [scrollTop, setScrollTop] = useState(0);
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + Math.ceil(containerHeight / itemHeight) + 1, itemCount);
    return {
        visibleItems: Array.from({ length: endIndex - startIndex }, (_, i) => startIndex + i),
        totalHeight: itemCount * itemHeight,
        offsetY: startIndex * itemHeight,
        setScrollTop,
    };
};
// Image optimization hook
interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
}

export const useOptimizedImage = (src: string | null | undefined, options: ImageOptions = {}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isError, setIsError] = useState(false);
    const [optimizedSrc, setOptimizedSrc] = useState('');
    const { width = 400, height = 400, quality = 80, format = 'webp' } = options;
    useEffect(() => {
        if (!src)
            return;
        // Create optimized image URL
        const url = new URL(src);
        url.searchParams.set('w', width.toString());
        url.searchParams.set('h', height.toString());
        url.searchParams.set('q', quality.toString());
        url.searchParams.set('f', format);
        setOptimizedSrc(url.toString());
        setIsLoaded(false);
        setIsError(false);
        // Preload image
        const img = new Image();
        img.onload = () => setIsLoaded(true);
        img.onerror = () => setIsError(true);
        img.src = url.toString();
    }, [src, width, height, quality, format]);
    return {
        src: optimizedSrc,
        isLoaded,
        isError,
    };
};
// Memory management hook
export const useMemoryOptimization = () => {
    const [memoryUsage, setMemoryUsage] = useState(0);
    useEffect(() => {
        const updateMemoryUsage = () => {
            if ('memory' in performance) {
                const memory = performance.memory;
                setMemoryUsage(memory.usedJSHeapSize / memory.jsHeapSizeLimit);
            }
        };
        const interval = setInterval(updateMemoryUsage, 5000);
        updateMemoryUsage();
        return () => clearInterval(interval);
    }, []);
    const clearCache = useCallback(() => {
        // Clear various caches
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                });
            });
        }
        // Clear localStorage if needed
        // localStorage.clear();
        // Force garbage collection if available
        if ('gc' in window) {
            window.gc();
        }
    }, []);
    return {
        memoryUsage,
        clearCache,
    };
};
// Network optimization hook
export const useNetworkOptimization = () => {
    const [connection, setConnection] = useState(null);
    useEffect(() => {
        if ('connection' in navigator) {
            const conn = navigator.connection;
            setConnection({
                effectiveType: conn.effectiveType,
                downlink: conn.downlink,
                rtt: conn.rtt,
            });
            const handleChange = () => {
                setConnection({
                    effectiveType: conn.effectiveType,
                    downlink: conn.downlink,
                    rtt: conn.rtt,
                });
            };
            conn.addEventListener('change', handleChange);
            return () => conn.removeEventListener('change', handleChange);
        }
    }, []);
    const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' ||
        connection.effectiveType === '2g' ||
        connection.downlink < 1);
    const shouldReduceQuality = connection && (connection.effectiveType === 'slow-2g' ||
        connection.effectiveType === '2g');
    return {
        connection,
        isSlowConnection,
        shouldReduceQuality,
    };
};
// Animation performance hook
export const useAnimationPerformance = () => {
    const [fps, setFps] = useState(60);
    const frameCount = useRef(0);
    const lastTime = useRef(performance.now());
    useEffect(() => {
        const measureFPS = () => {
            frameCount.current++;
            const currentTime = performance.now();
            if (currentTime - lastTime.current >= 1000) {
                setFps(frameCount.current);
                frameCount.current = 0;
                lastTime.current = currentTime;
            }
            requestAnimationFrame(measureFPS);
        };
        requestAnimationFrame(measureFPS);
    }, []);
    const shouldReduceAnimations = fps < 30;
    return {
        fps,
        shouldReduceAnimations,
    };
};
// Bundle size optimization
export const useBundleOptimization = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
        // Mark as loaded after initial render
        const timer = setTimeout(() => {
            setIsLoaded(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);
    const lazyImport = useCallback(async (moduleName) => {
        if (!isLoaded)
            return null;
        try {
            const module = await import(moduleName);
            return module;
        }
        catch (error) {
            logger.error(`Failed to load module: ${moduleName}`, { error });
            return null;
        }
    }, [isLoaded]);
    return {
        isLoaded,
        lazyImport,
    };
};
// Touch optimization for mobile
export const useTouchOptimization = () => {
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const handleTouchStart = useCallback((e) => {
        const touch = e.touches[0];
        setTouchStart({
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now(),
        });
    }, []);
    const handleTouchEnd = useCallback((e) => {
        const touch = e.changedTouches[0];
        setTouchEnd({
            x: touch.clientX,
            y: touch.clientY,
            time: Date.now(),
        });
    }, []);
    const getSwipeDirection = useCallback(() => {
        if (!touchStart || !touchEnd)
            return null;
        const deltaX = touchEnd.x - touchStart.x;
        const deltaY = touchEnd.y - touchStart.y;
        const deltaTime = touchEnd.time - touchStart.time;
        // Minimum swipe distance and time
        if (Math.abs(deltaX) < 50 && Math.abs(deltaY) < 50)
            return null;
        if (deltaTime > 500)
            return null;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            return deltaX > 0 ? 'right' : 'left';
        }
        else {
            return deltaY > 0 ? 'down' : 'up';
        }
    }, [touchStart, touchEnd]);
    return {
        handleTouchStart,
        handleTouchEnd,
        getSwipeDirection,
    };
};
// Performance monitoring
export const usePerformanceMonitoring = () => {
    const [metrics, setMetrics] = useState(null);
    useEffect(() => {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.entryType === 'navigation') {
                        const navEntry = entry;
                        setMetrics(prev => ({
                            ...prev,
                            loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
                        }));
                    }
                });
            });
            observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
            return () => observer.disconnect();
        }
    }, []);
    return metrics;
};
//# sourceMappingURL=performance-optimizations.js.map