/**
 * 🔔 NOTIFICATION BELL COMPONENT
 * Animated notification bell with bounce effect and badge
 */
'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
export default function NotificationBell({ count = 0, hasUnread = false, onClick, size = 'md', variant = 'outline', className = '', showBadge = true, bounceOnNew = true }) {
    const [isBouncing, setIsBouncing] = useState(false);
    const [previousCount, setPreviousCount] = useState(count);
    // Trigger bounce animation when count increases
    useEffect(() => {
        if (bounceOnNew && count > previousCount && count > 0) {
            setIsBouncing(true);
            setTimeout(() => setIsBouncing(false), 600);
        }
        setPreviousCount(count);
    }, [count, previousCount, bounceOnNew]);
    // Size variants
    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };
    // Badge size variants
    const badgeSizeClasses = {
        sm: 'w-4 h-4 text-xs',
        md: 'w-5 h-5 text-xs',
        lg: 'w-6 h-6 text-sm'
    };
    const Icon = variant === 'solid' ? BellSolidIcon : BellIcon;
    return (<div className={`relative ${className}`}>
      <motion.button onClick={onClick} className={`
          relative p-2 rounded-full transition-all duration-200
          ${hasUnread
            ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'text-neutral-600 dark:text-neutral-400 hover:text-primary-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'}
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          dark:focus:ring-offset-neutral-900
        `} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} animate={isBouncing ? {
            scale: [1, 1.2, 1],
            rotate: [0, -10, 10, 0]
        } : {}} transition={{
            type: "spring",
            stiffness: 400,
            damping: 10
        }}>
        <Icon className={sizeClasses[size]}/>
        
        {/* Pulse effect for unread notifications */}
        {hasUnread && (<motion.div className="absolute inset-0 rounded-full bg-primary-500/20" animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5]
            }} transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }}/>)}
      </motion.button>

      {/* Notification badge */}
      <AnimatePresence>
        {showBadge && count > 0 && (<motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 15 }} className={`
              absolute -top-1 -right-1 ${badgeSizeClasses[size]}
              bg-error-500 text-white rounded-full
              flex items-center justify-center
              font-bold shadow-lg
              border-2 border-white dark:border-neutral-900
            `}>
            {count > 99 ? '99+' : count}
          </motion.div>)}
      </AnimatePresence>

      {/* Ripple effect on click */}
      <AnimatePresence>
        {isBouncing && (<motion.div className="absolute inset-0 rounded-full bg-primary-500/30" initial={{ scale: 0, opacity: 0.8 }} animate={{ scale: 2, opacity: 0 }} exit={{ scale: 2, opacity: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}/>)}
      </AnimatePresence>
    </div>);
}
// Hook for managing notification state
export function useNotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [hasUnread, setHasUnread] = useState(false);
    const addNotification = (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        setHasUnread(true);
    };
    const markAsRead = (notificationId) => {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
        if (unreadCount <= 1) {
            setHasUnread(false);
        }
    };
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        setHasUnread(false);
    };
    const clearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
        setHasUnread(false);
    };
    return {
        notifications,
        unreadCount,
        hasUnread,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll
    };
}
//# sourceMappingURL=NotificationBell.jsx.map