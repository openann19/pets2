/**
 * User Search and Filters Component
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';

interface Filter {
  value: string;
  label: string;
}

interface SearchAndFiltersProps {
  searchQuery: string;
  filters: Filter[];
  activeFilter: string;
  onSearchChange: (query: string) => void;
  onFilterChange: (value: string) => void;
}

const FILTER_BUTTON_HIT_SLOP = {
  top: 8,
  bottom: 8,
  left: 12,
  right: 12,
} as const;

export function SearchAndFilters({
  searchQuery,
  filters,
  activeFilter,
  onSearchChange,
  onFilterChange,
}: SearchAndFiltersProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { borderColor: theme.colors.border }]}>
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search users by name or email"
          placeholderTextColor={theme.colors.onMuted}
          style={[styles.searchInput, { color: theme.colors.onSurface }]}
          autoCorrect={false}
          accessibilityRole="search"
        />
      </View>

      <View style={styles.filterRow}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter.value;
          return (
            <TouchableOpacity
              key={filter.value}
              testID={`filter-${filter.value}-button`}
              onPress={() => onFilterChange(filter.value)}
              style={[
                styles.filterButton,
                {
                  backgroundColor: isActive ? theme.colors.primary : 'transparent',
                  borderColor: isActive ? theme.colors.primary : theme.colors.border,
                },
              ]}
              hitSlop={FILTER_BUTTON_HIT_SLOP}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${filter.label}`}
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: isActive ? theme.colors.onPrimary : theme.colors.onSurface },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    searchContainer: {
      borderWidth: 1,
      borderRadius: theme.radii.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    searchInput: {
      fontSize: theme.typography.body.size * 0.9375,
    },
    filterRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    filterButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
      borderWidth: 1,
    },
    filterText: {
      fontSize: theme.typography.body.size * 0.8125,
      fontWeight: theme.typography.h2.weight,
    },
  });

