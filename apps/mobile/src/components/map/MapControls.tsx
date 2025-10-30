import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { FABBloom } from '../micro/FABBloom';

interface MapControlsProps {
  onLocatePress: () => void;
  onARPress: () => void;
  onCreatePress: () => void;
  onFilterPress: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onLocatePress,
  onARPress,
  onCreatePress,
  onFilterPress,
}) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    fabs: {
      position: 'absolute',
      right: theme.spacing.md,
      bottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    fab: {
      width: 44,
      height: 44,
      borderRadius: theme.radii.full,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.border,
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    fabLocate: { backgroundColor: theme.colors.surface },
    fabAR: { backgroundColor: theme.colors.primary },
    fabCreate: { backgroundColor: theme.colors.success },
    fabFilters: { backgroundColor: theme.colors.info },
    fabText: { fontSize: theme.typography.body.size + 4 },
  });

  return (
    <View style={styles.fabs}>
      <FABBloom
        onPress={onLocatePress}
        style={StyleSheet.flatten([styles.fab, styles.fabLocate]) as any}
        testID="fab-locate"
        accessibilityLabel="Locate"
      >
        <Text style={styles.fabText}>📍</Text>
      </FABBloom>

      <FABBloom
        onPress={onARPress}
        style={StyleSheet.flatten([styles.fab, styles.fabAR]) as any}
        testID="fab-ar"
        accessibilityLabel="AR View"
      >
        <Text style={styles.fabText}>👁️</Text>
      </FABBloom>

      <FABBloom
        onPress={onCreatePress}
        style={StyleSheet.flatten([styles.fab, styles.fabCreate]) as any}
        testID="fab-create-activity"
        accessibilityLabel="Create Activity"
      >
        <Ionicons
          name="add"
          size={20}
          color={theme.colors.onSurface}
        />
      </FABBloom>

      <FABBloom
        onPress={onFilterPress}
        style={StyleSheet.flatten([styles.fab, styles.fabFilters]) as any}
        testID="btn-filters"
        accessibilityLabel="Filters"
      >
        <Text style={styles.fabText}>⚙️</Text>
      </FABBloom>
    </View>
  );
};
