import { create } from 'zustand';
/**
 * A tiny zustand store that keeps the currently-selected visual theme
 * (`'glass' | 'vibrant'`).
 *
 * – Persists the choice in `localStorage` so the preference survives refreshes.
 * – Mutates `document.body.classList` so global styles are applied instantly.
 */
export const useThemeStore = create((set) => {
    let initialTheme = 'glass';
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        if (saved === 'vibrant' || saved === 'glass') {
            initialTheme = saved;
        }
        // Ensure the body has the correct class once on load
        document.body.classList.add(initialTheme);
    }
    return {
        theme: initialTheme,
        toggle: () => set((state) => {
            const next = state.theme === 'glass' ? 'vibrant' : 'glass';
            // Persist + mutate the DOM
            if (typeof window !== 'undefined') {
                localStorage.setItem('theme', next);
                document.body.classList.remove(state.theme);
                document.body.classList.add(next);
            }
            return { theme: next };
        }),
    };
});
//# sourceMappingURL=theme.js.map