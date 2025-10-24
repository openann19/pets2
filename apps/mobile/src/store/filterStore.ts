import type { PetFilters } from '@pawfectmatch/core';
import { create } from 'zustand';

const DEFAULT_FILTERS: PetFilters = {};

interface FilterStore {
    filters: PetFilters;
    setFilters: (filters: PetFilters) => void;
    resetFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
    filters: DEFAULT_FILTERS,
    setFilters: (filters) => {
        set({ filters });
    },
    resetFilters: () => {
        set({ filters: DEFAULT_FILTERS });
    },
}));
