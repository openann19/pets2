/**
 * 🔥 PERFORMANCE OPTIMIZATION UTILITIES
 * Advanced performance monitoring and optimization
 */

import { lazy, ComponentType, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Error Fallback Component
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-800 font-semibold">Failed to load component</p>
      <p className="text-red-600 text-sm mt-1">{error.message}</p>
    </div>
  );
}

// Loading Fallback Component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

/**
 * Create a lazy component with error boundary and loading fallback
 */
export function createLazyComponent<P extends object = Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  componentName: string
): ComponentType<P> {
  const LazyComponent = lazy(importFn);
  
  const WrappedComponent = (props: P) => (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `Lazy${componentName}`;
  return WrappedComponent;
}

/**
 * Preload component for better performance
 */
export async function preloadComponent(importFn: () => Promise<{ default: ComponentType }>) {
  try {
    await importFn();
  } catch (error) {
    console.error('Failed to preload component:', error);
  }
}

/**
 * Throttle function calls for performance
 */
export function throttle<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;

  return function executedFunction(...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func(...args);
      }, remaining);
    }
  };
}

/**
 * Debounce function calls for performance
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Measure component render performance
 */
export function measureRenderPerformance(
  componentName: string,
  renderFn: () => void
) {
  if (process.env.NODE_ENV !== 'development') {
    return renderFn();
  }

  const start = performance.now();
  renderFn();
  const end = performance.now();
  
  if (end - start > 16) {
    console.warn(`[Performance] ${componentName} took ${(end - start).toFixed(2)}ms`);
  }
  
  return end - start;
}

/**
 * Check if device is low-end
 */
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
  
  return hardwareConcurrency <= 2 || deviceMemory <= 2;
}

/**
 * Adaptive animation settings based on device
 */
export function getAdaptiveAnimationSettings() {
  const isLowEnd = isLowEndDevice();
  
  return {
    enableComplexAnimations: !isLowEnd,
    maxConcurrentAnimations: isLowEnd ? 4 : 12,
    animationDuration: isLowEnd ? 200 : 300,
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
}

/**
 * Intersection Observer for lazy loading
 */
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
    ...options,
  });
}

/**
 * Optimize images for web
 */
export function optimizeImageUrl(url: string, width?: number, quality = 80): string {
  if (!url || url.startsWith('data:')) return url;
  
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('q', quality.toString());
    if (width) urlObj.searchParams.set('w', width.toString());
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: string) {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

/**
 * Monitor bundle size
 */
export function logBundleSize() {
  if (process.env.NODE_ENV !== 'development') return;
  
  if ('performance' in window && 'getEntriesByType' in performance) {
    const entries = performance.getEntriesByType('resource');
    const scripts = entries.filter(e => e.name.includes('.js'));
    
    scripts.forEach(script => {
      const size = (script as PerformanceResourceTiming).transferSize || 0;
      console.log(`[Bundle] ${script.name}: ${(size / 1024).toFixed(2)}KB`);
    });
  }
}
