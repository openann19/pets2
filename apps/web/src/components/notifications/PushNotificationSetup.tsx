/**
 * Push Notification Setup Component
 * Handles FCM token registration and permission requests
 */
'use client';
import { useState, useEffect } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon, CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useFirebaseMessaging } from '@/services/firebase-messaging';
import { InteractiveButton } from '@/components/ui/Interactive';
export function PushNotificationSetup({ onComplete, className = '', showSkip = true }) {
    const { isSupported, permission, token, error, isInitialized, requestPermission, sendTestNotification } = useFirebaseMessaging();
    const [isLoading, setIsLoading] = useState(false);
    const [showTest, setShowTest] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    // Auto-complete when permission is granted
    useEffect(() => {
        if (permission === 'granted' && token) {
            onComplete?.(true);
        }
        else if (permission === 'denied') {
            onComplete?.(false);
        }
    }, [permission, token, onComplete]);
    const handleEnableNotifications = async () => {
        setIsLoading(true);
        try {
            await requestPermission();
        }
        catch (error) {
            logger.error('Failed to request permission:', { error });
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleTestNotification = async () => {
        try {
            await sendTestNotification();
            setShowTest(true);
            setTimeout(() => setShowTest(false), 3000);
        }
        catch (error) {
            logger.error('Failed to send test notification:', { error });
        }
    };
    const handleSkip = () => {
        setDismissed(true);
        onComplete?.(false);
    };
    // Don't render if not supported or dismissed
    if (!isSupported || dismissed) {
        return null;
    }
    // Don't render if already granted
    if (permission === 'granted' && token) {
        return (<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`bg-green-50 border-2 border-green-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center">
          <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mr-3"/>
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800">
              Push notifications enabled
            </p>
            <p className="text-xs text-green-600 mt-1">
              You'll receive notifications for new matches and messages
            </p>
          </div>
          {showSkip && (<button onClick={handleSkip} className="ml-2 text-green-600 hover:text-green-800">
              <XMarkIcon className="h-5 w-5"/>
            </button>)}
        </div>
      </motion.div>);
    }
    return (<AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 ${className}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <BellIcon className="h-8 w-8 text-blue-600"/>
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Stay in the loop with push notifications
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Get instant notifications for new matches, messages, and premium offers. 
              Never miss a connection with your furry friends!
            </p>

            {/* Error Display */}
            {error && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mr-2"/>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </motion.div>)}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <InteractiveButton onClick={handleEnableNotifications} disabled={isLoading || !isInitialized} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200" icon={isLoading ? (<div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"/>) : (<BellIcon className="w-5 h-5"/>)}>
                {isLoading ? 'Enabling...' : 'Enable Notifications'}
              </InteractiveButton>

              {permission === 'granted' && (<InteractiveButton onClick={handleTestNotification} variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-lg" icon={<Cog6ToothIcon className="w-5 h-5"/>}>
                  Test Notification
                </InteractiveButton>)}

              {showSkip && (<InteractiveButton onClick={handleSkip} variant="ghost" className="text-gray-500 hover:text-gray-700 px-6 py-3">
                  Skip for now
                </InteractiveButton>)}
            </div>

            {/* Test Notification Success */}
            <AnimatePresence>
              {showTest && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mr-2"/>
                    <p className="text-sm text-green-800">
                      Test notification sent! Check your notifications.
                    </p>
                  </div>
                </motion.div>)}
            </AnimatePresence>

            {/* Permission States */}
            {permission === 'denied' && (<div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mr-2"/>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Notifications blocked
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Enable notifications in your browser settings to stay updated
                    </p>
                  </div>
                </div>
              </div>)}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>);
}
// Compact version for onboarding
export function CompactNotificationSetup({ onComplete }) {
    const { permission, token, requestPermission } = useFirebaseMessaging();
    const [isLoading, setIsLoading] = useState(false);
    const handleEnable = async () => {
        setIsLoading(true);
        try {
            await requestPermission();
        }
        finally {
            setIsLoading(false);
        }
    };
    if (permission === 'granted' && token) {
        return (<div className="flex items-center text-green-600">
        <CheckCircleIcon className="h-5 w-5 mr-2"/>
        <span className="text-sm font-medium">Notifications enabled</span>
      </div>);
    }
    return (<InteractiveButton onClick={handleEnable} disabled={isLoading} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" icon={isLoading ? (<div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>) : (<BellIcon className="w-4 h-4"/>)}>
      {isLoading ? 'Enabling...' : 'Enable Notifications'}
    </InteractiveButton>);
}
//# sourceMappingURL=PushNotificationSetup.jsx.map