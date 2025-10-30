import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Modal,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { AppTheme } from "@/theme";
import { useTheme } from "@/theme";

interface SwipeFiltersProps {
  visible: boolean;
  onClose: () => void;
  filters: {
    species: string[];
    ageRange: { min: number; max: number };
    distance: number;
    onlyVerified: boolean;
  };
  onFiltersChange: (newFilters: unknown) => void;
}

const SwipeFilters: React.FC<SwipeFiltersProps> = ({
  visible,
  onClose,
  filters,
  onFiltersChange,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.modalContainer,
          { backgroundColor: theme.colors.bg },
        ]}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text
              style={[
                styles.modalTitle,
                { color: theme.colors.onSurface },
              ]}
            >
              Filter Preferences
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Species Filter */}
          <View style={styles.filterSection}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.onSurface },
              ]}
            >
              Species
            </Text>
            <View style={styles.speciesGrid}>
              {["dog", "cat", "bird", "rabbit", "reptile", "small-animal"].map(
                (species) => (
                  <TouchableOpacity
                    key={species}
                    style={[
                      styles.speciesButton,
                      {
                        backgroundColor: filters.species.includes(species)
                          ? theme.colors.primary
                          : theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() =>{
                      const updated = filters.species.includes(species)
                        ? filters.species.filter((s) => s !== species)
                        : [...filters.species, species];
                      onFiltersChange({ ...filters, species: updated });
                    }}
                  >
                    <Text
                      style={[
                        styles.speciesText,
                        {
                          color: filters.species.includes(species)
                            ? theme.colors.onPrimary
                            : theme.colors.onSurface
                        },
                      ]}
                    >
                      {species.charAt(0).toUpperCase() + species.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>
          </View>

          {/* Age Range Filter */}
          <View style={styles.filterSection}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.onSurface },
              ]}
            >
              Age Range
            </Text>
            {/* Age slider implementation would go here */}
          </View>

          {/* Verified Only */}
          <View style={styles.filterSection}>
            <View style={styles.switchRow}>
              <Text
                style={[
                  styles.switchLabel,
                  { color: theme.colors.onSurface },
                ]}
              >
                Verified Profiles Only
              </Text>
              <Switch
                value={filters.onlyVerified}
                onValueChange={(value) => {
                  onFiltersChange({ ...filters, onlyVerified: value });
                }}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={filters.onlyVerified ? theme.colors.onPrimary : theme.colors.surface}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.applyButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={onClose}
          >
            <Text style={[styles.applyButtonText, { color: theme.colors.onPrimary }]}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
      borderTopLeftRadius: theme.radii['2xl'],
      borderTopRightRadius: theme.radii['2xl'],
      padding: theme.spacing['2xl'],
      minHeight: "50%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing['2xl'],
    },
    modalTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
    },
    filterSection: {
      marginBottom: theme.spacing['2xl'],
    },
    sectionTitle: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.md,
    },
    speciesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.spacing.md,
    },
    speciesButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radii.full,
      borderWidth: 1,
    },
    speciesText: {
      fontSize: theme.typography.body.size * 0.875,
    },
    switchRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    switchLabel: {
      fontSize: theme.typography.body.size,
    },
    applyButton: {
      padding: theme.spacing.md,
      borderRadius: theme.radii.lg,
      alignItems: "center",
      marginTop: theme.spacing.md,
    },
    applyButtonText: {
      fontWeight: theme.typography.h1.weight,
      fontSize: theme.typography.body.size,
    },
  });
}

export default SwipeFilters;
