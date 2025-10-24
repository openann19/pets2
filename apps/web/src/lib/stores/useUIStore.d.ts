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
    props?: Record<string, any>;
}
export interface UIState {
    toasts: Toast[];
    modal: ModalState;
    darkMode: boolean;
    isPageLoading: boolean;
    loadingStates: Record<string, boolean>;
    showToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    clearToasts: () => void;
    openModal: (type: ModalType, props?: Record<string, any>) => void;
    closeModal: () => void;
    setDarkMode: (enabled: boolean) => void;
    setIsPageLoading: (isLoading: boolean) => void;
    setLoadingState: (key: string, isLoading: boolean) => void;
}
/**
 * Global UI store for managing UI state like modals, toasts, and theme
 */
export declare const useUIStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<UIState>, "setState"> & {
    setState(nextStateOrUpdater: UIState | Partial<UIState> | ((state: import("immer").WritableDraft<UIState>) => void), shouldReplace?: boolean | undefined): void;
}>;
//# sourceMappingURL=useUIStore.d.ts.map