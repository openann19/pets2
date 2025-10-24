'use client';
import { lazy, Suspense, useState, useEffect } from 'react';
// Dynamically import React Query Devtools only when available
const ReactQueryDevtools = lazy(() => import('@tanstack/react-query-devtools').then((d) => ({
    default: d.ReactQueryDevtools,
})).catch(() => ({
    default: () => null, // Fallback if devtools not available
})));
export function DevTools() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    // Prevent hydration mismatch by only rendering after mount
    if (!mounted)
        return null;
    if (process.env.NODE_ENV !== 'development')
        return null;
    return (<Suspense fallback={null}>
      <ReactQueryDevtools initialIsOpen={false}/>
    </Suspense>);
}
//# sourceMappingURL=DevTools.jsx.map