import { useRef, useCallback } from 'react';
import type { FlatList as FlatListType } from 'react-native';
import { FlatList, StyleSheet } from 'react-native';
import { useTheme } from '@mobile/theme';
import { haptic } from '../ui/haptics';
import { ScreenShell } from '../ui/layout/ScreenShell';

import { ElasticRefreshControl } from '../components/micro/ElasticRefreshControl';
import { useTranslation } from 'react-i18next';
import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import { MatchCard } from '../components/matches/MatchCard';
import { MatchesTabs } from '../components/matches/MatchesTabs';
import { EmptyState } from '../components/empty/EmptyState';
import { ListSkeleton } from '../components/skeletons';
import { useScrollOffsetTracker } from '../hooks/navigation/useScrollOffsetTracker';
import { useTabReselectRefresh } from '../hooks/navigation/useTabReselectRefresh';
import type { Match } from '../hooks/useMatchesData';
import { useMatchesData } from '../hooks/useMatchesData';
import { logger } from '../services/logger';

interface MatchesScreenProps {
  navigation: {
    navigate: (screen: string, params?: { matchId?: string; petName?: string }) => void;
  };
}

export default function MatchesScreen({ navigation }: MatchesScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const {
    matches,
    likedYou,
    selectedTab,
    refreshing,
    isLoading,
    onRefresh,
    setSelectedTab,
    handleScroll,
  } = useMatchesData();

  const listRef = useRef<FlatListType<Match>>(null);
  const { onScroll, getOffset } = useScrollOffsetTracker();

  useTabReselectRefresh({
    listRef,
    onRefresh,
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
        <ListSkeleton count={5} itemHeight={100} />
      ) : isEmpty ? (
        selectedTab === 'matches' ? (
          <EmptyState
            icon="heart-outline"
            title={t('matches.empty.title') || 'No matches yet'}
            subtitle={t('matches.empty.subtitle') || 'Start swiping to find your perfect match!'}
            actionLabel={t('matches.empty.action') || 'Go to Swipe'}
            onAction={() => navigation.navigate('Swipe')}
          />
        ) : (
          <EmptyState
            icon="chatbubbles-outline"
            title={t('matches.empty.liked_you.title') || 'No one liked you yet'}
            subtitle={t('matches.empty.liked_you.subtitle') || 'Keep swiping and people will start liking you!'}
          />
        )
      ) : (
        <FlatList
          ref={listRef}
          data={currentData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          removeClippedSubviews
          initialNumToRender={8}
          windowSize={7}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          onScroll={(e) => {
            onScroll(e); // track offset for smart reselect
            handleScroll(e.nativeEvent.contentOffset.y); // persistence
          }}
          scrollEventThrottle={16}
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
