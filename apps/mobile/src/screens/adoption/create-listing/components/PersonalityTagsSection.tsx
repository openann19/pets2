/**
 * Personality Tags Section Component
 */

import { BlurView } from 'expo-blur';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

interface PersonalityTagsSectionProps {
  personalityTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
}

const PERSONALITY_OPTIONS = [
  'Friendly',
  'Playful',
  'Calm',
  'Energetic',
  'Shy',
  'Confident',
  'Good with kids',
  'Good with other pets',
  'Independent',
  'Affectionate',
];

export const PersonalityTagsSection: React.FC<PersonalityTagsSectionProps> = ({
  selectedTags,
  onToggleTag,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Personality</Text>
      <BlurView intensity={20} style={[styles.sectionCard, { borderRadius: theme.radii.md }]}>
        <Text style={[styles.sectionSubtitle, { color: colors.onMuted }]}>
          Select traits that describe your pet
        </Text>
        <View style={styles.tagsContainer}>
          {PERSONALITY_OPTIONS.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tag,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                  isSelected && [
                    styles.tagActive,
                    { backgroundColor: colors.primary, borderColor: colors.primary },
                  ],
                ]}
                onPress={() => onToggleTag(tag)}
                testID={`personality-tag-${tag}`}
                accessibilityLabel={tag}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: isSelected ? colors.onPrimary : colors.onMuted },
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    section: {
      padding: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.body.size * 1.125,
      fontWeight: theme.typography.h1.weight,
      marginBottom: theme.spacing.sm,
    },
    sectionSubtitle: {
      fontSize: theme.typography.body.size * 0.875,
      marginBottom: theme.spacing.md,
    },
    sectionCard: {
      overflow: 'hidden',
      padding: theme.spacing.md,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    tag: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.lg,
      borderWidth: 1,
    },
    tagActive: {
      borderWidth: 1,
    },
    tagText: {
      fontSize: 14,
      fontWeight: '500',
    },
  });
}

