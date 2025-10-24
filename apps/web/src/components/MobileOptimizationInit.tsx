'use client';
import { useEffect } from 'react';
import { initializeMobileOptimizations } from '@/utils/mobile-performance';
/**
 * Client-side component to initialize mobile optimizations
 * This must be a client component since it uses browser APIs
 */
export function MobileOptimizationInit() {
    useEffect(() => {
        // Initialize mobile optimizations on client side
        initializeMobileOptimizations();
    }, []);
    return null; // This component doesn't render anything
}
//# sourceMappingURL=MobileOptimizationInit.jsx.map