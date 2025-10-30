import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { EventData } from '../types/advanced';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ModalType = 'match' | 'petProfile' | 'settings' | 'premium' | 'petForm' | 'filter';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface ModalState {
  type: ModalType | null;
  props?: EventData;
}

export interface UIState {
  // Toast notifications
  toasts: Toast[];

  // Modal state
  modal: ModalState;

  // Theme settings
  darkMode: boolean;

  // Loading indicators
  isPageLoading: boolean;
  loadingStates: Record<string, boolean>;

  // Actions
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  openModal: (type: ModalType, props?: EventData) => void;
  closeModal: () => void;
  setDarkMode: (enabled: boolean) => void;
  setIsPageLoading: (isLoading: boolean) => void;
  setLoadingState: (key: string, isLoading: boolean) => void;
}

/**
 * Global UI store for managing UI state like modals, toasts, and theme
 */
export const useUIStore = create<UIState>()(
  immer((set) => ({
    toasts: [] as Toast[],
    modal: { type: null as ModalType | null },
    darkMode: false as boolean,
    isPageLoading: false as boolean,
    loadingStates: {} as Record<string, boolean>,

    // Add a new toast notification
    showToast: (toast: Omit<Toast, 'id'>) => {
      set((state) => {
        const id = Date.now().toString();
        state.toasts.push({ ...toast, id });
      });
    },

    // Remove a toast by id
    removeToast: (id: string) => {
      set((state) => {
        state.toasts = state.toasts.filter((toast) => toast.id !== id);
      });
    },

    // Clear all toasts
    clearToasts: () => {
      set((state) => {
        state.toasts = [];
      });
    },

    // Open a modal with optional props
    openModal: (type: ModalType, props?: EventData) => {
      set((state) => {
        state.modal = { type, ...(props !== undefined ? { props } : {}) };
      });
    },

    // Close the current modal
    closeModal: () => {
      set((state) => {
        state.modal = { type: null };
      });
    },

    // Toggle dark mode
    setDarkMode: (enabled: boolean) => {
      set((state) => {
        state.darkMode = enabled;
      });
    },

    // Set global page loading state
    setIsPageLoading: (isLoading: boolean) => {
      set((state) => {
        state.isPageLoading = isLoading;
      });
    },

    // Set named loading state for specific operations
    setLoadingState: (key: string, isLoading: boolean) => {
      set((state) => {
        state.loadingStates[key] = isLoading;
      });
    },
  })),
);
