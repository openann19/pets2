'use client';
import { useState, useEffect } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowDownTrayIcon, DevicePhoneMobileIcon, ComputerDesktopIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { InteractiveButton } from '../UI/Interactive';
export function InstallPrompt({ className = '' }) {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [platform, setPlatform] = useState('unknown');
    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }
        // Detect platform
        const userAgent = navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setPlatform('ios');
        }
        else if (/android/.test(userAgent)) {
            setPlatform('android');
        }
        else {
            setPlatform('desktop');
        }
        // Listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show prompt after a delay (better UX)
            setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
        };
        // Listen for app installed event
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowPrompt(false);
            setDeferredPrompt(null);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);
    const handleInstallClick = async () => {
        if (!deferredPrompt)
            return;
        setIsInstalling(true);
        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                logger.info('User accepted the install prompt');
            }
            else {
                logger.info('User dismissed the install prompt');
            }
        }
        catch (error) {
            logger.error('Error during installation:', { error });
        }
        finally {
            setIsInstalling(false);
            setShowPrompt(false);
            setDeferredPrompt(null);
        }
    };
    const handleDismiss = () => {
        setShowPrompt(false);
        // Don't show again for this session
        sessionStorage.setItem('pwa-install-dismissed', 'true');
    };
    // Don't show if already installed or dismissed
    if (isInstalled || !showPrompt || !deferredPrompt) {
        return null;
    }
    // Check if user dismissed in this session
    if (sessionStorage.getItem('pwa-install-dismissed')) {
        return null;
    }
    return (<AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className={`fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto ${className}`}>
        <div className="glass-morphism rounded-2xl p-6 shadow-2xl border border-white/20">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl">
                <SparklesIcon className="h-6 w-6 text-white"/>
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100">
                  Install PawfectMatch
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Get the full app experience
                </p>
              </div>
            </div>
            <button onClick={handleDismiss} className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors" aria-label="Dismiss install prompt">
              <XMarkIcon className="h-5 w-5 text-neutral-500"/>
            </button>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span className="text-neutral-700 dark:text-neutral-300">
                Faster loading & offline access
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
              <span className="text-neutral-700 dark:text-neutral-300">
                Push notifications for matches
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span className="text-neutral-700 dark:text-neutral-300">
                Native app-like experience
              </span>
            </div>
          </div>

          {/* Install Button */}
          <InteractiveButton onClick={handleInstallClick} disabled={isInstalling} variant="primary" size="lg" className="w-full">
            {isInstalling ? (<>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"/>
                Installing...
              </>) : (<>
                <ArrowDownTrayIcon className="h-5 w-5 mr-2"/>
                Install App
              </>)}
          </InteractiveButton>

          {/* Platform-specific instructions */}
          {platform === 'ios' && (<div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DevicePhoneMobileIcon className="h-4 w-4 text-blue-600"/>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  iOS Instructions
                </span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Tap the Share button and select "Add to Home Screen"
              </p>
            </div>)}

          {platform === 'android' && (<div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DevicePhoneMobileIcon className="h-4 w-4 text-green-600"/>
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Android Instructions
                </span>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300">
                Tap "Install" to add to your home screen
              </p>
            </div>)}

          {platform === 'desktop' && (<div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ComputerDesktopIcon className="h-4 w-4 text-purple-600"/>
                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  Desktop Instructions
                </span>
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                Install as a desktop app for better performance
              </p>
            </div>)}
        </div>
      </motion.div>
    </AnimatePresence>);
}
// Hook for programmatic control
export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };
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
    const install = async () => {
        if (!deferredPrompt)
            return false;
        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            return outcome === 'accepted';
        }
        catch (error) {
            logger.error('Installation failed:', { error });
            return false;
        }
    };
    return {
        isInstallable,
        isInstalled,
        install,
    };
}
//# sourceMappingURL=InstallPrompt.jsx.map