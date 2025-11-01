interface KeyCombo {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
}
export declare function useKeyboardShortcut(keyCombo: KeyCombo, handler: () => void): string;
export {};
