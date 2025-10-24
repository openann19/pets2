import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import type { PetProfile } from '../../data/pets';
import { Card } from './Card';
import { Spacer } from './Spacer';
import { Text } from './Text';

interface PetCardProps {
  pet: PetProfile;
}

export function PetCard({ pet }: PetCardProps): React.ReactElement {
  const { colors, radii, spacing } = useTheme();

  return (
    <Card style={styles.card} shadow="medium">
      <Image
        source={{ uri: pet.photo }}
        accessibilityLabel={`${pet.name}, ${pet.breed}`}
        resizeMode="cover"
        style={[styles.image, { borderRadius: radii.md }]}
      />
      <Spacer size="md" />
      <View style={styles.headerRow}>
        <Text variant="heading3">{pet.name}</Text>
        <Text variant="callout" tone="textMuted">
          {pet.distance}
        </Text>
      </View>
      <Text variant="subtitle" tone="textMuted">
        {pet.breed}
      </Text>
      <Spacer size="sm" />
      <View style={[styles.tagRow, { gap: spacing.xs }]}> 
        {pet.personality.map((trait) => (
          <View
            key={trait}
            style={[styles.tag, { backgroundColor: colors.surfaceMuted, borderRadius: radii.sm }]}
          >
            <Text variant="caption" tone="primary">
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
