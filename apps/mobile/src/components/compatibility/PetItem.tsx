/**
 * PetItem Component
 * Displays a pet card in the compatibility selection list
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

export interface Pet {
  _id: string;
  name: string;
  breed: string;
  age?: number;
  temperament?: string[];
  photos?: string[];
  owner?: {
    _id: string;
    name: string;
  };
}

interface PetItemProps {
  pet: Pet;
  isSelected: boolean;
  selectionType?: 'petA' | 'petB';
  onPress: (pet: Pet) => void;
  testID?: string;
}

const createStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    petCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      borderRadius: theme.radii.lg,
      marginBottom: theme.spacing.sm,
      shadowColor: theme.colors.border,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    petCardSelected: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    petInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    petAvatar: {
      width: 48,
      height: 48,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },
    petAvatarText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    petDetails: {
      flex: 1,
    },
    petName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
      color: theme.colors.onSurface,
    },
    petBreed: {
      fontSize: 14,
      marginBottom: 4,
      color: theme.colors.onMuted,
    },
    petTags: {
      flexDirection: 'row',
      gap: 6,
      flexWrap: 'wrap',
    },
    petTag: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      backgroundColor: theme.colors.primary,
    },
    petTagText: {
      color: theme.colors.onSurface,
      fontSize: 10,
      fontWeight: '600',
    },
    selectionIndicator: {
      padding: theme.spacing.xs,
    },
  });
};

export const PetItem: React.FC<PetItemProps> = ({
  pet,
  isSelected,
  selectionType,
  onPress,
  testID,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const iconName = selectionType === 'petA' ? 'paw' : 'heart';

  return (
    <TouchableOpacity
      style={[
        styles.petCard,
        { backgroundColor: theme.colors.surface },
        isSelected && styles.petCardSelected,
      ]}
      onPress={() => onPress(pet)}
      testID={testID || 'pet-item'}
      accessibilityLabel={`Select ${pet.name}`}
      accessibilityRole="button"
    >
      <View style={styles.petInfo}>
        <View style={styles.petAvatar}>
          <Text style={styles.petAvatarText}>{pet.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.petDetails}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petBreed}>
            {pet.breed} {pet.age ? `• ${pet.age} years old` : ''}
          </Text>
          {pet.temperament && pet.temperament.length > 0 && (
            <View style={styles.petTags}>
              {pet.temperament.slice(0, 2).map((trait, index) => (
                <View key={index} style={styles.petTag}>
                  <Text style={styles.petTagText}>{trait}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
      {isSelected && (
        <View style={styles.selectionIndicator}>
          <Ionicons name={iconName} size={20} color={theme.colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

