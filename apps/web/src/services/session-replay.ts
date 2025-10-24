/**
 * Session Re-Play (OpenReplay) Integration
 * UX recording system for debugging and analytics
 */
import { logger } from './logger';
import { OpenReplayConfig, CustomEvent, UserEvent } from '@/types/common';
class SessionReplayService {
    config;
    isInitialized = false;
    sessionId = null;
    constructor() {
        this.config = {
            projectKey: process.env.NEXT_PUBLIC_OPENREPLAY_PROJECT_KEY || '',
            enabled: process.env.NODE_ENV === 'production' && !!process.env.NEXT_PUBLIC_OPENREPLAY_PROJECT_KEY,
            sampleRate: 0.1, // 10% of sessions
            maskAllInputs: true,
            maskAllText: false,
            defaultInputMode: 0,
            obscureTextEmails: true,
            obscureInputEmails: true,
            maskTextSelector: '[data-mask-text]',
            maskAllTextSelector: '[data-mask-all-text]',
            blockClass: 'openreplay-block',
            blockSelector: '[data-block]',
            ignoreClass: 'openreplay-ignore',
            maskClass: 'openreplay-mask',
            collectFonts: true,
            collectIFrames: false,
            respectDoNotTrack: true,
            maskTextPatterns: [
                /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
                /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card
                /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
                /\b\d{10,}\b/g // Phone numbers
            ]
        };
    }
    /**
     * Initialize OpenReplay
     */
    async initialize() {
        if (!this.config.enabled || this.isInitialized) {
            return;
        }
        try {
            // Load OpenReplay script
            await this.loadOpenReplayScript();
            // Initialize OpenReplay
            if (typeof window !== 'undefined' && window.OpenReplay) {
                const OpenReplay = window.OpenReplay;
                this.sessionId = OpenReplay.start({
                    projectKey: this.config.projectKey,
                    sampleRate: this.config.sampleRate,
                    maskAllInputs: this.config.maskAllInputs,
                    maskAllText: this.config.maskAllText,
                    defaultInputMode: this.config.default,
                    obscureTextEmails: this.config.obscureTextEmails,
                    obscureInputEmails: this.config.obscureInputEmails,
                    maskTextSelector: this.config.maskTextSelector,
                    maskAllTextSelector: this.config.maskAllTextSelector,
                    blockClass: this.config.blockClass,
                    blockSelector: this.config.blockSelector,
                    ignoreClass: this.config.ignoreClass,
                    maskClass: this.config.maskClass,
                    collectFonts: this.config.collectFonts,
                    collectIFrames: this.config.collectIFrames,
                    respectDoNotTrack: this.config.respectDoNotTrack
                });
                // Set up event listeners
                this.setupEventListeners();
                this.isInitialized = true;
                logger.info('OpenReplay initialized successfully', { sessionId: this.sessionId });
            }
        }
        catch (error) {
            logger.error('Failed to initialize OpenReplay', error);
        }
    }
    /**
     * Load OpenReplay script
     */
    async loadOpenReplayScript() {
        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined') {
                resolve();
                return;
            }
            // Check if script is already loaded
            if (window.OpenReplay) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://static.openreplay.com/3.5.0/openreplay.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load OpenReplay script'));
            document.head.appendChild(script);
        });
    }
    /**
     * Setup event listeners for custom events
     */
    setupEventListeners() {
        if (typeof window === 'undefined' || !window.OpenReplay) {
            return;
        }
        const OpenReplay = window.OpenReplay;
        // Track user authentication
        window.addEventListener('user-login', (event) => {
            OpenReplay.setUserID(event.detail.userId);
            OpenReplay.setMetadata('user', {
                id: event.detail.userId,
                email: event.detail.email,
                name: event.detail.name
            });
        });
        // Track user logout
        window.addEventListener('user-logout', () => {
            OpenReplay.setUserID(null);
            OpenReplay.setMetadata('user', null);
        });
        // Track page views
        window.addEventListener('page-view', (event) => {
            OpenReplay.setMetadata('page', {
                url: event.detail.url,
                title: event.detail.title,
                timestamp: new Date().toISOString()
            });
        });
        // Track errors
        window.addEventListener('error', (event) => {
            OpenReplay.addIssue({
                type: 'error',
                message: event.message,
                stack: event.error?.stack,
                url: event.filename,
                line: event.lineno,
                column: event.colno
            });
        });
        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            OpenReplay.addIssue({
                type: 'unhandledrejection',
                message: event.reason?.message || 'Unhandled promise rejection',
                stack: event.reason?.stack
            });
        });
    }
    /**
     * Set user information
     */
    setUser(userId, email, name) {
        if (!this.isInitialized || typeof window === 'undefined' || !window.OpenReplay) {
            return;
        }
        const OpenReplay = window.OpenReplay;
        OpenReplay.setUserID(userId);
        if (email || name) {
            OpenReplay.setMetadata('user', {
                id: userId,
                email,
                name
            });
        }
    }
    /**
     * Clear user information
     */
    clearUser() {
        if (!this.isInitialized || typeof window === 'undefined' || !window.OpenReplay) {
            return;
        }
        const OpenReplay = window.OpenReplay;
        OpenReplay.setUserID(null);
        OpenReplay.setMetadata('user', null);
    }
    /**
     * Add custom event
     */
    addEvent(name, data) {
        if (!this.isInitialized || typeof window === 'undefined' || !window.OpenReplay) {
            return;
        }
        const OpenReplay = window.OpenReplay;
        OpenReplay.addEvent(name, data);
    }
    /**
     * Add issue/error
     */
    addIssue(issue) {
        if (!this.isInitialized || typeof window === 'undefined' || !window.OpenReplay) {
            return;
        }
        const OpenReplay = window.OpenReplay;
        OpenReplay.addIssue(issue);
    }
    /**
     * Set metadata
     */
    setMetadata(key, value) {
        if (!this.isInitialized || typeof window === 'undefined' || !window.OpenReplay) {
            return;
        }
        const OpenReplay = window.OpenReplay;
        OpenReplay.setMetadata(key, value);
    }
    /**
     * Get session ID
     */
    getSessionId() {
        return this.sessionId;
    }
    /**
     * Check if session replay is enabled
     */
    isEnabled() {
        return this.config.enabled && this.isInitialized;
    }
    /**
     * Stop session recording
     */
    stop() {
        if (!this.isInitialized || typeof window === 'undefined' || !window.OpenReplay) {
            return;
        }
        const OpenReplay = window.OpenReplay;
        OpenReplay.stop();
        this.isInitialized = false;
        this.sessionId = null;
    }
    /**
     * Restart session recording
     */
    restart() {
        if (this.config.enabled) {
            this.stop();
            this.initialize();
        }
    }
}
// Create singleton instance
export const sessionReplayService = new SessionReplayService();
// React hook for session replay
export function useSessionReplay() {
    const [isEnabled, setIsEnabled] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    useEffect(() => {
        const initialize = async () => {
            await sessionReplayService.initialize();
            setIsEnabled(sessionReplayService.isEnabled());
            setSessionId(sessionReplayService.getSessionId());
        };
        initialize();
    }, []);
    const setUser = (userId, email, name) => {
        sessionReplayService.setUser(userId, email, name);
    };
    const clearUser = () => {
        sessionReplayService.clearUser();
    };
    const addEvent = (name, data) => {
        sessionReplayService.addEvent(name, data);
    };
    const addIssue = (issue) => {
        sessionReplayService.addIssue(issue);
    };
    const setMetadata = (key, value) => {
        sessionReplayService.setMetadata(key, value);
    };
    return {
        isEnabled,
        sessionId,
        setUser,
        clearUser,
        addEvent,
        addIssue,
        setMetadata
    };
}
export default sessionReplayService;
//# sourceMappingURL=session-replay.js.map