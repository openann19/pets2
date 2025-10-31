/**
 * Search and Filters Section Component
 * Provides search input and filter buttons
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { UploadFilter } from '../types';

interface SearchAndFiltersSectionProps {
  searchQuery: string;
  filter: UploadFilter;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: UploadFilter) => void;
}

export const SearchAndFiltersSection = ({
  searchQuery,
  filter,
  onSearchChange,
  onFilterChange,
}: SearchAndFiltersSectionProps): React.JSX.Element => {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.bg }]}>
        <Ionicons
          name="search"
          size={20}
          color={theme.colors.onMuted}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.onSurface }]}
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search uploads..."
          placeholderTextColor={theme.colors.onMuted}
        />
      </View>

      <View style={styles.filterContainer}>
        {(['pending', 'flagged', 'all'] as UploadFilter[]).map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  filter === filterType ? theme.colors.primary : theme.colors.surface,
              },
            ]}
            testID={`SearchAndFiltersSection-button-${filterType}`}
            accessibilityLabel={`Filter uploads: ${filterType}`}
            accessibilityRole="button"
            onPress={() => onFilterChange(filterType)}
          >
            <Text
              style={[
                styles.filterButtonText,
                {
                  color:
                    filter === filterType ? theme.colors.onPrimary : theme.colors.onSurface,
                },
              ]}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radii.sm,
      marginBottom: theme.spacing.md,
    },
    searchInput: {
      flex: 1,
      marginStart: theme.spacing.sm,
      fontSize: theme.typography.body.size,
    },
    filterContainer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    filterButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radii.full,
    },
    filterButtonText: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.h2.weight,
    },
  });

