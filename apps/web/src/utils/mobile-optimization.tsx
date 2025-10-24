/**
 * 📱 Mobile Optimization Utilities
 * Comprehensive mobile performance and UX optimizations
 */
import { useEffect, useState, useCallback } from 'react'
import { logger } from '@pawfectmatch/core';
;
// Mobile performance budget
export const MOBILE_PERFORMANCE_BUDGET = {
    // Loading performance
    firstContentfulPaint: 1500, // 1.5s
    largestContentfulPaint: 2500, // 2.5s
    firstInputDelay: 100, // 100ms
    cumulativeLayoutShift: 0.1,
    // Bundle size
    javascript: 200, // 200KB
    css: 50, // 50KB
    images: 500, // 500KB total
    // Runtime performance
    frameRate: 60, // 60fps
    memoryUsage: 50, // 50MB
    batteryDrain: 'low', // Minimal battery impact
};
// Mobile breakpoints
export const MOBILE_BREAKPOINTS = {
    xs: '375px', // iPhone SE, small Android
    sm: '414px', // iPhone 11 Pro Max
    md: '768px', // iPad Mini
    lg: '1024px', // iPad
    xl: '1280px', // Desktop
};
// Touch target sizes
export const TOUCH_TARGETS = {
    minimum: 44, // iOS minimum
    recommended: 48, // Android recommended
    comfortable: 56, // Comfortable touch area
};
// Mobile optimization hook
export const useMobileOptimization = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    const [connectionType, setConnectionType] = useState('unknown');
    const [batteryLevel, setBatteryLevel] = useState(null);
    const [isLowPowerMode, setIsLowPowerMode] = useState(false);
    useEffect(() => {
        // Detect mobile device
        const checkMobile = () => {
            const userAgent = navigator.userAgent;
            const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
            const isMobileViewport = window.innerWidth <= 768;
            setIsMobile(isMobileUA || isMobileViewport);
            setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
        };
        // Detect touch device
        const checkTouchDevice = () => {
            setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
        };
        // Detect connection type
        const checkConnection = () => {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (connection) {
                setConnectionType(connection.effectiveType || 'unknown');
            }
        };
        // Detect battery level
        const checkBattery = async () => {
            if ('getBattery' in navigator) {
                try {
                    const battery = await navigator.getBattery();
                    setBatteryLevel(battery.level);
                    setIsLowPowerMode(battery.level < 0.2);
                    battery.addEventListener('levelchange', () => {
                        setBatteryLevel(battery.level);
                        setIsLowPowerMode(battery.level < 0.2);
                    });
                }
                catch (error) {
                    logger.debug('Battery API not available');
                }
            }
        };
        // Initial checks
        checkMobile();
        checkTouchDevice();
        checkConnection();
        checkBattery();
        // Listen for resize events
        window.addEventListener('resize', checkMobile);
        // Listen for connection changes
        const connection = navigator.connection;
        if (connection) {
            connection.addEventListener('change', checkConnection);
        }
        return () => {
            window.removeEventListener('resize', checkMobile);
            if (connection) {
                connection.removeEventListener('change', checkConnection);
            }
        };
    }, []);
    return {
        isMobile,
        isTablet,
        isTouchDevice,
        connectionType,
        batteryLevel,
        isLowPowerMode,
    };
};
// Intersection Observer for lazy loading
export const useIntersectionObserver = (options = {}) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [hasIntersected, setHasIntersected] = useState(false);
    const elementRef = useCallback((node) => {
        if (node) {
            const observer = new IntersectionObserver(([entry]) => {
                setIsIntersecting(entry.isIntersecting);
                if (entry.isIntersecting && !hasIntersected) {
                    setHasIntersected(true);
                }
            }, {
                threshold: 0.1,
                rootMargin: '50px',
                ...options,
            });
            observer.observe(node);
            return () => observer.disconnect();
        }
    }, [hasIntersected, options]);
    return { elementRef, isIntersecting, hasIntersected };
};
// Image optimization utilities
export const optimizeImageForMobile = (src, width, height) => {
    const params = new URLSearchParams({
        w: width.toString(),
        h: height.toString(),
        q: '80', // Quality
        f: 'webp', // Format
        fit: 'cover',
    });
    return `${src}?${params.toString()}`;
};
// Lazy loading image component
export const LazyImage = ({ src, alt, width, height, className = '', ...props }) => {
    const { elementRef, hasIntersected } = useIntersectionObserver();
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const optimizedSrc = optimizeImageForMobile(src, width, height);
    return (<div ref={elementRef} className={`relative ${className}`}>
      {/* Placeholder */}
      {!isLoaded && !hasError && (<div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" style={{ width, height }}/>)}
      
      {/* Optimized image */}
      {hasIntersected && (<img src={optimizedSrc} alt={alt} width={width} height={height} onLoad={() => setIsLoaded(true)} onError={() => setHasError(true)} className={`
            transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `} loading="lazy" {...props}/>)}
      
      {/* Error state */}
      {hasError && (<div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg" style={{ width, height }}>
          <span className="text-gray-500 text-sm">Failed to load</span>
        </div>)}
    </div>);
};
// Performance monitoring
export const usePerformanceMonitor = () => {
    const [metrics, setMetrics] = useState({
        fcp: 0,
        lcp: 0,
        fid: 0,
        cls: 0,
        tti: 0,
    });
    useEffect(() => {
        if ('PerformanceObserver' in window) {
            // First Contentful Paint
            const fcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
                if (fcpEntry) {
                    setMetrics(prev => ({ ...prev, fcp: fcpEntry.startTime }));
                }
            });
            fcpObserver.observe({ entryTypes: ['paint'] });
            // Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            // First Input Delay
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const fidEntry = entries[0];
                if (fidEntry) {
                    setMetrics(prev => ({ ...prev, fid: fidEntry.processingStart - fidEntry.startTime }));
                }
            });
            fidObserver.observe({ entryTypes: ['first-input'] });
            // Cumulative Layout Shift
            const clsObserver = new PerformanceObserver((list) => {
                let clsValue = 0;
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                setMetrics(prev => ({ ...prev, cls: clsValue }));
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
            return () => {
                fcpObserver.disconnect();
                lcpObserver.disconnect();
                fidObserver.disconnect();
                clsObserver.disconnect();
            };
        }
    }, []);
    return metrics;
};
// Memory usage monitoring
export const useMemoryMonitor = () => {
    const [memoryInfo, setMemoryInfo] = useState({
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
    });
    useEffect(() => {
        const updateMemoryInfo = () => {
            if ('memory' in performance) {
                const memory = performance.memory;
                setMemoryInfo({
                    usedJSHeapSize: memory.usedJSHeapSize,
                    totalJSHeapSize: memory.totalJSHeapSize,
                    jsHeapSizeLimit: memory.jsHeapSizeLimit,
                });
            }
        };
        const interval = setInterval(updateMemoryInfo, 5000);
        updateMemoryInfo();
        return () => clearInterval(interval);
    }, []);
    return memoryInfo;
};
// Network-aware loading
export const useNetworkAwareLoading = () => {
    const { connectionType } = useMobileOptimization();
    const [loadingStrategy, setLoadingStrategy] = useState('aggressive');
    useEffect(() => {
        switch (connectionType) {
            case 'slow-2g':
            case '2g':
                setLoadingStrategy('minimal');
                break;
            case '3g':
                setLoadingStrategy('conservative');
                break;
            case '4g':
            default:
                setLoadingStrategy('aggressive');
                break;
        }
    }, [connectionType]);
    return { loadingStrategy, connectionType };
};
// Battery-aware optimizations
export const useBatteryAwareOptimizations = () => {
    const { batteryLevel, isLowPowerMode } = useMobileOptimization();
    const [optimizations, setOptimizations] = useState({
        reduceAnimations: false,
        reduceImageQuality: false,
        disableAutoPlay: false,
        reducePolling: false,
    });
    useEffect(() => {
        if (batteryLevel !== null) {
            setOptimizations({
                reduceAnimations: batteryLevel < 0.3,
                reduceImageQuality: batteryLevel < 0.2,
                disableAutoPlay: batteryLevel < 0.15,
                reducePolling: batteryLevel < 0.1,
            });
        }
    }, [batteryLevel]);
    return { optimizations, batteryLevel, isLowPowerMode };
};
// Touch gesture utilities
export const useTouchGestures = () => {
    const [gestureState, setGestureState] = useState({
        isPressed: false,
        isDragging: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        deltaX: 0,
        deltaY: 0,
    });
    const handleTouchStart = useCallback((event) => {
        const touch = event.touches[0];
        setGestureState(prev => ({
            ...prev,
            isPressed: true,
            startX: touch.clientX,
            startY: touch.clientY,
            currentX: touch.clientX,
            currentY: touch.clientY,
        }));
    }, []);
    const handleTouchMove = useCallback((event) => {
        const touch = event.touches[0];
        const deltaX = touch.clientX - gestureState.startX;
        const deltaY = touch.clientY - gestureState.startY;
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            setGestureState(prev => ({
                ...prev,
                isDragging: true,
                currentX: touch.clientX,
                currentY: touch.clientY,
                deltaX,
                deltaY,
            }));
        }
    }, [gestureState.startX, gestureState.startY]);
    const handleTouchEnd = useCallback(() => {
        setGestureState({
            isPressed: false,
            isDragging: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            deltaX: 0,
            deltaY: 0,
        });
    }, []);
    return {
        gestureState,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
    };
};
// PWA utilities
export const usePWA = () => {
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    useEffect(() => {
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
        }
        // Listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };
        // Listen for app installed event
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsInstallable(false);
            setDeferredPrompt(null);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);
    const installApp = useCallback(async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                logger.info('User accepted the install prompt');
            }
            setDeferredPrompt(null);
        }
    }, [deferredPrompt]);
    return {
        isInstallable,
        isInstalled,
        installApp,
    };
};
// Offline detection
export const useOfflineDetection = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [offlineQueue, setOfflineQueue] = useState([]);
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Process offline queue when coming back online
            if (offlineQueue.length > 0) {
                logger.info('Processing offline queue:', { offlineQueue.length, 'items' });
                setOfflineQueue([]);
            }
        };
        const handleOffline = () => {
            setIsOnline(false);
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [offlineQueue]);
    const addToOfflineQueue = useCallback((item) => {
        if (!isOnline) {
            setOfflineQueue(prev => [...prev, item]);
        }
    }, [isOnline]);
    return {
        isOnline,
        offlineQueue,
        addToOfflineQueue,
    };
};
//# sourceMappingURL=mobile-optimization.jsx.map
//# sourceMappingURL=mobile-optimization.jsx.map