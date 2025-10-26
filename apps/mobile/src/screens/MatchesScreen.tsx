import { FlatList, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { FlatList as FlatListType } from "react-native";
import { useRef } from "react";

import {
  AdvancedHeader,
  HeaderConfigs,
} from "../components/Advanced/AdvancedHeader";
import { MatchCard } from "../components/matches/MatchCard";
import { MatchesTabs } from "../components/matches/MatchesTabs";
import { useMatchesData } from "../hooks/useMatchesData";
import { logger } from "../services/logger";
import type { Match } from "../hooks/useMatchesData";
import { Theme } from '../theme/unified-theme';
import { useScrollOffsetTracker } from "../hooks/navigation/useScrollOffsetTracker";
import { useTabReselectRefresh } from "../hooks/navigation/useTabReselectRefresh";

interface MatchesScreenProps {
  navigation: {
    navigate: (
      screen: string,
      params: { matchId: string; petName: string },
    ) => void;
  };
}

export default function MatchesScreen({ navigation }: MatchesScreenProps) {
  const {
    matches,
    likedYou,
    selectedTab,
    refreshing,
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
    navigation.navigate("Chat", { matchId, petName });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Advanced Header */}
      <AdvancedHeader
        {...HeaderConfigs.glass({
          title: "Matches",
          rightButtons: [
            {
              type: "filter",
              onPress: async () => {
                logger.info("Filter matches button pressed");
              },
              variant: "glass",
              haptic: "light",
            },
            {
              type: "search",
              onPress: async () => {
                logger.info("Search matches button pressed");
              },
              variant: "minimal",
              haptic: "light",
            },
          ],
          apiActions: {
            filter: async () => {
              logger.info("Filter API action triggered");
            },
            search: async () => {
              logger.info("Search API action triggered");
            },
          },
        })}
      />

      <MatchesTabs selectedTab={selectedTab} onTabChange={setSelectedTab} />

      <FlatList
        ref={listRef}
        data={selectedTab === "matches" ? matches : likedYou}
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
          onScroll(e);       // track offset for smart reselect
          handleScroll(e.nativeEvent.contentOffset.y); // persistence
        }}
        scrollEventThrottle={120}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Theme.colors.primary[500]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
});
