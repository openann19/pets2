'use client';
import { useEffect } from 'react';
import { initializePWA } from '@/utils/pwa';
export default function PWAInitializer() {
    useEffect(() => {
        // Initialize PWA features on mount
        initializePWA();
    }, []);
    return null; // This component doesn't render anything
}
//# sourceMappingURL=PWAInitializer.jsx.map