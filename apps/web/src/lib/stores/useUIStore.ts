import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
/**
 * Global UI store for managing UI state like modals, toasts, and theme
 */
export const useUIStore = create()(immer((set) => ({
    toasts: [],
    modal: { type: null },
    darkMode: false,
    isPageLoading: false,
    loadingStates: {},
    // Add a new toast notification
    showToast: (toast) => { set((state) => {
        const id = Date.now().toString();
        state.toasts.push({ ...toast, id });
        return state;
    }); },
    // Remove a toast by id
    removeToast: (id) => { set((state) => {
        state.toasts = state.toasts.filter(toast => toast.id !== id);
        return state;
    }); },
    // Clear all toasts
    clearToasts: () => { set((state) => {
        state.toasts = [];
        return state;
    }); },
    // Open a modal with optional props
    openModal: (type, props = {}) => { set((state) => {
        state.modal = { type, props };
        return state;
    }); },
    // Close the current modal
    closeModal: () => { set((state) => {
        state.modal = { type: null };
        return state;
    }); },
    // Toggle dark mode
    setDarkMode: (enabled) => { set((state) => {
        state.darkMode = enabled;
        return state;
    }); },
    // Set global page loading state
    setIsPageLoading: (isLoading) => { set((state) => {
        state.isPageLoading = isLoading;
        return state;
    }); },
    // Set named loading state for specific operations
    setLoadingState: (key, isLoading) => { set((state) => {
        state.loadingStates[key] = isLoading;
        return state;
    }); },
})));
//# sourceMappingURL=useUIStore.js.map