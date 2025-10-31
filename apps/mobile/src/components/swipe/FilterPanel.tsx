/**
 * FilterPanel Component
 * Quick filters for pet discovery
 * Extracted from ModernSwipeScreen for better modularity
 */

import { useTheme } from '@/theme';
import { StyleSheet, View } from 'react-native';
import { BodySmall, FXContainerPresets, Heading2 } from '../';
import { EliteButtonPresets } from '../buttons/EliteButton';
import { EliteButton } from '../elite/buttons/EliteButton';

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
  const theme = useTheme();

  const handleBreedChange = (breed: string) => {
    const newBreed = filters.breed === breed ? undefined : breed;
    onFilterChange({
      ...filters,
      breed: newBreed,
      species: 'dog',
    });
  };

  const handleSpeciesChange = (species: string) => {
    const newSpecies = species === 'All' ? undefined : species.toLowerCase();
    onFilterChange({
      ...filters,
      species: newSpecies,
    });
  };

  const styles = createStyles(theme);

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
                variant={filters.breed === breed ? 'primary' : 'ghost'}
                size="sm"
                onPress={() => {
                  handleBreedChange(breed);
                }}
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
                    : 'ghost'
                }
                size="sm"
                onPress={() => {
                  handleSpeciesChange(species);
                }}
              />
            ))}
          </View>
        </View>

        <EliteButtonPresets.holographic
          title="Apply Filters"
          leftIcon="checkmark"
          onPress={() => {
            /* Apply filters */
          }}
        />
      </FXContainerPresets.glass>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      padding: theme.spacing.lg || 32,
    },
    panel: {
      padding: theme.spacing.xl || 48,
    },
    title: {
      marginBottom: theme.spacing.lg || 32,
      textAlign: 'center',
    },
    section: {
      marginBottom: theme.spacing.lg || 32,
    },
    label: {
      marginBottom: theme.spacing.sm || 8,
      fontWeight: '600',
    },
    buttons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm || 8,
    },
  });
