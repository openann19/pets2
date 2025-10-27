import React from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, RefreshControl } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { FLAGS } from "../config/flags";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface LiveBrowseScreenProps {
  navigation: any;
}

interface LiveStreamItem {
  _id: string;
  title: string;
  coverUrl?: string;
  viewers: number;
  isLive: boolean;
  startedAt: string;
}

export default function LiveBrowseScreen({ navigation }: LiveBrowseScreenProps) {
  const { top } = useSafeAreaInsets();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["live-active"],
    queryFn: async () => {
      const data = await api.request("/live/active", { method: "GET" });
      return (data as { items: LiveStreamItem[] }).items;
    },
    enabled: FLAGS.GO_LIVE,
    refetchInterval: 5000,
  });

  if (!FLAGS.GO_LIVE) {
    return (
      <View style={styles.container}>
        <View style={styles.unavailableContainer}>
          <Ionicons name="lock-closed" size={64} color="#666" />
          <Text style={styles.unavailableText}>Live streaming is not available</Text>
          <Text style={styles.unavailableSubtext}>This feature is currently disabled</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Streams</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        contentContainerStyle={styles.grid}
        data={data ?? []}
        numColumns={2}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#fff" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("LiveViewer", { streamId: item._id })}
          >
            <Image
              source={{ uri: item.coverUrl || "https://picsum.photos/400" }}
              style={styles.cover}
            />
            <View style={styles.badge}>
              <View style={styles.liveDot} />
              <Text style={styles.badgeText}>LIVE</Text>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.title} numberOfLines={1}>
                {item.title || "Live Stream"}
              </Text>
              <View style={styles.viewerInfo}>
                <Ionicons name="people" size={14} color="#fff" />
                <Text style={styles.viewerCount}>{item.viewers}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="videocam-off" size={64} color="#666" />
            <Text style={styles.emptyText}>No active streams</Text>
            <Text style={styles.emptySubtext}>Be the first to go live!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  grid: {
    padding: 12,
    gap: 12,
  },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: "#181818",
    borderRadius: 12,
    overflow: "hidden",
  },
  cover: {
    width: "100%",
    height: 140,
    backgroundColor: "#1a1a1a",
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 10,
  },
  cardFooter: {
    padding: 10,
  },
  title: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 6,
  },
  viewerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewerCount: {
    color: "#999",
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 80,
  },
  emptyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    color: "#666",
    fontSize: 14,
    marginTop: 8,
  },
  unavailableContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  unavailableText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  unavailableSubtext: {
    color: "#666",
    fontSize: 14,
    marginTop: 8,
  },
});

