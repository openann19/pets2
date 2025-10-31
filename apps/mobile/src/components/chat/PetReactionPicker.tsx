/**
 * Pet Reaction Emoji Picker
 * Custom pet-themed reactions: 🐕❤️, 🐱😺, 🐾, etc.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import type { PetReaction } from '@pawfectmatch/core/types/pet-chat';

interface PetReactionPickerProps {
  onSelectReaction: (reaction: PetReaction) => void;
  onClose: () => void;
}

const PET_REACTIONS: PetReaction[] = [
  // Pet Emojis
  { emoji: '🐕', name: 'Dog', category: 'pet_emoji' },
  { emoji: '🐱', name: 'Cat', category: 'pet_emoji' },
  { emoji: '🐶', name: 'Dog Face', category: 'pet_emoji' },
  { emoji: '🐾', name: 'Paw Prints', category: 'pet_emoji' },
  { emoji: '🐈', name: 'Cat Face', category: 'pet_emoji' },
  { emoji: '🐇', name: 'Rabbit', category: 'pet_emoji' },
  { emoji: '🐦', name: 'Bird', category: 'pet_emoji' },
  { emoji: '🐹', name: 'Hamster', category: 'pet_emoji' },
  
  // Love & Care
  { emoji: '🐕❤️', name: 'Dog Love', category: 'love' },
  { emoji: '🐱❤️', name: 'Cat Love', category: 'love' },
  { emoji: '🐾❤️', name: 'Paw Love', category: 'love' },
  { emoji: '💚', name: 'Green Heart', category: 'love' },
  { emoji: '💙', name: 'Blue Heart', category: 'love' },
  { emoji: '🧡', name: 'Orange Heart', category: 'love' },
  
  // Playful
  { emoji: '🐕😺', name: 'Happy Dog', category: 'playful' },
  { emoji: '🐱😺', name: 'Happy Cat', category: 'playful' },
  { emoji: '🎾', name: 'Tennis Ball', category: 'playful' },
  { emoji: '🎈', name: 'Balloon', category: 'playful' },
  { emoji: '🎉', name: 'Party', category: 'playful' },
  { emoji: '✨', name: 'Sparkles', category: 'playful' },
  
  // Care
  { emoji: '🏥', name: 'Vet', category: 'care' },
  { emoji: '💊', name: 'Medicine', category: 'care' },
  { emoji: '🩺', name: 'Health Check', category: 'care' },
  { emoji: '🥕', name: 'Carrot', category: 'care' },
  { emoji: '🍖', name: 'Food', category: 'care' },
  { emoji: '💤', name: 'Sleep', category: 'care' },
  
  // Custom Combinations
  { emoji: '🐕🐱', name: 'Dog & Cat', category: 'custom' },
  { emoji: '🐾🎉', name: 'Paw Party', category: 'custom' },
  { emoji: '🐕💚', name: 'Dog Heart', category: 'custom' },
  { emoji: '🐱💙', name: 'Cat Heart', category: 'custom' },
];

export const PetReactionPicker: React.FC<PetReactionPickerProps> = ({
  onSelectReaction,
  onClose,
}) => {
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('pet_emoji');

  const categories = Array.from(new Set(PET_REACTIONS.map((r) => r.category)));
  const filteredReactions = PET_REACTIONS.filter(
    (r) => r.category === selectedCategory,
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Pet Reactions
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryTab,
              {
                backgroundColor:
                  selectedCategory === category
                    ? theme.colors.primary
                    : theme.colors.surface,
                borderColor:
                  selectedCategory === category
                    ? theme.colors.primary
                    : theme.colors.border,
              },
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryTabText,
                {
                  color:
                    selectedCategory === category
                      ? theme.colors.onPrimary
                      : theme.colors.onSurface,
                },
              ]}
            >
              {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Reactions Grid */}
      <ScrollView
        style={styles.reactionsContainer}
        contentContainerStyle={styles.reactionsGrid}
      >
        {filteredReactions.map((reaction, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.reactionItem,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => {
              onSelectReaction(reaction);
              onClose();
            }}
          >
            <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
            <Text style={[styles.reactionName, { color: theme.colors.onSurface }]}>
              {reaction.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  categoriesContainer: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reactionsContainer: {
    flex: 1,
  },
  reactionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  reactionItem: {
    width: 80,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  reactionEmoji: {
    fontSize: 32,
  },
  reactionName: {
    fontSize: 11,
    textAlign: 'center',
  },
});

