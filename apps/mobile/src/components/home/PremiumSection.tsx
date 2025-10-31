/**
 * PremiumSection Component
 * Displays premium features promotion with particle effects
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@mobile/theme';
import { useTranslation } from 'react-i18next';
import { useReduceMotion } from '../../hooks/useReducedMotion';
import {
  FadeInUp,
  PremiumBody,
  EliteButton,
} from '../components';
import {
  PremiumHeading,
  HolographicCard,
  GlowContainer,
  ParticleEffect,
} from '../components/PremiumComponents';
import { Ionicons } from '@expo/vector-icons';

interface PremiumSectionProps {
  onUpgradePress: () => void;
}

export function PremiumSection({
  onUpgradePress,
}: PremiumSectionProps): React.JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const reducedMotion = useReduceMotion();

  const styles = StyleSheet.create({
    premiumSection: {
      padding: theme.spacing.lg,
    },
    premiumContent: {
      alignItems: 'center',
    },
    premiumHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    premiumActions: {
      marginTop: theme.spacing.lg,
    },
  });

  return (
    <FadeInUp delay={600}>
      <View style={styles.premiumSection}>
        <PremiumHeading
          level={2}
          gradient="holographic"
          animated={!reducedMotion}
          glow={!reducedMotion}
        >
          {t('home.premium_features') || 'Premium Features'}
        </PremiumHeading>
        <View style={{ position: 'relative' }}>
          {!reducedMotion && (
            <ParticleEffect count={15} variant="neon" speed="normal" />
          )}
          <HolographicCard
            variant="rainbow"
            size="lg"
            animated={!reducedMotion}
            shimmer={!reducedMotion}
            glow={!reducedMotion}
          >
            <View style={styles.premiumContent}>
              <View style={styles.premiumHeader}>
                <GlowContainer
                  color="neon"
                  intensity="heavy"
                  animated={!reducedMotion}
                >
                  <Ionicons
                    name="star"
                    size={32}
                    color={theme.colors.warning}
                    accessibilityLabel={t('home.featured') || 'Featured'}
                  />
                </GlowContainer>
                <PremiumHeading
                  level={3}
                  gradient="holographic"
                  animated={!reducedMotion}
                  glow={!reducedMotion}
                >
                  {t('home.premium_title') || 'Unlock Premium'}
                </PremiumHeading>
              </View>
              <PremiumBody
                size="base"
                weight="regular"
                gradient="primary"
              >
                {t('home.premium_description') ||
                  'Get access to exclusive features and boost your pet matching experience'}
              </PremiumBody>
              <View style={styles.premiumActions}>
                <EliteButton
                  title={t('home.upgrade_now') || 'Upgrade Now'}
                  variant="primary"
                  size="lg"
                  onPress={onUpgradePress}
                  accessibilityLabel={t('home.upgrade_now') || 'Upgrade Now'}
                  accessibilityRole="button"
                />
              </View>
            </View>
          </HolographicCard>
        </View>
      </View>
    </FadeInUp>
  );
}

