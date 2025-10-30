/**
 * Reaction Picker Component
 * Displays emoji reactions for messages
 */

import { useTheme } from '@mobile/theme';
import { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ListRenderItem,
} from 'react-native';

export interface Reaction {
  emoji: string;
  label: string;
}

const REACTIONS: Reaction[] = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '🎉', label: 'Party' },
  { emoji: '👍', label: 'Like' },
  { emoji: '👏', label: 'Clap' },
];

interface ReactionPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (reaction: string) => void;
  position?: { x: number; y: number };
}

export function ReactionPicker({
  visible,
  onClose,
  onSelect,
  position,
}: ReactionPickerProps): JSX.Element {
  const { colors } = useTheme();
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);

  const handleSelect = (reaction: string): void => {
    setSelectedReaction(reaction);
    onSelect(reaction);
    // Auto close after selection
    setTimeout(() => {
      onClose();
      setSelectedReaction(null);
    }, 300);
  };

  const renderReaction: ListRenderItem<Reaction> = ({ item }) => (
    <TouchableOpacity
      style={StyleSheet.flatten([
        styles.reactionButton,
        selectedReaction === item.emoji && styles.selectedReaction,
      ])}
      onPress={() => {
        handleSelect(item.emoji);
      }}
      accessibilityLabel={`React with ${item.label}`}
      accessibilityRole="button"
    >
      <Text style={styles.emoji}>{item.emoji}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={StyleSheet.flatten([
            styles.container,
            position && {
              position: 'absolute',
              top: position.y,
              left: position.x,
            },
          ])}
        >
          <FlatList
            data={REACTIONS}
            renderItem={renderReaction}
            keyExtractor={(item) => item.emoji}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reactionsList}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 5,
    shadowColor: '#0a0a0a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  reactionsList: {
    paddingHorizontal: 5,
    gap: 5,
  },
  reactionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  selectedReaction: {
    backgroundColor: '#e3f2fd',
    transform: [{ scale: 1.1 }],
  },
  emoji: {
    fontSize: 24,
  },
});
