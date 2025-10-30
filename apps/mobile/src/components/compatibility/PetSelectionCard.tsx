/**
 * Pet Selection Card Component
 * Reusable card for selecting pets in compatibility analysis
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/theme";
import type { AppTheme } from "@/theme";

function createStyles(theme: AppTheme) {
  const neutralFill = theme.palette.neutral?.[200] ?? theme.colors.surface;

  return StyleSheet.create({
    petCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing.md,
      borderRadius: theme.radii.lg,
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.elevation2,
    },
    petCardSelected: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    petInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: theme.spacing.sm,
    },
    petAvatar: {
      width: theme.spacing["3xl"],
      height: theme.spacing["3xl"],
      borderRadius: theme.radii.full,
      backgroundColor: neutralFill,
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.sm,
    },
    petAvatarText: {
      fontSize: theme.typography.h2.size,
      fontWeight: "700",
      color: theme.colors.onSurface,
    },
    petDetails: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    petName: {
      fontSize: theme.typography.body.size,
      fontWeight: "600",
      color: theme.colors.onSurface,
    },
    petBreed: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
    },
    petTags: {
      flexDirection: "row",
      gap: theme.spacing.xs,
    },
    petTag: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.sm,
      backgroundColor: theme.colors.primary,
    },
    petTagText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size,
      fontWeight: "600",
    },
    selectionIndicator: {
      padding: theme.spacing.xs,
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
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;

  return (
    <TouchableOpacity
      style={[styles.petCard, isSelected && styles.petCardSelected]}
      onPress={onPress}
      testID="PetSelectionCard-button"
      accessibilityLabel="Interactive element"
      accessibilityRole="button"
    >
      <View style={styles.petInfo}>
        <View style={styles.petAvatar}>
          <Text style={styles.petAvatarText}>{pet.name.charAt(0)}</Text>
        </View>
        <View style={styles.petDetails}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petBreed}>
            {pet.breed} • {pet.age} years old
          </Text>
          <View style={styles.petTags}>
            {pet.temperament.slice(0, 2).map((trait, index) => (
              <View key={index} style={styles.petTag}>
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
