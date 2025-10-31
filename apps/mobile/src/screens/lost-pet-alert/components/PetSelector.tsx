/**
 * Pet Selector Component
 * Horizontal scrollable pet selection
 */
import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme';

interface Pet {
  _id: string;
  name: string;
  breed?: string;
  species?: string;
}

interface PetSelectorProps {
  pets: Pet[];
  selectedPet: Pet | null;
  onSelectPet: (pet: Pet) => void;
}

export const PetSelector: React.FC<PetSelectorProps> = ({ pets, selectedPet, onSelectPet }) => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        petSelector: {
          marginBottom: theme.spacing.md,
        },
        selectorTitle: {
          fontSize: 16,
          fontWeight: '600' as const,
          marginBottom: theme.spacing.sm,
          color: theme.colors.onSurface,
        },
        petList: {
          flexDirection: 'row' as const,
        },
        petCard: {
          width: 100,
          padding: theme.spacing.md,
          borderRadius: theme.radii.md,
          borderWidth: 2,
          marginRight: theme.spacing.sm,
          alignItems: 'center' as const,
        },
        petName: {
          fontSize: 14,
          fontWeight: '600' as const,
          textAlign: 'center' as const,
        },
        petBreed: {
          fontSize: 12,
          textAlign: 'center' as const,
          marginTop: 2,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.petSelector}>
      <Text style={styles.selectorTitle}>Select Pet</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petList}>
        {pets.map((pet) => (
          <TouchableOpacity
            key={pet._id}
            style={[
              styles.petCard,
              {
                backgroundColor:
                  selectedPet?._id === pet._id ? theme.colors.primary : theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => onSelectPet(pet)}
          >
            <Text
              style={[
                styles.petName,
                {
                  color:
                    selectedPet?._id === pet._id ? theme.colors.onPrimary : theme.colors.onSurface,
                },
              ]}
            >
              {pet.name}
            </Text>
            <Text
              style={[
                styles.petBreed,
                {
                  color:
                    selectedPet?._id === pet._id ? theme.colors.onPrimary : theme.colors.onMuted,
                },
              ]}
            >
              {pet.breed || pet.species}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

