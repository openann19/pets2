interface UseFocusTrapOptions {
    enabled?: boolean;
    initialFocus?: HTMLElement | null;
    returnFocus?: boolean;
    escapeDeactivates?: boolean;
}
export declare function useFocusTrap(options?: UseFocusTrapOptions): {
    containerRef: import("react").RefObject<HTMLElement>;
    activate: () => void;
    deactivate: () => void;
    focusFirstElement: () => void;
    focusLastElement: () => void;
    updateFocusableElements: () => void;
};
export declare function useFocusRestoration(enabled?: boolean): {
    saveFocus: () => void;
    restoreFocus: () => void;
};
export declare function useFocusManagement(containerRef: React.RefObject<HTMLElement>): {
    focusFirst: () => void;
    focusLast: () => void;
};
export {};
//# sourceMappingURL=useFocusTrap.d.ts.map