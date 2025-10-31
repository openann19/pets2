/**
 * RecentActivityFeed Component
 * Displays recent activity feed with holographic effects
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import { useTranslation } from 'react-i18next';
import { useReduceMotion } from '../../hooks/useReducedMotion';
import {
  FadeInUp,
  StaggeredContainer,
  PremiumBody,
} from '../components';
import { PremiumHeading, HolographicCard, GlowContainer } from '../components/PremiumComponents';
import { Ionicons } from '@expo/vector-icons';
import type { RecentActivityItem } from '../../hooks/screens/useHomeScreen';

interface RecentActivityFeedProps {
  activities: RecentActivityItem[];
}

export function RecentActivityFeed({
  activities,
}: RecentActivityFeedProps): React.JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const reducedMotion = useReduceMotion();

  const styles = StyleSheet.create({
    recentActivity: {
      padding: theme.spacing.lg,
    },
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginEnd: theme.spacing.sm,
    },
    activityContent: {
      flex: 1,
    },
  });

  return (
    <FadeInUp delay={400}>
      <View style={styles.recentActivity}>
        <PremiumHeading
          level={2}
          gradient="secondary"
          animated={!reducedMotion}
        >
          {t('home.recent_activity') || 'Recent Activity'}
        </PremiumHeading>
        <HolographicCard
          variant="cyber"
          size="md"
          animated={!reducedMotion}
          shimmer={!reducedMotion}
          glow={!reducedMotion}
        >
          <StaggeredContainer delay={50}>
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <FadeInUp key={activity.id} delay={index * 50}>
                  <View style={styles.activityItem}>
                    <GlowContainer
                      color={activity.type === 'match' ? 'primary' : 'secondary'}
                      intensity="light"
                      animated={!reducedMotion}
                    >
                      <View style={styles.activityIcon}>
                        <Ionicons
                          name={
                            activity.type === 'match' ? 'heart' : 'chatbubble'
                          }
                          size={20}
                          color={theme.colors.primary}
                        />
                      </View>
                    </GlowContainer>
                    <View style={styles.activityContent}>
                      <PremiumBody
                        size="base"
                        weight="semibold"
                        gradient={
                          activity.type === 'match' ? 'primary' : 'secondary'
                        }
                      >
                        {activity.title}
                      </PremiumBody>
                      <PremiumBody size="sm" weight="regular">
                        {activity.description}
                      </PremiumBody>
                    </View>
                    <PremiumBody size="sm" weight="regular">
                      {activity.timeAgo}
                    </PremiumBody>
                  </View>
                </FadeInUp>
              ))
            ) : (
              <FadeInUp delay={0}>
                <View style={styles.activityItem}>
                  <PremiumBody size="sm" weight="regular">
                    {t('home.no_recent_activity') || 'No recent activity'}
                  </PremiumBody>
                </View>
              </FadeInUp>
            )}
          </StaggeredContainer>
        </HolographicCard>
      </View>
    </FadeInUp>
  );
}

