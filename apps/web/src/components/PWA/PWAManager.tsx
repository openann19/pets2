'use client';
import { useState, useEffect } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { InstallPrompt, usePWAInstall } from './InstallPrompt';
import { SplashScreen } from './SplashScreen';
export function PWAManager({ children }) {
    const [showSplash, setShowSplash] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const { isInstallable, isInstalled } = usePWAInstall();
    useEffect(() => {
        // Check if this is the first visit
        const isFirstVisit = !sessionStorage.getItem('pwa-visited');
        if (isFirstVisit) {
            setShowSplash(true);
            sessionStorage.setItem('pwa-visited', 'true');
        }
        // Monitor online/offline status
        const handleOnline = () => {
            setIsOnline(true);
            logger.info('[PWA] Back online');
        };
        const handleOffline = () => {
            setIsOnline(false);
            logger.info('[PWA] Gone offline');
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        // Check for service worker updates
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                setUpdateAvailable(true);
            });
            // Register service worker
            navigator.serviceWorker.register('/sw-enhanced.js')
                .then((registration) => {
                logger.info('[PWA] Service worker registered:', { registration });
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                setUpdateAvailable(true);
                            }
                        });
                    }
                });
            })
                .catch((error) => {
                logger.error('[PWA] Service worker registration failed:', { error });
            });
        }
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    const handleSplashComplete = () => {
        setShowSplash(false);
    };
    const handleUpdateApp = async () => {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    };
    return (<>
      {/* Splash Screen */}
      {showSplash && (<SplashScreen onComplete={handleSplashComplete}/>)}

      {/* Main App */}
      {!showSplash && children}

      {/* Install Prompt */}
      {isInstallable && !isInstalled && (<InstallPrompt />)}

      {/* Update Available Banner */}
      {updateAvailable && (<UpdateBanner onUpdate={handleUpdateApp} onDismiss={() => setUpdateAvailable(false)}/>)}

      {/* Offline Indicator */}
      {!isOnline && (<OfflineIndicator />)}
    </>);
}
function UpdateBanner({ onUpdate, onDismiss }) {
    return (<div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white p-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="font-medium">New version available</span>
          <span className="text-blue-200 text-sm">Update to get the latest features</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onUpdate} className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
            Update
          </button>
          <button onClick={onDismiss} className="px-4 py-2 text-blue-200 hover:text-white transition-colors">
            Later
          </button>
        </div>
      </div>
    </div>);
}
// Offline Indicator Component
function OfflineIndicator() {
    return (<div className="fixed top-0 left-0 right-0 z-50 bg-orange-600 text-white p-3 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full"></div>
        <span className="font-medium">You're offline</span>
        <span className="text-orange-200 text-sm">Some features may be limited</span>
      </div>
    </div>);
}
// PWA Status Hook
export function usePWAStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    useEffect(() => {
        // Check online status
        setIsOnline(navigator.onLine);
        // Check if running as PWA
        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
        // Check installability
        const handleBeforeInstallPrompt = () => {
            setIsInstallable(true);
        };
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsInstallable(false);
        };
        window.addEventListener('online', () => setIsOnline(true));
        window.addEventListener('offline', () => setIsOnline(false));
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);
        return () => {
            window.removeEventListener('online', () => setIsOnline(true));
            window.removeEventListener('offline', () => setIsOnline(false));
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);
    return {
        isOnline,
        isStandalone,
        isInstallable,
        isInstalled,
    };
}
// PWA Utilities
export const PWAUtils = {
    // Check if PWA is installable
    isInstallable: () => {
        return 'serviceWorker' in navigator && 'PushManager' in window;
    },
    // Get PWA display mode
    getDisplayMode: () => {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return 'standalone';
        }
        if (window.matchMedia('(display-mode: minimal-ui)').matches) {
            return 'minimal-ui';
        }
        if (window.matchMedia('(display-mode: fullscreen)').matches) {
            return 'fullscreen';
        }
        return 'browser';
    },
    // Check if running on mobile
    isMobile: () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    // Get platform info
    getPlatform: () => {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent))
            return 'ios';
        if (/android/.test(userAgent))
            return 'android';
        if (/windows/.test(userAgent))
            return 'windows';
        if (/mac/.test(userAgent))
            return 'mac';
        if (/linux/.test(userAgent))
            return 'linux';
        return 'unknown';
    },
    // Request notification permission
    requestNotificationPermission: async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    },
    // Show notification
    showNotification: (title, options) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                ...options
            });
        }
    },
    // Vibrate device
    vibrate: (pattern) => {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    },
    // Share content
    share: async (data) => {
        if ('share' in navigator) {
            try {
                await navigator.share(data);
                return true;
            }
            catch (error) {
                logger.error('Share failed:', { error });
                return false;
            }
        }
        return false;
    }
};
//# sourceMappingURL=PWAManager.jsx.map