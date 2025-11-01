import type { Pet, Match } from '../types/models';
export interface MatchState {
    currentPet: string | null;
    swipePets: Pet[];
    matches: Match[];
    activeMatchId: string | null;
    paginationInfo: {
        page: number;
        hasMore: boolean;
        isLoading: boolean;
    };
    swipeHistory: {
        likes: string[];
        passes: string[];
        superlikes: string[];
    };
    setCurrentPet: (petId: string | null) => void;
    setSwipePets: (pets: Pet[]) => void;
    addSwipePets: (pets: Pet[]) => void;
    setMatches: (matches: Match[]) => void;
    addMatch: (match: Match) => void;
    updateMatch: (matchId: string, data: Partial<Match>) => void;
    removeMatch: (matchId: string) => void;
    setActiveMatchId: (matchId: string | null) => void;
    setPaginationInfo: (info: Partial<MatchState['paginationInfo']>) => void;
    addToSwipeHistory: (petId: string, action: 'like' | 'pass' | 'superlike') => void;
    clearSwipeHistory: () => void;
}
/**
 * Global match store for managing swipe state, matches, and related operations
 */
export declare const useMatchStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<MatchState>, "setState"> & {
    setState(nextStateOrUpdater: MatchState | Partial<MatchState> | ((state: import("immer").WritableDraft<MatchState>) => void), shouldReplace?: boolean | undefined): void;
}>;
