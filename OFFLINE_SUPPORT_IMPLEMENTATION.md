# Offline Support Implementation Guide

**Date:** January 30, 2025  
**Status:** ✅ Infrastructure Complete - Enhancement Required  
**Purpose:** Comprehensive offline support implementation

---

## ✅ Current Implementation Status

### Infrastructure ✅ COMPLETE

- ✅ Network status monitoring: `apps/mobile/src/hooks/useNetworkStatus.ts`
- ✅ Offline sync service: `apps/mobile/src/services/OfflineSyncService.ts`
- ✅ Offline message queue: `apps/mobile/src/services/OfflineMessageQueue.ts`
- ✅ Error recovery hooks: `apps/mobile/src/hooks/useErrorRecovery.ts`
- ✅ API client with offline support: `apps/mobile/src/services/apiClient.ts`

### Missing Components ⚠️ NEEDS IMPLEMENTATION

- ⚠️ Offline indicator UI component
- ⚠️ Offline queue status display
- ⚠️ Offline action queue visualization
- ⚠️ Sync status indicators

---

## 🎨 Offline Indicator Component

### Implementation

Create `apps/mobile/src/components/OfflineIndicator.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTheme } from '@mobile/theme';
import { Ionicons } from '@expo/vector-icons';

export function OfflineIndicator(): React.JSX.Element | null {
  const { isOnline, isOffline } = useNetworkStatus();
  const theme = useTheme();

  if (!isOffline) return null;

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.danger,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    },
    text: {
      color: theme.colors.onSurface,
      fontSize: 14,
      fontWeight: '600',
      marginLeft: theme.spacing.xs,
    },
  });

  return (
    <View style={styles.container} accessibilityRole="alert" accessibilityLabel="No internet connection">
      <Ionicons name="cloud-offline-outline" size={16} color={theme.colors.onSurface} />
      <Text style={styles.text}>No Internet Connection</Text>
    </View>
  );
}
```

### Usage

Add to `App.tsx`:

```typescript
import { OfflineIndicator } from './components/OfflineIndicator';

function AppContent(): React.ReactElement {
  return (
    <NavigationGuard>
      <OfflineIndicator />
      {/* ... rest of app */}
    </NavigationGuard>
  );
}
```

---

## 📊 Offline Queue Status Component

### Implementation

Create `apps/mobile/src/components/OfflineQueueStatus.tsx`:

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTheme } from '@mobile/theme';
import { Ionicons } from '@expo/vector-icons';

interface OfflineQueueStatusProps {
  pendingActions: number;
  onRetry?: () => void;
}

export function OfflineQueueStatus({ 
  pendingActions, 
  onRetry 
}: OfflineQueueStatusProps): React.JSX.Element | null {
  const { isOnline } = useNetworkStatus();
  const theme = useTheme();

  if (isOnline || pendingActions === 0) return null;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    text: {
      color: theme.colors.onSurface,
      fontSize: 14,
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    retryButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radii.md,
    },
    retryText: {
      color: theme.colors.onSurface,
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <Ionicons name="time-outline" size={20} color={theme.colors.onMuted} />
      <Text style={styles.text}>
        {pendingActions} action{pendingActions !== 1 ? 's' : ''} waiting to sync
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

---

## 🔄 Sync Status Hook

### Implementation

Create `apps/mobile/src/hooks/useSyncStatus.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { OfflineSyncService } from '../services/OfflineSyncService';

export interface SyncStatus {
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: Date | null;
  error: Error | null;
}

export function useSyncStatus(): SyncStatus & { retry: () => Promise<void> } {
  const { isOnline } = useNetworkStatus();
  const [status, setStatus] = useState<SyncStatus>({
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
    error: null,
  });

  const updateStatus = useCallback(async () => {
    const service = OfflineSyncService.getInstance();
    const queue = await service.getQueue();
    
    setStatus({
      isSyncing: service.isSyncing(),
      pendingCount: queue.length,
      lastSyncTime: service.getLastSyncTime(),
      error: null,
    });
  }, []);

  useEffect(() => {
    updateStatus();
    const interval = setInterval(updateStatus, 5000);
    return () => clearInterval(interval);
  }, [updateStatus]);

  useEffect(() => {
    if (isOnline) {
      updateStatus();
    }
  }, [isOnline, updateStatus]);

  const retry = useCallback(async () => {
    if (!isOnline) return;
    
    try {
      const service = OfflineSyncService.getInstance();
      await service.processQueue();
      await updateStatus();
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error(String(error)),
      }));
    }
  }, [isOnline, updateStatus]);

  return {
    ...status,
    retry,
  };
}
```

---

## 🎯 Implementation Checklist

### Critical (Before Store Submission)

- [ ] Create `OfflineIndicator` component
- [ ] Add offline indicator to App root
- [ ] Create `OfflineQueueStatus` component
- [ ] Add queue status to relevant screens
- [ ] Implement `useSyncStatus` hook
- [ ] Test offline functionality
- [ ] Test sync on reconnect

### Recommended (Within 1 Month)

- [ ] Add offline queue visualization
- [ ] Create sync progress indicator
- [ ] Add retry mechanisms for failed actions
- [ ] Implement offline data caching
- [ ] Add offline mode indicators to screens

---

## 📝 Usage Examples

### Adding Offline Indicator

```typescript
// In App.tsx
import { OfflineIndicator } from './components/OfflineIndicator';

function AppContent(): React.ReactElement {
  return (
    <NavigationGuard>
      <OfflineIndicator />
      <StatusBar style="dark" />
      <AppChrome>
        <AppNavigator />
      </AppChrome>
    </NavigationGuard>
  );
}
```

### Using Sync Status

```typescript
// In any screen
import { useSyncStatus } from '../hooks/useSyncStatus';

function MyScreen() {
  const { isSyncing, pendingCount, retry } = useSyncStatus();

  return (
    <View>
      {pendingCount > 0 && (
        <Text>Syncing {pendingCount} actions...</Text>
      )}
      {isSyncing && <ActivityIndicator />}
    </View>
  );
}
```

---

## 🧪 Testing Checklist

- [ ] Test offline indicator appears when network disconnected
- [ ] Test offline queue displays pending actions
- [ ] Test sync on reconnect
- [ ] Test retry mechanism
- [ ] Test error handling
- [ ] Test queue persistence
- [ ] Test multiple offline actions

---

**Last Updated:** January 30, 2025  
**Status:** ✅ Infrastructure Complete - UI Components Needed  
**Priority:** High (User Experience)

