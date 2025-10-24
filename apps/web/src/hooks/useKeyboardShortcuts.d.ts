interface ShortcutConfig {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
    callback: () => void;
    description?: string;
}
export declare const useKeyboardShortcuts: (shortcuts: ShortcutConfig[]) => void;
export declare const useModerationShortcuts: (actions: {
    approve?: () => void;
    reject?: () => void;
    next?: () => void;
    previous?: () => void;
    bulkSelect?: () => void;
    search?: () => void;
}) => void;
export {};
//# sourceMappingURL=useKeyboardShortcuts.d.ts.map