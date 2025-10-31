/**
 * Search and Filters Component
 * Displays search input and filter buttons for verifications
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { VerificationFilter } from '../types';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      marginStart: theme.spacing.sm,
      fontSize: 16,
    },
    filterContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    filterButtonText: {
      fontSize: 14,
      fontWeight: '500',
    },
  });
}

interface SearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: VerificationFilter;
  onFilterChange: (filter: VerificationFilter) => void;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors } = theme;

  const renderFilterButton = (filterType: VerificationFilter, label: string) => (
    <TouchableOpacity
      key={filterType}
      style={[
        styles.filterButton,
        {
          backgroundColor: filter === filterType ? colors.primary : colors.surface,
        },
      ]}
      onPress={() => onFilterChange(filterType)}
      testID={`filter-${filterType}`}
      accessibilityLabel={`Filter by ${label}`}
      accessibilityRole="button"
      accessibilityState={{ selected: filter === filterType }}
    >
      <Text
        style={[
          styles.filterButtonText,
          { color: filter === filterType ? colors.onPrimary : colors.onSurface },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.searchInputContainer, { backgroundColor: colors.bg }]}>
        <Ionicons
          name="search"
          size={20}
          color={colors.onMuted}
        />
        <TextInput
          style={[styles.searchInput, { color: colors.onSurface }]}
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search verifications..."
          placeholderTextColor={colors.onMuted}
          testID="search-input"
          accessibilityLabel="Search verifications"
        />
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton('pending', 'Pending')}
        {renderFilterButton('high_priority', 'High Priority')}
        {renderFilterButton('all', 'All')}
      </View>
    </View>
  );
};

