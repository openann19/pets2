import { FlatList, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
        onScroll={async (e) => {
          await handleScroll(e.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={120}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="Theme.colors.primary[500]"
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
