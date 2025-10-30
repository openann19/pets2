import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import {
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
import { useAdvancedFiltersScreen } from "../hooks/screens/useAdvancedFiltersScreen";
import { useTheme } from "@mobile/theme";

interface AdvancedFiltersScreenProps {
  navigation: {
    goBack: () => void;
  };
}

function AdvancedFiltersScreen({
  navigation,
}: AdvancedFiltersScreenProps): React.JSX.Element {
  const theme = useTheme();
  const {
    toggleFilter,
    resetFilters,
    saveFilters,
    getFiltersByCategory,
  } = useAdvancedFiltersScreen();
  
  const styles = makeStyles(theme);

  const renderCategory = useCallback(
    (category: string, title: string) => {
      const categoryFilters = getFiltersByCategory(category);

      return (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{title}</Text>
          {categoryFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={StyleSheet.flatten([
                styles.filterCard,
                filter.value && styles.filterCardActive,
              ])}
              testID={`filter-${filter.id}`}
              accessibilityLabel={`Filter: ${filter.label}`}
              accessibilityRole="button"
              accessibilityState={{ selected: filter.value }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
                    style={StyleSheet.flatten([
                      styles.filterLabel,
                      filter.value && styles.filterLabelActive,
                    ])}
                  >
                    {filter.label}
                  </Text>
                  <View
                    style={StyleSheet.flatten([
                      styles.checkbox,
                      filter.value && styles.checkboxActive,
                    ])}
                  >
                    {filter.value && (
                      <Ionicons name="checkmark" size={16} color={theme.colors.onSurface} />
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
        colors={theme.palette.gradients.primary}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            testID="AdvancedFiltersScreen-button-back" 
            accessibilityLabel="Go back" 
            accessibilityRole="button" 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                () => {},
              );
              navigation.goBack();
            }}
          >
            <BlurView intensity={20} style={styles.backButtonBlur}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Advanced Filters</Text>
          <TouchableOpacity
            style={styles.resetButton}
            testID="AdvancedFiltersScreen-button-reset"
            accessibilityLabel="Reset filters"
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={resetFilters}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <BlurView intensity={10} style={styles.infoCard}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={theme.colors.info}
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
          <TouchableOpacity
            style={styles.saveButton}
            testID="AdvancedFiltersScreen-button-save"
            accessibilityLabel="Save filters"
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={saveFilters}
          >
            <BlurView intensity={20} style={styles.saveButtonBlur}>
              <Ionicons name="save-outline" size={20} color={theme.colors.onSurface} />
              <Text style={styles.saveButtonText}>Save Filters</Text>
            </BlurView>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.full,
    overflow: "hidden",
  },
  backButtonBlur: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: theme.typography.h2.size,
    fontWeight: theme.typography.h2.weight,
    color: theme.colors.onSurface,
  },
  resetButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface + '33', // 20% opacity
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  resetButtonText: {
    color: theme.colors.onSurface,
    fontSize: theme.typography.body.size * 0.875,
    fontWeight: theme.typography.h2.weight,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface + '1A', // 10% opacity
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing['2xl'],
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoText: {
    flex: 1,
    marginStart: theme.spacing.sm,
    fontSize: theme.typography.body.size * 0.875,
    color: theme.colors.onSurface,
    lineHeight: theme.typography.body.lineHeight * 1.25,
  },
  categorySection: {
    marginBottom: theme.spacing['2xl'],
  },
  categoryTitle: {
    fontSize: theme.typography.h3.size,
    fontWeight: theme.typography.h3.weight,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
  },
  filterCard: {
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.sm,
    overflow: "hidden",
  },
  filterCardActive: {
    transform: [{ scale: 1.02 }],
  },
  filterBlur: {
    padding: theme.spacing.md,
  },
  filterContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterLabel: {
    fontSize: theme.typography.body.size,
    color: theme.colors.onSurface,
    flex: 1,
  },
  filterLabelActive: {
    fontWeight: "600",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.radii.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  saveButton: {
    borderRadius: theme.radii.lg,
    overflow: "hidden",
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing['2xl'],
  },
  saveButtonBlur: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  saveButtonText: {
    color: theme.colors.onSurface,
    fontSize: theme.typography.body.size,
    fontWeight: theme.typography.h2.weight,
  },
});

export default AdvancedFiltersScreen;
