/**
 * Playdate Match Card Component
 * Displays a single playmate match card
 */
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme';
import type { PlaydateMatch } from '../types';

interface PlaydateMatchCardProps {
  match: PlaydateMatch;
  onPress: () => void;
  onCreatePlaydate: (match: PlaydateMatch) => void;
}

export const PlaydateMatchCard: React.FC<PlaydateMatchCardProps> = ({
  match,
  onPress,
  onCreatePlaydate,
}) => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        matchCard: {
          padding: theme.spacing.md,
          borderRadius: theme.radii.lg,
          marginBottom: theme.spacing.md,
          backgroundColor: theme.colors.surface,
        },
        matchHeader: {
          flexDirection: 'row' as const,
          justifyContent: 'space-between' as const,
          alignItems: 'flex-start' as const,
          marginBottom: theme.spacing.md,
        },
        petInfo: {
          flex: 1,
        },
        petName: {
          fontSize: 18,
          fontWeight: '600' as const,
          marginBottom: theme.spacing.xs,
          color: theme.colors.onSurface,
        },
        petDetails: {
          fontSize: 14,
          color: theme.colors.onMuted,
        },
        matchScore: {
          alignItems: 'center' as const,
        },
        scoreText: {
          fontSize: 20,
          fontWeight: '700' as const,
          color: theme.colors.primary,
        },
        scoreLabel: {
          fontSize: 12,
          marginTop: 2,
          color: theme.colors.onMuted,
        },
        matchDetails: {
          marginBottom: theme.spacing.md,
        },
        playStyles: {
          fontSize: 14,
          marginBottom: theme.spacing.xs,
          color: theme.colors.onSurface,
        },
        energy: {
          fontSize: 14,
          marginBottom: theme.spacing.xs,
          color: theme.colors.onMuted,
        },
        distance: {
          fontSize: 14,
          color: theme.colors.onMuted,
        },
        matchActions: {
          flexDirection: 'row' as const,
          gap: theme.spacing.sm,
        },
        messageButton: {
          flex: 1,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radii.md,
          alignItems: 'center' as const,
          backgroundColor: theme.colors.primary,
        },
        messageButtonText: {
          fontSize: 14,
          fontWeight: '600' as const,
          color: theme.colors.onPrimary,
        },
        playdateButton: {
          flex: 1,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radii.md,
          alignItems: 'center' as const,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary,
        },
        playdateButtonText: {
          fontSize: 14,
          fontWeight: '600' as const,
          color: theme.colors.primary,
        },
      }),
    [theme],
  );

  return (
    <TouchableOpacity
      testID={`match-card-${match.id}`}
      accessibilityRole="button"
      accessibilityLabel={`Playmate match: ${match.pet2.name}, ${match.compatibilityScore}% compatible`}
      accessibilityHint="Double tap to view detailed compatibility information"
      style={styles.matchCard}
      onPress={onPress}
    >
      <View style={styles.matchHeader}>
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{match.pet2.name}</Text>
          <Text style={styles.petDetails}>
            {match.pet2.breed} • {match.pet2.age} months old
          </Text>
        </View>
        <View style={styles.matchScore}>
          <Text style={styles.scoreText}>{match.compatibilityScore}%</Text>
          <Text style={styles.scoreLabel}>Match</Text>
        </View>
      </View>

      <View style={styles.matchDetails}>
        <Text style={styles.playStyles}>
          🎾 {match.pet2.playStyle?.join(', ') || 'No play styles set'}
        </Text>
        <Text style={styles.energy}>⚡ Energy: {match.pet2.energy}/5</Text>
        <Text style={styles.distance}>📍 {match.distanceKm.toFixed(1)}km away</Text>
      </View>

      <View style={styles.matchActions}>
        <TouchableOpacity
          testID="message-button"
          accessibilityRole="button"
          accessibilityLabel="Send message to pet owner"
          accessibilityHint="Opens chat conversation with the pet owner"
          style={styles.messageButton}
          onPress={() => {/* Navigate to chat */}}
        >
          <Text style={styles.messageButtonText}>💬 Message</Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="create-playdate-button"
          accessibilityRole="button"
          accessibilityLabel={`Create playdate with ${match.pet2.name}`}
          accessibilityHint="Opens playdate creation screen"
          style={styles.playdateButton}
          onPress={() => onCreatePlaydate(match)}
        >
          <Text style={styles.playdateButtonText}>🐾 Playdate</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

