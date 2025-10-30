// src/hooks/performance/useOptimizedListConfig.ts
import { useMemo } from 'react';
export function useOptimizedListConfig<ItemT>(avgItemHeight = 72) {
  return useMemo(
    () => ({
      windowSize: 7,
      maxToRenderPerBatch: 12,
      updateCellsBatchingPeriod: 16,
      removeClippedSubviews: true,
      keyExtractor: (it: ItemT, i: number) => (it as { id?: string })?.id ?? String(i),
      getItemLayout: (_: ItemT[] | null | undefined, index: number) => ({
        length: avgItemHeight,
        offset: avgItemHeight * index,
        index,
      }),
    }),
    [avgItemHeight],
  );
}
