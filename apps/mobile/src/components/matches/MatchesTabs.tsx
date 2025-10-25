import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface MatchesTabsProps {
  selectedTab: "matches" | "likedYou";
  onTabChange: (tab: "matches" | "likedYou") => void;
  isPremium?: boolean;
}

export function MatchesTabs({
  selectedTab,
  onTabChange,
  isPremium = false,
}: MatchesTabsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "matches" && styles.activeTab]}
          onPress={() => onTabChange("matches")}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={
              selectedTab === "matches"
                ? ["#ec4899", "#be185d"]
                : ["transparent", "transparent"]
            }
            style={styles.tabGradient}
          >
            <Ionicons
              name="heart"
              size={16}
              color={selectedTab === "matches" ? "#fff" : "#6b7280"}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === "matches" && styles.activeTabText,
              ]}
            >
              Matches
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === "likedYou" && styles.activeTab]}
          onPress={() => onTabChange("likedYou")}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={
              selectedTab === "likedYou"
                ? ["#ec4899", "#be185d"]
                : ["transparent", "transparent"]
            }
            style={styles.tabGradient}
          >
            <Ionicons
              name="heart-outline"
              size={16}
              color={selectedTab === "likedYou" ? "#fff" : "#6b7280"}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === "likedYou" && styles.activeTabText,
              ]}
            >
              Liked You
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Premium Indicator */}
      {!isPremium && (
        <View style={styles.premiumIndicator}>
          <Ionicons name="diamond" size={12} color="#fbbf24" />
          <Text style={styles.premiumText}>Premium</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    position: "relative",
  },
  tabContainer: {
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    borderRadius: 0,
    overflow: "hidden",
  },
  activeTab: {
    shadowColor: "#ec4899",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tabGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  tabText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
    marginLeft: 8,
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  premiumIndicator: {
    position: "absolute",
    top: 8,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 10,
    color: "#fbbf24",
    fontWeight: "600",
    marginLeft: 4,
  },
});
