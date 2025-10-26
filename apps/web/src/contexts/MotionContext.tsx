'use client';
import { LazyMotion, domAnimation } from 'framer-motion';
import { createContext, useContext, useEffect, useState } from 'react';
const MotionContext = createContext(undefined);
export function useMotion() {
    const context = useContext(MotionContext);
    if (context === undefined) {
        throw new Error('useMotion must be used within a MotionProvider');
    }
    return context;
}
export function MotionProvider({ children }) {
    const [reducedMotion, setReducedMotion] = useState(false);
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mediaQuery.matches);
        const handleChange = (e) => { setReducedMotion(e.matches); };
        mediaQuery.addEventListener('change', handleChange);
        return () => { mediaQuery.removeEventListener('change', handleChange); };
    }, []);
    const value = {
        reducedMotion,
    };
    return (<MotionContext.Provider value={value}>
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    </MotionContext.Provider>);
}
//# sourceMappingURL=MotionContext.jsx.map