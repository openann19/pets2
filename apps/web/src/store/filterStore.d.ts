export type PetFilters = {
    species?: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
    minAge?: number;
    maxAge?: number;
    size?: 'small' | 'medium' | 'large' | 'extra-large';
    intent?: 'adoption' | 'mating' | 'playdate' | 'all';
    maxDistance?: number;
    personalityTags?: string[];
    excludeIds?: string[];
};
interface FilterStore {
    filters: PetFilters;
    setFilters: (filters: PetFilters) => void;
    resetFilters: () => void;
}
export declare const useFilterStore: import("zustand").UseBoundStore<import("zustand").StoreApi<FilterStore>>;
export {};
//# sourceMappingURL=filterStore.d.ts.map