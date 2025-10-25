/**
 * Tone Selector Component
 * Production-hardened component for selecting AI bio generation tone
 * Features: Visual selection, accessibility, responsive design
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Theme } from "../../theme/unified-theme";
import { createShadowStyle, getBackgroundColor, getTextColor } from "../../theme/helpers";
import { TONE_OPTIONS } from "../../hooks/useAIBio";

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
    case "playful":
      return "Fun and energetic personality";
    case "professional":
      return "Polite and well-mannered";
    case "casual":
      return "Relaxed and friendly";
    case "romantic":
      return "Sweet and affectionate";
    case "mysterious":
      return "Intriguing and enigmatic";
    default:
      return "Unique personality";
  }
}

export function ToneSelector({
  selectedTone,
  onToneSelect,
}: ToneSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Bio Tone</Text>
      <Text style={styles.sectionSubtitle}>
        Choose the personality for your pet's bio
      </Text>

      <View style={styles.grid}>
        {TONE_DETAILS.map((tone) => (
          <TouchableOpacity
            key={tone.id}
            style={[
              styles.toneCard,
              selectedTone === tone.id && styles.selectedCard,
              {
                borderColor:
                  selectedTone === tone.id
                    ? tone.color
                    : Theme.colors.borderColor.light,
              },
            ]}
            onPress={() => {
              onToneSelect(tone.id);
            }}
            accessibilityLabel={`Select ${tone.label} tone`}
            accessibilityState={{ selected: selectedTone === tone.id }}
          >
            <View
              style={[styles.iconContainer, { backgroundColor: tone.color }]}
            >
              <Text style={styles.icon}>{tone.icon}</Text>
            </View>

            <Text style={styles.toneLabel}>{tone.label}</Text>
            <Text style={styles.toneDescription}>{tone.description}</Text>

            {selectedTone === tone.id && (
              <View
                style={[
                  styles.selectedIndicator,
                  { backgroundColor: tone.color },
                ]}
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

const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize["2xl"],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.textColor,
    marginBottom: Theme.spacing.sm,
  },
  sectionSubtitle: {
    fontSize: Theme.typography.fontSize.base,
    color: getTextColor(Theme, "secondary"),
    marginBottom: Theme.spacing.xl,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Theme.spacing.md,
  },
  toneCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: getBackgroundColor(Theme, 'primary'),
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    padding: Theme.spacing.md,
    alignItems: "center",
    ...createShadowStyle(Theme, 'sm'),
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
    borderRadius: Theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Theme.spacing.sm,
  },
  icon: {
    fontSize: Theme.typography.fontSize.xl,
  },
  toneLabel: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.textColor,
    marginBottom: Theme.spacing.xs,
    textAlign: "center",
  },
  toneDescription: {
    fontSize: Theme.typography.fontSize.sm,
    color: getTextColor(Theme, "secondary"),
    textAlign: "center",
    lineHeight: Theme.typography.lineHeight.normal,
  },
  selectedIndicator: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: Theme.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: Theme.colors.backgroundColor.primary,
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
  },
});
