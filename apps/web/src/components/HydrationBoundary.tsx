'use client';
import React, { useEffect, useState } from 'react';
import LoadingSpinner from './UI/LoadingSpinner';
export default function HydrationBoundary({ children }) {
    const [isHydrated, setIsHydrated] = useState(false);
    useEffect(() => {
        setIsHydrated(true);
    }, []);
    // Show loading state until hydration is complete
    if (!isHydrated) {
        return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <LoadingSpinner size="lg" color="#9333EA" className="mx-auto mb-4"/>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>);
    }
    return <>{children}</>;
}
//# sourceMappingURL=HydrationBoundary.jsx.map