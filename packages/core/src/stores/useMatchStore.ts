import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Pet, Match } from '../types/models';

export interface MatchState {
  // Current pet being viewed in swipe
  currentPet: string | null;

  // Pets to be swiped through
  swipePets: Pet[];

  // User's matches
  matches: Match[];

  // Current active match in chat
  activeMatchId: string | null;

  // Pagination info
  paginationInfo: {
    page: number;
    hasMore: boolean;
    isLoading: boolean;
  };

  // Swipe history
  swipeHistory: {
    likes: string[];
    passes: string[];
    superlikes: string[];
  };

  // Actions
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
export const useMatchStore = create<MatchState>()(
  immer((set) => ({
    currentPet: null as string | null,
    swipePets: [] as Pet[],
    matches: [] as Match[],
    activeMatchId: null as string | null,
    paginationInfo: {
      page: 1 as number,
      hasMore: true as boolean,
      isLoading: false as boolean,
    },
    swipeHistory: {
      likes: [] as string[],
      passes: [] as string[],
      superlikes: [] as string[],
    },

    // Set current pet being viewed
    setCurrentPet: (petId: string | null) => {
      set((state) => ({
        ...state,
        currentPet: petId,
      }));
    },

    // Set swipe pets
    setSwipePets: (pets: Pet[]) => {
      set((state) => {
        state.swipePets = pets;
      });
    },

    // Add pets to swipe queue
    addSwipePets: (pets: Pet[]) => {
      set((state) => {
        state.swipePets = [...state.swipePets, ...pets];
      });
    },

    // Set all matches
    setMatches: (matches: Match[]) => {
      set((state) => {
        state.matches = matches;
      });
    },

    // Add a new match
    addMatch: (match: Match) => {
      set((state) => {
        state.matches.unshift(match);
      });
    },

    // Update an existing match
    updateMatch: (matchId: string, data: Partial<Match>) => {
      set((state) => {
        const index = state.matches.findIndex((match) => match._id === matchId);
        if (index !== -1) {
          const existing = state.matches[index];
          if (existing !== undefined) {
            Object.assign(existing, data);
          }
        }
      });
    },

    // Remove a match
    removeMatch: (matchId: string) => {
      set((state) => {
        state.matches = state.matches.filter((match) => match._id !== matchId);
      });
    },

    // Set active match for chat
    setActiveMatchId: (matchId: string | null) => {
      set((state) => {
        state.activeMatchId = matchId;
      });
    },

    // Update pagination info
    setPaginationInfo: (info: Partial<MatchState['paginationInfo']>) => {
      set((state) => {
        state.paginationInfo = { ...state.paginationInfo, ...info };
      });
    },

    // Add to swipe history
    addToSwipeHistory: (petId: string, action: 'like' | 'pass' | 'superlike') => {
      set((state) => {
        if (action === 'like') {
          state.swipeHistory.likes.push(petId);
        } else if (action === 'pass') {
          state.swipeHistory.passes.push(petId);
        } else {
          state.swipeHistory.superlikes.push(petId);
        }
      });
    },

    // Clear swipe history
    clearSwipeHistory: () => {
      set((state) => {
        state.swipeHistory = {
          likes: [],
          passes: [],
          superlikes: [],
        };
      });
    },
  })),
);
