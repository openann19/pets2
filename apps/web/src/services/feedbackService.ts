/**
 * Feedback Service for user interactions
 * Handles haptic feedback, sound effects, and visual feedback
 */
import { logger } from './logger';
class FeedbackService {
    isInitialized = false;
    audioContext = null;
    soundEnabled = true;
    hapticEnabled = true;
    async initialize() {
        if (this.isInitialized)
            return;
        try {
            // Initialize audio context for sound feedback
            if (typeof window !== 'undefined' && 'AudioContext' in window) {
                this.audioContext = new AudioContext();
            }
            // Check for haptic feedback support
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                this.hapticEnabled = true;
            }
            this.isInitialized = true;
            logger.info('Feedback service initialized');
        }
        catch (error) {
            logger.error('Failed to initialize feedback service', error);
        }
    }
    playSound(type = 'info') {
        if (!this.soundEnabled || !this.audioContext)
            return;
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            // Configure sound based on type
            const frequencies = {
                success: [523.25, 659.25, 783.99], // C5, E5, G5
                error: [220, 196], // A3, G3
                warning: [440, 330], // A4, E4
                info: [440] // A4
            };
            const frequency = frequencies[type][0];
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = 'sine';
            // Configure volume
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            // Connect and play
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.2);
        }
        catch (error) {
            logger.error('Failed to play sound', error);
        }
    }
    vibrate(pattern = 100) {
        if (!this.hapticEnabled || typeof navigator === 'undefined')
            return;
        try {
            navigator.vibrate(pattern);
        }
        catch (error) {
            logger.error('Failed to vibrate', error);
        }
    }
    provideFeedback(options) {
        const { type, intensity = 'medium', duration = 200 } = options;
        // Play sound
        this.playSound(type);
        // Provide haptic feedback
        const patterns = {
            light: 50,
            medium: 100,
            strong: [100, 50, 100]
        };
        this.vibrate(patterns[intensity]);
        // Log feedback event
        logger.info('Feedback provided', { type, intensity, duration });
    }
    // Success feedback
    success(intensity = 'medium') {
        this.provideFeedback({ type: 'success', intensity });
    }
    // Error feedback
    error(intensity = 'strong') {
        this.provideFeedback({ type: 'error', intensity });
    }
    // Warning feedback
    warning(intensity = 'medium') {
        this.provideFeedback({ type: 'warning', intensity });
    }
    // Info feedback
    info(intensity = 'light') {
        this.provideFeedback({ type: 'info', intensity });
    }
    // Settings
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }
    setHapticEnabled(enabled) {
        this.hapticEnabled = enabled;
    }
    isSoundEnabled() {
        return this.soundEnabled;
    }
    isHapticEnabled() {
        return this.hapticEnabled;
    }
}
export const feedbackService = new FeedbackService();
//# sourceMappingURL=feedbackService.js.map