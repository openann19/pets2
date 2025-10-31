/**
 * Prefetching Hook
 * 
 * Implements intelligent prefetching for routes, images, and data
 */
import { useEffect, useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { logger } from '@pawfectmatch/core';
import { useNetworkQuality } from '../performance/useNetworkQuality';

interface PrefetchOptions {
  /** Whether to prefetch on WiFi only */
  wifiOnly?: boolean;
  /** Maximum number of images to prefetch */
  maxImages?: number;
  /** Whether to enable route prefetching */
  enableRoutePrefetch?: boolean;
  /** Whether to enable image prefetching */
  enableImagePrefetch?: boolean;
}

/**
 * Hook for intelligent prefetching
 */
export function usePrefetching(options: PrefetchOptions = {}) {
  const navigation = useNavigation<NavigationProp<any>>();
  const networkQuality = useNetworkQuality();
  const prefetchedRoutesRef = useRef<Set<string>>(new Set());
  const prefetchedImagesRef = useRef<Set<string>>(new Set());

  const {
    wifiOnly = false,
    maxImages = 10,
    enableRoutePrefetch = true,
    enableImagePrefetch = true,
  } = options;

  // Check if we should prefetch (network quality check)
  const shouldPrefetch = useCallback(() => {
    if (wifiOnly && networkQuality !== 'fast') {
      return false;
    }
    return networkQuality !== 'offline';
  }, [wifiOnly, networkQuality]);

  /**
   * Prefetch a route (lazy load the screen component)
   */
  const prefetchRoute = useCallback(
    async (routeName: string, importFn: () => Promise<any>) => {
      if (!enableRoutePrefetch || !shouldPrefetch()) return;
      if (prefetchedRoutesRef.current.has(routeName)) return;

      try {
        prefetchedRoutesRef.current.add(routeName);
        await importFn();
      } catch (error) {
        logger.warn('Route prefetch failed:', routeName, error);
        prefetchedRoutesRef.current.delete(routeName);
      }
    },
    [enableRoutePrefetch, shouldPrefetch],
  );

  /**
   * Prefetch images
   */
  const prefetchImages = useCallback(
    async (imageUrls: string[]) => {
      if (!enableImagePrefetch || !shouldPrefetch()) return;
      
      const toPrefetch = imageUrls
        .filter((url) => !prefetchedImagesRef.current.has(url))
        .slice(0, maxImages - prefetchedImagesRef.current.size);

      if (toPrefetch.length === 0) return;

      try {
        await FastImage.preload(
          toPrefetch.map((url) => ({ uri: url, priority: FastImage.priority.normal }))
        );
        
        toPrefetch.forEach((url) => prefetchedImagesRef.current.add(url));
      } catch (error) {
        logger.warn('Image prefetch failed:', error);
      }
    },
    [enableImagePrefetch, shouldPrefetch, maxImages],
  );

  /**
   * Prefetch next likely routes based on current route
   */
  const prefetchNextRoutes = useCallback(
    (currentRoute: string) => {
      if (!enableRoutePrefetch || !shouldPrefetch()) return;

      // Route prediction logic
      const routePredictions: Record<string, string[]> = {
        Home: ['Swipe', 'Matches', 'Chat'],
        Swipe: ['Matches', 'Chat'],
        Matches: ['Chat'],
        Chat: ['Matches', 'Home'],
      };

      const nextRoutes = routePredictions[currentRoute] || [];
      
      nextRoutes.forEach((route) => {
        // This would need actual import functions
        // For now, it's a placeholder
      });
    },
    [enableRoutePrefetch, shouldPrefetch],
  );

  /**
   * Prefetch images for swipe stack (next 3-5 cards)
   */
  const prefetchSwipeImages = useCallback(
    async (petImages: Array<{ images: string[] }>, startIndex: number = 0) => {
      if (!enableImagePrefetch || !shouldPrefetch()) return;

      const imagesToPrefetch: string[] = [];
      const endIndex = Math.min(startIndex + 5, petImages.length);

      for (let i = startIndex; i < endIndex; i++) {
        const pet = petImages[i];
        if (pet?.images?.[0]) {
          imagesToPrefetch.push(pet.images[0]);
        }
      }

      await prefetchImages(imagesToPrefetch);
    },
    [enableImagePrefetch, shouldPrefetch, prefetchImages],
  );

  return {
    prefetchRoute,
    prefetchImages,
    prefetchNextRoutes,
    prefetchSwipeImages,
    shouldPrefetch: shouldPrefetch(),
  };
}

/**
 * Hook for predictive prefetching based on user behavior
 */
export function usePredictivePrefetching() {
  const navigationHistoryRef = useRef<string[]>([]);
  const prefetching = usePrefetching({ wifiOnly: true });

  /**
   * Record navigation event for pattern analysis
   */
  const recordNavigation = useCallback((routeName: string) => {
    navigationHistoryRef.current.push(routeName);
    
    // Keep last 10 navigations
    if (navigationHistoryRef.current.length > 10) {
      navigationHistoryRef.current.shift();
    }

    // Analyze pattern and prefetch
    const lastThree = navigationHistoryRef.current.slice(-3);
    
    // Simple pattern: if user goes A -> B -> C frequently, prefetch C when on B
    if (lastThree.length === 3) {
      const [a, b, c] = lastThree;
      
      // Check if this pattern occurred before (simplified)
      // In production, use more sophisticated ML-based prediction
      if (a === 'Home' && b === 'Swipe') {
        prefetching.prefetchNextRoutes('Swipe');
      }
    }
  }, [prefetching]);

  return {
    ...prefetching,
    recordNavigation,
  };
}
