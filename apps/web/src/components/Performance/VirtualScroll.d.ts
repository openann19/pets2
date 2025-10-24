import React from 'react';
export declare function VirtualScroll({ items, itemHeight, containerHeight, renderItem, overscan, className, }: {
    items: any;
    itemHeight: any;
    containerHeight: any;
    renderItem: any;
    overscan?: number | undefined;
    className?: string | undefined;
}): JSX.Element;
export declare function useVirtualScroll(items: any, containerHeight: any, estimatedItemHeight?: number): {
    startIndex: number;
    endIndex: number;
    totalHeight: number;
    scrollTop: number;
    setScrollTop: React.Dispatch<React.SetStateAction<number>>;
    updateItemHeight: (index: any, height: any) => void;
    getItemOffset: (index: any) => number;
};
//# sourceMappingURL=VirtualScroll.d.ts.map