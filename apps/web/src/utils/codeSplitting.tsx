/**
 * 🚀 ADVANCED CODE SPLITTING & LAZY LOADING
 * Production-ready code splitting with preloading and error boundaries
 */

import React, { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { logger } from '../services/logger';

interface ComponentConfig {
  importFn: () => Promise<{ default: React.ComponentType<any> }>;
  name: string;
}

interface ErrorFallbackProps {
  componentName: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ componentName }) => (
  <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
    <p className="text-gray-500">Failed to load {componentName}</p>
  </div>
);

// ====== LAZY LOADING UTILITIES ======
class CodeSplittingManager {
  private static preloadedComponents = new Set<string>();
  private static loadingPromises = new Map<string, Promise<any>>();

  /**
   * Create lazy component with error boundary and loading fallback
   */
  static createLazyComponent<P extends object = Record<string, unknown>>(
    importFn: () => Promise<{ default: React.ComponentType<P> }>,
    componentName: string,
    fallback?: React.ReactNode
  ): React.ComponentType<P> {
    const LazyComponent = lazy(importFn);
    const WrappedComponent = (props: P) => (
      <ErrorBoundary
        fallback={<ErrorFallback componentName={componentName} />}
        onError={(error: Error, errorInfo: { componentStack: string }) => {
          logger.error(`Error loading ${componentName}`, { error, errorInfo });
        }}
      >
        <Suspense fallback={fallback || <ComponentLoadingFallback componentName={componentName} />}>
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
  static async preloadComponent(
    importFn: () => Promise<any>,
    componentName: string
  ): Promise<void> {
    if (this.preloadedComponents.has(componentName)) {
      return;
    }

    if (this.loadingPromises.has(componentName)) {
      return await this.loadingPromises.get(componentName)!;
    }

    const promise = importFn()
      .then((module: any) => {
        this.preloadedComponents.add(componentName);
        this.loadingPromises.delete(componentName);
        return module;
      })
      .catch((error: unknown) => {
        logger.error(`Failed to preload ${componentName}`, { error });
        this.loadingPromises.delete(componentName);
        throw error;
      });

    this.loadingPromises.set(componentName, promise);
    return await promise;
  }

  /**
   * Preload multiple components
   */
  static async preloadComponents(components: ComponentConfig[]): Promise<PromiseSettledResult<any>[]> {
    const promises = components.map(({ importFn, name }) => this.preloadComponent(importFn, name));
    return await Promise.allSettled(promises);
  }

  /**
   * Get preload status
   */
  static isPreloaded(componentName: string): boolean {
    return this.preloadedComponents.has(componentName);
  }
}

// ====== LOADING FALLBACK COMPONENT ======
interface ComponentLoadingFallbackProps {
  componentName: string;
}

const ComponentLoadingFallback: React.FC<ComponentLoadingFallbackProps> = ({ componentName }) => (
  <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <p className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
      <p className="text-sm text-gray-500">Loading {componentName}...</p>
    </div>
  </div>
);

// ====== ROUTE-BASED CODE SPLITTING ======
export const createRouteLazyComponent = <P extends object = Record<string, unknown>>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  routeName: string
): React.ComponentType<P> => {
  return CodeSplittingManager.createLazyComponent<P>(
    importFn,
    routeName,
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading {routeName}</h2>
        <p className="text-gray-500">Please wait while we load the page...</p>
      </div>
    </div>
  );
};

// ====== COMPONENT-BASED CODE SPLITTING ======
export const createComponentLazyComponent = <P extends object = Record<string, unknown>>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  componentName: string
): React.ComponentType<P> => {
  return CodeSplittingManager.createLazyComponent<P>(
    importFn,
    componentName,
    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-gray-300 h-8 w-8" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-4 bg-gray-300 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
};

// ====== PRELOADING STRATEGIES ======
class PreloadingStrategies {
  /**
   * Preload on hover
   */
  static preloadOnHover(
    importFn: () => Promise<any>,
    componentName: string
  ): {
    onMouseEnter: () => void;
    onTouchStart: () => void;
  } {
    return {
      onMouseEnter: () => {
        CodeSplittingManager.preloadComponent(importFn, componentName);
      },
      onTouchStart: () => {
        CodeSplittingManager.preloadComponent(importFn, componentName);
      },
    };
  }

  /**
   * Preload on intersection
   */
  static preloadOnIntersection(
    importFn: () => Promise<any>,
    componentName: string
  ): {
    ref: (node: HTMLElement | null) => void;
  } {
    return {
      ref: (node: HTMLElement | null) => {
        if (node && !CodeSplittingManager.isPreloaded(componentName)) {
          const observer = new IntersectionObserver(
            (entries: IntersectionObserverEntry[]) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  CodeSplittingManager.preloadComponent(importFn, componentName);
                  observer.disconnect();
                }
              });
            },
            { threshold: 0.1 }
          );
          observer.observe(node);
        }
      },
    };
  }

  /**
   * Preload on idle
   */
  static preloadOnIdle(importFn: () => Promise<any>, componentName: string): void {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        CodeSplittingManager.preloadComponent(importFn, componentName);
      });
    } else {
      setTimeout(() => {
        CodeSplittingManager.preloadComponent(importFn, componentName);
      }, 100);
    }
  }
}

// ====== BUNDLE ANALYSIS ======
interface BundleStats {
  totalChunks: number;
  totalSize: number;
  averageSize: number;
  largestChunk: { name: string; size: number };
  smallestChunk: { name: string; size: number };
}

class BundleAnalyzer {
  private static chunkSizes = new Map<string, number>();

  /**
   * Track chunk size
   */
  static trackChunkSize(chunkName: string, size: number): void {
    this.chunkSizes.set(chunkName, size);
  }

  /**
   * Get bundle statistics
   */
  static getBundleStats(): BundleStats {
    const chunks = Array.from(this.chunkSizes.entries());
    const totalSize = chunks.reduce((sum, [, size]) => sum + size, 0);
    const averageSize = totalSize / chunks.length;
    const sortedChunks = chunks.sort(([, a], [, b]) => b - a);
    const largestChunk = sortedChunks[0] || ['', 0];
    const smallestChunk = sortedChunks[sortedChunks.length - 1] || ['', 0];

    return {
      totalChunks: chunks.length,
      totalSize,
      averageSize,
      largestChunk: { name: largestChunk[0], size: largestChunk[1] },
      smallestChunk: { name: smallestChunk[0], size: smallestChunk[1] },
    };
  }
}

// ====== EXPORTS ======
export { BundleAnalyzer, CodeSplittingManager, PreloadingStrategies };
