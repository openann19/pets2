/**
 * Pet Selection Section Component
 * Handles pet selection UI for compatibility analysis
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/theme";
import type { AppTheme } from "@/theme";

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
  selectionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  selectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 12,
  },
  selectionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  petsList: {
    maxHeight: 300,
  },
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
  size: string;
  temperament: string[];
  interests: string[];
  photos: string[];
  owner: {
    id: string;
    name: string;
    location: string;
  };
}

interface PetSelectionSectionProps {
  pets: Pet[];
  selectedPetA: Pet | null;
  selectedPetB: Pet | null;
  onPetSelect: (pet: Pet, isPetA: boolean) => void;
}

export const PetSelectionSection: React.FC<PetSelectionSectionProps> = ({
  pets,
  selectedPetA,
  selectedPetB,
  onPetSelect,
}) => {
    const theme = useTheme();
    const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;

  const renderPetItem = ({ item }: { item: Pet }) => (
    <TouchableOpacity
      style={[
        styles.petCard,
        { backgroundColor: colors.surface },
        (selectedPetA?.id === item.id || selectedPetB?.id === item.id) &&
          styles.petCardSelected,
      ]}
      onPress={() => {
        if (selectedPetA?.id === item.id) {
          onPetSelect(item, true);
        } else if (selectedPetB?.id === item.id) {
          onPetSelect(item, false);
        } else if (!selectedPetA) {
          onPetSelect(item, true);
        } else if (!selectedPetB) {
          onPetSelect(item, false);
        }
      }}
      testID="PetSelectionSection-button-pet-select"
      accessibilityLabel={`Select pet ${item.name}`}
      accessibilityRole="button"
    >
      <View style={styles.petInfo}>
        <View style={styles.petAvatar}>
          <Text style={[styles.petAvatarText, { color: colors.onSurface }]>
            {item.name.charAt(0)}
          </Text>
        </View>
        <View style={styles.petDetails}>
          <Text style={[styles.petName, { color: colors.onSurface }]>{item.name}</Text>
          <Text style={[styles.petBreed, { color: colors.onMuted }]>
            {item.breed} • {item.age} years old
          </Text>
          <View style={styles.petTags}>
            {item.temperament.slice(0, 2).map((trait, index) => (
              <View key={index} style={[styles.petTag, { backgroundColor: colors.primary }]>
                <Text style={styles.petTagText}>{trait}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      {(selectedPetA?.id === item.id || selectedPetB?.id === item.id) && (
        <View style={styles.selectionIndicator}>
          <Ionicons
            name={selectedPetA?.id === item.id ? "paw" : "heart"}
            size={20}
            color={colors.primary}
          />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.selectionSection}>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]>
        Select Pets to Compare
      </Text>

      <View style={styles.selectionStatus}>
        <View style={styles.selectionItem}>
          <Ionicons
            name="paw"
            size={20}
            color={selectedPetA ? colors.primary : colors.onMuted}
          />
          <Text
            style={[
              styles.selectionText,
              { color: selectedPetA ? colors.onSurface : colors.onMuted },
            ]}
          >
            {selectedPetA ? selectedPetA.name : "Select Pet A"}
          </Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color={colors.onMuted} />
        <View style={styles.selectionItem}>
          <Ionicons
            name="heart"
            size={20}
            color={selectedPetB ? colors.primary : colors.onMuted}
          />
          <Text
            style={[
              styles.selectionText,
              { color: selectedPetB ? colors.onSurface : colors.onMuted },
            ]}
          >
            {selectedPetB ? selectedPetB.name : "Select Pet B"}
          </Text>
        </View>
      </View>

      <FlatList
        data={pets}
        renderItem={renderPetItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        style={styles.petsList}
      />
    </View>
  );
};
