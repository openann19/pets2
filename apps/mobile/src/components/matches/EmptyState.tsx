import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface EmptyStateProps {
  tab: "matches" | "likedYou";
  onRefresh: () => void;
  isPremium: boolean;
  onUpgrade: () => void;
}

export function EmptyState({
  tab,
  onRefresh,
  isPremium,
  onUpgrade,
}: EmptyStateProps) {
  const isMatchesTab = tab === "matches";

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={isMatchesTab ? "heart-outline" : "heart"}
            size={64}
            color="#ec4899"
          />
        </View>

        <Text style={styles.title}>
          {isMatchesTab ? "No Matches Yet" : "No Likes Yet"}
        </Text>

        <Text style={styles.subtitle}>
          {isMatchesTab
            ? "Keep swiping to find your perfect match!"
            : "Start swiping to see who likes you back!"}
        </Text>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={["#ec4899", "#be185d"]}
            style={styles.refreshButtonGradient}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </LinearGradient>
        </TouchableOpacity>

        {!isPremium && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={onUpgrade}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["#fbbf24", "#f59e0b"]}
              style={styles.upgradeButtonGradient}
            >
              <Ionicons name="diamond" size={16} color="#fff" />
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  content: {
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(236, 72, 153, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  refreshButton: {
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 16,
  },
  refreshButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  upgradeButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  upgradeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  upgradeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
});
