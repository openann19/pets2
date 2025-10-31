/**
 * MessageSearchHeader Component
 * Header with search input and close button
 */

import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface MessageSearchHeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
  onClose: () => void;
}

export function MessageSearchHeader({
  query,
  onQueryChange,
  onClose,
}: MessageSearchHeaderProps): React.JSX.Element {
  const theme = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: theme.spacing.md,
          borderBottomWidth: 1,
          gap: theme.spacing.md,
        },
        searchInputContainer: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.full,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          gap: theme.spacing.sm,
        },
        searchIcon: {
          marginRight: theme.spacing.xs,
        },
        searchInput: {
          flex: 1,
          fontSize: 16,
        },
        clearButton: {
          padding: theme.spacing.xs,
        },
        closeButton: {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
        },
        closeText: {
          fontSize: 16,
          fontWeight: '600',
        },
      }),
    [theme],
  );

  return (
    <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color={theme.colors.onMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.onSurface }]}
          placeholder="Search messages..."
          placeholderTextColor={theme.colors.onMuted}
          value={query}
          onChangeText={onQueryChange}
          autoFocus
          returnKeyType="search"
          accessibilityRole="searchbox"
          accessibilityLabel="Search messages"
          accessibilityHint="Type to search for messages in this conversation"
          allowFontScaling
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => onQueryChange('')}
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            accessibilityHint="Tap to clear search query"
            hitSlop={{ top: 11, bottom: 11, left: 11, right: 11 }}
          >
            <Ionicons name="close-circle" size={20} color={theme.colors.onMuted} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        onPress={onClose}
        style={styles.closeButton}
        accessibilityRole="button"
        accessibilityLabel="Close search"
        accessibilityHint="Tap to close search and return to chat"
        hitSlop={{ top: 11, bottom: 11, left: 11, right: 11 }}
      >
        <Text style={[styles.closeText, { color: theme.colors.primary }]} allowFontScaling>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

