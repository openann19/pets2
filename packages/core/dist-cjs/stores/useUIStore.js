"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUIStore = void 0;
const zustand_1 = require("zustand");
const immer_1 = require("zustand/middleware/immer");
/**
 * Global UI store for managing UI state like modals, toasts, and theme
 */
exports.useUIStore = (0, zustand_1.create)()((0, immer_1.immer)((set) => ({
    toasts: [],
    modal: { type: null },
    darkMode: false,
    isPageLoading: false,
    loadingStates: {},
    // Add a new toast notification
    showToast: (toast) => {
        set((state) => {
            const id = Date.now().toString();
            state.toasts.push({ ...toast, id });
        });
    },
    // Remove a toast by id
    removeToast: (id) => {
        set((state) => {
            state.toasts = state.toasts.filter(toast => toast.id !== id);
        });
    },
    // Clear all toasts
    clearToasts: () => {
        set((state) => {
            state.toasts = [];
        });
    },
    // Open a modal with optional props
    openModal: (type, props) => {
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
    setDarkMode: (enabled) => {
        set((state) => {
            state.darkMode = enabled;
        });
    },
    // Set global page loading state
    setIsPageLoading: (isLoading) => {
        set((state) => {
            state.isPageLoading = isLoading;
        });
    },
    // Set named loading state for specific operations
    setLoadingState: (key, isLoading) => {
        set((state) => {
            state.loadingStates[key] = isLoading;
        });
    },
})));
