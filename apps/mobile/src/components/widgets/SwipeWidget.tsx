import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Theme } from '../theme/unified-theme';

interface SwipeWidgetProps {
  pet: {
    id: string;
    name: string;
    age: number;
    breed: string;
    photos: string[];
  };
  onSwipe: (direction: "left" | "right") => void;
  onViewProfile: () => void;
}

export function SwipeWidget({ pet, onSwipe, onViewProfile }: SwipeWidgetProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quick Swipe</Text>
        <TouchableOpacity onPress={onViewProfile}>
          <Ionicons name="open-outline" size={20} color="Theme.colors.secondary[500]" />
        </TouchableOpacity>
      </View>

      <View style={styles.petCard}>
        <Image
          source={{ uri: pet.photos[0] }}
          style={styles.petImage}
          resizeMode="cover"
        />
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petDetails}>
            {pet.age} • {pet.breed}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={StyleSheet.flatten([styles.actionButton, styles.passButton])}
          onPress={() => {
            onSwipe("left");
          }}
        >
          <Ionicons name="close" size={24} color="Theme.colors.status.error" />
        </TouchableOpacity>

        <TouchableOpacity
          style={StyleSheet.flatten([styles.actionButton, styles.likeButton])}
          onPress={() => {
            onSwipe("right");
          }}
        >
          <Ionicons name="heart" size={24} color="Theme.colors.status.success" />
        </TouchableOpacity>
      </View>
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
  petCard: {
    backgroundColor: "Theme.colors.background.secondary",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  petImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  petInfo: {
    alignItems: "center",
  },
  petName: {
    fontSize: 14,
    fontWeight: "600",
    color: "Theme.colors.neutral[800]",
    marginBottom: 2,
  },
  petDetails: {
    fontSize: 12,
    color: "Theme.colors.neutral[500]",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "Theme.colors.neutral[950]",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  passButton: {
    backgroundColor: "#FEF2F2",
  },
  likeButton: {
    backgroundColor: "#F0FDF4",
  },
});
