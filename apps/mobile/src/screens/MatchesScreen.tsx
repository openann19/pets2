import { useRef, useCallback } from 'react';
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import type { FlashList as FlashListType } from '@shopify/flash-list';
import { useTheme } from '@mobile/theme';
import { haptic } from '../ui/haptics';
import { ScreenShell } from '../ui/layout/ScreenShell';

import { ElasticRefreshControl } from '../components/micro/ElasticRefreshControl';
import { useTranslation } from 'react-i18next';
import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import { MatchCard } from '../components/matches/MatchCard';
import { MatchesTabs } from '../components/matches/MatchesTabs';
import { EmptyStates } from '../components/common';
import { ListSkeleton } from '../components/skeletons';
import { useScrollOffsetTracker } from '../hooks/navigation/useScrollOffsetTracker';
import { useTabReselectRefresh } from '../hooks/navigation/useTabReselectRefresh';
import { useTabStatePreservation } from '../hooks/navigation';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useErrorHandling } from '../hooks/useErrorHandling';
import type { Match } from '../hooks/useMatchesData';
import { useMatchesData } from '../hooks/useMatchesData';
import { logger } from '../services/logger';
import { useHeaderWithCounts } from '../hooks/useHeaderWithCounts';
import { useScrollYForHeader } from '../hooks/useScrollYForHeader';

interface MatchesScreenProps {
  navigation: {
    navigate: (screen: string, params?: { matchId?: string; petName?: string }) => void;
  };
}

export default function MatchesScreen({ navigation }: MatchesScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation('common');
  
  // Network status monitoring
  const { isOnline, isOffline } = useNetworkStatus({
    onConnect: () => {
      // Refetch matches when connection restored
      refetch();
    },
  });

  // Error handling with retry
  const {
    error: errorHandlingError,
    retry,
    clearError,
  } = useErrorHandling({
    maxRetries: 3,
    showAlert: false, // We'll handle UI ourselves
    logError: true,
  });

  const {
    matches,
    likedYou,
    selectedTab,
    refreshing,
    isLoading,
    error,
    onRefresh,
    setSelectedTab,
    handleScroll,
    refetch,
  } = useMatchesData();

  const listRef = useRef<FlashListType<Match>>(null);
  const { onScroll, getOffset } = useScrollOffsetTracker();

  // Calculate unread message count from matches
  const unreadMessages = matches.reduce((sum, match) => sum + (match.unreadCount || 0), 0);

  // Create scrollY SharedValue for header collapse
  const { scrollY, scrollHandler } = useScrollYForHeader();

  // Update SmartHeader with title, counts, and scrollY
  useHeaderWithCounts({
    title: t('matches.title', 'Matches'),
    subtitle: selectedTab === 'matches' 
      ? `${matches.length} ${t('matches.active', 'active matches')}`
      : `${likedYou.length} ${t('matches.likedYou', 'liked you')}`,
    counts: {
      messages: unreadMessages,
      notifications: 0,
      community: 0,
    },
    fetchCounts: false, // We're using local counts
    scrollY,
  });

  // Tab state preservation
  const { updateScrollOffset, restoreState } = useTabStatePreservation({
    tabName: 'Matches',
    scrollRef: listRef as any,
    preserveScroll: true,
  });

  // Restore state when screen gains focus
  React.useEffect(() => {
    restoreState();
  }, [restoreState]);

  useTabReselectRefresh({
    listRef,
    onRefresh: async () => {
      if (isOnline) {
        await onRefresh();
      }
    },
    getOffset,
    topThreshold: 120,
    cooldownMs: 700,
  });

  const handleMatchPress = (matchId: string, petName: string) => {
    haptic.confirm();
    navigation.navigate('Chat', { matchId, petName });
  };

  const renderItem = useCallback(
    ({ item }: { item: Match }) => (
      <MatchCard
        match={item}
        onPress={() => {
          handleMatchPress(item._id, item.petName);
        }}
      />
    ),
    [handleMatchPress],
  );

  const keyExtractor = useCallback((item: Match) => item._id, []);

  const handleFilterPress = () => {
    haptic.tap();
    logger.info('Filter matches button pressed');
  };

  const handleSearchPress = () => {
    haptic.tap();
    logger.info('Search matches button pressed');
  };

  const currentData = selectedTab === 'matches' ? matches : likedYou;
  const isEmpty = !isLoading && currentData.length === 0;

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: t('matches.title'),
            rightButtons: [
              {
                type: 'filter',
                onPress: handleFilterPress,
                variant: 'glass',
                haptic: 'light',
              },
              {
                type: 'search',
                onPress: handleSearchPress,
                variant: 'minimal',
                haptic: 'light',
              },
            ],
            apiActions: {
              filter: async () => {
                logger.info('Filter API action triggered');
              },
              search: async () => {
                logger.info('Search API action triggered');
              },
            },
          })}
        />
      }
    >
      <MatchesTabs
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
      />

      {isLoading && currentData.length === 0 ? (
        <ListSkeleton
          count={5}
          itemHeight={100}
        />
      ) : isOffline ? (
        <EmptyStates.Offline
          title={t('matches.offline.title') || 'You\'re offline'}
          message={t('matches.offline.message') || 'Connect to the internet to see your matches'}
          actionLabel={t('matches.offline.retry') || 'Retry'}
          onAction={() => {
            clearError();
            if (isOnline) {
              refetch();
            }
          }}
        />
      ) : error || errorHandlingError ? (
        <EmptyStates.Error
          title={t('matches.error.title') || 'Unable to load matches'}
          message={errorHandlingError?.userMessage || error?.message || t('matches.error.message') || 'Please check your connection and try again'}
          actionLabel={t('matches.error.retry') || 'Retry'}
          onAction={() => {
            clearError();
            retry();
          }}
        />
      ) : isEmpty ? (
        selectedTab === 'matches' ? (
          <EmptyStates.NoMatches
            title={t('matches.empty.title') || 'No matches yet'}
            message={t('matches.empty.subtitle') || 'Start swiping to find your perfect match!'}
            actionLabel={t('matches.empty.action') || 'Go to Swipe'}
            onAction={() => navigation.navigate('Swipe')}
          />
        ) : (
          <EmptyStates.NoData
            title={t('matches.empty.liked_you.title') || 'No one liked you yet'}
            message={t('matches.empty.liked_you.subtitle') || 'Keep swiping and people will start liking you!'}
          />
        )
      ) : (
        <FlashList
          ref={listRef}
          data={currentData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={150} // Estimated match card height
          drawDistance={300} // Render items within 300px of viewport
          estimatedListSize={{ height: 800, width: 400 }}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          onScroll={(e) => {
            scrollHandler(e); // Header collapse animation
            onScroll(e); // track offset for smart reselect
            const offset = e.nativeEvent.contentOffset.y;
            handleScroll(offset); // legacy persistence
            updateScrollOffset(offset); // new tab state preservation
          }}
          scrollEventThrottle={16}
          removeClippedSubviews={true}
          refreshControl={
            <ElasticRefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
});
