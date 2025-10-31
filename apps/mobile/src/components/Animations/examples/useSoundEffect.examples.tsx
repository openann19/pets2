/**
 * Example Usage: useSoundEffect Hook
 * 
 * Comprehensive examples demonstrating all features of useSoundEffect hook
 */

import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSoundEffect } from '@/hooks/animations/useSoundEffect';

// ============================================================================
// Basic Examples
// ============================================================================

export function BasicSoundExamples() {
  // Simple sound effect
  const { play } = useSoundEffect({
    uri: require('@/assets/sounds/click.mp3'),
    volume: 0.5,
    enabled: true,
  });

  return (
    <Pressable onPress={() => play()}>
      <Text>Play Sound</Text>
    </Pressable>
  );
}

// ============================================================================
// Volume Control Examples
// ============================================================================

export function VolumeControlExamples() {
  const [volume, setVolume] = useState(0.5);

  const { play } = useSoundEffect({
    uri: require('@/assets/sounds/click.mp3'),
    volume,
  });

  return (
    <View style={styles.container}>
      <Text>Volume: {Math.round(volume * 100)}%</Text>
      <Pressable onPress={() => setVolume(Math.min(1, volume + 0.1))}>
        <Text>Increase Volume</Text>
      </Pressable>
      <Pressable onPress={() => setVolume(Math.max(0, volume - 0.1))}>
        <Text>Decrease Volume</Text>
      </Pressable>
      <Pressable onPress={() => play()}>
        <Text>Play Sound</Text>
      </Pressable>
    </View>
  );
}

// ============================================================================
// Enable/Disable Examples
// ============================================================================

export function EnableDisableExamples() {
  const [enabled, _setEnabled] = useState(true);

  const { play, enabled: soundEnabled, setEnabled: setSoundEnabled } = useSoundEffect({
    uri: require('@/assets/sounds/click.mp3'),
    enabled,
  });

  return (
    <View style={styles.container}>
      <Text>Sound Enabled: {soundEnabled ? 'Yes' : 'No'}</Text>
      <Pressable onPress={() => setSoundEnabled(!soundEnabled)}>
        <Text>Toggle Sound</Text>
      </Pressable>
      <Pressable onPress={() => play()}>
        <Text>Play Sound</Text>
      </Pressable>
    </View>
  );
}

// ============================================================================
// Multiple Sounds Examples
// ============================================================================

export function MultipleSoundsExamples() {
  const clickSound = useSoundEffect({
    uri: require('@/assets/sounds/click.mp3'),
    volume: 0.5,
  });

  const successSound = useSoundEffect({
    uri: require('@/assets/sounds/success.mp3'),
    volume: 0.7,
  });

  const errorSound = useSoundEffect({
    uri: require('@/assets/sounds/error.mp3'),
    volume: 0.6,
  });

  return (
    <View style={styles.container}>
      <Pressable onPress={() => clickSound.play()}>
        <Text>Click Sound</Text>
      </Pressable>
      <Pressable onPress={() => successSound.play()}>
        <Text>Success Sound</Text>
      </Pressable>
      <Pressable onPress={() => errorSound.play()}>
        <Text>Error Sound</Text>
      </Pressable>
    </View>
  );
}

// ============================================================================
// Remote URL Examples
// ============================================================================

export function RemoteSoundExamples() {
  const { play } = useSoundEffect({
    uri: 'https://example.com/sound.mp3',
    volume: 0.5,
  });

  return (
    <Pressable onPress={() => play()}>
      <Text>Play Remote Sound</Text>
    </Pressable>
  );
}

// ============================================================================
// Integration Examples
// ============================================================================

export function IntegrationExamples() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const clickSound = useSoundEffect({
    uri: require('@/assets/sounds/click.mp3'),
    volume: 0.5,
  });

  const successSound = useSoundEffect({
    uri: require('@/assets/sounds/success.mp3'),
    volume: 0.7,
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    await clickSound.play();

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
      setIsSuccess(true);
      await successSound.play();
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleSubmit} disabled={isLoading}>
        <Text>{isLoading ? 'Loading...' : isSuccess ? 'Success!' : 'Submit'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
  },
});

