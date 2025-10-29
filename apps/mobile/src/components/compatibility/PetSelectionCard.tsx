/**
 * Pet Selection Card Component
 * Reusable card for selecting pets in compatibility analysis
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/theme";
import type { AppTheme } from "@/theme";

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
  petCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  petCardSelected: {
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  petInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  petAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  petAvatarText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  petDetails: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  petBreed: {
    fontSize: 14,
    marginBottom: 4,
  },
  petTags: {
    flexDirection: "row",
    gap: 6,
  },
  petTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  petTagText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  selectionIndicator: {
    padding: 8,
  },
});
}


interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  temperament: string[];
}

interface PetSelectionCardProps {
  pet: Pet;
  isSelected: boolean;
  selectionType?: "petA" | "petB";
  onPress: () => void;
}

export const PetSelectionCard: React.FC<PetSelectionCardProps> = ({
  pet,
  isSelected,
  selectionType,
  onPress,
}) => {
    const theme = useTheme();
    const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;

  return (
    <TouchableOpacity
      style={[
        styles.petCard,
        { backgroundColor: colors.surface },
        isSelected && styles.petCardSelected,
      ]}
      onPress={onPress}
      testID="PetSelectionCard-button"
      accessibilityLabel="Interactive element"
      accessibilityRole="button"
    >
      <View style={styles.petInfo}>
        <View style={styles.petAvatar}>
          <Text
            style={[styles.petAvatarText, { color: colors.onSurface }]
          >
            {pet.name.charAt(0)}
          </Text>
        </View>
        <View style={styles.petDetails}>
          <Text style={[styles.petName, { color: colors.onSurface }]>
            {pet.name}
          </Text>
          <Text
            style={[styles.petBreed, { color: colors.onMuted }]
          >
            {pet.breed} • {pet.age} years old
          </Text>
          <View style={styles.petTags}>
            {pet.temperament.slice(0, 2).map((trait, index) => (
              <View
                key={index}
                style={[styles.petTag, { backgroundColor: colors.primary }]
              >
                <Text style={styles.petTagText}>{trait}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      {isSelected && selectionType && (
        <View style={styles.selectionIndicator}>
          <Ionicons
            name={selectionType === "petA" ? "paw" : "heart"}
            size={20}
            color={colors.primary}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};
