'use client';
import React, { createContext, useContext, useEffect, useState } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { usePWA, useOfflineActions, usePushNotifications, pwaUtils } from '@/utils/pwa-utils';
import { CloudArrowUpIcon, CloudArrowDownIcon, BellIcon, BellSlashIcon, WifiIcon, SignalSlashIcon, ArrowDownTrayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
const PWAContext = createContext(null);
export function usePWAContext() {
    const context = useContext(PWAContext);
    if (!context) {
        throw new Error('usePWAContext must be used within a PWAProvider');
    }
    return context;
}
export function PWAProvider({ children, enableServiceWorker = true, enableOfflineMode = true, enableBackgroundSync = true, enablePushNotifications = true, enablePeriodicSync = true, cacheStrategy = 'network-first', }) {
    const { state: pwaState } = usePWA({
        enableServiceWorker,
        enableOfflineMode,
        enableBackgroundSync,
        enablePushNotifications,
        enablePeriodicSync,
        cacheStrategy,
    });
    const { actions: offlineActions, addOfflineAction, removeOfflineAction, retryOfflineAction } = useOfflineActions();
    const { requestPermission: requestNotificationPermission, subscribeToPush, unsubscribeFromPush, } = usePushNotifications();
    const contextValue = {
        ...pwaState,
        offlineActions,
        addOfflineAction,
        removeOfflineAction,
        retryOfflineAction,
        requestNotificationPermission,
        subscribeToPush,
        unsubscribeFromPush,
        showInstallPrompt: pwaUtils.showInstallPrompt,
        clearAllCaches: pwaUtils.clearAllCaches,
        getCacheUsage: pwaUtils.getCacheUsage,
    };
    return (<PWAContext.Provider value={contextValue}>
      {children}
      <PWAStatusIndicator />
      <OfflineActionsPanel />
      <InstallPrompt />
    </PWAContext.Provider>);
}
/**
 * PWA Status Indicator Component
 */
function PWAStatusIndicator() {
    const { isOnline, isInstalled, isStandalone, serviceWorkerRegistered } = usePWAContext();
    const [showStatus, setShowStatus] = useState(false);
    useEffect(() => {
        // Show status indicator when offline or when service worker updates
        if (!isOnline || !serviceWorkerRegistered) {
            setShowStatus(true);
        }
        else {
            // Hide after 3 seconds if online
            const timer = setTimeout(() => setShowStatus(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isOnline, serviceWorkerRegistered]);
    if (!showStatus)
        return null;
    return (<div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg flex items-center space-x-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}>
        {isOnline ? (<>
            <WifiIcon className="h-4 w-4"/>
            <span>Online</span>
          </>) : (<>
            <SignalSlashIcon className="h-4 w-4"/>
            <span>Offline</span>
          </>)}
        {isInstalled && (<CheckCircleIcon className="h-4 w-4"/>)}
      </div>
    </div>);
}
/**
 * Offline Actions Panel Component
 */
function OfflineActionsPanel() {
    const { offlineActions, retryOfflineAction, removeOfflineAction } = usePWAContext();
    const [isOpen, setIsOpen] = useState(false);
    if (offlineActions.length === 0)
        return null;
    return (<>
      <button onClick={() => setIsOpen(true)} className="fixed bottom-4 left-4 z-50 bg-orange-500 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition-colors" aria-label="View offline actions">
        <CloudArrowUpIcon className="h-5 w-5"/>
        {offlineActions.length > 0 && (<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {offlineActions.length}
          </span>)}
      </button>

      {isOpen && (<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Offline Actions
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                ✕
              </button>
            </div>

            <div className="p-4 max-h-64 overflow-y-auto">
              {offlineActions.length === 0 ? (<p className="text-gray-500 dark:text-gray-400 text-center">
                  No offline actions
                </p>) : (<div className="space-y-3">
                  {offlineActions.map((action) => (<div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {action.type.replace('-', ' ')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(action.timestamp).toLocaleString()}
                        </p>
                        {action.retryCount > 0 && (<p className="text-xs text-orange-500">
                            Retry {action.retryCount}/3
                          </p>)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => retryOfflineAction(action.id)} className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors" disabled={action.retryCount >= 3}>
                          Retry
                        </button>
                        <button onClick={() => removeOfflineAction(action.id)} className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors">
                          Remove
                        </button>
                      </div>
                    </div>))}
                </div>)}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => {
                offlineActions.forEach(action => retryOfflineAction(action.id));
            }} className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Retry All
              </button>
            </div>
          </div>
        </div>)}
    </>);
}
/**
 * Install Prompt Component
 */
function InstallPrompt() {
    const { isInstalled, isStandalone } = usePWAContext();
    const [showPrompt, setShowPrompt] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    useEffect(() => {
        // Don't show if already installed
        if (isInstalled || isStandalone) {
            setShowPrompt(false);
            return;
        }
        // Listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, [isInstalled, isStandalone]);
    const handleInstall = async () => {
        if (!deferredPrompt)
            return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            logger.info('User accepted the install prompt');
        }
        else {
            logger.info('User dismissed the install prompt');
        }
        setDeferredPrompt(null);
        setShowPrompt(false);
    };
    const handleDismiss = () => {
        setShowPrompt(false);
        setDeferredPrompt(null);
    };
    if (!showPrompt)
        return null;
    return (<div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <ArrowDownTrayIcon className="h-6 w-6 text-pink-500"/>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Install PawfectMatch
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Get the full app experience with offline access and push notifications.
            </p>
            <div className="flex items-center space-x-2 mt-3">
              <button onClick={handleInstall} className="px-3 py-1 bg-pink-500 text-white text-xs rounded hover:bg-pink-600 transition-colors">
                Install
              </button>
              <button onClick={handleDismiss} className="px-3 py-1 text-gray-500 text-xs hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                Not now
              </button>
            </div>
          </div>
          <button onClick={handleDismiss} className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            ✕
          </button>
        </div>
      </div>
    </div>);
}
/**
 * PWA Settings Panel Component
 */
export function PWASettingsPanel() {
    const { isOnline, isInstalled, isStandalone, serviceWorkerRegistered, backgroundSyncSupported, pushNotificationSupported, requestNotificationPermission, subscribeToPush, unsubscribeFromPush, clearAllCaches, getCacheUsage, } = usePWAContext();
    const [isOpen, setIsOpen] = useState(false);
    const [cacheUsage, setCacheUsage] = useState(null);
    const [notificationPermission, setNotificationPermission] = useState('default');
    useEffect(() => {
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
        getCacheUsage().then(setCacheUsage);
    }, [getCacheUsage]);
    const handleNotificationToggle = async () => {
        if (notificationPermission === 'granted') {
            await unsubscribeFromPush();
            setNotificationPermission('default');
        }
        else {
            const granted = await requestNotificationPermission();
            if (granted) {
                await subscribeToPush();
                setNotificationPermission('granted');
            }
        }
    };
    const handleClearCache = async () => {
        await clearAllCaches();
        getCacheUsage().then(setCacheUsage);
    };
    return (<>
      <button onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors" aria-label="Open PWA settings">
        ⚙️
      </button>

      {isOpen && (<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                PWA Settings
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Connection Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white">Connection</span>
                <div className="flex items-center space-x-2">
                  {isOnline ? (<WifiIcon className="h-5 w-5 text-green-500"/>) : (<SignalSlashIcon className="h-5 w-5 text-red-500"/>)}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Installation Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white">Installation</span>
                <div className="flex items-center space-x-2">
                  {isInstalled ? (<CheckCircleIcon className="h-5 w-5 text-green-500"/>) : (<ArrowDownTrayIcon className="h-5 w-5 text-gray-400"/>)}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {isInstalled ? 'Installed' : 'Not installed'}
                  </span>
                </div>
              </div>

              {/* Service Worker */}
              <div className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white">Service Worker</span>
                <span className={`text-sm ${serviceWorkerRegistered ? 'text-green-500' : 'text-red-500'}`}>
                  {serviceWorkerRegistered ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Background Sync */}
              <div className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white">Background Sync</span>
                <span className={`text-sm ${backgroundSyncSupported ? 'text-green-500' : 'text-gray-500'}`}>
                  {backgroundSyncSupported ? 'Supported' : 'Not supported'}
                </span>
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white">Push Notifications</span>
                <div className="flex items-center space-x-2">
                  <button onClick={handleNotificationToggle} className={`p-1 rounded ${notificationPermission === 'granted' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                    {notificationPermission === 'granted' ? (<BellIcon className="h-4 w-4"/>) : (<BellSlashIcon className="h-4 w-4"/>)}
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {notificationPermission === 'granted' ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              {/* Cache Usage */}
              {cacheUsage && (<div className="flex items-center justify-between">
                  <span className="text-gray-900 dark:text-white">Cache Usage</span>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(cacheUsage.usage)}% used
                    </div>
                    <div className="text-xs text-gray-500">
                      {(cacheUsage.used / 1024 / 1024).toFixed(1)} MB
                    </div>
                  </div>
                </div>)}

              {/* Clear Cache Button */}
              <button onClick={handleClearCache} className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                Clear Cache
              </button>
            </div>
          </div>
        </div>)}
    </>);
}
//# sourceMappingURL=PWAProvider.jsx.map