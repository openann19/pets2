/**
 * In-App Coach Tooltips Service
 * Uses Shepherd.js for guided tours and tooltips
 */
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import { logger } from './logger';
class CoachTooltipsService {
    tours = new Map();
    currentTour = null;
    isInitialized = false;
    /**
     * Initialize the service
     */
    initialize() {
        if (this.isInitialized)
            return;
        // Configure default Shepherd options
        Shepherd.defaults = {
            ...Shepherd.defaults,
            classes: 'shepherd-theme-pawfectmatch',
            useModalOverlay: true,
            scrollTo: true,
            cancelIcon: {
                enabled: true
            }
        };
        this.isInitialized = true;
        logger.info('Coach tooltips service initialized');
    }
    /**
     * Create a new tour
     */
    createTour(config) {
        this.initialize();
        const tour = new Shepherd.Tour({
            id: config.id,
            useModalOverlay: true,
            defaultStepOptions: {
                classes: 'shepherd-theme-pawfectmatch',
                scrollTo: true,
                cancelIcon: {
                    enabled: true
                },
                ...config.default
            }
        });
        // Add steps to tour
        config.steps.forEach(stepConfig => {
            tour.addStep({
                id: stepConfig.id,
                title: stepConfig.title,
                text: stepConfig.text,
                attachTo: stepConfig.attachTo,
                buttons: stepConfig.buttons || this.getDefaultButtons(tour),
                beforeShowPromise: stepConfig.beforeShowPromise,
                showOn: stepConfig.showOn,
                canClickTarget: stepConfig.canClickTarget,
                modalOverlayOpeningPadding: stepConfig.modalOverlayOpeningPadding,
                modalOverlayOpeningRadius: stepConfig.modalOverlayOpeningRadius
            });
        });
        // Store tour
        this.tours.set(config.id, tour);
        // Add event listeners
        tour.on('complete', () => {
            this.onTourComplete(config.id);
        });
        tour.on('cancel', () => {
            this.onTourCancel(config.id);
        });
        return tour;
    }
    /**
     * Start a tour
     */
    startTour(tourId) {
        const tour = this.tours.get(tourId);
        if (!tour) {
            logger.warn('Tour not found', { tourId });
            return false;
        }
        this.currentTour = tour;
        tour.start();
        logger.info('Tour started', { tourId });
        return true;
    }
    /**
     * Stop current tour
     */
    stopTour() {
        if (this.currentTour) {
            this.currentTour.cancel();
            this.currentTour = null;
        }
    }
    /**
     * Show a single tooltip
     */
    showTooltip(config) {
        this.initialize();
        const tour = new Shepherd.Tour({
            useModalOverlay: false,
            defaultStepOptions: {
                classes: 'shepherd-theme-pawfectmatch-tooltip'
            }
        });
        tour.addStep({
            id: config.id,
            title: config.title,
            text: config.text,
            attachTo: {
                element: config.element,
                on: config.position || 'auto'
            },
            buttons: [
                {
                    text: 'Got it!',
                    action: () => tour.complete()
                }
            ]
        });
        tour.start();
        // Auto-hide after duration
        if (config.duration) {
            setTimeout(() => {
                tour.complete();
            }, config.duration);
        }
    }
    /**
     * Get predefined tours
     */
    getPredefinedTours() {
        return {
            onboarding: {
                id: 'onboarding',
                name: 'Welcome to PawfectMatch',
                description: 'Get started with your pet matching journey',
                steps: [
                    {
                        id: 'welcome',
                        title: 'Welcome to PawfectMatch! 🐾',
                        text: 'Let\'s take a quick tour to help you get started with finding the perfect match for your furry friend.',
                        attachTo: {
                            element: 'body',
                            on: 'auto'
                        }
                    },
                    {
                        id: 'profile-setup',
                        title: 'Set Up Your Pet Profile',
                        text: 'First, let\'s create a profile for your pet. Click here to add photos, personality traits, and preferences.',
                        attachTo: {
                            element: '[data-tour="profile-setup"]',
                            on: 'bottom'
                        }
                    },
                    {
                        id: 'swipe-interface',
                        title: 'Discover New Matches',
                        text: 'Swipe through potential matches for your pet. Swipe right to like, left to pass, and up for super like!',
                        attachTo: {
                            element: '[data-tour="swipe-interface"]',
                            on: 'top'
                        }
                    },
                    {
                        id: 'chat-feature',
                        title: 'Start Conversations',
                        text: 'Once you match, you can chat with other pet owners to plan playdates or meetings.',
                        attachTo: {
                            element: '[data-tour="chat-feature"]',
                            on: 'left'
                        }
                    },
                    {
                        id: 'premium-features',
                        title: 'Unlock Premium Features',
                        text: 'Upgrade to Premium for unlimited swipes, advanced filters, and priority matching.',
                        attachTo: {
                            element: '[data-tour="premium-features"]',
                            on: 'right'
                        }
                    }
                ]
            },
            swipeTutorial: {
                id: 'swipe-tutorial',
                name: 'Swipe Tutorial',
                description: 'Learn how to use the swipe interface',
                steps: [
                    {
                        id: 'swipe-basics',
                        title: 'Swipe Basics',
                        text: 'Swipe right to like a pet, left to pass, and up for super like. You can also tap to see more details.',
                        attachTo: {
                            element: '[data-tour="swipe-card"]',
                            on: 'top'
                        }
                    },
                    {
                        id: 'swipe-actions',
                        title: 'Swipe Actions',
                        text: 'Use the action buttons below the card for quick interactions without swiping.',
                        attachTo: {
                            element: '[data-tour="swipe-actions"]',
                            on: 'top'
                        }
                    },
                    {
                        id: 'filters',
                        title: 'Use Filters',
                        text: 'Adjust your preferences to see more relevant matches. Filter by distance, age, size, and more.',
                        attachTo: {
                            element: '[data-tour="filters"]',
                            on: 'bottom'
                        }
                    }
                ]
            },
            chatTutorial: {
                id: 'chat-tutorial',
                name: 'Chat Tutorial',
                description: 'Learn how to use the chat features',
                steps: [
                    {
                        id: 'chat-interface',
                        title: 'Chat Interface',
                        text: 'Send messages, share photos, and plan meetups with other pet owners.',
                        attachTo: {
                            element: '[data-tour="chat-interface"]',
                            on: 'right'
                        }
                    },
                    {
                        id: 'typing-indicator',
                        title: 'Typing Indicators',
                        text: 'See when someone is typing a message to you in real-time.',
                        attachTo: {
                            element: '[data-tour="typing-indicator"]',
                            on: 'top'
                        }
                    },
                    {
                        id: 'message-actions',
                        title: 'Message Actions',
                        text: 'React to messages, share your location, or send photos to enhance your conversations.',
                        attachTo: {
                            element: '[data-tour="message-actions"]',
                            on: 'left'
                        }
                    }
                ]
            }
        };
    }
    /**
     * Check if user has completed a tour
     */
    hasCompletedTour(tourId) {
        if (typeof window === 'undefined')
            return false;
        return localStorage.getItem(`tour_completed_${tourId}`) === 'true';
    }
    /**
     * Mark tour as completed
     */
    markTourCompleted(tourId) {
        if (typeof window === 'undefined')
            return;
        localStorage.setItem(`tour_completed_${tourId}`, 'true');
    }
    /**
     * Reset tour completion status
     */
    resetTourCompletion(tourId) {
        if (typeof window === 'undefined')
            return;
        localStorage.removeItem(`tour_completed_${tourId}`);
    }
    /**
     * Get default buttons for tour steps
     */
    getDefaultButtons(tour) {
        return [
            {
                text: 'Skip',
                action: () => tour.cancel(),
                classes: 'shepherd-button-secondary'
            },
            {
                text: 'Next',
                action: () => tour.next(),
                classes: 'shepherd-button-primary'
            }
        ];
    }
    /**
     * Handle tour completion
     */
    onTourComplete(tourId) {
        this.markTourCompleted(tourId);
        this.currentTour = null;
        logger.info('Tour completed', { tourId });
        // Track analytics
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'tour_completed', {
                tour_id: tourId
            });
        }
    }
    /**
     * Handle tour cancellation
     */
    onTourCancel(tourId) {
        this.currentTour = null;
        logger.info('Tour cancelled', { tourId });
        // Track analytics
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'tour_cancelled', {
                tour_id: tourId
            });
        }
    }
}
// Create singleton instance
export const coachTooltipsService = new CoachTooltipsService();
// React hook for coach tooltips
export function useCoachTooltips() {
    const [currentTour, setCurrentTour] = useState(null);
    const [isTourActive, setIsTourActive] = useState(false);
    const startTour = (tourId) => {
        const success = coachTooltipsService.startTour(tourId);
        if (success) {
            setCurrentTour(tourId);
            setIsTourActive(true);
        }
        return success;
    };
    const stopTour = () => {
        coachTooltipsService.stopTour();
        setCurrentTour(null);
        setIsTourActive(false);
    };
    const showTooltip = (config) => {
        coachTooltipsService.showTooltip(config);
    };
    const hasCompletedTour = (tourId) => {
        return coachTooltipsService.hasCompletedTour(tourId);
    };
    const markTourCompleted = (tourId) => {
        coachTooltipsService.markTourCompleted(tourId);
    };
    const resetTourCompletion = (tourId) => {
        coachTooltipsService.resetTourCompletion(tourId);
    };
    const getPredefinedTours = () => {
        return coachTooltipsService.getPredefinedTours();
    };
    return {
        currentTour,
        isTourActive,
        startTour,
        stopTour,
        showTooltip,
        hasCompletedTour,
        markTourCompleted,
        resetTourCompletion,
        getPredefinedTours
    };
}
export default coachTooltipsService;
//# sourceMappingURL=coach-tooltips.js.map