/**
 * Feedback Service for user interactions
 * Handles haptic feedback, sound effects, and visual feedback
 */
interface FeedbackOptions {
    type: 'success' | 'error' | 'warning' | 'info';
    intensity?: 'light' | 'medium' | 'strong';
    duration?: number;
}
declare class FeedbackService {
    private isInitialized;
    private audioContext;
    private soundEnabled;
    private hapticEnabled;
    initialize(): Promise<void>;
    playSound(type?: 'success' | 'error' | 'warning' | 'info'): void;
    vibrate(pattern?: number | number[]): void;
    provideFeedback(options: FeedbackOptions): void;
    success(intensity?: 'light' | 'medium' | 'strong'): void;
    error(intensity?: 'light' | 'medium' | 'strong'): void;
    warning(intensity?: 'light' | 'medium' | 'strong'): void;
    info(intensity?: 'light' | 'medium' | 'strong'): void;
    setSoundEnabled(enabled: boolean): void;
    setHapticEnabled(enabled: boolean): void;
    isSoundEnabled(): boolean;
    isHapticEnabled(): boolean;
}
export declare const feedbackService: FeedbackService;
export {};
//# sourceMappingURL=feedbackService.d.ts.map