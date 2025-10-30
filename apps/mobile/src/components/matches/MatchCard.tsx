import { Ionicons } from '@expo/vector-icons';
import { logger } from '@pawfectmatch/core';
import { LinearGradient } from 'expo-linear-gradient';
import { memo, useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@mobile/theme';
import * as Haptics from 'expo-haptics';
import type { Match } from '../../hooks/useMatchesData';
import OptimizedImage from '../OptimizedImage';

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
}: MatchCardProps): JSX.Element {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePress = () => {
    void Haptics.selectionAsync();
    onPress?.();
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { stiffness: 300, damping: 20 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { stiffness: 300, damping: 20 });
    opacity.value = withTiming(1, { duration: 100 });
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Use simplified match data
  const petPhoto = match.petPhoto || '';
  const lastMessage = match.lastMessage;

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.92}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel={`View match with ${match.petName}`}
      >
        <LinearGradient
          colors={['#fceabb', '#f8b500', 'Theme.colors.primary[500]', '#a21caf']}
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
                >
                  <Ionicons
                    name="flag-outline"
                    size={20}
                    color={colors.warning}
                  />
                </TouchableOpacity>
              )}
              {onArchive && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleArchive}
                  accessibilityLabel="Archive match"
                >
                  <Ionicons
                    name="archive-outline"
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              )}
              {onUnmatch && (
                <TouchableOpacity
                  style={StyleSheet.flatten([styles.actionButton, styles.unmatchButton])}
                  onPress={handleUnmatch}
                  accessibilityLabel="Unmatch"
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color={colors.danger}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = useMemo(
  () =>
    StyleSheet.create({
      card: {
        borderRadius: 24,
        margin: 12,
        shadowColor: colors.primary,
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
      },
      gradient: {
        borderRadius: 24,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
      },
      photo: {
        width: 80,
        height: 80,
        borderRadius: 16,
        backgroundColor: colors.bgElevated,
        marginRight: 16,
      },
      info: {
        flex: 1,
      },
      name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
      },
      meta: {
        fontSize: 15,
        color: colors.primary,
        marginVertical: 2,
      },
      owner: {
        fontSize: 14,
        color: colors.primary,
        marginBottom: 2,
      },
      lastMessage: {
        fontSize: 13,
        color: colors.textMuted,
        marginBottom: 2,
      },
      matchedAt: {
        fontSize: 12,
        color: colors.primary,
        marginTop: 4,
      },
      actions: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
      },
      actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 4,
      },
      unmatchButton: {
        backgroundColor: colors.danger + '1A', // Add alpha for background
      },
      reportButton: {
        backgroundColor: colors.warning + '1A', // Add alpha for background
      },
    }),
  [colors],
);

export const MatchCard = memo(MatchCardBase);
MatchCard.displayName = 'MatchCard';
