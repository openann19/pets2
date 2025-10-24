/**
 * Shared swipe logic hook for both web and mobile platforms
 * Handles swipe actions, analytics, and state management
 */
import { Pet, SwipeAction, SwipeResult } from '../types/swipe';
export interface UseSwipeLogicProps {
    onMatch?: (result: SwipeResult) => void;
    onSwipeComplete?: (action: SwipeAction) => void;
    analyticsEnabled?: boolean;
}
export declare const useSwipeLogic: ({ onMatch, onSwipeComplete, analyticsEnabled, }?: UseSwipeLogicProps) => {
    handleLike: (pet: Pet) => Promise<SwipeResult>;
    handlePass: (pet: Pet) => Promise<SwipeResult>;
    handleSuperLike: (pet: Pet) => Promise<SwipeResult>;
    isProcessing: boolean;
    swipeHistory: SwipeAction[];
    getSwipeStats: () => {
        total: number;
        likes: number;
        passes: number;
        superLikes: number;
        likeRate: number;
    };
};
//# sourceMappingURL=useSwipeLogic.d.ts.map