import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@mobile/theme';
import { AnimatedPressable } from '../components/motion/MicroInteractions';

export default function PolishPlaygroundScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = makeStyles(theme);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Motion & Visual Primitives</Text>
      <AnimatedPressable
        style={styles.demoCard}
        accessibilityLabel="Demo pressable card"
        haptic="light"
      >
        <Text style={styles.cardText}>Press me</Text>
      </AnimatedPressable>
    </View>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
      padding: theme.spacing.lg + theme.spacing.xs,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.h2.size,
      marginBottom: theme.spacing.lg,
    },
    demoCard: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.lg + theme.spacing.xs,
      borderRadius: theme.radii.lg,
      minWidth: 200,
      alignItems: 'center',
    },
    cardText: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.body.size,
    },
  });
