'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDeviceDetection, useSafeAreaInsets, SafeAreaInsets } from '@/utils/safe-area';
const SafeAreaContext = createContext(null);
export function useSafeArea() {
    const context = useContext(SafeAreaContext);
    if (!context) {
        throw new Error('useSafeArea must be used within a SafeAreaProvider');
    }
    return context;
}
export function SafeAreaProvider({ children }) {
    const insets = useSafeAreaInsets();
    const deviceInfo = useDeviceDetection();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        // Set CSS custom properties for safe area insets
        const root = document.documentElement;
        root.style.setProperty('--sat-inset-top', `${insets.top}px`);
        root.style.setProperty('--sat-inset-right', `${insets.right}px`);
        root.style.setProperty('--sat-inset-bottom', `${insets.bottom}px`);
        root.style.setProperty('--sat-inset-left', `${insets.left}px`);
    }, [insets]);
    const contextValue = {
        insets,
        ...deviceInfo,
    };
    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return <div className="min-h-screen">{children}</div>;
    }
    return (<SafeAreaContext.Provider value={contextValue}>
      <div className="min-h-screen" style={{
            paddingTop: `env(safe-area-inset-top)`,
            paddingRight: `env(safe-area-inset-right)`,
            paddingBottom: `env(safe-area-inset-bottom)`,
            paddingLeft: `env(safe-area-inset-left)`,
        }}>
        {children}
      </div>
    </SafeAreaContext.Provider>);
}
export function SafeArea({ children, edges = ['top', 'bottom'], className = '' }) {
    const { hasSafeArea } = useSafeArea();
    if (!hasSafeArea) {
        return <div className={className}>{children}</div>;
    }
    const safeAreaClasses = edges.map(edge => {
        switch (edge) {
            case 'top':
                return 'pt-[env(safe-area-inset-top)]';
            case 'right':
                return 'pr-[env(safe-area-inset-right)]';
            case 'bottom':
                return 'pb-[env(safe-area-inset-bottom)]';
            case 'left':
                return 'pl-[env(safe-area-inset-left)]';
            default:
                return '';
        }
    }).join(' ');
    return (<div className={`${safeAreaClasses} ${className}`}>
      {children}
    </div>);
}
/**
 * Hook for getting responsive spacing based on device type
 */
export function useResponsiveSpacing() {
    const { deviceType, isMobile } = useSafeArea();
    return {
        // Button spacing
        buttonGap: isMobile ? 'gap-3 sm:gap-4' : 'gap-4 sm:gap-6',
        // Container padding
        containerPadding: isMobile ? 'px-4 sm:px-6' : 'px-6 sm:px-8',
        // Section spacing
        sectionSpacing: isMobile ? 'py-6 sm:py-8' : 'py-8 sm:py-12',
        // Card spacing
        cardSpacing: isMobile ? 'p-4 sm:p-6' : 'p-6 sm:p-8',
        // Text spacing
        textSpacing: isMobile ? 'space-y-2 sm:space-y-3' : 'space-y-3 sm:space-y-4',
    };
}
//# sourceMappingURL=SafeAreaProvider.jsx.map