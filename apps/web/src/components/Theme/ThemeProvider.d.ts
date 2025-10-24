export declare function ThemeProvider({ children, defaultTheme, storageKey, disableTransitionOnChange, }: {
    children: any;
    defaultTheme?: string | undefined;
    storageKey?: string | undefined;
    disableTransitionOnChange?: boolean | undefined;
}): JSX.Element | null;
/**
 * Hook to access theme context
 */
export declare function useTheme(): never;
export declare function ThemeToggle({ className, showLabel }: {
    className?: string | undefined;
    showLabel?: boolean | undefined;
}): JSX.Element;
export declare function ThemeToggleIcon({ className }: {
    className?: string | undefined;
}): JSX.Element;
/**
 * Script to prevent flash of unstyled content (FOUC)
 * Place this in the <head> of your document
 */
export declare const ThemeScript: () => JSX.Element;
//# sourceMappingURL=ThemeProvider.d.ts.map