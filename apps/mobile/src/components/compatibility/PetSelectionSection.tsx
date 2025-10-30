import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { Pet } from '../../hooks/screens/useAICompatibility';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

function createStyles(theme: AppTheme) {
  const neutralFill = theme.palette.neutral?.[200] ?? theme.colors.surface;

  return StyleSheet.create({
    selectionSection: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    selectionStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
      gap: theme.spacing.md,
    },
    selectionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    selectionText: {
      fontSize: theme.typography.body.size,
      fontWeight: '600',
    },
    petsList: {
      maxHeight: 300,
    },
    petCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: theme.spacing.sm,
    },
    petAvatar: {
      width: theme.spacing['3xl'],
      height: theme.spacing['3xl'],
      borderRadius: theme.radii.full,
      backgroundColor: neutralFill,
      justifyContent: 'center',
      alignItems: 'center',
    },
    petAvatarText: {
      fontSize: theme.typography.h2.size,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    petDetails: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    petName: {
      fontSize: theme.typography.body.size,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    petBreed: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
    },
    petTags: {
      flexDirection: 'row',
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
      fontWeight: '600',
    },
    selectionIndicator: {
      padding: theme.spacing.xs,
    },
  });
}

interface PetSelectionSectionProps {
  selectedPetA: Pet | null;
  selectedPetB: Pet | null;
  pets: Pet[];
  handlePetSelection: (pet: Pet, isPetA: boolean) => void;
}

export const PetSelectionSection = ({
  selectedPetA,
  selectedPetB,
  pets,
  handlePetSelection,
}: PetSelectionSectionProps): React.JSX.Element => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;

  const renderPetItem = ({ item }: { item: Pet }) => (
    <TouchableOpacity
      style={[
        styles.petCard,
        (selectedPetA?.id === item.id || selectedPetB?.id === item.id) && styles.petCardSelected,
      ]}
      testID="PetSelection-item"
      accessibilityLabel={`Select ${item.name} for compatibility analysis`}
      accessibilityRole="button"
      onPress={() => {
        if (selectedPetA?.id === item.id) {
          handlePetSelection(item, true);
        } else if (selectedPetB?.id === item.id) {
          handlePetSelection(item, false);
        } else if (!selectedPetA) {
          handlePetSelection(item, true);
        } else if (!selectedPetB) {
          handlePetSelection(item, false);
        }
      }}
    >
      <View style={styles.petInfo}>
        <View style={styles.petAvatar}>
          <Text style={styles.petAvatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.petDetails}>
          <Text style={styles.petName}>{item.name}</Text>
          <Text style={styles.petBreed}>
            {item.breed} • {item.age} years old
          </Text>
          <View style={styles.petTags}>
            {item.temperament.slice(0, 2).map((trait, index) => (
              <View
                key={index}
                style={styles.petTag}
              >
                <Text style={styles.petTagText}>{trait}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      {(selectedPetA?.id === item.id || selectedPetB?.id === item.id) && (
        <View style={styles.selectionIndicator}>
          <Ionicons
            name={selectedPetA?.id === item.id ? 'paw' : 'heart'}
            size={20}
            color={colors.primary}
          />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.selectionSection}>
      <Text style={styles.sectionTitle}>Select Pets to Compare</Text>

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
            {selectedPetA ? selectedPetA.name : 'Select Pet A'}
          </Text>
        </View>
        <Ionicons
          name="arrow-forward"
          size={20}
          color={colors.onMuted}
        />
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
            {selectedPetB ? selectedPetB.name : 'Select Pet B'}
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
