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
import { useTheme } from "@mobile/src/theme";
import { StaggerList } from '../ui/lists/StaggerList';
import { BouncePressable } from '../ui/pressables/BouncePressable';
import { logger } from '../services/logger';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { getAccessibilityProps } from '../utils/accessibilityUtils';

interface TemplateItem {
  _id: string;
  name: string;
  description: string;
}

export default function TemplateScreen() {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const styles = createStyles(theme);
  
  const data: TemplateItem[] = [
    { _id: '1', name: 'Item 1', description: 'Description 1' },
    { _id: '2', name: 'Item 2', description: 'Description 2' },
    { _id: '3', name: 'Item 3', description: 'Description 3' },
  ];

  const handlePress = () => {
    // Handle press action
    logger.info('Template screen button pressed');
  };

  // Animation config that respects reduced motion
  const animationConfig = reducedMotion ? {} : { entering: FadeInDown.duration(220) };
  const hapticFeedback = reducedMotion ? undefined : 'tap';

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({ title: 'Template Screen' })}
        />
      }
    >
      {/* Hero section with animation */}
      <Animated.View {...animationConfig}>
        <AdvancedCard 
          {...CardConfigs.glass({})} 
          style={{ 
            padding: theme.spacing.lg, 
            marginBottom: theme.spacing.lg 
          }}
          testID="template-hero-card"
          {...getAccessibilityProps('hero section card', 'text')}
        >
          <Text 
            style={styles.heroTitle}
            accessibilityRole="text"
            accessibilityLabel="Hero Section Title"
          >
            Hero Section
          </Text>
          <Text 
            style={styles.heroDescription}
            accessibilityRole="text"
            accessibilityLabel="Template screen description"
          >
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
            hapticFeedback={hapticFeedback}
            testID={`template-item-${item._id}`}
            accessibilityLabel={`Tap to interact with ${item.name}: ${item.description}`}
            accessibilityRole="button"
          >
            <AdvancedCard
              {...CardConfigs.glass({ interactions: ['press', 'glow'] })}
              style={{ padding: theme.spacing.lg }}
              testID={`template-card-${item._id}`}
            >
              <Text 
                style={styles.itemName}
                accessibilityRole="text"
                accessibilityLabel={`Item name: ${item.name}`}
              >
                {item.name}
              </Text>
              <Text 
                style={styles.itemDescription}
                accessibilityRole="text"
                accessibilityLabel={`Item description: ${item.description}`}
              >
                {item.description}
              </Text>
            </AdvancedCard>
          </BouncePressable>
        )}
      />
    </ScreenShell>
  );
}

// Styles should be defined inside the component or use useMemo
const createStyles = (theme: any) => StyleSheet.create({
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
  },
  heroDescription: {
    fontSize: 16,
    color: theme.colors.onMuted,
    lineHeight: 24,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.xs,
  },
  itemDescription: {
    fontSize: 14,
    color: theme.colors.onMuted,
    lineHeight: 20,
  },
});

