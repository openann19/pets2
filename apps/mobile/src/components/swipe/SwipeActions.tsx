import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

interface SwipeActionsProps {
  onPass: () => void;
  onSuperLike: () => void;
  onLike: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  isPremium?: boolean;
}

export function SwipeActions({
  onPass,
  onSuperLike,
  onLike,
  onUndo,
  canUndo = false,
  isPremium = false,
}: SwipeActionsProps) {
  const handlePass = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPass();
  };

  const handleSuperLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSuperLike();
  };

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLike();
  };

  const handleUndo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    onUndo?.();
  };

  return (
    <View style={styles.container}>
      {/* Undo Button (Premium Feature) */}
      {canUndo && isPremium && (
        <TouchableOpacity
          style={styles.undoButton}
          onPress={handleUndo}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={["#6b7280", "#4b5563"]}
            style={styles.undoGradient}
          >
            <Ionicons name="arrow-undo" size={20} color="#fff" />
            <Text style={styles.undoText}>Undo</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Main Action Buttons */}
      <View style={styles.actionButtons}>
        {/* Pass Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handlePass}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={["#ef4444", "#dc2626"]}
            style={styles.actionButtonGradient}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Super Like Button */}
        <TouchableOpacity
          style={styles.superLikeButton}
          onPress={handleSuperLike}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={["#3b82f6", "#1d4ed8"]}
            style={styles.actionButtonGradient}
          >
            <Ionicons name="star" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Like Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={["#10b981", "#059669"]}
            style={styles.actionButtonGradient}
          >
            <Ionicons name="heart" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  undoButton: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  undoGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  undoText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  superLikeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
