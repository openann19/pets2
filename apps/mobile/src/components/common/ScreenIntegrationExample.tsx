/**
 * Screen Integration Example
 * 
 * This file demonstrates how to integrate:
 * - Loading skeletons
 * - Empty states
 * - Error handling with retry
 * - Tab state preservation
 * - Network status awareness
 * 
 * Copy this pattern to other screens that need these features.
 */

import React, { useRef } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { ScrollView, View, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useErrorHandling } from '@/hooks/useErrorHandling';
import { useTabStatePreservation } from '@/hooks/navigation';
import { 
  TextSkeleton, 
  ListSkeleton,
  EmptyStates 
} from '@/components/common';

interface ExampleScreenProps {
  // Your screen props
}

/**
 * Example screen showing integration of all new features
 */
export function ExampleScreenWithFullIntegration({}: ExampleScreenProps) {
  const scrollRef = useRef<ScrollView>(null);
  
  // Network status monitoring
  const { isOnline, isOffline } = useNetworkStatus({
    onConnect: () => {
      // Refetch data when connection restored
      refetch();
    },
    onDisconnect: () => {
      // Handle offline mode
      logger.info('Offline mode');
    },
  });

  // Error handling with retry
  const {
    error,
    isRetrying,
    executeWithRetry,
    retry,
    clearError,
  } = useErrorHandling({
    maxRetries: 3,
    showAlert: true,
    logError: true,
  });

  // Tab state preservation
  const {
    restoreState,
    updateScrollOffset,
    updateFilters: _updateFilters,
  } = useTabStatePreservation({
    tabName: 'ExampleScreen',
    scrollRef,
    preserveScroll: true,
    preserveFilters: true,
  });

  // Data fetching with React Query
  const {
    data,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['example-data'],
    queryFn: async () => {
      return executeWithRetry(async () => {
        // Your API call here
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
      }, 'ExampleScreen');
    },
    enabled: isOnline, // Only fetch when online
    retry: 3,
    retryDelay: 1000,
  });

  // Restore state when screen gains focus
  React.useEffect(() => {
    restoreState();
  }, [restoreState]);

  // Handle scroll to preserve position
  const handleScroll = (event: { nativeEvent: { contentOffset: { y: number } } }) => {
    const offset = event.nativeEvent.contentOffset.y;
    updateScrollOffset(offset);
  };

  // Loading state - show skeletons
  if (isLoading && !data) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TextSkeleton lines={2} />
        </View>
        <ListSkeleton items={5} showAvatar={true} />
      </View>
    );
  }

  // Error state - show error with retry
  if (queryError || error) {
    return (
      <View style={styles.container}>
        <EmptyStates.Error
          title={error?.userMessage || 'Failed to load data'}
          message="Please try again"
          actionLabel={isRetrying ? 'Retrying...' : 'Retry'}
          onAction={() => {
            clearError();
            retry();
          }}
        />
      </View>
    );
  }

  // Empty state - no data
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyStates.NoData
          title="No data available"
          message="There's nothing here yet"
          actionLabel="Refresh"
          onAction={() => refetch()}
        />
      </View>
    );
  }

  // Offline state - show offline message
  if (isOffline) {
    return (
      <View style={styles.container}>
        <EmptyStates.Offline
          title="You're offline"
          message="Some features may be limited"
        />
      </View>
    );
  }

  // Success state - render data
  return (
    <ScrollView
      ref={scrollRef}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Your screen content here */}
      <View>
        {/* Render your data */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    padding: 16,
  },
});

/**
 * Simplified integration pattern for screens that don't need all features
 */
export function SimplifiedScreenExample() {
  const { isOnline } = useNetworkStatus();
  const { error, executeWithRetry } = useErrorHandling();

  const { data, isLoading } = useQuery({
    queryKey: ['simple-data'],
    queryFn: () => executeWithRetry(async () => {
      // API call
      return {};
    }),
    enabled: isOnline,
  });

  if (isLoading) {
    return <ListSkeleton items={3} />;
  }

  if (error) {
    return (
      <EmptyStates.Error
        actionLabel="Retry"
        onAction={() => {/* retry logic */}}
      />
    );
  }

  if (!data || data.length === 0) {
    return <EmptyStates.NoData />;
  }

  return (
    <View>
      {/* Your content */}
    </View>
  );
}

