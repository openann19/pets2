import { useEffect, useState, useCallback } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { useAuthStore } from '@/lib/auth-store';
import { PushNotificationManager, getPushNotificationManager } from '@/lib/push-notifications';
export function usePushNotifications(options = {}) {
    const { autoInitialize = true, onPermissionGranted, onPermissionDenied, onSubscribed, onUnsubscribed, onNotificationReceived, onUpdateAvailable } = options;
    const { isAuthenticated } = useAuthStore();
    const [manager, setManager] = useState(null);
    const [state, setState] = useState({
        isSupported: false,
        permission: 'default',
        isSubscribed: false,
        isInitializing: false,
        error: null
    });
    // Initialize manager
    useEffect(() => {
        const pushManager = getPushNotificationManager();
        setManager(pushManager);
        // Check initial support
        PushNotificationManager.isSupported().then(supported => {
            setState(prev => ({ ...prev, isSupported: supported }));
        });
        // Check initial permission
        PushNotificationManager.getPermission().then(permission => {
            setState(prev => ({ ...prev, permission }));
        });
    }, []);
    // Initialize push notifications
    const initialize = useCallback(async () => {
        if (!manager || state.isInitializing)
            return;
        setState(prev => ({ ...prev, isInitializing: true, error: null }));
        try {
            const success = await manager.initialize();
            if (success) {
                const status = manager.getSubscriptionStatus();
                setState(prev => ({
                    ...prev,
                    isSupported: status.isSupported,
                    permission: status.permission,
                    isSubscribed: status.isSubscribed,
                    isInitializing: false
                }));
            }
            else {
                setState(prev => ({
                    ...prev,
                    isInitializing: false,
                    error: new Error('Failed to initialize push notifications')
                }));
            }
        }
        catch (error) {
            setState(prev => ({
                ...prev,
                isInitializing: false,
                error: error
            }));
        }
    }, [manager, state.isInitializing]);
    // Request permission
    const requestPermission = useCallback(async () => {
        if (!manager)
            return 'denied';
        try {
            const permission = await manager.requestPermission();
            setState(prev => ({ ...prev, permission }));
            if (permission === 'granted') {
                onPermissionGranted?.();
                // Automatically subscribe after permission granted
                const subscriptionData = await manager.subscribe();
                if (subscriptionData) {
                    setState(prev => ({ ...prev, isSubscribed: true }));
                    onSubscribed?.();
                }
            }
            else if (permission === 'denied') {
                onPermissionDenied?.();
            }
            return permission;
        }
        catch (error) {
            logger.error('[usePushNotifications] Error requesting permission:', { error });
            return 'denied';
        }
    }, [manager, onPermissionGranted, onPermissionDenied, onSubscribed]);
    // Subscribe to notifications
    const subscribe = useCallback(async () => {
        if (!manager)
            return false;
        try {
            const subscriptionData = await manager.subscribe();
            if (subscriptionData) {
                setState(prev => ({ ...prev, isSubscribed: true }));
                onSubscribed?.();
                return true;
            }
            return false;
        }
        catch (error) {
            logger.error('[usePushNotifications] Error subscribing:', { error });
            setState(prev => ({ ...prev, error: error }));
            return false;
        }
    }, [manager, onSubscribed]);
    // Unsubscribe from notifications
    const unsubscribe = useCallback(async () => {
        if (!manager)
            return false;
        try {
            const success = await manager.unsubscribe();
            if (success) {
                setState(prev => ({ ...prev, isSubscribed: false }));
                onUnsubscribed?.();
            }
            return success;
        }
        catch (error) {
            logger.error('[usePushNotifications] Error unsubscribing:', { error });
            setState(prev => ({ ...prev, error: error }));
            return false;
        }
    }, [manager, onUnsubscribed]);
    // Show local notification
    const showNotification = useCallback((title, options) => {
        if (!manager)
            return;
        manager.showLocalNotification(title, options);
    }, [manager]);
    // Send test notification
    const sendTestNotification = useCallback(async () => {
        if (!manager)
            return;
        await manager.sendTestNotification();
    }, [manager]);
    // Check for updates
    const checkForUpdates = useCallback(async () => {
        if (!manager)
            return;
        await manager.checkForUpdates();
    }, [manager]);
    // Queue message for background sync
    const queueMessage = useCallback(async (message) => {
        if (!manager)
            return;
        await manager.queueMessageForSync(message);
    }, [manager]);
    // Auto-initialize when authenticated
    useEffect(() => {
        if (autoInitialize && isAuthenticated && manager && !state.isInitializing) {
            initialize();
        }
    }, [autoInitialize, isAuthenticated, manager, state.isInitializing, initialize]);
    // Listen for service worker events
    useEffect(() => {
        if (!manager)
            return;
        const handleMessage = (event) => {
            if (event.data?.type === 'notification-received') {
                onNotificationReceived?.(event.data.notification);
            }
            if (event.data?.type === 'update-available') {
                onUpdateAvailable?.();
            }
        };
        const handleUpdateAvailable = () => {
            onUpdateAvailable?.();
        };
        // Listen for messages from service worker
        navigator.serviceWorker?.addEventListener('message', handleMessage);
        // Listen for update events
        window.addEventListener('sw-update-available', handleUpdateAvailable);
        return () => {
            navigator.serviceWorker?.removeEventListener('message', handleMessage);
            window.removeEventListener('sw-update-available', handleUpdateAvailable);
        };
    }, [manager, onNotificationReceived, onUpdateAvailable]);
    return {
        // State
        isSupported: state.isSupported,
        permission: state.permission,
        isSubscribed: state.isSubscribed,
        isInitializing: state.isInitializing,
        error: state.error,
        // Methods
        initialize,
        requestPermission,
        subscribe,
        unsubscribe,
        showNotification,
        sendTestNotification,
        checkForUpdates,
        queueMessage,
        // Computed
        canSubscribe: state.isSupported && state.permission === 'granted' && !state.isSubscribed,
        canRequestPermission: state.isSupported && state.permission === 'default'
    };
}
// Hook for notification settings UI
export function useNotificationSettings() {
    const pushNotifications = usePushNotifications({
        autoInitialize: true
    });
    const [settings, setSettings] = useState({
        messages: true,
        matches: true,
        likes: true,
        superLikes: true,
        calls: true,
        promotional: false,
        updates: true
    });
    const [isSaving, setIsSaving] = useState(false);
    // Load settings from server
    useEffect(() => {
        if (!pushNotifications.isSubscribed)
            return;
        fetch('/api/notifications/settings', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        })
            .then(res => res.json())
            .then(data => {
            if (data.success && data.settings) {
                setSettings(data.settings);
            }
        })
            .catch(err => logger.error('[NotificationSettings] Error loading settings:', { error }));
    }, [pushNotifications.isSubscribed]);
    // Save settings to server
    const saveSettings = useCallback(async (newSettings) => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/notifications/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(newSettings)
            });
            if (response.ok) {
                setSettings(newSettings);
                return true;
            }
            return false;
        }
        catch (error) {
            logger.error('[NotificationSettings] Error saving settings:', { error });
            return false;
        }
        finally {
            setIsSaving(false);
        }
    }, []);
    const toggleSetting = useCallback((key) => {
        const newSettings = {
            ...settings,
            [key]: !settings[key]
        };
        saveSettings(newSettings);
    }, [settings, saveSettings]);
    const enableAll = useCallback(() => {
        const newSettings = Object.fromEntries(Object.keys(settings).map(key => [key, true]));
        saveSettings(newSettings);
    }, [settings, saveSettings]);
    const disableAll = useCallback(() => {
        const newSettings = Object.fromEntries(Object.keys(settings).map(key => [key, false]));
        saveSettings(newSettings);
    }, [settings, saveSettings]);
    return {
        ...pushNotifications,
        settings,
        isSaving,
        toggleSetting,
        enableAll,
        disableAll,
        saveSettings
    };
}
//# sourceMappingURL=usePushNotifications.js.map