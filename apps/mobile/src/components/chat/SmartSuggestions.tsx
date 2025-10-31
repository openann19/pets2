/**
 * Smart Suggestions Component
 * Displays AI-powered chat suggestions
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@mobile/theme';
import { Ionicons } from '@expo/vector-icons';
import { smartChatSuggestionsService } from '../../services/smartChatSuggestionsService';
import type { SmartChatSuggestion } from '@pawfectmatch/core/types/pet-chat';

interface SmartSuggestionsProps {
  matchId: string;
  onSelectSuggestion: (suggestion: SmartChatSuggestion) => void;
  compatibilityScore?: number;
  petBreed?: string;
  petSpecies?: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  matchId,
  onSelectSuggestion,
  compatibilityScore,
  petBreed,
  petSpecies,
}) => {
  const theme = useTheme();
  const [suggestions, setSuggestions] = useState<SmartChatSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, [matchId, compatibilityScore]);

  const loadSuggestions = async () => {
    try {
      setIsLoading(true);
      const allSuggestions: SmartChatSuggestion[] = [];

      // Get general smart suggestions
      const general = await smartChatSuggestionsService.getSmartSuggestions(matchId, {
        conversationStage: 'initial',
      });
      allSuggestions.push(...general);

      // Get pet care advice if breed info available
      if (petBreed && petSpecies) {
        const careAdvice = await smartChatSuggestionsService.getPetCareAdvice(
          matchId,
          petBreed,
          petSpecies,
        );
        allSuggestions.push(...careAdvice);
      }

      // Get conversation starters if compatibility score available
      if (compatibilityScore !== undefined) {
        const starters = await smartChatSuggestionsService.getConversationStarters(
          matchId,
          compatibilityScore,
        );
        allSuggestions.push(...starters);
      }

      // Sort by confidence and take top 5
      const sorted = allSuggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);

      setSuggestions(sorted);
    } catch (error) {
      console.error('Failed to load suggestions', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'pet_care_advice':
        return 'bulb-outline';
      case 'local_service':
        return 'location-outline';
      case 'compatibility_question':
        return 'chatbubbles-outline';
      case 'translation':
        return 'language-outline';
      case 'conversation_starter':
        return 'sparkles-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'pet_care_advice':
        return theme.colors.info;
      case 'local_service':
        return theme.colors.primary;
      case 'compatibility_question':
        return theme.colors.success;
      case 'translation':
        return theme.colors.warning;
      case 'conversation_starter':
        return theme.colors.primary;
      default:
        return theme.colors.onMuted;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.loadingText, { color: theme.colors.onMuted }]}>
          Loading suggestions...
        </Text>
      </View>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={16} color={theme.colors.primary} />
        <Text style={[styles.headerText, { color: theme.colors.onSurface }]}>
          Smart Suggestions
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsList}
      >
        {suggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.suggestionCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => onSelectSuggestion(suggestion)}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${getSuggestionColor(suggestion.type)}20`,
                },
              ]}
            >
              <Ionicons
                name={getSuggestionIcon(suggestion.type) as any}
                size={20}
                color={getSuggestionColor(suggestion.type)}
              />
            </View>
            <Text
              style={[styles.suggestionTitle, { color: theme.colors.onSurface }]}
              numberOfLines={1}
            >
              {suggestion.title}
            </Text>
            <Text
              style={[styles.suggestionMessage, { color: theme.colors.onMuted }]}
              numberOfLines={2}
            >
              {suggestion.message}
            </Text>
            {suggestion.confidence > 0.7 && (
              <View style={styles.confidenceBadge}>
                <Ionicons name="star" size={10} color={theme.colors.warning} />
                <Text style={[styles.confidenceText, { color: theme.colors.onMuted }]}>
                  High match
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
    padding: 16,
  },
  suggestionsList: {
    gap: 12,
  },
  suggestionCard: {
    width: 200,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionMessage: {
    fontSize: 12,
    lineHeight: 16,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

