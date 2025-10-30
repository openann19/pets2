/**
 * 🐕 PET SELECTION SECTION
 * Extracted from AICompatibilityScreen
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

interface Pet {
  _id: string;
  name: string;
  photos: string[];
  breed: string;
  age: number;
  species: string;
  owner: {
    _id: string;
    name: string;
  };
}

interface PetSelectionSectionProps {
  selectedPet1: Pet | null;
  selectedPet2: Pet | null;
  availablePets: Pet[];
  colors: {
    card: string;
    text: string;
    textSecondary: string;
    primary: string;
  };
  screenWidth: number;
  onSelectPet1: (pet: Pet | null) => void;
  onSelectPet2: (pet: Pet | null) => void;
}

export function PetSelectionSection({
  selectedPet1,
  selectedPet2,
  availablePets,
  colors,
  screenWidth,
  onSelectPet1,
  onSelectPet2,
}: PetSelectionSectionProps) {
  const renderPetCard = (pet: Pet, isSelected: boolean, onSelect: () => void) => (
    <TouchableOpacity
      style={StyleSheet.flatten([
        styles.petCard,
        { backgroundColor: colors.card },
        isSelected && { borderColor: colors.primary, borderWidth: 2 },
      ])}
      testID="PetSelectionSection-button-2"
      accessibilityLabel="Interactive element"
      accessibilityRole="button"
      onPress={onSelect}
    >
      <Image
        source={{ uri: pet.photos[0] }}
        style={styles.petImage}
      />
      <View style={styles.petInfo}>
        <Text style={StyleSheet.flatten([styles.petName, { color: colors.onSurface }])}>
          {pet.name}
        </Text>
        <Text style={StyleSheet.flatten([styles.petBreed, { color: colors.onMuted }])}>
          {pet.breed}
        </Text>
        <Text style={StyleSheet.flatten([styles.petAge, { color: colors.onMuted }])}>
          {pet.age} years old
        </Text>
        <Text style={StyleSheet.flatten([styles.petOwner, { color: colors.onMuted }])}>
          Owner: {pet.owner.name}
        </Text>
      </View>
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={colors.primary}
          />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.selectionSection}>
      <Text style={StyleSheet.flatten([styles.sectionTitle, { color: colors.onSurface }])}>
        🐕 Select Two Pets
      </Text>
      <Text style={StyleSheet.flatten([styles.sectionDescription, { color: colors.onMuted }])}>
        Choose two pets to analyze their compatibility using AI technology.
      </Text>

      <View style={styles.petSelection}>
        <View style={styles.petColumn}>
          <Text style={StyleSheet.flatten([styles.columnTitle, { color: colors.onSurface }])}>
            Pet 1
          </Text>
          {selectedPet1 ? (
            renderPetCard(selectedPet1, true, () => {
              onSelectPet1(null);
            })
          ) : (
            <View
              style={StyleSheet.flatten([
                styles.placeholderCard,
                { backgroundColor: colors.surface },
              ])}
            >
              <Ionicons
                name="paw"
                size={40}
                color={colors.onMuted}
              />
              <Text style={StyleSheet.flatten([styles.placeholderText, { color: colors.onMuted }])}>
                Select Pet 1
              </Text>
            </View>
          )}
        </View>

        <View style={styles.vsContainer}>
          <Text style={StyleSheet.flatten([styles.vsText, { color: colors.primary }])}>VS</Text>
        </View>

        <View style={styles.petColumn}>
          <Text style={StyleSheet.flatten([styles.columnTitle, { color: colors.onSurface }])}>
            Pet 2
          </Text>
          {selectedPet2 ? (
            renderPetCard(selectedPet2, true, () => {
              onSelectPet2(null);
            })
          ) : (
            <View
              style={StyleSheet.flatten([
                styles.placeholderCard,
                { backgroundColor: colors.surface },
              ])}
            >
              <Ionicons
                name="paw"
                size={40}
                color={colors.onMuted}
              />
              <Text style={StyleSheet.flatten([styles.placeholderText, { color: colors.onMuted }])}>
                Select Pet 2
              </Text>
            </View>
          )}
        </View>
      </View>

      <Text style={StyleSheet.flatten([styles.availablePetsTitle, { color: colors.onSurface }])}>
        Available Pets
      </Text>

      <FlatList
        data={availablePets}
        keyExtractor={(item) => item._id}
        numColumns={2}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const isSelected = selectedPet1?._id === item._id || selectedPet2?._id === item._id;
          const isDisabled: boolean =
            isSelected ||
            Boolean(selectedPet1 && selectedPet2) ||
            Boolean(selectedPet1 && selectedPet1.owner._id === item.owner._id) ||
            Boolean(selectedPet2 && selectedPet2.owner._id === item.owner._id);

          return (
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.availablePetCard,
                { backgroundColor: colors.surface },
                isDisabled && { opacity: 0.5 },
              ])}
              testID="PetSelectionSection-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => {
                if (isDisabled) return;
                if (!selectedPet1) {
                  onSelectPet1(item);
                } else if (!selectedPet2) {
                  onSelectPet2(item);
                }
              }}
              disabled={isDisabled}
            >
              <Image
                source={{ uri: item.photos[0] }}
                style={styles.availablePetImage}
              />
              <Text
                style={StyleSheet.flatten([styles.availablePetName, { color: colors.onSurface }])}
              >
                {item.name}
              </Text>
              <Text
                style={StyleSheet.flatten([styles.availablePetBreed, { color: colors.onMuted }])}
              >
                {item.breed}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  selectionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  petSelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  petColumn: {
    flex: 1,
    alignItems: 'center',
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  petCard: {
    width: '100%',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    position: 'relative',
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  petInfo: {
    alignItems: 'center',
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  petBreed: {
    fontSize: 14,
    marginBottom: 2,
  },
  petAge: {
    fontSize: 12,
    marginBottom: 2,
  },
  petOwner: {
    fontSize: 12,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  placeholderCard: {
    width: '100%',
    height: 150,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 14,
  },
  vsContainer: {
    paddingHorizontal: 20,
  },
  vsText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  availablePetsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  availablePetCard: {
    flex: 1,
    margin: 5,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  availablePetImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  availablePetName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  availablePetBreed: {
    fontSize: 12,
    textAlign: 'center',
  },
});
