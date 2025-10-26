import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Theme } from '../../theme/unified-theme';

interface MatchWidgetProps {
  matches: Array<{
    id: string;
    name: string;
    petName: string;
    petPhoto: string;
    lastMessage?: string;
    timestamp?: string;
    unreadCount?: number;
  }>;
  onMatchPress: (matchId: string) => void;
  onViewAll: () => void;
}

export function MatchWidget({
  matches,
  onMatchPress,
  onViewAll,
}: MatchWidgetProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Matches</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.matchesContainer}>
          {matches.map((match) => (
            <TouchableOpacity
              key={match.id}
              style={styles.matchCard}
              onPress={() => {
                onMatchPress(match.id);
              }}
            >
              <View style={styles.petImageContainer}>
                <Image
                  source={{ uri: match.petPhoto }}
                  style={styles.petImage}
                  resizeMode="cover"
                />
                {match.unreadCount && match.unreadCount > 0 ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{match.unreadCount}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.matchInfo}>
                <Text style={styles.matchName}>{match.name}</Text>
                <Text style={styles.petName}>{match.petName}</Text>
                {match.lastMessage ? (
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {match.lastMessage}
                  </Text>
                ) : null}
                {match.timestamp ? (
                  <Text style={styles.timestamp}>{match.timestamp}</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    margin: 8,
    shadowColor: "Theme.colors.neutral[950]",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "Theme.colors.neutral[800]",
  },
  viewAll: {
    fontSize: 14,
    color: "Theme.colors.secondary[500]",
    fontWeight: "500",
  },
  matchesContainer: {
    flexDirection: "row",
    paddingRight: 16,
  },
  matchCard: {
    width: 120,
    marginRight: 12,
  },
  petImageContainer: {
    position: "relative",
    marginBottom: 8,
  },
  petImage: {
    width: "100%",
    height: 80,
    borderRadius: 8,
  },
  unreadBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "Theme.colors.status.error",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  matchInfo: {
    alignItems: "center",
  },
  matchName: {
    fontSize: 12,
    fontWeight: "600",
    color: "Theme.colors.neutral[800]",
    marginBottom: 2,
  },
  petName: {
    fontSize: 11,
    color: "Theme.colors.neutral[500]",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 10,
    color: "Theme.colors.neutral[400]",
    textAlign: "center",
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 9,
    color: "Theme.colors.neutral[300]",
  },
});
