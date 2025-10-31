import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { springs } from '@/foundation/motion';

import type { PetFilters } from '@pawfectmatch/core';

interface AdvancedPetFiltersProps {
  value: PetFilters;
  onChange: (filters: PetFilters) => void;
  onReset?: () => void;
  onApply?: () => void;
}

export const AdvancedPetFilters: React.FC<AdvancedPetFiltersProps> = ({
  value,
  onChange,
  onReset,
  onApply,
}) => {
  const theme = useTheme() as AppTheme;
  const slideIn = useSharedValue(0);
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    slideIn.value = withSpring(1, springs.standard);
    fadeIn.value = withTiming(1, { duration: 500 });
  }, [slideIn, fadeIn]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(slideIn.value, [0, 1], [50, 0]),
      },
      {
        scale: interpolate(slideIn.value, [0, 1], [0.95, 1]),
      },
    ],
    opacity: fadeIn.value,
  }));

  const handleChange = (field: keyof PetFilters, val: PetFilters[keyof PetFilters]) => {
    onChange({ ...value, [field]: val });
    Haptics.selectionAsync();
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReset?.();
  };

  const handleApply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onApply?.();
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          borderRadius: theme.radii['2xl'],
          padding: theme.spacing.lg,
          margin: theme.spacing.md,
          shadowColor: theme.colors.border,
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 8,
        },
        title: {
          fontSize: 22,
          fontWeight: 'bold',
          color: theme.colors.primary,
          marginBottom: theme.spacing.md,
          textAlign: 'center',
        },
        label: {
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.primary,
          marginTop: theme.spacing.md,
        },
        picker: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.md,
          marginVertical: theme.spacing.xs,
        },
        slider: {
          marginVertical: theme.spacing.sm,
        },
        buttonRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: theme.spacing.lg,
        },
        resetButton: {
          backgroundColor: theme.utils.alpha(theme.colors.primary, 0.1),
          borderRadius: theme.radii.md,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
        },
        resetText: {
          color: theme.colors.primary,
          fontWeight: 'bold',
          fontSize: 16,
        },
        applyButton: {
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radii.md,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
        },
        applyText: {
          color: theme.colors.onPrimary,
          fontWeight: 'bold',
          fontSize: 16,
        },
      }),
    [theme],
  );

  return (
    <Animated.View style={animatedStyle}>
      <LinearGradient
        colors={[...theme.palette.gradients.warning, ...theme.palette.gradients.primary]}
        style={styles.container}
      >
        <Text style={styles.title}>Advanced Filters</Text>
        <Text style={styles.label}>Species</Text>
        <Picker
          selectedValue={value.species || ''}
          onValueChange={(v) => {
            handleChange('species', v || undefined);
          }}
          style={styles.picker}
          accessibilityLabel="Species"
        >
          <Picker.Item
            label="Any"
            value={undefined}
          />
          <Picker.Item
            label="Dog"
            value="dog"
          />
          <Picker.Item
            label="Cat"
            value="cat"
          />
          <Picker.Item
            label="Bird"
            value="bird"
          />
          <Picker.Item
            label="Rabbit"
            value="rabbit"
          />
          <Picker.Item
            label="Other"
            value="other"
          />
        </Picker>
        <Text style={styles.label}>Min Age</Text>
        <Slider
          minimumValue={0}
          maximumValue={20}
          step={1}
          value={value.minAge ?? 0}
          onValueChange={(v) => {
            handleChange('minAge', v);
          }}
          style={styles.slider}
          accessibilityLabel="Minimum Age"
        />
        <Text style={styles.label}>Max Age</Text>
        <Slider
          minimumValue={0}
          maximumValue={20}
          step={1}
          value={value.maxAge ?? 20}
          onValueChange={(v) => {
            handleChange('maxAge', v);
          }}
          style={styles.slider}
          accessibilityLabel="Maximum Age"
        />
        <Text style={styles.label}>Size</Text>
        <Picker
          selectedValue={value.size || ''}
          onValueChange={(v) => {
            handleChange('size', v || undefined);
          }}
          style={styles.picker}
          accessibilityLabel="Size"
        >
          <Picker.Item
            label="Any"
            value={undefined}
          />
          <Picker.Item
            label="Small"
            value="small"
          />
          <Picker.Item
            label="Medium"
            value="medium"
          />
          <Picker.Item
            label="Large"
            value="large"
          />
          <Picker.Item
            label="Extra Large"
            value="extra-large"
          />
        </Picker>
        <Text style={styles.label}>Intent</Text>
        <Picker
          selectedValue={value.intent || ''}
          onValueChange={(v) => {
            handleChange('intent', v || undefined);
          }}
          style={styles.picker}
          accessibilityLabel="Intent"
        >
          <Picker.Item
            label="Any"
            value={undefined}
          />
          <Picker.Item
            label="Adoption"
            value="adoption"
          />
          <Picker.Item
            label="Mating"
            value="mating"
          />
          <Picker.Item
            label="Playdate"
            value="playdate"
          />
          <Picker.Item
            label="All"
            value="all"
          />
        </Picker>
        <Text style={styles.label}>Max Distance (km)</Text>
        <Slider
          minimumValue={1}
          maximumValue={100}
          step={1}
          value={value.maxDistance ?? 10}
          onValueChange={(v) => {
            handleChange('maxDistance', v);
          }}
          style={styles.slider}
          accessibilityLabel="Maximum Distance"
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            accessibilityLabel="Reset Filters"
          >
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
            accessibilityLabel="Apply Filters"
          >
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};
