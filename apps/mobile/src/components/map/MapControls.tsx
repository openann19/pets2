import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from '../../theme/unified-theme';

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
}) => (
  <View style={styles.fabs}>
    <TouchableOpacity
      style={[styles.fab, styles.fabLocate]}
      testID="fab-locate"
      accessibilityLabel="Locate"
      accessibilityRole="button"
      onPress={onLocatePress}
    >
      <Text style={styles.fabText}>📍</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.fab, styles.fabAR]}
      testID="fab-ar"
      accessibilityLabel="AR View"
      accessibilityRole="button"
      onPress={onARPress}
    >
      <Text style={styles.fabText}>👁️</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.fab, styles.fabCreate]}
      testID="fab-create-activity"
      accessibilityLabel="Create Activity"
      accessibilityRole="button"
      onPress={onCreatePress}
    >
      <Ionicons name="add" size={20} color="#fff" />
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.fab, styles.fabFilters]}
      testID="btn-filters"
      accessibilityLabel="Filters"
      accessibilityRole="button"
      onPress={onFilterPress}
    >
      <Text style={styles.fabText}>⚙️</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  fabs: { 
    position: "absolute", 
    right: 12, 
    bottom: 24, 
    gap: 10 
  },
  fab: {
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    alignItems: "center", 
    justifyContent: "center",
    shadowColor: "#000", 
    shadowOpacity: 0.15, 
    shadowRadius: 8, 
    elevation: 6,
  },
  fabLocate: { backgroundColor: "#fff" },
  fabAR: { backgroundColor: Theme.colors.primary[500] },
  fabCreate: { backgroundColor: Theme.colors.status.success },
  fabFilters: { backgroundColor: Theme.colors.secondary[500] },
  fabText: { fontSize: 20 },
});
