'use client';

import { AdminNotificationBell } from '@/components/admin/AdminNotificationBell';
import {
  EnhancedModal,
  EnhancedToast,
  SkipLink,
  useAnnouncement,
  useColorScheme,
  useFocusManagement,
  useHighContrastMode,
} from '@/components/admin/UIEnhancements';
import { useReducedMotion } from '@/hooks/useAccessibilityHooks';
import {
  Bars3Icon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  CloudIcon,
  Cog6ToothIcon,
  ComputerDesktopIcon,
  CpuChipIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  HomeIcon,
  MapIcon,
  MoonIcon,
  PhotoIcon,
  ShieldCheckIcon,
  SparklesIcon,
  SunIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Admin navigation matching mobile structure
const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: HomeIcon,
    description: 'Overview and quick actions',
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: ChartBarIcon,
    description: 'Platform analytics and insights',
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: UserIcon,
    description: 'User management',
  },
  {
    name: 'Security',
    href: '/admin/security',
    icon: ShieldCheckIcon,
    description: 'Security alerts and monitoring',
  },
  {
    name: 'Billing',
    href: '/admin/billing',
    icon: CurrencyDollarIcon,
    description: 'Customer billing and subscriptions',
  },
  {
    name: 'Chats',
    href: '/admin/chats',
    icon: ChatBubbleLeftRightIcon,
    description: 'Chat moderation',
  },
  {
    name: 'Uploads',
    href: '/admin/uploads',
    icon: PhotoIcon,
    description: 'Upload management',
  },
  {
    name: 'Verifications',
    href: '/admin/verifications',
    icon: CheckBadgeIcon,
    description: 'Verification management',
  },
  {
    name: 'Services',
    href: '/admin/services',
    icon: CpuChipIcon,
    description: 'Services management',
  },
  {
    name: 'Config',
    href: '/admin/config',
    icon: Cog6ToothIcon,
    description: 'API configuration',
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: DocumentIcon,
    description: 'User reports',
  },
  {
    name: 'Animations',
    href: '/admin/animations',
    icon: SparklesIcon,
    description: 'Animation configuration & testing',
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      message: string;
      type: 'success' | 'error' | 'warning' | 'info';
      duration?: number;
    }>
  >([]);
  const [showSettings, setShowSettings] = useState(false);
  const [user] = useState({
    id: 'admin-user-1',
    name: 'Admin User',
    email: 'admin@pawfectmatch.com',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=8B5CF6&color=fff',
    role: 'admin',
  });

  const pathname = usePathname();
  const { announce } = useAnnouncement();
  const { saveFocus, restoreFocus } = useFocusManagement();
  const prefersReducedMotion = useReducedMotion();
  const isHighContrast = useHighContrastMode();
  const systemColorScheme = useColorScheme();

  // Initialize dark mode from system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else {
      setDarkMode(systemColorScheme === 'dark');
    }
  }, [systemColorScheme]);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Handle sidebar focus management
  useEffect(() => {
    if (sidebarOpen) {
      saveFocus();
    } else {
      restoreFocus();
    }
  }, [sidebarOpen, saveFocus, restoreFocus]);

  // Dark mode toggle function - currently unused but kept for future implementation
  // const toggleDarkMode = () => {
  //   setDarkMode(!darkMode);
  //   announce(`Switched to ${!darkMode ? 'dark' : 'light'} mode`);
  // };

  const addNotification = (notification: Omit<(typeof notifications)[0], 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
    announce(sidebarOpen ? 'Sidebar closed' : 'Sidebar opened');
  };

  const handleNavigation = (item: (typeof navigation)[0]) => {
    setSidebarOpen(false);
    announce(`Navigated to ${item.name}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SkipLink href="#main-content">Skip to main content</SkipLink>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen ? <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        /> : null}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg lg:translate-x-0 lg:static lg:inset-0"
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  PawfectMatch
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close sidebar"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav
            className="flex-1 px-4 py-4 space-y-2"
            aria-label="Main navigation"
          >
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => handleNavigation(item)}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  aria-current={isActive ? 'page' : undefined}
                  aria-describedby={`nav-description-${item.name.toLowerCase()}`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                      }`}
                    aria-hidden="true"
                  />
                  <span>{item.name}</span>
                  <div
                    id={`nav-description-${item.name.toLowerCase()}`}
                    className="sr-only"
                  >
                    {item.description}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={handleSidebarToggle}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Open sidebar"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <h1 className="ml-4 lg:ml-0 text-xl font-semibold text-gray-900 dark:text-white">
                {navigation.find((item) => item.href === pathname)?.name || 'Admin'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setDarkMode(false)}
                  className={`p-2 rounded-md transition-colors ${!darkMode
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  aria-label="Light mode"
                >
                  <SunIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDarkMode(true)}
                  className={`p-2 rounded-md transition-colors ${darkMode
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  aria-label="Dark mode"
                >
                  <MoonIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDarkMode(systemColorScheme === 'dark')}
                  className={`p-2 rounded-md transition-colors ${darkMode === (systemColorScheme === 'dark')
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  aria-label="System theme"
                >
                  <ComputerDesktopIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Admin Notification Bell */}
              <AdminNotificationBell
                userId={user.id}
                isAdmin={user.role === 'admin'}
              />

              {/* Settings */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Settings"
              >
                <Cog6ToothIcon className="h-6 w-6" />
              </button>

              {/* User menu */}
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main
          id="main-content"
          className="flex-1"
        >
          {children}
        </main>
      </div>

      {/* Settings modal */}
      <EnhancedModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Settings"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Appearance</h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Dark mode</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isHighContrast}
                    disabled
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    High contrast mode (system preference)
                  </span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={prefersReducedMotion}
                    disabled
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Reduced motion (system preference)
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Notifications
            </h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Security alerts
                  </span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    System updates
                  </span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Email notifications
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Accessibility
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Font size
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="small">Small</option>
                  <option
                    value="medium"
                    selected
                  >
                    Medium
                  </option>
                  <option value="large">Large</option>
                  <option value="extra-large">Extra Large</option>
                </select>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Screen reader announcements
                  </span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Keyboard navigation
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </EnhancedModal>

      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <EnhancedToast
            key={notification.id}
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </div>
  );
}
