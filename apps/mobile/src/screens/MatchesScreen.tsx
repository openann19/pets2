import { useRef, useState } from 'react';
import type { FlatList as FlatListType } from 'react-native';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { haptic } from '../ui/haptics';
import { ScreenShell } from '../ui/layout/ScreenShell';

import { useTheme } from '@mobile/src/theme';
import { useTranslation } from 'react-i18next';
import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import { MatchCard } from '../components/matches/MatchCard';
import { MatchesTabs } from '../components/matches/MatchesTabs';
import { useScrollOffsetTracker } from '../hooks/navigation/useScrollOffsetTracker';
import { useTabReselectRefresh } from '../hooks/navigation/useTabReselectRefresh';
import type { Match } from '../hooks/useMatchesData';
import { useMatchesData } from '../hooks/useMatchesData';
import { logger } from '../services/logger';

interface MatchesScreenProps {
  navigation: {
    navigate: (screen: string, params: { matchId: string; petName: string }) => void;
  };
}

export default function MatchesScreen({ navigation }: MatchesScreenProps) {
  const themeHook = useTheme();
  const { t } = useTranslation('common');
  const {
    matches,
    likedYou,
    selectedTab,
    refreshing,
    onRefresh,
    setSelectedTab,
    handleScroll,
    filter,
    setFilter,
  } = useMatchesData();
  const [filterOpen, setFilterOpen] = useState(false);

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

  const handleFilterPress = () => {
    haptic.tap();
    setFilterOpen(true);
    logger.info('Filter matches button pressed');
  };

  const handleSearchPress = () => {
    haptic.tap();
    logger.info('Search matches button pressed');
  };

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

      <FlatList
        ref={listRef}
        data={selectedTab === 'matches' ? matches : likedYou}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            onPress={() => {
              handleMatchPress(item._id, item.petName);
            }}
          />
        )}
        keyExtractor={(item) => item._id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        onScroll={(e) => {
          onScroll(e); // track offset for smart reselect
          handleScroll(e.nativeEvent.contentOffset.y); // persistence
        }}
        scrollEventThrottle={120}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
});
