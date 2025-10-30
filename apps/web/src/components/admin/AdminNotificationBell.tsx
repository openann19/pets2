'use client';
import { BellIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
export function AdminNotificationBell({ userId, isAdmin }) {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [_socket, setSocket] = useState(null);
    useEffect(() => {
        if (!isAdmin)
            return;
        // Connect to Socket.IO with admin credentials
        const socketInstance = io(process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001', {
            auth: {
                userId,
                isAdmin: true,
            },
        });
        setSocket(socketInstance);
        // Listen for new reports
        socketInstance.on('new-report', (data) => {
            const notification = {
                id: data.id,
                type: 'new-report',
                title: 'New Report Received',
                message: `${data.type.replace('_', ' ')} - ${data.category}`,
                timestamp: data.createdAt,
                read: false,
                data,
            };
            setNotifications((prev) => [notification, ...prev]);
            // Show browser notification if permitted
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('PawfectMatch Admin', {
                    body: `New report: ${notification.message}`,
                    icon: '/logo.png',
                });
            }
        });
        // Listen for flagged content
        socketInstance.on('content-flagged', (data) => {
            const notification = {
                id: `${data.contentType}-${Date.now()}`,
                type: 'content-flagged',
                title: 'Content Flagged by AI',
                message: `${data.contentType.toUpperCase()} from user ${data.userId} - ${data.violatedCategories.map(v => v.category).join(', ')}`,
                timestamp: data.timestamp,
                read: false,
                data,
            };
            setNotifications((prev) => [notification, ...prev]);
            // Show browser notification if permitted
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('PawfectMatch Admin', {
                    body: `AI flagged content: ${notification.message}`,
                    icon: '/logo.png',
                });
            }
        });
        // Listen for user actions
        socketInstance.on('user-action', (data) => {
            const notification = {
                id: `action-${Date.now()}`,
                type: 'user-action',
                title: 'User Action Taken',
                message: `${data.action} on user ${data.targetUserId}`,
                timestamp: data.timestamp,
                read: false,
                data,
            };
            setNotifications((prev) => [notification, ...prev]);
        });
        // Request browser notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        return () => {
            socketInstance.disconnect();
        };
    }, [isAdmin, userId]);
    const unreadCount = notifications.filter((n) => !n.read).length;
    const markAsRead = (id) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };
    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };
    const clearAll = () => {
        setNotifications([]);
    };
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1)
            return 'Just now';
        if (minutes < 60)
            return `${minutes}m ago`;
        if (hours < 24)
            return `${hours}h ago`;
        return `${days}d ago`;
    };
    if (!isAdmin)
        return null;
    return (<div className="relative">
            <button onClick={() => { setShowDropdown(!showDropdown); }} className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}>
                <BellIcon className="h-6 w-6 text-gray-700 dark:text-gray-300"/>
                {unreadCount > 0 && (<motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>)}
            </button>

            <AnimatePresence>
                {showDropdown && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Notifications
                                </h3>
                                <div className="flex gap-2">
                                    {unreadCount > 0 && (<button onClick={markAllAsRead} className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400">
                                            Mark all read
                                        </button>)}
                                    {notifications.length > 0 && (<button onClick={clearAll} className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400">
                                            Clear all
                                        </button>)}
                                </div>
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (<div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    <BellIcon className="h-12 w-12 mx-auto mb-2 opacity-30"/>
                                    <p>No notifications yet</p>
                                </div>) : (<div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {notifications.map((notification) => (<motion.div key={notification.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-4 cursor-pointer transition-colors ${notification.read
                        ? 'bg-white dark:bg-gray-800'
                        : 'bg-purple-50 dark:bg-purple-900/20'} hover:bg-gray-50 dark:hover:bg-gray-700`} onClick={() => {
                        markAsRead(notification.id);
                        // Navigate to relevant page based on notification type
                        if (notification.type === 'new-report') {
                            window.location.href = '/admin/moderation/reports';
                        }
                        else if (notification.type === 'content-flagged') {
                            window.location.href = '/admin/moderation/analytics';
                        }
                    }}>
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0">
                                                    {notification.type === 'new-report' && (<div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                                            <span className="text-red-600 dark:text-red-400 text-xl">
                                                                🚨
                                                            </span>
                                                        </div>)}
                                                    {notification.type === 'content-flagged' && (<div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                                            <span className="text-orange-600 dark:text-orange-400 text-xl">
                                                                ⚠️
                                                            </span>
                                                        </div>)}
                                                    {notification.type === 'user-action' && (<div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                            <span className="text-blue-600 dark:text-blue-400 text-xl">
                                                                ℹ️
                                                            </span>
                                                        </div>)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                        {formatTimestamp(notification.timestamp)}
                                                    </p>
                                                </div>
                                                {!notification.read && (<div className="flex-shrink-0">
                                                        <div className="h-2 w-2 bg-purple-600 rounded-full"/>
                                                    </div>)}
                                            </div>
                                        </motion.div>))}
                                </div>)}
                        </div>

                        {notifications.length > 0 && (<div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                                <a href="/admin/moderation/reports" className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium" onClick={() => { setShowDropdown(false); }}>
                                    View All Reports →
                                </a>
                            </div>)}
                    </motion.div>)}
            </AnimatePresence>
        </div>);
}
//# sourceMappingURL=AdminNotificationBell.jsx.map