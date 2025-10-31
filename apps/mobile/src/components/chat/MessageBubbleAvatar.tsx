/**
 * MessageBubbleAvatar Component
 * Displays pet avatar with mood-based emoji
 */

import { useTheme } from '@mobile/theme';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MessageBubbleAvatarProps {
  isOwnMessage: boolean;
  showAvatars?: boolean;
  petInfo?: {
    name: string;
    species: string;
    mood?: 'happy' | 'excited' | 'curious' | 'sleepy' | 'playful';
  };
}

export function MessageBubbleAvatar({
  isOwnMessage,
  showAvatars = false,
  petInfo,
}: MessageBubbleAvatarProps): React.JSX.Element | null {
  const theme = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        avatarContainer: {
          position: 'absolute',
          bottom: -16,
        },
        ownAvatar: {
          right: -16,
        },
        otherAvatar: {
          left: -16,
        },
        avatarEmoji: {
          fontSize: 16,
          textAlign: 'center',
          lineHeight: 28,
        },
        avatarName: {
          fontSize: 10,
          fontWeight: '500',
        },
        avatarNameLight: {
          color: theme.colors.onSurface,
        },
        avatarNameDark: {
          color: theme.colors.bg,
        },
      }),
    [theme],
  );

  const getPetAvatar = () => {
    if (!showAvatars || !petInfo) return null;

    const { species, mood = 'happy' } = petInfo;
    const speciesEmojis = {
      dog: {
        happy: '🐕',
        excited: '🐕‍🦺',
        curious: '🐕',
        sleepy: '😴',
        playful: '🐕',
      },
      cat: {
        happy: '🐱',
        excited: '🐱',
        curious: '🐱',
        sleepy: '😴',
        playful: '🐱',
      },
      bird: {
        happy: '🐦',
        excited: '🐦',
        curious: '🐦',
        sleepy: '😴',
        playful: '🐦',
      },
      rabbit: {
        happy: '🐰',
        excited: '🐰',
        curious: '🐰',
        sleepy: '😴',
        playful: '🐰',
      },
      other: {
        happy: '🐾',
        excited: '🐾',
        curious: '🐾',
        sleepy: '😴',
        playful: '🐾',
      },
    };

    const emojiSet = speciesEmojis[species as keyof typeof speciesEmojis] || speciesEmojis.other;
    return emojiSet[mood];
  };

  const avatarEmoji = getPetAvatar();

  if (!avatarEmoji) return null;

  return (
    <View
      style={StyleSheet.flatten([
        styles.avatarContainer,
        isOwnMessage ? styles.ownAvatar : styles.otherAvatar,
      ])}
    >
      <Text style={styles.avatarEmoji}>{avatarEmoji}</Text>
      {petInfo ? (
        <Text
          style={StyleSheet.flatten([
            styles.avatarName,
            theme.isDark ? styles.avatarNameDark : styles.avatarNameLight,
          ])}
        >
          {petInfo.name}
        </Text>
      ) : null}
    </View>
  );
}

