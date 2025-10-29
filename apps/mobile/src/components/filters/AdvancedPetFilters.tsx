import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

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
  const slideIn = useSharedValue(0);
  const fadeIn = useSharedValue(0);

  React.useEffect(() => {
    slideIn.value = withSpring(1, { stiffness: 300, damping: 30 });
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

  const handleChange = (field: keyof PetFilters, val: any) => {
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

  return (
    <Animated.View style={animatedStyle}>
      <LinearGradient
        colors={['#fceabb', '#f8b500', 'Theme.colors.primary[500]', '#a21caf']}
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

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    margin: 16,
    shadowColor: 'Theme.colors.primary[500]',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#a21caf',
    marginBottom: 12,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b21a8',
    marginTop: 12,
  },
  picker: {
    backgroundColor: 'Theme.colors.neutral[0]',
    borderRadius: 8,
    marginVertical: 4,
  },
  slider: {
    marginVertical: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  resetButton: {
    backgroundColor: '#f3e8ff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  resetText: {
    color: '#a21caf',
    fontWeight: 'bold',
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: 'Theme.colors.primary[500]',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  applyText: {
    color: 'Theme.colors.neutral[0]',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
