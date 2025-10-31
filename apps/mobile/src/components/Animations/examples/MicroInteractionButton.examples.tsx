/**
 * Example Usage: MicroInteractionButton
 * 
 * Comprehensive examples demonstrating all features of MicroInteractionButton
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { MicroInteractionButton } from '@/components/Animations';

// ============================================================================
// Basic Examples
// ============================================================================

export function BasicButtonExamples() {
  return (
    <View style={styles.container}>
      {/* Simple button */}
      <MicroInteractionButton label="Click Me" onPress={() => console.log('Pressed')} />

      {/* With variant */}
      <MicroInteractionButton variant="primary" label="Primary" />
      <MicroInteractionButton variant="secondary" label="Secondary" />
      <MicroInteractionButton variant="danger" label="Danger" />
      <MicroInteractionButton variant="success" label="Success" />
      <MicroInteractionButton variant="ghost" label="Ghost" />

      {/* With sizes */}
      <MicroInteractionButton size="sm" label="Small" />
      <MicroInteractionButton size="md" label="Medium" />
      <MicroInteractionButton size="lg" label="Large" />
    </View>
  );
}

// ============================================================================
// State Examples
// ============================================================================

export function StateButtonExamples() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    setIsSuccess(false);
    setHasError(false);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
      setIsSuccess(true);
    } catch {
      setIsLoading(false);
      setHasError(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Loading state */}
      <MicroInteractionButton
        label="Submit"
        loading={isLoading}
        onPress={handleSubmit}
      />

      {/* Success state */}
      <MicroInteractionButton
        label="Saved"
        success={isSuccess}
        onPress={() => setIsSuccess(false)}
      />

      {/* Error state */}
      <MicroInteractionButton
        label="Retry"
        error={hasError}
        onPress={() => setHasError(false)}
      />
    </View>
  );
}

// ============================================================================
// Feature Examples
// ============================================================================

export function FeatureButtonExamples() {
  return (
    <View style={styles.container}>
      {/* With haptic feedback */}
      <MicroInteractionButton
        label="Haptic"
        haptic="medium"
        onPress={() => console.log('Pressed with haptic')}
      />

      {/* With ripple effect */}
      <MicroInteractionButton
        label="Ripple"
        ripple
        onPress={() => console.log('Pressed with ripple')}
      />

      {/* With magnetic effect */}
      <MicroInteractionButton
        label="Magnetic"
        magnetic
        onPress={() => console.log('Pressed with magnetic')}
      />

      {/* With sound effect */}
      <MicroInteractionButton
        label="Sound"
        sound={{
          uri: require('@/assets/sounds/click.mp3'),
          volume: 0.5,
          enabled: true,
        }}
        onPress={() => console.log('Pressed with sound')}
      />

      {/* All features combined */}
      <MicroInteractionButton
        variant="primary"
        size="lg"
        haptic="medium"
        ripple
        magnetic
        sound={{
          uri: require('@/assets/sounds/click.mp3'),
          volume: 0.5,
          enabled: true,
        }}
        label="Full Featured"
        onPress={() => console.log('Pressed')}
      />
    </View>
  );
}

// ============================================================================
// Icon Examples
// ============================================================================

export function IconButtonExamples() {
  const CheckIcon = () => <View style={{ width: 16, height: 16, backgroundColor: 'white' }} />;
  const PlusIcon = () => <View style={{ width: 16, height: 16, backgroundColor: 'white' }} />;

  return (
    <View style={styles.container}>
      {/* Icon on left */}
      <MicroInteractionButton
        label="Add"
        icon={<PlusIcon />}
        iconPosition="left"
        onPress={() => console.log('Add pressed')}
      />

      {/* Icon on right */}
      <MicroInteractionButton
        label="Complete"
        icon={<CheckIcon />}
        iconPosition="right"
        variant="success"
        onPress={() => console.log('Complete pressed')}
      />
    </View>
  );
}

// ============================================================================
// Custom Styling Examples
// ============================================================================

export function CustomStyledButtonExamples() {
  return (
    <View style={styles.container}>
      {/* Custom style */}
      <MicroInteractionButton
        label="Custom Style"
        style={{
          backgroundColor: '#ff6b6b',
          borderRadius: 20,
        }}
        textStyle={{
          color: '#ffffff',
          fontWeight: 'bold',
        }}
        onPress={() => console.log('Pressed')}
      />

      {/* Custom spring config */}
      <MicroInteractionButton
        label="Bouncy"
        spring={{
          stiffness: 400,
          damping: 20,
          mass: 0.8,
        }}
        onPress={() => console.log('Pressed')}
      />

      {/* Custom duration */}
      <MicroInteractionButton
        label="Slow Animation"
        duration={500}
        onPress={() => console.log('Pressed')}
      />
    </View>
  );
}

// ============================================================================
// Real-World Examples
// ============================================================================

export function RealWorldButtonExamples() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleFormSubmit = async () => {
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSaved(true);
  };

  return (
    <View style={styles.container}>
      {/* Form submit button */}
      <MicroInteractionButton
        variant="primary"
        size="lg"
        label="Submit Form"
        loading={isSubmitting}
        success={isSaved}
        haptic="medium"
        ripple
        onPress={handleFormSubmit}
      />

      {/* Delete button */}
      <MicroInteractionButton
        variant="danger"
        label="Delete"
        haptic="heavy"
        sound={{
          uri: require('@/assets/sounds/delete.mp3'),
          volume: 0.3,
        }}
        onPress={() => console.log('Delete pressed')}
      />

      {/* Save button */}
      <MicroInteractionButton
        variant="success"
        label="Save Changes"
        icon={<View style={{ width: 16, height: 16, backgroundColor: 'white' }} />}
        iconPosition="left"
        success={isSaved}
        onPress={() => setIsSaved(!isSaved)}
      />

      {/* Cancel button */}
      <MicroInteractionButton
        variant="ghost"
        label="Cancel"
        onPress={() => console.log('Cancel pressed')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
  },
});

