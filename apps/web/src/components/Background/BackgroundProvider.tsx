'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import FluidGradient from './FluidGradient';
const BackgroundContext = createContext({ isActive: true });
export const useBackground = () => useContext(BackgroundContext);
/**
 * Global Background Provider
 * Provides the Three.js FluidGradient background across the entire app
 */
export default function BackgroundProvider({ children }) {
    return (<BackgroundContext.Provider value={{ isActive: true }}>
      {/* Global Three.js Fluid Gradient Background */}
      <FluidGradient />
      
      {/* Light overlay for better readability */}
      <div className="fixed inset-0 bg-black/5 pointer-events-none z-0"/>
      
      {/* App content */}
      <div className="relative z-10">
        {children}
      </div>
    </BackgroundContext.Provider>);
}
//# sourceMappingURL=BackgroundProvider.jsx.map