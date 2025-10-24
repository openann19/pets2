export type UITheme = 'glass' | 'vibrant';
interface ThemeState {
    theme: UITheme;
    toggle: () => void;
}
/**
 * A tiny zustand store that keeps the currently-selected visual theme
 * (`'glass' | 'vibrant'`).
 *
 * – Persists the choice in `localStorage` so the preference survives refreshes.
 * – Mutates `document.body.classList` so global styles are applied instantly.
 */
export declare const useThemeStore: import("zustand").UseBoundStore<import("zustand").StoreApi<ThemeState>>;
export {};
//# sourceMappingURL=theme.d.ts.map