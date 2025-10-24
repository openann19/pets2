/**
 * PWA Offline Mode Service
 * Handles offline functionality with Workbox and IndexedDB
 */
import { Pet, Message } from '@/types/common';
interface OfflineAction {
    id: string;
    type: 'swipe' | 'like' | 'message' | 'profile_update';
    data: Record<string, unknown>;
    timestamp: number;
    retryCount: number;
    maxRetries: number;
}
interface CachedPet {
    id: string;
    name: string;
    breed: string;
    age: number;
    photos: string[];
    bio?: string;
    location?: string;
    cachedAt: number;
}
interface CachedMessage {
    id: string;
    chatId: string;
    content: string;
    senderId: string;
    timestamp: number;
    cachedAt: number;
}
declare class PWAOfflineService {
    private dbName;
    private dbVersion;
    private db;
    private isOnline;
    private pendingActions;
    /**
     * Initialize offline service
     */
    initialize(): Promise<void>;
    /**
     * Initialize IndexedDB
     */
    private initIndexedDB;
    /**
     * Setup online/offline event listeners
     */
    private setupOnlineOfflineListeners;
    /**
     * Cache pets for offline viewing
     */
    cachePets(pets: Pet[]): Promise<void>;
    /**
     * Get cached pets
     */
    getCachedPets(): Promise<CachedPet[]>;
    /**
     * Cache messages for offline viewing
     */
    cacheMessages(messages: Message[]): Promise<void>;
    /**
     * Get cached messages for a chat
     */
    getCachedMessages(chatId: string): Promise<CachedMessage[]>;
    /**
     * Queue action for offline execution
     */
    queueAction(type: OfflineAction['type'], data: Record<string, unknown>): Promise<string>;
    /**
     * Execute a queued action
     */
    private executeAction;
    /**
     * Save pending action to IndexedDB
     */
    private savePendingAction;
    /**
     * Load pending actions from IndexedDB
     */
    private loadPendingActions;
    /**
     * Sync pending actions when online
     */
    private syncPendingActions;
    /**
     * Remove pending action from IndexedDB
     */
    private removePendingAction;
    /**
     * Cleanup old cached pets
     */
    private cleanupOldPets;
    /**
     * Cleanup old cached messages
     */
    private cleanupOldMessages;
    /**
     * Get offline status
     */
    isOffline(): boolean;
    /**
     * Get pending actions count
     */
    getPendingActionsCount(): number;
    /**
     * Clear all cached data
     */
    clearCache(): Promise<void>;
}
export declare const pwaOfflineService: PWAOfflineService;
export declare function usePWAOffline(): {
    isOffline: any;
    pendingActions: any;
    isInitialized: any;
    queueAction: (type: OfflineAction["type"], data: Record<string, unknown>) => Promise<string>;
    getCachedPets: () => Promise<CachedPet[]>;
    getCachedMessages: (chatId: string) => Promise<CachedMessage[]>;
    cachePets: (pets: Pet[]) => Promise<void>;
    cacheMessages: (messages: Message[]) => Promise<void>;
    clearCache: () => Promise<void>;
};
export default pwaOfflineService;
//# sourceMappingURL=pwa-offline.d.ts.map