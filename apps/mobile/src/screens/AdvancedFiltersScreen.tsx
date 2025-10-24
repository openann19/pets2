import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

interface AdvancedFiltersScreenProps {
  navigation: {
    goBack: () => void;
  };
}

interface FilterOption {
  id: string;
  label: string;
  value: boolean;
  category: string;
}

function AdvancedFiltersScreen({
  navigation,
}: AdvancedFiltersScreenProps): JSX.Element {
  const [filters, setFilters] = useState<FilterOption[]>([
    // Pet Characteristics
    {
      id: "neutered",
      label: "Neutered/Spayed Only",
      value: false,
      category: "characteristics",
    },
    {
      id: "vaccinated",
      label: "Fully Vaccinated",
      value: true,
      category: "characteristics",
    },
    {
      id: "microchipped",
      label: "Microchipped",
      value: false,
      category: "characteristics",
    },
    {
      id: "house_trained",
      label: "House Trained",
      value: true,
      category: "characteristics",
    },

    // Size Preferences
    {
      id: "small_only",
      label: "Small Dogs Only",
      value: false,
      category: "size",
    },
    {
      id: "medium_only",
      label: "Medium Dogs Only",
      value: false,
      category: "size",
    },
    {
      id: "large_only",
      label: "Large Dogs Only",
      value: false,
      category: "size",
    },

    // Energy Level
    {
      id: "low_energy",
      label: "Low Energy Pets",
      value: false,
      category: "energy",
    },
    {
      id: "high_energy",
      label: "High Energy Pets",
      value: true,
      category: "energy",
    },

    // Special Needs
    {
      id: "special_needs",
      label: "Include Special Needs Pets",
      value: true,
      category: "special",
    },
    {
      id: "senior_pets",
      label: "Include Senior Pets (7+ years)",
      value: true,
      category: "special",
    },
    {
      id: "rescue_pets",
      label: "Rescue Pets Only",
      value: false,
      category: "special",
    },
  ]);

  const toggleFilter = useCallback((filterId: string) => {
    Haptics.selectionAsync().catch(() => {});
    setFilters((prev) =>
      prev.map((filter) =>
        filter.id === filterId ? { ...filter, value: !filter.value } : filter,
      ),
    );
  }, []);

  const resetFilters = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert(
      "Reset Filters",
      "Are you sure you want to reset all advanced filters?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setFilters((prev) =>
              prev.map((filter) => ({ ...filter, value: false })),
            );
          },
        },
      ],
    );
  }, []);

  const saveFilters = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    Alert.alert("Success", "Advanced filters saved successfully!");
  }, []);

  const getFiltersByCategory = useCallback(
    (category: string) => {
      return filters.filter((filter) => filter.category === category);
    },
    [filters],
  );

  const renderCategory = useCallback(
    (category: string, title: string) => {
      const categoryFilters = getFiltersByCategory(category);

      return (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{title}</Text>
          {categoryFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterCard,
                filter.value && styles.filterCardActive,
              ]}
              onPress={() => {
                toggleFilter(filter.id);
              }}
            >
              <BlurView
                intensity={filter.value ? 25 : 15}
                style={styles.filterBlur}
              >
                <View style={styles.filterContent}>
                  <Text
                    style={[
                      styles.filterLabel,
                      filter.value && styles.filterLabelActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                  <View
                    style={[
                      styles.checkbox,
                      filter.value && styles.checkboxActive,
                    ]}
                  >
                    {filter.value && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                </View>
              </BlurView>
            </TouchableOpacity>
          ))}
        </View>
      );
    },
    [getFiltersByCategory, toggleFilter],
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#667eea", "#764ba2", "#667eea"]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                () => {},
              );
              navigation.goBack();
            }}
          >
            <BlurView intensity={20} style={styles.backButtonBlur}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Advanced Filters</Text>
          <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <BlurView intensity={10} style={styles.infoCard}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#3B82F6"
            />
            <Text style={styles.infoText}>
              Advanced filters help you find pets that match your specific
              preferences and lifestyle.
            </Text>
          </BlurView>

          {renderCategory("characteristics", "Pet Characteristics")}
          {renderCategory("size", "Size Preferences")}
          {renderCategory("energy", "Energy Level")}
          {renderCategory("special", "Special Considerations")}

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={saveFilters}>
            <BlurView intensity={20} style={styles.saveButtonBlur}>
              <Ionicons name="save-outline" size={20} color="white" />
              <Text style={styles.saveButtonText}>Save Filters</Text>
            </BlurView>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  backButtonBlur: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  resetButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "white",
    lineHeight: 20,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
  },
  filterCard: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  filterCardActive: {
    transform: [{ scale: 1.02 }],
  },
  filterBlur: {
    padding: 16,
  },
  filterContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterLabel: {
    fontSize: 16,
    color: "white",
    flex: 1,
  },
  filterLabelActive: {
    fontWeight: "600",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  saveButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 16,
    marginBottom: 32,
  },
  saveButtonBlur: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AdvancedFiltersScreen;
