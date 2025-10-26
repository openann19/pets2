/**
 * PWA Offline Mode Service
 * Handles offline functionality with Workbox and IndexedDB
 */
import { logger } from './logger';
import { Pet, Message } from '@/types/common';
class PWAOfflineService {
    dbName = 'PawfectMatchOffline';
    dbVersion = 1;
    db = null;
    isOnline = navigator.onLine;
    pendingActions = [];
    /**
     * Initialize offline service
     */
    async initialize() {
        try {
            await this.initIndexedDB();
            this.setupOnlineOfflineListeners();
            await this.loadPendingActions();
            logger.info('PWA Offline service initialized');
        }
        catch (error) {
            logger.error('Failed to initialize offline service', error);
        }
    }
    /**
     * Initialize IndexedDB
     */
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            request.onerror = () => { reject(request.error); };
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // Create object stores
                if (!db.objectStoreNames.contains('pets')) {
                    const petsStore = db.createObjectStore('pets', { keyPath: 'id' });
                    petsStore.createIndex('cachedAt', 'cachedAt');
                }
                if (!db.objectStoreNames.contains('messages')) {
                    const messagesStore = db.createObjectStore('messages', { keyPath: 'id' });
                    messagesStore.createIndex('chatId', 'chatId');
                    messagesStore.createIndex('cachedAt', 'cachedAt');
                }
                if (!db.objectStoreNames.contains('actions')) {
                    const actionsStore = db.createObjectStore('actions', { keyPath: 'id' });
                    actionsStore.createIndex('timestamp', 'timestamp');
                }
            };
        });
    }
    /**
     * Setup online/offline event listeners
     */
    setupOnlineOfflineListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncPendingActions();
            logger.info('Device came online - syncing pending actions');
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
            logger.info('Device went offline - actions will be queued');
        });
    }
    /**
     * Cache pets for offline viewing
     */
    async cachePets(pets) {
        if (!this.db)
            return;
        const transaction = this.db.transaction(['pets'], 'readwrite');
        const store = transaction.objectStore('pets');
        for (const pet of pets) {
            const cachedPet = {
                id: pet.id,
                name: pet.name,
                breed: pet.breed,
                age: pet.age,
                photos: pet.photos || [],
                bio: pet.bio,
                location: pet.location,
                cachedAt: Date.now()
            };
            await new Promise((resolve, reject) => {
                const request = store.put(cachedPet);
                request.onsuccess = () => { resolve(); };
                request.onerror = () => { reject(request.error); };
            });
        }
        // Keep only last 50 pets
        await this.cleanupOldPets();
    }
    /**
     * Get cached pets
     */
    async getCachedPets() {
        if (!this.db)
            return [];
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['pets'], 'readonly');
            const store = transaction.objectStore('pets');
            const request = store.getAll();
            request.onsuccess = () => {
                const pets = request.result.sort((a, b) => b.cachedAt - a.cachedAt);
                resolve(pets.slice(0, 50)); // Return last 50 pets
            };
            request.onerror = () => { reject(request.error); };
        });
    }
    /**
     * Cache messages for offline viewing
     */
    async cacheMessages(messages) {
        if (!this.db)
            return;
        const transaction = this.db.transaction(['messages'], 'readwrite');
        const store = transaction.objectStore('messages');
        for (const message of messages) {
            const cachedMessage = {
                id: message.id,
                chatId: message.chatId,
                content: message.content,
                senderId: message.senderId,
                timestamp: message.timestamp,
                cachedAt: Date.now()
            };
            await new Promise((resolve, reject) => {
                const request = store.put(cachedMessage);
                request.onsuccess = () => { resolve(); };
                request.onerror = () => { reject(request.error); };
            });
        }
        // Keep only last 100 messages per chat
        await this.cleanupOldMessages();
    }
    /**
     * Get cached messages for a chat
     */
    async getCachedMessages(chatId) {
        if (!this.db)
            return [];
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['messages'], 'readonly');
            const store = transaction.objectStore('messages');
            const index = store.index('chatId');
            const request = index.getAll(chatId);
            request.onsuccess = () => {
                const messages = request.result.sort((a, b) => a.timestamp - b.timestamp);
                resolve(messages.slice(-50)); // Return last 50 messages
            };
            request.onerror = () => { reject(request.error); };
        });
    }
    /**
     * Queue action for offline execution
     */
    async queueAction(type, data) {
        const action = {
            id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            data,
            timestamp: Date.now(),
            retryCount: 0,
            maxRetries: 3
        };
        if (this.isOnline) {
            // Try to execute immediately
            try {
                await this.executeAction(action);
                return action.id;
            }
            catch (error) {
                // If online execution fails, queue for retry
                logger.warn('Online action failed, queuing for retry', error);
            }
        }
        // Queue for offline execution
        await this.savePendingAction(action);
        this.pendingActions.push(action);
        logger.info('Action queued for offline execution', { type, id: action.id });
        return action.id;
    }
    /**
     * Execute a queued action
     */
    async executeAction(action) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        switch (action.type) {
            case 'swipe':
                await fetch(`${apiUrl}/api/swipes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(action.data)
                });
                break;
            case 'like':
                await fetch(`${apiUrl}/api/likes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(action.data)
                });
                break;
            case 'message':
                await fetch(`${apiUrl}/api/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(action.data)
                });
                break;
            case 'profile_update':
                await fetch(`${apiUrl}/api/pets/${action.data.petId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(action.data)
                });
                break;
            default:
                throw new Error(`Unknown action type: ${action.type}`);
        }
    }
    /**
     * Save pending action to IndexedDB
     */
    async savePendingAction(action) {
        if (!this.db)
            return;
        const transaction = this.db.transaction(['actions'], 'readwrite');
        const store = transaction.objectStore('actions');
        await new Promise((resolve, reject) => {
            const request = store.put(action);
            request.onsuccess = () => { resolve(); };
            request.onerror = () => { reject(request.error); };
        });
    }
    /**
     * Load pending actions from IndexedDB
     */
    async loadPendingActions() {
        if (!this.db)
            return;
        const transaction = this.db.transaction(['actions'], 'readonly');
        const store = transaction.objectStore('actions');
        const request = store.getAll();
        request.onsuccess = () => {
            this.pendingActions = request.result.sort((a, b) => a.timestamp - b.timestamp);
            logger.info(`Loaded ${this.pendingActions.length} pending actions`);
        };
    }
    /**
     * Sync pending actions when online
     */
    async syncPendingActions() {
        if (!this.isOnline || this.pendingActions.length === 0)
            return;
        logger.info(`Syncing ${this.pendingActions.length} pending actions`);
        const actionsToRemove = [];
        for (const action of this.pendingActions) {
            try {
                await this.executeAction(action);
                actionsToRemove.push(action.id);
                logger.info(`Successfully synced action ${action.id}`);
            }
            catch (error) {
                action.retryCount++;
                if (action.retryCount >= action.maxRetries) {
                    actionsToRemove.push(action.id);
                    logger.error(`Action ${action.id} exceeded max retries`, error);
                }
                else {
                    await this.savePendingAction(action);
                    logger.warn(`Action ${action.id} failed, will retry (${action.retryCount}/${action.maxRetries})`);
                }
            }
        }
        // Remove successfully synced or failed actions
        for (const actionId of actionsToRemove) {
            await this.removePendingAction(actionId);
            this.pendingActions = this.pendingActions.filter(a => a.id !== actionId);
        }
    }
    /**
     * Remove pending action from IndexedDB
     */
    async removePendingAction(actionId) {
        if (!this.db)
            return;
        const transaction = this.db.transaction(['actions'], 'readwrite');
        const store = transaction.objectStore('actions');
        await new Promise((resolve, reject) => {
            const request = store.delete(actionId);
            request.onsuccess = () => { resolve(); };
            request.onerror = () => { reject(request.error); };
        });
    }
    /**
     * Cleanup old cached pets
     */
    async cleanupOldPets() {
        if (!this.db)
            return;
        const transaction = this.db.transaction(['pets'], 'readwrite');
        const store = transaction.objectStore('pets');
        const index = store.index('cachedAt');
        const request = index.getAll();
        request.onsuccess = () => {
            const pets = request.result.sort((a, b) => b.cachedAt - a.cachedAt);
            const petsToDelete = pets.slice(50); // Keep only 50 most recent
            for (const pet of petsToDelete) {
                store.delete(pet.id);
            }
        };
    }
    /**
     * Cleanup old cached messages
     */
    async cleanupOldMessages() {
        if (!this.db)
            return;
        const transaction = this.db.transaction(['messages'], 'readwrite');
        const store = transaction.objectStore('messages');
        const index = store.index('cachedAt');
        const request = index.getAll();
        request.onsuccess = () => {
            const messages = request.result.sort((a, b) => b.cachedAt - a.cachedAt);
            const messagesToDelete = messages.slice(100); // Keep only 100 most recent
            for (const message of messagesToDelete) {
                store.delete(message.id);
            }
        };
    }
    /**
     * Get offline status
     */
    isOffline() {
        return !this.isOnline;
    }
    /**
     * Get pending actions count
     */
    getPendingActionsCount() {
        return this.pendingActions.length;
    }
    /**
     * Clear all cached data
     */
    async clearCache() {
        if (!this.db)
            return;
        const stores = ['pets', 'messages', 'actions'];
        for (const storeName of stores) {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            await new Promise((resolve, reject) => {
                const request = store.clear();
                request.onsuccess = () => { resolve(); };
                request.onerror = () => { reject(request.error); };
            });
        }
        this.pendingActions = [];
        logger.info('Offline cache cleared');
    }
}
// Create singleton instance
export const pwaOfflineService = new PWAOfflineService();
// React hook for offline functionality
export function usePWAOffline() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [pendingActions, setPendingActions] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);
    useEffect(() => {
        const initialize = async () => {
            await pwaOfflineService.initialize();
            setIsInitialized(true);
            setPendingActions(pwaOfflineService.getPendingActionsCount());
        };
        initialize();
        const handleOnline = () => {
            setIsOffline(false);
            setPendingActions(pwaOfflineService.getPendingActionsCount());
        };
        const handleOffline = () => {
            setIsOffline(true);
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    const queueAction = async (type, data) => {
        const actionId = await pwaOfflineService.queueAction(type, data);
        setPendingActions(pwaOfflineService.getPendingActionsCount());
        return actionId;
    };
    const getCachedPets = () => pwaOfflineService.getCachedPets();
    const getCachedMessages = (chatId) => pwaOfflineService.getCachedMessages(chatId);
    const cachePets = (pets) => pwaOfflineService.cachePets(pets);
    const cacheMessages = (messages) => pwaOfflineService.cacheMessages(messages);
    const clearCache = () => pwaOfflineService.clearCache();
    return {
        isOffline,
        pendingActions,
        isInitialized,
        queueAction,
        getCachedPets,
        getCachedMessages,
        cachePets,
        cacheMessages,
        clearCache
    };
}
export default pwaOfflineService;
//# sourceMappingURL=pwa-offline.js.map