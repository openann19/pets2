import React, { useCallback } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { EliteButton, FadeInUp } from "../EliteComponents";
import { GlassContainer } from "../GlassMorphism";
import PremiumTypography from "../PremiumTypography";
import type { SwipeFilters as SwipeFiltersType } from "../../hooks/useSwipeData";

const { PremiumBody } = PremiumTypography;

interface SwipeFiltersProps {
  filters: SwipeFiltersType;
  onFiltersChange: (filters: SwipeFiltersType) => void;
  onApplyFilters: () => void;
}

export function SwipeFilters({
  filters,
  onFiltersChange,
  onApplyFilters,
}: SwipeFiltersProps) {
  const handleBreedPress = useCallback(
    (breed: string) => {
      onFiltersChange({
        ...filters,
        breed: filters.breed === breed ? "" : breed,
        species: "dog",
      });
    },
    [filters, onFiltersChange],
  );

  const handleSpeciesPress = useCallback(
    (species: string) => {
      onFiltersChange({
        ...filters,
        species: species === "All" ? "" : species.toLowerCase(),
      });
    },
    [filters, onFiltersChange],
  );

  return (
    <FadeInUp delay={0}>
      <GlassContainer
        intensity="medium"
        transparency="medium"
        border="light"
        shadow="medium"
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterContent}>
            {/* Quick Breed Filters */}
            <PremiumBody size="sm" weight="semibold" gradient="primary">
              Popular Breeds:
            </PremiumBody>
            <View style={styles.breedFilters}>
              {[
                "Shiba Inu",
                "Golden Retriever",
                "Labrador",
                "Border Collie",
              ].map((breed) => (
                <EliteButton
                  key={breed}
                  title={breed}
                  variant={filters.breed === breed ? "primary" : "glass"}
                  size="sm"
                  magnetic={true}
                  ripple={true}
                  glow={filters.breed === breed}
                  onPress={() => {
                    handleBreedPress(breed);
                  }}
                />
              ))}
            </View>

            {/* Species Filter */}
            <View style={styles.speciesFilters}>
              {["All", "Dogs", "Cats", "Birds"].map((species) => (
                <EliteButton
                  key={species}
                  title={species}
                  variant={
                    (species === "All" ? "" : species.toLowerCase()) ===
                    filters.species
                      ? "secondary"
                      : "glass"
                  }
                  size="sm"
                  magnetic={true}
                  ripple={true}
                  glow={
                    (species === "All" ? "" : species.toLowerCase()) ===
                    filters.species
                  }
                  onPress={() => {
                    handleSpeciesPress(species);
                  }}
                />
              ))}
            </View>

            {/* Apply Button */}
            <EliteButton
              title="Apply Filters"
              variant="primary"
              size="md"
              icon="checkmark"
              magnetic={true}
              ripple={true}
              glow={true}
              shimmer={true}
              onPress={onApplyFilters}
            />
          </View>
        </ScrollView>
      </GlassContainer>
    </FadeInUp>
  );
}

const styles = StyleSheet.create({
  filterContent: {
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  breedFilters: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  speciesFilters: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 6,
  },
});
