/**
 * Optimization Hooks - Barrel Export
 * 
 * Centralized exports for all optimization hooks
 */

export { useOptimisticUpdate } from './useOptimisticUpdate';
export { useOptimisticSwipe } from './useOptimisticSwipe';
export { useOptimisticChat } from './useOptimisticChat';
export { usePrefetching, usePredictivePrefetching } from './usePrefetching';
export { useNavigationPrefetch } from './useNavigationPrefetch';
export { 
  useDeferredValueOptimized, 
  useTransitionOptimized,
  useOptimizedListUpdates 
} from './useReact18Concurrent';
export { useRequestBatching, useQueryDeduplication } from './useRequestBatching';
export { useAdaptiveQuality, useAdaptiveImageQuality } from './useAdaptiveQuality';
export { usePerformanceMonitor, useAsyncPerformance } from './usePerformanceMonitor';
