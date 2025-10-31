/**
 * Playdate Discovery Filters Component
 * Filter UI for finding compatible playmates
 */
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '@/theme';
import type { PlaydateFilters } from '../types';

interface PlaydateFiltersProps {
  filters: PlaydateFilters;
  playStyles: string[];
  energyLevels: number[];
  sizeOptions: readonly ['small', 'medium', 'large'];
  onFilterChange: (filterType: keyof PlaydateFilters, value: any) => void;
  onSearch: () => void;
  loading?: boolean;
}

export const PlaydateFiltersPanel: React.FC<PlaydateFiltersProps> = ({
  filters,
  playStyles,
  energyLevels,
  sizeOptions,
  onFilterChange,
  onSearch,
  loading = false,
}) => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        filtersContainer: {
          margin: theme.spacing.md,
          padding: theme.spacing.md,
          borderRadius: theme.radii.lg,
          backgroundColor: theme.colors.surface,
        },
        filtersTitle: {
          fontSize: 18,
          fontWeight: '600' as const,
          marginBottom: theme.spacing.md,
          color: theme.colors.onSurface,
        },
        filterSection: {
          marginBottom: theme.spacing.md,
        },
        filterLabel: {
          fontSize: 14,
          fontWeight: '500' as const,
          marginBottom: theme.spacing.sm,
          color: theme.colors.onSurface,
        },
        distanceOptions: {
          flexDirection: 'row' as const,
          gap: theme.spacing.sm,
        },
        distanceOption: {
          flex: 1,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radii.md,
          borderWidth: 1,
          alignItems: 'center' as const,
        },
        distanceText: {
          fontSize: 14,
          fontWeight: '500' as const,
        },
        playStyleOptions: {
          flexDirection: 'row' as const,
          flexWrap: 'wrap' as const,
          gap: theme.spacing.sm,
        },
        playStyleChip: {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
          borderRadius: theme.radii.full,
          borderWidth: 1,
        },
        playStyleText: {
          fontSize: 14,
          fontWeight: '500' as const,
        },
        filterRow: {
          flexDirection: 'row' as const,
          gap: theme.spacing.md,
        },
        filterHalf: {
          flex: 1,
        },
        energyOptions: {
          flexDirection: 'row' as const,
          gap: theme.spacing.sm,
        },
        energyDot: {
          width: 32,
          height: 32,
          borderRadius: 16,
        },
        sizeOptions: {
          flexDirection: 'row' as const,
          gap: theme.spacing.sm,
        },
        sizeOption: {
          flex: 1,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radii.md,
          borderWidth: 1,
          alignItems: 'center' as const,
        },
        sizeText: {
          fontSize: 14,
          fontWeight: '500' as const,
        },
        searchButton: {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radii.md,
          alignItems: 'center' as const,
          marginTop: theme.spacing.md,
          backgroundColor: theme.colors.primary,
          opacity: loading ? 0.6 : 1,
        },
        searchButtonText: {
          fontSize: 16,
          fontWeight: '600' as const,
          color: theme.colors.onPrimary,
        },
        loadingButtonContent: {
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
        },
      }),
    [theme, loading],
  );

  return (
    <View style={styles.filtersContainer} testID="filters-container" accessibilityLabel="Filter options for finding playmates">
      <Text style={styles.filtersTitle} accessibilityRole="header">
        Find Playmates
      </Text>

      {/* Distance Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Maximum Distance</Text>
        <View style={styles.distanceOptions}>
          {[1, 5, 10, 25].map((distance) => (
            <TouchableOpacity
              key={distance}
              testID={`distance-filter-${distance}km`}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${distance} kilometers distance`}
              accessibilityState={{ selected: filters.distance === distance }}
              style={[
                styles.distanceOption,
                {
                  backgroundColor: filters.distance === distance ? theme.colors.primary : theme.colors.bg,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => onFilterChange('distance', distance)}
            >
              <Text
                style={[
                  styles.distanceText,
                  {
                    color: filters.distance === distance ? theme.colors.onPrimary : theme.colors.onSurface,
                  },
                ]}
              >
                {distance}km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Play Style Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Play Styles</Text>
        <View style={styles.playStyleOptions}>
          {playStyles.map((style) => {
            const isSelected = filters.playStyles.includes(style);
            return (
              <TouchableOpacity
                key={style}
                testID={`playstyle-filter-${style}`}
                accessibilityRole="checkbox"
                accessibilityLabel={`Filter by ${style} play style`}
                accessibilityState={{ checked: isSelected }}
                style={[
                  styles.playStyleChip,
                  {
                    backgroundColor: isSelected ? theme.colors.primary : theme.colors.bg,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => onFilterChange('playStyles', style)}
              >
                <Text
                  style={[
                    styles.playStyleText,
                    { color: isSelected ? theme.colors.onPrimary : theme.colors.onSurface },
                  ]}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Energy & Size Filters */}
      <View style={styles.filterRow}>
        <View style={styles.filterHalf}>
          <Text style={styles.filterLabel}>Energy Level</Text>
          <View style={styles.energyOptions}>
            {energyLevels.map((level) => (
              <TouchableOpacity
                key={level}
                testID={`energy-filter-${level}`}
                accessibilityRole="button"
                accessibilityLabel={`Filter by energy level ${level} out of 5`}
                accessibilityState={{ selected: filters.energy === level }}
                accessibilityHint="Energy level rating from 1 (low) to 5 (high)"
                style={[
                  styles.energyDot,
                  {
                    backgroundColor: filters.energy === level ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => onFilterChange('energy', level)}
              />
            ))}
          </View>
        </View>

        <View style={styles.filterHalf}>
          <Text style={styles.filterLabel}>Size</Text>
          <View style={styles.sizeOptions}>
            {sizeOptions.map((size) => (
              <TouchableOpacity
                key={size}
                testID={`size-filter-${size}`}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${size} size`}
                accessibilityState={{ selected: filters.size === size }}
                style={[
                  styles.sizeOption,
                  {
                    backgroundColor: filters.size === size ? theme.colors.primary : theme.colors.bg,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => onFilterChange('size', size)}
              >
                <Text
                  style={[
                    styles.sizeText,
                    {
                      color: filters.size === size ? theme.colors.onPrimary : theme.colors.onSurface,
                    },
                  ]}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity
        testID="search-playmates-button"
        accessibilityRole="button"
        accessibilityLabel={loading ? 'Searching for playmates' : 'Search for playmates'}
        accessibilityState={{ disabled: loading }}
        accessibilityHint="Searches for compatible playmates based on selected filters"
        style={styles.searchButton}
        onPress={onSearch}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.loadingButtonContent}>
            <ActivityIndicator size="small" color={theme.colors.onPrimary} />
            <Text style={[styles.searchButtonText, { marginLeft: theme.spacing.sm }]}>Searching...</Text>
          </View>
        ) : (
          <Text style={styles.searchButtonText}>🐾 Find Playmates</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

