import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/useTheme';
import type { PetProfile } from '../../data/pets';
import { Card } from './Card';
import { Spacer } from './Spacer';
import { Text } from './Text';
import { prefetchImage, getDominantColor } from '../../utils/imageLoader';
import { durations, motionEasing } from '@/foundation/motion';

const AnimatedImage = Animated.createAnimatedComponent(Image);

interface PetCardProps {
  pet: PetProfile;
}

export function PetCard({ pet }: PetCardProps): React.ReactElement {
  const { colors, radii, spacing } = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);
  const opacity = useSharedValue(0);
  const dominantColor = getDominantColor(pet.photo);

  // Prefetch image on mount
  useEffect(() => {
    prefetchImage(pet.photo, { priority: 'normal' }).catch(() => {
      // Silently fail prefetch
    });
  }, [pet.photo]);

  // Animate fade-in when image loads
  useEffect(() => {
    if (imageLoaded) {
      opacity.value = withTiming(1, {
        duration: durations.md,
        easing: motionEasing.enter,
      });
    }
  }, [imageLoaded, opacity]);

  const animatedImageStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Card
      style={styles.card}
      shadow="medium"
    >
      <View
        style={[styles.imageContainer, { borderRadius: radii.md, backgroundColor: dominantColor }]}
      >
        {/* Dominant color placeholder */}
        <View
          style={[styles.placeholder, { backgroundColor: dominantColor, borderRadius: radii.md }]}
        />
        {/* Fade-in image */}
        <AnimatedImage
          source={{ uri: pet.photo }}
          accessibilityLabel={`${pet.name}, ${pet.breed}`}
          resizeMode="cover"
          style={[styles.image, { borderRadius: radii.md }, animatedImageStyle]}
          onLoad={() => setImageLoaded(true)}
        />
      </View>
      <Spacer size="md" />
      <View style={styles.headerRow}>
        <Text variant="heading3">{pet.name}</Text>
        <Text
          variant="callout"
          tone="textMuted"
        >
          {pet.distance}
        </Text>
      </View>
      <Text
        variant="subtitle"
        tone="textMuted"
      >
        {pet.breed}
      </Text>
      <Spacer size="sm" />
      <View style={[styles.tagRow, { gap: spacing.xs }]}>
        {pet.personality.map((trait) => (
          <View
            key={trait}
            style={[styles.tag, { backgroundColor: colors.surfaceMuted, borderRadius: radii.sm }]}
          >
            <Text
              variant="caption"
              tone="primary"
            >
              {trait}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  imageContainer: {
    height: 200,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  image: {
    height: 200,
    width: '100%',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
