/**
 * FilterPanel Component
 * Quick filters for pet discovery
 * Extracted from ModernSwipeScreen for better modularity
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { EliteButton, EliteButtonPresets } from '../EliteButton';
import { FXContainerPresets, Heading2, BodySmall } from '../';
import { Theme } from '../../theme/unified-theme';

export interface FilterPanelProps {
  filters: {
    breed?: string;
    species?: string;
    age?: string;
    size?: string;
  };
  onFilterChange: (filters: FilterPanelProps['filters']) => void;
}

const BREED_OPTIONS = ['Shiba Inu', 'Golden Retriever', 'Labrador', 'Border Collie'];
const SPECIES_OPTIONS = ['All', 'Dogs', 'Cats', 'Birds'];

export function FilterPanel({ filters, onFilterChange }: FilterPanelProps): JSX.Element {
  const handleBreedChange = (breed: string) => {
    onFilterChange({
      ...filters,
      breed: filters.breed === breed ? undefined : breed,
      species: 'dog',
    });
  };

  const handleSpeciesChange = (species: string) => {
    onFilterChange({
      ...filters,
      species: species === 'All' ? undefined : species.toLowerCase(),
    });
  };

  return (
    <View style={styles.container}>
      <FXContainerPresets.glass style={styles.panel}>
        <Heading2 style={styles.title}>Quick Filters</Heading2>

        {/* Breed Filters */}
        <View style={styles.section}>
          <BodySmall style={styles.label}>Popular Breeds:</BodySmall>
          <View style={styles.buttons}>
            {BREED_OPTIONS.map((breed) => (
              <EliteButton
                key={breed}
                title={breed}
                variant={filters.breed === breed ? 'primary' : 'outline'}
                size="sm"
                onPress={() => handleBreedChange(breed)}
              />
            ))}
          </View>
        </View>

        {/* Species Filters */}
        <View style={styles.section}>
          <BodySmall style={styles.label}>Species:</BodySmall>
          <View style={styles.buttons}>
            {SPECIES_OPTIONS.map((species) => (
              <EliteButton
                key={species}
                title={species}
                variant={
                  (species === 'All' ? '' : species.toLowerCase()) === filters.species
                    ? 'secondary'
                    : 'outline'
                }
                size="sm"
                onPress={() => handleSpeciesChange(species)}
              />
            ))}
          </View>
        </View>

        <EliteButtonPresets.holographic
          title="Apply Filters"
          leftIcon="checkmark"
          onPress={() => {/* Apply filters */}}
        />
      </FXContainerPresets.glass>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.lg,
  },
  panel: {
    padding: Theme.spacing.xl,
  },
  title: {
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  section: {
    marginBottom: Theme.spacing.lg,
  },
  label: {
    marginBottom: Theme.spacing.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
});

