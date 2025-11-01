'use client';
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';
import FluidGradient from './FluidGradient';

const BackgroundContext = createContext({ isActive: true });
export const useBackground = () => useContext(BackgroundContext);

/**
 * Global Background Provider
 * Provides the Three.js FluidGradient background across the entire app
 * Falls back to solid color if FluidGradient fails
 */
export default function BackgroundProvider({ children }: { children: ReactNode }) {
    const [isClient, setIsClient] = useState(false);
    const enableGradient = true;
    
    // Ensure this only renders on client to avoid hydration mismatches
    useEffect(() => {
        setIsClient(true);
    }, []);
    
    return (
        <BackgroundContext.Provider value={{ isActive: true }}>
          {/* Fallback background - always render to match SSR */}
          <div 
            className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-pink-900 pointer-events-none -z-[1]" 
            suppressHydrationWarning 
          />
          
          {/* Global Three.js Fluid Gradient Background - wrapped to prevent refresh loops */}
          {/* Only render on client to prevent SSR/hydration issues */}
          {isClient && enableGradient ? (
            <ErrorBoundary>
              <FluidGradient />
            </ErrorBoundary>
          ) : null}
          
          {/* Light overlay for better readability */}
          <div className="fixed inset-0 bg-black/5 pointer-events-none z-[1]" suppressHydrationWarning />
          
          {/* App content */}
          <div className="relative z-10">
            {children}
          </div>
        </BackgroundContext.Provider>
    );
}
//# sourceMappingURL=BackgroundProvider.jsx.map