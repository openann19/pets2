import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Pet, Match, User } from '../types';
/**
 * Global match store for managing swipe state, matches, and related operations
 */
export const useMatchStore = create()(immer((set) => ({
    currentPet: null,
    swipePets: [],
    matches: [],
    activeMatchId: null,
    paginationInfo: {
        page: 1,
        hasMore: true,
        isLoading: false,
    },
    swipeHistory: {
        likes: [],
        passes: [],
        superlikes: [],
    },
    // Set the current pet being viewed
    setCurrentPet: (petId) => set((state) => {
        state.currentPet = petId;
        return state;
    }),
    // Replace all swipe pets
    setSwipePets: (pets) => set((state) => {
        state.swipePets = pets;
        return state;
    }),
    // Add more pets to swipe deck
    addSwipePets: (pets) => set((state) => {
        state.swipePets = [...state.swipePets, ...pets];
        return state;
    }),
    // Set all matches
    setMatches: (matches) => set((state) => {
        state.matches = matches;
        return state;
    }),
    // Add a new match
    addMatch: (match) => set((state) => {
        state.matches.unshift(match);
        return state;
    }),
    // Update an existing match
    updateMatch: (matchId, data) => set((state) => {
        const index = state.matches.findIndex(match => match._id === matchId);
        if (index !== -1) {
            state.matches[index] = { ...state.matches[index], ...data };
        }
        return state;
    }),
    // Remove a match
    removeMatch: (matchId) => set((state) => {
        state.matches = state.matches.filter(match => match._id !== matchId);
        return state;
    }),
    // Set active match for chat
    setActiveMatchId: (matchId) => set((state) => {
        state.activeMatchId = matchId;
        return state;
    }),
    // Update pagination info
    setPaginationInfo: (info) => set((state) => {
        state.paginationInfo = { ...state.paginationInfo, ...info };
        return state;
    }),
    // Add to swipe history
    addToSwipeHistory: (petId, action) => set((state) => {
        if (action === 'like') {
            state.swipeHistory.likes.push(petId);
        }
        else if (action === 'pass') {
            state.swipeHistory.passes.push(petId);
        }
        else if (action === 'superlike') {
            state.swipeHistory.superlikes.push(petId);
        }
        return state;
    }),
    // Clear swipe history
    clearSwipeHistory: () => set((state) => {
        state.swipeHistory = {
            likes: [],
            passes: [],
            superlikes: [],
        };
        return state;
    }),
})));
//# sourceMappingURL=useMatchStore.js.map