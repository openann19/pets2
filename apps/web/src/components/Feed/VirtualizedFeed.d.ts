export default function VirtualizedFeed({ items, itemHeight, onLoadMore, renderItem, className, overscan, threshold }: {
    items: any;
    itemHeight: any;
    onLoadMore: any;
    renderItem: any;
    className?: string | undefined;
    overscan?: number | undefined;
    threshold?: number | undefined;
}): JSX.Element;
export declare function VirtualizedPostItem({ index, style, data }: {
    index: any;
    style: any;
    data: any;
}): JSX.Element;
export declare function useVirtualizedFeed(initialItems: any, loadMoreFn: any, itemHeight?: number): {
    items: any;
    isLoading: boolean;
    hasMore: boolean;
    loadMore: () => Promise<any>;
    refresh: () => Promise<void>;
    itemHeight: number;
};
//# sourceMappingURL=VirtualizedFeed.d.ts.map