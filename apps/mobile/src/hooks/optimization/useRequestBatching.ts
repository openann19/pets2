/**
 * Request Batching Hook
 * 
 * Batches multiple API requests into single calls with deduplication
 */
import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useResourceCleanup } from '../utils/useResourceCleanup';

interface BatchedRequest<T> {
  id: string;
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

interface BatchOptions {
  /** Max time to wait before batching (ms) */
  maxWaitTime?: number;
  /** Max batch size */
  maxBatchSize?: number;
  /** Request deduplication window (ms) */
  dedupeWindow?: number;
}

/**
 * Hook for batching and deduplicating requests
 */
export function useRequestBatching(options: BatchOptions = {}) {
  const queryClient = useQueryClient();
  const batchQueueRef = useRef<Map<string, BatchedRequest<any>>>(new Map());
  const batchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cleanup = useResourceCleanup({ queryClient });

  const {
    maxWaitTime = 50,
    maxBatchSize = 10,
    dedupeWindow = 1000,
  } = options;

  // Process batch queue
  const processBatch = useCallback(async () => {
    if (batchQueueRef.current.size === 0) return;

    const requests = Array.from(batchQueueRef.current.values());
    batchQueueRef.current.clear();

    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
      batchTimerRef.current = null;
    }

    try {
      // Execute requests in parallel (or batch via API if supported)
      const results = await Promise.allSettled(
        requests.map((req) => req.promise),
      );

      results.forEach((result, index) => {
        const request = requests[index];
        if (result.status === 'fulfilled') {
          request.resolve(result.value);
        } else {
          request.reject(
            result.reason instanceof Error
              ? result.reason
              : new Error(String(result.reason)),
          );
        }
      });
    } catch (error) {
      // If batch fails, reject all requests
      requests.forEach((req) => {
        req.reject(
          error instanceof Error ? error : new Error(String(error)),
        );
      });
    }
  }, []);

  // Schedule batch processing
  const scheduleBatch = useCallback(() => {
    if (batchTimerRef.current) return;

    if (batchQueueRef.current.size >= maxBatchSize) {
      // Process immediately if batch is full
      processBatch();
    } else {
      // Schedule processing after maxWaitTime
      const timerId = setTimeout(() => {
        processBatch();
      }, maxWaitTime);
      batchTimerRef.current = timerId;
      cleanup.registerTimer(timerId);
    }
  }, [maxWaitTime, maxBatchSize, processBatch]);

  // Batch a request
  const batchRequest = useCallback(
    <T,>(id: string, requestFn: () => Promise<T>): Promise<T> => {
      // Check for duplicate requests
      const existing = batchQueueRef.current.get(id);
      if (existing) {
        const age = Date.now() - existing.timestamp;
        if (age < dedupeWindow) {
          // Return existing promise for deduplication
          return existing.promise;
        }
      }

      // Create new batched request
      let resolve!: (value: T) => void;
      let reject!: (error: Error) => void;

      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });

      const batchedRequest: BatchedRequest<T> = {
        id,
        promise: requestFn().then(
          (value) => {
            resolve(value);
            return value;
          },
          (error) => {
            reject(error instanceof Error ? error : new Error(String(error)));
            throw error;
          },
        ),
        resolve,
        reject,
        timestamp: Date.now(),
      };

      batchQueueRef.current.set(id, batchedRequest);
      scheduleBatch();

      return promise;
    },
    [dedupeWindow, scheduleBatch],
  );

  // Register cleanup for pending requests
  cleanup.registerCleanup(() => {
    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
      batchTimerRef.current = null;
    }
    // Reject all pending requests
    batchQueueRef.current.forEach((req) => {
      req.reject(new Error('Request batching hook unmounted'));
    });
    batchQueueRef.current.clear();
  });

  return { batchRequest };
}

/**
 * Query key deduplication for TanStack Query
 */
export function useQueryDeduplication() {
  const queryClient = useQueryClient();
  const pendingQueriesRef = useRef<Map<string, Promise<any>>>(new Map());

  const dedupeQuery = useCallback(
    <T,>(queryKey: string[], queryFn: () => Promise<T>): Promise<T> => {
      const key = JSON.stringify(queryKey);
      const existing = pendingQueriesRef.current.get(key);

      if (existing) {
        return existing;
      }

      const promise = queryFn().finally(() => {
        pendingQueriesRef.current.delete(key);
      });

      pendingQueriesRef.current.set(key, promise);
      return promise;
    },
    [],
  );

  return { dedupeQuery };
}
