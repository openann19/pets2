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
import { useAdvancedFiltersGate } from '../utils/featureGates';
import { PremiumGate } from '../components/Premium/PremiumGate';
import { FilterItem } from './advanced-filters/components/FilterItem';

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
  
  // Check premium access using feature gate hook
  const { canUse: hasAdvancedFilters, reason, upgradeRequired } = useAdvancedFiltersGate();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        infoCard: {
          flexDirection: 'row',
          alignItems: 'center',
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
          fontSize: 14,
          color: theme.colors.onSurface,
          lineHeight: 20,
        },
        categoryTitle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: theme.colors.onSurface,
          marginBottom: theme.spacing.sm,
        },
        backButtonBlur: {
          borderRadius: theme.radii.lg,
          padding: theme.spacing.sm,
          backgroundColor: theme.colors.surface + '40', // 25% opacity
        },
        saveButtonBlur: {
          borderRadius: theme.radii.lg,
          padding: theme.spacing.sm,
          backgroundColor: theme.colors.primary + '40', // 25% opacity
        },
        categorySection: {
          marginBottom: theme.spacing['2xl'],
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
          color: theme.colors.onSurface,
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
          color: theme.colors.onSurface,
          fontSize: 16,
          fontWeight: '600',
          marginStart: theme.spacing.sm,
        },
        resetButtonText: {
          color: theme.colors.onSurface,
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
            <FilterItem
              key={filter.id}
              filter={filter}
              onToggle={toggleFilter}
            />
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
        {!hasAdvancedFilters ? (
          <View style={[styles.content, { justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl }]}>
            <PremiumGate
              feature="Advanced Filters"
              description={reason || "Unlock advanced matching filters with Premium"}
              icon="options-outline"
              visible={true}
              onClose={() => navigation.goBack()}
              onUpgrade={() => {
                navigation.goBack();
                (navigation as any)?.navigate?.('Premium');
              }}
            />
          </View>
        ) : (
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
        )}
      </SafeAreaView>
    </View>
  );
}

export default AdvancedFiltersScreen;
