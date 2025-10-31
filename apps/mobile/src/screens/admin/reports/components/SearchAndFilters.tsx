/**
 * Search and Filters Component for Reports
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import type { ReportFilter } from '../types';

interface SearchAndFiltersProps {
  searchQuery: string;
  statusFilter: ReportFilter;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: ReportFilter) => void;
}

export function SearchAndFilters({
  searchQuery,
  statusFilter,
  onSearchChange,
  onFilterChange,
}: SearchAndFiltersProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const filters: Array<{ value: ReportFilter; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewing', label: 'Reviewing' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'dismissed', label: 'Dismissed' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.bg }]}>
        <Ionicons
          name="search"
          size={20}
          color={theme.colors.onMuted}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.onSurface }]}
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search reports..."
          placeholderTextColor={theme.colors.onMuted}
        />
      </View>

      <View style={styles.filterContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterButton,
              {
                backgroundColor: statusFilter === filter.value ? theme.colors.primary : theme.colors.bg,
              },
            ]}
            onPress={() => onFilterChange(filter.value)}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${filter.label}`}
          >
            <Text
              style={[
                styles.filterButtonText,
                {
                  color: statusFilter === filter.value ? theme.colors.onPrimary : theme.colors.onSurface,
                },
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radii.md,
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
      flexWrap: 'wrap',
    },
    filterButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radii.full,
    },
    filterButtonText: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.body.weight,
    },
  });
