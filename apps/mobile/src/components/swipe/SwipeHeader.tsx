import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface SwipeHeaderProps {
  onBack: () => void;
  onMatches: () => void;
  onFilter: () => void;
  onBoost?: () => void;
  showFilters?: boolean;
  canUndo?: boolean;
  onUndo?: () => void;
  isPremium?: boolean;
  boostActive?: boolean;
  boostExpiresAt?: string;
}

export function SwipeHeader({
  onBack,
  onMatches,
  onFilter,
  onBoost,
  showFilters = false,
  canUndo = false,
  onUndo,
  isPremium = false,
  boostActive = false,
  boostExpiresAt,
}: SwipeHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Find your perfect match</Text>
      </View>

      {/* Right Actions */}
      <View style={styles.rightActions}>
        {/* Undo Button (Premium Feature) */}
        {canUndo && (
          <TouchableOpacity
            style={styles.undoButton}
            onPress={onUndo}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["#6b7280", "#4b5563"]}
              style={styles.undoGradient}
            >
              <Ionicons name="arrow-undo" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Boost Button */}
        {onBoost && (
          <TouchableOpacity
            style={[styles.actionButton, boostActive && styles.boostActive]}
            onPress={onBoost}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={
                boostActive
                  ? ["#f59e0b", "#d97706"]
                  : ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]
              }
              style={styles.actionButtonGradient}
            >
              <Ionicons
                name={boostActive ? "flash" : "flash-outline"}
                size={20}
                color="#fff"
              />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Filter Button */}
        <TouchableOpacity
          style={[styles.actionButton, showFilters && styles.activeButton]}
          onPress={onFilter}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={
              showFilters
                ? ["#ec4899", "#be185d"]
                : ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]
            }
            style={styles.actionButtonGradient}
          >
            <Ionicons name="options-outline" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Matches Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onMatches}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]}
            style={styles.actionButtonGradient}
          >
            <Ionicons name="heart" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  undoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
  },
  undoGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  activeButton: {
    shadowColor: "#ec4899",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  boostActive: {
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  actionButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
