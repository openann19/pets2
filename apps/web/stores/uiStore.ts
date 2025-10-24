/**
 * UI State Store
 * Production-hardened Zustand store for global UI state management
 * Features: Theme management, modal states, notifications, loading states
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import React from 'react';
import { logger } from '@pawfectmatch/core';

export type Theme = 'light' | 'dark' | 'system';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ModalState {
  id: string;
  isOpen: boolean;
  component: React.ComponentType<unknown> | null;
  props?: Record<string, unknown>;
  options?: {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closable?: boolean;
    backdrop?: 'blur' | 'dark' | 'none';
  };
}

export interface LoadingState {
  id: string;
  message?: string;
  progress?: number; // 0-100
}

interface UIState {
  // Theme management
  theme: Theme;
  systemTheme: 'light' | 'dark';

  // Modal management
  modals: ModalState[];

  // Notification management
  notifications: Notification[];

  // Loading states
  loadingStates: LoadingState[];

  // Global UI states
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;

  // Actions
  setTheme: (theme: Theme) => void;
  updateSystemTheme: (theme: 'light' | 'dark') => void;

  // Modal actions
  openModal: (modal: Omit<ModalState, 'isOpen'>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Loading actions
  setLoading: (loading: LoadingState) => void;
  removeLoading: (id: string) => void;
  updateLoadingProgress: (id: string, progress: number) => void;

  // UI state actions
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

// Custom storage for sensitive UI preferences
const uiStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      const value = localStorage.getItem(name);
      return value ?? null;
    } catch (error) {
      logger.error('Failed to get UI storage item', { name, error });
      return null;
    }
  },
  setItem: (name: string, value: unknown) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch (error) {
      logger.error('Failed to set UI storage item', { name, error });
    }
  },
  removeItem: (name: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(name);
    } catch (error) {
      logger.error('Failed to remove UI storage item', { name, error });
    }
  },
};

export const useUIStore = create<UIState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      theme: 'system',
      systemTheme: 'light',
      modals: [],
      notifications: [],
      loadingStates: [],
      sidebarOpen: false,
      mobileMenuOpen: false,

      // Theme actions
      setTheme: (theme) => {
        set((state) => {
          state.theme = theme;
        });
        logger.debug('Theme changed', { theme });
      },

      updateSystemTheme: (systemTheme) => {
        set((state) => {
          state.systemTheme = systemTheme;
        });
      },

      // Modal actions
      openModal: (modal) => {
        set((state) => {
          // Close any existing modal with same id
          state.modals = state.modals.filter(m => m.id !== modal.id);
          // Add new modal
          state.modals.push({ ...modal, isOpen: true });
        });
        logger.debug('Modal opened', { modalId: modal.id });
      },

      closeModal: (id) => {
        set((state) => {
          const modal = state.modals.find(m => m.id === id);
          if (modal !== undefined) {
            modal.isOpen = false;
            // Remove after animation delay
            setTimeout(() => {
              set((state) => {
                state.modals = state.modals.filter(m => m.id !== id);
              });
            }, 300);
          }
        });
        logger.debug('Modal closed', { modalId: id });
      },

      closeAllModals: () => {
        set((state) => {
          state.modals.forEach(modal => {
            modal.isOpen = false;
          });
          // Clear all after animation
          setTimeout(() => {
            set((state) => {
              state.modals = [];
            });
          }, 300);
        });
        logger.debug('All modals closed');
      },

      // Notification actions
      addNotification: (notification) => {
        const id = `notification_${String(Date.now())}_${Math.random().toString(36).slice(2, 11)}`;
        const fullNotification: Notification = {
          ...notification,
          id,
          duration: notification.duration ?? 5000, // Default 5 seconds
        };

        set((state) => {
          state.notifications.push(fullNotification);
        });

        // Auto-remove after duration
        if (fullNotification.duration !== undefined && fullNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, fullNotification.duration);
        }

        logger.debug('Notification added', { id, type: notification.type, title: notification.title });
      },

      removeNotification: (id) => {
        set((state) => {
          state.notifications = state.notifications.filter(n => n.id !== id);
        });
        logger.debug('Notification removed', { id });
      },

      clearNotifications: () => {
        set((state) => {
          state.notifications = [];
        });
        logger.debug('All notifications cleared');
      },

      // Loading actions
      setLoading: (loading) => {
        set((state) => {
          // Remove any existing loading with same id
          state.loadingStates = state.loadingStates.filter(l => l.id !== loading.id);
          // Add new loading state
          state.loadingStates.push(loading);
        });
        logger.debug('Loading state set', { id: loading.id, message: loading.message });
      },

      removeLoading: (id) => {
        set((state) => {
          state.loadingStates = state.loadingStates.filter(l => l.id !== id);
        });
        logger.debug('Loading state removed', { id });
      },

      updateLoadingProgress: (id, progress) => {
        set((state) => {
          const loading = state.loadingStates.find(l => l.id === id);
          if (loading !== undefined) {
            loading.progress = Math.max(0, Math.min(100, progress));
          }
        });
        logger.debug('Loading progress updated', { id, progress });
      },

      // UI state actions
      setSidebarOpen: (open) => {
        set((state) => {
          state.sidebarOpen = open;
        });
      },

      setMobileMenuOpen: (open) => {
        set((state) => {
          state.mobileMenuOpen = open;
        });
      },
    })),
    {
      name: 'ui-store',
      storage: createJSONStorage(() => uiStorage),
      // Only persist theme preference
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
);

// Selector hooks for better performance
export const useTheme = () => useUIStore((state) => state.theme);
export const useSystemTheme = () => useUIStore((state) => state.systemTheme);
export const useNotifications = () => useUIStore((state) => state.notifications);
export const useModals = () => useUIStore((state) => state.modals);
export const useLoadingStates = () => useUIStore((state) => state.loadingStates);
export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen);
export const useMobileMenuOpen = () => useUIStore((state) => state.mobileMenuOpen);

// Action hooks
export const useThemeActions = () => useUIStore((state) => ({
  setTheme: state.setTheme,
  updateSystemTheme: state.updateSystemTheme,
}));

export const useModalActions = () => useUIStore((state) => ({
  openModal: state.openModal,
  closeModal: state.closeModal,
  closeAllModals: state.closeAllModals,
}));

export const useNotificationActions = () => useUIStore((state) => ({
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
}));

export const useLoadingActions = () => useUIStore((state) => ({
  setLoading: state.setLoading,
  removeLoading: state.removeLoading,
  updateLoadingProgress: state.updateLoadingProgress,
}));

export const useUIActions = () => useUIStore((state) => ({
  setSidebarOpen: state.setSidebarOpen,
  setMobileMenuOpen: state.setMobileMenuOpen,
}));
