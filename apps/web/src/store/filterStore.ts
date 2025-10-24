import { create } from 'zustand';
const DEFAULT_FILTERS = {};
export const useFilterStore = create((set) => ({
    filters: DEFAULT_FILTERS,
    setFilters: (filters) => set({ filters }),
    resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}));
//# sourceMappingURL=filterStore.js.map