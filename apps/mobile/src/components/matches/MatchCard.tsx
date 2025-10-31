import { Ionicons } from '@expo/vector-icons';
import { logger } from '@pawfectmatch/core';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import * as Haptics from 'expo-haptics';
import type { Match } from '../../hooks/useMatchesData';
import { OptimizedImage } from '../OptimizedImage';
import { Interactive } from '../primitives/Interactive';

interface MatchCardProps {
  match: Match;
  onPress?: () => void;
  onUnmatch?: (matchId: string, petName: string) => Promise<void>;
  onArchive?: (matchId: string, petName: string) => Promise<void>;
  onReport?: (matchId: string, petName: string) => void;
}

function MatchCardBase({
  match,
  onPress,
  onUnmatch,
  onArchive,
  onReport,
}: MatchCardProps): React.JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- useTheme is properly typed to return AppTheme, throws if Provider missing
  const theme: AppTheme = useTheme();
  const styles = makeStyles(theme);

  const handlePress = () => {
    void Haptics.selectionAsync();
    onPress?.();
  };

  const handleUnmatch = async () => {
    try {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      await onUnmatch?.(match._id, match.petName);
    } catch (error) {
      logger.error('Error unmatching:', { error });
    }
  };

  const handleArchive = async () => {
    try {
      void Haptics.selectionAsync();
      await onArchive?.(match._id, match.petName);
    } catch (error) {
      logger.error('Error archiving:', { error });
    }
  };

  const handleReport = () => {
    Alert.alert('Report Match', `Report this match with ${match.petName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: () => {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          onReport?.(match._id, match.petName);
        },
      },
    ]);
  };

  // Use simplified match data
  const petPhoto = match.petPhoto || '';
  const lastMessage = match.lastMessage;

  return (
    <Interactive
      variant="lift"
      haptic="light"
      onPress={handlePress}
    >
      <View>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={1}
          accessibilityLabel={`View match with ${match.petName}`}
        >
          <LinearGradient
            colors={[...theme.palette.gradients.warning, ...theme.palette.gradients.primary]}
            style={styles.gradient}
          >
            <OptimizedImage
              uri={petPhoto}
              style={styles.photo}
              containerStyle={{}}
              accessibilityLabel={`${match.petName} photo`}
              priority="normal"
              onLoadStart={() => {}}
              onLoadEnd={() => {}}
              onError={() => {}}
            />
            <View style={styles.info}>
              <Text style={styles.name}>{match.petName}</Text>
              <Text style={styles.meta}>
                {match.petBreed}, {match.petAge} years old
              </Text>
              <Text style={styles.owner}>Owner information</Text>
              {lastMessage ? (
                <Text
                  style={styles.lastMessage}
                  numberOfLines={1}
                >
                  {lastMessage.content}
                </Text>
              ) : null}
              <Text style={styles.matchedAt}>
                Matched {new Date(match.matchedAt).toLocaleDateString()}
              </Text>
            </View>
            {(onUnmatch || onArchive || onReport) && (
              <View style={styles.actions}>
                {onReport && (
                  <TouchableOpacity
                    style={StyleSheet.flatten([styles.actionButton, styles.reportButton])}
                    onPress={handleReport}
                    accessibilityLabel="Report match"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="flag-outline"
                      size={20}
                      color={theme.colors.warning}
                    />
                  </TouchableOpacity>
                )}
                {onArchive && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleArchive}
                    accessibilityLabel="Archive match"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="archive-outline"
                      size={20}
                      color={theme.colors.primary}
                    />
                  </TouchableOpacity>
                )}
                {onUnmatch && (
                  <TouchableOpacity
                    style={StyleSheet.flatten([styles.actionButton, styles.unmatchButton])}
                    onPress={handleUnmatch}
                    accessibilityLabel="Unmatch"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={20}
                      color={theme.colors.danger}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Interactive>
  );
}

function makeStyles(theme: AppTheme) {
  // Helper for rgba with opacity
  const alpha = (color: string, opacity: number) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return StyleSheet.create({
    card: {
      borderRadius: theme.radii.xl,
      margin: theme.spacing.sm,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    gradient: {
      borderRadius: theme.radii.xl,
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    photo: {
      width: 80,
      height: 80,
      borderRadius: theme.radii.lg,
      backgroundColor: theme.colors.surface,
      marginEnd: theme.spacing.md,
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onSurface,
    },
    meta: {
      fontSize: theme.typography.body.size * 0.9375,
      color: theme.colors.onSurface,
      marginVertical: theme.spacing.xs / 2,
    },
    owner: {
      fontSize: theme.typography.body.size * 0.875,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs / 2,
    },
    lastMessage: {
      fontSize: theme.typography.body.size * 0.8125,
      color: theme.colors.onMuted,
      marginBottom: theme.spacing.xs / 2,
    },
    matchedAt: {
      fontSize: theme.typography.body.size * 0.75,
      color: theme.colors.onSurface,
      marginTop: theme.spacing.xs,
    },
    actions: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginStart: theme.spacing.sm,
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: theme.radii.full,
      backgroundColor: alpha(theme.colors.surface, 0.2),
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: theme.spacing.xs,
    },
    unmatchButton: {
      backgroundColor: alpha(theme.colors.danger, 0.1),
    },
    reportButton: {
      backgroundColor: alpha(theme.colors.warning, 0.1),
    },
  });
}

export const MatchCard = memo(MatchCardBase);
MatchCard.displayName = 'MatchCard';
