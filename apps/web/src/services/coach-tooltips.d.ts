/**
 * In-App Coach Tooltips Service
 * Uses Shepherd.js for guided tours and tooltips
 */
import 'shepherd.js/dist/css/shepherd.css';
export interface TourStep {
    id: string;
    title: string;
    text: string;
    attachTo: {
        element: string;
        on: 'top' | 'bottom' | 'left' | 'right' | 'auto';
    };
    buttons?: Array<{
        text: string;
        action: () => void;
        classes?: string;
    }>;
    beforeShowPromise?: () => Promise<void>;
    showOn?: () => boolean;
    canClickTarget?: boolean;
    modalOverlayOpeningPadding?: number;
    modalOverlayOpeningRadius?: number;
}
export interface TourConfig {
    id: string;
    name: string;
    description: string;
    steps: TourStep[];
    defaultStepOptions?: {
        classes?: string;
        scrollTo?: boolean;
        cancelIcon?: {
            enabled?: boolean;
        };
    };
}
declare class CoachTooltipsService {
    private tours;
    private currentTour;
    private isInitialized;
    /**
     * Initialize the service
     */
    initialize(): void;
    /**
     * Create a new tour
     */
    createTour(config: TourConfig): Shepherd.Tour;
    /**
     * Start a tour
     */
    startTour(tourId: string): boolean;
    /**
     * Stop current tour
     */
    stopTour(): void;
    /**
     * Show a single tooltip
     */
    showTooltip(config: {
        id: string;
        title: string;
        text: string;
        element: string;
        position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
        duration?: number;
    }): void;
    /**
     * Get predefined tours
     */
    getPredefinedTours(): Record<string, TourConfig>;
    /**
     * Check if user has completed a tour
     */
    hasCompletedTour(tourId: string): boolean;
    /**
     * Mark tour as completed
     */
    markTourCompleted(tourId: string): void;
    /**
     * Reset tour completion status
     */
    resetTourCompletion(tourId: string): void;
    /**
     * Get default buttons for tour steps
     */
    private getDefaultButtons;
    /**
     * Handle tour completion
     */
    private onTourComplete;
    /**
     * Handle tour cancellation
     */
    private onTourCancel;
}
export declare const coachTooltipsService: CoachTooltipsService;
export declare function useCoachTooltips(): {
    currentTour: any;
    isTourActive: any;
    startTour: (tourId: string) => boolean;
    stopTour: () => void;
    showTooltip: (config: Parameters<typeof coachTooltipsService.showTooltip>[0]) => void;
    hasCompletedTour: (tourId: string) => boolean;
    markTourCompleted: (tourId: string) => void;
    resetTourCompletion: (tourId: string) => void;
    getPredefinedTours: () => Record<string, TourConfig>;
};
export default coachTooltipsService;
//# sourceMappingURL=coach-tooltips.d.ts.map