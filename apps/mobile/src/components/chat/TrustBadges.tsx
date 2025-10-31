/**
 * Trust Badges Component
 * Display verification status in chat profiles
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@mobile/theme';
import { Ionicons } from '@expo/vector-icons';
import type { TrustBadge } from '@pawfectmatch/core/types/pet-chat';

interface TrustBadgesProps {
  badges: TrustBadge[];
  compact?: boolean;
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({ badges, compact = false }) => {
  const theme = useTheme();

  const badgeConfig = {
    verified_owner: {
      icon: 'shield-checkmark',
      color: theme.colors.success,
      name: 'Verified Owner',
    },
    background_verified: {
      icon: 'checkmark-circle',
      color: theme.colors.info,
      name: 'Background Verified',
    },
    community_vouched: {
      icon: 'people',
      color: theme.colors.primary,
      name: 'Community Vouched',
    },
    premium_member: {
      icon: 'star',
      color: theme.colors.warning,
      name: 'Premium Member',
    },
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {badges.map((badge, index) => {
          const config = badgeConfig[badge.type];
          if (!config) return null;
          return (
            <View
              key={index}
              style={[
                styles.compactBadge,
                {
                  backgroundColor: `${config.color}20`,
                  borderColor: config.color,
                },
              ]}
            >
              <Ionicons name={config.icon as any} size={12} color={config.color} />
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {badges.map((badge, index) => {
        const config = badgeConfig[badge.type];
        if (!config) return null;
        return (
          <View
            key={index}
            style={[
              styles.badge,
              {
                backgroundColor: `${config.color}20`,
                borderColor: config.color,
              },
            ]}
          >
            <Ionicons name={config.icon as any} size={16} color={config.color} />
            <Text style={[styles.badgeText, { color: config.color }]}>
              {config.name}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  compactContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  compactBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

