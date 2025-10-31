/**
 * Filter Item Component
 * Individual filter option in Advanced Filters screen
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@mobile/theme';

export interface FilterOption {
  id: string;
  label: string;
  value: boolean;
  category: string;
}

interface FilterItemProps {
  filter: FilterOption;
  onToggle: (filterId: string) => void;
}

export function FilterItem({ filter, onToggle }: FilterItemProps): React.JSX.Element {
  const theme = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        filterCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.md,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.sm,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        filterCardActive: {
          backgroundColor: theme.colors.primary + '20',
          borderColor: theme.colors.primary,
        },
        filterBlur: {
          borderRadius: theme.radii.md,
          padding: theme.spacing.md,
        },
        filterContent: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        filterLabel: {
          fontSize: 16,
          color: theme.colors.onSurface,
          flex: 1,
        },
        filterLabelActive: {
          color: theme.colors.primary,
          fontWeight: '600',
        },
        checkbox: {
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: theme.colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        },
        checkboxActive: {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        },
      }),
    [theme],
  );

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => {});
    onToggle(filter.id);
  };

  return (
    <TouchableOpacity
      style={[styles.filterCard, filter.value && styles.filterCardActive]}
      testID={`filter-${filter.id}`}
      accessibilityLabel={`Filter: ${filter.label}`}
      accessibilityRole="button"
      accessibilityState={{ selected: filter.value }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      onPress={handlePress}
    >
      <BlurView intensity={filter.value ? 25 : 15} style={styles.filterBlur}>
        <View style={styles.filterContent}>
          <Text style={[styles.filterLabel, filter.value && styles.filterLabelActive]}>
            {filter.label}
          </Text>
          <View style={[styles.checkbox, filter.value && styles.checkboxActive]}>
            {filter.value && (
              <Ionicons name="checkmark" size={16} color={theme.colors.onSurface} />
            )}
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

