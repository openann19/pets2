/**
 * Bio Results Component
 * Production-hardened component for displaying AI-generated pet bios
 * Features: Rich display, copy functionality, save options, match scoring
 */

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";

import { Theme } from "../../theme/unified-theme";
import { GeneratedBio } from "../../hooks/useAIBio";

interface BioResultsProps {
  generatedBio: GeneratedBio;
  onSave?: (bio: GeneratedBio) => void;
  onRegenerate?: () => void;
}

export function BioResults({
  generatedBio,
  onSave,
  onRegenerate,
}: BioResultsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(generatedBio.bio);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      Alert.alert("Error", "Failed to copy bio to clipboard");
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(generatedBio);
      Alert.alert("Success", "Bio saved to history!");
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return Theme.colors.status.success;
    if (score >= 0.4) return Theme.colors.status.warning;
    return Theme.colors.status.error;
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return Theme.colors.status.success;
    if (score >= 60) return Theme.colors.status.warning;
    return Theme.colors.status.error;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Generated Bio</Text>

      {/* Bio Content */}
      <View style={styles.bioCard}>
        <ScrollView
          style={styles.bioScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.bioText}>{generatedBio.bio}</Text>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCopy}
            accessibilityLabel="Copy bio to clipboard"
          >
            <Ionicons
              name={copied ? "checkmark-circle" : "copy-outline"}
              size={20}
              color={copied ? Theme.colors.status.success : Theme.colors.text.primary}
            />
            <Text
              style={[
                styles.actionText,
                copied && { color: Theme.colors.status.success },
              ]}
            >
              {copied ? "Copied!" : "Copy"}
            </Text>
          </TouchableOpacity>

          {onSave && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSave}
              accessibilityLabel="Save bio to history"
            >
              <Ionicons
                name="bookmark-outline"
                size={20}
                color={Theme.colors.text.primary}
              />
              <Text style={styles.actionText}>Save</Text>
            </TouchableOpacity>
          )}

          {onRegenerate && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onRegenerate}
              accessibilityLabel="Generate new bio"
            >
              <Ionicons
                name="refresh-outline"
                size={20}
                color={Theme.colors.text.primary}
              />
              <Text style={styles.actionText}>Regenerate</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Analysis Section */}
      <View style={styles.analysisContainer}>
        <Text style={styles.analysisTitle}>Bio Analysis</Text>

        <View style={styles.metricsGrid}>
          {/* Match Score */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Match Score</Text>
            <Text
              style={[
                styles.metricValue,
                { color: getMatchScoreColor(generatedBio.matchScore) },
              ]}
            >
              {generatedBio.matchScore}/100
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${generatedBio.matchScore}%`,
                    backgroundColor: getMatchScoreColor(
                      generatedBio.matchScore,
                    ),
                  },
                ]}
              />
            </View>
          </View>

          {/* Sentiment Score */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Sentiment</Text>
            <Text
              style={[
                styles.metricValue,
                { color: getSentimentColor(generatedBio.sentiment.score) },
              ]}
            >
              {generatedBio.sentiment.label}
            </Text>
            <Text style={styles.metricSubtext}>
              Score: {(generatedBio.sentiment.score * 100).toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Keywords */}
        {generatedBio.keywords.length > 0 && (
          <View style={styles.keywordsSection}>
            <Text style={styles.keywordsTitle}>Key Traits</Text>
            <View style={styles.keywordsContainer}>
              {generatedBio.keywords.map((keyword, index) => (
                <View key={index} style={styles.keywordChip}>
                  <Text style={styles.keywordText}>{keyword}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
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
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xl,
  },
  bioCard: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    shadowColor: Theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bioScroll: {
    maxHeight: 200,
  },
  bioText: {
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.text.primary,
    lineHeight: Theme.typography.lineHeight.relaxed,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
  },
  actionText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.primary,
    marginLeft: Theme.spacing.xs,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  analysisContainer: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
  },
  analysisTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.lg,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    alignItems: "center",
  },
  metricLabel: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
  },
  metricValue: {
    fontSize: Theme.typography.fontSize["2xl"],
    fontWeight: Theme.typography.fontWeight.bold,
    marginBottom: Theme.spacing.xs,
  },
  metricSubtext: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.text.secondary,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: Theme.borderRadius.full,
  },
  keywordsSection: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingTop: Theme.spacing.lg,
  },
  keywordsTitle: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  keywordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Theme.spacing.sm,
  },
  keywordChip: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
  },
  keywordText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.background.primary,
    fontWeight: Theme.typography.fontWeight.medium,
  },
});
