/**
 * Tone Selector Component
 * Production-hardened component for selecting AI bio generation tone
 * Features: Visual selection, accessibility, responsive design
 */

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

import { TONE_OPTIONS } from '../../hooks/useAIBio';

interface ToneSelectorProps {
  selectedTone: string;
  onToneSelect: (toneId: string) => void;
}

interface ToneOption {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
}

const TONE_DETAILS: ToneOption[] = TONE_OPTIONS.map((tone) => ({
  ...tone,
  description: getToneDescription(tone.id),
}));

function getToneDescription(toneId: string): string {
  switch (toneId) {
    case 'playful':
      return 'Fun and energetic personality';
    case 'professional':
      return 'Polite and well-mannered';
    case 'casual':
      return 'Relaxed and friendly';
    case 'romantic':
      return 'Sweet and affectionate';
    case 'mysterious':
      return 'Intriguing and enigmatic';
    default:
      return 'Unique personality';
  }
}

export function ToneSelector({ selectedTone, onToneSelect }: ToneSelectorProps) {
  const theme = useTheme();
  const styles = makeStyles(theme);
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Bio Tone</Text>
      <Text style={styles.sectionSubtitle}>Choose the personality for your pet's bio</Text>

      <View style={styles.grid}>
        {TONE_DETAILS.map((tone) => (
          <TouchableOpacity
            key={tone.id}
            style={[
              styles.toneCard,
              selectedTone === tone.id ? styles.selectedCard : undefined,
              {
                borderColor: selectedTone === tone.id ? tone.color : theme.colors.border,
              },
            ]}
            onPress={() => {
              onToneSelect(tone.id);
            }}
            accessibilityLabel={`Select ${tone.label} tone`}
            accessibilityState={{ selected: selectedTone === tone.id }}
          >
            <View
              style={StyleSheet.flatten([styles.iconContainer, { backgroundColor: tone.color }])}
            >
              <Text style={styles.icon}>{tone.icon}</Text>
            </View>

            <Text style={styles.toneLabel}>{tone.label}</Text>
            <Text style={styles.toneDescription}>{tone.description}</Text>

            {selectedTone === tone.id && (
              <View
                style={StyleSheet.flatten([
                  styles.selectedIndicator,
                  { backgroundColor: tone.color },
                ])}
              >
                <Text style={styles.checkmark}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      padding: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    sectionSubtitle: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
      marginBottom: theme.spacing.xl,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    toneCard: {
      flex: 1,
      minWidth: 140,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      borderWidth: 2,
      padding: theme.spacing.md,
      alignItems: 'center',
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    selectedCard: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: theme.radii.full,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    icon: {
      fontSize: theme.typography.h2.size,
    },
    toneLabel: {
      fontSize: theme.typography.body.size,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
      textAlign: 'center',
    },
    toneDescription: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
      textAlign: 'center',
    },
    selectedIndicator: {
      position: 'absolute',
      top: -8,
      right: -8,
      width: 24,
      height: 24,
      borderRadius: theme.radii.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkmark: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size,
      fontWeight: '700',
    },
  });
}
