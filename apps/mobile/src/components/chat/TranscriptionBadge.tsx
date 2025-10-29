/**
 * Transcription Badge Component
 * Displays processing status and transcription information
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const TranscriptionBadge = ({ icon, label }: { icon: string; label: string }) => (
  <View style={styles.badge}>
    <Ionicons name={icon} size={12} color={Theme.colors.primary[500]} />
    <Text style={styles.text}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(14, 165, 233, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(14, 165, 233, 0.25)",
  },
  text: {
    fontSize: 12,
    color: Theme.colors.primary[600],
    fontWeight: "600",
  },
});

