/**
 * Search and Filters Component for Chat Moderation
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { ChatFilter } from '../types';

interface SearchAndFiltersProps {
  searchQuery: string;
  filter: ChatFilter;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: ChatFilter) => void;
}

export function SearchAndFilters({
  searchQuery,
  filter,
  onSearchChange,
  onFilterChange,
}: SearchAndFiltersProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const renderFilterButton = (filterType: ChatFilter, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor: filter === filterType ? theme.colors.primary : theme.colors.surface,
        },
      ]}
      testID={`AdminChatsScreen-filter-${filterType}`}
      accessibilityLabel={`Filter by ${label}`}
      accessibilityRole="button"
      onPress={() => onFilterChange(filterType)}
    >
      <Text
        style={[
          styles.filterButtonText,
          {
            color: filter === filterType ? theme.colors.onPrimary : theme.colors.onSurface,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

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
          placeholder="Search messages..."
          placeholderTextColor={theme.colors.onMuted}
        />
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton('flagged', 'Flagged')}
        {renderFilterButton('unreviewed', 'Unreviewed')}
        {renderFilterButton('all', 'All')}
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

