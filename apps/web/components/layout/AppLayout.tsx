/**
 * App Layout Component
 * Production-hardened layout with error boundaries, theme management, and responsive design
 */

import React, { useEffect } from 'react';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { useUIStore } from '../../stores/uiStore';
import { logger } from '@pawfectmatch/core';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showSidebar?: boolean;
  showHeader?: boolean;
}

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, systemTheme, updateSystemTheme } = useUIStore();

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      updateSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    updateSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [updateSystemTheme]);

  // Apply theme to document
  useEffect(() => {
    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
    document.documentElement.setAttribute('data-theme', effectiveTheme);

    logger.debug('Theme applied', { theme, systemTheme, effectiveTheme });
  }, [theme, systemTheme]);

  return <>{children}</>;
};

const Header: React.FC = () => {
  const { theme, setTheme } = useUIStore();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              PawfectMatch
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => { setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'light' : 'light'); }}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {/* User Menu Placeholder */}
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

const Sidebar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => { setSidebarOpen(false); }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
          <button
            onClick={() => { setSidebarOpen(false); }}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <a
            href="/dashboard"
            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Dashboard
          </a>
          <a
            href="/matches"
            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Matches
          </a>
          <a
            href="/profile"
            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Profile
          </a>
          <a
            href="/settings"
            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Settings
          </a>
        </nav>
      </aside>
    </>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useUIStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm p-4 rounded-lg shadow-lg border transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : notification.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : notification.type === 'warning'
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold">{notification.title}</h4>
              {notification.message !== undefined && notification.message !== '' && (
                <p className="text-sm mt-1">{notification.message}</p>
              )}
              {notification.action !== undefined && (
                <button
                  onClick={notification.action.onClick}
                  className="text-sm font-medium underline mt-2 hover:no-underline"
                >
                  {notification.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => { removeNotification(notification.id); }}
              className="ml-4 text-gray-400 hover:text-gray-600"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const LoadingOverlay: React.FC = () => {
  const { loadingStates } = useUIStore();

  if (loadingStates.length === 0) return null;

  const globalLoading = loadingStates.find(l => l.id === 'global');

  if (globalLoading === undefined) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div>
            <p className="text-gray-900 dark:text-white font-medium">
              {globalLoading.message !== undefined && globalLoading.message !== '' ? globalLoading.message : 'Loading...'}
            </p>
            {globalLoading.progress !== undefined && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${String(globalLoading.progress)}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  title,
  description,
  showSidebar = false,
  showHeader = true,
}) => {
  const { setSidebarOpen } = useUIStore();

  // Update document title and meta description
  useEffect(() => {
    if (title !== undefined && title !== '') {
      document.title = title;
    }
    if (description !== undefined && description !== '') {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription !== null) {
        metaDescription.setAttribute('content', description);
      }
    }
  }, [title, description]);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {showHeader && <Header />}

          <div className="flex">
            {showSidebar && <Sidebar />}

            <main className="flex-1 lg:ml-0">
              {/* Mobile menu button */}
              {showSidebar && (
                <button
                  onClick={() => { setSidebarOpen(true); }}
                  className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                  aria-label="Open menu"
                >
                  ☰
                </button>
              )}

              <div className="p-4 lg:p-8">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </div>
            </main>
          </div>

          {/* Global overlays */}
          <NotificationContainer />
          <LoadingOverlay />
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
};
