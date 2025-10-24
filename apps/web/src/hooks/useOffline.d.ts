/**
 * Offline Hook
 * React hook for managing offline state and operations
 */
import type { OfflineAction } from '../services/OfflineService';
type EventData = {
    type: string;
    data: unknown;
};
export interface OfflineState {
    isOnline: boolean;
    isSyncing: boolean;
    lastSync: number;
    pendingActions: number;
    failedActions: number;
    syncProgress: number;
}
export interface OfflineActions {
    cacheData: (key: string, data: EventData, expiresIn?: number) => Promise<void>;
    getCachedData: (key: string) => Promise<EventData | null>;
    removeCachedData: (key: string) => Promise<void>;
    clearCache: () => Promise<void>;
    queueAction: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retries'>) => Promise<string>;
    removeAction: (id: string) => Promise<void>;
    sync: () => Promise<void>;
    getPendingActions: () => OfflineAction[];
    getFailedActions: () => OfflineAction[];
    refreshStatus: () => void;
}
export declare const useOffline: () => OfflineState & OfflineActions;
export {};
//# sourceMappingURL=useOffline.d.ts.map