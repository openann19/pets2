/**
 * PWA Utilities
 * Service worker management, offline capabilities, and PWA features
 */
import { useState, useEffect, useCallback } from 'react'
import { logger } from '@pawfectmatch/core';
;
/**
 * Hook for PWA functionality
 */
export function usePWA(config = {}) {
    const [state, setState] = useState({
        isOnline: navigator.onLine,
        isInstalled: false,
        isStandalone: false,
        serviceWorkerRegistered: false,
        backgroundSyncSupported: false,
        pushNotificationSupported: false,
        offlineActions: [],
    });
    const defaultConfig = {
        enableServiceWorker: true,
        enableOfflineMode: true,
        enableBackgroundSync: true,
        enablePushNotifications: true,
        enablePeriodicSync: true,
        cacheStrategy: 'network-first',
    };
    const finalConfig = { ...defaultConfig, ...config };
    // Check if app is installed
    const checkInstallation = useCallback(() => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isInstalled = 'getInstalledRelatedApps' in navigator;
        setState(prev => ({
            ...prev,
            isStandalone,
            isInstalled: isInstalled || isStandalone,
        }));
    }, []);
    // Register service worker
    const registerServiceWorker = useCallback(async () => {
        if (!('serviceWorker' in navigator) || !finalConfig.enableServiceWorker) {
            return false;
        }
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
            });
            logger.warn('[PWA] Service Worker registered:', { registration });
            setState(prev => ({ ...prev, serviceWorkerRegistered: true }));
            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker !== null) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller !== null) {
                            // New version available
                            logger.warn('[PWA] New version available');
                        }
                    });
                }
            });
            return true;
        }
        catch (error) {
            logger.error('[PWA] Service Worker registration failed:', { error });
            return false;
        }
    }, [finalConfig.enableServiceWorker]);
    // Check browser capabilities
    const checkCapabilities = useCallback(() => {
        const backgroundSyncSupported = 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;
        const pushNotificationSupported = 'serviceWorker' in navigator && 'PushManager' in window;
        setState(prev => ({
            ...prev,
            backgroundSyncSupported,
            pushNotificationSupported,
        }));
    }, []);
    // Handle online/offline status
    const handleOnlineStatus = useCallback(() => {
        setState(prev => ({ ...prev, isOnline: navigator.onLine }));
    }, []);
    // Initialize PWA
    useEffect(() => {
        const initializePWA = async () => {
            checkInstallation();
            checkCapabilities();
            if (finalConfig.enableServiceWorker) {
                await registerServiceWorker();
            }
        };
        void initializePWA();
        // Listen for online/offline events
        window.addEventListener('online', handleOnlineStatus);
        window.addEventListener('offline', handleOnlineStatus);
        // Listen for app installation
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            setState(prev => ({ ...prev, isInstalled: false }));
        });
        return () => {
            window.removeEventListener('online', handleOnlineStatus);
            window.removeEventListener('offline', handleOnlineStatus);
        };
    }, [checkInstallation, checkCapabilities, registerServiceWorker, handleOnlineStatus, finalConfig.enableServiceWorker]);
    return {
        state,
        registerServiceWorker,
        checkInstallation,
    };
}
/**
 * Hook for offline action management
 */
export function useOfflineActions() {
    const [actions, setActions] = useState([]);
    // Add offline action
    const addOfflineAction = useCallback((action) => {
        const newAction = {
            ...action,
            id: `action_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            timestamp: Date.now(),
            retryCount: 0,
        };
        setActions(prev => [...prev, newAction]);
        // Store in IndexedDB
        storeOfflineAction(newAction);
        // Register for background sync
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            void navigator.serviceWorker.ready.then(registration => {
                return registration.sync.register('background-sync');
            });
        }
        return newAction.id;
    }, []);
    // Remove offline action
    const removeOfflineAction = useCallback((actionId) => {
        setActions(prev => prev.filter(action => action.id !== actionId));
        removeStoredOfflineAction(actionId);
    }, []);
    // Retry offline action
    const retryOfflineAction = useCallback(async (actionId) => {
        const action = actions.find(a => a.id === actionId);
        if (action === undefined)
            return false;
        try {
            const response = await fetch(action.url, {
                method: action.method,
                headers: action.headers,
                body: action.body,
            });
            if (response.ok) {
                removeOfflineAction(actionId);
                return true;
            }
            else {
                throw new Error(`HTTP ${response.status}`);
            }
        }
        catch (error) {
            logger.error('[PWA] Failed to retry offline action:', { error });
            // Increment retry count
            setActions(prev => prev.map(a => a.id === actionId
                ? { ...a, retryCount: a.retryCount + 1 }
                : a));
            return false;
        }
    }, [actions, removeOfflineAction]);
    // Load offline actions from storage
    useEffect(() => {
        void loadOfflineActions().then(setActions);
    }, []);
    return {
        actions,
        addOfflineAction,
        removeOfflineAction,
        retryOfflineAction,
    };
}
/**
 * Hook for push notifications
 */
export function usePushNotifications() {
    const [permission, setPermission] = useState('default');
    const [subscription, setSubscription] = useState(null);
    // Request notification permission
    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            logger.warn('[PWA] Notifications not supported');
            return false;
        }
        const result = await Notification.requestPermission();
        setPermission(result);
        return result === 'granted';
    }, []);
    // Subscribe to push notifications
    const subscribeToPush = useCallback(async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            logger.warn('[PWA] Push notifications not supported');
            return false;
        }
        try {
            const registration = await navigator.serviceWorker.ready;
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                setSubscription(existingSubscription);
                return existingSubscription;
            }
            // Create new subscription
            const newSubscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: getVapidPublicKey(), // You'll need to implement this
            });
            setSubscription(newSubscription);
            // Send subscription to server
            await sendSubscriptionToServer(newSubscription);
            return newSubscription;
        }
        catch (error) {
            logger.error('[PWA] Failed to subscribe to push notifications:', { error });
            return false;
        }
    }, []);
    // Unsubscribe from push notifications
    const unsubscribeFromPush = useCallback(async () => {
        if (subscription) {
            await subscription.unsubscribe();
            setSubscription(null);
        }
    }, [subscription]);
    // Check current permission
    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);
    return {
        permission,
        subscription,
        requestPermission,
        subscribeToPush,
        unsubscribeFromPush,
    };
}
/**
 * Utility functions
 */
// Store offline action in IndexedDB
async function storeOfflineAction(action) {
    try {
        const db = await openIndexedDB();
        const transaction = db.transaction(['offlineActions'], 'readwrite');
        const store = transaction.objectStore('offlineActions');
        await store.add(action);
    }
    catch (error) {
        logger.error('[PWA] Failed to store offline action:', { error });
    }
}
// Remove offline action from IndexedDB
async function removeStoredOfflineAction(actionId) {
    try {
        const db = await openIndexedDB();
        const transaction = db.transaction(['offlineActions'], 'readwrite');
        const store = transaction.objectStore('offlineActions');
        await store.delete(actionId);
    }
    catch (error) {
        logger.error('[PWA] Failed to remove offline action:', { error });
    }
}
// Load offline actions from IndexedDB
async function loadOfflineActions() {
    try {
        const db = await openIndexedDB();
        const transaction = db.transaction(['offlineActions'], 'readonly');
        const store = transaction.objectStore('offlineActions');
        return await store.getAll();
    }
    catch (error) {
        logger.error('[PWA] Failed to load offline actions:', { error });
        return [];
    }
}
// Open IndexedDB
function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('PawfectMatchDB', 1);
        request.onerror = () => { reject(request.error); };
        request.onsuccess = () => { resolve(request.result); };
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('offlineActions')) {
                const store = db.createObjectStore('offlineActions', { keyPath: 'id' });
                store.createIndex('timestamp', 'timestamp', { unique: false });
                store.createIndex('type', 'type', { unique: false });
            }
        };
    });
}
// Get VAPID public key (you'll need to implement this)
function getVapidPublicKey() {
    // This should return your VAPID public key
    // You can generate one using web-push library
    return 'your-vapid-public-key-here';
}
// Send subscription to server
async function sendSubscriptionToServer(subscription) {
    try {
        await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
        });
    }
    catch (error) {
        logger.error('[PWA] Failed to send subscription to server:', { error });
    }
}
/**
 * PWA installation utilities
 */
export const pwaUtils = {
    // Show install prompt
    showInstallPrompt: async () => {
        if ('getInstalledRelatedApps' in navigator) {
            const relatedApps = await navigator.getInstalledRelatedApps();
            if (relatedApps.length > 0) {
                return false; // Already installed
            }
        }
        // Check if we can show the install prompt
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (isStandalone) {
            return false; // Already installed
        }
        return true;
    },
    // Check if app is installable
    isInstallable: () => {
        return 'getInstalledRelatedApps' in navigator ||
            window.matchMedia('(display-mode: standalone)').matches;
    },
    // Get app installation status
    getInstallationStatus: () => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isInstalled = 'getInstalledRelatedApps' in navigator;
        return {
            isStandalone,
            isInstalled: isInstalled || isStandalone,
            canInstall: !isStandalone && !isInstalled,
        };
    },
    // Clear all caches
    clearAllCaches: async () => {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
        }
    },
    // Get cache usage
    getCacheUsage: async () => {
        if (!('storage' in navigator && 'estimate' in navigator.storage)) {
            return null;
        }
        const estimate = await navigator.storage.estimate();
        return {
            used: estimate.usage || 0,
            quota: estimate.quota || 0,
            usage: estimate.usage !== undefined && estimate.quota !== undefined ? (estimate.usage / estimate.quota) * 100 : 0,
        };
    },
};
//# sourceMappingURL=pwa-utils.js.map