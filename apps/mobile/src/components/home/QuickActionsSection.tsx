/**
 * QuickActionsSection Component
 * Displays grid of quick action cards with premium effects
 */
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@mobile/theme';
import { useTranslation } from 'react-i18next';
import { useReduceMotion } from '../../hooks/useReducedMotion';
import {
  EliteCard,
  Heading2,
  FadeInUp,
  StaggeredContainer,
  PremiumBody,
} from '../components';
import { Interactive } from '../components/primitives/Interactive';
import { GlowContainer } from '../components/PremiumComponents';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  color: 'primary' | 'success' | 'secondary' | 'warning';
  glowColor: 'primary' | 'success' | 'secondary' | 'warning' | 'neon';
  gradient: 'primary' | 'secondary' | 'premium' | 'holographic';
  onPress: () => void;
  badge?: number | undefined;
  delay: number;
}

interface QuickActionsSectionProps {
  actions: QuickAction[];
}

export function QuickActionsSection({
  actions,
}: QuickActionsSectionProps): React.JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const reducedMotion = useReduceMotion();

  const styles = StyleSheet.create({
    quickActions: {
      padding: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    actionCard: {
      width: (screenWidth - theme.spacing.xl * 3) / 2,
      marginBottom: theme.spacing.md,
    },
    actionContent: {
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    actionIcon: {
      width: 50,
      height: 50,
      borderRadius: theme.radii.full,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    badge: {
      position: 'absolute',
      top: -theme.spacing.sm,
      right: -theme.spacing.sm,
      backgroundColor: theme.colors.danger,
      borderRadius: theme.radii.md,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xs,
    },
    badgeText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.h2.weight,
    },
  });

  const getColorValue = (color: QuickAction['color']): string => {
    switch (color) {
      case 'primary':
        return theme.colors.primary;
      case 'success':
        return theme.colors.success;
      case 'secondary':
        return theme.colors.info;
      case 'warning':
        return theme.colors.warning;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <FadeInUp delay={0}>
      <View style={styles.quickActions}>
        <Heading2 style={styles.sectionTitle}>
          {t('home.quick_actions') || 'Quick Actions'}
        </Heading2>
        <StaggeredContainer delay={100}>
          {actions.map((action) => (
            <FadeInUp key={action.id} delay={action.delay}>
              <Interactive
                variant="lift"
                haptic="light"
                onPress={action.onPress}
                accessibilityLabel={action.label}
                accessibilityRole="button"
                accessible={true}
              >
                <EliteCard variant="glass" style={styles.actionCard}>
                  <GlowContainer
                    color={action.glowColor}
                    intensity={action.id === 'premium' ? 'heavy' : 'medium'}
                    animated={!reducedMotion || action.id === 'premium'}
                  >
                    <View style={styles.actionContent}>
                      <View
                        style={StyleSheet.flatten([
                          styles.actionIcon,
                          { backgroundColor: getColorValue(action.color) },
                        ])}
                      >
                        <Ionicons
                          name={action.icon as any}
                          size={24}
                          color={theme.colors.bg}
                        />
                      </View>
                      <PremiumBody
                        size="sm"
                        weight="semibold"
                        gradient={action.gradient}
                      >
                        {action.label}
                      </PremiumBody>
                      {action.badge !== undefined && action.badge > 0 && (
                        <View style={styles.badge}>
                          <PremiumBody
                            size="xs"
                            weight="bold"
                            gradient="primary"
                          >
                            {action.badge}
                          </PremiumBody>
                        </View>
                      )}
                    </View>
                  </GlowContainer>
                </EliteCard>
              </Interactive>
            </FadeInUp>
          ))}
        </StaggeredContainer>
      </View>
    </FadeInUp>
  );
}

