import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
  const { colors } = useTheme();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={StyleSheet.flatten([
          styles.modalContainer,
          { backgroundColor: colors.bg },
        ])}
      >
        <View
          style={StyleSheet.flatten([
            styles.modalContent,
            { backgroundColor: colors.bgElevated },
          ])}
        >
          <View style={styles.modalHeader}>
            <Text
              style={StyleSheet.flatten([
                styles.modalTitle,
                { color: colors.onSurface},
              ])}
            >
              Filter Preferences
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.onSurface />
            </TouchableOpacity>
          </View>

          {/* Species Filter */}
          <View style={styles.filterSection}>
            <Text
              style={StyleSheet.flatten([
                styles.sectionTitle,
                { color: colors.onSurface},
              ])}
            >
              Species
            </Text>
            <View style={styles.speciesGrid}>
              {["dog", "cat", "bird", "rabbit", "reptile", "small-animal"].map(
                (species) => (
                  <TouchableOpacity
                    key={species}
                    style={StyleSheet.flatten([
                      styles.speciesButton,
                      {
                        backgroundColor: filters.species.includes(species)
                          ? colors.primary
                          : colors.bgElevated,
                        borderColor: colors.border,
                      },
                    ])}
                    onPress={() => {
                      const updated = filters.species.includes(species)
                        ? filters.species.filter((s) => s !== species)
                        : [...filters.species, species];
                      onFiltersChange({ ...filters, species: updated });
                    }}
                  >
                    <Text
                      style={StyleSheet.flatten([
                        styles.speciesText,
                        {
                          color: filters.species.includes(species)
                            ? "white"
                            : colors.onSurface
                        },
                      ])}
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
              style={StyleSheet.flatten([
                styles.sectionTitle,
                { color: colors.onSurface},
              ])}
            >
              Age Range
            </Text>
            {/* Age slider implementation would go here */}
          </View>

          {/* Verified Only */}
          <View style={styles.filterSection}>
            <View style={styles.switchRow}>
              <Text
                style={StyleSheet.flatten([
                  styles.switchLabel,
                  { color: colors.onSurface},
                ])}
              >
                Verified Profiles Only
              </Text>
              <Switch
                value={filters.onlyVerified}
                onValueChange={(value) => {
                  onFiltersChange({ ...filters, onlyVerified: value });
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={filters.onlyVerified ? "white" : "#f4f3f4"}
              />
            </View>
          </View>

          <TouchableOpacity
            style={StyleSheet.flatten([
              styles.applyButton,
              { backgroundColor: colors.primary },
            ])}
            onPress={onClose}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  filterSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  speciesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  speciesButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  speciesText: {
    fontSize: 14,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchLabel: {
    fontSize: 16,
  },
  applyButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  applyButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default SwipeFilters;
