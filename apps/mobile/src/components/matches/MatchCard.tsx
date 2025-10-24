import { Ionicons } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import { LinearGradient } from "expo-linear-gradient";
import React, { memo } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import type { Match } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";
import OptimizedImage from "../OptimizedImage";

interface MatchCardProps {
  match: Match;
  onPress?: () => void;
  onUnmatch?: (matchId: string, petName: string) => Promise<void>;
  onArchive?: (matchId: string, petName: string) => Promise<void>;
  onReport?: (matchId: string, petName: string) => void;
}

function MatchCardBase({
  match,
  onPress,
  onUnmatch,
  onArchive,
  onReport,
}: MatchCardProps): JSX.Element {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePress = () => {
    void Haptics.selectionAsync();
    onPress?.();
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { stiffness: 300, damping: 20 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { stiffness: 300, damping: 20 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const handleUnmatch = async () => {
    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      await onUnmatch?.(match._id, displayPet.name);
    } catch (error) {
      logger.error("Error unmatching:", { error });
    }
  };

  const handleArchive = async () => {
    try {
      void Haptics.selectionAsync();
      await onArchive?.(match._id, displayPet.name);
    } catch (error) {
      logger.error("Error archiving:", { error });
    }
  };

  const handleReport = () => {
    Alert.alert("Report Match", `Report this match with ${displayPet.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Report",
        style: "destructive",
        onPress: () => {
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning,
          );
          onReport?.(match._id, displayPet.name);
        },
      },
    ]);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Choose which pet to display (pet2 if current user owns pet1, otherwise pet1)
  const displayPet = match.pet2; // For now, show pet2
  const displayUser = match.user2; // For now, show user2
  const petPhoto = displayPet.photos?.[0]?.url || "";
  const lastMessage = match.messages?.[match.messages.length - 1];

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.92}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel={`View match with ${displayPet.name}`}
      >
        <LinearGradient
          colors={["#fceabb", "#f8b500", "#ec4899", "#a21caf"]}
          style={styles.gradient}
        >
          <OptimizedImage
            source={{ uri: petPhoto }}
            style={styles.photo}
            resizeMode="cover"
            accessibilityLabel={`${displayPet.name} photo`}
            priority="high"
          />
          <View style={styles.info}>
            <Text style={styles.name}>{displayPet.name}</Text>
            <Text style={styles.meta}>
              {displayPet.breed}, {displayPet.age} years old
            </Text>
            <Text style={styles.owner}>
              {displayUser.firstName} {displayUser.lastName}
            </Text>
            {lastMessage ? (
              <Text style={styles.lastMessage} numberOfLines={1}>
                {lastMessage.content}
              </Text>
            ) : null}
            <Text style={styles.matchedAt}>
              Matched {new Date(match.createdAt).toLocaleDateString()}
            </Text>
          </View>
          {(onUnmatch || onArchive || onReport) && (
            <View style={styles.actions}>
              {onReport && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.reportButton]}
                  onPress={handleReport}
                  accessibilityLabel="Report match"
                >
                  <Ionicons name="flag-outline" size={20} color="#f59e0b" />
                </TouchableOpacity>
              )}
              {onArchive && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleArchive}
                  accessibilityLabel="Archive match"
                >
                  <Ionicons name="archive-outline" size={20} color="#6b21a8" />
                </TouchableOpacity>
              )}
              {onUnmatch && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.unmatchButton]}
                  onPress={handleUnmatch}
                  accessibilityLabel="Unmatch"
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color="#dc2626"
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    margin: 12,
    shadowColor: "#ec4899",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  gradient: {
    borderRadius: 24,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#f3e8ff",
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#a21caf",
  },
  meta: {
    fontSize: 15,
    color: "#6b21a8",
    marginVertical: 2,
  },
  owner: {
    fontSize: 14,
    color: "#7c3aed",
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 2,
  },
  matchedAt: {
    fontSize: 12,
    color: "#a21caf",
    marginTop: 4,
  },
  actions: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  unmatchButton: {
    backgroundColor: "rgba(220, 38, 38, 0.1)",
  },
  reportButton: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
  },
});

export const MatchCard = memo(MatchCardBase);
MatchCard.displayName = "MatchCard";
