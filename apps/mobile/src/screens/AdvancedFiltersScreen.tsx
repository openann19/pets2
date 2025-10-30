import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAdvancedFiltersScreen } from '../hooks/screens/useAdvancedFiltersScreen';
import { useTheme } from '@mobile/theme';
import { getExtendedColors } from '@mobile/theme/adapters';

interface AdvancedFiltersScreenProps {
  navigation: {
    goBack: () => void;
  };
}

function AdvancedFiltersScreen({ navigation }: AdvancedFiltersScreenProps): React.JSX.Element {
  const theme = useTheme();
  const colors = getExtendedColors(theme);
  const { toggleFilter, resetFilters, saveFilters, getFiltersByCategory } =
    useAdvancedFiltersScreen();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        infoCard: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.bgElevated + '1A', // 10% opacity
          borderRadius: theme.radii.md,
          padding: theme.spacing.md,
          marginBottom: theme.spacing['2xl'],
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        infoText: {
          flex: 1,
          marginStart: theme.spacing.sm,
          fontSize: 14,
          color: theme.colors.text,
          lineHeight: 20,
        },
        categoryTitle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: theme.colors.text,
          marginBottom: theme.spacing.sm,
        },
        backButtonBlur: {
          borderRadius: theme.radii.lg,
          padding: theme.spacing.sm,
          backgroundColor: theme.colors.bgElevated + '40', // 25% opacity
        },
        saveButtonBlur: {
          borderRadius: theme.radii.lg,
          padding: theme.spacing.sm,
          backgroundColor: theme.colors.primary + '40', // 25% opacity
        },
        categorySection: {
          marginBottom: theme.spacing['2xl'],
        },
        filterCard: {
          backgroundColor: theme.colors.bgElevated,
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
          color: theme.colors.text,
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
        container: {
          flex: 1,
          backgroundColor: theme.colors.bg,
        },
        safeArea: {
          flex: 1,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
        },
        backButton: {
          padding: theme.spacing.sm,
        },
        headerTitle: {
          fontSize: 18,
          fontWeight: '600',
          color: theme.colors.text,
        },
        resetButton: {
          padding: theme.spacing.sm,
        },
        saveButton: {
          borderRadius: theme.radii.lg,
          marginHorizontal: theme.spacing.md,
          marginBottom: theme.spacing.md,
        },
        saveButtonText: {
          color: theme.colors.text,
          fontSize: 16,
          fontWeight: '600',
          marginStart: theme.spacing.sm,
        },
        resetButtonText: {
          color: theme.colors.text,
          fontSize: 16,
          fontWeight: '600',
        },
        content: {
          flex: 1,
        },
      }),
    [theme],
  );

  const renderCategory = useCallback(
    (category: string, title: string) => {
      const categoryFilters = getFiltersByCategory(category);

      return (
        <View
          key={category}
          style={styles.categorySection}
        >
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
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={theme.colors.text}
                      />
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
        colors={[colors.primary, colors.accent]}
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
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              navigation.goBack();
            }}
          >
            <BlurView
              intensity={20}
              style={styles.backButtonBlur}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={theme.colors.text}
              />
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
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <BlurView
            intensity={10}
            style={styles.infoCard}
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.infoText}>
              Advanced filters help you find pets that match your specific preferences and
              lifestyle.
            </Text>
          </BlurView>

          {renderCategory('characteristics', 'Pet Characteristics')}
          {renderCategory('size', 'Size Preferences')}
          {renderCategory('energy', 'Energy Level')}
          {renderCategory('special', 'Special Considerations')}

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            testID="AdvancedFiltersScreen-button-save"
            accessibilityLabel="Save filters"
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={saveFilters}
          >
            <BlurView
              intensity={20}
              style={styles.saveButtonBlur}
            >
              <Ionicons
                name="save-outline"
                size={20}
                color={theme.colors.text}
              />
              <Text style={styles.saveButtonText}>Save Filters</Text>
            </BlurView>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

export default AdvancedFiltersScreen;
