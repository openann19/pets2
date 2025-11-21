import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { logger } from "@pawfectmatch/core";

interface MatchCardProps {
  match: {
    _id: string;
    petId: string;
    petName: string;
    petPhoto: string;
    petAge: number;
    petBreed: string;
    lastMessage: {
      content: string;
      timestamp: string;
      senderId: string;
    };
    isOnline: boolean;
    matchedAt: string;
    unreadCount: number;
  };
  onPress?: () => void;
  onUnmatch?: (matchId: string, petName: string) => Promise<void>;
  onArchive?: (matchId: string, petName: string) => Promise<void>;
  onReport?: (matchId: string, petName: string) => void;
  isPremium?: boolean;
  index?: number;
}

export function MatchCard({
  match,
  onPress,
  onUnmatch,
  onArchive,
  onReport,
  isPremium = false,
  index = 0,
}: MatchCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const handleUnmatch = async () => {
    if (!isPremium) {
      Alert.alert(
        "Premium Feature",
        "Unmatching is a premium feature. Upgrade to PawfectMatch Premium to unlock this feature.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Upgrade",
            onPress: () => logger.info("User wants to upgrade for unmatch"),
          },
        ],
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await onUnmatch?.(match._id, match.petName);
  };

  const handleArchive = async () => {
    if (!isPremium) {
      Alert.alert(
        "Premium Feature",
        "Archiving matches is a premium feature. Upgrade to PawfectMatch Premium to unlock this feature.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Upgrade",
            onPress: () => logger.info("User wants to upgrade for archive"),
          },
        ],
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await onArchive?.(match._id, match.petName);
  };

  const handleReport = () => {
    Alert.alert(
      "Report Match",
      `Are you sure you want to report ${match.petName}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report",
          style: "destructive",
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            onReport?.(match._id, match.petName);
          },
        },
      ],
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "now";
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Pet Photo */}
        <View style={styles.photoContainer}>
          <View style={styles.photo}>
            {/* TODO: Replace with actual image component */}
            <Ionicons name="paw" size={32} color="#ec4899" />
          </View>

          {/* Online Status */}
          {match.isOnline && (
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
            </View>
          )}
        </View>

        {/* Match Info */}
        <View style={styles.infoContainer}>
          <View style={styles.header}>
            <Text style={styles.petName}>{match.petName}</Text>
            <Text style={styles.timestamp}>
              {formatTime(match.lastMessage.timestamp)}
            </Text>
          </View>

          <View style={styles.details}>
            <Text style={styles.petDetails}>
              {match.petAge} years • {match.petBreed}
            </Text>
          </View>

          <View style={styles.messageContainer}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {match.lastMessage.content}
            </Text>

            {match.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {match.unreadCount > 99 ? "99+" : match.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {isPremium && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleUnmatch}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={16} color="#ef4444" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleArchive}
                activeOpacity={0.7}
              >
                <Ionicons name="archive" size={16} color="#6b7280" />
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleReport}
            activeOpacity={0.7}
          >
            <Ionicons name="flag" size={16} color="#f59e0b" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  photoContainer: {
    position: "relative",
    marginRight: 16,
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10b981",
  },
  infoContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  petName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  timestamp: {
    fontSize: 12,
    color: "#6b7280",
  },
  details: {
    marginBottom: 6,
  },
  petDetails: {
    fontSize: 14,
    color: "#6b7280",
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessage: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: "#ec4899",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
});
