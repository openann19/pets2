'use client';
import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';
export function VirtualScroll({ items, itemHeight, containerHeight, renderItem, overscan = 5, className = '', }) {
    const [scrollTop, setScrollTop] = useState(0);
    const containerRef = useRef(null);
    const { startIndex, endIndex, totalHeight } = useMemo(() => {
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
        const endIndex = Math.min(items.length - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan);
        const totalHeight = items.length * itemHeight;
        return { startIndex, endIndex, totalHeight };
    }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);
    const visibleItems = useMemo(() => {
        return items.slice(startIndex, endIndex + 1);
    }, [items, startIndex, endIndex]);
    const handleScroll = (e) => {
        setScrollTop(e.currentTarget.scrollTop);
    };
    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            setScrollTop(container.scrollTop);
        }
    }, []);
    return (<div ref={containerRef} className={`overflow-auto ${className}`} style={{ height: containerHeight }} onScroll={handleScroll}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index;
            const top = actualIndex * itemHeight;
            return (<motion.div key={actualIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.05 }} style={{
                    position: 'absolute',
                    top,
                    left: 0,
                    right: 0,
                    height: itemHeight,
                }}>
              {renderItem(item, actualIndex)}
            </motion.div>);
        })}
      </div>
    </div>);
}
// Hook for virtual scrolling with dynamic item heights
export function useVirtualScroll(items, containerHeight, estimatedItemHeight = 100) {
    const [itemHeights, setItemHeights] = useState([]);
    const [scrollTop, setScrollTop] = useState(0);
    const totalHeight = useMemo(() => {
        return itemHeights.reduce((sum, height) => sum + height, 0);
    }, [itemHeights]);
    const { startIndex, endIndex } = useMemo(() => {
        let currentHeight = 0;
        let startIndex = 0;
        let endIndex = items.length - 1;
        // Find start index
        for (let i = 0; i < items.length; i++) {
            const height = itemHeights[i] || estimatedItemHeight;
            if (currentHeight + height > scrollTop) {
                startIndex = i;
                break;
            }
            currentHeight += height;
        }
        // Find end index
        currentHeight = 0;
        for (let i = 0; i < items.length; i++) {
            const height = itemHeights[i] || estimatedItemHeight;
            currentHeight += height;
            if (currentHeight > scrollTop + containerHeight) {
                endIndex = i;
                break;
            }
        }
        return { startIndex, endIndex };
    }, [items.length, itemHeights, estimatedItemHeight, scrollTop, containerHeight]);
    const updateItemHeight = (index, height) => {
        setItemHeights((prev) => {
            const newHeights = [...prev];
            newHeights[index] = height;
            return newHeights;
        });
    };
    const getItemOffset = (index) => {
        return itemHeights.slice(0, index).reduce((sum, height) => sum + height, 0);
    };
    return {
        startIndex,
        endIndex,
        totalHeight,
        scrollTop,
        setScrollTop,
        updateItemHeight,
        getItemOffset,
    };
}
//# sourceMappingURL=VirtualScroll.jsx.map