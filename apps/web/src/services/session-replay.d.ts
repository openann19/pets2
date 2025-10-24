/**
 * Session Re-Play (OpenReplay) Integration
 * UX recording system for debugging and analytics
 */
declare class SessionReplayService {
    private config;
    private isInitialized;
    private sessionId;
    constructor();
    /**
     * Initialize OpenReplay
     */
    initialize(): Promise<void>;
    /**
     * Load OpenReplay script
     */
    private loadOpenReplayScript;
    /**
     * Setup event listeners for custom events
     */
    private setupEventListeners;
    /**
     * Set user information
     */
    setUser(userId: string, email?: string, name?: string): void;
    /**
     * Clear user information
     */
    clearUser(): void;
    /**
     * Add custom event
     */
    addEvent(name: string, data?: Record<string, unknown>): void;
    /**
     * Add issue/error
     */
    addIssue(issue: {
        type: string;
        message: string;
        stack?: string;
        url?: string;
        line?: number;
        column?: number;
    }): void;
    /**
     * Set metadata
     */
    setMetadata(key: string, value: unknown): void;
    /**
     * Get session ID
     */
    getSessionId(): string | null;
    /**
     * Check if session replay is enabled
     */
    isEnabled(): boolean;
    /**
     * Stop session recording
     */
    stop(): void;
    /**
     * Restart session recording
     */
    restart(): void;
}
export declare const sessionReplayService: SessionReplayService;
export declare function useSessionReplay(): {
    isEnabled: any;
    sessionId: any;
    setUser: (userId: string, email?: string, name?: string) => void;
    clearUser: () => void;
    addEvent: (name: string, data?: Record<string, unknown>) => void;
    addIssue: (issue: Parameters<typeof sessionReplayService.addIssue>[0]) => void;
    setMetadata: (key: string, value: unknown) => void;
};
export default sessionReplayService;
//# sourceMappingURL=session-replay.d.ts.map