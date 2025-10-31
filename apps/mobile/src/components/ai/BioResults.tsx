/**
 * Bio Results Component
 * Production-hardened component for displaying AI-generated pet bios
 * Features: Rich display, copy functionality, save options, match scoring
 */

import { useState, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { GeneratedBio } from '../../hooks/useAIBio';

interface BioResultsProps {
  generatedBio: GeneratedBio;
  onSave?: (bio: GeneratedBio) => void;
  onRegenerate?: () => void;
}

export function BioResults({ generatedBio, onSave, onRegenerate }: BioResultsProps) {
  const theme: AppTheme = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(generatedBio.bio);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy bio to clipboard');
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(generatedBio);
      Alert.alert('Success', 'Bio saved to history!');
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return theme.colors.success;
    if (score >= 0.4) return theme.colors.warning;
    return theme.colors.danger;
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.warning;
    return theme.colors.danger;
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          padding: theme.spacing.lg,
        },
        sectionTitle: {
          fontSize: theme.typography.h2.size,
          fontWeight: theme.typography.h2.weight,
          color: theme.colors.onSurface,
          marginBottom: theme.spacing.xl,
        },
        bioCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.lg,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.xl,
          shadowColor: theme.colors.border,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        },
        bioScroll: {
          maxHeight: 200,
        },
        bioText: {
          fontSize: theme.typography.body.size,
          color: theme.colors.onSurface,
          lineHeight: theme.typography.body.lineHeight,
        },
        actionButtons: {
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginTop: theme.spacing.lg,
          paddingTop: theme.spacing.lg,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        },
        actionButton: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: theme.spacing.sm,
          borderRadius: theme.radii.md,
        },
        actionText: {
          fontSize: theme.typography.body.size * 0.875,
          color: theme.colors.onSurface,
          marginLeft: theme.spacing.xs,
          fontWeight: theme.typography.h2.weight,
        },
        analysisContainer: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.lg,
          padding: theme.spacing.lg,
        },
        analysisTitle: {
          fontSize: theme.typography.h2.size,
          fontWeight: theme.typography.h2.weight,
          color: theme.colors.onSurface,
          marginBottom: theme.spacing.lg,
        },
        metricsGrid: {
          flexDirection: 'row',
          gap: theme.spacing.lg,
          marginBottom: theme.spacing.xl,
        },
        metricCard: {
          flex: 1,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.md,
          padding: theme.spacing.md,
          alignItems: 'center',
        },
        metricLabel: {
          fontSize: theme.typography.body.size * 0.75,
          color: theme.colors.onMuted,
          marginBottom: theme.spacing.xs,
        },
        metricValue: {
          fontSize: theme.typography.h2.size,
          fontWeight: theme.typography.h1.weight,
          marginBottom: theme.spacing.xs,
        },
        metricSubtext: {
          fontSize: theme.typography.body.size * 0.75,
          color: theme.colors.onMuted,
        },
        progressBar: {
          width: '100%',
          height: 4,
          backgroundColor: theme.colors.border,
          borderRadius: theme.radii.full,
          overflow: 'hidden',
        },
        progressFill: {
          height: '100%',
          borderRadius: theme.radii.full,
        },
        keywordsSection: {
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingTop: theme.spacing.lg,
        },
        keywordsTitle: {
          fontSize: theme.typography.body.size,
          fontWeight: theme.typography.h2.weight,
          color: theme.colors.onSurface,
          marginBottom: theme.spacing.md,
        },
        keywordsContainer: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
        },
        keywordChip: {
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radii.full,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
        },
        keywordText: {
          fontSize: theme.typography.body.size * 0.75,
          color: theme.colors.bg,
          fontWeight: theme.typography.h2.weight,
        },
      }),
    [theme],
  );

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
              name={copied ? 'checkmark-circle' : 'copy-outline'}
              size={20}
              color={copied ? theme.colors.success : theme.colors.onSurface}
            />
            <Text
              style={StyleSheet.flatten([
                styles.actionText,
                copied && { color: theme.colors.success },
              ])}
            >
              {copied ? 'Copied!' : 'Copy'}
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
                color={theme.colors.onSurface}
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
                color={theme.colors.onSurface}
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
              style={StyleSheet.flatten([
                styles.metricValue,
                { color: getMatchScoreColor(generatedBio.matchScore) },
              ])}
            >
              {generatedBio.matchScore}/100
            </Text>
            <View style={styles.progressBar}>
              <View
                style={StyleSheet.flatten([
                  styles.progressFill,
                  {
                    width: `${generatedBio.matchScore}%`,
                    backgroundColor: getMatchScoreColor(generatedBio.matchScore),
                  },
                ])}
              />
            </View>
          </View>

          {/* Sentiment Score */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Sentiment</Text>
            <Text
              style={StyleSheet.flatten([
                styles.metricValue,
                { color: getSentimentColor(generatedBio.sentiment.score) },
              ])}
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
                <View
                  key={index}
                  style={styles.keywordChip}
                >
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
