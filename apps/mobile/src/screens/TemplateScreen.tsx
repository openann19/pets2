/**
 * 📱 TEMPLATE SCREEN - STARTER TEMPLATE
 * Copy this structure for all new screens
 * Enforces: ScreenShell, motion presets, Theme tokens, haptics
 */

import React from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenShell } from '../ui/layout/ScreenShell';
import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import { AdvancedCard, CardConfigs } from '../components/Advanced/AdvancedCard';
import { Theme } from '../theme/unified-theme';
import { StaggerList } from '../ui/lists/StaggerList';
import { BouncePressable } from '../ui/pressables/BouncePressable';

interface TemplateItem {
  _id: string;
  name: string;
  description: string;
}

export default function TemplateScreen() {
  const data: TemplateItem[] = [
    { _id: '1', name: 'Item 1', description: 'Description 1' },
    { _id: '2', name: 'Item 2', description: 'Description 2' },
    { _id: '3', name: 'Item 3', description: 'Description 3' },
  ];

  const handlePress = () => {
    // Handle press action
    console.log('Pressed');
  };

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({ title: 'Template Screen' })}
        />
      }
    >
      {/* Hero section with animation */}
      <Animated.View entering={FadeInDown.duration(220)}>
        <AdvancedCard 
          {...CardConfigs.glass()} 
          style={{ 
            padding: Theme.spacing.lg, 
            marginBottom: Theme.spacing.lg 
          }}
        >
          <Text style={styles.heroTitle}>Hero Section</Text>
          <Text style={styles.heroDescription}>
            This is a template screen using the UI & Motion contract
          </Text>
        </AdvancedCard>
      </Animated.View>

      {/* Staggered list */}
      <StaggerList
        data={data}
        renderItem={(item) => (
          <BouncePressable 
            onPress={handlePress} 
            hapticFeedback="tap"
          >
            <AdvancedCard
              {...CardConfigs.glass({ interactions: ['press', 'glow'] })}
              style={{ padding: Theme.spacing.lg }}
            >
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
            </AdvancedCard>
          </BouncePressable>
        )}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroTitle: {
    fontSize: Theme.typography.fontSize['3xl'],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  heroDescription: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.secondary,
    lineHeight: Theme.typography.lineHeight.relaxed * Theme.typography.fontSize.base,
  },
  itemName: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  itemDescription: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    lineHeight: Theme.typography.lineHeight.normal * Theme.typography.fontSize.sm,
  },
});

